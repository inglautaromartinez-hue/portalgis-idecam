import { createHash } from 'node:crypto';
import { access, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { SEED_DATA } from '@portalgis/shared';

type JsonGeometry = { type: string; coordinates: unknown };
type JsonFeature = { type: 'Feature'; id?: string | number; geometry: JsonGeometry | null; properties: Record<string, unknown> };

interface DiscoveredLayer {
  id: string;
  title: string;
  typeName: string;
  workspace: string;
  sourceWfs: string;
  sourceWms: string;
  crs: string;
  fields: string[];
  group: string;
  wmsAvailable: boolean;
}

interface LayerMeta extends DiscoveredLayer {
  featureCount: number;
  geometryType: string | null;
  bbox: number[] | null;
  syncedAt: string;
  status: 'ok' | 'partial' | 'error';
  errors: string[];
  warnings?: string[];
  files: string[];
  indexFile: string | null;
  statsFile: string | null;
  wmsAvailable: boolean;
  wfsAvailable: boolean;
}

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../data');
const PAGE_SIZE = Math.max(50, Number(process.env.WFS_SYNC_PAGE_SIZE ?? 1000));
const REQUEST_TIMEOUT_MS = Math.max(5000, Number(process.env.WFS_SYNC_TIMEOUT_MS ?? 45000));
const MAX_PART_BYTES = 45 * 1024 * 1024;
const force = process.argv.includes('--force');
const criticalOnly = process.argv.includes('--critical');
const requestedLayer = process.argv.find((value) => value.startsWith('--layer='))?.slice(8);

const criticalTypeNames = new Set(SEED_DATA.layers.filter((layer) => {
  const label = `${layer.name} ${layer.groupPath}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
  return /parcelarios municipales|intervenciones cam|areas con servicios/.test(label)
    || /red de riego|distritos de mendoza|parcelas con derecho de riego|mensura|vesep/.test(label);
}).flatMap((layer) => layer.typename ? [layer.typename.toLocaleLowerCase()] : []));

function decodeXml(value: string): string {
  return value.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'");
}

function textContent(block: string, tag: string): string | null {
  const match = block.match(new RegExp(`<(?:(?:\\w+):)?${tag}\\b[^>]*>([\\s\\S]*?)<\\/(?:(?:\\w+):)?${tag}>`, 'i'));
  return match ? decodeXml(match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]+>/g, ' ').trim()) : null;
}

function safeName(value: string): string {
  const readable = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_-]+/g, '_').replace(/^_+|_+$/g, '');
  return `${readable.slice(0, 90) || 'layer'}_${createHash('sha1').update(value).digest('hex').slice(0, 8)}`;
}

function sourceWms(url: string): string {
  return url.replace(/\/wfs(?:\?.*)?$/i, '/wms').replace(/\/ows(?:\?.*)?$/i, '/ows');
}

async function fetchWithRetry(url: URL, attempts = 3): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json, application/xml, text/xml' } });
      if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    } finally {
      clearTimeout(timeout);
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Error de red desconocido.');
}

function seedMatch(typeName: string, endpoint: string) {
  return SEED_DATA.layers.find((layer) => layer.typename?.toLocaleLowerCase() === typeName.toLocaleLowerCase() && layer.endpointUrl === endpoint);
}

async function discover(endpoint: string): Promise<DiscoveredLayer[]> {
  const url = new URL(endpoint);
  url.search = new URLSearchParams({ service: 'WFS', request: 'GetCapabilities', version: '2.0.0' }).toString();
  const xml = await (await fetchWithRetry(url)).text();
  const wmsNames = new Set<string>();
  try {
    const wmsUrl = new URL(sourceWms(endpoint));
    wmsUrl.search = new URLSearchParams({ service: 'WMS', request: 'GetCapabilities', version: '1.3.0' }).toString();
    const wmsXml = await (await fetchWithRetry(wmsUrl)).text();
    for (const name of wmsXml.match(/<Name>[^<]+<\/Name>/gi) ?? []) wmsNames.add(decodeXml(name.replace(/<\/?Name>/gi, '')).trim());
  } catch { /* WFS puede existir sin WMS. */ }
  const blocks = xml.match(/<FeatureType\b[\s\S]*?<\/FeatureType>/gi) ?? [];
  return blocks.flatMap((block): DiscoveredLayer[] => {
    const typeName = textContent(block, 'Name');
    if (!typeName) return [];
    const seed = seedMatch(typeName, endpoint);
    const workspace = typeName.includes(':') ? typeName.split(':')[0] : 'default';
    const advertisedCrs = textContent(block, 'DefaultCRS') ?? textContent(block, 'DefaultSRS') ?? 'EPSG:4326';
    return [{
      id: seed?.id ?? `dynamic_${safeName(`${endpoint}|${typeName}`)}`,
      title: seed?.name ?? textContent(block, 'Title') ?? typeName,
      typeName,
      workspace,
      sourceWfs: endpoint,
      sourceWms: sourceWms(endpoint),
      crs: advertisedCrs.replace('urn:ogc:def:crs:EPSG::', 'EPSG:'),
      fields: seed?.fields ?? [],
      group: seed?.groupPath ?? workspace,
      wmsAvailable: wmsNames.has(typeName),
    }];
  });
}

function geometryPoints(coordinates: unknown, output: number[][]): void {
  if (!Array.isArray(coordinates)) return;
  if (typeof coordinates[0] === 'number' && typeof coordinates[1] === 'number') {
    output.push([coordinates[0], coordinates[1]]);
    return;
  }
  for (const child of coordinates) geometryPoints(child, output);
}

function featureBbox(feature: JsonFeature): [number, number, number, number] | null {
  if (!feature.geometry) return null;
  const points: number[][] = [];
  geometryPoints(feature.geometry.coordinates, points);
  if (!points.length) return null;
  let minX = Infinity; let minY = Infinity; let maxX = -Infinity; let maxY = -Infinity;
  for (const [x, y] of points) { minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); }
  return [minX, minY, maxX, maxY];
}

function overallBbox(index: Array<{ bbox: number[] | null }>): number[] | null {
  const boxes = index.map((item) => item.bbox).filter((bbox): bbox is number[] => Boolean(bbox));
  if (!boxes.length) return null;
  const output = [...boxes[0]];
  for (const box of boxes.slice(1)) { output[0] = Math.min(output[0], box[0]); output[1] = Math.min(output[1], box[1]); output[2] = Math.max(output[2], box[2]); output[3] = Math.max(output[3], box[3]); }
  return output;
}

function fieldStats(features: JsonFeature[]) {
  const types: Record<string, string> = {};
  const values = new Map<string, Map<string, number>>();
  for (const feature of features) {
    for (const [field, value] of Object.entries(feature.properties ?? {})) {
      if (value === null || value === undefined) continue;
      types[field] ??= Array.isArray(value) ? 'array' : typeof value;
      const map = values.get(field) ?? new Map<string, number>();
      if (map.size <= 500) map.set(String(value), (map.get(String(value)) ?? 0) + 1);
      values.set(field, map);
    }
  }
  const categoricalCounts = Object.fromEntries([...values].filter(([, map]) => map.size <= 100).map(([field, map]) => [field, Object.fromEntries([...map].sort((a, b) => b[1] - a[1]))]));
  return { fields: Object.keys(types), fieldTypes: types, categoricalCounts };
}

async function writeSnapshot(layer: DiscoveredLayer, features: JsonFeature[], errors: string[]): Promise<LayerMeta> {
  const slug = safeName(layer.typeName);
  const layerDir = join(ROOT, 'layers', layer.workspace);
  await Promise.all([mkdir(layerDir, { recursive: true }), mkdir(join(ROOT, 'indexes'), { recursive: true }), mkdir(join(ROOT, 'stats'), { recursive: true })]);
  const index = features.map((feature, featureIndex) => ({ featureIndex, bbox: featureBbox(feature) }));
  const collection = (items: JsonFeature[]) => JSON.stringify({ type: 'FeatureCollection', name: layer.typeName, crs: { type: 'name', properties: { name: 'EPSG:4326' } }, features: items });
  const featureSizes = features.map((feature) => Buffer.byteLength(JSON.stringify(feature)) + 1);
  const fullBytes = featureSizes.reduce((total, bytes) => total + bytes, 200);
  const warnings = fullBytes > 25 * 1024 * 1024 ? [`GeoJSON sin comprimir: ${(fullBytes / 1024 / 1024).toFixed(1)} MB.`] : [];
  const files: string[] = [];

  if (fullBytes <= MAX_PART_BYTES) {
    const full = collection(features);
    const path = join(layerDir, `${slug}.geojson`);
    await writeFile(path, full);
    files.push(relative(ROOT, path).replace(/\\/g, '/'));
  } else {
    let part: JsonFeature[] = [];
    let bytes = 0;
    let partNumber = 1;
    for (let featureIndex = 0; featureIndex < features.length; featureIndex += 1) {
      const feature = features[featureIndex];
      const featureBytes = featureSizes[featureIndex];
      if (part.length && bytes + featureBytes > MAX_PART_BYTES) {
        const path = join(layerDir, `${slug}.part-${String(partNumber).padStart(4, '0')}.geojson.gz`);
        await writeFile(path, gzipSync(collection(part)));
        files.push(relative(ROOT, path).replace(/\\/g, '/'));
        part = [];
        bytes = 0;
        partNumber += 1;
      }
      part.push(feature);
      bytes += featureBytes;
    }
    if (part.length) {
      const path = join(layerDir, `${slug}.part-${String(partNumber).padStart(4, '0')}.geojson.gz`);
      await writeFile(path, gzipSync(collection(part)));
      files.push(relative(ROOT, path).replace(/\\/g, '/'));
    }
  }

  const indexPath = join(ROOT, 'indexes', `${slug}.index.json`);
  const statsPath = join(ROOT, 'stats', `${slug}.stats.json`);
  const stats = { featureCount: features.length, bbox: overallBbox(index), ...fieldStats(features) };
  await writeFile(indexPath, JSON.stringify(index));
  await writeFile(statsPath, JSON.stringify(stats, null, 2));
  const meta: LayerMeta = {
    ...layer, crs: 'EPSG:4326', fields: stats.fields, featureCount: features.length,
    geometryType: features.find((feature) => feature.geometry)?.geometry?.type ?? null,
    bbox: stats.bbox, syncedAt: new Date().toISOString(), status: errors.length ? 'partial' : 'ok', errors, warnings, files,
    indexFile: relative(ROOT, indexPath).replace(/\\/g, '/'), statsFile: relative(ROOT, statsPath).replace(/\\/g, '/'),
    wmsAvailable: layer.wmsAvailable, wfsAvailable: true,
  };
  await writeFile(join(layerDir, `${slug}.meta.json`), JSON.stringify(meta, null, 2));
  return meta;
}

async function download(layer: DiscoveredLayer): Promise<LayerMeta> {
  const features: JsonFeature[] = [];
  const syncErrors: string[] = [];
  let startIndex = 0;
  let version = '2.0.0';
  let cursorField: string | null = null;
  let cursorValue: number | null = null;
  let pageSize = PAGE_SIZE;
  let expectedCount: number | null = null;
  while (true) {
    const requestPage = async (candidateVersion: string) => {
      const url = new URL(layer.sourceWfs);
      const params: Record<string, string> = { service: 'WFS', request: 'GetFeature', version: candidateVersion, outputFormat: 'application/json', srsName: 'EPSG:4326' };
      if (cursorField && cursorValue !== null) { params.CQL_FILTER = `${cursorField}>${cursorValue}`; params.sortBy = cursorField; }
      else if (startIndex > 0) params.startIndex = String(startIndex);
      if (candidateVersion === '2.0.0') { params.typeNames = layer.typeName; params.count = String(pageSize); }
      else { params.typeName = layer.typeName; params.maxFeatures = String(pageSize); }
      url.search = new URLSearchParams(params).toString();
      return (await fetchWithRetry(url)).json() as Promise<{ features?: JsonFeature[]; numberMatched?: number | string; totalFeatures?: number | string }>;
    };
    let payload: { features?: JsonFeature[]; numberMatched?: number | string; totalFeatures?: number | string } | null = null;
    const candidates = [...new Set([version, '2.0.0', '1.1.0', '1.0.0'])];
    let lastError: unknown;
    for (const candidate of candidates) {
      try { payload = await requestPage(candidate); version = candidate; break; } catch (error) { lastError = error; }
    }
    if (!payload) {
      const error = lastError instanceof Error ? lastError : new Error('Ninguna version WFS devolvio GeoJSON.');
      if (features.length && !cursorField) {
        const properties = features.at(-1)?.properties ?? {};
        const field = Object.keys(properties).find((key) => ['gid', 'fid', 'id', 'ogc_fid', 'objectid'].includes(key.toLocaleLowerCase()) && Number.isFinite(Number(properties[key])));
        if (field) { cursorField = field; cursorValue = Number.MIN_SAFE_INTEGER; features.length = 0; startIndex = 0; version = '1.1.0'; continue; }
      }
      if (cursorField && pageSize > 1) { pageSize = Math.max(1, Math.floor(pageSize / 2)); continue; }
      if (cursorField && cursorValue !== null) {
        try {
          const idUrl = new URL(layer.sourceWfs);
          idUrl.search = new URLSearchParams({ service: 'WFS', request: 'GetFeature', version: '1.1.0', typeName: layer.typeName, outputFormat: 'application/json', maxFeatures: '1', propertyName: cursorField, CQL_FILTER: `${cursorField}>${cursorValue}`, sortBy: cursorField }).toString();
          const idPayload = await (await fetchWithRetry(idUrl)).json() as { features?: JsonFeature[] };
          const invalidId = Number(idPayload.features?.[0]?.properties?.[cursorField]);
          if (Number.isFinite(invalidId) && invalidId > cursorValue) {
            cursorValue = invalidId;
            syncErrors.push(`Feature omitida ${cursorField}=${invalidId}: ${error.message}`);
            continue;
          }
        } catch { /* Si ni el identificador es legible, se conserva el snapshot parcial. */ }
      }
      if (features.length) { process.stdout.write('\n'); return writeSnapshot(layer, features, [error.message]); }
      throw error;
    }
    const page = Array.isArray(payload.features) ? payload.features : [];
    const advertisedCount = Number(payload.numberMatched ?? payload.totalFeatures);
    if (Number.isFinite(advertisedCount) && expectedCount === null) expectedCount = advertisedCount;
    features.push(...page);
    process.stdout.write(`\r${layer.typeName}: ${features.length} features`);
    if (page.length < pageSize) break;
    if (cursorField) {
      const nextCursor = Number(page.at(-1)?.properties?.[cursorField]);
      if (!Number.isFinite(nextCursor) || nextCursor === cursorValue) break;
      cursorValue = nextCursor;
    } else startIndex += page.length;
    const matched = Number(payload.numberMatched ?? payload.totalFeatures);
    if (!cursorField && Number.isFinite(matched) && features.length >= matched) break;
  }
  process.stdout.write('\n');
  if (expectedCount !== null && features.length !== expectedCount) syncErrors.push(`WFS anuncio ${expectedCount} features y se sincronizaron ${features.length}.`);
  return writeSnapshot(layer, features, syncErrors);
}

async function main(): Promise<void> {
  await mkdir(join(ROOT, 'catalog'), { recursive: true });
  const reportPath = join(ROOT, 'catalog', 'sync-report.json');
  const existing = await readFile(reportPath, 'utf8').then((text) => JSON.parse(text) as { layers?: LayerMeta[] }).catch(() => ({ layers: [] }));
  const previous = new Map((existing.layers ?? []).map((layer) => [layer.typeName, layer]));
  const endpoints = [...new Set(SEED_DATA.layers.filter((layer) => layer.provider.toLocaleUpperCase() === 'WFS' && layer.endpointUrl).map((layer) => layer.endpointUrl!))];
  const discovered: DiscoveredLayer[] = [];
  const discoveryErrors: string[] = [];
  for (const endpoint of endpoints) {
    try { discovered.push(...await discover(endpoint)); }
    catch (error) { discoveryErrors.push(`${endpoint}: ${error instanceof Error ? error.message : String(error)}`); }
  }
  const selected = requestedLayer
    ? discovered.filter((layer) => layer.id === requestedLayer || layer.typeName === requestedLayer)
    : criticalOnly
      ? discovered.filter((layer) => criticalTypeNames.has(layer.typeName.toLocaleLowerCase()))
      : discovered;
  console.log(`seleccionadas ${selected.length} de ${discovered.length} capas${criticalOnly ? ' (criticas)' : ''}`);
  const results = new Map(previous);
  for (const layer of selected) {
    const old = previous.get(layer.typeName);
    const snapshotExists = old?.files?.length && (await Promise.all(old.files.map((file) => access(join(ROOT, file)).then(() => true).catch(() => false)))).every(Boolean);
    if (!force && old?.status === 'ok' && snapshotExists) { results.set(layer.typeName, { ...old, wmsAvailable: layer.wmsAvailable }); console.log(`skip ${layer.typeName} (snapshot existente)`); continue; }
    console.log(`sync ${layer.typeName}`);
    try { results.set(layer.typeName, await download(layer)); }
    catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`error ${layer.typeName}: ${message}`);
      results.set(layer.typeName, { ...layer, featureCount: 0, geometryType: null, bbox: null, syncedAt: new Date().toISOString(), status: 'error', errors: [message], files: [], indexFile: null, statsFile: null, wmsAvailable: layer.wmsAvailable, wfsAvailable: true });
    }
    const interim = { author: 'laugis', generatedAt: new Date().toISOString(), discoveryErrors, layers: [...results.values()] };
    await writeFile(`${reportPath}.tmp`, JSON.stringify(interim, null, 2));
    await rename(`${reportPath}.tmp`, reportPath);
  }
  const layers = [...results.values()].sort((a, b) => a.workspace.localeCompare(b.workspace) || a.title.localeCompare(b.title));
  const counts = { discovered: discovered.length, ok: layers.filter((layer) => layer.status === 'ok').length, partial: layers.filter((layer) => layer.status === 'partial').length, error: layers.filter((layer) => layer.status === 'error').length };
  const report = { author: 'laugis', generatedAt: new Date().toISOString(), discoveryErrors, counts, layers };
  await writeFile(reportPath, JSON.stringify(report, null, 2));
  await writeFile(join(ROOT, 'catalog', 'idecam-catalog.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(counts));
}

void main().catch(async (error) => {
  await rm(join(ROOT, 'catalog', 'sync-report.json.tmp'), { force: true }).catch(() => undefined);
  console.error(error);
  process.exitCode = 1;
});
