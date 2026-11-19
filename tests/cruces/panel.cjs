// Ejecuta el bundle web real y la ruta Fastify sin depender de un servidor gráfico.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const { JSDOM } = require('jsdom');

const [mode, build, checkout = '.'] = process.argv.slice(2);
const baseline = mode === 'base';
const fromApi = createRequire(path.resolve(checkout, 'apps/api/package.json'));
const app = fromApi('fastify')();
app.register(fromApi('./dist/src/routes/local.routes').localRoutes);

const dom = new JSDOM('<style>*{padding:0;border:0px solid}</style><div id="root"></div>',
  { url: 'http://localhost', runScripts: 'outside-only', pretendToBeVisual: true });
const { window } = dom;
const doc = window.document;
window.ResizeObserver = class { observe() {} disconnect() {} unobserve() {} };
window.requestAnimationFrame = () => 0;
Object.defineProperty(window.HTMLElement.prototype, 'offsetWidth', { get: () => 900 });
Object.defineProperty(window.HTMLElement.prototype, 'offsetHeight', { get: () => 620 });

window.fetch = async (url, options = {}) => {
  if (url === '/api/catalog/tree') {
    return Response.json(JSON.parse(fs.readFileSync(path.join(process.env.DATA_DIR, 'tree.json'))));
  }
  const response = await app.inject({ method: options.method ?? 'GET', url: url.replace(/^\/api/, ''),
    payload: options.body, headers: options.headers });
  return Response.json(response.json(), { status: response.statusCode });
};

const assets = path.join(build, 'assets');
const bundle = fs.readdirSync(assets).find(f => f.endsWith('.js'));
window.eval(fs.readFileSync(path.join(assets, bundle), 'utf8'));
const sleep = () => new Promise(resolve => setTimeout(resolve, 15));

async function waitFor(check) {
  for (let i = 0; i < 200; i++) {
    if (check()) return;
    await sleep();
  }
  throw new Error('No se alcanzó el estado esperado del panel.');
}

async function click(text) {
  const button = () => [...doc.querySelectorAll('button')].find(b => b.textContent.trim() === text);
  await waitFor(button);
  button().click();
  await sleep();
}

async function select(label, value) {
  const control = [...doc.querySelectorAll('label')].find(el => el.textContent.trim().startsWith(label)).querySelector('select');
  control.value = value;
  assert.equal(control.value, value);
  control.dispatchEvent(new window.Event('change', { bubbles: true }));
  await sleep();
}

async function run() {
  await click('Estadísticas');
  await click('Cruzada');
  for (const t of [0, 1]) for (const g of [0, 1]) for (const crosses of [0, 1]) {
    await select('Capa objetivo', `objetivo-${t}-0`);
    await select('Capa de agrupamiento', `${baseline ? 'poligono' : 'agrupamiento'}-${g}-${crosses}`);
    await select('Operacion espacial', 'intersects');
    await select('Agrupar por', 'DISTRITO');
    await click('Calcular cruce global');
    const partial = !baseline && Boolean(t || g);
    const status = partial ? 'partial' : crosses ? 'ready' : 'empty';
    const statusBox = doc.querySelector('.analysis-status');
    await waitFor(() => statusBox.dataset.status === status
      && doc.querySelector('.analysis-note')?.textContent.includes(`Coincidencias: ${crosses}.`));
    const messages = [...statusBox.children].map(el => el.textContent);
    const result = doc.querySelector('.bar-chart').textContent;
    if (!baseline) {
      assert.equal(messages.includes('Capa objetivo incompleta.'), Boolean(t));
      assert.equal(messages.includes('Capa de agrupamiento incompleta.'), Boolean(g));
      if (!crosses) assert.equal(result, partial
        ? 'No se encontraron cruces entre las entidades cargadas. Puede haber otros en los datos pendientes.'
        : 'No se encontraron cruces.');
    }
    console.log({ t, g, crosses, status, messages, result });
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; })
  .finally(async () => { dom.window.close(); await app.close(); });
