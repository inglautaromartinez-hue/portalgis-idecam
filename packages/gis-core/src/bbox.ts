import { getProj4, isKnownCrs } from './crs';

export type BBox = [number, number, number, number];

export interface TransformBboxOptions {
  /**
   * Cantidad de divisiones por lado.
   * 1 transforma solo esquinas. 2 agrega punto medio. 8 es más seguro para vistas grandes.
   */
  segmentsPerSide?: number;
}

function assertFiniteBbox(bbox: BBox): void {
  if (bbox.length !== 4 || bbox.some((value) => !Number.isFinite(value))) {
    throw new Error('BBOX inválido: se esperaban 4 números finitos.');
  }
  const [minX, minY, maxX, maxY] = bbox;
  if (minX >= maxX || minY >= maxY) {
    throw new Error('BBOX inválido: minX/minY deben ser menores que maxX/maxY.');
  }
}

export function parseBbox(raw: string): BBox {
  const parts = raw.split(',').slice(0, 4).map((value) => Number(value.trim()));
  assertFiniteBbox(parts as BBox);
  return parts as BBox;
}

export function normalizeBbox(points: Array<[number, number]>): BBox {
  if (!points.length) throw new Error('No hay puntos para normalizar BBOX.');
  const xs = points.map((point) => point[0]).filter(Number.isFinite);
  const ys = points.map((point) => point[1]).filter(Number.isFinite);
  if (xs.length !== points.length || ys.length !== points.length) {
    throw new Error('La transformación produjo coordenadas no finitas.');
  }
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

export function densifyBbox(bbox: BBox, segmentsPerSide = 8): Array<[number, number]> {
  assertFiniteBbox(bbox);
  const [minX, minY, maxX, maxY] = bbox;
  const segments = Math.max(1, Math.floor(segmentsPerSide));
  const points: Array<[number, number]> = [];

  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    const x = minX + (maxX - minX) * t;
    const y = minY + (maxY - minY) * t;
    points.push([x, minY], [x, maxY], [minX, y], [maxX, y]);
  }

  // Eliminar duplicados exactos.
  const seen = new Set<string>();
  return points.filter((point) => {
    const key = `${point[0]},${point[1]}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function transformBbox(
  bbox: BBox,
  sourceCrs: string,
  targetCrs: string,
  options: TransformBboxOptions = {},
): BBox {
  assertFiniteBbox(bbox);
  if (!sourceCrs || !targetCrs) throw new Error('sourceCrs y targetCrs son obligatorios.');

  if (sourceCrs === targetCrs) return bbox;

  if (!isKnownCrs(sourceCrs)) throw new Error(`CRS de origen no registrado: ${sourceCrs}`);
  if (!isKnownCrs(targetCrs)) throw new Error(`CRS de destino no registrado: ${targetCrs}`);

  const proj4 = getProj4();
  const sourcePoints = densifyBbox(bbox, options.segmentsPerSide ?? 8);
  const transformedPoints = sourcePoints.map((point) => proj4(sourceCrs, targetCrs, point) as [number, number]);

  return normalizeBbox(transformedPoints);
}

export function bboxToWfsParam(bbox: BBox, crs: string): string {
  assertFiniteBbox(bbox);
  return `${bbox.join(',')},${crs}`;
}
