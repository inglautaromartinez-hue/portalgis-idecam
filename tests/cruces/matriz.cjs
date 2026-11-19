// node tests/cruces/matriz.cjs [base] (con DATA_DIR sintético y API compilada)
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const path = require('node:path');
const api = createRequire(path.resolve('apps/api/package.json'));
const { LocalDataService } = api('./dist/src/services/local-data.service');
const baseline = process.argv[2] === 'base';

(async () => {
  const app = api('fastify')();
  app.register(api('./dist/src/routes/local.routes').localRoutes);
  for (const target of [0, 1]) for (const group of [0, 1]) for (const crosses of [0, 1]) {
    const payload = { targetLayerId: `objetivo-${target}-0`, groupLayerId: `agrupamiento-${group}-${crosses}`,
      spatialOperation: 'intersects', metric: 'count', groupByField: 'DISTRITO' };
    const res = await app.inject({ method: 'POST', url: '/local/statistics/cross-query', payload });
    assert.equal(res.statusCode, 200);
    const data = res.json();
    const partial = Boolean(!baseline && (target || group));
    assert.equal(data.partial, partial);
    assert.equal(data.status, partial ? 'partial' : baseline || crosses ? 'ready' : 'empty');
    assert.equal(data.matchedFeatureCount, baseline ? 1 : crosses);
    console.log(target, group, crosses, data.matchedFeatureCount, data.status, data.warnings);
  }
  // Caso exacto H04: ambas respuestas truncadas, aun con metadatos de snapshot OK.
  const service = new LocalDataService();
  const query = service.queryFeatures.bind(service);
  service.queryFeatures = async (input) => ({ ...await query(input), partial: true, numberMatched: 2 });
  const response = await service.crossStatistics({ targetLayerId: 'objetivo-0-0',
    groupLayerId: 'agrupamiento-0-1', spatialOperation: 'intersects', metric: 'count', groupByField: 'DISTRITO' });
  assert.equal(response.partial, !baseline);
  assert.equal(response.status, baseline ? 'ready' : 'partial');
  await app.close();
})().catch(error => { console.error(error); process.exitCode = 1; });
