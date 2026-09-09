import { CodexProvider } from './codex';
import { parseRequest } from './contracts';
import type { TutorProvider } from './provider';

function configuredProvider(): TutorProvider | null {
  const name = process.env.AI_PROVIDER || 'codex';
  if (name === 'off') return null;
  if (name === 'codex') return new CodexProvider();
  throw Error('Ukendt AI_PROVIDER. Brug codex eller off.');
}

export function createTutorApi(provider: TutorProvider | null = configuredProvider()) {
  let busy = false;
  return async (request: Request): Promise<Response> => {
    const url = new URL(request.url);
    const error = (message: string, status: number) => Response.json({ error: message }, { status });
    // Loopback binding alone does not stop other websites from calling a local service.
    if (!['127.0.0.1','localhost'].includes(url.hostname) || (request.headers.get('origin') && request.headers.get('origin') !== url.origin)
      || request.headers.get('sec-fetch-site') === 'cross-site') return error('Kun adgang fra den lokale prototype.', 403);
    if (url.pathname === '/api/ai/status' && request.method === 'GET') return Response.json({ provider: provider?.id ?? 'off',
      ...(provider ? await provider.status() : { available: false, detail: 'AI er slået fra på serveren.' }) });
    if (url.pathname !== '/api/ai/chat') return error('Ikke fundet.', 404);
    if (request.method !== 'POST') return error('Brug POST.', 405);
    if (!request.headers.get('content-type')?.startsWith('application/json')) return error('Brug JSON.', 415);
    if (!provider) return error('AI er slået fra på serveren.', 503);
    if (busy) return error('Guiden besvarer allerede et spørgsmål. Prøv igen om lidt.', 429);
    let input;
    try { input = parseRequest(await request.json()); } catch { return error('Ugyldigt eller for langt spørgsmål.', 400); }
    // Check again after reading the body, before claiming the single process slot.
    if (busy) return error('Guiden er optaget. Prøv igen om lidt.', 429);
    busy = true;
    try { return Response.json(await provider.reply(input, AbortSignal.any([request.signal, AbortSignal.timeout(95000)]))); }
    catch { return error('AI-forbindelsen kunne ikke gennemføre svaret. Kontrollér Codex-login og abonnementsgrænse, og prøv igen.', 502); }
    finally { busy = false; }
  };
}
