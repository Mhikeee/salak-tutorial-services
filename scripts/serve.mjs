import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { buildSite } from './build.mjs';

const root = await buildSite();
const port = Number(process.env.PORT || 4321);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };

createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
    const safePath = normalize(pathname).replace(/^(\.\.[/\\])+/, '');
    let filePath = join(root, safePath);
    const info = await stat(filePath).catch(() => null);
    if (info?.isDirectory() || !extname(filePath)) filePath = join(filePath, 'index.html');
    const data = await readFile(filePath);
    response.writeHead(200, { 'content-type': types[extname(filePath)] || 'application/octet-stream' });
    response.end(data);
  } catch {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
}).listen(port, () => console.log(`Salak site: http://localhost:${port}`));
