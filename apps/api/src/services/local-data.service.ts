import { readFile, writeFile } from 'node:fs/promises';
import { isAbsolute, join } from 'node:path';
import { gunzipSync } from 'node:zlib';
import { transformBbox, type BBox } from '@portalgis/gis-core';

export type LocalGeometry = { type: string; coordinates: unknown };
export type LocalFeature = { type: 'Feature'; id?: string | number; geometry: LocalGeometry | null; properties: Record<string, unknown> };

export interface LocalLayerMeta {
  id: string;
  title: string;
  typeName: string;
  workspace: string;
  group: string;
  sourceWfs: string;
  sourceWms: string;
  featureCount: number;
  geometryType: string | null;
  crs: string;
  fields: string[];
  bbox: number[] | null;
  syncedAt: string;
  status: 'ok' | 'partial' | 'error';
  errors: string[];
  files: string[];
  indexFile: string | null;
  statsFile: string | null;
  wmsAvailable: boolean;
  wfsAvailable: boolean;
}

interface LocalCatalog {
  author: 'laugis';
  generatedAt: string;
  counts: Record<string, number>;
  layers: LocalLayerMeta[];
}

export interface LocalFilter { field: string; operator: 'contains' | 'equals'; value: string }

export const IRRIGATION_PROVINCIAL_LAYER_ID = 'local_irrigation_parcels_provincial';
export const IRRIGATION_PROVINCIAL_LAYER_NAME = 'Parcelas con derecho de riego - Provincial';

interface LocalFeatureCollection {
  type: 'FeatureCollection';
  features: LocalFeature[];
  numberMatched: number;
  numberReturned: number;
  partial: boolean;
  source: 'local-snapshot';
  syncedAt: string;
  crs: 'EPSG:4326';
  sourceLayers?: number;
}

interface LocalStatisticsResult {
  scope: 'global' | 'area';
  source: 'local-snapshot';
  status: 'ready' | 'empty';
  layerId: string;
  layerName: string;
  featureCount: number;
  rawFeatureCount: number;
  geometryAreaM2: number;
  categoryField: string;
  numericField: string | null;
  usedPropertyName: false;
  pageSize: null;
  maxFeatures: null;
  partial: boolean;
  syncedAt: string;
  updatedAt: string;
  groups: Array<{ category: string; count: number; sum: number; avg: number; bbox: number[] | null }>;
  warnings: string[];
  author: 'laugis';
  sourceLayers?: number;
}

const DATA_ROOT = isAbsolute(process.env.DATA_DIR ?? '') ? process.env.DATA_DIR! : join(process.cwd(), process.env.DATA_DIR ?? '../../data');
const featureCache = new Map<string, LocalFeature[]>();
const indexCache = new Map<string, Array<{ featureIndex: number; bbox: BBox | null }>>();
let catalogCache: LocalCatalog | null = null;

function trimCache<T>(cache: Map<string, T>, maxEntries = 8): void {
  // ponytail: process-local FIFO is enough for the demo; move to a tile store only if profiling requires it.
  while (cache.size > maxEntries) cache.delete(cache.keys().next().value as string);
}

function dataPath(path: string): string { return join(DATA_ROOT, path); }

function normalizeIrrigation(value: unknown): string | null {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const raw = String(value).trim();
  const valueKey = raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (['null', 's/d', 'sd', 's d', 'sin dato', 'sin datos'].includes(valueKey)) return null;
  if (/aguas? subterraneas?/.test(valueKey)) return 'Aguas Subterraneas';
  if (/cultivo clandestino/.test(valueKey)) return 'Cultivo clandestino';
  if (/definitiv[oa]/.test(valueKey)) return 'Definitivo';
  if (/desague/.test(valueKey)) return 'Desague';
  if (/eventual/.test(valueKey)) return 'Eventual';
  if (/privad[oa]/.test(valueKey)) return 'Privado';
  if (/sin derecho/.test(valueKey)) return 'Sin derecho';
  if (/sobrante/.test(valueKey)) return 'Sobrante';
  return raw;
}

export function irrigationCategory(properties: Record<string, unknown>): string {
  for (const field of ['Tipo_der_r', 'Concesion', 'tipo_der_r', 'concesion']) {
    const value = normalizeIrrigation(properties[field]);
    if (value) return value;
  }
  return 'Sin dato / NULL';
}

function geometryPoints(coordinates: unknown, output: number[][]): void {
  if (!Array.isArray(coordinates)) return;
  if (typeof coordinates[0] === 'number' && typeof coordinates[1] === 'number') { output.push([coordinates[0], coordinates[1]]); return; }
  for (const child of coordinates) geometryPoints(child, output);
}

export function featureBbox(feature: LocalFeature): BBox | null {
  if (!feature.geometry) return null;
  const points: number[][] = [];
  geometryPoints(feature.geometry.coordinates, points);
  if (!points.length) return null;
  let minX = Infinity; let minY = Infinity; let maxX = -Infinity; let maxY = -Infinity;
  for (const [x, y] of points) { minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); }
  return [minX, minY, maxX, maxY];
}

function bboxIntersects(a: number[], b: number[]): boolean { return a[0] <= b[2] && a[2] >= b[0] && a[1] <= b[3] && a[3] >= b[1]; }

function mergeBbox(current: number[] | null, bbox: number[] | null): number[] | null {
  if (!bbox) return current;
  return current ? [Math.min(current[0], bbox[0]), Math.min(current[1], bbox[1]), Math.max(current[2], bbox[2]), Math.max(current[3], bbox[3])] : [...bbox];
}

function pointInRing(point: number[], ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const [xi, yi] = ring[i]; const [xj, yj] = ring[j];
    if ((yi > point[1]) !== (yj > point[1]) && point[0] < ((xj - xi) * (point[1] - yi)) / (yj - yi || Number.EPSILON) + xi) inside = !inside;
  }
  return inside;
}

function polygons(geometry: LocalGeometry): number[][][][] {
  if (geometry.type === 'Polygon') return [geometry.coordinates as number[][][]];
  if (geometry.type === 'MultiPolygon') return geometry.coordinates as number[][][][];
  return [];
}

function pointInPolygon(point: number[], geometry: LocalGeometry): boolean {
  return polygons(geometry).some((rings) => Boolean(rings[0]) && pointInRing(point, rings[0]) && rings.slice(1).every((hole) => !pointInRing(point, hole)));
}

function segmentsIntersect(a: number[], b: number[], c: number[], d: number[]): boolean {
  const orient = (p: number[], q: number[], r: number[]) => Math.sign((q[1] - p[1]) * (r[0] - q[0]) - (q[0] - p[0]) * (r[1] - q[1]));
  return orient(a, b, c) !== orient(a, b, d) && orient(c, d, a) !== orient(c, d, b);
}

function polygonIntersects(a: LocalGeometry, b: LocalGeometry): boolean {
  const ap = polygons(a); const bp = polygons(b);
  if (ap.some((polygon) => polygon[0]?.some((point) => pointInPolygon(point, b)))) return true;
  if (bp.some((polygon) => polygon[0]?.some((point) => pointInPolygon(point, a)))) return true;
  return ap.some((pa) => bp.some((pb) => (pa[0] ?? []).slice(1).some((point, i) => (pb[0] ?? []).slice(1).some((other, j) => segmentsIntersect(pa[0][i], point, pb[0][j], other)))));
}

export function geometriesIntersect(a: LocalGeometry, b: LocalGeometry): boolean {
  const fa = featureBbox({ type: 'Feature', geometry: a, properties: {} });
  const fb = featureBbox({ type: 'Feature', geometry: b, properties: {} });
  if (!fa || !fb || !bboxIntersects(fa, fb)) return false;
  if ((a.type === 'Point' || a.type === 'MultiPoint') && polygons(b).length) {
    const points: number[][] = []; geometryPoints(a.coordinates, points); return points.some((point) => pointInPolygon(point, b));
  }
  if ((b.type === 'Point' || b.type === 'MultiPoint') && polygons(a).length) {
    const points: number[][] = []; geometryPoints(b.coordinates, points); return points.some((point) => pointInPolygon(point, a));
  }
  if (polygons(a).length && polygons(b).length) return polygonIntersects(a, b);
  return true;
}

function geometryWithin(a: LocalGeometry, b: LocalGeometry): boolean {
  if (!polygons(b).length) return false;
  const points: number[][] = [];
  geometryPoints(a.coordinates, points);
  return points.length > 0 && points.every((point) => pointInPolygon(point, b));
}

function matchesFilters(properties: Record<string, unknown>, filters: LocalFilter[] = []): boolean {
  return filters.every((filter) => {
    if (!filter.field || !filter.value.trim()) return true;
    const actual = String(properties[filter.field] ?? '').toLocaleLowerCase();
    const expected = filter.value.trim().toLocaleLowerCase();
    return filter.operator === 'equals' ? actual === expected : actual.includes(expected);
  });
}

function categoryValue(properties: Record<string, unknown>, field: string): string {
  if (field === '__irrigation_right__') return irrigationCategory(properties);
  const value = properties[field];
  return value === null || value === undefined || String(value).trim() === '' ? 'Sin dato / NULL' : String(value).trim();
}

function numericValue(properties: Record<string, unknown>, field?: string): number {
  const value = Number(String(field ? properties[field] ?? '' : 0).replace(',', '.'));
  return Number.isFinite(value) ? value : 0;
}

function ringAreaM2(ring: number[][]): number {
  const radius = 6_378_137;
  let area = 0;
  for (let i = 0; i < ring.length; i += 1) {
    const current = ring[i]; const next = ring[(i + 1) % ring.length];
    area += ((next[0] - current[0]) * Math.PI / 180) * (2 + Math.sin(current[1] * Math.PI / 180) + Math.sin(next[1] * Math.PI / 180));
  }
  return Math.abs(area * radius * radius / 2);
}

function geometryAreaM2(geometry: LocalGeometry | null): number {
  if (!geometry) return 0;
  return polygons(geometry).reduce((total, polygon) => total + ringAreaM2(polygon[0] ?? []) - polygon.slice(1).reduce((holes, ring) => holes + ringAreaM2(ring), 0), 0);
}

export class LocalDataService {
  async catalog(refresh = false): Promise<LocalCatalog> {
    if (!refresh && catalogCache) return catalogCache;
    catalogCache = JSON.parse(await readFile(dataPath('catalog/idecam-catalog.json'), 'utf8')) as LocalCatalog;
    return catalogCache;
  }

  async metadata(layerId: string): Promise<LocalLayerMeta | null> {
    const catalog = await this.catalog();
    if (layerId === IRRIGATION_PROVINCIAL_LAYER_ID) {
      const layers = await this.municipalParcelLayers();
      const fields = [...new Set(layers.flatMap((layer) => layer.fields))];
      return {
        id: IRRIGATION_PROVINCIAL_LAYER_ID, title: IRRIGATION_PROVINCIAL_LAYER_NAME, typeName: IRRIGATION_PROVINCIAL_LAYER_ID,
        workspace: 'local', group: 'Parcelarios Municipales', sourceWfs: 'snapshots-locales', sourceWms: '',
        featureCount: layers.reduce((total, layer) => total + layer.featureCount, 0), geometryType: 'MultiPolygon', crs: 'EPSG:4326', fields,
        bbox: layers.reduce<number[] | null>((bbox, layer) => mergeBbox(bbox, layer.bbox), null),
        syncedAt: layers.map((layer) => layer.syncedAt).sort()[0] ?? new Date(0).toISOString(), status: 'ok', errors: [], files: [], indexFile: null, statsFile: null,
        wmsAvailable: false, wfsAvailable: false,
      };
    }
    return catalog.layers.find((layer) => layer.id === layerId || layer.typeName === layerId) ?? null;
  }

  async municipalParcelLayers(): Promise<LocalLayerMeta[]> {
    const catalog = await this.catalog();
    return catalog.layers.filter((layer) => layer.status === 'ok' && (/Parcelarios Municipales/i.test(layer.group) || /^\d{2}- Parcelas/i.test(layer.title)) && layer.fields.some((field) => /tipo_der_r|concesion|uso_riego|cc_pp_rieg/i.test(field)));
  }

  async statsSummary(layerId: string): Promise<Record<string, unknown>> {
    const meta = await this.metadata(layerId);
    if (meta?.id === IRRIGATION_PROVINCIAL_LAYER_ID) return { layer: meta, statistics: { featureCount: meta.featureCount, sourceLayers: (await this.municipalParcelLayers()).length, source: 'local-snapshot' } };
    if (!meta?.statsFile) throw new Error('SNAPSHOT_NOT_FOUND');
    return { layer: meta, statistics: JSON.parse(await readFile(dataPath(meta.statsFile), 'utf8')) as Record<string, unknown> };
  }

  async features(layerId: string): Promise<LocalFeature[]> {
    const cached = featureCache.get(layerId);
    if (cached) return cached;
    const meta = await this.metadata(layerId);
    if (!meta || meta.status === 'error' || !meta.files.length) throw new Error('SNAPSHOT_NOT_FOUND');
    const features: LocalFeature[] = [];
    for (const file of meta.files) {
      const raw = await readFile(dataPath(file));
      const text = file.endsWith('.gz') ? gunzipSync(raw).toString('utf8') : raw.toString('utf8');
      const parsed = JSON.parse(text) as { features?: LocalFeature[] };
      if (Array.isArray(parsed.features)) features.push(...parsed.features);
    }
    featureCache.set(layerId, features);
    if (meta.id !== layerId) featureCache.set(meta.id, features);
    trimCache(featureCache);
    return features;
  }

  async index(layerId: string): Promise<Array<{ featureIndex: number; bbox: BBox | null }>> {
    const cached = indexCache.get(layerId);
    if (cached) return cached;
    const meta = await this.metadata(layerId);
    if (!meta?.indexFile) throw new Error('SNAPSHOT_NOT_FOUND');
    const index = JSON.parse(await readFile(dataPath(meta.indexFile), 'utf8')) as Array<{ featureIndex: number; bbox: BBox | null }>;
    indexCache.set(layerId, index);
    if (meta.id !== layerId) indexCache.set(meta.id, index);
    trimCache(indexCache);
    return index;
  }

  async queryFeatures(input: { layerId: string; bbox?: number[]; mapCrs?: string; limit?: number; propertyName?: string[]; filters?: LocalFilter[]; polygon?: LocalGeometry; category?: string }): Promise<LocalFeatureCollection> {
    if (input.layerId === IRRIGATION_PROVINCIAL_LAYER_ID) return this.queryProvincialIrrigationFeatures(input);
    const meta = await this.metadata(input.layerId);
    if (!meta) throw new Error('SNAPSHOT_NOT_FOUND');
    const all = await this.features(input.layerId);
    const bbox4326 = input.bbox?.length === 4 ? transformBbox(input.bbox as BBox, input.mapCrs ?? 'EPSG:4326', 'EPSG:4326', { segmentsPerSide: 8 }) : null;
    const indexedExtent = bbox4326 ?? (input.polygon ? featureBbox({ type: 'Feature', geometry: input.polygon, properties: {} }) : null);
    const indexedIds = indexedExtent ? new Set((await this.index(input.layerId)).filter((item) => item.bbox && bboxIntersects(item.bbox, indexedExtent)).map((item) => item.featureIndex)) : null;
    const selected = all.filter((feature, featureIndex) => {
      if (indexedIds && !indexedIds.has(featureIndex)) return false;
      if (input.polygon && (!feature.geometry || !geometriesIntersect(feature.geometry, input.polygon))) return false;
      if (input.category && irrigationCategory(feature.properties) !== input.category) return false;
      return matchesFilters(feature.properties, input.filters);
    });
    const limit = Math.max(1, Math.min(input.limit ?? 1000, 1_000_000));
    const properties = input.propertyName?.length ? new Set(input.propertyName) : null;
    return {
      type: 'FeatureCollection' as const,
      features: selected.slice(0, limit).map((feature) => properties ? { ...feature, properties: Object.fromEntries(Object.entries(feature.properties).filter(([key]) => properties.has(key))) } : feature),
      numberMatched: selected.length,
      numberReturned: Math.min(selected.length, limit),
      partial: selected.length > limit,
      source: 'local-snapshot' as const,
      syncedAt: meta.syncedAt,
      crs: 'EPSG:4326',
    };
  }

  private async queryProvincialIrrigationFeatures(input: { bbox?: number[]; mapCrs?: string; limit?: number; propertyName?: string[]; filters?: LocalFilter[]; polygon?: LocalGeometry; category?: string }): Promise<LocalFeatureCollection> {
    const limit = Math.max(1, Math.min(input.limit ?? 1000, 1_000_000));
    const bbox4326 = input.bbox?.length === 4 ? transformBbox(input.bbox as BBox, input.mapCrs ?? 'EPSG:4326', 'EPSG:4326', { segmentsPerSide: 8 }) : null;
    const polygonBbox = input.polygon ? featureBbox({ type: 'Feature', geometry: input.polygon, properties: {} }) : null;
    const queryExtent = bbox4326 ?? polygonBbox;
    const layers = (await this.municipalParcelLayers()).filter((layer) => !queryExtent || !layer.bbox || bboxIntersects(layer.bbox, queryExtent));
    const features: LocalFeature[] = [];
    let numberMatched = 0;
    for (const layer of layers) {
      const payload = await this.queryFeatures({ ...input, layerId: layer.id, limit: Math.max(1, limit - features.length) });
      numberMatched += payload.numberMatched;
      if (features.length < limit) {
        features.push(...payload.features.slice(0, limit - features.length).map((feature, index) => ({
          ...feature,
          id: `${layer.id}:${feature.id ?? index}`,
          properties: { ...feature.properties, _source_layer: layer.title, _source_layer_id: layer.id },
        })));
      }
    }
    const meta = await this.metadata(IRRIGATION_PROVINCIAL_LAYER_ID);
    return { type: 'FeatureCollection', features, numberMatched, numberReturned: features.length, partial: numberMatched > features.length, source: 'local-snapshot', syncedAt: meta?.syncedAt ?? new Date(0).toISOString(), crs: 'EPSG:4326', sourceLayers: layers.length };
  }

  async statistics(input: { layerId: string; categoryField: string; numericField?: string; filters?: LocalFilter[]; scope?: 'global' | 'area'; bbox?: number[]; mapCrs?: string; polygon?: LocalGeometry; irrigationOnly?: boolean }): Promise<LocalStatisticsResult> {
    if (input.layerId === IRRIGATION_PROVINCIAL_LAYER_ID) return this.provincialIrrigationStatistics(input);
    const meta = await this.metadata(input.layerId);
    if (!meta) throw new Error('SNAPSHOT_NOT_FOUND');
    const payload = await this.queryFeatures({ layerId: input.layerId, bbox: input.scope === 'area' ? input.bbox : undefined, mapCrs: input.mapCrs, polygon: input.scope === 'area' ? input.polygon : undefined, limit: 1_000_000, filters: input.filters });
    const features = payload.features.filter((feature) => !input.irrigationOnly || irrigationCategory(feature.properties) !== 'Sin dato / NULL');
    const groups = new Map<string, { category: string; count: number; sum: number; avg: number; bbox: number[] | null }>();
    for (const feature of features) {
      const category = categoryValue(feature.properties, input.categoryField);
      const row = groups.get(category) ?? { category, count: 0, sum: 0, avg: 0, bbox: null };
      const extent = featureBbox(feature);
      row.count += 1; row.sum += numericValue(feature.properties, input.numericField);
      if (extent) row.bbox = row.bbox ? [Math.min(row.bbox[0], extent[0]), Math.min(row.bbox[1], extent[1]), Math.max(row.bbox[2], extent[2]), Math.max(row.bbox[3], extent[3])] : extent;
      groups.set(category, row);
      if (groups.size > 500) throw new Error('El campo seleccionado tiene mas de 500 categorias. Elija un campo categorico para evitar un resultado inmanejable.');
    }
    const rows = [...groups.values()].map((row) => ({ ...row, avg: row.count ? row.sum / row.count : 0 })).sort((a, b) => b.count - a.count);
    return { scope: input.scope ?? 'global', source: 'local-snapshot', status: rows.length ? 'ready' : 'empty', layerId: meta.id, layerName: meta.title, featureCount: features.length, rawFeatureCount: features.length, geometryAreaM2: features.reduce((total, feature) => total + geometryAreaM2(feature.geometry), 0), categoryField: input.categoryField, numericField: input.numericField ?? null, usedPropertyName: false, pageSize: null, maxFeatures: null, partial: false, syncedAt: meta.syncedAt, updatedAt: new Date().toISOString(), groups: rows, warnings: [], author: 'laugis' as const };
  }

  private async provincialIrrigationStatistics(input: { categoryField: string; numericField?: string; filters?: LocalFilter[]; scope?: 'global' | 'area'; bbox?: number[]; mapCrs?: string; polygon?: LocalGeometry }): Promise<LocalStatisticsResult> {
    const layers = await this.municipalParcelLayers();
    const snapshotKey = layers.map((layer) => `${layer.id}:${layer.syncedAt}`).join('|');
    const cachePath = dataPath('stats/irrigation-provincial.stats.json');
    if ((input.scope ?? 'global') === 'global' && !input.filters?.length) {
      const cached = await readFile(cachePath, 'utf8').then((text) => JSON.parse(text) as { snapshotKey?: string; categoryField?: string; numericField?: string; result?: LocalStatisticsResult }).catch(() => null);
      if (cached?.snapshotKey === snapshotKey && cached.categoryField === input.categoryField && cached.numericField === (input.numericField ?? '') && cached.result) return cached.result;
    }
    const grouped = new Map<string, { category: string; count: number; sum: number; avg: number; bbox: number[] | null }>();
    let featureCount = 0;
    let geometryArea = 0;
    for (const layer of layers) {
      const result = await this.statistics({ ...input, layerId: layer.id, irrigationOnly: false });
      featureCount += result.featureCount;
      geometryArea += result.geometryAreaM2;
      for (const group of result.groups) {
        const row = grouped.get(group.category) ?? { category: group.category, count: 0, sum: 0, avg: 0, bbox: null };
        row.count += group.count;
        row.sum += group.sum;
        row.bbox = mergeBbox(row.bbox, group.bbox);
        grouped.set(group.category, row);
      }
    }
    const groups = [...grouped.values()].map((row) => ({ ...row, avg: row.count ? row.sum / row.count : 0 })).sort((a, b) => b.count - a.count);
    const result: LocalStatisticsResult = {
      scope: input.scope ?? 'global', source: 'local-snapshot', status: groups.length ? 'ready' : 'empty',
      layerId: IRRIGATION_PROVINCIAL_LAYER_ID, layerName: IRRIGATION_PROVINCIAL_LAYER_NAME,
      featureCount, rawFeatureCount: featureCount, geometryAreaM2: geometryArea, categoryField: input.categoryField,
      numericField: input.numericField ?? null, usedPropertyName: false, pageSize: null, maxFeatures: null, partial: false,
      syncedAt: layers.map((layer) => layer.syncedAt).sort()[0] ?? new Date(0).toISOString(), updatedAt: new Date().toISOString(),
      groups, warnings: [`Consolidado provincial calculado sobre ${layers.length} parcelarios municipales completos.`], author: 'laugis', sourceLayers: layers.length,
    };
    if ((input.scope ?? 'global') === 'global' && !input.filters?.length) await writeFile(cachePath, JSON.stringify({ snapshotKey, categoryField: input.categoryField, numericField: input.numericField ?? '', result }));
    return result;
  }

  async crossStatistics(input: { targetLayerId: string; groupLayerId: string; spatialOperation: 'within' | 'intersects' | 'contains'; groupByField: string; metric: 'count' | 'sum' | 'avg'; numericField?: string; filters?: LocalFilter[]; scope?: 'global' | 'area'; bbox?: number[]; mapCrs?: string; polygon?: LocalGeometry; irrigationOnly?: boolean }) {
    if (input.targetLayerId === IRRIGATION_PROVINCIAL_LAYER_ID) return this.provincialIrrigationCrossStatistics(input);
    const [targetMeta, groupMeta] = await Promise.all([this.metadata(input.targetLayerId), this.metadata(input.groupLayerId)]);
    if (!targetMeta || !groupMeta) throw new Error('SNAPSHOT_NOT_FOUND');
    const [targetPayload, groupPayload] = await Promise.all([
      this.queryFeatures({ layerId: input.targetLayerId, bbox: input.scope === 'area' ? input.bbox : undefined, mapCrs: input.mapCrs, polygon: input.scope === 'area' ? input.polygon : undefined, limit: 1_000_000, filters: input.filters }),
      this.queryFeatures({ layerId: input.groupLayerId, bbox: input.scope === 'area' ? input.bbox : undefined, mapCrs: input.mapCrs, polygon: input.scope === 'area' ? input.polygon : undefined, limit: 1_000_000 }),
    ]);
    const targets = targetPayload.features.filter((feature) => feature.geometry && (!input.irrigationOnly || irrigationCategory(feature.properties) !== 'Sin dato / NULL'));
    const groups = groupPayload.features.filter((feature) => feature.geometry);
    const output = new Map<string, { group: string; count: number; sum: number; avg: number }>();
    let matchedFeatureCount = 0;
    for (const target of targets) {
      for (const group of groups) {
        const matches = input.spatialOperation === 'within'
          ? geometryWithin(target.geometry!, group.geometry!)
          : input.spatialOperation === 'contains'
            ? geometryWithin(group.geometry!, target.geometry!)
            : geometriesIntersect(target.geometry!, group.geometry!);
        if (!matches) continue;
        const key = categoryValue(group.properties, input.groupByField);
        const row = output.get(key) ?? { group: key, count: 0, sum: 0, avg: 0 };
        row.count += 1; row.sum += numericValue(target.properties, input.numericField); output.set(key, row); matchedFeatureCount += 1;
        if (input.spatialOperation === 'within') break;
      }
    }
    const results = [...output.values()].map((row) => ({ ...row, avg: row.count ? row.sum / row.count : 0 })).sort((a, b) => b.count - a.count);
    return { scope: input.scope ?? 'global', source: 'local-snapshot', status: results.length ? 'ready' : 'empty', targetLayerId: targetMeta.id, targetLayerName: targetMeta.title, groupLayerId: groupMeta.id, groupLayerName: groupMeta.title, spatialOperation: input.spatialOperation, groupByField: input.groupByField, metric: input.metric, numericField: input.numericField ?? null, targetFeatureCount: targets.length, groupFeatureCount: groups.length, matchedFeatureCount, usedPropertyName: false, usedCqlFilter: false, partial: false, pageSize: null, maxFeatures: null, syncedAt: [targetMeta.syncedAt, groupMeta.syncedAt].sort()[0], updatedAt: new Date().toISOString(), results, warnings: [], author: 'laugis' as const };
  }

  private async provincialIrrigationCrossStatistics(input: { groupLayerId: string; spatialOperation: 'within' | 'intersects' | 'contains'; groupByField: string; metric: 'count' | 'sum' | 'avg'; numericField?: string; filters?: LocalFilter[]; scope?: 'global' | 'area'; bbox?: number[]; mapCrs?: string; polygon?: LocalGeometry; irrigationOnly?: boolean }) {
    const [layers, targetMeta, groupMeta, groupPayload] = await Promise.all([
      this.municipalParcelLayers(),
      this.metadata(IRRIGATION_PROVINCIAL_LAYER_ID),
      this.metadata(input.groupLayerId),
      this.queryFeatures({ layerId: input.groupLayerId, bbox: input.scope === 'area' ? input.bbox : undefined, mapCrs: input.mapCrs, polygon: input.scope === 'area' ? input.polygon : undefined, limit: 1_000_000 }),
    ]);
    if (!targetMeta || !groupMeta) throw new Error('SNAPSHOT_NOT_FOUND');
    const snapshotKey = [...layers.map((layer) => `${layer.id}:${layer.syncedAt}`), `${groupMeta.id}:${groupMeta.syncedAt}`].join('|');
    const queryKey = JSON.stringify({ snapshotKey, groupLayerId: input.groupLayerId, spatialOperation: input.spatialOperation, groupByField: input.groupByField, metric: input.metric, numericField: input.numericField ?? '', irrigationOnly: Boolean(input.irrigationOnly) });
    const cachePath = dataPath('stats/irrigation-provincial-cross.stats.json');
    if ((input.scope ?? 'global') === 'global' && !input.filters?.length) {
      const cached = await readFile(cachePath, 'utf8').then((text) => JSON.parse(text) as { queryKey?: string; result?: Record<string, unknown> }).catch(() => null);
      if (cached?.queryKey === queryKey && cached.result) return cached.result;
    }
    const groups = groupPayload.features
      .filter((feature) => feature.geometry)
      .map((feature) => ({ feature, bbox: featureBbox(feature) }));
    const output = new Map<string, { group: string; count: number; sum: number; avg: number }>();
    let targetFeatureCount = 0;
    let matchedFeatureCount = 0;
    for (const layer of layers) {
      const payload = await this.queryFeatures({ layerId: layer.id, bbox: input.scope === 'area' ? input.bbox : undefined, mapCrs: input.mapCrs, polygon: input.scope === 'area' ? input.polygon : undefined, limit: 1_000_000, filters: input.filters });
      for (const target of payload.features) {
        if (!target.geometry) continue;
        if (input.irrigationOnly && irrigationCategory(target.properties) === 'Sin dato / NULL') continue;
        targetFeatureCount += 1;
        const targetBbox = featureBbox(target);
        for (const group of groups) {
          if (!targetBbox || !group.bbox || !bboxIntersects(targetBbox, group.bbox)) continue;
          const matches = input.spatialOperation === 'within' ? geometryWithin(target.geometry, group.feature.geometry!) : input.spatialOperation === 'contains' ? geometryWithin(group.feature.geometry!, target.geometry) : geometriesIntersect(target.geometry, group.feature.geometry!);
          if (!matches) continue;
          const key = categoryValue(group.feature.properties, input.groupByField);
          const row = output.get(key) ?? { group: key, count: 0, sum: 0, avg: 0 };
          row.count += 1; row.sum += numericValue(target.properties, input.numericField); output.set(key, row); matchedFeatureCount += 1;
          if (input.spatialOperation === 'within') break;
        }
      }
    }
    const results = [...output.values()].map((row) => ({ ...row, avg: row.count ? row.sum / row.count : 0 })).sort((a, b) => b.count - a.count);
    const result = { scope: input.scope ?? 'global', source: 'local-snapshot' as const, status: results.length ? 'ready' : 'empty', targetLayerId: targetMeta.id, targetLayerName: targetMeta.title, groupLayerId: groupMeta.id, groupLayerName: groupMeta.title, spatialOperation: input.spatialOperation, groupByField: input.groupByField, metric: input.metric, numericField: input.numericField ?? null, targetFeatureCount, groupFeatureCount: groups.length, matchedFeatureCount, usedPropertyName: false, usedCqlFilter: false, partial: false, pageSize: null, maxFeatures: null, syncedAt: [targetMeta.syncedAt, groupMeta.syncedAt].sort()[0], updatedAt: new Date().toISOString(), results, warnings: [`Cruce provincial calculado sobre ${layers.length} parcelarios municipales completos.`], author: 'laugis' as const, sourceLayers: layers.length };
    if ((input.scope ?? 'global') === 'global' && !input.filters?.length) await writeFile(cachePath, JSON.stringify({ queryKey, result }));
    return result;
  }
}
