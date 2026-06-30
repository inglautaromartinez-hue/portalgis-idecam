import { getProj4 } from '@portalgis/gis-core';
import { WfsProxyService } from './wfs-proxy.service';
import type { StatisticsFilter, StatisticsFilterOperator, StatisticsLayer, StatisticsMetric } from './statistics.service';

type SpatialOperation = 'within' | 'intersects' | 'contains';

interface CrossStatisticsQuery {
  targetLayer: StatisticsLayer;
  groupLayer: StatisticsLayer;
  bbox: number[];
  mapCrs: string;
  spatialOperation: SpatialOperation;
  groupByField: string;
  metric: StatisticsMetric;
  numericField?: string;
  filters?: StatisticsFilter[];
  irrigationOnly?: boolean;
}

interface GeoJsonGeometry {
  type: string;
  coordinates: unknown;
}

interface GeoJsonFeature {
  properties?: Record<string, unknown>;
  geometry?: GeoJsonGeometry | null;
}

interface CrossFeature {
  properties: Record<string, unknown>;
  geometry: GeoJsonGeometry;
  bbox: [number, number, number, number];
}

interface CrossGroup {
  group: string;
  count: number;
  sum: number;
  avg: number;
}

const PAGE_SIZE = 250;
const TARGET_MAX_FEATURES = 1500;
const GROUP_MAX_FEATURES = 700;
const IRRIGATION_FIELDS = ['Tipo_der_r', 'Concesion', 'tipo_der_r', 'Sup_empad_', 'SUPERFICIE', 'SUPERFIC_1'];

function layerFields(layer: StatisticsLayer): string[] {
  return Array.isArray(layer.fields) ? layer.fields.filter((field): field is string => typeof field === 'string') : [];
}

function uniqueFields(fields: string[]): string[] {
  return [...new Set(fields.filter(Boolean))];
}

function stripAccents(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function normalizeIrrigationRightValue(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  const normalized = stripAccents(raw).toLocaleLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!normalized || ['null', 's/d', 'sd', 's d', 'sin dato', 'sin datos'].includes(normalized)) return null;
  if (/aguas?\s+subterraneas?/.test(normalized)) return 'Aguas Subterraneas';
  if (/cultivo\s+clandestino/.test(normalized)) return 'Cultivo clandestino';
  if (/definitiv[oa]/.test(normalized)) return 'Definitivo';
  if (/desague/.test(normalized)) return 'Desague';
  if (/eventual/.test(normalized)) return 'Eventual';
  if (/privad[oa]/.test(normalized)) return 'Privado';
  if (/sin\s+derecho/.test(normalized)) return 'Sin derecho';
  if (/sobrante/.test(normalized)) return 'Sobrante';
  return raw;
}

function irrigationRightFromProperties(properties: Record<string, unknown>): string | null {
  for (const field of ['Tipo_der_r', 'Concesion', 'tipo_der_r']) {
    const normalized = normalizeIrrigationRightValue(properties[field]);
    if (normalized) return normalized;
  }
  return null;
}

function categoryValue(properties: Record<string, unknown>, field: string): string {
  if (field === '__irrigation_right__') return irrigationRightFromProperties(properties) ?? 'Sin dato / NULL';
  const value = properties[field];
  if (value === null || value === undefined || String(value).trim() === '') return 'Sin dato / NULL';
  return String(value).trim();
}

function numericValue(properties: Record<string, unknown>, field?: string): number {
  if (!field) return 0;
  const value = Number(String(properties[field] ?? '').replace(',', '.'));
  return Number.isFinite(value) ? value : 0;
}

function matchesFilters(properties: Record<string, unknown>, filters: StatisticsFilter[] = []): boolean {
  for (const filter of filters) {
    if (!filter.field || !filter.value.trim()) continue;
    const actual = String(properties[filter.field] ?? '').toLocaleLowerCase();
    const expected = filter.value.trim().toLocaleLowerCase();
    if (filter.operator === 'equals' && actual !== expected) return false;
    if (filter.operator === 'contains' && !actual.includes(expected)) return false;
  }
  return true;
}

function irrigationCqlForLayer(fields: string[]): string | undefined {
  const clauses: string[] = [];
  if (fields.includes('Tipo_der_r')) clauses.push("(Tipo_der_r IS NOT NULL AND Tipo_der_r <> '')");
  if (fields.includes('Concesion')) clauses.push("(Concesion IS NOT NULL AND Concesion <> '')");
  return clauses.length ? clauses.join(' OR ') : undefined;
}

function geometryCoordinates(geometry: GeoJsonGeometry): number[][] {
  const points: number[][] = [];
  const walk = (node: unknown) => {
    if (!Array.isArray(node)) return;
    if (typeof node[0] === 'number' && typeof node[1] === 'number') {
      points.push([node[0], node[1]]);
      return;
    }
    for (const child of node) walk(child);
  };
  walk(geometry.coordinates);
  return points;
}

function bboxForGeometry(geometry: GeoJsonGeometry): [number, number, number, number] {
  const points = geometryCoordinates(geometry);
  const xs = points.map((point) => point[0]);
  const ys = points.map((point) => point[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

function transformCoordinates(coordinates: unknown, sourceCrs: string, targetCrs: string): unknown {
  if (!Array.isArray(coordinates)) return coordinates;
  if (typeof coordinates[0] === 'number' && typeof coordinates[1] === 'number') {
    return getProj4()(sourceCrs, targetCrs, coordinates as [number, number]) as [number, number];
  }
  return coordinates.map((child) => transformCoordinates(child, sourceCrs, targetCrs));
}

function transformGeometry(geometry: GeoJsonGeometry, sourceCrs: string, warnings: string[]): GeoJsonGeometry {
  if (sourceCrs === 'EPSG:4326') return geometry;
  try {
    return { ...geometry, coordinates: transformCoordinates(geometry.coordinates, sourceCrs, 'EPSG:4326') };
  } catch {
    warnings.push(`No se pudo transformar geometria desde ${sourceCrs}; el cruce puede ser impreciso si las capas usan CRS distintos.`);
    return geometry;
  }
}

function payloadFeatures(data: unknown): GeoJsonFeature[] {
  if (!data || typeof data !== 'object') return [];
  const features = (data as { features?: GeoJsonFeature[] }).features;
  return Array.isArray(features) ? features : [];
}

function featuresFromPayload(data: unknown, sourceCrs: string, warnings: string[]): CrossFeature[] {
  return payloadFeatures(data)
    .filter((feature) => feature.geometry)
    .map((feature) => {
      const geometry = transformGeometry(feature.geometry!, sourceCrs, warnings);
      return { properties: feature.properties ?? {}, geometry, bbox: bboxForGeometry(geometry) };
    });
}

function pointInRing(point: number[], ring: number[][]): boolean {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const crosses = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi || Number.EPSILON) + xi;
    if (crosses) inside = !inside;
  }
  return inside;
}

function polygonRings(geometry: GeoJsonGeometry): number[][][] {
  if (geometry.type === 'Polygon') return geometry.coordinates as number[][][];
  if (geometry.type === 'MultiPolygon') return (geometry.coordinates as number[][][][]).flat();
  return [];
}

function polygons(geometry: GeoJsonGeometry): number[][][][] {
  if (geometry.type === 'Polygon') return [geometry.coordinates as number[][][]];
  if (geometry.type === 'MultiPolygon') return geometry.coordinates as number[][][][];
  return [];
}

function pointInPolygon(point: number[], polygon: GeoJsonGeometry): boolean {
  return polygons(polygon).some((rings) => Boolean(rings[0]) && pointInRing(point, rings[0]) && rings.slice(1).every((hole) => !pointInRing(point, hole)));
}

function bboxIntersects(a: [number, number, number, number], b: [number, number, number, number]): boolean {
  return a[0] <= b[2] && a[2] >= b[0] && a[1] <= b[3] && a[3] >= b[1];
}

function ccw(a: number[], b: number[], c: number[]): boolean {
  return (c[1] - a[1]) * (b[0] - a[0]) > (b[1] - a[1]) * (c[0] - a[0]);
}

function segmentsIntersect(a: number[], b: number[], c: number[], d: number[]): boolean {
  return ccw(a, c, d) !== ccw(b, c, d) && ccw(a, b, c) !== ccw(a, b, d);
}

function polygonIntersectsPolygon(a: GeoJsonGeometry, b: GeoJsonGeometry): boolean {
  const aRings = polygonRings(a);
  const bRings = polygonRings(b);
  if (!aRings.length || !bRings.length) return false;
  if (aRings.some((ring) => ring.some((point) => pointInPolygon(point, b)))) return true;
  if (bRings.some((ring) => ring.some((point) => pointInPolygon(point, a)))) return true;
  return aRings.some((aRing) =>
    bRings.some((bRing) =>
      aRing.slice(1).some((point, index) => bRing.slice(1).some((other, otherIndex) => segmentsIntersect(aRing[index], point, bRing[otherIndex], other))),
    ),
  );
}

function isPointGeometry(geometry: GeoJsonGeometry): boolean {
  return geometry.type === 'Point' || geometry.type === 'MultiPoint';
}

function isPolygonGeometry(geometry: GeoJsonGeometry): boolean {
  return geometry.type === 'Polygon' || geometry.type === 'MultiPolygon';
}

function firstPoint(geometry: GeoJsonGeometry): number[] | null {
  if (geometry.type === 'Point') return geometry.coordinates as number[];
  if (geometry.type === 'MultiPoint') return ((geometry.coordinates as number[][])[0] ?? null) as number[] | null;
  return null;
}

function spatialMatch(target: CrossFeature, group: CrossFeature, operation: SpatialOperation): boolean {
  if (!bboxIntersects(target.bbox, group.bbox)) return false;
  if (operation === 'within') {
    const point = firstPoint(target.geometry);
    if (point && isPolygonGeometry(group.geometry)) return pointInPolygon(point, group.geometry);
    return isPolygonGeometry(target.geometry) && isPolygonGeometry(group.geometry) && geometryCoordinates(target.geometry).every((point) => pointInPolygon(point, group.geometry));
  }
  if (operation === 'contains') {
    const point = firstPoint(group.geometry);
    if (point && isPolygonGeometry(target.geometry)) return pointInPolygon(point, target.geometry);
    return isPolygonGeometry(target.geometry) && isPolygonGeometry(group.geometry) && geometryCoordinates(group.geometry).every((point) => pointInPolygon(point, target.geometry));
  }
  if (isPointGeometry(target.geometry) && isPolygonGeometry(group.geometry)) {
    const point = firstPoint(target.geometry);
    return Boolean(point && pointInPolygon(point, group.geometry));
  }
  if (isPolygonGeometry(target.geometry) && isPolygonGeometry(group.geometry)) return polygonIntersectsPolygon(target.geometry, group.geometry);
  return bboxIntersects(target.bbox, group.bbox);
}

export class CrossStatisticsService {
  constructor(private readonly wfs = new WfsProxyService()) {}

  private async fetchFeatures(layer: StatisticsLayer, bbox: number[], mapCrs: string, fields: string[], limit: number, cqlFilter: string | undefined, warnings: string[]) {
    if (!layer.endpointUrl || !layer.typename) throw new Error(`La capa ${layer.name} no tiene endpoint WFS o typename.`);
    const existingFields = layerFields(layer);
    const propertyFields = uniqueFields(fields).filter((field) => field !== '__irrigation_right__' && existingFields.includes(field));
    let usedPropertyName = Boolean(propertyFields.length);
    let usedCqlFilter = Boolean(cqlFilter);
    let startIndex = 0;
    const features: CrossFeature[] = [];
    let rawFeatureCount = 0;

    while (features.length < limit) {
      const request = {
        targetUrl: layer.endpointUrl,
        typeName: layer.typename,
        version: layer.version && layer.version !== 'auto' ? layer.version : '1.1.0',
        layerCrs: layer.effectiveSrs ?? 'EPSG:4326',
        mapCrs,
        bbox: bbox.join(','),
        count: PAGE_SIZE,
        startIndex,
        cqlFilter: usedCqlFilter ? cqlFilter : undefined,
        propertyName: usedPropertyName ? propertyFields.join(',') : undefined,
      };

      let result = await this.wfs.getFeature(request);
      if (result.status >= 400 && usedPropertyName) {
        warnings.push(`El WFS rechazo propertyName para ${layer.name}; se reintento con atributos completos.`);
        usedPropertyName = false;
        result = await this.wfs.getFeature({ ...request, propertyName: undefined });
      }
      if (result.status >= 400 && usedCqlFilter) {
        warnings.push(`El WFS rechazo CQL para ${layer.name}; el filtro se aplico despues de consultar.`);
        usedCqlFilter = false;
        result = await this.wfs.getFeature({ ...request, cqlFilter: undefined, propertyName: usedPropertyName ? propertyFields.join(',') : undefined });
      }
      if (result.status >= 400) throw new Error(`El WFS respondio ${result.status} para ${layer.name}.`);

      const raw = payloadFeatures(result.data);
      rawFeatureCount += raw.length;
      let page = featuresFromPayload(result.data, layer.effectiveSrs ?? 'EPSG:4326', warnings);
      if (raw.length && !page.length && usedPropertyName) {
        warnings.push(`propertyName no incluyo geometria para ${layer.name}; se reintento la pagina con atributos completos.`);
        usedPropertyName = false;
        result = await this.wfs.getFeature({ ...request, propertyName: undefined });
        page = featuresFromPayload(result.data, layer.effectiveSrs ?? 'EPSG:4326', warnings);
      }
      if (!page.length && usedCqlFilter && startIndex === 0) {
        warnings.push(`El WFS devolvio 0 features con CQL para ${layer.name}; se reintento sin CQL y se filtro en API.`);
        usedCqlFilter = false;
        result = await this.wfs.getFeature({ ...request, cqlFilter: undefined, propertyName: usedPropertyName ? propertyFields.join(',') : undefined });
        page = featuresFromPayload(result.data, layer.effectiveSrs ?? 'EPSG:4326', warnings);
      }

      features.push(...page);
      if (raw.length < PAGE_SIZE) break;
      startIndex += PAGE_SIZE;
    }

    return { features: features.slice(0, limit), rawFeatureCount, usedPropertyName, usedCqlFilter, partial: features.length >= limit };
  }

  async query(input: CrossStatisticsQuery) {
    const warnings: string[] = [];
    const targetFields = [
      input.numericField ?? '',
      ...(input.filters ?? []).map((filter) => filter.field),
      ...(input.irrigationOnly ? IRRIGATION_FIELDS : []),
    ];
    const groupFields = [input.groupByField];
    const cqlFilter = input.irrigationOnly ? irrigationCqlForLayer(layerFields(input.targetLayer)) : undefined;

    const target = await this.fetchFeatures(input.targetLayer, input.bbox, input.mapCrs, targetFields, TARGET_MAX_FEATURES, cqlFilter, warnings);
    const group = await this.fetchFeatures(input.groupLayer, input.bbox, input.mapCrs, groupFields, GROUP_MAX_FEATURES, undefined, warnings);

    const targetFeatures = target.features.filter((feature) => {
      if (input.irrigationOnly && !irrigationRightFromProperties(feature.properties)) return false;
      return matchesFilters(feature.properties, input.filters);
    });
    const grouped = new Map<string, CrossGroup>();
    let matchedCount = 0;

    for (const targetFeature of targetFeatures) {
      for (const groupFeature of group.features) {
        if (!spatialMatch(targetFeature, groupFeature, input.spatialOperation)) continue;
        const key = categoryValue(groupFeature.properties, input.groupByField);
        const current = grouped.get(key) ?? { group: key, count: 0, sum: 0, avg: 0 };
        current.count += 1;
        current.sum += numericValue(targetFeature.properties, input.numericField);
        grouped.set(key, current);
        matchedCount += 1;
        if (input.spatialOperation === 'within') break;
      }
    }

    const results = [...grouped.values()]
      .map((row) => ({ ...row, avg: row.count ? row.sum / row.count : 0 }))
      .sort((a, b) => b.count - a.count);
    const partial = target.partial || group.partial;
    if (target.partial) warnings.push(`Capa objetivo limitada a ${TARGET_MAX_FEATURES} features. Acerquese para mayor precision.`);
    if (group.partial) warnings.push(`Capa de agrupamiento limitada a ${GROUP_MAX_FEATURES} features. Acerquese para mayor precision.`);
    if (input.spatialOperation === 'intersects' && input.targetLayer.name !== input.groupLayer.name) {
      warnings.push('Poligono-poligono cuenta features intersectantes; no calcula area recortada de interseccion en esta version.');
    }

    return {
      scope: 'bbox' as const,
      source: 'wfs-proxy' as const,
      status: partial ? 'partial' : results.length ? 'ready' : 'empty',
      targetLayerId: input.targetLayer.id,
      targetLayerName: input.targetLayer.name,
      groupLayerId: input.groupLayer.id,
      groupLayerName: input.groupLayer.name,
      spatialOperation: input.spatialOperation,
      groupByField: input.groupByField,
      metric: input.metric,
      numericField: input.numericField ?? null,
      targetFeatureCount: targetFeatures.length,
      groupFeatureCount: group.features.length,
      matchedFeatureCount: matchedCount,
      usedPropertyName: target.usedPropertyName || group.usedPropertyName,
      usedCqlFilter: target.usedCqlFilter,
      partial,
      pageSize: PAGE_SIZE,
      maxFeatures: { target: TARGET_MAX_FEATURES, group: GROUP_MAX_FEATURES },
      updatedAt: new Date().toISOString(),
      results,
      warnings,
      author: 'laugis' as const,
    };
  }
}
