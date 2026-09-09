import { mkdir, readdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { assess, createProfile, families, generateTask, publicTask, type Answer, type ExamType, type FamilyId, type Profile, type Task } from '../domain';
import { acknowledgeRender, applyCommand, createScene, reportRenderFailure, setAiEnabled, undoAgentAction, updateStudent, sceneSnapshot, type SceneOperation, type SceneState } from '../scene';
import type { AckRequest, AttemptAction, AttemptSummary, AttemptView, Catalog, CreateAttempt, HelpLevel, HelpRequest, ToolState, Assistance } from '../api-types';
import {fp9ReplySchema,sceneInstructions} from './scene-schema';
import { allParts } from '../api-types';
import { runCodex } from '../../ai/runtime';

type Internal = { view: AttemptView; tasks: Record<string, Task>; seed: number; pendingText: Record<string, {token:string;text:string;assistance:Assistance}>; examType: ExamType; assisted: boolean; generation: CreateAttempt };
export interface Fp9Provider { reply(input: Fp9Prompt, signal: AbortSignal): Promise<{ text: string; operations: SceneOperation[]; inputTokens: number; outputTokens: number; elapsedMs: number }>; }
export type Fp9Prompt = { level: HelpLevel; question: string; task: ReturnType<typeof publicTask>; scene: unknown; recentActions: unknown[]; history: {role:string;text:string}[]; marking?: Task['marking'] };
const MAX_BODY = 2 * 1024 * 1024, MAX_TEXT = 4000;
const setting=(key:string,fallback:number,max:number)=>{const value=Number(process.env[key]??fallback);if(!Number.isSafeInteger(value)||value<1||value>max)throw Error(`Ugyldig ${key}.`);return value;};
const MAX_CALLS=setting('FP9_AI_MAX_CALLS',12,100), TIMEOUT=setting('FP9_AI_TIMEOUT_MS',90000,180000), MAX_TOKENS=setting('FP9_AI_MAX_TOKENS',150000,2000000);
const id = (x: unknown): x is string => typeof x === 'string' && /^[A-Za-z0-9._:-]{1,120}$/.test(x);
const str = (x: unknown, max = MAX_TEXT): x is string => typeof x === 'string' && x.length <= max;
const finite = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x);
const plain = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);
const now = () => new Date().toISOString();
const blankTools = (): ToolState => ({ tab: 'calculator', expression: '', result: '', cells: {}, rows: 6 });
const clone = <T>(x: T): T => structuredClone(x);

export class LocalAttemptStore {
  constructor(readonly path = process.env.FP9_STORE_PATH ?? join(import.meta.dir, '../../../.local/fp9')) {}
  private file(id: string) { if (!/^fp9-[a-z0-9-]{1,100}$/.test(id)) throw Error('Ugyldigt forsøgs-id.'); return join(this.path, `${id}.json`); }
  async save(value: Internal) {
    await mkdir(this.path, { recursive: true });
    const file = this.file(value.view.id), tmp = `${file}.${crypto.randomUUID()}.tmp`;
    try { await writeFile(tmp, JSON.stringify(value)); await rename(tmp, file); }
    finally { await unlink(tmp).catch(error => { if (error.code !== 'ENOENT') throw error; }); }
  }
  async get(id: string): Promise<Internal> {
    const file = this.file(id);
    let raw: string;
    try { raw = await readFile(file, 'utf8'); }
    catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') throw Error('Forsøget findes ikke.'); throw Error('Forsøget kunne ikke læses fra disken.'); }
    try {
      const value = JSON.parse(raw) as Internal;
      if (value?.view?.id !== id || !Array.isArray(value.view.assistance) || !Array.isArray(value.view.groups) || !value.tasks || !value.generation) throw Error();
      return value;
    } catch { throw Error('Den gemte forsøgsfil er beskadiget. Originalfilen er bevaret.'); }
  }
  async list(): Promise<AttemptSummary[]> {
    let files: string[];
    try { files = await readdir(this.path); }
    catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []; throw Error('Forsøgsmappen kunne ikke læses.'); }
    const values = await Promise.all(files.filter(f => /^fp9-[a-z0-9-]+\.json$/.test(f)).map(f => this.get(f.slice(0,-5))));
    return values.map(x => ({ id: x.view.id, createdAt: x.view.createdAt, status: x.view.status, examType: x.examType, assisted: x.view.assistance.length > 0 }));
  }
  async delete(id: string) {
    try { await unlink(this.file(id)); }
    catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') throw Error('Forsøget findes ikke.'); throw Error('Forsøget kunne ikke slettes fra disken.'); }
  }
}

export class CodexFp9Provider implements Fp9Provider {
  async reply(input: Fp9Prompt, signal: AbortSignal) {
    const restriction = {
      question:'Stil ét afklarende spørgsmål. Giv ikke facit eller figurhandlinger.',
      hint:'Giv et lille fagligt hint uden facit. Returnér ingen figurhandlinger.',
      step:'Vis ét afgrænset trin i det mærkede forklaringslag, og invitér eleven til at fortsætte. Undgå at løse hele opgaven.',
      solution:'Eleven har udtrykkeligt bedt om løsningen. Forklar metoden og brug bedømmelsesgrundlaget, hvor det er relevant. Åbne begrundelser kan have flere løsninger.',
    }[input.level];
    const result = await runCodex({ schema:fp9ReplySchema, signal, timeoutMs: TIMEOUT, prompt: `Du er dansk FP9-matematikguide. Svar kort på dansk, højst ca.120 ord. ${restriction} ${sceneInstructions}\nData:\n${JSON.stringify(input)}` });
    const out = result.output as Record<string, unknown>;
    if (!plain(out) || !str(out.text, 1200) || !Array.isArray(out.operations)) throw Error('Codex-svaret havde forkert form.');
    return { text: out.text, operations: out.operations as SceneOperation[], inputTokens: result.inputTokens, outputTokens: result.outputTokens, elapsedMs: result.elapsedMs };
  }
}

export class Fp9Service {
  private locks = new Map<string, Promise<void>>(); private aborts = new Map<string, AbortController>();
  constructor(readonly store = new LocalAttemptStore(), readonly provider: Fp9Provider | null = process.env.AI_PROVIDER === 'off' ? null : new CodexFp9Provider()) {}
  private async locked<T>(id: string, fn: () => Promise<T>): Promise<T> { const prior = this.locks.get(id) ?? Promise.resolve(); let release!: () => void; const next = new Promise<void>(r => release = r); const queued=prior.then(() => next);this.locks.set(id, queued); await prior; try { return await fn(); } finally { release(); if (this.locks.get(id) === queued) this.locks.delete(id); } }
  catalog(): Catalog { return { families, sourceVersion: 'fp9-foundation-2026-09-09', sourceDate: '2026-09-09' }; }
  list() { return this.store.list(); }
  async load(id: string) { return this.project(await this.store.get(id)); }
  private project(x: Internal): AttemptView { return clone(x.view); }
  private elapsed(v: AttemptView) { return v.clock.elapsedSeconds + (v.clock.lastResumedAt ? Math.max(0, Math.floor((Date.now() - Date.parse(v.clock.lastResumedAt)) / 1000)) : 0); }
  private expired(v: AttemptView) { return v.profile.timingMinutes !== null && this.elapsed(v) >= v.profile.timingMinutes * 60 + v.clock.extraSeconds; }
  private checkRevision(v: AttemptView, n: unknown) { if (!Number.isSafeInteger(n) || n !== v.revision) throw Object.assign(Error('Forsøget er ændret et andet sted. Hent det igen før du gemmer.'), { status: 409 }); }
  async create(input: CreateAttempt) {
    if (!plain(input) || !['with-aids','without-aids'].includes(input.examType) || typeof input.aiEnabled !== 'boolean' || !['short','full','topic'].includes(input.length) || !['immediate','after-submit'].includes(input.feedback) || (input.timingMinutes !== null && (!Number.isSafeInteger(input.timingMinutes) || input.timingMinutes <= 0 || input.timingMinutes > 600))) throw Error('Ugyldige indstillinger for forsøget.');
    if (input.familyId !== undefined && (!id(input.familyId) || !families.some(f => f.id === input.familyId && f.status === 'implemented'))) throw Error('Den valgte opgavefamilie er ikke klar.');
    const seed = input.seed === undefined ? Math.floor(Math.random() * 2_000_000_000) : input.seed;
    if (!Number.isSafeInteger(seed)) throw Error('Seed skal være et sikkert heltal.');
    const available=families.filter(f=>f.status==='implemented'&&f.examTypes.includes(input.examType)).map(f=>f.id);
    // Alle implementerede familier kan indgå; hver generator holder selv tal inden for den valgte prøvetypes enkle ramme.
    const blueprint:FamilyId[]=available;
    const groupCount=input.length==='full'?(input.examType==='without-aids'?20:7):input.length==='topic'?1:3;
    const groups:AttemptView['groups']=[],parts:Task[]=[];
    for(let group=0;group<groupCount;group++){
      const family=input.length==='topic'?(input.familyId??'F06'):input.length==='short'?(['F06','F13','F16'] as FamilyId[])[group]!:blueprint[group%blueprint.length]!;
      const count=input.length==='topic'?3:input.length==='short'?1:input.examType==='without-aids'?(group<10?3:2):3;
      const instances=Array.from({length:count},(_,variant)=>generateTask(family,seed+group,variant,input.examType));
      parts.push(...instances);groups.push({id:`group-${group+1}`,title:`${group+1}. ${families.find(f=>f.id===family)!.title}`,parts:instances.map(publicTask)});
    }
    const attemptId = `fp9-${crypto.randomUUID()}`; const createdAt = now(); const profile = createProfile(input.examType, input.aiEnabled, { timingMinutes: input.timingMinutes, feedback: input.feedback });
    const tasks = Object.fromEntries(parts.map(t => [t.id, t])); const scenes = Object.fromEntries(parts.map(t => [t.id, setAiEnabled(createScene(attemptId, t.id, t.scene), input.aiEnabled)]));
    const view: AttemptView = { schemaVersion: '1', id: attemptId, revision: 0, createdAt, profile, status: 'active', submittedAt: null, groups, answers: {}, notes: {}, scenes, visited: [parts[0]!.id], flagged: [], activeTaskId: parts[0]!.id, assistance: [], chat: {}, clock: { elapsedSeconds: 0, lastResumedAt: createdAt, extraSeconds: 0, events: [{ kind: 'resume', at: createdAt }] }, assessments: {}, tools: {}, aiUsage: { calls: 0, inputTokens: 0, outputTokens: 0, lastLatencyMs: null } };
    const internal: Internal = { view, tasks, seed, pendingText: {}, examType: input.examType, assisted: false, generation:{...input,seed} }; await this.store.save(internal); return this.project(internal);
  }
  private mutate(id0: string, expected: unknown, fn: (x: Internal) => void | Promise<void>) { return this.locked(id0, async () => { const x = await this.store.get(id0); this.checkRevision(x.view, expected); await fn(x); this.aborts.get(id0)?.abort(); x.view.revision++; await this.store.save(x); return this.project(x); }); }
  async action(id0: string, action: AttemptAction) {
    if (!plain(action) || !Number.isSafeInteger(action.expectedRevision) || !str(action.type, 20)) throw Error('Ugyldig handling.');
    return this.mutate(id0, action.expectedRevision, async x => {
      const v = x.view; if(v.status==='submitted') throw Error('Forsøget er afleveret og kan ikke ændres.'); const task = (t: unknown) => { if (!id(t) || !Object.hasOwn(x.tasks,t)) throw Error('Ukendt opgave.'); return t; };
      const editable = () => { if (v.status === 'submitted') throw Error('Forsøget er afleveret og kan ikke ændres.'); if (this.expired(v)) throw Error('Tiden er udløbet. Registrér ekstra tid eller aflever forsøget.'); if(v.profile.timingMinutes!==null&&!v.clock.lastResumedAt)throw Error('Fortsæt uret, før du arbejder videre.'); };
      const cancelledPending=new Set<string>();
      for(const key of Object.keys(v.scenes)){const scene=v.scenes[key]!;if(scene.pendingRender){const failed=reportRenderFailure(scene,scene.pendingRender);const undone=undoAgentAction(failed.state,scene.pendingRender.actionId);v.scenes[key]=undone.state;delete x.pendingText[key];cancelledPending.add(key);}}
      switch (action.type) {
        case 'answer': { editable(); const t = task(action.taskId); if (!id(action.questionId) || !x.tasks[t]!.questions.some(q => q.id === action.questionId) || !plain(action.answer) || !str(action.answer.text) || (action.answer.explanation !== undefined && !str(action.answer.explanation)) || (action.answer.points !== undefined && (!Array.isArray(action.answer.points) || action.answer.points.length > 20 || !action.answer.points.every(p => Array.isArray(p) && p.length === 2 && p.every(finite))))) throw Error('Ugyldigt svar.'); v.answers[t] = { ...(v.answers[t] ?? {}), [action.questionId]: clone(action.answer) }; if(x.tasks[t]!.questions.find(q=>q.id===action.questionId)!.answerKind==='geometry'){const objects=(action.answer.points??[]).map(([x,y],i)=>({id:`student-point-${i}`,source:'student' as const,kind:'point',x,y,visible:true}));this.validatePoints(x.tasks[t]!,objects);v.scenes[t]=updateStudent(v.scenes[t]!,{objects,selection:[]});} break; }
        case 'note': { editable(); const t = task(action.taskId); if (!str(action.text)) throw Error('Noten er for lang.'); v.notes[t] = action.text; break; }
        case 'navigate': { const t = task(action.taskId); v.activeTaskId = t; if (!v.visited.includes(t)) v.visited.push(t); break; }
        case 'flag': { const t = task(action.taskId); if (typeof action.flagged !== 'boolean') throw Error('Flag skal være sand eller falsk.'); v.flagged = action.flagged ? [...new Set([...v.flagged,t])] : v.flagged.filter(i => i !== t); break; }
        case 'student': { editable(); const t = task(action.taskId); if (!Array.isArray(action.objects) || !Array.isArray(action.selection)) throw Error('Ugyldig konstruktion.'); this.validatePoints(x.tasks[t]!,action.objects);v.scenes[t] = updateStudent(v.scenes[t]!, { objects: action.objects, selection: action.selection });for(const q of x.tasks[t]!.questions)if(q.answerKind==='geometry'){v.answers[t]={...v.answers[t],[q.id]:{text:'',points:action.objects.map(o=>[Number(o.x),Number(o.y)] as [number,number])}};} break; }
        case 'tools': { editable(); if(v.profile.aids!=='standard')throw Error('Hjælpemidler er ikke slået til i denne prøveprofil.'); const t = task(action.taskId); if (!plain(action.value) || !['calculator','sheet','cas'].includes(action.value.tab as string) || !str(action.value.expression, 2000) || !str(action.value.result, 2000) || !plain(action.value.cells) || !Number.isSafeInteger(action.value.rows) || action.value.rows < 1 || action.value.rows > 20 || Object.keys(action.value.cells).length>40 || !Object.entries(action.value.cells).every(([k,val])=>/^[AB]([1-9]|1[0-9]|20)$/.test(k)&&str(val,300))) throw Error('Ugyldig værktøjstilstand.'); v.tools[t] = clone(action.value); break; }
        case 'pause': { if (!v.clock.lastResumedAt) throw Error('Uret er allerede sat på pause.'); v.clock.elapsedSeconds = this.elapsed(v); v.clock.lastResumedAt = null; v.clock.events.push({ kind: 'pause', at: now() }); break; }
        case 'resume': { if (this.expired(v)) throw Error('Tiden er udløbet. Registrér ekstra tid først.'); if (v.clock.lastResumedAt) throw Error('Uret kører allerede.'); v.clock.lastResumedAt = now(); v.clock.events.push({ kind: 'resume', at: v.clock.lastResumedAt }); break; }
        case 'extra': { if (!Number.isSafeInteger(action.seconds) || action.seconds < 1 || action.seconds > 8 * 3600) throw Error('Ekstra tid skal være mellem 1 sekund og 8 timer.'); v.clock.extraSeconds += action.seconds; v.clock.events.push({ kind: 'extra', at: now(), seconds: action.seconds }); break; }
        case 'ai': { if (typeof action.enabled !== 'boolean') throw Error('AI-status skal være sand eller falsk.'); v.profile.aiEnabled = action.enabled; for (const t of Object.keys(v.scenes)) v.scenes[t] = setAiEnabled(v.scenes[t]!, action.enabled); if (!action.enabled) x.pendingText = {}; break; }
        case 'feedback': { const t = task(action.taskId); if (!id(action.questionId) || !v.answers[t]?.[action.questionId]) throw Error('Gem et svar før du beder om feedback.'); if (v.profile.feedback === 'after-submit') throw Error('Feedback vises først efter aflevering i denne profil.'); const assessment = assess(x.tasks[t]!, action.questionId, v.answers[t]![action.questionId]!); v.assessments[t] = { ...(v.assessments[t] ?? {}), [action.questionId]: {...assessment,criteria:[],examples:[]} }; x.assisted=true; v.assistance.push({ id: `feedback-${crypto.randomUUID()}`, taskId: t, level: 'question', source: 'feedback', at: now() }); break; }
        case 'undo': { editable(); const t = task(action.taskId); if(cancelledPending.has(t))break; const latest = v.scenes[t]!.actionLedger.findLast(entry=>!entry.undone); if (!latest) throw Error('Der er ingen AI-forklaring at fortryde.'); const result = undoAgentAction(v.scenes[t]!, latest.actionId); if (result.status !== 'applied') throw Error(result.reason); v.scenes[t] = result.state; break; }
        case 'submit': { v.clock.elapsedSeconds = this.elapsed(v); v.clock.lastResumedAt = null; v.status = 'submitted'; v.submittedAt = now(); x.pendingText={}; for(const key of Object.keys(v.scenes)){v.scenes[key]=setAiEnabled(v.scenes[key]!,false);}  for (const t of Object.keys(x.tasks)) for (const q of x.tasks[t]!.questions) v.assessments[t] = { ...(v.assessments[t] ?? {}), [q.id]: assess(x.tasks[t]!, q.id, v.answers[t]?.[q.id]??{text:''}) }; break; }
        default: throw Error('Ukendt handling.');
      }
      if(action.type!=='ai') { for(const key of Object.keys(x.pendingText)) if(!v.scenes[key]?.pendingRender)delete x.pendingText[key]; }
    });
  }
  private validatePoints(task:Task,objects:unknown){if(!Array.isArray(objects)||objects.length>20||!objects.every(o=>plain(o)&&id(o.id)&&o.id.startsWith('student-')&&o.source==='student'&&o.kind==='point'&&finite(o.x)&&finite(o.y)&&o.x>=task.scene.axes.x.min&&o.x<=task.scene.axes.x.max&&o.y>=task.scene.axes.y.min&&o.y<=task.scene.axes.y.max&&(o.text===undefined||str(o.text,400))))throw Error('Ugyldige elevpunkter. Brug punkter inden for figurens akser.');}
  async help(id0:string,request:HelpRequest,clientSignal?:AbortSignal){
    if(!plain(request)||!Number.isSafeInteger(request.expectedRevision)||!id(request.taskId)||!['question','hint','step','solution'].includes(request.level)||!str(request.question,2000)||!request.question.trim())throw Error('Ugyldig hjælpesanmodning.');
    const start=await this.locked(id0,async()=>{
      const x=await this.store.get(id0);this.checkRevision(x.view,request.expectedRevision);
      if(x.view.status!=='active'||this.expired(x.view)||(x.view.profile.timingMinutes!==null&&!x.view.clock.lastResumedAt))throw Error('Fortsæt et aktivt forsøg med tid tilbage for at få hjælp.');
      if(!x.view.profile.aiEnabled||!this.provider)throw Error('AI er slået fra. Du kan fortsætte uden AI.');
      if(this.aborts.has(id0))throw Error('Guiden arbejder allerede. Vent eller slå AI fra.');
      if(x.view.aiUsage.calls>=MAX_CALLS||x.view.aiUsage.inputTokens+x.view.aiUsage.outputTokens>=MAX_TOKENS)throw Error('AI-budgettet er brugt. Du kan fortsætte uden AI.');
      const task=x.tasks[request.taskId];if(!task||request.taskId!==x.view.activeTaskId)throw Error('Hjælp skal gælde den aktive opgave.');
      if(x.view.scenes[request.taskId]!.pendingRender)throw Error('Vent på at forklaringen bliver vist.');
      const controller=new AbortController();this.aborts.set(id0,controller);
      // Reserve the call BEFORE dispatch, including failed/cancelled calls. Usage is
      // bookkeeping, not a student/policy revision, so AI-off can still use this revision.
      x.view.aiUsage.calls++;await this.store.save(x);
      return {task,scene:x.view.scenes[request.taskId]!,revision:x.view.revision,controller,history:(x.view.chat[request.taskId]??[]).slice(-8)};
    });
    let response:Awaited<ReturnType<Fp9Provider['reply']>>;
    try{
      response=await this.provider!.reply({level:request.level,question:request.question,task:publicTask(start.task),scene:sceneSnapshot(start.scene),recentActions:[...start.scene.recentActions].slice(-10),history:start.history,...(request.level==='solution'?{marking:start.task.marking}:{})},AbortSignal.any([start.controller.signal,...(clientSignal?[clientSignal]:[]),AbortSignal.timeout(TIMEOUT)]));
    }catch{
      if(this.aborts.get(id0)===start.controller)this.aborts.delete(id0);
      if(start.controller.signal.aborted||clientSignal?.aborted)throw Object.assign(Error('AI-kaldet blev annulleret.'),{status:409});
      throw Error('Codex kunne ikke svare. Kontrollér login og abonnementsgrænse, eller fortsæt uden AI.');
    }
    return this.locked(id0,async()=>{
      if(this.aborts.get(id0)===start.controller)this.aborts.delete(id0);
      const x=await this.store.get(id0);
      const validUsage=[response.inputTokens,response.outputTokens].every(n=>Number.isSafeInteger(n)&&n>=0);
      if(validUsage){x.view.aiUsage.inputTokens+=response.inputTokens;x.view.aiUsage.outputTokens+=response.outputTokens;}
      if(finite(response.elapsedMs)&&response.elapsedMs>=0)x.view.aiUsage.lastLatencyMs=response.elapsedMs;
      await this.store.save(x);
      if(start.controller.signal.aborted||clientSignal?.aborted||x.view.revision!==start.revision||!x.view.profile.aiEnabled||x.view.status!=='active'||x.view.scenes[request.taskId]!.policyRevision!==start.scene.policyRevision)throw Object.assign(Error('AI-svaret er forældet og blev ikke anvendt.'),{status:409});
      if(!str(response.text,4000)||!response.text.trim()||!Array.isArray(response.operations)||response.operations.length>12)throw Error('AI-svaret kunne ikke valideres.');
      if(response.operations.length&&!['step','solution'].includes(request.level))throw Error('Vælg Vis ét trin for at tillade en figurændring.');
      const assistance:Assistance={id:`help-${crypto.randomUUID()}`,taskId:request.taskId,level:request.level,source:'ai',at:now(),...(validUsage?{tokens:{input:response.inputTokens,output:response.outputTokens},latencyMs:response.elapsedMs}:{})};
      const scene=x.view.scenes[request.taskId]!;
      if(response.operations.length){
        const applied=applyCommand(scene,{attemptId:id0,sceneId:request.taskId,expectedRevision:scene.revision,policyRevision:scene.policyRevision,actionId:`ai-${crypto.randomUUID()}`,operations:response.operations});
        if(applied.status!=='applied')throw Error('AI-handlingen blev afvist: '+applied.reason);
        x.view.scenes[request.taskId]=applied.state;x.pendingText[request.taskId]={token:applied.pendingRender!.token,text:response.text,assistance};
      }
      if(!response.operations.length){x.assisted=true;x.view.assistance.push(assistance);}
      x.view.chat[request.taskId]=[...(x.view.chat[request.taskId]??[]),{role:'student' as const,text:request.question},...(response.operations.length?[]:[{role:'guide' as const,text:response.text}])].slice(-50);
      x.view.revision++;await this.store.save(x);return this.project(x);
    });
  }
  async ack(id0:string,request:AckRequest){
    if(!plain(request)||!id(request.taskId)||!str(request.token,300)||!Number.isSafeInteger(request.revision)||typeof request.success!=='boolean')throw Error('Ugyldig render-bekræftelse.');
    return this.locked(id0,async()=>{
      const x=await this.store.get(id0),scene=x.view.scenes[request.taskId];
      if(!scene||!x.view.profile.aiEnabled||x.view.status!=='active')throw Object.assign(Error('Render-bekræftelsen er forældet.'),{status:409});
      const result=request.success?acknowledgeRender(scene,request):reportRenderFailure(scene,request);
      if(result.status==='rejected')throw Object.assign(Error(result.reason),{status:409});
      x.view.scenes[request.taskId]=result.state;
      const held=x.pendingText[request.taskId];
      if(request.success&&held?.token===request.token){x.view.chat[request.taskId]=[...(x.view.chat[request.taskId]??[]),{role:'guide' as const,text:held.text}].slice(-50);x.view.assistance.push(held.assistance);x.assisted=true;}
      if(!request.success&&scene.pendingRender){
        const undone=undoAgentAction(result.state,scene.pendingRender.actionId);if(undone.status==='applied')x.view.scenes[request.taskId]=undone.state;
        x.view.chat[request.taskId]=[...(x.view.chat[request.taskId]??[]),{role:'guide',text:'Forklaringslaget kunne ikke vises. Handlingen er rullet tilbage.'}];
      }
      delete x.pendingText[request.taskId];x.view.revision++;await this.store.save(x);return this.project(x);
    });
  }
  async remove(id0:string){return this.locked(id0,async()=>{this.aborts.get(id0)?.abort();await this.store.delete(id0);});}
  async export(id0:string){
    const x=await this.store.get(id0),snapshot=this.project(x);
    snapshot.clock.elapsedSeconds=this.elapsed(snapshot);snapshot.clock.lastResumedAt=null;
    for(const [key,scene] of Object.entries(snapshot.scenes)){if(scene.pendingRender){const failed=reportRenderFailure(scene,scene.pendingRender);const undone=undoAgentAction(failed.state,scene.pendingRender.actionId);snapshot.scenes[key]=undone.state;}}
    return {version:'1',blueprintVersion:'fp9-blueprint-1',exportedAt:now(),attempt:snapshot,generation:x.generation};
  }
  async import(value:unknown){
    if(!plain(value)||value.version!=='1'||value.blueprintVersion!=='fp9-blueprint-1'||!plain(value.attempt)||!plain(value.generation))throw Error('Ugyldig eller ikke-understøttet eksportversion.');
    const incoming=value.attempt as unknown as AttemptView;
    if(incoming.schemaVersion!=='1'||!['active','submitted'].includes(incoming.status)||!Array.isArray(incoming.groups)||incoming.groups.length>20||!plain(incoming.profile))throw Error('Ugyldigt forsøg.');
    const fresh=await this.create({...value.generation,aiEnabled:false} as unknown as CreateAttempt);
    let success=false;
    try{
      const x=await this.store.get(fresh.id);
      const same=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b);
      if(!same(incoming.groups,x.view.groups)||incoming.profile.examType!==x.view.profile.examType||incoming.profile.aids!==x.view.profile.aids||incoming.profile.sourceVersion!==x.view.profile.sourceVersion||incoming.profile.sourceDate!==x.view.profile.sourceDate||incoming.profile.feedback!==x.view.profile.feedback||incoming.profile.timingMinutes!==x.view.profile.timingMinutes)throw Error('Opgavegrundlag eller profil passer ikke til den genskabte variant.');
      const taskExists=(key:string)=>Object.hasOwn(x.tasks,key);
      for(const name of ['answers','notes','scenes','tools','chat'] as const)if(!plain(incoming[name])||Object.keys(incoming[name]).some(key=>!taskExists(key)))throw Error('Eksporten indeholder ukendte opgaver eller ugyldige felter.');
      for(const [taskId,answers] of Object.entries(incoming.answers)){
        if(!plain(answers))throw Error('Ugyldige svar.');x.view.answers[taskId]={};
        for(const [questionId,answer] of Object.entries(answers)){
          if(!x.tasks[taskId]!.questions.some(q=>q.id===questionId)||!validAnswer(answer))throw Error('Ugyldigt importeret svar.');
          x.view.answers[taskId]![questionId]=clone(answer);
        }
      }
      for(const [taskId,note] of Object.entries(incoming.notes)){if(!str(note))throw Error('Ugyldig note.');x.view.notes[taskId]=note;}
      for(const [taskId,tools] of Object.entries(incoming.tools)){if(!validTools(tools)||x.view.profile.aids!=='standard')throw Error('Ugyldige hjælpemidler.');x.view.tools[taskId]=clone(tools);}
      for(const taskId of Object.keys(x.tasks)){
        const source=incoming.scenes[taskId];
        if(!plain(source)||source.attemptId!==incoming.id||source.sceneId!==taskId||!same(source.givens,x.tasks[taskId]!.scene))throw Error('Ugyldigt scenegrundlag.');
        this.validatePoints(x.tasks[taskId]!,source.studentObjects);
        let scene=updateStudent(x.view.scenes[taskId]!,{objects:source.studentObjects,selection:[]});
        if(!Array.isArray(source.explanationObjects)||source.explanationObjects.length>100)throw Error('Ugyldigt forklaringslag.');
        if(source.explanationObjects.length){
          scene=setAiEnabled(scene,true);
          const command=applyCommand(scene,{attemptId:fresh.id,sceneId:taskId,actionId:'import-explanation',expectedRevision:scene.revision,policyRevision:scene.policyRevision,operations:source.explanationObjects.map(object=>object.kind==='highlight'?{type:'highlight',object}:{type:'addObject',object})});
          if(command.status!=='applied')throw Error('Ugyldigt forklaringsobjekt: '+command.reason);
          scene=setAiEnabled(command.state,false);
        }
        if(source.viewport!==null){if(x.tasks[taskId]!.scene.kind==='grid'&&Math.abs((source.viewport.xMax-source.viewport.xMin)-(source.viewport.yMax-source.viewport.yMin))>1e-9)throw Error('Koordinatgeometri kræver samme målestok på begge akser.');scene=setAiEnabled(scene,true);const v=applyCommand(scene,{attemptId:fresh.id,sceneId:taskId,actionId:'import-viewport',expectedRevision:scene.revision,policyRevision:scene.policyRevision,operations:[{type:'setViewport',viewport:source.viewport}]});if(v.status!=='applied')throw Error('Ugyldigt udsnit.');scene=setAiEnabled(v.state,false);}
        scene=updateStudent(scene,{selection:source.selection});
        x.view.scenes[taskId]=scene;
        for(const q of x.tasks[taskId]!.questions)if(q.answerKind==='geometry'){
          const points=scene.studentObjects.map(o=>[Number(o.x),Number(o.y)] as [number,number]);
          const answer=x.view.answers[taskId]?.[q.id];
          if(answer&&!same(answer.points??[],points))throw Error('Geometrisvar og elevfigur stemmer ikke overens.');
        }
      }
      for(const [taskId,chat] of Object.entries(incoming.chat)){if(!Array.isArray(chat)||chat.length>50||!chat.every(m=>plain(m)&&['student','guide'].includes(m.role)&&str(m.text)))throw Error('Ugyldig samtalehistorik.');x.view.chat[taskId]=clone(chat);}
      if(!Array.isArray(incoming.assistance)||incoming.assistance.length>1000||!incoming.assistance.every(a=>plain(a)&&id(a.id)&&taskExists(a.taskId)&&['question','hint','step','solution'].includes(a.level)&&['ai','local','feedback'].includes(a.source)&&str(a.at)&&Number.isFinite(Date.parse(a.at))))throw Error('Ugyldig hjælprehistorik.');
      x.view.assistance=clone(incoming.assistance);x.assisted=x.view.assistance.length>0;
      for(const key of ['visited','flagged'] as const){if(!Array.isArray(incoming[key])||incoming[key].length>50||!incoming[key].every(taskExists))throw Error('Ugyldig navigation.');x.view[key]=[...new Set(incoming[key])];}
      if(!taskExists(incoming.activeTaskId))throw Error('Ukendt aktiv opgave.');x.view.activeTaskId=incoming.activeTaskId;
      const clock=incoming.clock;
      if(!plain(clock)||!finite(clock.elapsedSeconds)||clock.elapsedSeconds<0||clock.elapsedSeconds>1e8||!Number.isSafeInteger(clock.extraSeconds)||clock.extraSeconds<0||clock.extraSeconds>1e8||!Array.isArray(clock.events)||clock.events.length>1000||!clock.events.every(event=>plain(event)&&['pause','resume','extra'].includes(event.kind)&&str(event.at)&&Number.isFinite(Date.parse(event.at))&&(event.seconds===undefined||Number.isSafeInteger(event.seconds)&&event.seconds>=0)))throw Error('Ugyldigt ur.');
      x.view.clock={...clone(clock),lastResumedAt:null};
      const usage=incoming.aiUsage;
      if(!plain(usage)||![usage.calls,usage.inputTokens,usage.outputTokens].every(n=>Number.isSafeInteger(n)&&n>=0&&n<=1e9)||(usage.lastLatencyMs!==null&&(!finite(usage.lastLatencyMs)||usage.lastLatencyMs<0)))throw Error('Ugyldig forbrugsoversigt.');
      x.view.aiUsage=clone(usage);x.view.status=incoming.status;x.view.submittedAt=incoming.status==='submitted'?incoming.submittedAt:null;
      if(x.view.status==='submitted'&&(!str(incoming.submittedAt)||!Number.isFinite(Date.parse(incoming.submittedAt))))throw Error('Ugyldig afleveringsdato.');
      if(x.view.status==='submitted')for(const task of Object.values(x.tasks))for(const q of task.questions){x.view.assessments[task.id]={...x.view.assessments[task.id],[q.id]:assess(task,q.id,x.view.answers[task.id]?.[q.id]??{text:''})};}
      x.view.revision=0;await this.store.save(x);success=true;return this.project(x);
    }finally{if(!success)await this.store.delete(fresh.id);}
  }

}

export function createFp9Api(service = new Fp9Service()) { return async (request: Request): Promise<Response> => { const url = new URL(request.url); const fail = (e: unknown) => Response.json({ error: e instanceof Error ? e.message : 'Uventet serverfejl.' }, { status: (e as { status?: number })?.status ?? 400 }); if (!['127.0.0.1','localhost'].includes(url.hostname) || request.headers.get('sec-fetch-site')==='cross-site' || (request.headers.get('origin') && request.headers.get('origin') !== url.origin)) return Response.json({ error: 'Kun lokal adgang.' }, { status: 403 }); const parts = url.pathname.split('/').filter(Boolean); try { if (url.pathname === '/api/fp9/catalog' && request.method === 'GET') return Response.json(service.catalog()); if (url.pathname === '/api/fp9/attempts' && request.method === 'GET') return Response.json({ attempts: await service.list() }); if (url.pathname === '/api/fp9/attempts' && request.method === 'POST') return Response.json(await service.create(await json(request) as unknown as CreateAttempt), { status: 201 }); if (url.pathname === '/api/fp9/import' && request.method === 'POST') return Response.json(await service.import((await json(request)).export), { status: 201 }); const attempt = parts[3]; if (!id(attempt)) return Response.json({ error: 'Ikke fundet.' }, { status: 404 }); if (parts.length === 4 && request.method === 'GET') return Response.json(await service.load(attempt)); if (parts.length === 4 && request.method === 'DELETE') { await service.remove(attempt); return new Response(null, { status: 204 }); } if (parts[4] === 'action' && request.method === 'POST') return Response.json(await service.action(attempt, await json(request) as unknown as AttemptAction)); if (parts[4] === 'help' && request.method === 'POST') return Response.json(await service.help(attempt, await json(request) as unknown as HelpRequest, request.signal)); if (parts[4] === 'ack' && request.method === 'POST') return Response.json(await service.ack(attempt, await json(request) as unknown as AckRequest)); if (parts[4] === 'export' && request.method === 'GET') return Response.json(await service.export(attempt)); return Response.json({ error: 'Ikke fundet.' }, { status: 404 }); } catch (e) { return fail(e); } }; }
async function json(request: Request): Promise<Record<string, unknown>> { if (!request.headers.get('content-type')?.startsWith('application/json')) throw Object.assign(Error('Brug JSON.'), { status: 415 }); const text = await request.text(); if (new TextEncoder().encode(text).byteLength > MAX_BODY) throw Object.assign(Error('JSON-kroppen er for stor.'), { status: 413 }); try { const value = JSON.parse(text); if (!plain(value)) throw Error(); return value; } catch { throw Error('Ugyldig JSON.'); } }

function validAnswer(value:unknown):value is Answer{return plain(value)&&str(value.text)&&(value.explanation===undefined||str(value.explanation))&&(value.points===undefined||Array.isArray(value.points)&&value.points.length<=20&&value.points.every(p=>Array.isArray(p)&&p.length===2&&p.every(finite)));}
function validTools(value:unknown):value is ToolState{return plain(value)&&['calculator','sheet','cas'].includes(String(value.tab))&&str(value.expression,300)&&str(value.result,2000)&&Number.isSafeInteger(value.rows)&&Number(value.rows)>=1&&Number(value.rows)<=20&&plain(value.cells)&&Object.keys(value.cells).length<=40&&Object.entries(value.cells).every(([k,v])=>/^[AB]([1-9]|1[0-9]|20)$/.test(k)&&str(v,300));}
