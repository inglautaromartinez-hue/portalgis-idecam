import assert from 'node:assert/strict';
import Feature from 'ol/Feature';
import Polygon from 'ol/geom/Polygon';
import { choosePrimaryIdentifyCandidate } from './identifySelection';

const large = new Feature(new Polygon([[[0, 0], [20, 0], [20, 20], [0, 20], [0, 0]]]));
const small = new Feature(new Polygon([[[5, 5], [10, 5], [10, 10], [5, 10], [5, 5]]]));
const containing = choosePrimaryIdentifyCandidate([
  { feature: large, parcel: true },
  { feature: small, parcel: true },
], [7, 7]);
assert.equal(containing.primary?.feature, small);
assert.equal(containing.ordered.length, 2);

const nearest = choosePrimaryIdentifyCandidate([
  { feature: large, parcel: true },
  { feature: small, parcel: true },
], [30, 30]);
assert.equal(nearest.primary?.feature, large);
assert.equal(nearest.boundaryHit, true);

console.log('identifySelection: ok');
