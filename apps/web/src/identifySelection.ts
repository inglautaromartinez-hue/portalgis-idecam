import type Feature from 'ol/Feature';
import type { Coordinate } from 'ol/coordinate';
import { getArea } from 'ol/sphere';

export interface IdentifyCandidate {
  feature: Feature;
  parcel: boolean;
}

function distanceSquared(feature: Feature, coordinate: Coordinate): number {
  const closest = feature.getGeometry()?.getClosestPoint(coordinate);
  return closest ? (closest[0] - coordinate[0]) ** 2 + (closest[1] - coordinate[1]) ** 2 : Number.POSITIVE_INFINITY;
}

export function choosePrimaryIdentifyCandidate<T extends IdentifyCandidate>(candidates: T[], coordinate: Coordinate) {
  const parcels = candidates.filter((candidate) => candidate.parcel && candidate.feature.getGeometry());
  const containing = parcels.filter((candidate) => candidate.feature.getGeometry()?.intersectsCoordinate(coordinate));
  const ranked = [...(containing.length ? containing : parcels.length ? parcels : candidates)].sort((a, b) =>
    containing.length
      ? getArea(a.feature.getGeometry()!, { projection: 'EPSG:3857' }) - getArea(b.feature.getGeometry()!, { projection: 'EPSG:3857' })
      : distanceSquared(a.feature, coordinate) - distanceSquared(b.feature, coordinate),
  );
  const primary = ranked[0] ?? null;
  return {
    primary,
    ordered: primary ? [primary, ...candidates.filter((candidate) => candidate !== primary)] : [],
    boundaryHit: parcels.length > 0 && containing.length !== 1,
  };
}
