import { WfsProxyService } from './wfs-proxy.service';

export type StatisticsMetric = 'count' | 'sum' | 'avg';
export type StatisticsFilterOperator = 'contains' | 'equals';

export interface StatisticsFilter {
  field: string;
  operator: StatisticsFilterOperator;
  value: string;
}

export interface StatisticsLayer {
  id: string;
  name: string;
  endpointUrl: string | null;
  typename: string | null;
  effectiveSrs: string | null;
  version: string | null;
  fields: unknown;
}

export interface StatisticsQuery {
  layer: StatisticsLayer;
  bbox: number[];
  mapCrs: string;
  categoryField: string;
  numericField?: string;
  filters?: StatisticsFilter[];
  irrigationOnly?: boolean;
}

interface StatisticsGroup {
  category: string;
  count: number;
  sum: number;
  avg: number;
}

interface FeatureProperties {
  properties?: Record<string, unknown>;
}

const PAGE_SIZE = 250;
const MAX_FEATURES = 1500;
const IRRIGATION_STATS_FIELDS = [
  'Tipo_der_r',
  'Concesion',
  'Uso_riego',
  'CC_PP_rieg',
  'Sup_empad_',
  'SUPERFICIE',
  'SUPERFIC_1',
  'Departamen',
  'DEPARTAMEN',
  'Distrito',
  'DISTRITO',
];
const IRRIGATION_RIGHT_FIELDS = ['Tipo_der_r', 'Concesion', 'tipo_der_r'];

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
  for (const field of IRRIGATION_RIGHT_FIELDS) {
    const normalized = normalizeIrrigationRightValue(properties[field]);
    if (normalized) return normalized;
  }
  return null;
}

function layerFieldNames(fields: unknown): string[] {
  return Array.isArray(fields) ? fields.filter((field): field is string => typeof field === 'string') : [];
}

function orderedFields(fields: string[]): string[] {
  return [...new Set(fields.filter(Boolean))];
}

function propertiesFromPayload(data: unknown): Record<string, unknown>[] {
  if (!data || typeof data !== 'object') return [];
  const features = (data as { features?: FeatureProperties[] }).features;
  if (!Array.isArray(features)) return [];
  return features.map((feature) => feature.properties ?? {});
}

function numericValue(properties: Record<string, unknown>, field?: string): number {
  if (!field) return 0;
  const value = Number(String(properties[field] ?? '').replace(',', '.'));
  return Number.isFinite(value) ? value : 0;
}

function categoryValue(properties: Record<string, unknown>, field: string): string {
  if (field === '__irrigation_right__') return irrigationRightFromProperties(properties) ?? 'Sin dato / NULL';
  const value = properties[field];
  if (value === null || value === undefined || String(value).trim() === '') return 'Sin dato / NULL';
  return String(value).trim();
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

function buildPropertyFields(query: StatisticsQuery): string[] {
  const layerFields = layerFieldNames(query.layer.fields);
  const requested = [
    query.categoryField === '__irrigation_right__' ? '' : query.categoryField,
    query.numericField ?? '',
    ...(query.filters ?? []).map((filter) => filter.field),
  ];

  if (query.categoryField === '__irrigation_right__' || query.irrigationOnly) {
    requested.push(...IRRIGATION_STATS_FIELDS);
  }

  const existing = requested.filter((field) => layerFields.includes(field));
  return orderedFields(existing);
}

function irrigationCqlForLayer(fields: string[]): string | undefined {
  const clauses: string[] = [];
  if (fields.includes('Tipo_der_r')) clauses.push("(Tipo_der_r IS NOT NULL AND Tipo_der_r <> '')");
  if (fields.includes('Concesion')) clauses.push("(Concesion IS NOT NULL AND Concesion <> '')");
  return clauses.length ? clauses.join(' OR ') : undefined;
}

export class StatisticsService {
  constructor(private readonly wfs = new WfsProxyService()) {}

  async query(input: StatisticsQuery) {
    const warnings: string[] = [];
    const layerFields = layerFieldNames(input.layer.fields);
    const propertyFields = buildPropertyFields(input);
    const cqlFilter = input.irrigationOnly ? irrigationCqlForLayer(layerFields) : undefined;

    if (!input.layer.endpointUrl || !input.layer.typename) {
      throw new Error('La capa no tiene endpoint WFS o typename.');
    }

    if (!propertyFields.length) {
      warnings.push('No se pudo limitar propertyName porque los campos requeridos no existen en el catalogo de la capa.');
    }

    const bbox = input.bbox.join(',');
    const rows: Record<string, unknown>[] = [];
    let startIndex = 0;
    let usedPropertyName = Boolean(propertyFields.length);
    let usedCqlFilter = Boolean(cqlFilter);

    while (rows.length < MAX_FEATURES) {
      const request = {
        targetUrl: input.layer.endpointUrl,
        typeName: input.layer.typename,
        version: input.layer.version && input.layer.version !== 'auto' ? input.layer.version : '1.1.0',
        layerCrs: input.layer.effectiveSrs ?? 'EPSG:4326',
        mapCrs: input.mapCrs,
        bbox,
        count: PAGE_SIZE,
        startIndex,
        cqlFilter: usedCqlFilter ? cqlFilter : undefined,
        propertyName: usedPropertyName ? propertyFields.join(',') : undefined,
      };

      let result = await this.wfs.getFeature(request);
      if (result.status >= 400 && usedPropertyName) {
        warnings.push('El WFS rechazo propertyName; se reintento la consulta estadistica con atributos completos.');
        usedPropertyName = false;
        result = await this.wfs.getFeature({ ...request, propertyName: undefined });
      }
      if (result.status >= 400 && usedCqlFilter) {
        warnings.push('El WFS rechazo el filtro CQL; la inclusion de derecho de riego se aplico despues de consultar los datos.');
        usedCqlFilter = false;
        result = await this.wfs.getFeature({ ...request, cqlFilter: undefined, propertyName: usedPropertyName ? propertyFields.join(',') : undefined });
      }
      if (result.status >= 400) {
        throw new Error(`El WFS respondio con estado ${result.status}.`);
      }

      let page = propertiesFromPayload(result.data);
      if (!page.length && usedCqlFilter && startIndex === 0) {
        warnings.push('El WFS devolvio 0 features con CQL; se reintento sin CQL y se filtro por Tipo_der_r/Concesion en el API.');
        usedCqlFilter = false;
        result = await this.wfs.getFeature({ ...request, cqlFilter: undefined });
        if (result.status >= 400) throw new Error(`El WFS respondio con estado ${result.status}.`);
        page = propertiesFromPayload(result.data);
      }
      rows.push(...page);
      if (page.length < PAGE_SIZE) break;
      startIndex += PAGE_SIZE;
    }

    const limitedRows = rows.slice(0, MAX_FEATURES);
    const filteredRows = limitedRows.filter((properties) => {
      if (input.irrigationOnly && !irrigationRightFromProperties(properties)) return false;
      return matchesFilters(properties, input.filters);
    });

    const groups = new Map<string, StatisticsGroup>();
    for (const properties of filteredRows) {
      const category = categoryValue(properties, input.categoryField);
      const current = groups.get(category) ?? { category, count: 0, sum: 0, avg: 0 };
      current.count += 1;
      current.sum += numericValue(properties, input.numericField);
      groups.set(category, current);
    }

    const sortedGroups = [...groups.values()]
      .map((group) => ({ ...group, avg: group.count ? group.sum / group.count : 0 }))
      .sort((a, b) => b.count - a.count);

    const partial = rows.length >= MAX_FEATURES;
    if (partial) warnings.push(`Consulta limitada a ${MAX_FEATURES} features para evitar requests masivas.`);

    return {
      scope: 'viewport' as const,
      source: 'queried' as const,
      status: partial ? 'partial' : filteredRows.length ? 'ready' : 'empty',
      layerId: input.layer.id,
      layerName: input.layer.name,
      featureCount: filteredRows.length,
      rawFeatureCount: rows.length,
      categoryField: input.categoryField,
      numericField: input.numericField ?? null,
      usedPropertyName,
      usedCqlFilter,
      pageSize: PAGE_SIZE,
      maxFeatures: MAX_FEATURES,
      partial,
      updatedAt: new Date().toISOString(),
      groups: sortedGroups,
      warnings,
      author: 'laugis',
    };
  }
}
