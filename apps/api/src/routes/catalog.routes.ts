import type { FastifyInstance } from 'fastify';
import { transformBbox, type BBox } from '@portalgis/gis-core';
import { WfsProxyService } from '../services/wfs-proxy.service';
import { IRRIGATION_PROVINCIAL_LAYER_ID, LocalDataService } from '../services/local-data.service';

function buildTree(groups: Array<any>, layers: Array<any>) {
  const groupMap = new Map<string, any>();

  for (const group of groups) {
    groupMap.set(group.id, { ...group, groups: [], layers: [] });
  }

  const roots: any[] = [];

  for (const group of groupMap.values()) {
    if (group.parentId && groupMap.has(group.parentId)) {
      groupMap.get(group.parentId).groups.push(group);
    } else {
      roots.push(group);
    }
  }

  for (const layer of layers) {
    if (layer.groupId && groupMap.has(layer.groupId)) {
      groupMap.get(layer.groupId).layers.push(layer);
    } else {
      roots.push({ type: 'ungrouped-layer', ...layer });
    }
  }

  const sortNode = (node: any) => {
    node.groups?.sort((a: any, b: any) => a.treeOrder - b.treeOrder);
    node.layers?.sort((a: any, b: any) => a.treeOrder - b.treeOrder);
    node.groups?.forEach(sortNode);
  };

  roots.sort((a, b) => (a.treeOrder ?? 0) - (b.treeOrder ?? 0));
  roots.forEach(sortNode);

  return roots;
}

const extentCache = new Map<string, { layerId: string; source: 'wfs-capabilities' | 'fallback'; extent3857: BBox }>();
const fallbackInitialExtent4326: BBox = [-68.7336986444611, -33.17171881346962437, -68.55063425246132169, -33.01616626946952238];

function textContent(block: string, tagName: string): string | null {
  const match = block.match(new RegExp(`<(?:(?:\\w+):)?${tagName}\\b[^>]*>([\\s\\S]*?)<\\/(?:(?:\\w+):)?${tagName}>`, 'i'));
  return match?.[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() ?? null;
}

function decodeXml(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function numberList(text: string): number[] {
  return text
    .trim()
    .split(/\s+/)
    .map((value) => Number(value))
    .filter(Number.isFinite);
}

function findFeatureTypeBlock(xml: string, typeName: string): string | null {
  const blocks = xml.match(/<FeatureType\b[\s\S]*?<\/FeatureType>/gi) ?? [];
  const normalizedTypeName = typeName.toLocaleLowerCase();
  return (
    blocks.find((block) => decodeXml(textContent(block, 'Name') ?? '').toLocaleLowerCase() === normalizedTypeName) ??
    null
  );
}

function parseCapabilitiesBbox(xml: string, typeName: string): { bbox: BBox; crs: string } | null {
  const block = findFeatureTypeBlock(xml, typeName);
  if (!block) return null;

  const wgs84 = textContent(block, 'WGS84BoundingBox');
  const lower = wgs84 ? numberList(textContent(wgs84, 'LowerCorner') ?? '') : [];
  const upper = wgs84 ? numberList(textContent(wgs84, 'UpperCorner') ?? '') : [];
  if (lower.length >= 2 && upper.length >= 2) return { bbox: [lower[0], lower[1], upper[0], upper[1]], crs: 'EPSG:4326' };

  const crs84 = block.match(/<[^:>\s]*:?BoundingBox\b[^>]*(?:CRS|crs|SRS|srs)=["']CRS:84["'][^>]*>/i)?.[0];
  if (crs84) {
    const minx = Number(crs84.match(/\bminx=["']([^"']+)["']/i)?.[1]);
    const miny = Number(crs84.match(/\bminy=["']([^"']+)["']/i)?.[1]);
    const maxx = Number(crs84.match(/\bmaxx=["']([^"']+)["']/i)?.[1]);
    const maxy = Number(crs84.match(/\bmaxy=["']([^"']+)["']/i)?.[1]);
    if ([minx, miny, maxx, maxy].every(Number.isFinite)) return { bbox: [minx, miny, maxx, maxy], crs: 'EPSG:4326' };
  }

  return null;
}

function initialExtentFromSetting(value: unknown): BBox {
  if (value && typeof value === 'object') {
    const raw = value as Record<string, unknown>;
    const bbox = [Number(raw.xmin), Number(raw.ymin), Number(raw.xmax), Number(raw.ymax)] as BBox;
    if (bbox.every(Number.isFinite)) return bbox;
  }
  return fallbackInitialExtent4326;
}


interface DiscoveredCatalogLayer {
  id: string;
  name: string;
  title: string;
  provider: 'WMS_WFS';
  typename: string;
  workspace: string;
  group: string;
  dataset: string;
  wfsUrl: string;
  wmsUrl: string;
  endpointUrl: string;
  effectiveSrs: string;
  geometry: string | null;
  description: string | null;
  wmsAvailable: boolean;
  wfsAvailable: boolean;
  fields: string[];
}

const DISCOVERY_SOURCES = [
  {
    id: 'idecam-geonode',
    label: 'IDECAM / GeoNode CAM',
    wfsUrl: 'https://geonode-cam.marketsis.com.ar/geoserver/wfs',
    wmsUrl: 'https://geonode-cam.marketsis.com.ar/geoserver/wms',
  },
  {
    id: 'ign',
    label: 'IGN Argentina',
    wfsUrl: 'https://wms.ign.gob.ar/geoserver/ows',
    wmsUrl: 'https://wms.ign.gob.ar/geoserver/ows',
  },
];

const discoveryCache = new Map<string, { expiresAt: number; payload: unknown }>();
const DISCOVERY_TTL_MS = 10 * 60 * 1000;

function stripTags(text: string | null): string | null {
  if (!text) return null;
  return decodeXml(text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()) || null;
}

function parseFeatureTypes(xml: string, source: (typeof DISCOVERY_SOURCES)[number]): DiscoveredCatalogLayer[] {
  const blocks = xml.match(/<FeatureType\b[\s\S]*?<\/FeatureType>/gi) ?? [];
  return blocks
    .map((block, index): DiscoveredCatalogLayer | null => {
      const typename = decodeXml(textContent(block, 'Name') ?? '');
      if (!typename) return null;
      const title = stripTags(textContent(block, 'Title')) ?? typename;
      const description = stripTags(textContent(block, 'Abstract'));
      const workspace = typename.includes(':') ? typename.split(':')[0] : 'default';
      const dataset = source.label;
      const safeId = `dynamic_${source.id}_${typename}`.replace(/[^a-zA-Z0-9_-]+/g, '_');
      return {
        id: safeId,
        name: title,
        title,
        provider: 'WMS_WFS',
        typename,
        workspace,
        group: workspace,
        dataset,
        wfsUrl: source.wfsUrl,
        wmsUrl: source.wmsUrl,
        endpointUrl: source.wfsUrl,
        effectiveSrs: 'EPSG:4326',
        geometry: null,
        description,
        wmsAvailable: true,
        wfsAvailable: true,
        fields: [],
      };
    })
    .filter((layer): layer is DiscoveredCatalogLayer => Boolean(layer))
    .sort((a, b) => a.dataset.localeCompare(b.dataset) || a.workspace.localeCompare(b.workspace) || a.name.localeCompare(b.name));
}

function discoverGroupTree(layers: DiscoveredCatalogLayer[]) {
  const datasetMap = new Map<string, any>();
  for (const layer of layers) {
    const datasetId = `catalog_dataset_${layer.dataset}`.replace(/[^a-zA-Z0-9_-]+/g, '_');
    const workspaceId = `${datasetId}_${layer.workspace}`.replace(/[^a-zA-Z0-9_-]+/g, '_');
    if (!datasetMap.has(datasetId)) {
      datasetMap.set(datasetId, { id: datasetId, name: layer.dataset, treeOrder: datasetMap.size, groups: [], layers: [], expanded: false });
    }
    const dataset = datasetMap.get(datasetId);
    let workspace = dataset.groups.find((group: any) => group.id === workspaceId);
    if (!workspace) {
      workspace = { id: workspaceId, name: layer.workspace, treeOrder: dataset.groups.length, groups: [], layers: [], expanded: false };
      dataset.groups.push(workspace);
    }
    workspace.layers.push(layer);
  }
  return [...datasetMap.values()];
}

export async function catalogRoutes(app: FastifyInstance): Promise<void> {
  const dynamicCatalog = async () => {
    try {
      const localService = new LocalDataService();
      const local = await localService.catalog();
      const provincial = await localService.metadata(IRRIGATION_PROVINCIAL_LAYER_ID);
      const localLayers = provincial ? [...local.layers, provincial] : local.layers;
      const layers: DiscoveredCatalogLayer[] = localLayers.map((layer) => ({
        id: layer.id,
        name: layer.title,
        title: layer.title,
        provider: 'WMS_WFS',
        typename: layer.typeName,
        workspace: layer.workspace,
        group: layer.group,
        dataset: 'IDECAM local',
        wfsUrl: layer.sourceWfs,
        wmsUrl: layer.sourceWms,
        endpointUrl: layer.sourceWfs,
        effectiveSrs: layer.crs,
        geometry: layer.geometryType,
        description: `Snapshot local ${layer.status}. Sincronizado ${layer.syncedAt}.`,
        wmsAvailable: layer.wmsAvailable,
        wfsAvailable: layer.wfsAvailable,
        fields: layer.fields,
      }));
      return { author: 'laugis' as const, generatedAt: local.generatedAt, source: 'local-snapshot', counts: { layers: layers.length, datasets: new Set(layers.map((layer) => layer.dataset)).size }, layers, tree: discoverGroupTree(layers), warnings: local.layers.filter((layer) => layer.status !== 'ok').map((layer) => `${layer.title}: snapshot ${layer.status}`) };
    } catch {
      return null;
    }
  };

  app.get('/catalog', async () => {
    const [groups, layers, settings] = await Promise.all([
      app.prisma.layerGroup.findMany({ orderBy: { treeOrder: 'asc' } }),
      app.prisma.layer.findMany({ orderBy: [{ treeOrder: 'asc' }, { drawOrder: 'asc' }], include: { layerStyle: true } }),
      app.prisma.appSetting.findMany(),
    ]);

    return {
      author: 'laugis',
      groups,
      layers,
      settings,
      counts: { groups: groups.length, layers: layers.length },
    };
  });

  app.get('/catalog/tree', async () => {
    const [groups, layers] = await Promise.all([
      app.prisma.layerGroup.findMany({ orderBy: { treeOrder: 'asc' } }),
      app.prisma.layer.findMany({ orderBy: [{ treeOrder: 'asc' }, { drawOrder: 'asc' }], include: { layerStyle: true } }),
    ]);

    return {
      author: 'laugis',
      counts: { groups: groups.length, layers: layers.length },
      tree: buildTree(groups, layers),
    };
  });

  app.get('/catalog/discover', async (_request, reply) => {
    const local = await dynamicCatalog();
    if (local) return local;
    const cacheKey = 'all-discovery-sources';
    const cached = discoveryCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return cached.payload;

    const proxy = new WfsProxyService();
    const warnings: string[] = [];
    const layers: DiscoveredCatalogLayer[] = [];

    for (const source of DISCOVERY_SOURCES) {
      try {
        const capabilities = await proxy.getCapabilities({ targetUrl: source.wfsUrl, version: '1.1.0' });
        const xml = typeof capabilities.data === 'string' ? capabilities.data : JSON.stringify(capabilities.data);
        layers.push(...parseFeatureTypes(xml, source));
      } catch (error) {
        warnings.push(`No se pudo descubrir ${source.label}: ${error instanceof Error ? error.message : 'error desconocido'}`);
      }
    }

    const payload = {
      author: 'laugis',
      generatedAt: new Date().toISOString(),
      counts: { layers: layers.length, datasets: new Set(layers.map((layer) => layer.dataset)).size },
      layers,
      tree: discoverGroupTree(layers),
      warnings,
    };
    discoveryCache.set(cacheKey, { expiresAt: Date.now() + DISCOVERY_TTL_MS, payload });
    return payload;
  });

  app.get('/catalog/dynamic', async (_request, reply) => {
    const local = await dynamicCatalog();
    if (local) return local;
    return reply.redirect('/catalog/discover');
  });

  app.get('/catalog/layers/:id/extent', async (request, reply) => {
    const { id } = request.params as { id: string };
    const layer = await app.prisma.layer.findUnique({ where: { id } });
    if (!layer) return reply.status(404).send({ error: 'Capa no encontrada.' });

    const cached = extentCache.get(id);
    if (cached) return cached;

    if (layer.provider === 'WFS' && layer.endpointUrl && layer.typename) {
      try {
        const proxy = new WfsProxyService();
        const capabilities = await proxy.getCapabilities({
          targetUrl: layer.endpointUrl,
          version: layer.version && layer.version !== 'auto' ? layer.version : '1.1.0',
        });
        const xml = typeof capabilities.data === 'string' ? capabilities.data : JSON.stringify(capabilities.data);
        const parsed = parseCapabilitiesBbox(xml, layer.typename);
        if (parsed) {
          const extent3857 = transformBbox(parsed.bbox, parsed.crs, 'EPSG:3857', { segmentsPerSide: 8 });
          const payload = { layerId: id, source: 'wfs-capabilities' as const, extent3857 };
          extentCache.set(id, payload);
          return payload;
        }
      } catch (error) {
        app.log.warn({ err: error, layerId: id }, 'No se pudo resolver extent WFS desde capabilities');
      }
    }

    const initialExtent = await app.prisma.appSetting.findUnique({ where: { key: 'initial_extent' } });
    const extent3857 = transformBbox(initialExtentFromSetting(initialExtent?.value), 'EPSG:4326', 'EPSG:3857', { segmentsPerSide: 8 });
    const payload = { layerId: id, source: 'fallback' as const, extent3857 };
    extentCache.set(id, payload);
    return payload;
  });

  app.get('/catalog/layers/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const layer = await app.prisma.layer.findUnique({
      where: { id },
      include: { group: true, connection: true, layerStyle: true },
    });

    if (!layer) return reply.status(404).send({ error: 'Capa no encontrada.' });
    return { author: 'laugis', layer };
  });
}
