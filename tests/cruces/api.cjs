// Servidor de ensayo. El endpoint de cruce es la ruta Fastify del producto.
const { createRequire } = require('node:module');
const fs = require('node:fs');
const path = require('node:path');
const fromApi = createRequire(path.resolve('apps/api/package.json'));
const app = fromApi('fastify')();
app.register(fromApi('./dist/src/routes/local.routes').localRoutes);
app.get('/catalog/tree', () => JSON.parse(fs.readFileSync(path.join(process.env.DATA_DIR, 'tree.json'))));
app.listen({ host: '127.0.0.1', port: 3001 }).catch(error => { console.error(error); process.exit(1); });
