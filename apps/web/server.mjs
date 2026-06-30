import { createReadStream, existsSync, statSync } from 'node:fs';
import { request as httpRequest } from 'node:http';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const distDir = resolve(rootDir, 'dist');
const port = Number(process.env.PORT ?? process.env.WEB_PORT ?? 3000);
const apiTarget = new URL(process.env.API_PROXY_TARGET ?? 'http://localhost:3001');

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

function send(res, status, body, contentType = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'content-type': contentType });
  res.end(body);
}

function proxyApi(req, res, url) {
  const upstreamUrl = new URL(apiTarget);
  upstreamUrl.pathname = url.pathname.replace(/^\/api\/?/, '/') || '/';
  upstreamUrl.search = url.search;

  const headers = { ...req.headers, host: upstreamUrl.host };
  delete headers.connection;
  delete headers['content-length'];
  delete headers.origin;

  const proxyReq = httpRequest(upstreamUrl, { method: req.method, headers }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (error) => {
    send(res, 502, JSON.stringify({ error: 'API no disponible', detail: error.message }), 'application/json; charset=utf-8');
  });

  req.pipe(proxyReq);
}

function fileForPath(pathname) {
  const decodedPath = decodeURIComponent(pathname === '/' ? '/index.html' : pathname);
  const candidate = resolve(distDir, `.${decodedPath}`);
  const insideDist = candidate === distDir || candidate.startsWith(`${distDir}${sep}`);
  if (!insideDist) return null;
  if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  return resolve(distDir, 'index.html');
}

createServer((req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
  if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
    proxyApi(req, res, url);
    return;
  }

  const filePath = fileForPath(url.pathname);
  if (!filePath || !existsSync(filePath)) {
    send(res, 404, 'No encontrado');
    return;
  }

  const contentType = mimeTypes[extname(filePath)] ?? 'application/octet-stream';
  res.writeHead(200, { 'content-type': contentType });
  createReadStream(filePath).pipe(res);
}).listen(port, '0.0.0.0', () => {
  console.log(`PortalGIS web listo en http://0.0.0.0:${port}`);
});
