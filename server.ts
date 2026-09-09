import { resolve, sep } from 'node:path';
import { createLessonRegistry } from './src/lessons';

const { registry } = await createLessonRegistry();
const root = resolve(import.meta.dir, 'dist');
const server = Bun.serve({
  hostname: '127.0.0.1', port: Number(process.env.PORT || 4317),
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === '/favicon.ico') return new Response(null, { status: 204 });
    if (url.pathname === '/api/lessons') return Response.json([...registry.values()]);
    let pathname: string;
    try { pathname = decodeURIComponent(url.pathname); } catch { return new Response('Invalid path', { status: 400 }); }
    const path = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!path.startsWith(root + sep)) return new Response('Not found', { status: 404 });
    const file = Bun.file(path);
    return await file.exists() ? new Response(file) : new Response('Not found', { status: 404 });
  },
});
console.log(`Matematikværkstedet: ${server.url} — ${registry.size} Cordis plugins, Bun ${Bun.version}`);
