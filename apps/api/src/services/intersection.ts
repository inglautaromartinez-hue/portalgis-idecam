type Geometry = { type: string; coordinates: unknown };
type Position = number[];

// A bounding box can reject a pair, but only coordinates establish contact.
function paths(g: Geometry): Position[][] {
  switch (g.type) {
    case 'Point': return [[g.coordinates as Position]];
    case 'MultiPoint': return (g.coordinates as Position[]).map(p => [p]);
    case 'LineString': return [g.coordinates as Position[]];
    case 'MultiLineString':
    case 'Polygon': return g.coordinates as Position[][];
    case 'MultiPolygon': return (g.coordinates as Position[][][]).flat();
    default: throw new Error(`Tipo de geometría no admitido para Intersecta: ${g.type}`);
  }
}

function orientation(a: Position, b: Position, p: Position): number {
  return Math.sign((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]));
}

function onSegment(a: Position, b: Position, p: Position): boolean {
  return p[0] >= Math.min(a[0], b[0]) && p[0] <= Math.max(a[0], b[0])
    && p[1] >= Math.min(a[1], b[1]) && p[1] <= Math.max(a[1], b[1]);
}

function touches(a: Position, b: Position, c: Position, d: Position): boolean {
  const cSide = orientation(a, b, c), dSide = orientation(a, b, d);
  const aSide = orientation(c, d, a), bSide = orientation(c, d, b);
  return (cSide * dSide < 0 && aSide * bSide < 0)
    || (cSide === 0 && onSegment(a, b, c)) || (dSide === 0 && onSegment(a, b, d))
    || (aSide === 0 && onSegment(c, d, a)) || (bSide === 0 && onSegment(c, d, b));
}

function pathsTouch(left: Position[], right: Position[]): boolean {
  // A point acts as a zero-length segment.
  const leftSegments = left.length === 1 ? 1 : left.length - 1;
  const rightSegments = right.length === 1 ? 1 : right.length - 1;
  for (let i = 0; i < leftSegments; i++) {
    const a = left[i], b = left[i + 1] ?? a;
    for (let j = 0; j < rightSegments; j++) {
      const c = right[j], d = right[j + 1] ?? c;
      if (touches(a, b, c, d)) return true;
    }
  }
  return false;
}

export function coordinatesIntersect(a: Geometry, b: Geometry,
  pointInPolygon: (point: Position, polygon: Geometry) => boolean): boolean {
  const left = paths(a), right = paths(b);
  if (left.some(p => right.some(q => pathsTouch(p, q)))) return true;
  // Without boundary contact, each connected path lies wholly inside or outside.
  return (b.type.endsWith('Polygon') && left.some(p => p.length && pointInPolygon(p[0], b)))
    || (a.type.endsWith('Polygon') && right.some(p => p.length && pointInPolygon(p[0], a)));
}
