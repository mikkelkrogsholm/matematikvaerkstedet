import { createLearningApi } from './src/gymnasium/learning/server';
import { createGymnasiumApi } from './src/gymnasium/server';
import { resolve, sep } from 'node:path';
import { createTutorApi } from './src/ai/http';
import { createFp9Api } from './src/fp9/server';
import { createLessonRegistry } from './src/lessons';

const { registry } = await createLessonRegistry();
const tutorApi = createTutorApi();
const fp9Api = createFp9Api();
const gymnasiumApi = createGymnasiumApi();
const learningApi = createLearningApi();
const root = resolve(import.meta.dir, 'dist');
const server = Bun.serve({
  maxRequestBodySize: 2 * 1024 * 1024, idleTimeout: 120,
  hostname: '127.0.0.1', port: Number(process.env.PORT || 4317),
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/learning/')) return learningApi(request);
    if (url.pathname.startsWith('/api/gymnasium/')) return gymnasiumApi(request);
    if (url.pathname.startsWith('/api/ai/')) return tutorApi(request);
    if (url.pathname.startsWith('/api/fp9/')) return fp9Api(request);
    if (url.pathname === '/favicon.ico') return new Response(null, { status: 204 });
    if (url.pathname === '/api/lessons') return Response.json([...registry.values()]);
    let pathname: string;
    try { pathname = decodeURIComponent(url.pathname); } catch { return new Response('Invalid path', { status: 400 }); }
    const path = resolve(root, '.' + (['/','/fp9','/fp9/','/matematik-a','/matematik-a/','/matematik-a/opgaver'].includes(pathname) ? '/index.html' : pathname));
    if (!path.startsWith(root + sep)) return new Response('Not found', { status: 404 });
    const file = Bun.file(path);
    return await file.exists() ? new Response(file) : new Response('Not found', { status: 404 });
  },
});
console.log(`Matematikværkstedet: ${server.url} — ${registry.size} Cordis plugins, Bun ${Bun.version}`);
