// Twin Worlds — a small static server for local play-testing: serves game/
// over HTTP so the browser loads the modules as files (a file:// open would
// block ES module imports). Run `node serve.ts` (port 8080) or
// `node serve.ts --port 8090`, then open http://localhost:8080/.

import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), 'game');

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

function portFromArgs(): number {
  const flag = process.argv.indexOf('--port');
  const value = flag >= 0 ? Number(process.argv[flag + 1]) : 8080;
  return Number.isInteger(value) && value > 0 && value < 65536 ? value : 8080;
}

const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const rel = normalize(url.pathname.replace(/^\/+/, '') || 'index.html');
  const file = join(ROOT, rel);
  if (!file.startsWith(ROOT) || !existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('Not found\n');
    return;
  }
  const mime = MIME[extname(file).toLowerCase()] ?? 'application/octet-stream';
  res.writeHead(200, { 'content-type': mime });
  res.end(readFileSync(file));
});

const port = portFromArgs();
server.listen(port, () => {
  console.log(`Twin Worlds at http://localhost:${port}/`);
});
