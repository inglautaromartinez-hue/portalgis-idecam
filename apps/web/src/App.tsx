import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import Feature from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import LineString from 'ol/geom/LineString';
import type SimpleGeometry from 'ol/geom/SimpleGeometry';
import Draw from 'ol/interaction/Draw';
import Modify from 'ol/interaction/Modify';
import OlMap from 'ol/Map';
import { unByKey } from 'ol/Observable';
import View from 'ol/View';
import type { EventsKey } from 'ol/events';
import { register } from 'ol/proj/proj4';
import { toLonLat, transformExtent } from 'ol/proj';
import { getArea, getLength } from 'ol/sphere';
import proj4 from 'proj4';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import XYZ from 'ol/source/XYZ';
import TileWMS from 'ol/source/TileWMS';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import type { StyleLike } from 'ol/style/Style';
import { getCenter, type Extent } from 'ol/extent';
import {
  IRRIGATION_RIGHT_CATEGORIES,
  IRRIGATION_RIGHT_FIELDS,
  createIrrigationRightStyle,
  featureHasIrrigationRight,
  irrigationRightFromFeature,
  normalizeIrrigationRightValue,
} from './irrigationRightsStyle';
import {
  PORTAL_DISTRICTS_LAYER_ID,
  PORTAL_IGN_CARTA_LAYER_IDS,
  PORTAL_INITIAL_VISIBLE_LAYER_IDS,
  PORTAL_LAYER_OPACITY_OVERRIDES,
  PORTAL_MAX_WFS_CONCURRENCY,
  PORTAL_PARCEL_MIN_ZOOM,
  PORTAL_SERVICE_AREA_LAYER_IDS,
  PORTAL_THEME_STORAGE_KEY,
  PORTAL_VISUAL_SECTIONS,
  type ThemeMode,
} from './portalConfig';
import {
  queryCrossStatistics,
  queryStatistics,
  type CrossStatisticsQueryResponse,
  type SpatialOperation,
  type StatisticsQueryResponse,
  type StatisticsScope,
  type StatisticsStatus,
} from './statisticsService';
import { recommendedReportFields } from './reportFieldProfiles';
import { IRRIGATION_RIGHTS_PRESET_ID, THEMATIC_MAP_PRESETS, type ThematicMapPreset } from './thematicMaps';
import { choosePrimaryIdentifyCandidate } from './identifySelection';

const API_URL = String(import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '') || '/api';
const EPSG_22172 =
  '+proj=tmerc +lat_0=-90 +lon_0=-69 +k=1 +x_0=2500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs';
const INITIAL_EXTENT_4326: [number, number, number, number] = [
  -68.7336986444611,
  -33.17171881346962437,
  -68.55063425246132169,
  -33.01616626946952238,
];

type LayerStatus = 'apagada' | 'cargando' | 'cargada' | 'error' | 'sin-datos' | 'datos-parciales' | 'geometria-no-cargada';
type FilterOperator = 'contains' | 'equals';
type MeasureMode = 'distance' | 'area';
type DigitalizeMode = 'Point' | 'LineString' | 'Polygon';
type ToolPanel = 'dashboard' | 'print' | 'catalog' | null;
type DashboardMetric = 'count' | 'sum' | 'avg';
type StatisticsMode = 'simple' | 'cross';
type PrintTemplate = 'A4-landscape' | 'A4-portrait' | 'A3-landscape' | 'A3-portrait';

interface LayerFilter {
  field: string;
  operator: FilterOperator;
  value: string;
}

interface CatalogLayer {
  id: string;
  name: string;
  provider: string;
  typename: string | null;
  endpointUrl: string | null;
  effectiveSrs: string | null;
  visibleInitial: boolean;
  treeOrder: number;
  drawOrder: number;
  layerOpacity: number | null;
  geometry: string | null;
  wkbType?: string | null;
  style: QgisStyle | null;
  fields?: string[];
  wmsUrl?: string | null;
  wmsAvailable?: boolean;
  wfsAvailable?: boolean;
  dataset?: string | null;
  workspace?: string | null;
  group?: string | null;
  description?: string | null;
  dynamic?: boolean;
}

interface CatalogGroup {
  id: string;
  name: string;
  expanded?: boolean;
  treeOrder: number;
  groups?: TreeNode[];
  layers?: CatalogLayer[];
}

type TreeNode = CatalogGroup | CatalogLayer;

interface PortalGroupNode {
  id: string;
  name: string;
  expanded?: boolean;
  treeOrder: number;
  groups: PortalNode[];
  layers: CatalogLayer[];
}

type PortalNode = PortalGroupNode | CatalogLayer;

interface CatalogTreeResponse {
  author: 'laugis';
  counts: { groups: number; layers: number };
  tree: TreeNode[];
}

interface DynamicCatalogResponse {
  author: 'laugis';
  generatedAt: string;
  counts: { layers: number; datasets: number };
  layers: CatalogLayer[];
  warnings: string[];
}

type DynamicCatalogStatus = 'idle' | 'loading' | 'ready' | 'error';

interface QgisStyle {
  alpha?: number;
  symbol_type?: string;
  layers?: Array<{
    options?: Record<string, unknown>;
  }>;
}

interface IdentifyItem {
  id: string;
  layerName: string;
  attributes: Array<[string, string]>;
}

interface IdentifyPopup {
  x: number;
  y: number;
  items: IdentifyItem[];
  boundaryHit?: boolean;
}

interface LayerContextMenu {
  layerId: string;
  x: number;
  y: number;
}

interface LayerFilterPanel {
  layerId: string;
  x: number;
  y: number;
}

interface IrrigationContextMenu { category: string; x: number; y: number }

interface SearchResult {
  id: string;
  layerId: string;
  layerName: string;
  featureIndex: number;
  field: string;
  value: string;
}

interface MeasureLive {
  x: number;
  y: number;
  lines: string[];
}

interface DashboardState {
  layerId: string;
  categoryField: string;
  numericField: string;
  metric: DashboardMetric;
}

interface CrossDashboardState {
  targetLayerId: string;
  groupLayerId: string;
  spatialOperation: SpatialOperation;
  groupByField: string;
  metric: DashboardMetric;
  numericField: string;
  highlightGroup: string;
}

interface DashboardRow {
  label: string;
  count: number;
  metricValue: number;
  features: Feature[];
}

interface StatisticsPanelState {
  status: StatisticsStatus;
  source: 'visible' | 'local-snapshot' | 'wfs-proxy';
  scopeLabel: string;
  featureCount: number;
  updatedAt: string | null;
  partial: boolean;
  usedPropertyName: boolean;
  warnings: string[];
  error: string | null;
}

interface PrintSettings {
  template: PrintTemplate;
  reportBase: 'esri' | 'osm' | 'light';
  title: string;
  subtitle: string;
  author: string;
  useRecommendedFields: boolean;
  includeAllAttributes: boolean;
  includeMap: boolean;
  includeLegend: boolean;
  includeActiveLayers: boolean;
  includeAttributes: boolean;
  includeStatistics: boolean;
  includeMeasurements: boolean;
  includeCoordinates: boolean;
  includeNorth: boolean;
  includeScale: boolean;
  includeDate: boolean;
  includeSource: boolean;
  showArea: boolean;
}

const geoJson = new GeoJSON();
const irrigationRightStyle = createIrrigationRightStyle();
const PORTAL_CONTOUR_LAYER_ID = 'portal_extra_curvas_nivel_ign';
const IRRIGATION_PROVINCIAL_LAYER_ID = 'local_irrigation_parcels_provincial';
const GOOGLE_HYBRID_FALLBACK_URL = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
const ESRI_WORLD_IMAGERY_URL = 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const OSM_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const PORTAL_CONTOUR_EXTENT_4326: [number, number, number, number] = [
  -73.56659494799999,
  -55.049938201999964,
  -53.636592864999955,
  -21.780910491999975,
];
const PORTAL_CONTOUR_LAYER: CatalogLayer = {
  id: PORTAL_CONTOUR_LAYER_ID,
  name: 'Curvas hipsometricas IGN',
  provider: 'WFS',
  typename: 'ign:lineas_de_geomorfologia_CA010',
  endpointUrl: 'https://wms.ign.gob.ar/geoserver/ows',
  effectiveSrs: 'EPSG:4326',
  visibleInitial: false,
  treeOrder: 0,
  drawOrder: 34,
  layerOpacity: 0.85,
  geometry: 'Line',
  style: null,
};
const IRRIGATION_PROVINCIAL_LAYER: CatalogLayer = {
  id: IRRIGATION_PROVINCIAL_LAYER_ID,
  name: 'Parcelas con derecho de riego - Provincial',
  provider: 'WFS',
  typename: IRRIGATION_PROVINCIAL_LAYER_ID,
  endpointUrl: 'local-snapshot',
  effectiveSrs: 'EPSG:4326',
  visibleInitial: false,
  treeOrder: 0,
  drawOrder: 900,
  layerOpacity: 1,
  geometry: 'Polygon',
  style: null,
  fields: ['Nomenclatu', 'Padron_ren', 'Padron_mun', 'Departamen', 'DISTRITO', 'SUPERFICIE', 'Tipo_der_r', 'Concesion', 'Uso_riego', 'CC_PP_rieg'],
  wmsAvailable: false,
  dataset: 'Snapshots locales IDECAM',
  workspace: 'local',
  group: 'Parcelarios Municipales',
};
const FIELD_ALIASES: Record<string, string> = {
  CODIGO_DEP: 'Codigo de departamento',
  DEPARTAMEN: 'Departamento',
  Departamen: 'Departamento',
  cod_distri: 'Codigo de distrito',
  DISTRITO: 'Distrito',
  Distrito: 'Distrito',
  NOMENCLAT: 'Nomenclatura',
  nomenclatu: 'Nomenclatura',
  NOMENCLA: 'Nomenclatura',
  NOMENCLA_1: 'Nomenclatura',
  Nomenclatu: 'Nomenclatura',
  NOMEN: 'Nomenclatura',
  PADRON: 'Padron',
  Padron_ren: 'Padron rentas',
  Padron_mun: 'Padron municipal',
  SUP_EMP: 'Superficie empadronada',
  Sup_empad_: 'Superficie empadronada',
  SUPERFICIE: 'Superficie',
  SUPERFIC_1: 'Superficie segun titulo',
  AVALUO_TER: 'Avaluo terreno',
  AVALUO_MEJ: 'Avaluo mejoras',
  AVALUO_TOT: 'Avaluo total',
  CALLE: 'Calle',
  Calle: 'Calle',
  Puerta_nro: 'Numero de puerta',
  Folio_real: 'Folio real',
  Asiento: 'Asiento',
  Concesion: 'Concesion',
  concesion: 'Concesion',
  Tipo_der_r: 'Tipo de derecho de riego',
  tipo_der_r: 'Tipo de derecho de riego',
  Uso_riego: 'Uso de riego',
  uso_riego: 'Uso de riego',
  CC_PP_rieg: 'Codigo Cauce - Padron Parcial',
  cc_pp_rieg: 'Codigo Cauce - Padron Parcial',
  CC: 'Cauce',
  PG: 'Padron general',
  PP: 'Padron parcial',
  codcau: 'Codigo de cauce',
  cauce: 'Cauce',
  inspeccion: 'Inspeccion de cauce',
  long_m: 'Longitud (m)',
  Matricula_: 'Matricula',
  delegacion: 'Delegacion',
};
const LAYER_VISIBLE_FIELDS: Record<string, string[]> = {
  [PORTAL_DISTRICTS_LAYER_ID]: ['DISTRITO'],
};
const highlightStyle = new Style({
  fill: new Fill({ color: 'rgba(255, 214, 10, 0.24)' }),
  stroke: new Stroke({ color: '#f59f00', width: 4 }),
  image: new CircleStyle({
    radius: 7,
    fill: new Fill({ color: 'rgba(255, 214, 10, 0.85)' }),
    stroke: new Stroke({ color: '#7a4b00', width: 2 }),
  }),
});
const measureStyle = new Style({
  fill: new Fill({ color: 'rgba(26, 115, 232, 0.16)' }),
  stroke: new Stroke({ color: '#1a73e8', width: 3 }),
  image: new CircleStyle({
    radius: 5,
    fill: new Fill({ color: '#1a73e8' }),
    stroke: new Stroke({ color: '#ffffff', width: 2 }),
  }),
});
const digitalizeStyle = new Style({
  fill: new Fill({ color: 'rgba(16, 185, 129, 0.18)' }),
  stroke: new Stroke({ color: '#059669', width: 3 }),
  image: new CircleStyle({
    radius: 6,
    fill: new Fill({ color: '#059669' }),
    stroke: new Stroke({ color: '#ffffff', width: 2 }),
  }),
});

function isLayer(node: TreeNode | PortalNode): node is CatalogLayer {
  return 'provider' in node;
}

function sortedNodes<T extends { treeOrder?: number }>(nodes: T[] = []): T[] {
  return [...nodes].sort((a, b) => (a.treeOrder ?? 0) - (b.treeOrder ?? 0));
}

function flattenLayers(nodes: Array<TreeNode | PortalNode>): CatalogLayer[] {
  return nodes.flatMap((node) => {
    if (isLayer(node)) return [node];
    return [...flattenLayers(sortedNodes(node.groups)), ...sortedNodes(node.layers)];
  });
}

function flattenGroups(nodes: TreeNode[]): CatalogGroup[] {
  return nodes.flatMap((node) => {
    if (isLayer(node)) return [];
    return [node, ...flattenGroups(sortedNodes(node.groups))];
  });
}

function styleOptions(layer: CatalogLayer): Record<string, unknown> {
  return layer.style?.layers?.[0]?.options ?? {};
}

function parsedColor(options: Record<string, unknown>, key: string, fallback: string): string {
  const parsed = options[`${key}_parsed`];
  if (parsed && typeof parsed === 'object' && 'rgba' in parsed && typeof parsed.rgba === 'string') return parsed.rgba;
  if (parsed && typeof parsed === 'object' && 'hex' in parsed && typeof parsed.hex === 'string') return parsed.hex;
  return fallback;
}

function numericOption(options: Record<string, unknown>, key: string, fallback: number): number {
  const value = Number(options[key]);
  return Number.isFinite(value) ? value : fallback;
}

function isIgnCartaLayer(layer: CatalogLayer): boolean {
  return PORTAL_IGN_CARTA_LAYER_IDS.has(layer.id);
}

function isPortalParcelLayer(layer: CatalogLayer): boolean {
  return /parcela|parcelario/i.test(`${layer.name} ${layer.typename ?? ''}`);
}

function wmsUrlForLayer(layer: CatalogLayer): string | null {
  if (layer.id === IRRIGATION_PROVINCIAL_LAYER_ID || layer.endpointUrl === 'local-snapshot') return null;
  const raw = layer.wmsUrl || layer.endpointUrl;
  if (!raw || !layer.typename) return null;
  return raw.replace('/geoserver/wfs', '/geoserver/wms').replace(/\/wfs$/i, '/wms');
}

function canRenderAsWms(layer: CatalogLayer): boolean {
  return Boolean(layer.typename && wmsUrlForLayer(layer));
}

function reportLayerBaseUrl(layer: CatalogLayer): string {
  return layer.endpointUrl || ESRI_WORLD_IMAGERY_URL;
}

function dynamicCatalogLayer(layer: CatalogLayer, index: number): CatalogLayer {
  return {
    ...layer,
    id: layer.id || `dynamic_${index}_${layer.typename ?? layer.name}`.replace(/[^a-zA-Z0-9_-]+/g, '_'),
    name: layer.name || layer.typename || `Capa dinámica ${index + 1}`,
    provider: 'WFS',
    endpointUrl: layer.endpointUrl ?? null,
    effectiveSrs: layer.effectiveSrs ?? 'EPSG:4326',
    visibleInitial: false,
    treeOrder: 5000 + index,
    drawOrder: 5000 + index,
    layerOpacity: layer.layerOpacity ?? 0.75,
    geometry: layer.geometry ?? null,
    style: layer.style ?? null,
    fields: layer.fields ?? [],
    dynamic: true,
  };
}

function isServiceAreaLayer(layer: CatalogLayer): boolean {
  return PORTAL_SERVICE_AREA_LAYER_IDS.has(layer.id);
}

function withAlpha(color: string, alpha: number): string {
  const rgb = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (rgb) return `rgba(${rgb[1]},${rgb[2]},${rgb[3]},${alpha})`;

  const hex = color.match(/^#([0-9a-f]{6})$/i)?.[1];
  if (hex) {
    const r = Number.parseInt(hex.slice(0, 2), 16);
    const g = Number.parseInt(hex.slice(2, 4), 16);
    const b = Number.parseInt(hex.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  return `rgba(42,127,186,${alpha})`;
}

function opaqueColor(color: string): string {
  return withAlpha(color, 1);
}

function visualFillOpacity(layer: CatalogLayer): number {
  if (layer.id === PORTAL_DISTRICTS_LAYER_ID) return 0.05;
  if (isPortalParcelLayer(layer)) return 0.3;
  if (isServiceAreaLayer(layer)) return 0.4;
  if (isIgnCartaLayer(layer)) return 0.1;
  return layerOpacity(layer);
}

function isIrrigationPresetLayer(layer: CatalogLayer): boolean {
  return isPortalParcelLayer(layer) && layerHasIrrigationRightFields(layer);
}

function isIrrigationRightsLayer(layer: CatalogLayer): boolean {
  return layerHasIrrigationRightFields(layer);
}

function preferredIrrigationStatsLayer(layers: CatalogLayer[]): CatalogLayer | undefined {
  return layers.find((layer) => layer.id === IRRIGATION_PROVINCIAL_LAYER_ID) ?? layers.find((layer) => /maipu/i.test(layer.name)) ?? layers.find(isIrrigationRightsLayer);
}

function layerHasIrrigationRightFields(layer: CatalogLayer): boolean {
  const fields = new Set(catalogFieldsForLayer(layer).map((field) => field.toLocaleLowerCase()));
  return IRRIGATION_RIGHT_FIELDS.some((field) => fields.has(field.toLocaleLowerCase()));
}

function makeStyle(layer: CatalogLayer, useIrrigationStyle = false): StyleLike {
  if (useIrrigationStyle) return irrigationRightStyle;

  if (/^Red de Riego$/i.test(layer.name)) return new Style({ stroke: new Stroke({ color: '#18a6d9', width: 2.2 }) });

  if (layer.id === PORTAL_CONTOUR_LAYER_ID) {
    return new Style({ stroke: new Stroke({ color: '#a35f26', width: 1.6 }) });
  }

  const options = styleOptions(layer);
  const rawFill = parsedColor(options, 'color', 'rgba(42,127,186,0.28)');
  const rawStroke = parsedColor(options, 'outline_color', parsedColor(options, 'line_color', 'rgba(18,42,62,0.9)'));
  const rawLine = parsedColor(options, 'line_color', rawStroke);
  const fill = withAlpha(rawFill, visualFillOpacity(layer));
  const stroke = opaqueColor(rawStroke);
  const line = opaqueColor(rawLine);
  const baseWidth = Math.max(1, Math.min(6, numericOption(options, 'line_width', numericOption(options, 'outline_width', 1.5))));
  const width = isIgnCartaLayer(layer) ? Math.max(2.5, baseWidth) : baseWidth;
  const radius = Math.max(3, Math.min(8, numericOption(options, 'size', 4)));

  if (layer.id === PORTAL_DISTRICTS_LAYER_ID) {
    return new Style({
      fill: new Fill({ color: 'rgba(229,57,53,0.05)' }),
      stroke: new Stroke({ color: '#e53935', width: 1.8 }),
    });
  }

  if (layer.geometry === 'Point') {
    return new Style({
      image: new CircleStyle({
        radius,
        fill: new Fill({ color: fill }),
        stroke: new Stroke({ color: stroke, width: 1.2 }),
      }),
    });
  }

  if (layer.geometry === 'Line') {
    return new Style({ stroke: new Stroke({ color: line, width }) });
  }

  return new Style({
    fill: new Fill({ color: fill }),
    stroke: new Stroke({ color: isPortalParcelLayer(layer) || isServiceAreaLayer(layer) ? '#111111' : stroke, width }),
  });
}

function layerOpacity(layer: CatalogLayer): number {
  const override = PORTAL_LAYER_OPACITY_OVERRIDES.get(layer.id);
  if (override !== undefined) return override;
  if (isPortalParcelLayer(layer)) return 0.3;

  const explicit = Number(layer.layerOpacity);
  const styleAlpha = Number(layer.style?.alpha);
  const opacity = Number.isFinite(explicit) ? explicit : Number.isFinite(styleAlpha) ? styleAlpha : 1;
  return Math.max(0, Math.min(1, opacity));
}

function buildPortalTree(nodes: TreeNode[]): PortalNode[] {
  const layers = flattenLayers(nodes);
  const layerById = new Map(layers.map((layer) => [layer.id, layer]));
  const groupById = new Map(flattenGroups(nodes).map((group) => [group.id, group]));
  const usedLayerIds = new Set<string>();

  const sections = PORTAL_VISUAL_SECTIONS.map((section, index): PortalGroupNode | null => {
    const sectionLayers = section.layerIds?.map((id) => layerById.get(id)).filter((layer): layer is CatalogLayer => Boolean(layer)) ?? [];
    const sourceGroup = section.groupId ? groupById.get(section.groupId) : undefined;
    const groupLayers = sourceGroup ? flattenLayers([sourceGroup]) : [];
    const allLayers = [...sectionLayers, ...groupLayers].filter((layer) => {
      if (usedLayerIds.has(layer.id)) return false;
      usedLayerIds.add(layer.id);
      return true;
    });

    if (!allLayers.length) return null;

    return {
      id: section.id,
      name: section.title,
      expanded: true,
      treeOrder: index,
      groups: [],
      layers: sortedNodes(allLayers),
    };
  }).filter((node): node is PortalGroupNode => Boolean(node));

  const reliefGroup: PortalGroupNode = {
    id: 'portal_relieve_altimetria',
    name: 'Relieve / Altimetría',
    expanded: true,
    treeOrder: sections.length,
    groups: [],
    layers: [PORTAL_CONTOUR_LAYER],
  };

  const leftovers = layers
    .filter((layer) => !usedLayerIds.has(layer.id))
    .map((layer, index) => ({ ...layer, treeOrder: PORTAL_VISUAL_SECTIONS.length + 1 + index }));

  return [...sections, reliefGroup, ...leftovers];
}

function initialVisibleIds(layers: CatalogLayer[]): Set<string> {
  return new Set(layers.filter((layer) => PORTAL_INITIAL_VISIBLE_LAYER_IDS.has(layer.id)).map((layer) => layer.id));
}

function approximateBboxKey(bbox: number[]): string {
  return bbox.map((value) => Math.round(value / 250) * 250).join(',');
}

function visibleLayerIdsForNode(node: PortalNode): string[] {
  return flattenLayers([node]).map((layer) => layer.id);
}

function isParcelLayer(layerName: string): boolean {
  return /parcela/i.test(layerName);
}

function statusLabel(layer: CatalogLayer, status: LayerStatus): string {
  if (status === 'cargando' && isPortalParcelLayer(layer)) return 'cargando parcelas...';
  if (status === 'sin-datos') return 'sin datos';
  if (status === 'datos-parciales') return 'datos parciales';
  if (status === 'geometria-no-cargada') return 'geometria no cargada';
  return status;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function featureAttributes(feature: Feature): Array<[string, string]> {
  return Object.entries(feature.getProperties())
    .filter(([key, value]) => key !== 'geometry' && value !== null && value !== undefined && String(value).trim() !== '')
    .map(([key, value]) => [key, formatValue(value)]);
}

export function getFieldLabel(fieldName: string): string {
  const direct = FIELD_ALIASES[fieldName] ?? FIELD_ALIASES[fieldName.toUpperCase()];
  if (direct) return direct;

  const cleaned = fieldName
    .replace(/_+\d+$/g, '')
    .replace(/_+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase();

  if (!cleaned) return fieldName;
  return cleaned.replace(/\b\p{L}/gu, (letter) => letter.toLocaleUpperCase());
}

function isInternalField(fieldName: string): boolean {
  return /^(fid|fid_\d+|gid|id|objectid|ogc_fid)$/i.test(fieldName) || /geometry/i.test(fieldName);
}

function usefulFields(fields: string[]): string[] {
  const visible = fields.filter((field) => !isInternalField(field));
  return visible.length ? visible : fields;
}

function visibleFieldsForLayer(layer: CatalogLayer, features: Feature[]): string[] {
  const fields = fieldsForFeatures(features);
  const configured = LAYER_VISIBLE_FIELDS[layer.id]?.filter((field) => fields.includes(field));
  if (configured?.length) return configured;

  if (isPortalParcelLayer(layer)) {
    const preferred = [
      /^Nomenclatu|^nomenclatu|^NOMENCLAT$/i,
      /^Padron_ren$|padron.*renta/i,
      /^Padron_mun$|padron.*mun/i,
      /^Departamen$|^DEPARTAMEN$/i,
      /^Distrito$|^DISTRITO$/i,
      /^Sup_empad_$|^SUPERFICIE$/i,
      /^Tipo_der_r$|^Concesion$/i,
      /^Uso_riego$/i,
      /^CC_PP_rieg$/i,
    ].map((pattern) => fields.find((field) => pattern.test(field))).filter((field): field is string => Boolean(field));
    return preferred.length ? [...new Set(preferred)] : usefulFields(fields).slice(0, 9);
  }

  return usefulFields(fields).slice(0, 10);
}

function displayAttributeForResult(layer: CatalogLayer, feature: Feature, query: string): [string, string] {
  const fields = visibleFieldsForLayer(layer, [feature]);
  for (const field of fields) {
    const value = formatValue(feature.get(field));
    if (value) return [field, value];
  }
  return primaryAttribute(feature, query);
}

function featureMatchesFilter(feature: Feature, filter?: LayerFilter): boolean {
  if (!filter?.field || !filter.value.trim()) return true;
  const raw = feature.get(filter.field);
  if (raw === null || raw === undefined) return false;
  const actual = String(raw).toLocaleLowerCase();
  const expected = filter.value.trim().toLocaleLowerCase();
  return filter.operator === 'equals' ? actual === expected : actual.includes(expected);
}

function fieldsForFeatures(features: Feature[]): string[] {
  const fields = new Set<string>();
  for (const feature of features) {
    for (const [key, value] of Object.entries(feature.getProperties())) {
      if (key !== 'geometry' && value !== null && value !== undefined && String(value).trim() !== '') fields.add(key);
    }
  }
  return [...fields].sort((a, b) => a.localeCompare(b));
}

function catalogFieldsForLayer(layer?: CatalogLayer): string[] {
  return Array.isArray(layer?.fields) ? layer.fields.filter((field) => typeof field === 'string') : [];
}

function geometryLabel(layer?: CatalogLayer): string {
  const raw = `${layer?.geometry ?? ''} ${layer?.wkbType ?? ''}`.toLocaleLowerCase();
  if (/point/.test(raw)) return 'punto';
  if (/line/.test(raw)) return 'linea';
  if (/polygon/.test(raw)) return 'poligono';
  return 'sin geometria';
}

function statisticsLayerLabel(layer: CatalogLayer): string {
  return `${layer.name} - ${geometryLabel(layer)}`;
}

function isPolygonLayer(layer: CatalogLayer): boolean {
  return geometryLabel(layer) === 'poligono';
}

function findLayerByName(layers: CatalogLayer[], pattern: RegExp): CatalogLayer | undefined {
  return layers.find((layer) => pattern.test(layer.name));
}

function crossCompatibilityWarning(target: CatalogLayer | undefined, group: CatalogLayer | undefined, operation: SpatialOperation): string | null {
  if (!target || !group) return null;
  const targetGeom = geometryLabel(target);
  const groupGeom = geometryLabel(group);
  if (targetGeom === 'punto' && groupGeom === 'poligono' && operation !== 'within') {
    return 'Para puntos por poligono se recomienda usar operacion Dentro de.';
  }
  if (targetGeom === 'poligono' && groupGeom === 'poligono' && operation !== 'intersects') {
    return 'Para poligono por poligono se recomienda usar operacion Intersecta.';
  }
  if (targetGeom === 'punto' && groupGeom === 'punto') {
    return 'Punto + punto no es un cruce recomendado. Use una capa poligonal como Distritos de Mendoza para agrupar.';
  }
  if (groupGeom !== 'poligono') {
    return 'La capa de agrupamiento deberia ser poligonal. Para VESEP/PH por distrito use Distritos de Mendoza.';
  }
  return null;
}

function fieldsForLayerOrFeatures(layer: CatalogLayer | undefined, features: Feature[]): string[] {
  const catalogFields = catalogFieldsForLayer(layer);
  return catalogFields.length ? catalogFields : fieldsForFeatures(features);
}

function categoricalFieldsForLayer(layer: CatalogLayer | undefined, features: Feature[]): string[] {
  const fields = fieldsForLayerOrFeatures(layer, features);
  const sample = features.slice(0, 80);
  if (!sample.length) {
    const useful = fields.filter((field) => !isInternalField(field) && /depart|distrit|tipo|conces|uso|estado|categoria|nombre|zona|clase|objeto|anio/i.test(field));
    return useful.length ? useful : fields.filter((field) => !isInternalField(field) && !/nomen|padron|superfic|avaluo|lat|long|codigo|^id$/i.test(field)).slice(0, 20);
  }
  return fields.filter((field) => {
    if (isInternalField(field)) return false;
    return sample.some((feature) => Number.isNaN(Number(feature.get(field))));
  });
}

function numericFieldsForLayer(layer: CatalogLayer | undefined, features: Feature[]): string[] {
  const fields = fieldsForLayerOrFeatures(layer, features);
  const sample = features.slice(0, 80);
  return fields.filter((field) => {
    if (isInternalField(field)) return false;
    if (!sample.length) return /sup|superfic|avaluo|area|long|m2|ha/i.test(field);
    return sample.some((feature) => {
      const value = Number(String(feature.get(field) ?? '').replace(',', '.'));
      return Number.isFinite(value) && value !== 0;
    });
  });
}

function searchableAttributes(feature: Feature): Array<[string, string]> {
  return featureAttributes(feature).filter(
    ([key, value]) => /riego|cc_pp|cauce|derecho|concesion|distrito|depart/i.test(key) || Number.isNaN(Number(value)) || /[a-z]/i.test(value),
  );
}

function primaryAttribute(feature: Feature, query = ''): [string, string] {
  const attributes = featureAttributes(feature);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const matching = attributes.find(([, value]) => normalizedQuery && value.toLocaleLowerCase().includes(normalizedQuery));
  if (matching) return matching;

  return (
    attributes.find(([key]) => /nomen|nomenclatura|padron|parcela|depart|distrito|concesion|tipo_der|nombre|name/i.test(key)) ??
    attributes[0] ?? ['feature', 'Sin atributos']
  );
}

function isUsableExtent(extent: Extent | null | undefined): extent is Extent {
  return Boolean(extent?.every(Number.isFinite) && extent[0] <= extent[2] && extent[1] <= extent[3]);
}

function formatMeasure(value: number, mode: MeasureMode): string {
  if (mode === 'distance') return value >= 1000 ? `${(value / 1000).toFixed(2)} km` : `${value.toFixed(1)} m`;
  return value >= 10000 ? `${(value / 10000).toFixed(2)} ha` : `${value.toFixed(1)} m²`;
}

function formatCoordinate3857(coordinate?: number[]): string {
  if (!coordinate) return '-';
  const [lon, lat] = toLonLat(coordinate);
  return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
}

function segmentLength(coords: number[][]): number {
  if (coords.length < 2) return 0;
  return getLength(new LineString(coords.slice(-2)));
}

function measureLiveLines(mode: MeasureMode, geometry: SimpleGeometry, coordinate?: number[]): string[] {
  if (mode === 'distance') {
    const coords = geometry.getCoordinates() as number[][];
    return [
      `Coord: ${formatCoordinate3857(coordinate ?? coords.at(-1))}`,
      `Tramo actual: ${formatMeasure(segmentLength(coords), 'distance')}`,
      `Total: ${formatMeasure(getLength(geometry), 'distance')}`,
      `Vertices: ${Math.max(0, coords.length)}`,
    ];
  }

  const rings = geometry.getCoordinates() as number[][][];
  const ring = rings[0] ?? [];
  return [
    `Coord: ${formatCoordinate3857(coordinate ?? ring.at(-1))}`,
    `Area parcial: ${formatMeasure(getArea(geometry), 'area')}`,
    `Perimetro parcial: ${formatMeasure(getLength(new LineString(ring)), 'distance')}`,
    `Vertices: ${Math.max(0, ring.length - 1)}`,
  ];
}

function finalMeasureText(mode: MeasureMode, geometry: SimpleGeometry): string {
  if (mode === 'distance') return `Total ${formatMeasure(getLength(geometry), 'distance')}`;
  const ring = ((geometry.getCoordinates() as number[][][])[0] ?? []) as number[][];
  return `Area ${formatMeasure(getArea(geometry), 'area')} - Perimetro ${formatMeasure(getLength(new LineString(ring)), 'distance')}`;
}

function categoryValue(feature: Feature, field: string): string {
  if (field === '__irrigation_right__') return irrigationRightFromFeature(feature) ?? 'Sin dato';
  const raw = feature.get(field);
  const normalized = /concesion|tipo_der|derecho/i.test(field) ? normalizeIrrigationRightValue(raw) : null;
  const fallback = formatValue(raw);
  return normalized ?? (fallback || 'Sin dato');
}

function numericValue(feature: Feature, field: string): number {
  if (!field) return 1;
  const value = Number(String(feature.get(field) ?? '').replace(',', '.'));
  return Number.isFinite(value) ? value : 0;
}

function formatNumber(value: number, digits = 0): string {
  return new Intl.NumberFormat('es-AR', { maximumFractionDigits: digits }).format(value);
}

function formatMetricValue(value: number, metric: DashboardMetric, numericField: string): string {
  if (metric === 'count' || !numericField) return formatNumber(value);
  const digits = Math.abs(value) >= 100 ? 0 : 2;
  return formatNumber(value, digits);
}

function defaultPrintSettings(): PrintSettings {
  return {
    template: 'A4-landscape',
    reportBase: 'esri',
    title: 'PortalGIS IDECAM',
    subtitle: 'Informe tecnico cartografico',
    author: 'IDECAM / Colegio de Agrimensura de Mendoza',
    useRecommendedFields: true,
    includeAllAttributes: false,
    includeMap: true,
    includeLegend: true,
    includeActiveLayers: true,
    includeAttributes: true,
    includeStatistics: true,
    includeMeasurements: true,
    includeCoordinates: true,
    includeNorth: true,
    includeScale: true,
    includeDate: true,
    includeSource: true,
    showArea: true,
  };
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function tableHtml(headers: string[], rows: string[][]): string {
  if (!rows.length) return '<p class="muted">Sin datos para este bloque.</p>';
  return `<table><thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead><tbody>${rows
    .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`)
    .join('')}</tbody></table>`;
}

function coordinatePairs(node: unknown, pairs: number[][] = []): number[][] {
  if (!Array.isArray(node)) return pairs;
  if (typeof node[0] === 'number' && typeof node[1] === 'number') {
    pairs.push([node[0], node[1]]);
    return pairs;
  }
  for (const child of node) coordinatePairs(child, pairs);
  return pairs;
}

function fieldsForReport(layer: CatalogLayer, features: Feature[], settings: PrintSettings): string[] {
  const fields = fieldsForFeatures(features);
  if (settings.includeAllAttributes) return usefulFields(fields);
  if (!settings.useRecommendedFields) return visibleFieldsForLayer(layer, features);
  return recommendedReportFields(layer.name, fields);
}

function featureTableHtml(layer: CatalogLayer, features: Feature[], fields: string[], limit = 50): string {
  const rows = features.slice(0, limit).map((feature, index) => [
    String(index + 1),
    ...fields.map((field) => formatValue(feature.get(field))),
  ]);
  const note = features.length > limit ? `<p class="muted">Se muestran las primeras ${limit} entidades de ${features.length}.</p>` : '';
  return `${tableHtml(['N', ...fields.map(getFieldLabel)], rows)}${note}`;
}

function identifiedHtml(items: IdentifyItem[], layers: CatalogLayer[], settings: PrintSettings): string {
  if (!items.length) return '<p class="muted">Sin entidades identificadas.</p>';
  return items
    .map((item) => {
      const layer = layers.find((candidate) => candidate.name === item.layerName);
      const fields = settings.includeAllAttributes
        ? item.attributes.map(([field]) => field).filter((field) => !isInternalField(field))
        : recommendedReportFields(item.layerName, item.attributes.map(([field]) => field));
      const selected = fields.length ? item.attributes.filter(([field]) => fields.includes(field)) : item.attributes.filter(([field]) => !isInternalField(field)).slice(0, 8);
      const rows = selected.map(([field, value]) => [getFieldLabel(field), value]);
      return `<article class="entity-card"><h3>${escapeHtml(layer?.name ?? item.layerName)}</h3>${tableHtml(['Campo', 'Valor'], rows)}</article>`;
    })
    .join('');
}

function parcelReportFieldNames(layer: CatalogLayer, features: Feature[], settings: PrintSettings): string[] {
  if (settings.includeAllAttributes) return usefulFields(fieldsForFeatures(features));
  const available = fieldsForFeatures(features);
  const preferred = [
    'Nomenclatu', 'nomenclatu', 'NOMENCLAT', 'NOMENCLA', 'Nomenclatura',
    'Padron_ren', 'PADRON', 'Padron rentas',
    'Padron_mun', 'SUPERFICIE', 'SUPERFIC_1', 'Sup_empad_',
    'DEPARTAMEN', 'Departamen', 'DISTRITO', 'Distrito',
    'Tipo_der_r', 'Concesion', 'Uso_riego', 'CC_PP_rieg',
  ];
  const fields = preferred.filter((field) => available.includes(field));
  return fields.length ? [...new Set(fields)] : fieldsForReport(layer, features, settings).slice(0, 8);
}

function intersectedFeaturesHtml(layers: CatalogLayer[], loaded: Record<string, Feature[]>, areaGeometry: SimpleGeometry | null, fallbackExtent: Extent | null, settings: PrintSettings): string {
  if (!areaGeometry && !fallbackExtent) return '<p class="muted">Dibuje un poligono de medicion/digitalizacion o use el area imprimible para listar entidades intersectadas.</p>';
  const sections: string[] = [];
  const areaExtent = areaGeometry?.getExtent() ?? fallbackExtent;
  if (!areaExtent) return '<p class="muted">No se pudo resolver el area de analisis.</p>';
  const polygonMode = Boolean(areaGeometry && areaGeometry.getType() === 'Polygon');
  const candidateLayers = polygonMode ? layers.filter((layer) => isPortalParcelLayer(layer) || isParcelLayer(layer.name)) : layers;

  for (const layer of candidateLayers) {
    if (layer.provider !== 'WFS' || layer.name === 'Google Satellite Hybrid') continue;
    const features = (loaded[layer.id] ?? []).filter((feature) => feature.getGeometry()?.intersectsExtent(areaExtent));
    if (!features.length) continue;
    if (polygonMode && !(isPortalParcelLayer(layer) || isParcelLayer(layer.name))) continue;

    const fields = isPortalParcelLayer(layer) || isParcelLayer(layer.name)
      ? parcelReportFieldNames(layer, features, settings)
      : fieldsForReport(layer, features, settings);
    const title = polygonMode && (isPortalParcelLayer(layer) || isParcelLayer(layer.name))
      ? 'Parcelas que intersectan el poligono dibujado'
      : layer.name;
    sections.push(`<article class="entity-card"><h3>${escapeHtml(title)} - ${escapeHtml(layer.name)}</h3>${featureTableHtml(layer, features, fields, 300)}</article>`);
  }

  if (!sections.length) {
    return polygonMode
      ? '<p class="muted">Sin parcelas de snapshots locales que intersecten el poligono dibujado.</p>'
      : '<p class="muted">Sin entidades cargadas intersectando el area actual.</p>';
  }

  const scope = polygonMode
    ? 'Criterio espacial: parcelas que intersectan el poligono dibujado por el usuario. Consulta exacta sobre snapshots locales sincronizados.'
    : 'Entidades calculadas sobre datos cargados en el visor; no se consulta toda Mendoza.';
  return `<p class="muted">${escapeHtml(scope)}</p>${sections.join('')}`;
}

function vertexRows(coordinates: number[][]): string[][] {
  return coordinates.map((coordinate, index) => {
    const [lon, lat] = toLonLat(coordinate);
    return [String(index + 1), lon.toFixed(6), lat.toFixed(6), coordinate[0].toFixed(2), coordinate[1].toFixed(2)];
  });
}

function measurementReportHtml(features: Feature[]): string {
  if (!features.length) return '<p class="muted">Sin mediciones dibujadas.</p>';
  return features.map((feature, index) => {
    const geometry = feature.getGeometry() as SimpleGeometry | undefined;
    const type = geometry?.getType() ?? 'Sin geometria';
    if (!geometry) return `<article class="entity-card"><h3>Medicion ${index + 1}</h3><p class="muted">Sin geometria.</p></article>`;
    if (type === 'Polygon') {
      const ring = ((geometry.getCoordinates() as number[][][])[0] ?? []) as number[][];
      const closed = ring.length > 1 && ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1];
      const area = getArea(geometry);
      const perimeter = getLength(new LineString(ring));
      const summary = [
        ['Tipo', 'Poligono'],
        ['Area m2', area.toFixed(2)],
        ['Area ha', (area / 10_000).toFixed(4)],
        ['Perimetro m', perimeter.toFixed(2)],
        ['Perimetro km', (perimeter / 1000).toFixed(3)],
        ['Vertices reales', String(closed ? Math.max(0, ring.length - 1) : ring.length)],
        ['Cierre', closed ? 'El ultimo vertice repite el primero para cerrar el poligono.' : 'Poligono sin vertice de cierre repetido.'],
      ];
      return `<article class="entity-card"><h3>Medicion ${index + 1}</h3>${tableHtml(['Dato', 'Valor'], summary)}${tableHtml(['Vertice', 'Longitud', 'Latitud', 'X EPSG:3857', 'Y EPSG:3857'], vertexRows(ring))}</article>`;
    }
    if (type === 'LineString') {
      const coordinates = geometry.getCoordinates() as number[][];
      const length = getLength(geometry);
      const summary = [
        ['Tipo', 'Linea'],
        ['Longitud m', length.toFixed(2)],
        ['Longitud km', (length / 1000).toFixed(3)],
        ['Vertices', String(coordinates.length)],
      ];
      return `<article class="entity-card"><h3>Medicion ${index + 1}</h3>${tableHtml(['Dato', 'Valor'], summary)}${tableHtml(['Vertice', 'Longitud', 'Latitud', 'X EPSG:3857', 'Y EPSG:3857'], vertexRows(coordinates))}</article>`;
    }
    return `<article class="entity-card"><h3>Medicion ${index + 1}</h3><p class="muted">Tipo no soportado en informe: ${escapeHtml(type)}.</p></article>`;
  }).join('');
}

function captureMapCanvas(map: OlMap | null): string | null {
  const viewport = map?.getViewport();
  const canvases = viewport ? Array.from(viewport.querySelectorAll<HTMLCanvasElement>('canvas')) : [];
  const size = map?.getSize();
  if (!viewport || !size || !canvases.length) return null;
  try {
    map?.renderSync();
    const output = document.createElement('canvas');
    output.width = size[0];
    output.height = size[1];
    const context = output.getContext('2d');
    if (!context) return null;
    for (const canvas of canvases) {
      if (!canvas.width || !canvas.height) continue;
      const opacity = Number(canvas.parentElement?.style.opacity || canvas.style.opacity || 1);
      context.globalAlpha = Number.isFinite(opacity) ? opacity : 1;
      const transform = canvas.style.transform;
      if (transform?.startsWith('matrix(')) {
        const matrix = transform.slice(7, -1).split(',').map(Number);
        context.setTransform(matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5]);
      } else {
        context.setTransform(1, 0, 0, 1, 0, 0);
      }
      context.drawImage(canvas, 0, 0);
    }
    return output.toDataURL('image/png');
  } catch {
    return null;
  }
}


function mergeFeaturePreview(current: Feature[], incoming: Feature[], limit = 500): Feature[] {
  const seen = new Set<string>();
  const merged: Feature[] = [];
  for (const feature of [...incoming, ...current]) {
    const id = String(feature.getId() ?? feature.get('fid') ?? feature.get('id') ?? JSON.stringify(feature.getGeometry()?.getExtent() ?? []));
    if (seen.has(id)) continue;
    seen.add(id);
    merged.push(feature.clone());
    if (merged.length >= limit) break;
  }
  return merged;
}

function irrigationRightsCqlFilter(): string {
  return "Tipo_der_r IS NOT NULL AND Tipo_der_r <> ''";
}

function readInitialTheme(): ThemeMode {
  return localStorage.getItem(PORTAL_THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
}

export function App() {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<OlMap | null>(null);
  const baseLayerRef = useRef<TileLayer<XYZ> | null>(null);
  const wmsLayersRef = useRef<Record<string, TileLayer<TileWMS>>>({});
  const digitalizeLayerRef = useRef<VectorLayer<VectorSource<Feature>> | null>(null);
  const modifyRef = useRef<Modify | null>(null);
  const highlightLayerRef = useRef<VectorLayer<VectorSource<Feature>> | null>(null);
  const measureLayerRef = useRef<VectorLayer<VectorSource<Feature>> | null>(null);
  const drawRef = useRef<Draw | null>(null);
  const vectorLayersRef = useRef<Record<string, VectorLayer<VectorSource<Feature>>>>({});
  const layersByIdRef = useRef<Map<string, CatalogLayer>>(new Map());
  const visibleIdsRef = useRef<Set<string>>(new Set());
  const activePresetIdRef = useRef<string | null>(null);
  const irrigationLayerIdsRef = useRef<Set<string>>(new Set());
  const irrigationCategoryFilterRef = useRef<string | null>(null);
  const hiddenIrrigationCategoriesRef = useRef<Set<string>>(new Set());
  const measureModeRef = useRef<MeasureMode | null>(null);
  const digitalizeModeRef = useRef<DigitalizeMode | null>(null);
  const editVerticesRef = useRef(false);
  const requestSeqRef = useRef<Record<string, number>>({});
  const abortRef = useRef<Record<string, AbortController>>({});
  const cacheRef = useRef<Map<string, Feature[]>>(new Map());
  const loadedFeaturesRef = useRef<Record<string, Feature[]>>({});
  const filtersRef = useRef<Record<string, LayerFilter>>({});
  const loadQueueRef = useRef<CatalogLayer[]>([]);
  const activeLoadCountRef = useRef(0);
  const measuringRef = useRef(false);
  const statisticsSeqRef = useRef(0);
  const crossStatisticsSeqRef = useRef(0);

  const [catalog, setCatalog] = useState<CatalogTreeResponse | null>(null);
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());
  const [statuses, setStatuses] = useState<Record<string, LayerStatus>>({});
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeMode>(readInitialTheme);
  const [identifyPopup, setIdentifyPopup] = useState<IdentifyPopup | null>(null);
  const [identifiedFeatures, setIdentifiedFeatures] = useState<Feature[]>([]);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [contextMenu, setContextMenu] = useState<LayerContextMenu | null>(null);
  const [filterPanel, setFilterPanel] = useState<LayerFilterPanel | null>(null);
  const [filters, setFilters] = useState<Record<string, LayerFilter>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [attributeTableLayerId, setAttributeTableLayerId] = useState<string | null>(null);
  const [attributeTableOverride, setAttributeTableOverride] = useState<Feature[] | null>(null);
  const [attributeTableTotal, setAttributeTableTotal] = useState<number | null>(null);
  const [tableQuery, setTableQuery] = useState('');
  const [measureMode, setMeasureMode] = useState<MeasureMode | null>(null);
  const [measureResult, setMeasureResult] = useState('');
  const [measureLive, setMeasureLive] = useState<MeasureLive | null>(null);
  const [mapRevision, setMapRevision] = useState(0);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [presetModified, setPresetModified] = useState(false);
  const [toolPanel, setToolPanel] = useState<ToolPanel>(null);
  const [statisticsMode, setStatisticsMode] = useState<StatisticsMode>('simple');
  const [statisticsScope, setStatisticsScope] = useState<StatisticsScope>('global');
  const [dashboard, setDashboard] = useState<DashboardState>({ layerId: '', categoryField: '', numericField: '', metric: 'count' });
  const [crossDashboard, setCrossDashboard] = useState<CrossDashboardState>({
    targetLayerId: '',
    groupLayerId: '',
    spatialOperation: 'within',
    groupByField: 'DISTRITO',
    metric: 'count',
    numericField: '',
    highlightGroup: 'CAPITAL',
  });
  const [statisticsResult, setStatisticsResult] = useState<StatisticsQueryResponse | null>(null);
  const [crossStatisticsResult, setCrossStatisticsResult] = useState<CrossStatisticsQueryResponse | null>(null);
  const [statisticsState, setStatisticsState] = useState<StatisticsPanelState>({
    status: 'idle',
    source: 'local-snapshot',
    scopeLabel: 'Global - toda la capa',
    featureCount: 0,
    updatedAt: null,
    partial: false,
    usedPropertyName: false,
    warnings: [],
    error: null,
  });
  const [printSettings, setPrintSettings] = useState<PrintSettings>(defaultPrintSettings);
  const [printReportHtml, setPrintReportHtml] = useState<string | null>(null);
  const [printMessage, setPrintMessage] = useState<string | null>(null);
  const [dynamicLayers, setDynamicLayers] = useState<CatalogLayer[]>([]);
  const [dynamicCatalog, setDynamicCatalog] = useState<CatalogLayer[]>([]);
  const [dynamicCatalogStatus, setDynamicCatalogStatus] = useState<DynamicCatalogStatus>('idle');
  const [dynamicCatalogError, setDynamicCatalogError] = useState<string | null>(null);
  const [dynamicCatalogQuery, setDynamicCatalogQuery] = useState('');
  const [irrigationCategoryFilter, setIrrigationCategoryFilter] = useState<string | null>(null);
  const [hiddenIrrigationCategories, setHiddenIrrigationCategories] = useState<Set<string>>(new Set());
  const [irrigationStatistics, setIrrigationStatistics] = useState<StatisticsQueryResponse | null>(null);
  const [irrigationContextMenu, setIrrigationContextMenu] = useState<IrrigationContextMenu | null>(null);
  const [digitalizeMode, setDigitalizeMode] = useState<DigitalizeMode | null>(null);
  const [editVertices, setEditVertices] = useState(false);
  const [digitalizeResult, setDigitalizeResult] = useState('');
  const statisticsViewportRevision = statisticsScope === 'area' ? mapRevision : 0;

  const basePortalTree = useMemo(() => buildPortalTree(catalog?.tree ?? []), [catalog]);
  const portalTree = useMemo<PortalNode[]>(() => {
    const core: PortalNode[] = [
      ...basePortalTree,
      { id: 'local_provincial_consolidated', name: 'Consolidados provinciales', expanded: true, treeOrder: 9000, groups: [], layers: [IRRIGATION_PROVINCIAL_LAYER] },
    ];
    if (!dynamicLayers.length) return core;
    return [
      ...core,
      {
        id: 'session_dynamic_layers',
        name: 'Capas agregadas en sesión',
        expanded: true,
        treeOrder: 9999,
        groups: [],
        layers: dynamicLayers,
      },
    ];
  }, [basePortalTree, dynamicLayers]);
  const layers = useMemo(() => flattenLayers(portalTree), [portalTree]);
  const baseLayer = useMemo(
    () => layers.find((layer) => layer.name === 'Google Satellite Hybrid' || layer.endpointUrl?.includes('google.com')),
    [layers],
  );
  const irrigationLayerIds = useMemo(() => new Set(layers.filter(isIrrigationPresetLayer).map((layer) => layer.id)), [layers]);
  const irrigationStatsLayer = useMemo(() => preferredIrrigationStatsLayer(layers.filter((layer) => irrigationLayerIds.has(layer.id))), [irrigationLayerIds, layers]);
  const activePreset = useMemo(() => THEMATIC_MAP_PRESETS.find((preset) => preset.id === activePresetId) ?? null, [activePresetId]);
  const activeLayerCount = visibleIds.size;
  const loadedLayerCount = Object.values(statuses).filter((status) => status === 'cargada').length;
  const visibleFeatureCount = useMemo(
    () =>
      Object.entries(vectorLayersRef.current).reduce((total, [id, layer]) => {
        if (!visibleIds.has(id)) return total;
        return total + (layer.getSource()?.getFeatures().length ?? 0);
      }, 0),
    [filters, statuses, visibleIds],
  );
  const selectedParcelLabel = useMemo(() => {
    const parcel = selectedFeature ?? identifiedFeatures[0];
    if (!parcel) return '-';
    const keyAttribute = featureAttributes(parcel).find(([key]) => /nomen|padron|parcela|id/i.test(key));
    return keyAttribute?.[1] ?? '-';
  }, [identifiedFeatures, selectedFeature]);
  const loadedVisibleFeatureTotal = useMemo(
    () =>
      Object.entries(vectorLayersRef.current).reduce((total, [layerId, layer]) => {
        if (!visibleIds.has(layerId)) return total;
        return total + (layer.getSource()?.getFeatures().length ?? 0);
      }, 0),
    [statuses, visibleIds],
  );
  const searchResults = useMemo<SearchResult[]>(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!query) return [];

    const results: SearchResult[] = [];
    for (const layer of layers) {
      if (!visibleIds.has(layer.id)) continue;
      const features = vectorLayersRef.current[layer.id]?.getSource()?.getFeatures() ?? [];
      if (!layer) continue;

      features.forEach((feature, featureIndex) => {
        const layerMatch = layer.name.toLocaleLowerCase().includes(query);
        const attributeMatch = searchableAttributes(feature).find(([key, value]) => {
          const haystack = `${key} ${value}`.toLocaleLowerCase();
          return haystack.includes(query);
        });
        if (!layerMatch && !attributeMatch) return;

        const [field, value] = displayAttributeForResult(layer, feature, query);
        results.push({ id: `${layer.id}:${featureIndex}`, layerId: layer.id, layerName: layer.name, featureIndex, field, value });
      });
    }

    return results.slice(0, 50);
  }, [layers, searchQuery, statuses, visibleIds]);
  const attributeTableLayer = attributeTableLayerId ? layersByIdRef.current.get(attributeTableLayerId) : undefined;
  const attributeTableFeatures = attributeTableOverride ?? (attributeTableLayerId ? (vectorLayersRef.current[attributeTableLayerId]?.getSource()?.getFeatures() ?? []) : []);
  const dashboardLayers = useMemo(
    () => layers.filter((layer) => layer.provider === 'WFS' && Boolean(layer.endpointUrl && layer.typename))
      .sort((a, b) => Number(visibleIds.has(b.id)) - Number(visibleIds.has(a.id)) || a.treeOrder - b.treeOrder),
    [layers, visibleIds],
  );
  const dashboardLayer = dashboard.layerId ? layersByIdRef.current.get(dashboard.layerId) : dashboardLayers[0];
  const dashboardFeatures = dashboardLayer ? (vectorLayersRef.current[dashboardLayer.id]?.getSource()?.getFeatures() ?? []) : [];
  const dashboardFields = fieldsForLayerOrFeatures(dashboardLayer, dashboardFeatures);
  const dashboardCategoryFields = useMemo(
    () => [
      ...(activePresetId === IRRIGATION_RIGHTS_PRESET_ID && dashboardLayer && irrigationLayerIds.has(dashboardLayer.id)
        ? ['__irrigation_right__']
        : []),
      ...categoricalFieldsForLayer(dashboardLayer, dashboardFeatures),
    ],
    [activePresetId, dashboardFeatures, dashboardLayer, irrigationLayerIds],
  );
  const dashboardNumericFields = useMemo(() => numericFieldsForLayer(dashboardLayer, dashboardFeatures), [dashboardFeatures, dashboardLayer]);
  const defaultDashboardCategoryField = dashboardCategoryFields[0] ?? '';
  const queriedDashboardRows = useMemo<DashboardRow[]>(() => {
    if (!statisticsResult || statisticsResult.layerId !== dashboardLayer?.id) return [];
    return statisticsResult.groups.map((group) => ({
      label: group.category,
      count: group.count,
      metricValue: dashboard.metric === 'sum' ? group.sum : dashboard.metric === 'avg' ? group.avg : group.count,
      features: [],
    }));
  }, [dashboard.metric, dashboardLayer?.id, statisticsResult]);
  const dashboardRows = queriedDashboardRows;
  const dashboardMetricTotal = dashboardRows.reduce((total, row) => total + (dashboard.metric === 'avg' ? row.count : row.metricValue), 0);
  const crossLayers = useMemo(
    () =>
      [...layers]
        .filter((layer) => layer.provider === 'WFS' && Boolean(layer.endpointUrl && layer.typename))
        .sort((a, b) => Number(visibleIds.has(b.id)) - Number(visibleIds.has(a.id)) || a.treeOrder - b.treeOrder),
    [layers, visibleIds],
  );
  const crossGroupLayers = useMemo(() => crossLayers.filter(isPolygonLayer), [crossLayers]);
  const crossTargetLayer = crossDashboard.targetLayerId ? layersByIdRef.current.get(crossDashboard.targetLayerId) : crossLayers[0];
  const crossGroupLayer = crossDashboard.groupLayerId ? layersByIdRef.current.get(crossDashboard.groupLayerId) : crossGroupLayers[0];
  const crossGroupFields = categoricalFieldsForLayer(crossGroupLayer, []);
  const crossNumericFields = numericFieldsForLayer(crossTargetLayer, []);
  const crossWarning = crossCompatibilityWarning(crossTargetLayer, crossGroupLayer, crossDashboard.spatialOperation);
  const crossRows = useMemo<DashboardRow[]>(
    () =>
      (crossStatisticsResult?.results ?? []).map((row) => ({
        label: row.group,
        count: row.count,
        metricValue: crossDashboard.metric === 'sum' ? row.sum : crossDashboard.metric === 'avg' ? row.avg : row.count,
        features: [],
      })),
    [crossDashboard.metric, crossStatisticsResult],
  );
  const crossMetricTotal = crossRows.reduce((total, row) => total + (crossDashboard.metric === 'avg' ? row.count : row.metricValue), 0);

  const setLayerStatus = useCallback((id: string, status: LayerStatus) => {
    setStatuses((current) => (current[id] === status ? current : { ...current, [id]: status }));
  }, []);

  const selectFeature = useCallback((feature: Feature, layerName: string, shouldCenter = true) => {
    const map = mapRef.current;
    const clone = feature.clone();
    const geometry = clone.getGeometry();
    const highlightSource = highlightLayerRef.current?.getSource();
    highlightSource?.clear(true);
    highlightSource?.addFeature(clone);
    setIdentifiedFeatures([clone]);
    setSelectedFeature(clone);

    let popupPixel = [24, 24];
    if (map && geometry) {
      const center = getCenter(geometry.getExtent());
      popupPixel = map.getPixelFromCoordinate(center);
      if (shouldCenter) map.getView().animate({ center, duration: 250 });
    }

    setIdentifyPopup({
      x: popupPixel[0],
      y: popupPixel[1],
      items: [{ id: `${layerName}-selected`, layerName, attributes: featureAttributes(feature) }],
    });
  }, []);


  const identifyByWfs = useCallback(async (pixel: number[], coordinate: number[]) => {
    const map = mapRef.current;
    const resolution = map?.getView().getResolution() ?? 1;
    const delta = Math.max(resolution * 3, 2);
    const bbox = [coordinate[0] - delta, coordinate[1] - delta, coordinate[0] + delta, coordinate[1] + delta];
    const activeLayers = [...layersByIdRef.current.values()]
      .filter((layer) => visibleIdsRef.current.has(layer.id) && layer.provider === 'WFS' && layer.endpointUrl && layer.typename)
      .sort((a, b) => Number(isPortalParcelLayer(b)) - Number(isPortalParcelLayer(a)) || a.drawOrder - b.drawOrder)
      .slice(0, 8);

    if (!activeLayers.length) {
      setIdentifyPopup(null);
      setIdentifiedFeatures([]);
      setSelectedFeature(null);
      highlightLayerRef.current?.getSource()?.clear(true);
      return;
    }

    const candidates: Array<{ item: IdentifyItem; feature: Feature; parcel: boolean }> = [];
    for (const layer of activeLayers) {
      const propertyFields = recommendedReportFields(layer.name, catalogFieldsForLayer(layer)).slice(0, 12);
      const params = new URLSearchParams({
        targetUrl: layer.endpointUrl ?? '',
        typeName: layer.typename ?? '',
        layerCrs: layer.effectiveSrs ?? 'EPSG:4326',
        mapCrs: 'EPSG:3857',
        bbox: bbox.join(','),
        count: '3',
      });
      if (propertyFields.length) params.set('propertyName', [...new Set([...propertyFields, 'geometry'])].join(','));
      try {
        const localParams = new URLSearchParams({ layerId: layer.id, mapCrs: 'EPSG:3857', bbox: bbox.join(','), limit: '3' });
        if (propertyFields.length) localParams.set('propertyName', [...new Set([...propertyFields, 'geometry'])].join(','));
        let response = await fetch(`${API_URL}/local/features?${localParams}`);
        let dataProjection = 'EPSG:4326';
        if (response.status === 404) {
          response = await fetch(`${API_URL}/wfs/feature?${params}`);
          dataProjection = layer.effectiveSrs ?? 'EPSG:4326';
        }
        const payload = await response.json();
        if (!response.ok || payload.error) continue;
        const features = geoJson.readFeatures(payload, {
          dataProjection,
          featureProjection: 'EPSG:3857',
        }) as Feature[];
        if (!features.length) continue;
        loadedFeaturesRef.current[layer.id] = mergeFeaturePreview(loadedFeaturesRef.current[layer.id] ?? [], features);
        for (const feature of features.slice(0, 3)) {
          if (!feature.getGeometry()) continue;
          const attributes = featureAttributes(feature);
          if (!attributes.length) continue;
          candidates.push({
            item: { id: `${layer.id}-identify-${candidates.length}`, layerName: layer.name, attributes },
            feature,
            parcel: isPortalParcelLayer(layer),
          });
        }
      } catch {
        // La identificación WFS es best effort; no bloquea el visor.
      }
      if (candidates.length >= 6) break;
    }

    const selection = choosePrimaryIdentifyCandidate(candidates, coordinate);
    if (!selection.primary) {
      setIdentifyPopup(null);
      setIdentifiedFeatures([]);
      setSelectedFeature(null);
      highlightLayerRef.current?.getSource()?.clear(true);
      return;
    }

    const selected = selection.primary.feature.clone();
    const highlightSource = highlightLayerRef.current?.getSource();
    highlightSource?.clear(true);
    highlightSource?.addFeature(selected);
    setIdentifiedFeatures(selection.ordered.map((candidate) => candidate.feature.clone()));
    setSelectedFeature(selected);
    setIdentifyPopup({
      x: pixel[0],
      y: pixel[1],
      items: selection.ordered.map((candidate) => candidate.item),
      boundaryHit: selection.boundaryHit,
    });
  }, []);

  const renderLayerFeatures = useCallback((layerId: string, features: Feature[]) => {
    loadedFeaturesRef.current[layerId] = features.map((feature) => feature.clone());
    const source = vectorLayersRef.current[layerId]?.getSource();
    if (!source) return;

    const filter = filtersRef.current[layerId];
    const visibleFeatures = features
      .filter((feature) => {
        const matchesPreset =
          activePresetIdRef.current !== IRRIGATION_RIGHTS_PRESET_ID ||
          !irrigationLayerIdsRef.current.has(layerId) ||
          layerId === IRRIGATION_PROVINCIAL_LAYER_ID ||
          featureHasIrrigationRight(feature);
        const category = irrigationRightFromFeature(feature) ?? 'Sin dato / NULL';
        const matchesCategory = !irrigationLayerIdsRef.current.has(layerId) ||
          ((!irrigationCategoryFilterRef.current || category === irrigationCategoryFilterRef.current) && !hiddenIrrigationCategoriesRef.current.has(category));
        return matchesPreset && matchesCategory && featureMatchesFilter(feature, filter);
      })
      .map((feature) => feature.clone());
    source.clear(true);
    source.addFeatures(visibleFeatures);
  }, []);

  const loadLayer = useCallback(
    async (layer: CatalogLayer) => {
      const map = mapRef.current;
      const vectorLayer = vectorLayersRef.current[layer.id];
      const size = map?.getSize();
      if (!map || !size || !vectorLayer || !layer.endpointUrl || !layer.typename) return;

      const zoom = map.getView().getZoom() ?? 0;
      if (isPortalParcelLayer(layer) && zoom < PORTAL_PARCEL_MIN_ZOOM) {
        renderLayerFeatures(layer.id, []);
        setLayerStatus(layer.id, 'geometria-no-cargada');
        return;
      }

      const bbox = map.getView().calculateExtent(size);
      const usesIrrigationPreset =
        activePresetIdRef.current === IRRIGATION_RIGHTS_PRESET_ID && irrigationLayerIdsRef.current.has(layer.id);
      const visualCount = isPortalParcelLayer(layer) ? 220 : 650;
      const localVisualCount = /^Red de Riego$/i.test(layer.name) ? 5000 : isPortalParcelLayer(layer) ? 2000 : 1200;
      const requestedFields = recommendedReportFields(layer.name, catalogFieldsForLayer(layer)).slice(0, 16);
      const propertyName = requestedFields.length ? [...new Set([...requestedFields, 'geometry'])].join(',') : undefined;
      const categoryKey = irrigationCategoryFilterRef.current ?? ([...hiddenIrrigationCategoriesRef.current].sort().join('|') || 'all');
      const cacheKey = `${layer.id}:${usesIrrigationPreset ? IRRIGATION_RIGHTS_PRESET_ID : 'normal'}:${categoryKey}:${Math.round(zoom)}:${approximateBboxKey(bbox)}:${propertyName ?? 'all'}`;
      const cachedFeatures = cacheRef.current.get(cacheKey);
      if (cachedFeatures) {
        renderLayerFeatures(layer.id, cachedFeatures);
        setLayerStatus(layer.id, cachedFeatures.length ? 'cargada' : 'sin-datos');
        return;
      }

      abortRef.current[layer.id]?.abort();
      const controller = new AbortController();
      abortRef.current[layer.id] = controller;

      const seq = (requestSeqRef.current[layer.id] ?? 0) + 1;
      requestSeqRef.current[layer.id] = seq;
      setLayerStatus(layer.id, 'cargando');

      const wfsParams = new URLSearchParams({
        targetUrl: layer.endpointUrl,
        typeName: layer.typename,
        layerCrs: layer.effectiveSrs ?? 'EPSG:4326',
        mapCrs: 'EPSG:3857',
        bbox: bbox.join(','),
        count: String(visualCount),
      });
      if (propertyName) wfsParams.set('propertyName', propertyName);
      if (usesIrrigationPreset) wfsParams.set('cqlFilter', irrigationRightsCqlFilter());

      const localParams = new URLSearchParams({
        layerId: layer.id,
        mapCrs: 'EPSG:3857',
        bbox: bbox.join(','),
        limit: String(localVisualCount),
      });
      if (propertyName) localParams.set('propertyName', propertyName);
      if (usesIrrigationPreset && irrigationCategoryFilterRef.current) localParams.set('category', irrigationCategoryFilterRef.current);

      try {
        let dataProjection = 'EPSG:4326';
        const localResponse = await fetch(`${API_URL}/local/features?${localParams}`, { signal: controller.signal });
        let payload: Record<string, unknown>;
        if (localResponse.ok) {
          payload = await localResponse.json() as Record<string, unknown>;
        } else if (localResponse.status === 404) {
          setNotice(`Esta capa se esta consultando desde WFS en vivo porque no existe snapshot local: ${layer.name}.`);
          dataProjection = layer.effectiveSrs ?? 'EPSG:4326';
          const fetchWfsPayload = async () => {
          const response = await fetch(`${API_URL}/wfs/feature?${wfsParams}`, { signal: controller.signal });
          const payload = await response.json();
          if (!response.ok || payload.error) throw new Error(payload.error ?? `HTTP ${response.status}`);
          return payload;
          };
          try { payload = await fetchWfsPayload(); }
          catch (error) {
            if (!usesIrrigationPreset) throw error;
            wfsParams.delete('cqlFilter');
            payload = await fetchWfsPayload();
            setNotice('El WFS no aplico CQL para derecho de riego; el filtro queda aplicado sobre features cargadas.');
          }
        } else {
          const error = await localResponse.json().catch(() => ({})) as { error?: string };
          throw new Error(error.error ?? `HTTP ${localResponse.status}`);
        }

        if (requestSeqRef.current[layer.id] !== seq || !visibleIdsRef.current.has(layer.id)) return;

        const features = geoJson.readFeatures(payload, {
          dataProjection,
          featureProjection: 'EPSG:3857',
        }) as Feature[];

        cacheRef.current.set(cacheKey, features.map((feature) => feature.clone()));
        renderLayerFeatures(layer.id, features);
        setLayerStatus(layer.id, features.length ? 'cargada' : 'sin-datos');
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        if (requestSeqRef.current[layer.id] === seq) setLayerStatus(layer.id, 'error');
      }
    },
    [renderLayerFeatures, setLayerStatus],
  );

  const runLoadQueue = useCallback(() => {
    while (activeLoadCountRef.current < PORTAL_MAX_WFS_CONCURRENCY && loadQueueRef.current.length) {
      const layer = loadQueueRef.current.shift();
      if (!layer || !visibleIdsRef.current.has(layer.id)) continue;

      activeLoadCountRef.current += 1;
      void loadLayer(layer).finally(() => {
        activeLoadCountRef.current -= 1;
        runLoadQueue();
      });
    }
  }, [loadLayer]);

  const queueLayerLoad = useCallback(
    (layer: CatalogLayer) => {
      abortRef.current[layer.id]?.abort();
      loadQueueRef.current = [...loadQueueRef.current.filter((queued) => queued.id !== layer.id), layer];
      runLoadQueue();
    },
    [runLoadQueue],
  );

  const reloadVisibleLayers = useCallback(() => {
    for (const layer of layersByIdRef.current.values()) {
      if (layer.provider === 'WFS' && visibleIdsRef.current.has(layer.id)) queueLayerLoad(layer);
    }
  }, [queueLayerLoad]);

  useEffect(() => {
    localStorage.setItem(PORTAL_THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const currentLayer = dashboard.layerId ? dashboardLayers.find((layer) => layer.id === dashboard.layerId) : undefined;
    const preferredIrrigationLayer =
      activePresetId === IRRIGATION_RIGHTS_PRESET_ID ? preferredIrrigationStatsLayer(dashboardLayers) : undefined;
    const currentIsValid =
      Boolean(currentLayer) &&
      (activePresetId !== IRRIGATION_RIGHTS_PRESET_ID || !preferredIrrigationLayer || irrigationLayerIds.has(currentLayer!.id));
    if (currentIsValid) return;
    const preferredLayer = preferredIrrigationLayer ?? dashboardLayers[0];
    if (!preferredLayer) return;
    setDashboard((current) => ({
      ...current,
      layerId: preferredLayer.id,
      categoryField:
        activePresetId === IRRIGATION_RIGHTS_PRESET_ID && irrigationLayerIds.has(preferredLayer.id)
          ? '__irrigation_right__'
          : '',
    }));
  }, [activePresetId, dashboard.layerId, dashboardLayers, irrigationLayerIds]);

  useEffect(() => {
    if (!crossLayers.length) return;
    const preferredTarget =
      activePresetId === IRRIGATION_RIGHTS_PRESET_ID
        ? preferredIrrigationStatsLayer(crossLayers)
        : findLayerByName(crossLayers, /^PH$/i) ?? findLayerByName(crossLayers, /MENSURA/i) ?? crossLayers[0];
    const preferredGroup = findLayerByName(crossGroupLayers, /Distritos de Mendoza/i) ?? crossGroupLayers[0];
    if (!preferredTarget || !preferredGroup) return;
    setCrossDashboard((current) => ({
      ...current,
      targetLayerId: current.targetLayerId || preferredTarget.id,
      groupLayerId: current.groupLayerId || preferredGroup.id,
      groupByField: current.groupByField || (catalogFieldsForLayer(preferredGroup).find((field) => /DISTRITO/i.test(field)) ?? ''),
      spatialOperation: geometryLabel(preferredTarget) === 'punto' ? 'within' : 'intersects',
    }));
  }, [activePresetId, crossGroupLayers, crossLayers]);

  useEffect(() => {
    if (toolPanel !== 'dashboard' || statisticsMode !== 'simple' || !dashboardLayer) return undefined;

    const categoryField = dashboard.categoryField || defaultDashboardCategoryField;
    if (!categoryField) {
      setStatisticsResult(null);
      setStatisticsState({
        status: 'idle',
        source: 'local-snapshot',
        scopeLabel: statisticsScope === 'global' ? 'Global - toda la capa' : 'Area actual / poligono',
        featureCount: 0,
        updatedAt: null,
        partial: false,
        usedPropertyName: false,
        warnings: ['Seleccione un campo categorico para calcular estadisticas.'],
        error: null,
      });
      return undefined;
    }

    const map = mapRef.current;
    const size = map?.getSize();
    if (statisticsScope === 'area' && (!map || !size)) return undefined;

    const seq = statisticsSeqRef.current + 1;
    statisticsSeqRef.current = seq;
    const controller = new AbortController();
    const bbox = map && size ? map.getView().calculateExtent(size) : undefined;
    const drawnPolygon = [...(digitalizeLayerRef.current?.getSource()?.getFeatures() ?? []), ...(measureLayerRef.current?.getSource()?.getFeatures() ?? [])]
      .find((feature) => feature.getGeometry()?.getType() === 'Polygon')?.getGeometry();
    const polygon = drawnPolygon ? geoJson.writeGeometryObject(drawnPolygon, { featureProjection: 'EPSG:3857', dataProjection: 'EPSG:4326' }) as { type: string; coordinates: unknown[] } : undefined;
    const layerFilter = filters[dashboardLayer.id];

    setStatisticsState((current) => ({
      ...current,
      status: 'loading',
      source: 'local-snapshot',
      scopeLabel: statisticsScope === 'global' ? 'Global - toda la capa' : 'Area actual / poligono',
      error: null,
      warnings: [],
    }));

    queryStatistics(
      API_URL,
      {
        layerId: dashboardLayer.id,
        scope: statisticsScope,
        bbox: statisticsScope === 'area' ? bbox : undefined,
        polygon: statisticsScope === 'area' ? polygon : undefined,
        mapCrs: 'EPSG:3857',
        categoryField,
        numericField: dashboard.numericField || undefined,
        filters: layerFilter?.field && layerFilter.value.trim() ? [layerFilter] : [],
        irrigationOnly: activePresetId === IRRIGATION_RIGHTS_PRESET_ID && irrigationLayerIds.has(dashboardLayer.id),
      },
      controller.signal,
    )
      .then((result) => {
        if (statisticsSeqRef.current !== seq) return;
        setStatisticsResult(result);
        setStatisticsState({
          status: result.status,
          source: result.source,
          scopeLabel: result.scope === 'global' ? 'Global - toda la capa' : polygon ? 'Resultado calculado sobre el poligono dibujado.' : 'Resultado parcial calculado sobre el area visible.',
          featureCount: result.featureCount,
          updatedAt: result.syncedAt ?? result.updatedAt,
          partial: result.partial,
          usedPropertyName: result.usedPropertyName,
          warnings: result.warnings,
          error: null,
        });
      })
      .catch((error: Error) => {
        if (controller.signal.aborted || statisticsSeqRef.current !== seq) return;
        setStatisticsResult(null);
        setStatisticsState({
          status: 'error',
          source: 'local-snapshot',
          scopeLabel: statisticsScope === 'global' ? 'Global - toda la capa' : 'Area actual / poligono',
          featureCount: 0,
          updatedAt: new Date().toISOString(),
          partial: false,
          usedPropertyName: false,
          warnings: [],
          error: statisticsScope === 'global' ? 'No hay snapshot local completo para esta capa. Ejecutá data:sync o usá modo Área actual / polígono.' : error.message,
        });
      });

    return () => controller.abort();
  }, [
    activePresetId,
    dashboard.categoryField,
    dashboard.numericField,
    dashboardLayer,
    defaultDashboardCategoryField,
    filters,
    irrigationLayerIds,
    statisticsScope,
    statisticsViewportRevision,
    statisticsMode,
    toolPanel,
  ]);

  useEffect(() => {
    measureModeRef.current = measureMode;
    const map = mapRef.current;
    if (!map) return undefined;

    if (drawRef.current) {
      map.removeInteraction(drawRef.current);
      drawRef.current = null;
    }
    measuringRef.current = false;
    setMeasureLive(null);

    if (!measureMode) return undefined;

    const source = measureLayerRef.current?.getSource();
    setMeasureResult('');
    let activeFeature: Feature | null = null;
    let geometryKey: EventsKey | null = null;
    let lastCoordinate: number[] | undefined;
    let lastPixel: number[] = [24, 72];

    const draw = new Draw({
      source: source ?? undefined,
      type: measureMode === 'distance' ? 'LineString' : 'Polygon',
      style: measureStyle,
    });
    drawRef.current = draw;
    map.addInteraction(draw);

    const updateMeasureLive = (coordinate = lastCoordinate, pixel = lastPixel) => {
      lastCoordinate = coordinate;
      lastPixel = pixel;
      const geometry = activeFeature?.getGeometry() as SimpleGeometry | undefined;
      const lines = measuringRef.current && geometry
        ? measureLiveLines(measureMode, geometry, coordinate)
        : [
            `Coord: ${formatCoordinate3857(coordinate)}`,
            'Click izquierdo: agregar vertice',
            'Click derecho: finalizar',
            'ESC: cancelar',
          ];
      setMeasureLive({ x: pixel[0] + 14, y: pixel[1] + 14, lines });
    };

    const clearGeometryKey = () => {
      if (geometryKey) unByKey(geometryKey);
      geometryKey = null;
    };

    draw.on('drawstart', (event) => {
      activeFeature = event.feature as Feature;
      measuringRef.current = true;
      const geometry = activeFeature.getGeometry() as SimpleGeometry | undefined;
      if (geometry) geometryKey = geometry.on('change', () => updateMeasureLive());
      updateMeasureLive();
    });

    draw.on('drawend', (event) => {
      const geometry = event.feature.getGeometry() as SimpleGeometry | undefined;
      if (!geometry) return;
      setMeasureResult(finalMeasureText(measureMode, geometry));
      measuringRef.current = false;
      activeFeature = null;
      clearGeometryKey();
      setMeasureLive(null);
    });

    draw.on('drawabort', () => {
      measuringRef.current = false;
      activeFeature = null;
      clearGeometryKey();
      setMeasureLive(null);
      setMeasureResult('Medicion cancelada');
    });

    const pointerMoveKey = map.on('pointermove', (event) => {
      updateMeasureLive(event.coordinate, event.pixel);
    });

    const finishWithRightClick = (event: Event) => {
      event.preventDefault();
      if (!measuringRef.current) return;
      try {
        draw.finishDrawing();
      } catch {
        draw.abortDrawing();
      }
    };
    const cancelWithEsc = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      draw.abortDrawing();
    };

    map.getViewport().addEventListener('contextmenu', finishWithRightClick);
    window.addEventListener('keydown', cancelWithEsc);

    return () => {
      map.removeInteraction(draw);
      unByKey(pointerMoveKey);
      clearGeometryKey();
      map.getViewport().removeEventListener('contextmenu', finishWithRightClick);
      window.removeEventListener('keydown', cancelWithEsc);
      if (drawRef.current === draw) drawRef.current = null;
    };
  }, [measureMode]);


  useEffect(() => {
    digitalizeModeRef.current = digitalizeMode;
    const map = mapRef.current;
    if (!map) return undefined;

    if (drawRef.current) {
      map.removeInteraction(drawRef.current);
      drawRef.current = null;
    }

    if (!digitalizeMode) return undefined;
    setMeasureMode(null);
    const source = digitalizeLayerRef.current?.getSource();
    const draw = new Draw({ source: source ?? undefined, type: digitalizeMode, style: digitalizeStyle });
    drawRef.current = draw;
    map.addInteraction(draw);

    draw.on('drawend', (event) => {
      const feature = event.feature as Feature;
      const defaultName = `Digitalización ${new Date().toLocaleTimeString()}`;
      const nombre = window.prompt('Nombre / descripción de la geometría', defaultName) || defaultName;
      const tipo = window.prompt('Tipo (Observación, Área de interés, Relevamiento, Parcela de consulta, Otro)', 'Observación') || 'Observación';
      const observaciones = window.prompt('Observaciones', '') || '';
      feature.set('nombre', nombre);
      feature.set('tipo', tipo);
      feature.set('observaciones', observaciones);
      feature.set('fecha', new Date().toISOString());
      const geometry = feature.getGeometry() as SimpleGeometry | undefined;
      const suffix = geometry?.getType() === 'Polygon'
        ? ` · área ${formatMeasure(getArea(geometry), 'area')}`
        : geometry?.getType() === 'LineString'
          ? ` · longitud ${formatMeasure(getLength(geometry), 'distance')}`
          : '';
      setDigitalizeResult(`${nombre} (${tipo})${suffix}`);
    });

    const finishWithRightClick = (event: Event) => {
      event.preventDefault();
      try {
        draw.finishDrawing();
      } catch {
        draw.abortDrawing();
      }
    };
    const cancelWithEsc = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      draw.abortDrawing();
      setDigitalizeResult('Digitalización cancelada');
    };
    map.getViewport().addEventListener('contextmenu', finishWithRightClick);
    window.addEventListener('keydown', cancelWithEsc);

    return () => {
      map.removeInteraction(draw);
      map.getViewport().removeEventListener('contextmenu', finishWithRightClick);
      window.removeEventListener('keydown', cancelWithEsc);
      if (drawRef.current === draw) drawRef.current = null;
    };
  }, [digitalizeMode]);

  useEffect(() => {
    editVerticesRef.current = editVertices;
    modifyRef.current?.setActive(editVertices);
  }, [editVertices]);

  useEffect(() => {
    filtersRef.current = filters;
    for (const [layerId, features] of Object.entries(loadedFeaturesRef.current)) {
      renderLayerFeatures(layerId, features);
    }
  }, [activePresetId, filters, renderLayerFeatures]);

  useEffect(() => {
    proj4.defs('EPSG:22172', EPSG_22172);
    register(proj4);

    const map = new OlMap({
      target: mapElementRef.current ?? undefined,
      layers: [],
      view: new View({
        projection: 'EPSG:3857',
        center: transformExtent(INITIAL_EXTENT_4326, 'EPSG:4326', 'EPSG:3857').slice(0, 2),
        zoom: 12,
      }),
    });
    const measureLayer = new VectorLayer({ source: new VectorSource<Feature>(), style: measureStyle });
    measureLayer.setZIndex(9998);
    measureLayerRef.current = measureLayer;
    map.addLayer(measureLayer);

    const digitalizeLayer = new VectorLayer({ source: new VectorSource<Feature>(), style: digitalizeStyle });
    digitalizeLayer.setZIndex(9997);
    digitalizeLayerRef.current = digitalizeLayer;
    map.addLayer(digitalizeLayer);
    const modify = new Modify({ source: digitalizeLayer.getSource() ?? undefined });
    modify.setActive(false);
    modifyRef.current = modify;
    map.addInteraction(modify);

    const highlightLayer = new VectorLayer({ source: new VectorSource<Feature>(), style: highlightStyle });
    highlightLayer.setZIndex(9999);
    highlightLayerRef.current = highlightLayer;
    map.addLayer(highlightLayer);

    const fitInitialExtent = () => {
      map.updateSize();
      map.getView().fit(transformExtent(INITIAL_EXTENT_4326, 'EPSG:4326', 'EPSG:3857'), {
        padding: [24, 24, 24, 24],
        maxZoom: 15,
      });
    };

    let moveTimer = 0;
    const onMoveEnd = () => {
      window.clearTimeout(moveTimer);
      moveTimer = window.setTimeout(() => {
        setMapRevision((current) => current + 1);
        reloadVisibleLayers();
      }, 650);
    };

    const onMapClick = (event: { pixel: number[]; coordinate: number[] }) => {
      if (measureModeRef.current || digitalizeModeRef.current || editVerticesRef.current) return;
      const hits: Array<{ item: IdentifyItem; feature: Feature; parcel: boolean }> = [];
      map.forEachFeatureAtPixel(event.pixel, (featureLike, layerLike) => {
        const layerId = layerLike?.get('portalLayerId') as string | undefined;
        if (!layerId) return;
        const layerName = (layerLike?.get('portalLayerName') as string | undefined) ?? 'Capa';
        const feature = featureLike as Feature;
        const attributes = featureAttributes(feature);
        if (!attributes.length) return;
        hits.push({
          item: { id: `${layerId}-${hits.length}`, layerName, attributes },
          feature,
          parcel: isParcelLayer(layerName),
        });
      }, { hitTolerance: 3 });

      if (!hits.length) {
        void identifyByWfs(event.pixel, event.coordinate);
        return;
      }

      const selection = choosePrimaryIdentifyCandidate(hits, event.coordinate);
      if (!selection.primary) return;
      const selected = selection.primary.feature.clone();
      const highlightSource = highlightLayerRef.current?.getSource();
      highlightSource?.clear(true);
      highlightSource?.addFeature(selected);
      setIdentifiedFeatures(selection.ordered.map((candidate) => candidate.feature.clone()));
      setSelectedFeature(selected);
      setIdentifyPopup({
        x: event.pixel[0],
        y: event.pixel[1],
        items: selection.ordered.map((candidate) => candidate.item),
        boundaryHit: selection.boundaryHit,
      });
    };

    map.on('moveend', onMoveEnd);
    map.on('singleclick', onMapClick);
    mapRef.current = map;
    window.setTimeout(fitInitialExtent, 0);

    return () => {
      window.clearTimeout(moveTimer);
      map.un('moveend', onMoveEnd);
      map.un('singleclick', onMapClick);
      map.setTarget(undefined);
      highlightLayerRef.current = null;
      measureLayerRef.current = null;
      digitalizeLayerRef.current = null;
      modifyRef.current = null;
      editVerticesRef.current = false;
      mapRef.current = null;
    };
  }, [identifyByWfs, reloadVisibleLayers, selectFeature]);

  useEffect(() => {
    let cancelled = false;

    fetch(`${API_URL}/catalog/tree`)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<CatalogTreeResponse>;
      })
      .then((data) => {
        if (cancelled) return;
        const nextLayers = flattenLayers(buildPortalTree(data.tree));
        const nextVisibleIds = initialVisibleIds(nextLayers);
        setCatalog(data);
        setVisibleIds(nextVisibleIds);
        setStatuses(
          Object.fromEntries(
            nextLayers.map((layer) => [
              layer.id,
              nextVisibleIds.has(layer.id) ? (layer.provider === 'WFS' ? 'cargando' : 'cargada') : 'apagada',
            ]),
          ),
        );
      })
      .catch((error: Error) => {
        if (!cancelled) setCatalogError(error.message);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const byId = new Map(layers.map((layer) => [layer.id, layer]));
    layersByIdRef.current = byId;
    visibleIdsRef.current = visibleIds;
    irrigationLayerIdsRef.current = irrigationLayerIds;
    irrigationCategoryFilterRef.current = irrigationCategoryFilter;
    hiddenIrrigationCategoriesRef.current = hiddenIrrigationCategories;
    activePresetIdRef.current = activePresetId;
  }, [activePresetId, hiddenIrrigationCategories, irrigationCategoryFilter, irrigationLayerIds, layers, visibleIds]);

  useEffect(() => {
    for (const layerId of irrigationLayerIds) {
      const features = loadedFeaturesRef.current[layerId];
      if (features) renderLayerFeatures(layerId, features);
    }
  }, [hiddenIrrigationCategories, irrigationCategoryFilter, irrigationLayerIds, renderLayerFeatures]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !layers.length) return;

    if (baseLayer && baseLayer.endpointUrl && !baseLayerRef.current) {
      const source = new XYZ({ url: reportLayerBaseUrl(baseLayer), maxZoom: 19, crossOrigin: 'anonymous' });
      source.on('tileloadstart', () => setLayerStatus(baseLayer.id, 'cargando'));
      source.on('tileloadend', () => setLayerStatus(baseLayer.id, 'cargada'));
      source.on('tileloaderror', () => setLayerStatus(baseLayer.id, 'error'));
      const tileLayer = new TileLayer({ source, visible: visibleIds.has(baseLayer.id) });
      tileLayer.setZIndex(-1);
      baseLayerRef.current = tileLayer;
      map.addLayer(tileLayer);
    }

    if (baseLayerRef.current && baseLayer) {
      baseLayerRef.current.setVisible(visibleIds.has(baseLayer.id));
      setLayerStatus(baseLayer.id, visibleIds.has(baseLayer.id) ? 'cargada' : 'apagada');
    }

    for (const layer of [...layers].sort((a, b) => a.drawOrder - b.drawOrder)) {
      if (layer.provider !== 'WFS') continue;

      let vectorLayer = vectorLayersRef.current[layer.id];
      let wmsLayer = wmsLayersRef.current[layer.id];
      const useIrrigationStyle = activePresetId === IRRIGATION_RIGHTS_PRESET_ID && irrigationLayerIds.has(layer.id);
      if (!vectorLayer) {
        vectorLayer = new VectorLayer({
          source: new VectorSource(),
          style: makeStyle(layer, useIrrigationStyle),
          visible: false,
          opacity: 1,
        });
        vectorLayer.set('portalLayerId', layer.id);
        vectorLayer.set('portalLayerName', layer.name);
        vectorLayer.setZIndex(layer.drawOrder + 1000);
        vectorLayersRef.current[layer.id] = vectorLayer;
        map.addLayer(vectorLayer);
      }

      if (!wmsLayer && canRenderAsWms(layer)) {
        wmsLayer = new TileLayer({
          source: new TileWMS({
            url: wmsUrlForLayer(layer) ?? undefined,
            params: { LAYERS: layer.typename ?? '', TILED: true, FORMAT: 'image/png', TRANSPARENT: true },
            serverType: 'geoserver',
            crossOrigin: 'anonymous',
          }),
          visible: false,
          opacity: layerOpacity(layer),
        });
        wmsLayer.set('portalLayerId', layer.id);
        wmsLayer.set('portalLayerName', layer.name);
        wmsLayer.setZIndex(layer.drawOrder);
        wmsLayersRef.current[layer.id] = wmsLayer;
        map.addLayer(wmsLayer);
      }

      const isVisible = visibleIds.has(layer.id);
      vectorLayer.setOpacity(1);
      vectorLayer.setStyle(makeStyle(layer, useIrrigationStyle));
      const localStyledLayer = layer.id === IRRIGATION_PROVINCIAL_LAYER_ID || /^Red de Riego$/i.test(layer.name);
      const filteredIrrigation = useIrrigationStyle && (Boolean(irrigationCategoryFilter) || hiddenIrrigationCategories.size > 0);
      vectorLayer.setVisible(isVisible && (localStyledLayer || !wmsLayer || filteredIrrigation));
      wmsLayer?.setVisible(isVisible && !localStyledLayer && !filteredIrrigation);
      wmsLayer?.setOpacity(layerOpacity(layer));
      if (isVisible) {
        if (/^Red de Riego$/i.test(layer.name)) vectorLayer.setZIndex(4000);
        queueLayerLoad(layer);
      } else {
        abortRef.current[layer.id]?.abort();
        vectorLayer.getSource()?.clear(true);
        wmsLayer?.setVisible(false);
        setLayerStatus(layer.id, 'apagada');
      }
    }
  }, [activePresetId, baseLayer, hiddenIrrigationCategories, irrigationCategoryFilter, irrigationLayerIds, layers, queueLayerLoad, setLayerStatus, visibleIds]);


  const loadDynamicCatalog = useCallback(async () => {
    if (dynamicCatalogStatus === 'loading') return;
    setDynamicCatalogStatus('loading');
    setDynamicCatalogError(null);
    try {
      const response = await fetch(`${API_URL}/catalog/dynamic`);
      const payload = (await response.json()) as DynamicCatalogResponse & { error?: string };
      if (!response.ok || payload.error) throw new Error(payload.error ?? `HTTP ${response.status}`);
      setDynamicCatalog((payload.layers ?? []).map(dynamicCatalogLayer));
      setDynamicCatalogStatus('ready');
      if (payload.warnings?.length) setNotice(payload.warnings.join(' | '));
    } catch (error) {
      setDynamicCatalogStatus('error');
      setDynamicCatalogError(error instanceof Error ? error.message : 'No se pudo cargar el catálogo IDECAM.');
    }
  }, [dynamicCatalogStatus]);

  useEffect(() => {
    if (activePresetId !== IRRIGATION_RIGHTS_PRESET_ID || !irrigationStatsLayer) { setIrrigationStatistics(null); return undefined; }
    const controller = new AbortController();
    const surfaceField = catalogFieldsForLayer(irrigationStatsLayer).find((field) => /sup_empad|superficie/i.test(field));
    void queryStatistics(API_URL, { layerId: irrigationStatsLayer.id, categoryField: '__irrigation_right__', numericField: surfaceField, scope: 'global' }, controller.signal)
      .then(setIrrigationStatistics)
      .catch(() => setIrrigationStatistics(null));
    return () => controller.abort();
  }, [activePresetId, irrigationStatsLayer]);

  const clearIrrigationFilter = useCallback(() => {
    setIrrigationCategoryFilter(null);
    setHiddenIrrigationCategories(new Set());
    setIrrigationContextMenu(null);
  }, []);

  const isolateIrrigationCategory = useCallback((category: string) => {
    setIrrigationCategoryFilter(category);
    setHiddenIrrigationCategories(new Set());
    setIrrigationContextMenu(null);
  }, []);

  const toggleIrrigationCategory = useCallback((category: string) => {
    setIrrigationCategoryFilter(null);
    setHiddenIrrigationCategories((current) => {
      const next = new Set(current);
      if (next.has(category)) next.delete(category); else next.add(category);
      return next;
    });
    setIrrigationContextMenu(null);
  }, []);

  const zoomIrrigationCategory = useCallback((category: string) => {
    const bbox = irrigationStatistics?.groups.find((group) => group.category === category)?.bbox;
    if (!bbox || bbox.length !== 4 || !mapRef.current) { setNotice('La categoria no tiene extension global disponible en el snapshot local.'); return; }
    mapRef.current.getView().fit(transformExtent(bbox as Extent, 'EPSG:4326', 'EPSG:3857'), { padding: [60, 60, 60, 420], maxZoom: 18 });
    if ((mapRef.current.getView().getZoom() ?? 0) < PORTAL_PARCEL_MIN_ZOOM) mapRef.current.getView().setZoom(PORTAL_PARCEL_MIN_ZOOM);
    setIrrigationContextMenu(null);
  }, [irrigationStatistics]);

  const openIrrigationCategoryTable = useCallback(async (category: string) => {
    if (!irrigationStatsLayer) return;
    try {
      const params = new URLSearchParams({ layerId: irrigationStatsLayer.id, category, limit: '10000' });
      const response = await fetch(`${API_URL}/local/features?${params}`);
      const payload = await response.json();
      if (!response.ok || payload.error) throw new Error(payload.error ?? `HTTP ${response.status}`);
      const features = geoJson.readFeatures(payload, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }) as Feature[];
      setAttributeTableLayerId(irrigationStatsLayer.id);
      setAttributeTableOverride(features);
      setAttributeTableTotal(Number(payload.numberMatched ?? features.length));
      setTableQuery('');
      setIrrigationContextMenu(null);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'No se pudo abrir la tabla de la categoria.');
    }
  }, [irrigationStatsLayer]);

  const addDynamicLayer = useCallback((layer: CatalogLayer) => {
    const existing = layersByIdRef.current.get(layer.id);
    if (existing && !existing.dynamic) {
      setVisibleIds((current) => new Set([...current, existing.id]));
      setStatuses((current) => ({ ...current, [existing.id]: existing.provider === 'WFS' ? 'cargando' : 'cargada' }));
      setNotice(`Capa activada desde el catalogo IDECAM: ${existing.name}.`);
      return;
    }
    const nextLayer = dynamicCatalogLayer(layer, dynamicLayers.length);
    setDynamicLayers((current) => {
      if (current.some((item) => item.typename === nextLayer.typename && item.endpointUrl === nextLayer.endpointUrl)) return current;
      return [...current, nextLayer];
    });
    setVisibleIds((current) => new Set([...current, nextLayer.id]));
    setStatuses((current) => ({ ...current, [nextLayer.id]: 'cargando' }));
    setNotice(`Capa agregada por sesión: ${nextLayer.name}. Al refrescar el portal vuelve al estado inicial.`);
  }, [dynamicLayers.length]);

  const removeDynamicLayer = useCallback((layer: CatalogLayer) => {
    setVisibleIds((current) => {
      const next = new Set(current);
      next.delete(layer.id);
      return next;
    });
    abortRef.current[layer.id]?.abort();
    vectorLayersRef.current[layer.id]?.getSource()?.clear(true);
    if (!layer.dynamic) { setStatuses((current) => ({ ...current, [layer.id]: 'apagada' })); return; }
    if (vectorLayersRef.current[layer.id] && mapRef.current) mapRef.current.removeLayer(vectorLayersRef.current[layer.id]);
    if (wmsLayersRef.current[layer.id] && mapRef.current) mapRef.current.removeLayer(wmsLayersRef.current[layer.id]);
    delete vectorLayersRef.current[layer.id];
    delete wmsLayersRef.current[layer.id];
    delete loadedFeaturesRef.current[layer.id];
    setDynamicLayers((current) => current.filter((item) => item.id !== layer.id));
  }, []);

  const applyThematicMap = (preset: ThematicMapPreset) => {
    const parcelLayers = layers.filter(isIrrigationPresetLayer);
    const irrigationNetwork = layers.find((layer) => /^Red de Riego$/i.test(layer.name));
    if (!parcelLayers.length) {
      setNotice('No se encontraron parcelarios reales en el catalogo cargado.');
      return;
    }

    setActivePresetId(preset.id);
    setPresetModified(false);
    setVisibleIds(() => {
      const next = initialVisibleIds(layers);
      if (baseLayer) next.add(baseLayer.id);
      next.add(PORTAL_DISTRICTS_LAYER_ID);
      const preferred = preferredIrrigationStatsLayer(parcelLayers) ?? parcelLayers[0];
      if (preferred) next.add(preferred.id);
      if (irrigationNetwork) next.add(irrigationNetwork.id);
      return next;
    });
    const preferredStatsLayer = preferredIrrigationStatsLayer(parcelLayers) ?? parcelLayers[0];
    setDashboard({
      layerId: preferredStatsLayer?.id ?? '',
      categoryField: '__irrigation_right__',
      numericField: '',
      metric: 'count',
    });
    setToolPanel('dashboard');
    mapRef.current?.getView().fit(transformExtent(INITIAL_EXTENT_4326, 'EPSG:4326', 'EPSG:3857'), {
      padding: [36, 36, 36, 36],
      maxZoom: 15,
      duration: 250,
    });
    setNotice(`Mapa CAM provincial aplicado sobre 18 parcelarios municipales${irrigationNetwork ? ' y Red de Riego' : ''}: datos locales por BBOX.`);
  };

  const clearThematicMap = () => {
    setActivePresetId(null);
    setPresetModified(false);
    setVisibleIds(initialVisibleIds(layers));
    setNotice('Mapa prearmado desactivado. El visor vuelve a la visibilidad inicial.');
  };

  const toggleLayer = (layer: CatalogLayer) => {
    if (activePresetId) setPresetModified(true);
    setVisibleIds((current) => {
      const next = new Set(current);
      if (next.has(layer.id)) next.delete(layer.id);
      else next.add(layer.id);
      return next;
    });
  };

  const toggleGroup = (node: PortalGroupNode, checked: boolean) => {
    if (activePresetId) setPresetModified(true);
    const ids = visibleLayerIdsForNode(node);
    setVisibleIds((current) => {
      const next = new Set(current);
      for (const id of ids) {
        if (checked) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  };

  const showLayerContextMenu = (event: MouseEvent, layer: CatalogLayer) => {
    event.preventDefault();
    setFilterPanel(null);
    setContextMenu({ layerId: layer.id, x: event.clientX, y: event.clientY });
  };

  const openFilterPanel = (layer: CatalogLayer) => {
    const x = contextMenu?.x ?? 24;
    const y = contextMenu?.y ?? 24;
    setContextMenu(null);
    setFilterPanel({ layerId: layer.id, x, y });
  };

  const openAttributeTable = (layer: CatalogLayer) => {
    setContextMenu(null);
    setTableQuery('');
    setAttributeTableOverride(null);
    setAttributeTableTotal(null);
    setAttributeTableLayerId(layer.id);
  };

  const selectLoadedFeature = (layerId: string, featureIndex: number) => {
    const layer = layersByIdRef.current.get(layerId);
    const feature = vectorLayersRef.current[layerId]?.getSource()?.getFeatures()[featureIndex];
    if (!layer || !feature) return;
    selectFeature(feature, layer.name);
  };

  const selectTableFeature = (layer: CatalogLayer, feature: Feature) => {
    selectFeature(feature, layer.name);
  };

  const selectDashboardRow = (row: DashboardRow) => {
    if (!dashboardLayer) return;
    const categoryField = dashboard.categoryField || defaultDashboardCategoryField;
    const visibleFeatures = vectorLayersRef.current[dashboardLayer.id]?.getSource()?.getFeatures() ?? [];
    const matches = visibleFeatures.filter((feature) => categoryValue(feature, categoryField) === row.label);
    if (!matches.length) {
      setNotice('La estadistica fue consultada, pero no hay geometria visible para resaltar esa categoria.');
      return;
    }

    const highlightSource = highlightLayerRef.current?.getSource();
    highlightSource?.clear(true);
    highlightSource?.addFeatures(matches.slice(0, 250).map((feature) => feature.clone()));
    selectFeature(matches[0], dashboardLayer.name);
  };

  const selectCrossRow = (row: DashboardRow) => {
    if (!crossGroupLayer) return;
    const groupField = crossDashboard.groupByField || crossGroupFields[0] || '';
    const visibleFeatures = vectorLayersRef.current[crossGroupLayer.id]?.getSource()?.getFeatures() ?? [];
    const matches = visibleFeatures.filter((feature) => categoryValue(feature, groupField) === row.label);
    if (!matches.length) {
      setNotice('El resultado cruzado fue consultado, pero el poligono de agrupamiento no esta visible para resaltarlo.');
      return;
    }
    const highlightSource = highlightLayerRef.current?.getSource();
    highlightSource?.clear(true);
    highlightSource?.addFeatures(matches.slice(0, 50).map((feature) => feature.clone()));
    selectFeature(matches[0], crossGroupLayer.name);
  };

  const clearStatisticsSelection = () => {
    highlightLayerRef.current?.getSource()?.clear(true);
    setIdentifyPopup(null);
    setIdentifiedFeatures([]);
    setSelectedFeature(null);
  };

  const exportStatisticsCsv = () => {
    const activeRows = statisticsMode === 'cross' ? crossRows : dashboardRows;
    const metric = statisticsMode === 'cross' ? crossDashboard.metric : dashboard.metric;
    const numericField = statisticsMode === 'cross' ? crossDashboard.numericField : dashboard.numericField;
    const csvCell = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const csvLine = (values: unknown[]) => values.map(csvCell).join(';');
    const meta =
      statisticsMode === 'cross'
        ? [
            ['PortalGIS IDECAM - Estadisticas'],
            ['Tipo', 'Cruzada'],
            ['Capa objetivo', crossTargetLayer?.name ?? '-'],
            ['Capa agrupamiento', crossGroupLayer?.name ?? '-'],
            ['Operacion', crossDashboard.spatialOperation],
            ['Alcance', statisticsState.scopeLabel],
            ['Fecha', new Date().toLocaleString()],
          ]
        : [
            ['PortalGIS IDECAM - Estadisticas'],
            ['Tipo', 'Simple'],
            ['Capa', dashboardLayer?.name ?? '-'],
            ['Categoria', dashboard.categoryField ? dashboardFieldLabel(dashboard.categoryField) : '-'],
            ['Alcance', statisticsState.scopeLabel],
            ['Fecha', new Date().toLocaleString()],
          ];
    const table = [
      ['Categoria', 'Cantidad', 'Metrica', 'Operacion', 'Alcance'],
      ...activeRows.map((row) => [
        row.label,
        row.count,
        formatMetricValue(row.metricValue, metric, numericField),
        statisticsMode === 'cross' ? crossDashboard.spatialOperation : 'simple',
        statisticsState.scopeLabel,
      ]),
    ];
    const csv = ['sep=;', ...meta.map(csvLine), '', ...table.map(csvLine)].join('\r\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'estadisticas-portalgis.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const applyCrossPreset = (preset: 'ph-district' | 'cam-district' | 'irrigation-district' | 'parcel-service') => {
    const districts = findLayerByName(crossGroupLayers, /Distritos de Mendoza/i);
    const loadedIrrigationLayer = [...crossLayers]
      .filter(isIrrigationRightsLayer)
      .sort(
        (a, b) =>
          (loadedFeaturesRef.current[b.id]?.filter(featureHasIrrigationRight).length ?? 0) -
          (loadedFeaturesRef.current[a.id]?.filter(featureHasIrrigationRight).length ?? 0),
      )
      .find((layer) => (loadedFeaturesRef.current[layer.id]?.filter(featureHasIrrigationRight).length ?? 0) > 0);
    const irrigationLayer = loadedIrrigationLayer ?? preferredIrrigationStatsLayer(crossLayers);
    const serviceArea = findLayerByName(crossGroupLayers, /servicio (AGUA|GAS|CLOACAS|ELECTRICO)/i);
    const nextTarget =
      preset === 'ph-district'
        ? findLayerByName(crossLayers, /^PH$/i)
        : preset === 'cam-district'
          ? findLayerByName(crossLayers, /MENSURA/i) ?? findLayerByName(crossLayers, /^PH$/i)
          : irrigationLayer;
    const nextGroup = preset === 'parcel-service' ? serviceArea : districts;
    if (!nextTarget || !nextGroup) {
      setNotice('No se encontraron las capas reales necesarias para ese analisis en el catalogo cargado.');
      return;
    }
    setStatisticsMode('cross');
    setCrossDashboard({
      targetLayerId: nextTarget.id,
      groupLayerId: nextGroup.id,
      spatialOperation: geometryLabel(nextTarget) === 'punto' ? 'within' : 'intersects',
      groupByField:
        catalogFieldsForLayer(nextGroup).find((field) => /DISTRITO/i.test(field)) ??
        catalogFieldsForLayer(nextGroup).find((field) => /DEPART/i.test(field)) ??
        catalogFieldsForLayer(nextGroup).find((field) => !isInternalField(field)) ??
        '',
      metric: 'count',
      numericField: '',
      highlightGroup: preset === 'ph-district' ? 'CAPITAL' : '',
    });
    setNotice('Preset de estadistica cruzada aplicado sobre snapshots locales completos. Pulse Calcular.');
  };

  const calculateCrossStatistics = () => {
    const map = mapRef.current;
    const size = map?.getSize();
    const targetLayer = crossTargetLayer;
    const groupLayer = crossGroupLayer;
    const groupByField = crossDashboard.groupByField || crossGroupFields[0] || '';
    if (!map || !size || !targetLayer || !groupLayer || !groupByField) {
      setStatisticsState((current) => ({
        ...current,
        status: 'error',
        source: 'local-snapshot',
        scopeLabel: 'Estadistica cruzada',
        error: 'Seleccione capa objetivo, capa de agrupamiento y campo de agrupamiento.',
      }));
      return;
    }

    const seq = crossStatisticsSeqRef.current + 1;
    crossStatisticsSeqRef.current = seq;
    const bbox = map.getView().calculateExtent(size);
    const drawnPolygon = [...(digitalizeLayerRef.current?.getSource()?.getFeatures() ?? []), ...(measureLayerRef.current?.getSource()?.getFeatures() ?? [])]
      .find((feature) => feature.getGeometry()?.getType() === 'Polygon')?.getGeometry();
    const polygon = drawnPolygon ? geoJson.writeGeometryObject(drawnPolygon, { featureProjection: 'EPSG:3857', dataProjection: 'EPSG:4326' }) as { type: string; coordinates: unknown[] } : undefined;
    const layerFilter = filters[targetLayer.id];
    const localWarnings = [crossWarning].filter((warning): warning is string => Boolean(warning));

    setStatisticsMode('cross');
    setStatisticsState((current) => ({
      ...current,
      status: 'loading',
      source: 'local-snapshot',
      scopeLabel: statisticsScope === 'global' ? 'Cruzada global - capas completas' : 'Area actual / poligono',
      error: null,
      warnings: localWarnings,
    }));

    void queryCrossStatistics(API_URL, {
      targetLayerId: targetLayer.id,
      groupLayerId: groupLayer.id,
      scope: statisticsScope,
      bbox: statisticsScope === 'area' ? bbox : undefined,
      polygon: statisticsScope === 'area' ? polygon : undefined,
      mapCrs: 'EPSG:3857',
      spatialOperation: crossDashboard.spatialOperation,
      groupByField,
      metric: crossDashboard.metric,
      numericField: crossDashboard.numericField || undefined,
      filters: layerFilter?.field && layerFilter.value.trim() ? [layerFilter] : [],
      irrigationOnly: activePresetId === IRRIGATION_RIGHTS_PRESET_ID && irrigationLayerIds.has(targetLayer.id),
    })
      .then((result) => {
        if (crossStatisticsSeqRef.current !== seq) return;
        setCrossStatisticsResult(result);
        setStatisticsState({
          status: result.status,
          source: result.source,
          scopeLabel: result.scope === 'global' ? 'Cruzada global - capas completas' : polygon ? 'Resultado calculado sobre el poligono dibujado.' : 'Resultado parcial calculado sobre el area visible.',
          featureCount: result.matchedFeatureCount,
          updatedAt: result.syncedAt ?? result.updatedAt,
          partial: result.partial,
          usedPropertyName: result.usedPropertyName,
          warnings: [...localWarnings, ...result.warnings],
          error: null,
        });
      })
      .catch((error: Error) => {
        if (crossStatisticsSeqRef.current !== seq) return;
        setCrossStatisticsResult(null);
        setStatisticsState({
          status: 'error',
          source: 'local-snapshot',
          scopeLabel: statisticsScope === 'global' ? 'Cruzada global - capas completas' : 'Area actual / poligono',
          featureCount: 0,
          updatedAt: new Date().toISOString(),
          partial: false,
          usedPropertyName: false,
          warnings: localWarnings,
          error: statisticsScope === 'global' ? 'No hay snapshots locales completos para ambas capas. Ejecute data:sync o use modo Area actual / poligono.' : error.message,
        });
      });
  };

  const captureReportMap = async (): Promise<{ image: string | null; base: string; attribution: string }> => {
    const map = mapRef.current;
    const layer = baseLayerRef.current;
    if (!map || !layer) return { image: null, base: 'Fondo claro tecnico', attribution: 'IDECAM / CAM' };
    const previousSource = layer.getSource();
    const previousVisible = layer.getVisible();
    const selected = printSettings.reportBase;
    let base = selected === 'esri' ? 'Esri World Imagery' : selected === 'osm' ? 'OpenStreetMap' : 'Fondo claro tecnico';
    let attribution = selected === 'esri' ? 'Tiles (c) Esri y sus proveedores' : selected === 'osm' ? '(c) OpenStreetMap contributors' : 'IDECAM / CAM';
    if (selected === 'light') layer.setVisible(false);
    else {
      layer.setSource(new XYZ({ url: selected === 'esri' ? ESRI_WORLD_IMAGERY_URL : OSM_TILE_URL, maxZoom: 19, crossOrigin: 'anonymous' }));
      layer.setVisible(true);
    }
    await new Promise<void>((resolve) => {
      const timeout = window.setTimeout(resolve, 4500);
      map.once('rendercomplete', () => { window.clearTimeout(timeout); resolve(); });
      map.renderSync();
    });
    let image = captureMapCanvas(map);
    if (!image && selected === 'esri') {
      layer.setSource(new XYZ({ url: OSM_TILE_URL, maxZoom: 19, crossOrigin: 'anonymous' }));
      await new Promise<void>((resolve) => { const timeout = window.setTimeout(resolve, 3500); map.once('rendercomplete', () => { window.clearTimeout(timeout); resolve(); }); map.renderSync(); });
      image = captureMapCanvas(map);
      base = 'OpenStreetMap';
      attribution = '(c) OpenStreetMap contributors';
    }
    if (!image) {
      layer.setVisible(false);
      map.renderSync();
      image = captureMapCanvas(map);
      base = 'Fondo claro tecnico';
      attribution = 'IDECAM / CAM';
    }
    layer.setSource(previousSource);
    layer.setVisible(previousVisible);
    map.renderSync();
    return { image, base, attribution };
  };

  const exportPrintLayout = async () => {
    const map = mapRef.current;
    const view = map?.getView();
    const size = map?.getSize();
    const extent3857 = map && view && size ? view.calculateExtent(size) : null;
    const extent4326 = extent3857 ? (transformExtent(extent3857, 'EPSG:3857', 'EPSG:4326') as Extent) : null;
    const center3857 = view?.getCenter();
    const center4326 = center3857 ? toLonLat(center3857) : null;
    const resolution = view?.getResolution() ?? 0;
    const scale = resolution ? Math.round(resolution * 96 * 39.37) : 0;
    const measureFeatures = measureLayerRef.current?.getSource()?.getFeatures() ?? [];
    const digitalFeatures = digitalizeLayerRef.current?.getSource()?.getFeatures() ?? [];
    const measureArea = measureFeatures.find((feature) => feature.getGeometry()?.getType() === 'Polygon')?.getGeometry() as SimpleGeometry | undefined;
    const digitalArea = digitalFeatures.find((feature) => feature.getGeometry()?.getType() === 'Polygon')?.getGeometry() as SimpleGeometry | undefined;
    const analysisGeometry = measureArea ?? digitalArea ?? null;
    setPrintMessage('Preparando mapa y consulta espacial local...');
    const capture = printSettings.includeMap ? await captureReportMap() : { image: null, base: 'Sin mapa', attribution: 'IDECAM / CAM' };
    const mapImage = capture.image;
    const activeLayers = layers.filter((layer) => visibleIds.has(layer.id));
    const activeLayerRows = activeLayers.map((layer) => [
      layer.name,
      statusLabel(layer, statuses[layer.id] ?? 'apagada'),
      layer.effectiveSrs ?? '-',
      geometryLabel(layer),
      String(loadedFeaturesRef.current[layer.id]?.length ?? 0),
      String(layer.treeOrder),
      String(layer.drawOrder),
    ]);
    const identifiedBlock = identifiedHtml(identifyPopup?.items ?? [], layers, printSettings);
    const statsRows = (statisticsMode === 'cross' ? crossRows : dashboardRows).slice(0, 80).map((row) => [
      row.label,
      String(row.count),
      formatMetricValue(row.metricValue, statisticsMode === 'cross' ? crossDashboard.metric : dashboard.metric, statisticsMode === 'cross' ? crossDashboard.numericField : dashboard.numericField),
    ]);
    const statsDetail =
      statisticsMode === 'cross'
        ? `${crossTargetLayer?.name ?? '-'} ${crossDashboard.spatialOperation} ${crossGroupLayer?.name ?? '-'} / grupo ${getFieldLabel(crossDashboard.groupByField || '-')}`
        : `${dashboardLayer?.name ?? '-'} / categoria ${dashboardFieldLabel(dashboard.categoryField || '-')}`;
    let reportFeatures = loadedFeaturesRef.current;
    if (analysisGeometry?.getType() === 'Polygon') {
      const polygon = geoJson.writeGeometryObject(analysisGeometry, { featureProjection: 'EPSG:3857', dataProjection: 'EPSG:4326' });
      const localFeatures: Record<string, Feature[]> = {};
      await Promise.all(activeLayers.filter(isPortalParcelLayer).map(async (layer) => {
        try {
          const response = await fetch(`${API_URL}/local/features/query`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ layerId: layer.id, polygon, limit: 10000 }) });
          if (!response.ok) return;
          const payload = await response.json();
          localFeatures[layer.id] = geoJson.readFeatures(payload, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }) as Feature[];
        } catch { /* El informe conserva solo snapshots locales respondidos. */ }
      }));
      reportFeatures = localFeatures;
    }
    const intersectedBlock = intersectedFeaturesHtml(activeLayers, reportFeatures, analysisGeometry, printSettings.showArea ? extent3857 : null, printSettings);
    const measurementBlock = measurementReportHtml([...measureFeatures, ...digitalFeatures]);
    const coordinateRows = [
      ['Centro', center4326 ? `${center4326[1].toFixed(6)}, ${center4326[0].toFixed(6)}` : '-'],
      ['Extent EPSG:4326', extent4326 ? extent4326.map((value) => value.toFixed(6)).join(', ') : '-'],
      ['Zoom', String(view?.getZoom()?.toFixed(2) ?? '-')],
      ['Escala aproximada', scale ? `1:${formatNumber(scale)}` : '-'],
    ];
    const sourceRows = [
      ['Autor metadata', 'laugis'],
      ['API', API_URL],
      ['Mapa base usado', capture.base],
      ['Atribucion cartografica', capture.attribution],
      ['Preset CAM', activePreset?.title ?? '-'],
      ['Fecha', new Date().toLocaleString()],
      ['Alcance estadistico', statisticsState.scopeLabel],
      ['Sincronizacion de datos', (statisticsMode === 'cross' ? crossStatisticsResult?.syncedAt : statisticsResult?.syncedAt) ? new Date((statisticsMode === 'cross' ? crossStatisticsResult?.syncedAt : statisticsResult?.syncedAt)!).toLocaleString() : 'Sin snapshot seleccionado'],
      ['Mapa del informe', mapImage ? 'Mapa embebido desde canvas con base compatible con captura.' : 'No se pudo capturar el mapa; se conserva informe tecnico con datos.'],
    ];
    const mapBlock = mapImage
      ? `<img class="map-image" src="${mapImage}" alt="Mapa actual" />`
      : '<div class="map-fallback"><strong>Referencia visual del visor</strong><span>No se pudo capturar el mapa base. El informe mantiene datos tecnicos, capas, estadisticas, mediciones y coordenadas.</span></div>';
    const orientation = printSettings.template.includes('landscape') ? 'landscape' : 'portrait';
    const page = printSettings.template.startsWith('A3') ? 'A3' : 'A4';
    const reportHtml = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(printSettings.title)}</title>
  <style>
    @page { size: ${page} ${orientation}; margin: 12mm; }
    * { box-sizing: border-box; }
    body { margin: 0; color: #17202a; font-family: Arial, sans-serif; font-size: 12px; }
    header { display: flex; justify-content: space-between; gap: 16px; border-bottom: 2px solid #1f2c35; padding-bottom: 10px; margin-bottom: 12px; }
    h1, h2, h3, p { margin: 0; }
    h1 { font-size: 21px; }
    h2 { font-size: 14px; margin: 14px 0 6px; }
    h3 { font-size: 12px; margin: 10px 0 5px; }
    .muted, .meta { color: #5f6d78; }
    .grid { display: grid; grid-template-columns: 1.35fr .65fr; gap: 12px; }
    .map-image, .map-fallback { width: 100%; border: 1px solid #9aa8b2; min-height: 320px; }
    .map-fallback { display: grid; place-items: center; gap: 8px; padding: 24px; color: #5f6d78; background: #eef2f5; text-align: center; }
    .map-fallback strong { color: #17202a; }
    table { width: 100%; border-collapse: collapse; page-break-inside: avoid; }
    th, td { border: 1px solid #ccd6dd; padding: 4px 5px; text-align: left; vertical-align: top; }
    th { background: #eef2f5; }
    .section { page-break-inside: avoid; }
    .entity-card { page-break-inside: avoid; margin-bottom: 8px; }
    .legend-list { display: flex; flex-wrap: wrap; gap: 6px; }
    .legend-list span { border: 1px solid #ccd6dd; padding: 3px 5px; background: #f7f9fb; }
    .back-link { display: inline-block; margin-bottom: 10px; color: #0b63ce; }
    @media print { button { display: none; } }
  </style>
</head>
<body>
  <a class="back-link" href="http://localhost:3000/">Volver al visor</a>
  <header>
    <div>
      <h1>${escapeHtml(printSettings.title)}</h1>
      <p class="muted">${escapeHtml(printSettings.subtitle)}</p>
    </div>
    <div class="meta">
      <p>Autor: ${escapeHtml(printSettings.author)}</p>
      <p>Metadata: laugis</p>
      <p>${escapeHtml(new Date().toLocaleString())}</p>
    </div>
  </header>
  <div class="grid">
    <main>
      ${printSettings.includeMap ? `<section class="section"><h2>Mapa</h2>${mapBlock}</section>` : ''}
      ${printSettings.includeStatistics ? `<section class="section"><h2>Estadisticas</h2><p class="muted">${escapeHtml(statisticsMode === 'cross' ? 'Cruzada' : 'Simple')} - ${escapeHtml(statsDetail)}</p>${tableHtml(['Grupo', 'Cantidad', 'Metrica'], statsRows)}</section>` : ''}
      ${printSettings.includeAttributes ? `<section class="section"><h2>Entidades identificadas / seleccionadas</h2>${identifiedBlock}</section>` : ''}
      <section class="section"><h2>Entidades intersectadas por area dibujada o area de impresion</h2>${intersectedBlock}</section>
      ${printSettings.includeMeasurements ? `<section class="section"><h2>Mediciones y coordenadas</h2>${measurementBlock}</section>` : ''}
    </main>
    <aside>
      ${printSettings.includeCoordinates ? `<section class="section"><h2>Vista y escala</h2>${tableHtml(['Dato', 'Valor'], coordinateRows)}</section>` : ''}
      ${printSettings.includeActiveLayers ? `<section class="section"><h2>Capas activas</h2>${tableHtml(['Capa', 'Estado', 'CRS', 'Geom', 'Features', 'Orden arbol', 'Orden dibujo'], activeLayerRows)}</section>` : ''}
      ${printSettings.includeLegend ? `<section class="section"><h2>Leyenda</h2><div class="legend-list">${activeLayers.map((layer) => `<span>${escapeHtml(layer.name)} (${escapeHtml(geometryLabel(layer))})</span>`).join('')}</div></section>` : ''}
      ${printSettings.includeSource ? `<section class="section"><h2>Fuente</h2>${tableHtml(['Dato', 'Valor'], sourceRows)}</section>` : ''}
      ${printSettings.includeNorth ? '<section class="section"><h2>Norte</h2><p style="font-size:34px;line-height:1">N</p></section>' : ''}
      ${printSettings.includeScale ? `<section class="section"><h2>Escala</h2><p>Escala aproximada 1:${escapeHtml(formatNumber(scale))}</p></section>` : ''}
    </aside>
  </div>
</body>
</html>`;
    setPrintReportHtml(reportHtml);
    setPrintMessage(mapImage ? `Informe tecnico listo con ${capture.base}.` : 'Informe tecnico listo con fondo tecnico; no se incorporo una imagen remota.');
  };

  const zoomToLayer = useCallback(
    async (layer: CatalogLayer) => {
      setContextMenu(null);
      const map = mapRef.current;
      const source = vectorLayersRef.current[layer.id]?.getSource();
      if (!map) return;

      if (layer.id === PORTAL_CONTOUR_LAYER_ID) {
        const contourExtent = transformExtent(PORTAL_CONTOUR_EXTENT_4326, 'EPSG:4326', 'EPSG:3857') as Extent;
        map.getView().fit(contourExtent, { padding: [72, 72, 72, 72], maxZoom: 10, duration: 250 });
        setNotice(`Zoom aplicado a ${layer.name} con extent IGN.`);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/catalog/layers/${encodeURIComponent(layer.id)}/extent`);
        const payload = (await response.json()) as { extent3857?: Extent; source?: string; error?: string };
        if (response.ok && isUsableExtent(payload.extent3857)) {
          map.getView().fit(payload.extent3857, { padding: [72, 72, 72, 72], maxZoom: 18, duration: 250 });
          setNotice(`Zoom aplicado a ${layer.name}.`);
          return;
        }
      } catch {
        // Fallback local abajo: evita bloquear el menu si capabilities falla.
      }

      let extent = source?.getExtent();
      if (source && !isUsableExtent(extent) && visibleIdsRef.current.has(layer.id)) {
        await loadLayer(layer);
        extent = source.getExtent();
      }
      if (!isUsableExtent(extent)) {
        setNotice(`No se pudo obtener el extent de ${layer.name}.`);
        return;
      }

      map.getView().fit(extent, { padding: [72, 72, 72, 72], maxZoom: 18, duration: 250 });
      setNotice(`Zoom aplicado al extent cargado de ${layer.name}.`);
    },
    [loadLayer],
  );

  const updateFilter = (layerId: string, patch: Partial<LayerFilter>) => {
    setFilters((current) => {
      const currentFilter = current[layerId] ?? { field: '', operator: 'contains', value: '' };
      return { ...current, [layerId]: { ...currentFilter, ...patch } };
    });
  };

  const clearFilter = (layerId: string) => {
    setFilters((current) => {
      const next = { ...current };
      delete next[layerId];
      return next;
    });
  };

  const clearMeasurement = () => {
    drawRef.current?.abortDrawing();
    measuringRef.current = false;
    setMeasureMode(null);
    setMeasureResult('');
    setMeasureLive(null);
    measureLayerRef.current?.getSource()?.clear(true);
  };

  const activateIdentify = () => {
    drawRef.current?.abortDrawing();
    setMeasureMode(null);
    setDigitalizeMode(null);
    setEditVertices(false);
    setNotice('Modo identificar activo.');
  };

  const clearIdentifySelection = () => {
    setIdentifyPopup(null);
    setIdentifiedFeatures([]);
    setSelectedFeature(null);
    highlightLayerRef.current?.getSource()?.clear(true);
  };


  const clearDigitalization = () => {
    drawRef.current?.abortDrawing();
    setDigitalizeMode(null);
    setDigitalizeResult('');
    digitalizeLayerRef.current?.getSource()?.clear(true);
  };

  const exportDigitalizationGeoJson = () => {
    const features = digitalizeLayerRef.current?.getSource()?.getFeatures() ?? [];
    if (!features.length) {
      setNotice('No hay geometrías digitalizadas para exportar.');
      return;
    }
    const geojson = new GeoJSON().writeFeaturesObject(features, {
      featureProjection: 'EPSG:3857',
      dataProjection: 'EPSG:4326',
    });
    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/geo+json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'digitalizacion_portalgis_idecam.geojson';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(null), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  return (
    <main className={`app-shell theme-${theme}`} onClick={() => { setContextMenu(null); setIrrigationContextMenu(null); }}>
      <aside className="layer-panel" aria-label="Catalogo de capas">
        <header className="panel-header">
          <div>
            <h1>PORTALGIS IDECAM</h1>
            <p>Visor GIS/CAM institucional</p>
          </div>
          <button
            className="theme-switch"
            type="button"
            aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            title={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            onClick={(event) => {
              event.stopPropagation();
              setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
            }}
          >
            <svg className="sun-icon" aria-hidden="true" viewBox="0 0 24 24">
              <path d="M12 1.5 14.1 6l4.9-1.1-1.1 4.9 4.6 2.2-4.6 2.2 1.1 4.9-4.9-1.1L12 22.5 9.9 18l-4.9 1.1 1.1-4.9L1.5 12l4.6-2.2L5 4.9 9.9 6 12 1.5Z" />
              <circle cx="12" cy="12" r="4.2" />
            </svg>
            <span className="switch-track" aria-hidden="true">
              <span className="switch-thumb" />
            </span>
            <span className="moon-icon" aria-hidden="true" />
          </button>
          <dl className="panel-stats">
            <div>
              <dt>Activas</dt>
              <dd>{activeLayerCount}</dd>
            </div>
            <div>
              <dt>Cargadas</dt>
              <dd>{loadedLayerCount}</dd>
            </div>
            <div>
              <dt>Features visibles</dt>
              <dd>{visibleFeatureCount}</dd>
            </div>
            <div>
              <dt>Parcela seleccionada</dt>
              <dd title={selectedParcelLabel}>{selectedParcelLabel}</dd>
            </div>
          </dl>
          <SearchPanelView
            query={searchQuery}
            results={searchResults}
            loadedFeatureCount={loadedVisibleFeatureTotal}
            onQueryChange={setSearchQuery}
            onSelect={selectLoadedFeature}
          />
          <ThematicMapsPanelView
            presets={THEMATIC_MAP_PRESETS}
            activePreset={activePreset}
            modified={presetModified}
            onApply={applyThematicMap}
            onClear={clearThematicMap}
          />
          {activePresetId === IRRIGATION_RIGHTS_PRESET_ID ? (
            <IrrigationLegendView
              statistics={irrigationStatistics}
              activeCategory={irrigationCategoryFilter}
              hiddenCategories={hiddenIrrigationCategories}
              onIsolate={isolateIrrigationCategory}
              onContextMenu={(event, category) => { event.preventDefault(); setIrrigationContextMenu({ category, x: event.clientX, y: event.clientY }); }}
              onClear={clearIrrigationFilter}
            />
          ) : null}
        </header>

        {catalogError ? <p className="catalog-error">API: {catalogError}</p> : null}
        <div className="tree-list">
          {catalog ? (
            sortedNodes(portalTree).map((node) => (
              <TreeNodeView
                key={node.id}
                node={node}
                statuses={statuses}
                visibleIds={visibleIds}
                filters={filters}
                onToggleLayer={toggleLayer}
                onToggleGroup={toggleGroup}
                onLayerContextMenu={showLayerContextMenu}
              />
            ))
          ) : (
            <p className="catalog-loading">cargando</p>
          )}
        </div>
      </aside>

      <section className="map-wrap" aria-label="Mapa">
        <MeasureToolbar
          mode={measureMode}
          result={measureResult}
          onModeChange={(mode) => { setDigitalizeMode(null); setEditVertices(false); setMeasureMode((current) => (current === mode ? null : mode)); }}
          onClear={clearMeasurement}
        />
        <DigitalizeToolbar
          mode={digitalizeMode}
          editMode={editVertices}
          identifyActive={!measureMode && !digitalizeMode && !editVertices}
          result={digitalizeResult}
          onIdentify={activateIdentify}
          onEditModeChange={() => { setMeasureMode(null); setDigitalizeMode(null); setEditVertices((current) => !current); }}
          onModeChange={(mode) => { setMeasureMode(null); setEditVertices(false); setDigitalizeMode((current) => (current === mode ? null : mode)); }}
          onClear={clearDigitalization}
          onExport={exportDigitalizationGeoJson}
        />
        <div className="map-action-toolbar" aria-label="Herramientas del visor">
          <button type="button" aria-pressed={toolPanel === 'catalog'} onClick={() => { setToolPanel((current) => (current === 'catalog' ? null : 'catalog')); void loadDynamicCatalog(); }}>
            Catálogo IDECAM
          </button>
          <button type="button" aria-pressed={toolPanel === 'dashboard'} onClick={() => setToolPanel((current) => (current === 'dashboard' ? null : 'dashboard'))}>
            Estadísticas
          </button>
          <button type="button" aria-pressed={toolPanel === 'print'} onClick={() => setToolPanel((current) => (current === 'print' ? null : 'print'))}>
            Imprimir
          </button>
        </div>
        <div ref={mapElementRef} className="map" data-testid="idecam-map" />
        {toolPanel === 'print' && printSettings.showArea ? <div className={`print-area-overlay ${printSettings.template}`} aria-hidden="true" /> : null}
        {measureLive ? <MeasureLiveOverlay live={measureLive} /> : null}
        {identifyPopup ? <IdentifyPopupView popup={identifyPopup} onClose={clearIdentifySelection} /> : null}
      </section>

      {toolPanel === 'catalog' ? (
        <DynamicCatalogPanelView
          layers={dynamicCatalog}
          activeLayers={layers.filter((layer) => visibleIds.has(layer.id))}
          status={dynamicCatalogStatus}
          error={dynamicCatalogError}
          query={dynamicCatalogQuery}
          onQueryChange={setDynamicCatalogQuery}
          onReload={loadDynamicCatalog}
          onAdd={addDynamicLayer}
          onRemove={removeDynamicLayer}
          onClose={() => setToolPanel(null)}
        />
      ) : null}
      {toolPanel === 'dashboard' ? (
        <DashboardPanelView
          mode={statisticsMode}
          scope={statisticsScope}
          layers={dashboardLayers}
          selectedLayer={dashboardLayer}
          fields={dashboardFields}
          categoryFields={dashboardCategoryFields}
          numericFields={dashboardNumericFields}
          state={dashboard}
          crossState={crossDashboard}
          crossLayers={crossLayers}
          crossGroupLayers={crossGroupLayers}
          crossTargetLayer={crossTargetLayer}
          crossGroupLayer={crossGroupLayer}
          crossGroupFields={crossGroupFields}
          crossNumericFields={crossNumericFields}
          crossWarning={crossWarning}
          crossResult={crossStatisticsResult}
          simpleResult={statisticsResult}
          statisticsState={statisticsState}
          rows={statisticsMode === 'cross' ? crossRows : dashboardRows}
          metricTotal={statisticsMode === 'cross' ? crossMetricTotal : dashboardMetricTotal}
          onModeChange={setStatisticsMode}
          onScopeChange={setStatisticsScope}
          onChange={setDashboard}
          onCrossChange={setCrossDashboard}
          onCrossCalculate={calculateCrossStatistics}
          onCrossPreset={applyCrossPreset}
          onSelectRow={statisticsMode === 'cross' ? selectCrossRow : selectDashboardRow}
          onClearSelection={clearStatisticsSelection}
          onExportCsv={exportStatisticsCsv}
          onClose={() => setToolPanel(null)}
        />
      ) : null}
      {toolPanel === 'print' ? (
        <PrintPanelView
          settings={printSettings}
          activePreset={activePreset}
          message={printMessage}
          onChange={setPrintSettings}
          onExport={exportPrintLayout}
          onClose={() => setToolPanel(null)}
        />
      ) : null}
      {printReportHtml ? <ReportPreviewView html={printReportHtml} onClose={() => setPrintReportHtml(null)} /> : null}

      {contextMenu ? (
        <LayerContextMenuView
          menu={contextMenu}
          layer={layersByIdRef.current.get(contextMenu.layerId)}
          onZoom={zoomToLayer}
          onFilters={openFilterPanel}
          onAttributes={openAttributeTable}
        />
      ) : null}

      {irrigationContextMenu ? (
        <section className="context-menu" style={{ left: irrigationContextMenu.x, top: irrigationContextMenu.y }} onClick={(event) => event.stopPropagation()}>
          <strong>{irrigationContextMenu.category}</strong>
          <button type="button" onClick={() => isolateIrrigationCategory(irrigationContextMenu.category)}>Ver solo esta categoria</button>
          <button type="button" onClick={() => toggleIrrigationCategory(irrigationContextMenu.category)}>{hiddenIrrigationCategories.has(irrigationContextMenu.category) ? 'Mostrar esta categoria' : 'Ocultar esta categoria'}</button>
          <button type="button" onClick={() => zoomIrrigationCategory(irrigationContextMenu.category)}>Zoom a esta categoria</button>
          <button type="button" onClick={() => void openIrrigationCategoryTable(irrigationContextMenu.category)}>Abrir tabla de parcelas</button>
          <button type="button" onClick={clearIrrigationFilter}>Limpiar filtro</button>
        </section>
      ) : null}

      {filterPanel ? (
        <LayerFilterPanelView
          panel={filterPanel}
          layer={layersByIdRef.current.get(filterPanel.layerId)}
          fields={fieldsForFeatures(loadedFeaturesRef.current[filterPanel.layerId] ?? [])}
          filter={filters[filterPanel.layerId]}
          onChange={(patch) => updateFilter(filterPanel.layerId, patch)}
          onClear={() => clearFilter(filterPanel.layerId)}
          onClose={() => setFilterPanel(null)}
          onApply={() => {
            setNotice('Filtro aplicado sobre features cargadas.');
            setFilterPanel(null);
          }}
        />
      ) : null}

      {attributeTableLayer ? (
        <AttributeTableView
          layer={attributeTableLayer}
          features={attributeTableFeatures}
          total={attributeTableTotal}
          query={tableQuery}
          onQueryChange={setTableQuery}
          onSelect={selectTableFeature}
          onClose={() => { setAttributeTableLayerId(null); setAttributeTableOverride(null); setAttributeTableTotal(null); }}
        />
      ) : null}

      {notice ? <div className="portal-notice">{notice}</div> : null}
    </main>
  );
}

function SearchPanelView({
  query,
  results,
  loadedFeatureCount,
  onQueryChange,
  onSelect,
}: {
  query: string;
  results: SearchResult[];
  loadedFeatureCount: number;
  onQueryChange: (query: string) => void;
  onSelect: (layerId: string, featureIndex: number) => void;
}) {
  const hasQuery = Boolean(query.trim());

  return (
    <section className="search-panel" aria-label="Busqueda de datos cargados">
      <label>
        Buscar en datos cargados
        <input
          value={query}
          placeholder="nomenclatura, departamento, distrito..."
          onChange={(event) => onQueryChange(event.currentTarget.value)}
        />
      </label>
      {hasQuery && loadedFeatureCount === 0 ? (
        <p>Active una capa o acerquese al area de interes para buscar datos cargados.</p>
      ) : null}
      {hasQuery && loadedFeatureCount > 0 && !results.length ? <p>Sin resultados en features cargadas.</p> : null}
      {results.length ? (
        <div className="search-results">
          {results.map((result) => (
            <button key={result.id} type="button" onClick={() => onSelect(result.layerId, result.featureIndex)}>
              <span>{result.layerName}</span>
              <strong>
                {getFieldLabel(result.field)}: {result.value}
              </strong>
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function ThematicMapsPanelView({
  presets,
  activePreset,
  modified,
  onApply,
  onClear,
}: {
  presets: ThematicMapPreset[];
  activePreset: ThematicMapPreset | null;
  modified: boolean;
  onApply: (preset: ThematicMapPreset) => void;
  onClear: () => void;
}) {
  return (
    <section className="thematic-panel" aria-label="Mapas CAM">
      <header>
        <h2>Mapas CAM</h2>
        {activePreset ? <span>{modified ? 'activo modificado' : 'activo'}</span> : null}
      </header>
      {presets.map((preset) => (
        <button key={preset.id} type="button" aria-pressed={activePreset?.id === preset.id} onClick={() => onApply(preset)}>
          <strong>{preset.title}</strong>
          <span>{preset.description}</span>
        </button>
      ))}
      {activePreset ? (
        <button className="secondary-action" type="button" onClick={onClear}>
          Desactivar mapa prearmado
        </button>
      ) : null}
    </section>
  );
}

function IrrigationLegendView({ statistics, activeCategory, hiddenCategories, onIsolate, onContextMenu, onClear }: {
  statistics: StatisticsQueryResponse | null;
  activeCategory: string | null;
  hiddenCategories: Set<string>;
  onIsolate: (category: string) => void;
  onContextMenu: (event: MouseEvent, category: string) => void;
  onClear: () => void;
}) {
  const counts = new Map((statistics?.groups ?? []).map((group) => [group.category, group.count]));
  const statsByCategory = new Map((statistics?.groups ?? []).map((group) => [group.category, group]));
  return (
    <section className="irrigation-legend" aria-label="Leyenda de derecho de riego">
      <header>
        <h2>Leyenda QGIS</h2>
        <span>Concesion / Tipo_der_r</span>
      </header>
      <div>
        {IRRIGATION_RIGHT_CATEGORIES.map((category) => {
          const value = category.key === 'NULL' ? 'Sin dato / NULL' : category.key;
          return (
          <button
            key={category.key}
            type="button"
            className="legend-item"
            data-active={activeCategory === value}
            data-hidden={hiddenCategories.has(value)}
            onClick={() => onIsolate(value)}
            onContextMenu={(event) => onContextMenu(event, value)}
            title="Click: aislar categoria. Click derecho: mas opciones."
          >
            <span className={`legend-swatch pattern-${category.pattern}`} aria-hidden="true" />
            <span>{category.label}</span>
            <strong>{counts.has(value) ? `${formatNumber(counts.get(value) ?? 0)} · ${formatNumber(((counts.get(value) ?? 0) / Math.max(1, statistics?.featureCount ?? 0)) * 100, 1)}%${statistics?.numericField ? ` · sup. ${formatNumber(statsByCategory.get(value)?.sum ?? 0, 1)}` : ''}` : '-'}</strong>
          </button>
          );
        })}
      </div>
      {activeCategory || hiddenCategories.size ? <button type="button" className="irrigation-clear" onClick={onClear}>Limpiar filtro de derecho de riego</button> : null}
      <small>{statistics ? `Fuente local completa: ${statistics.layerName}, ${formatNumber(statistics.featureCount)} parcelas${statistics.sourceLayers ? ` de ${statistics.sourceLayers} parcelarios municipales` : ''}. Sincronizado ${new Date(statistics.syncedAt ?? statistics.updatedAt).toLocaleString()}.` : 'Sin snapshot local completo. Ejecute data:sync o use Area actual / poligono.'}</small>
    </section>
  );
}

function dashboardFieldLabel(field: string): string {
  return field === '__irrigation_right__' ? 'Tipo de derecho de riego' : getFieldLabel(field);
}


function DynamicCatalogPanelView({
  layers,
  activeLayers,
  status,
  error,
  query,
  onQueryChange,
  onReload,
  onAdd,
  onRemove,
  onClose,
}: {
  layers: CatalogLayer[];
  activeLayers: CatalogLayer[];
  status: DynamicCatalogStatus;
  error: string | null;
  query: string;
  onQueryChange: (query: string) => void;
  onReload: () => void;
  onAdd: (layer: CatalogLayer) => void;
  onRemove: (layer: CatalogLayer) => void;
  onClose: () => void;
}) {
  const [workspaceFilter, setWorkspaceFilter] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [geometryFilter, setGeometryFilter] = useState('');
  const normalized = query.trim().toLocaleLowerCase();
  const workspaces = [...new Set(layers.map((layer) => layer.workspace).filter(Boolean))].sort();
  const groups = [...new Set(layers.map((layer) => layer.group).filter(Boolean))].sort();
  const geometries = [...new Set(layers.map((layer) => layer.geometry).filter(Boolean))].sort();
  const activeKeys = new Set(activeLayers.map((layer) => `${layer.endpointUrl ?? ''}|${layer.typename ?? ''}`));
  const filtered = layers.filter((layer) => {
    if (workspaceFilter && layer.workspace !== workspaceFilter) return false;
    if (groupFilter && layer.group !== groupFilter) return false;
    if (geometryFilter && layer.geometry !== geometryFilter) return false;
    if (!normalized) return true;
    return `${layer.name} ${layer.typename ?? ''} ${layer.dataset ?? ''} ${layer.workspace ?? ''} ${layer.group ?? ''}`.toLocaleLowerCase().includes(normalized);
  });
  const grouped = filtered.reduce<Record<string, CatalogLayer[]>>((acc, layer) => {
    const group = `${layer.dataset ?? 'Dataset'} / ${layer.workspace ?? 'workspace'}`;
    acc[group] = acc[group] ?? [];
    acc[group].push(layer);
    return acc;
  }, {});

  return (
    <section className="dynamic-catalog-panel" aria-label="Catálogo IDECAM dinámico" onClick={(event) => event.stopPropagation()}>
      <header>
        <div>
          <h2>Catálogo IDECAM</h2>
          <p>Todas las capas descubiertas por GetCapabilities. Abrir este panel no descarga features WFS.</p>
        </div>
        <button type="button" onClick={onClose}>Cerrar</button>
      </header>
      <div className="dynamic-catalog-actions">
        <input value={query} placeholder="Buscar capa, workspace o typename..." onChange={(event) => onQueryChange(event.currentTarget.value)} />
        <select value={workspaceFilter} onChange={(event) => setWorkspaceFilter(event.currentTarget.value)}><option value="">Todos los workspace</option>{workspaces.map((value) => <option key={value} value={value!}>{value}</option>)}</select>
        <select value={groupFilter} onChange={(event) => setGroupFilter(event.currentTarget.value)}><option value="">Todos los grupos</option>{groups.map((value) => <option key={value} value={value!}>{value}</option>)}</select>
        <select value={geometryFilter} onChange={(event) => setGeometryFilter(event.currentTarget.value)}><option value="">Todas las geometrias</option>{geometries.map((value) => <option key={value} value={value!}>{value}</option>)}</select>
        <button type="button" onClick={onReload} disabled={status === 'loading'}>{status === 'loading' ? 'Cargando...' : 'Reintentar'}</button>
      </div>
      {error ? <p className="catalog-error">{error}</p> : null}
      {status === 'idle' || status === 'loading' ? <p className="catalog-loading">Consultando capabilities reales...</p> : null}
      {status === 'ready' && !filtered.length ? <p className="catalog-loading">Sin capas para la búsqueda actual.</p> : null}
      <div className="dynamic-catalog-list">
        {Object.entries(grouped).map(([group, groupLayers]) => (
          <details key={group} open={groupLayers.length <= 12}>
            <summary>{group} <span>{groupLayers.length}</span></summary>
            {groupLayers.map((layer) => {
              const isAdded = activeKeys.has(`${layer.endpointUrl ?? ''}|${layer.typename ?? ''}`);
              return (
                <article key={`${layer.endpointUrl}-${layer.typename}`} className="dynamic-catalog-item">
                  <div>
                    <strong>{layer.name}</strong>
                    <small>{layer.typename}</small>
                    <span>{layer.wmsAvailable !== false ? 'WMS' : 'sin WMS'} · {layer.wfsAvailable !== false ? 'WFS' : 'sin WFS'} · {layer.geometry ?? 'geom. no declarada'}</span>
                    {layer.description ? <p>{layer.description}</p> : null}
                  </div>
                  <button type="button" onClick={() => isAdded ? onRemove(activeLayers.find((active) => `${active.endpointUrl ?? ''}|${active.typename ?? ''}` === `${layer.endpointUrl ?? ''}|${layer.typename ?? ''}`) ?? layer) : onAdd(layer)}>{isAdded ? 'Quitar del mapa' : 'Agregar al mapa'}</button>
                </article>
              );
            })}
          </details>
        ))}
      </div>
    </section>
  );
}

function DashboardPanelView({
  mode,
  scope,
  layers,
  selectedLayer,
  fields,
  categoryFields,
  numericFields,
  state,
  crossState,
  crossLayers,
  crossGroupLayers,
  crossTargetLayer,
  crossGroupLayer,
  crossGroupFields,
  crossNumericFields,
  crossWarning,
  crossResult,
  simpleResult,
  statisticsState,
  rows,
  metricTotal,
  onModeChange,
  onScopeChange,
  onChange,
  onCrossChange,
  onCrossCalculate,
  onCrossPreset,
  onSelectRow,
  onClearSelection,
  onExportCsv,
  onClose,
}: {
  mode: StatisticsMode;
  scope: StatisticsScope;
  layers: CatalogLayer[];
  selectedLayer: CatalogLayer | undefined;
  fields: string[];
  categoryFields: string[];
  numericFields: string[];
  state: DashboardState;
  crossState: CrossDashboardState;
  crossLayers: CatalogLayer[];
  crossGroupLayers: CatalogLayer[];
  crossTargetLayer: CatalogLayer | undefined;
  crossGroupLayer: CatalogLayer | undefined;
  crossGroupFields: string[];
  crossNumericFields: string[];
  crossWarning: string | null;
  crossResult: CrossStatisticsQueryResponse | null;
  simpleResult: StatisticsQueryResponse | null;
  statisticsState: StatisticsPanelState;
  rows: DashboardRow[];
  metricTotal: number;
  onModeChange: (mode: StatisticsMode) => void;
  onScopeChange: (scope: StatisticsScope) => void;
  onChange: (state: DashboardState) => void;
  onCrossChange: (state: CrossDashboardState) => void;
  onCrossCalculate: () => void;
  onCrossPreset: (preset: 'ph-district' | 'cam-district' | 'irrigation-district' | 'parcel-service') => void;
  onSelectRow: (row: DashboardRow) => void;
  onClearSelection: () => void;
  onExportCsv: () => void;
  onClose: () => void;
}) {
  const categoryField = state.categoryField || categoryFields[0] || '';
  const crossGroupField = crossState.groupByField || crossGroupFields[0] || '';
  const activeMetric = mode === 'cross' ? crossState.metric : state.metric;
  const activeNumericField = mode === 'cross' ? crossState.numericField : state.numericField;
  const maxValue = Math.max(1, ...rows.map((row) => row.metricValue));
  const metricLabel = activeMetric === 'count' ? 'Cantidad' : activeMetric === 'sum' ? 'Suma' : 'Promedio';
  const metricKpiValue =
    activeMetric === 'avg' && metricTotal
      ? rows.reduce((total, row) => total + row.metricValue * row.count, 0) / metricTotal
      : rows.reduce((total, row) => total + row.metricValue, 0);
  const statusLabel =
    statisticsState.status === 'loading'
      ? 'Calculando...'
      : statisticsState.status === 'partial'
        ? 'Datos parciales'
        : statisticsState.status === 'empty'
          ? 'Sin datos'
          : statisticsState.status === 'error'
            ? 'Error al consultar estadisticas'
            : 'Listo';
  const colors = ['#1f78b4', '#33a02c', '#ff7f00', '#6a3d9a', '#e31a1c', '#b15928', '#a6cee3', '#fb9a99'];
  let cursor = 0;
  const donut =
    rows.length && metricTotal
      ? `conic-gradient(${rows
          .map((row, index) => {
            const start = cursor;
            const size = ((activeMetric === 'avg' ? row.count : row.metricValue) / metricTotal) * 100;
            cursor += size;
            return `${colors[index % colors.length]} ${start}% ${cursor}%`;
          })
          .join(', ')})`
      : 'conic-gradient(#cbd5e1 0 100%)';
  const headerDetail =
    mode === 'cross'
      ? `${crossTargetLayer?.name ?? 'Capa objetivo'} por ${crossGroupLayer?.name ?? 'capa de agrupamiento'}`
      : selectedLayer
        ? selectedLayer.name
        : 'Sin capa WFS activa';

  return (
    <section className="analysis-panel" aria-label="Panel de estadisticas" onClick={(event) => event.stopPropagation()}>
      <header>
        <div>
          <h2>Estadisticas</h2>
          <p>{headerDetail}</p>
        </div>
        <button type="button" onClick={onClose}>
          Cerrar
        </button>
      </header>

      <div className="analysis-tabs" role="tablist" aria-label="Modo de estadisticas">
        <button type="button" aria-pressed={mode === 'simple'} onClick={() => onModeChange('simple')}>
          Simple
        </button>
        <button type="button" aria-pressed={mode === 'cross'} onClick={() => onModeChange('cross')}>
          Cruzada
        </button>
      </div>

      <label className="analysis-scope">
        Alcance
        <select value={scope} onChange={(event) => onScopeChange(event.currentTarget.value as StatisticsScope)}>
          <option value="global">Global - toda la capa</option>
          <option value="area">Area actual / poligono</option>
        </select>
      </label>

      <div className="analysis-status" data-status={statisticsState.status}>
        <strong>{statusLabel}</strong>
        <span>{statisticsState.scopeLabel}</span>
        <span>{statisticsState.source === 'local-snapshot' ? 'Fuente: dataset local sincronizado desde WFS' : statisticsState.source === 'wfs-proxy' ? 'Fuente: WFS en vivo (fallback)' : 'Fuente: datos visibles en mapa'}</span>
        <span>{statisticsState.updatedAt ? `Sincronizado: ${new Date(statisticsState.updatedAt).toLocaleString()}` : 'Sin sincronizacion'}</span>
        {statisticsState.usedPropertyName ? <span>Consulta optimizada con propertyName.</span> : null}
        {statisticsState.error ? <span className="analysis-error">{statisticsState.error}</span> : null}
        {statisticsState.warnings.map((warning) => (
          <span key={warning}>{warning}</span>
        ))}
      </div>

      {mode === 'simple' ? (
        <div className="analysis-controls">
          <label>
            Capa
            <select value={selectedLayer?.id ?? ''} onChange={(event) => onChange({ ...state, layerId: event.currentTarget.value, categoryField: '', numericField: '' })}>
              <option value="">Seleccionar</option>
              {layers.map((layer) => (
                <option key={layer.id} value={layer.id}>
                  {statisticsLayerLabel(layer)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Categoria
            <select value={categoryField} onChange={(event) => onChange({ ...state, categoryField: event.currentTarget.value })}>
              <option value="">Sin categoria</option>
              {categoryFields.map((field) => (
                <option key={field} value={field}>
                  {dashboardFieldLabel(field)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Metrica
            <select value={state.metric} onChange={(event) => onChange({ ...state, metric: event.currentTarget.value as DashboardMetric })}>
              <option value="count">Cantidad</option>
              <option value="sum">Suma campo numerico</option>
              <option value="avg">Promedio campo numerico</option>
            </select>
          </label>
          <label>
            Campo numerico
            <select value={state.numericField} disabled={state.metric === 'count'} onChange={(event) => onChange({ ...state, numericField: event.currentTarget.value })}>
              <option value="">Seleccionar</option>
              {numericFields.map((field) => (
                <option key={field} value={field}>
                  {getFieldLabel(field)}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : (
        <>
          <div className="analysis-preset-intro">
            <strong>Estadisticas prearmadas</strong>
            <span>Seleccione un analisis prearmado o configure uno manualmente.</span>
          </div>
          <div className="analysis-presets">
            <button type="button" onClick={() => onCrossPreset('ph-district')}>
              PH por distrito
            </button>
            <button type="button" onClick={() => onCrossPreset('cam-district')}>
              Intervenciones CAM por distrito
            </button>
            <button type="button" onClick={() => onCrossPreset('irrigation-district')}>
              Parcelas con derecho de riego por distrito
            </button>
            <button type="button" onClick={() => onCrossPreset('parcel-service')}>
              Parcelas por areas con servicio
            </button>
          </div>
          {crossWarning ? <p className="analysis-warning">{crossWarning}</p> : null}
          <div className="analysis-controls">
            <label>
              Capa objetivo
              <select value={crossTargetLayer?.id ?? ''} onChange={(event) => onCrossChange({ ...crossState, targetLayerId: event.currentTarget.value, numericField: '' })}>
                <option value="">Seleccionar</option>
                {crossLayers.map((layer) => (
                  <option key={layer.id} value={layer.id}>
                    {statisticsLayerLabel(layer)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Capa de agrupamiento
              <select value={crossGroupLayer?.id ?? ''} onChange={(event) => onCrossChange({ ...crossState, groupLayerId: event.currentTarget.value, groupByField: '' })}>
                <option value="">Seleccionar</option>
                {crossGroupLayers.map((layer) => (
                  <option key={layer.id} value={layer.id}>
                    {statisticsLayerLabel(layer)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Operacion espacial
              <select value={crossState.spatialOperation} onChange={(event) => onCrossChange({ ...crossState, spatialOperation: event.currentTarget.value as SpatialOperation })}>
                <option value="within">Dentro de</option>
                <option value="intersects">Intersecta</option>
                <option value="contains">Contiene</option>
              </select>
            </label>
            <label>
              Agrupar por
              <select value={crossGroupField} onChange={(event) => onCrossChange({ ...crossState, groupByField: event.currentTarget.value })}>
                <option value="">Seleccionar</option>
                {crossGroupFields.map((field) => (
                  <option key={field} value={field}>
                    {getFieldLabel(field)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Metrica
              <select value={crossState.metric} onChange={(event) => onCrossChange({ ...crossState, metric: event.currentTarget.value as DashboardMetric })}>
                <option value="count">Cantidad</option>
                <option value="sum">Suma campo numerico</option>
                <option value="avg">Promedio campo numerico</option>
              </select>
            </label>
            <label>
              Campo numerico
              <select value={crossState.numericField} disabled={crossState.metric === 'count'} onChange={(event) => onCrossChange({ ...crossState, numericField: event.currentTarget.value })}>
                <option value="">Seleccionar</option>
                {crossNumericFields.map((field) => (
                  <option key={field} value={field}>
                    {getFieldLabel(field)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="analysis-actions">
            <button type="button" onClick={onCrossCalculate} disabled={statisticsState.status === 'loading' || !crossTargetLayer || !crossGroupLayer || !crossGroupField}>
              {scope === 'global' ? 'Calcular cruce global' : 'Calcular cruce del area actual'}
            </button>
            <span>{scope === 'global' ? 'Cruzada global - capas completas.' : 'Resultado parcial calculado sobre el area visible.'}</span>
          </div>
          {crossResult ? (
            <p className="analysis-note">
              Objetivo: {formatNumber(crossResult.targetFeatureCount)} features. Agrupamiento: {formatNumber(crossResult.groupFeatureCount)} features. Coincidencias:{' '}
              {formatNumber(crossResult.matchedFeatureCount)}.
            </p>
          ) : null}
        </>
      )}

      <dl className="analysis-kpis">
        <div>
          <dt>Features</dt>
          <dd>{formatNumber(statisticsState.featureCount || rows.reduce((total, row) => total + row.count, 0))}</dd>
        </div>
        <div>
          <dt>{metricLabel}</dt>
          <dd>{formatMetricValue(metricKpiValue, activeMetric, activeNumericField)}</dd>
        </div>
        <div>
          <dt>{mode === 'cross' ? 'Grupos' : simpleResult?.geometryAreaM2 ? 'Superficie geometrica' : 'Campos'}</dt>
          <dd>{mode === 'cross' ? formatNumber(crossResult?.groupFeatureCount ?? 0) : simpleResult?.geometryAreaM2 ? `${formatNumber(simpleResult.geometryAreaM2 / 10000, 2)} ha` : formatNumber(fields.length)}</dd>
        </div>
      </dl>

      <div className="analysis-chart">
        <div className="donut-chart" style={{ background: donut }} aria-hidden="true" />
        <div className="bar-chart">
          {rows.length ? (
            rows.map((row) => (
              <button key={row.label} type="button" className="bar-row" onClick={() => onSelectRow(row)}>
                <span>{row.label}</span>
                <strong>{formatMetricValue(row.metricValue, activeMetric, activeNumericField)}</strong>
                <i style={{ width: `${Math.max(4, (row.metricValue / maxValue) * 100)}%` }} />
              </button>
            ))
          ) : (
            <p>
              {mode === 'cross'
                ? 'Configure el cruce y pulse Calcular.'
                : 'Seleccione una capa con snapshot local sincronizado.'}
            </p>
          )}
        </div>
      </div>

      <div className="analysis-actions">
        <button type="button" onClick={onClearSelection}>
          Limpiar seleccion estadistica
        </button>
        <button type="button" onClick={onExportCsv} disabled={!rows.length}>
          Exportar resumen CSV
        </button>
      </div>
    </section>
  );
}

function LegacyDashboardPanelView({
  layers,
  selectedLayer,
  fields,
  categoryFields,
  numericFields,
  state,
  statisticsState,
  rows,
  metricTotal,
  onChange,
  onSelectRow,
  onClearSelection,
  onExportCsv,
  onClose,
}: {
  layers: CatalogLayer[];
  selectedLayer: CatalogLayer | undefined;
  fields: string[];
  categoryFields: string[];
  numericFields: string[];
  state: DashboardState;
  statisticsState: StatisticsPanelState;
  rows: DashboardRow[];
  metricTotal: number;
  onChange: (state: DashboardState) => void;
  onSelectRow: (row: DashboardRow) => void;
  onClearSelection: () => void;
  onExportCsv: () => void;
  onClose: () => void;
}) {
  const categoryField = state.categoryField || categoryFields[0] || '';
  const maxValue = Math.max(1, ...rows.map((row) => row.metricValue));
  const metricLabel = state.metric === 'count' ? 'Cantidad' : state.metric === 'sum' ? 'Suma' : 'Promedio';
  const statusLabel =
    statisticsState.status === 'loading'
      ? 'Calculando...'
      : statisticsState.status === 'partial'
        ? 'Datos parciales'
        : statisticsState.status === 'empty'
          ? 'Sin datos'
          : statisticsState.status === 'error'
            ? 'Error al consultar estadisticas'
            : 'Listo';
  const colors = ['#1f78b4', '#33a02c', '#ff7f00', '#6a3d9a', '#e31a1c', '#b15928', '#a6cee3', '#fb9a99'];
  let cursor = 0;
  const donut =
    rows.length && metricTotal
      ? `conic-gradient(${rows
          .map((row, index) => {
            const start = cursor;
            const size = ((state.metric === 'avg' ? row.count : row.metricValue) / metricTotal) * 100;
            cursor += size;
            return `${colors[index % colors.length]} ${start}% ${cursor}%`;
          })
          .join(', ')})`
      : 'conic-gradient(#cbd5e1 0 100%)';

  return (
    <section className="analysis-panel" aria-label="Panel de estadísticas" onClick={(event) => event.stopPropagation()}>
      <header>
        <div>
          <h2>Estadísticas</h2>
          <p>{selectedLayer ? selectedLayer.name : 'Sin capa WFS activa'}</p>
        </div>
        <button type="button" onClick={onClose}>
          Cerrar
        </button>
      </header>

      <div className="analysis-status" data-status={statisticsState.status}>
        <strong>{statusLabel}</strong>
        <span>{statisticsState.scopeLabel}</span>
        <span>{statisticsState.source === 'local-snapshot' ? 'Fuente: dataset local sincronizado desde WFS' : statisticsState.source === 'wfs-proxy' ? 'Fuente: WFS en vivo (fallback)' : 'Fuente: datos visibles en mapa'}</span>
        <span>{statisticsState.updatedAt ? `Sincronizado: ${new Date(statisticsState.updatedAt).toLocaleString()}` : 'Sin sincronizacion'}</span>
        {statisticsState.usedPropertyName ? <span>Consulta optimizada con propertyName.</span> : null}
        {statisticsState.error ? <span className="analysis-error">{statisticsState.error}</span> : null}
        {statisticsState.warnings.map((warning) => (
          <span key={warning}>{warning}</span>
        ))}
      </div>

      <div className="analysis-controls">
        <label>
          Capa
          <select value={selectedLayer?.id ?? ''} onChange={(event) => onChange({ ...state, layerId: event.currentTarget.value, categoryField: '', numericField: '' })}>
            <option value="">Seleccionar</option>
            {layers.map((layer) => (
              <option key={layer.id} value={layer.id}>
                {layer.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Categoria
          <select value={categoryField} onChange={(event) => onChange({ ...state, categoryField: event.currentTarget.value })}>
            <option value="">Sin categoria</option>
            {categoryFields.map((field) => (
              <option key={field} value={field}>
                {dashboardFieldLabel(field)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Metrica
          <select value={state.metric} onChange={(event) => onChange({ ...state, metric: event.currentTarget.value as DashboardMetric })}>
            <option value="count">Cantidad</option>
            <option value="sum">Suma campo numerico</option>
            <option value="avg">Promedio campo numerico</option>
          </select>
        </label>
        <label>
          Campo numerico
          <select
            value={state.numericField}
            disabled={state.metric === 'count'}
            onChange={(event) => onChange({ ...state, numericField: event.currentTarget.value })}
          >
            <option value="">Seleccionar</option>
            {numericFields.map((field) => (
              <option key={field} value={field}>
                {getFieldLabel(field)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <dl className="analysis-kpis">
        <div>
          <dt>Features</dt>
          <dd>{formatNumber(statisticsState.featureCount || rows.reduce((total, row) => total + row.count, 0))}</dd>
        </div>
        <div>
          <dt>{metricLabel}</dt>
          <dd>{formatMetricValue(rows.reduce((total, row) => total + row.metricValue, 0), state.metric, state.numericField)}</dd>
        </div>
        <div>
          <dt>Campos</dt>
          <dd>{formatNumber(fields.length)}</dd>
        </div>
      </dl>

      <div className="analysis-chart">
        <div className="donut-chart" style={{ background: donut }} aria-hidden="true" />
        <div className="bar-chart">
          {rows.length ? (
            rows.map((row) => (
              <button key={row.label} type="button" className="bar-row" onClick={() => onSelectRow(row)}>
                <span>{row.label}</span>
                <strong>{formatMetricValue(row.metricValue, state.metric, state.numericField)}</strong>
                <i style={{ width: `${Math.max(4, (row.metricValue / maxValue) * 100)}%` }} />
              </button>
            ))
          ) : (
            <p>Active una capa WFS o acerquese al area de interes. Si la consulta WFS no responde, el panel lo indicara sin maquillar resultados.</p>
          )}
        </div>
      </div>

      <div className="analysis-actions">
        <button type="button" onClick={onClearSelection}>
          Limpiar selección estadística
        </button>
        <button type="button" onClick={onExportCsv} disabled={!rows.length}>
          Exportar resumen CSV
        </button>
      </div>
    </section>
  );
}

function PrintPanelView({
  settings,
  activePreset,
  message,
  onChange,
  onExport,
  onClose,
}: {
  settings: PrintSettings;
  activePreset: ThematicMapPreset | null;
  message: string | null;
  onChange: (settings: PrintSettings) => void;
  onExport: () => void;
  onClose: () => void;
}) {
  const update = (patch: Partial<PrintSettings>) => onChange({ ...settings, ...patch });
  return (
    <section className="print-panel" aria-label="Impresion cartografica" onClick={(event) => event.stopPropagation()}>
      <header>
        <div>
          <h2>Impresion</h2>
          <p>{activePreset ? activePreset.title : 'Vista actual del visor'}</p>
        </div>
        <button type="button" onClick={onClose}>
          Cerrar
        </button>
      </header>
      <label>
        Titulo
        <input value={settings.title} onChange={(event) => update({ title: event.currentTarget.value })} />
      </label>
      <label>
        Subtitulo
        <input value={settings.subtitle} onChange={(event) => update({ subtitle: event.currentTarget.value })} />
      </label>
      <label>
        Autor
        <input value={settings.author} onChange={(event) => update({ author: event.currentTarget.value })} />
      </label>
      <label>
        Plantilla
        <select value={settings.template} onChange={(event) => update({ template: event.currentTarget.value as PrintTemplate })}>
          <option value="A4-landscape">A4 horizontal</option>
          <option value="A4-portrait">A4 vertical</option>
          <option value="A3-landscape">A3 horizontal</option>
          <option value="A3-portrait">A3 vertical</option>
        </select>
      </label>
      <label>
        Mapa base para informe
        <select value={settings.reportBase} onChange={(event) => update({ reportBase: event.currentTarget.value as PrintSettings['reportBase'] })}>
          <option value="esri">Esri World Imagery</option>
          <option value="osm">OpenStreetMap</option>
          <option value="light">Fondo claro tecnico</option>
        </select>
      </label>
      <fieldset>
        <legend>Elementos</legend>
        {[
          ['useRecommendedFields', 'Usar campos recomendados'],
          ['includeAllAttributes', 'Incluir todos los atributos'],
          ['includeMap', 'Mapa'],
          ['includeLegend', 'Leyenda'],
          ['includeActiveLayers', 'Capas activas'],
          ['includeAttributes', 'Atributos'],
          ['includeStatistics', 'Estadisticas'],
          ['includeMeasurements', 'Mediciones'],
          ['includeCoordinates', 'Coordenadas'],
          ['includeNorth', 'Norte'],
          ['includeScale', 'Escala'],
          ['includeDate', 'Fecha'],
          ['includeSource', 'Fuente'],
          ['showArea', 'Area imprimible'],
        ].map(([key, label]) => (
          <label key={key}>
            <input type="checkbox" checked={Boolean(settings[key as keyof PrintSettings])} onChange={(event) => update({ [key]: event.currentTarget.checked } as Partial<PrintSettings>)} />
            {label}
          </label>
        ))}
      </fieldset>
      <div className="print-actions">
        <button type="button" onClick={onExport}>
          Generar informe tecnico
        </button>
      </div>
      <p className="print-limitation">La captura usa una base compatible con CORS y restaura el mapa del visor al finalizar.</p>
      {message ? <p className="print-message">{message}</p> : null}
    </section>
  );
}

function ReportPreviewView({ html, onClose }: { html: string; onClose: () => void }) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  return (
    <section className="report-preview" aria-label="Informe tecnico" onClick={(event) => event.stopPropagation()}>
      <header>
        <div>
          <h2>Informe tecnico</h2>
          <p>Vista previa imprimible</p>
        </div>
        <div>
          <button type="button" onClick={() => iframeRef.current?.contentWindow?.print()}>
            Imprimir
          </button>
          <button type="button" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </header>
      <iframe ref={iframeRef} title="Informe tecnico PortalGIS IDECAM" srcDoc={html} />
    </section>
  );
}

function MeasureToolbar({
  mode,
  result,
  onModeChange,
  onClear,
}: {
  mode: MeasureMode | null;
  result: string;
  onModeChange: (mode: MeasureMode) => void;
  onClear: () => void;
}) {
  return (
    <div className="measure-toolbar" aria-label="Herramientas de medicion">
      <span className="measure-title" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <path d="M4 15.5 15.5 4 20 8.5 8.5 20 4 15.5Zm3.6-.1.9.9 1.4-1.4.9.9-1.4 1.4.9.9 7-7-2.7-2.7-7 7Z" />
        </svg>
        Medicion
      </span>
      <button type="button" aria-pressed={mode === 'distance'} onClick={() => onModeChange('distance')}>
        Distancia
      </button>
      <button type="button" aria-pressed={mode === 'area'} onClick={() => onModeChange('area')}>
        Area
      </button>
      <button type="button" onClick={onClear}>
        Limpiar
      </button>
      <output>{result || (mode ? 'Dibuje en el mapa' : 'Medicion apagada')}</output>
    </div>
  );
}


function DigitalizeToolbar({
  mode,
  editMode,
  identifyActive,
  result,
  onIdentify,
  onEditModeChange,
  onModeChange,
  onClear,
  onExport,
}: {
  mode: DigitalizeMode | null;
  editMode: boolean;
  identifyActive: boolean;
  result: string;
  onIdentify: () => void;
  onEditModeChange: () => void;
  onModeChange: (mode: DigitalizeMode) => void;
  onClear: () => void;
  onExport: () => void;
}) {
  return (
    <div className="digitalize-toolbar" aria-label="Herramientas de digitalización">
      <span className="measure-title" aria-hidden="true">✎ Digitalizar</span>
      <button type="button" aria-pressed={identifyActive} onClick={onIdentify}>Identificar</button>
      <button type="button" aria-pressed={mode === 'Point'} onClick={() => onModeChange('Point')}>Punto</button>
      <button type="button" aria-pressed={mode === 'LineString'} onClick={() => onModeChange('LineString')}>Línea</button>
      <button type="button" aria-pressed={mode === 'Polygon'} onClick={() => onModeChange('Polygon')}>Polígono</button>
      <button type="button" aria-pressed={editMode} onClick={onEditModeChange}>Editar vértices</button>
      <button type="button" onClick={onExport}>GeoJSON</button>
      <button type="button" onClick={onClear}>Limpiar</button>
      <output>{editMode ? 'Edición de vértices activa' : result || (mode ? 'Click izq vértices · click der finaliza · ESC cancela' : 'Modo identificar activo')}</output>
    </div>
  );
}

function MeasureLiveOverlay({ live }: { live: MeasureLive }) {
  return (
    <div className="measure-live" style={{ left: live.x, top: live.y }}>
      {live.lines.map((line) => (
        <span key={line}>{line}</span>
      ))}
    </div>
  );
}

function GroupCheckbox({ node, visibleIds, onToggle }: { node: PortalGroupNode; visibleIds: Set<string>; onToggle: (checked: boolean) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const ids = visibleLayerIdsForNode(node);
  const checkedCount = ids.filter((id) => visibleIds.has(id)).length;
  const checked = ids.length > 0 && checkedCount === ids.length;
  const indeterminate = checkedCount > 0 && checkedCount < ids.length;

  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  });

  return (
    <input
      ref={inputRef}
      type="checkbox"
      checked={checked}
      aria-checked={indeterminate ? 'mixed' : checked}
      aria-label={`Alternar grupo ${node.name}`}
      data-indeterminate={indeterminate ? 'true' : 'false'}
      onChange={(event) => onToggle(event.currentTarget.checked)}
      onClick={(event) => event.stopPropagation()}
    />
  );
}

function TreeNodeView({
  node,
  statuses,
  visibleIds,
  filters,
  onToggleLayer,
  onToggleGroup,
  onLayerContextMenu,
}: {
  node: PortalNode;
  statuses: Record<string, LayerStatus>;
  visibleIds: Set<string>;
  filters: Record<string, LayerFilter>;
  onToggleLayer: (layer: CatalogLayer) => void;
  onToggleGroup: (node: PortalGroupNode, checked: boolean) => void;
  onLayerContextMenu: (event: MouseEvent, layer: CatalogLayer) => void;
}) {
  if (isLayer(node)) {
    const status = statuses[node.id] ?? 'apagada';
    const opacity = PORTAL_SERVICE_AREA_LAYER_IDS.has(node.id)
      ? '40%'
      : node.id === PORTAL_DISTRICTS_LAYER_ID
        ? '5%'
        : isPortalParcelLayer(node)
          ? '30%'
          : undefined;
    const hasFilter = Boolean(filters[node.id]?.field && filters[node.id]?.value.trim());
    return (
      <label className="layer-row" data-layer-id={node.id} data-layer-status={status} onContextMenu={(event) => onLayerContextMenu(event, node)}>
        <input type="checkbox" checked={visibleIds.has(node.id)} onChange={() => onToggleLayer(node)} />
        <span className={`status-dot ${status}`} aria-hidden="true" />
        <span className="layer-text">
          <span className="layer-name">{node.name}</span>
          <span className="layer-meta">
            {statusLabel(node, status)} - {node.effectiveSrs ?? 'sin CRS'}
            {opacity ? ` - relleno ${opacity}` : ''}
            {hasFilter ? ' - filtro' : ''}
          </span>
        </span>
      </label>
    );
  }

  return (
    <details className="group-node" open={node.expanded !== false} data-group-id={node.id}>
      <summary>
        <GroupCheckbox node={node} visibleIds={visibleIds} onToggle={(checked) => onToggleGroup(node, checked)} />
        <span>{node.name}</span>
      </summary>
      <div className="group-children">
        {sortedNodes(node.groups).map((group) => (
          <TreeNodeView
            key={group.id}
            node={group}
            statuses={statuses}
            visibleIds={visibleIds}
            filters={filters}
            onToggleLayer={onToggleLayer}
            onToggleGroup={onToggleGroup}
            onLayerContextMenu={onLayerContextMenu}
          />
        ))}
        {sortedNodes(node.layers).map((layer) => (
          <TreeNodeView
            key={layer.id}
            node={layer}
            statuses={statuses}
            visibleIds={visibleIds}
            filters={filters}
            onToggleLayer={onToggleLayer}
            onToggleGroup={onToggleGroup}
            onLayerContextMenu={onLayerContextMenu}
          />
        ))}
      </div>
    </details>
  );
}

function LayerContextMenuView({
  menu,
  layer,
  onZoom,
  onFilters,
  onAttributes,
}: {
  menu: LayerContextMenu;
  layer: CatalogLayer | undefined;
  onZoom: (layer: CatalogLayer) => void;
  onFilters: (layer: CatalogLayer) => void;
  onAttributes: (layer: CatalogLayer) => void;
}) {
  if (!layer) return null;

  return (
    <div
      className="context-menu"
      style={{ left: Math.min(menu.x, window.innerWidth - 220), top: Math.min(menu.y, window.innerHeight - 120) }}
      onClick={(event) => event.stopPropagation()}
      role="menu"
    >
      <strong>{layer.name}</strong>
      <button type="button" onClick={() => onZoom(layer)} role="menuitem">
        Zoom a la capa
      </button>
      <button type="button" onClick={() => onFilters(layer)} role="menuitem">
        Filtros
      </button>
      <button type="button" onClick={() => onAttributes(layer)} role="menuitem">
        Ver atributos
      </button>
    </div>
  );
}

function LayerFilterPanelView({
  panel,
  layer,
  fields,
  filter,
  onChange,
  onClear,
  onClose,
  onApply,
}: {
  panel: LayerFilterPanel;
  layer: CatalogLayer | undefined;
  fields: string[];
  filter: LayerFilter | undefined;
  onChange: (patch: Partial<LayerFilter>) => void;
  onClear: () => void;
  onClose: () => void;
  onApply: () => void;
}) {
  if (!layer) return null;
  const field = filter?.field ?? '';
  const operator = filter?.operator ?? 'contains';

  return (
    <section
      className="filter-popover"
      style={{ left: Math.min(panel.x, window.innerWidth - 360), top: Math.min(panel.y, window.innerHeight - 280) }}
      onClick={(event) => event.stopPropagation()}
      aria-label={`Filtros de ${layer.name}`}
    >
      <header>
        <div>
          <h2>Filtros</h2>
          <p>{layer.name}</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Cerrar filtros">
          Cerrar
        </button>
      </header>

      {fields.length ? (
        <div className="filter-grid">
          <label>
            Campo
            <select value={field} onChange={(event) => onChange({ field: event.currentTarget.value })}>
              <option value="">Seleccionar</option>
              {fields.map((fieldName) => (
                <option key={fieldName} value={fieldName}>
                  {getFieldLabel(fieldName)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Operador
            <select value={operator} onChange={(event) => onChange({ operator: event.currentTarget.value as FilterOperator })}>
              <option value="contains">contains</option>
              <option value="equals">equals</option>
            </select>
          </label>
          <label>
            Valor
            <input value={filter?.value ?? ''} onChange={(event) => onChange({ value: event.currentTarget.value })} />
          </label>
          <div className="filter-actions">
            <button type="button" onClick={onApply}>
              Aplicar
            </button>
            <button type="button" onClick={onClear}>
              Limpiar
            </button>
          </div>
        </div>
      ) : (
        <p className="filter-empty">No hay features cargadas para inferir campos.</p>
      )}
    </section>
  );
}

function AttributeTableView({
  layer,
  features,
  total,
  query,
  onQueryChange,
  onSelect,
  onClose,
}: {
  layer: CatalogLayer;
  features: Feature[];
  total: number | null;
  query: string;
  onQueryChange: (query: string) => void;
  onSelect: (layer: CatalogLayer, feature: Feature) => void;
  onClose: () => void;
}) {
  const [rowMenu, setRowMenu] = useState<{ feature: Feature; x: number; y: number } | null>(null);
  const fields = visibleFieldsForLayer(layer, features);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const rows = normalizedQuery
    ? features.filter((feature) =>
        featureAttributes(feature).some(([key, value]) => `${key} ${value}`.toLocaleLowerCase().includes(normalizedQuery)),
      )
    : features;

  return (
    <section className="attribute-table" aria-label={`Tabla de atributos de ${layer.name}`} onClick={(event) => event.stopPropagation()}>
      <header>
        <div>
          <h2>Ver atributos</h2>
          <p>
            {layer.name} - {rows.length} visibles de {total ?? features.length} totales
          </p>
        </div>
        <button type="button" onClick={onClose} aria-label="Cerrar tabla de atributos">
          Cerrar
        </button>
      </header>
      <label className="table-search">
        Filtro rapido
        <input value={query} onChange={(event) => onQueryChange(event.currentTarget.value)} />
      </label>
      {features.length && fields.length ? (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                {fields.map((field) => (
                  <th key={field}>{getFieldLabel(field)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((feature, index) => (
                <tr key={index} onClick={() => onSelect(layer, feature)} onContextMenu={(event) => { event.preventDefault(); setRowMenu({ feature, x: event.clientX, y: event.clientY }); }}>
                  {fields.map((field) => (
                    <td key={field}>{formatValue(feature.get(field))}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="filter-empty">No hay features cargadas para esta capa.</p>
      )}
      {rowMenu ? (
        <div className="context-menu" style={{ left: rowMenu.x, top: rowMenu.y }}>
          <strong>{isPortalParcelLayer(layer) ? 'Parcela' : 'Objeto'}</strong>
          <button type="button" onClick={() => { onSelect(layer, rowMenu.feature); setRowMenu(null); }}>Zoom e identificar</button>
          <button type="button" onClick={() => { onSelect(layer, rowMenu.feature); setRowMenu(null); }}>Agregar al informe</button>
          <button type="button" onClick={() => { const value = featureAttributes(rowMenu.feature).find(([key]) => /nomen/i.test(key))?.[1] ?? ''; void navigator.clipboard.writeText(value).catch(() => undefined); setRowMenu(null); }}>Copiar nomenclatura</button>
          <button type="button" onClick={() => { const value = featureAttributes(rowMenu.feature).find(([key]) => /padron.*ren|padron/i.test(key))?.[1] ?? ''; void navigator.clipboard.writeText(value).catch(() => undefined); setRowMenu(null); }}>Copiar padron rentas</button>
        </div>
      ) : null}
    </section>
  );
}

function IdentifyPopupView({ popup, onClose }: { popup: IdentifyPopup; onClose: () => void }) {
  return (
    <section
      className="identify-popup"
      style={{ left: Math.min(Math.max(popup.x + 14, 12), window.innerWidth - 380), top: Math.max(popup.y + 14, 12) }}
      aria-label="Atributos identificados"
    >
      <header>
        <h2>Identificacion</h2>
        <button type="button" onClick={onClose} aria-label="Cerrar identificacion">
          Cerrar
        </button>
      </header>
      <div className="identify-results">
        {popup.boundaryHit ? <p className="identify-boundary">Click sobre límite parcelario: se muestran candidatas cercanas.</p> : null}
        {popup.items.map((item, index) => (
          <article key={item.id} className="identify-card">
            {index === 1 && isParcelLayer(item.layerName) ? <p className="identify-secondary-title">Otras parcelas detectadas cerca del click</p> : null}
            <h3>{index === 0 && isParcelLayer(item.layerName) ? 'Parcela seleccionada' : item.layerName}</h3>
            {index === 0 && isParcelLayer(item.layerName) ? <p>{item.layerName}</p> : null}
            <dl>
              {item.attributes.map(([key, value]) => (
                <div key={key}>
                  <dt>{getFieldLabel(key)}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
