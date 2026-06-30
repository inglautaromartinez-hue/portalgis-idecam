import axios, { type ResponseType } from 'axios';
import { bboxToWfsParam, parseBbox, transformBbox } from '@portalgis/gis-core';
import { env } from '../config/env';

export type WfsRequestName = 'GetCapabilities' | 'DescribeFeatureType' | 'GetFeature';

export interface WfsBaseParams {
  targetUrl: string;
  version?: string;
}

export interface DescribeFeatureTypeParams extends WfsBaseParams {
  typeName: string;
}

export interface GetFeatureParams extends WfsBaseParams {
  typeName: string;
  bbox?: string;
  mapCrs?: string;
  layerCrs?: string;
  outputFormat?: string;
  cqlFilter?: string;
  propertyName?: string;
  count?: number;
  startIndex?: number;
}

export interface WfsProxyResponse {
  data: unknown;
  contentType: string;
  status: number;
}

const ALLOWED_REQUESTS = new Set<WfsRequestName>(['GetCapabilities', 'DescribeFeatureType', 'GetFeature']);

const responseCache = new Map<string, { expiresAt: number; value: WfsProxyResponse }>();
const CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_GETFEATURE_COUNT = 3000;

function cacheKey(url: URL): string {
  return url.toString();
}

function cloneProxyResponse(response: WfsProxyResponse): WfsProxyResponse {
  return { ...response, data: typeof response.data === 'string' ? response.data : JSON.parse(JSON.stringify(response.data)) };
}

export class WfsProxyService {
  validateTargetUrl(targetUrl: string): URL {
    let url: URL;

    try {
      url = new URL(targetUrl);
    } catch {
      throw new Error('URL WFS inválida.');
    }

    if (url.protocol !== 'https:') {
      throw new Error('Solo se permiten servicios WFS por HTTPS.');
    }

    if (url.username || url.password) {
      throw new Error('No se permiten credenciales embebidas en la URL.');
    }

    if (url.port && url.port !== '443') {
      throw new Error('No se permiten puertos explícitos en la URL WFS.');
    }

    if (!env.WFS_ALLOWLIST.includes(url.hostname)) {
      throw new Error(`Host WFS no permitido: ${url.hostname}`);
    }

    const validPath =
      url.hostname === 'wms.ign.gob.ar'
        ? url.pathname === '/geoserver/ows'
        : url.hostname === 'geonode-cam.marketsis.com.ar'
          ? url.pathname === '/geoserver/wfs'
          : false;

    if (!validPath) {
      throw new Error(`Path WFS no permitido para ${url.hostname}: ${url.pathname}`);
    }

    return url;
  }

  sanitizeCqlFilter(cqlFilter?: string): string | undefined {
    if (!cqlFilter) return undefined;

    if (cqlFilter.length > 3000) {
      throw new Error('CQL_FILTER demasiado largo.');
    }

    const forbidden = /(;|--|\/\*|\*\/|\bDROP\b|\bDELETE\b|\bUPDATE\b|\bINSERT\b|\bALTER\b|\bCREATE\b|\bTRUNCATE\b|\bEXEC\b)/i;
    if (forbidden.test(cqlFilter)) {
      throw new Error('CQL_FILTER contiene tokens no permitidos.');
    }

    const allowedCharacters = /^[\p{L}\p{N}_:\s.,%()=*<>!\-'"]+$/u;
    if (!allowedCharacters.test(cqlFilter)) {
      throw new Error('CQL_FILTER contiene caracteres no permitidos.');
    }

    return cqlFilter;
  }

  sanitizePropertyName(propertyName?: string): string | undefined {
    if (!propertyName) return undefined;
    if (propertyName.length > 1200) throw new Error('propertyName demasiado largo.');

    const fields = propertyName
      .split(',')
      .map((field) => field.trim())
      .filter(Boolean);

    if (!fields.length) return undefined;
    if (fields.some((field) => !/^[\p{L}\p{N}_:. -]+$/u.test(field))) {
      throw new Error('propertyName contiene caracteres no permitidos.');
    }

    return [...new Set(fields)].join(',');
  }

  buildSafeWfsUrl(targetUrl: string, requestName: WfsRequestName, params: Record<string, string | number | undefined>): URL {
    if (!ALLOWED_REQUESTS.has(requestName)) {
      throw new Error(`Request WFS no soportado: ${requestName}`);
    }

    const url = this.validateTargetUrl(targetUrl);
    url.search = '';

    url.searchParams.set('service', 'WFS');
    url.searchParams.set('request', requestName);
    url.searchParams.set('version', String(params.version ?? '1.1.0'));

    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || key === 'version') continue;
      url.searchParams.set(key, String(value));
    }

    return url;
  }

  private async fetch(url: URL, responseType: ResponseType = 'arraybuffer', useCache = true): Promise<WfsProxyResponse> {
    const key = cacheKey(url);
    const cached = useCache ? responseCache.get(key) : undefined;
    if (cached && cached.expiresAt > Date.now()) return cloneProxyResponse(cached.value);

    const response = await axios.get<ArrayBuffer>(url.toString(), {
      timeout: env.WFS_TIMEOUT_MS,
      responseType,
      maxContentLength: env.WFS_MAX_RESPONSE_BYTES,
      maxBodyLength: env.WFS_MAX_RESPONSE_BYTES,
      validateStatus: (status) => status >= 200 && status < 500,
    });

    const contentType = String(response.headers['content-type'] ?? 'application/xml');
    const rawBuffer = Buffer.from(response.data);
    const rawText = rawBuffer.toString('utf-8');
    let result: WfsProxyResponse;

    if (response.status >= 400) {
      result = {
        data: {
          error: 'El servicio WFS respondió con error.',
          status: response.status,
          body: rawText.slice(0, 4000),
        },
        contentType: 'application/json; charset=utf-8',
        status: response.status,
      };
    } else if (contentType.includes('json')) {
      try {
        result = { data: JSON.parse(rawText), contentType: 'application/json; charset=utf-8', status: response.status };
      } catch {
        result = { data: rawText, contentType: 'text/plain; charset=utf-8', status: response.status };
      }
    } else {
      result = { data: rawText, contentType, status: response.status };
    }

    if (useCache && response.status < 400) responseCache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, value: cloneProxyResponse(result) });
    return result;
  }

  async getCapabilities(input: WfsBaseParams): Promise<WfsProxyResponse> {
    const url = this.buildSafeWfsUrl(input.targetUrl, 'GetCapabilities', {
      version: input.version ?? '1.1.0',
    });

    return this.fetch(url);
  }

  async describeFeatureType(input: DescribeFeatureTypeParams): Promise<WfsProxyResponse> {
    const url = this.buildSafeWfsUrl(input.targetUrl, 'DescribeFeatureType', {
      version: input.version ?? '1.1.0',
      typeName: input.typeName,
    });

    return this.fetch(url);
  }

  async getFeature(input: GetFeatureParams): Promise<WfsProxyResponse> {
    const layerCrs = input.layerCrs ?? 'EPSG:4326';
    const mapCrs = input.mapCrs ?? layerCrs;

    let bbox: string | undefined;
    if (input.bbox) {
      const parsed = parseBbox(input.bbox);
      const transformed = transformBbox(parsed, mapCrs, layerCrs, { segmentsPerSide: 8 });
      bbox = bboxToWfsParam(transformed, layerCrs);
    }

    const safeCql = this.sanitizeCqlFilter(input.cqlFilter);
    const safePropertyName = this.sanitizePropertyName(input.propertyName);
    const count = Math.min(Number(input.count ?? 1000), MAX_GETFEATURE_COUNT);

    if (!input.bbox && count > 50) {
      throw new Error('Las consultas WFS sin BBOX solo se permiten para pruebas chicas. Use bbox o reduzca count.');
    }

    const url = this.buildSafeWfsUrl(input.targetUrl, 'GetFeature', {
      version: input.version ?? '1.1.0',
      typeName: input.typeName,
      srsName: layerCrs,
      outputFormat: input.outputFormat ?? 'application/json',
      bbox,
      cql_filter: safeCql,
      propertyName: safePropertyName,
      count,
      startIndex: input.startIndex,
    });

    return this.fetch(url);
  }
}
