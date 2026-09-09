import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export interface CodexRun {
  output: unknown;
  inputTokens: number;
  outputTokens: number;
  elapsedMs: number;
}

/** Runs the locally logged-in Codex CLI without exposing credentials to callers. */
export async function runCodex(input: {
  prompt: string; schema: object; signal: AbortSignal; binary?: string; timeoutMs?: number;
}): Promise<CodexRun> {
  input.signal.throwIfAborted();
  const directory = await mkdtemp(join(tmpdir(), 'matematik-ai-'));
  const started = performance.now();
  try {
    const schema = join(directory, 'reply.schema.json');
    await Bun.write(schema, JSON.stringify(input.schema));
    const args = [input.binary ?? process.env.CODEX_BIN ?? 'codex', '-a', 'never', 'exec', '--ignore-user-config', '--ignore-rules', '--ephemeral',
      '--skip-git-repo-check', '--sandbox', 'read-only', '--cd', directory, '--color', 'never', '--json', '--output-schema', schema,
      '-c', 'project_doc_max_bytes=0', '-c', 'skills.include_instructions=false', '-c', 'web_search="disabled"', '-c', 'model_reasoning_effort="low"'];
    for (const feature of ['shell_tool','unified_exec','apps','plugins','hooks','multi_agent','browser_use','computer_use','image_generation','in_app_browser','tool_suggest','goals']) args.push('--disable', feature);
    if (process.env.CODEX_MODEL) args.push('--model', process.env.CODEX_MODEL);
    args.push('-');
    const env = { ...process.env }; delete env.OPENAI_API_KEY; delete env.CODEX_API_KEY;
    input.signal.throwIfAborted();
    const child = Bun.spawn(args, { env, cwd: directory, stdin: new Blob([input.prompt]), stdout: 'pipe', stderr: 'pipe', timeout: input.timeoutMs ?? 90_000 });
    const cancel = () => child.kill('SIGKILL');
    input.signal.addEventListener('abort', cancel, { once: true });
    if(input.signal.aborted)cancel();
    try {
      const [code, stdout] = await Promise.all([child.exited, readLimited(child.stdout,cancel), readLimited(child.stderr,cancel)]);
      input.signal.throwIfAborted();
      if (code !== 0) throw Error('Codex kunne ikke svare. Kontrollér login og abonnementsgrænse, eller prøv igen.');
      let output: unknown; let inputTokens = 0; let outputTokens = 0;
      for (const line of stdout.split('\n')) {
        if (!line.trim()) continue;
        try {
          const event = JSON.parse(line) as Record<string, unknown>;
          const usage = event.usage as Record<string, unknown> | undefined;
          if (usage) { inputTokens += Number(usage.input_tokens ?? 0) || 0; outputTokens += Number(usage.output_tokens ?? 0) || 0; }
          if (event.type === 'turn.completed') {
            const turn = event.turn as Record<string, unknown> | undefined;
            const turnUsage = turn?.usage as Record<string, unknown> | undefined;
            if (turnUsage) { inputTokens = Number(turnUsage.input_tokens ?? inputTokens) || inputTokens; outputTokens = Number(turnUsage.output_tokens ?? outputTokens) || outputTokens; }
          }
          if (event.type === 'item.completed') {
            const item = event.item as Record<string, unknown> | undefined;
            if (item?.type === 'agent_message' && typeof item.text === 'string') output = JSON.parse(item.text);
          }
        } catch { /* non-event output is ignored unless it is the final schema JSON */ }
      }
      if (output === undefined) {
        try { output = JSON.parse(stdout.trim()); } catch { throw Error('Codex returnerede ikke et gyldigt struktureret svar.'); }
      }
      return { output, inputTokens, outputTokens, elapsedMs: Math.round(performance.now() - started) };
    } finally { input.signal.removeEventListener('abort', cancel); }
  } finally { await rm(directory, { recursive: true, force: true }); }
}

async function readLimited(stream:ReadableStream<Uint8Array>,cancel:()=>void){const reader=stream.getReader();const decoder=new TextDecoder();let count=0,text='';try{while(true){const {done,value}=await reader.read();if(done)break;count+=value.byteLength;if(count>1024*1024){cancel();throw Error('Codex-output overskred grænsen.');}text+=decoder.decode(value,{stream:true});}return text+decoder.decode();}finally{reader.releaseLock();}}
