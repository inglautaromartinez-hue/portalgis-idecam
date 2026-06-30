export type StatisticsStatus = 'idle' | 'loading' | 'ready' | 'partial' | 'empty' | 'error';
export type StatisticsSource = 'visible' | 'local-snapshot' | 'wfs-proxy';
export type StatisticsScope = 'global' | 'area';

export interface StatisticsFilter {
  field: string;
  operator: 'contains' | 'equals';
  value: string;
}

export interface StatisticsGroupResult {
  category: string;
  count: number;
  sum: number;
  avg: number;
  bbox?: number[] | null;
}

export interface StatisticsQueryRequest {
  layerId: string;
  bbox?: number[];
  mapCrs?: string;
  scope?: StatisticsScope;
  polygon?: { type: string; coordinates: unknown[] };
  categoryField: string;
  numericField?: string;
  filters?: StatisticsFilter[];
  irrigationOnly?: boolean;
}

export interface StatisticsQueryResponse {
  scope: StatisticsScope;
  source: 'local-snapshot' | 'wfs-proxy';
  status: StatisticsStatus;
  layerId: string;
  layerName: string;
  featureCount: number;
  rawFeatureCount: number;
  geometryAreaM2?: number;
  categoryField: string;
  numericField: string | null;
  usedPropertyName: boolean;
  pageSize: number | null;
  maxFeatures: number | null;
  partial: boolean;
  updatedAt: string;
  syncedAt?: string;
  groups: StatisticsGroupResult[];
  warnings: string[];
  author: 'laugis';
  sourceLayers?: number;
}

export type SpatialOperation = 'within' | 'intersects' | 'contains';

export interface CrossStatisticsQueryRequest {
  targetLayerId: string;
  groupLayerId: string;
  bbox?: number[];
  mapCrs?: string;
  scope?: StatisticsScope;
  polygon?: { type: string; coordinates: unknown[] };
  spatialOperation: SpatialOperation;
  groupByField: string;
  metric: 'count' | 'sum' | 'avg';
  numericField?: string;
  filters?: StatisticsFilter[];
  irrigationOnly?: boolean;
}

export interface CrossStatisticsResultRow {
  group: string;
  count: number;
  sum: number;
  avg: number;
}

export interface CrossStatisticsQueryResponse {
  scope: StatisticsScope;
  source: 'local-snapshot' | 'wfs-proxy';
  status: StatisticsStatus;
  targetLayerId: string;
  targetLayerName: string;
  groupLayerId: string;
  groupLayerName: string;
  spatialOperation: SpatialOperation;
  groupByField: string;
  metric: 'count' | 'sum' | 'avg';
  numericField: string | null;
  targetFeatureCount: number;
  groupFeatureCount: number;
  matchedFeatureCount: number;
  usedPropertyName: boolean;
  usedCqlFilter: boolean;
  partial: boolean;
  pageSize: number | null;
  maxFeatures: { target: number; group: number } | null;
  updatedAt: string;
  syncedAt?: string;
  results: CrossStatisticsResultRow[];
  warnings: string[];
  author: 'laugis';
  sourceLayers?: number;
}

export async function queryStatistics(apiUrl: string, request: StatisticsQueryRequest, signal?: AbortSignal): Promise<StatisticsQueryResponse> {
  const response = await fetch(`${apiUrl}/local/statistics/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    signal,
  });
  const payload = await response.json();
  if (!response.ok || payload.error) throw new Error(payload.error ?? `HTTP ${response.status}`);
  return payload as StatisticsQueryResponse;
}

export async function queryCrossStatistics(apiUrl: string, request: CrossStatisticsQueryRequest, signal?: AbortSignal): Promise<CrossStatisticsQueryResponse> {
  const response = await fetch(`${apiUrl}/local/statistics/cross-query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    signal,
  });
  const payload = await response.json();
  if (!response.ok || payload.error) throw new Error(payload.error ?? `HTTP ${response.status}`);
  return payload as CrossStatisticsQueryResponse;
}
