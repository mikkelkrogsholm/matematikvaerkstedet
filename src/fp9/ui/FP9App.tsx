import {Component,useEffect, useRef, useState, type PointerEvent, type ReactNode} from 'react';
import type {Answer, ExamType, PublicTask, Scene} from '../domain';
import type {AttemptAction, AttemptSummary, AttemptView, Catalog, CreateAttempt, HelpLevel, ToolState} from '../api-types';
import type {ExplanationObject, StudentObject} from '../scene';
import {allParts} from '../api-types';
import {emptyToolState, MathTools} from '../tools/Tools';
import './fp9.css';
import {SceneView} from './SceneView';

type Screen='setup'|'work'|'confirm'|'review';
type SaveState='saved'|'saving'|'error';
type OmitExpected<T>=T extends unknown?Omit<T,'expectedRevision'>:never;
type LocalAction=OmitExpected<AttemptAction>;
const jsonHeaders={'Content-Type':'application/json'};
const name=(type:ExamType)=>type==='with-aids'?'Med hjælpemidler':'Uden hjælpemidler';
const hasAnswer=(answer:Answer|undefined)=>Boolean(answer?.text.trim() || answer?.explanation?.trim() || answer?.points?.length);
export const unanswered=(attempt:AttemptView)=>allParts(attempt).flatMap(task=>task.questions.filter(q=>!hasAnswer(attempt.answers[task.id]?.[q.id])).map(q=>({taskId:task.id,questionId:q.id})));

async function request<T>(url:string, init?:RequestInit):Promise<T>{
 const response=await fetch(url,init); const body=await response.json().catch(()=>({}));
 if(!response.ok) throw new Error(`${response.status}: ${typeof body.error==='string'?body.error:'Anmodningen fejlede.'}`);
 return body as T;
}
function elapsed(clock:AttemptView['clock']) { return clock.elapsedSeconds+(clock.lastResumedAt?Math.max(0,Math.floor((Date.now()-Date.parse(clock.lastResumedAt))/1000)):0); }
function clockLabel(seconds:number){return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;}

export function FP9App(){
 const [screen,setScreen]=useState<Screen>('setup'); const [catalog,setCatalog]=useState<Catalog|null>(null); const [attempts,setAttempts]=useState<AttemptSummary[]>([]);
 const [attempt,setAttempt]=useState<AttemptView|null>(null); const attemptRef=useRef<AttemptView|null>(null); const [error,setError]=useState(''); const [save,setSave]=useState<SaveState>('saved');
 const [setup,setSetup]=useState<CreateAttempt>({examType:'without-aids',aiEnabled:false,length:'short',timingMinutes:null,feedback:'after-submit'});
 const [aiBusy,setAiBusy]=useState(false);
 const failedSaves=useRef(new Map<string,LocalAction>());const pendingSaves=useRef(0);
 useEffect(()=>{const preventLoss=(event:BeforeUnloadEvent)=>{if(pendingSaves.current||failedSaves.current.size){event.preventDefault();event.returnValue='';}};window.addEventListener('beforeunload',preventLoss);return()=>window.removeEventListener('beforeunload',preventLoss);},[]);
 const actionKey=(a:LocalAction)=>a.type+('taskId' in a?':'+a.taskId:'')+('questionId' in a?':'+a.questionId:'');
 const [now,setNow]=useState(Date.now()); const queue=useRef<Promise<AttemptView|undefined>>(Promise.resolve(undefined)); const aiAbort=useRef<AbortController|null>(null);
 useEffect(()=>{void Promise.all([request<Catalog>('/api/fp9/catalog'),request<{attempts:AttemptSummary[]}>('/api/fp9/attempts')]).then(([c,a])=>{setCatalog(c);setAttempts(a.attempts);}).catch(e=>setError(e instanceof Error?e.message:'Kataloget kunne ikke hentes.'));},[]);
 useEffect(()=>{attemptRef.current=attempt;},[attempt]);
 useEffect(()=>{const id=window.setInterval(()=>setNow(Date.now()),1000);return()=>window.clearInterval(id);},[]);
 const active=attempt?.groups.flatMap(g=>g.parts).find(t=>t.id===attempt.activeTaskId)??null;
 const flush=async()=>{await queue.current;if(failedSaves.current.size){setSave('error');setError('Der er ændringer, som ikke er gemt. Prøv at gemme igen, før du fortsætter.');return false;}return true;};
 const mutate=async(action:LocalAction):Promise<AttemptView|undefined>=>{
  const target=attemptRef.current;if(!target||target.status==='submitted')return;
  const key=actionKey(action);pendingSaves.current++;setSave('saving');setError('');
  const run=async()=>{
   const current=attemptRef.current;if(!current||current.id!==target.id||current.status==='submitted')return undefined;
   if(['navigate','submit'].includes(action.type)&&failedSaves.current.size){setSave('error');setError('Gem de manglende ændringer, før du fortsætter.');return undefined;}
   try{
    const next=await request<AttemptView>(`/api/fp9/attempts/${current.id}/action`,{method:'POST',headers:jsonHeaders,body:JSON.stringify({...action,expectedRevision:current.revision})});
    failedSaves.current.delete(key);attemptRef.current=next;setAttempt(next);setSave(failedSaves.current.size?'error':'saved');return next;
   }catch(e){
    if(!['navigate','submit'].includes(action.type))failedSaves.current.set(key,action);
    setSave('error');setError(e instanceof Error?e.message:'Gemning fejlede. Dine ændringer bevares, så du kan prøve igen.');
    // Refresh revision for an explicit retry without replacing the visible local draft.
    try{const fresh=await request<AttemptView>(`/api/fp9/attempts/${current.id}`);if(attemptRef.current?.id===fresh.id)attemptRef.current=fresh;}catch{}
    return undefined;
   }
  };
  const queued=async()=>{try{return await run();}finally{pendingSaves.current--;setSave(failedSaves.current.size?'error':pendingSaves.current?'saving':'saved');}};
  queue.current=queue.current.then(queued,queued);return queue.current;
 };
 const retrySaves=async()=>{for(const action of [...failedSaves.current.values()])await mutate(action);};
 const load=async(id:string)=>{if(!await flush())return;try{const next=await request<AttemptView>(`/api/fp9/attempts/${id}`);attemptRef.current=next;setAttempt(next);setScreen(next.status==='submitted'?'review':'work');setSave('saved');setError('');}catch(e){setError(e instanceof Error?e.message:'Forsøget kunne ikke hentes.');}};
 const create=async(newSeed=false)=>{if(!await flush())return;setError('');try{const payload={...setup,...(newSeed?{seed:Math.floor(Math.random()*2_000_000_000)}:{})};const next=await request<AttemptView>('/api/fp9/attempts',{method:'POST',headers:jsonHeaders,body:JSON.stringify(payload)});attemptRef.current=next;setAttempt(next);setAttempts(old=>[{id:next.id,createdAt:next.createdAt,status:next.status,examType:next.profile.examType,assisted:false},...old]);setScreen('work');}catch(e){setError(e instanceof Error?e.message:'Forsøget kunne ikke oprettes.');}};
 const showHome=async()=>{if(!await flush())return;try{const result=await request<{attempts:AttemptSummary[]}>('/api/fp9/attempts');setAttempts(result.attempts);setScreen('setup');}catch(e){setError(String(e));}};
 const updateAnswer=(taskId:string,questionId:string,answer:Answer)=>void mutate({type:'answer',taskId,questionId,answer});
 const saveStudent=(taskId:string,objects:StudentObject[],selection:string[])=>void mutate({type:'student',taskId,objects,selection});
 const toggleAi=(enabled:boolean)=>{if(!enabled){aiAbort.current?.abort();setAiBusy(false);}void mutate({type:'ai',enabled});};
 const sendHelp=async(level:HelpLevel,question:string)=>{
  if(aiBusy||!await flush())return;
  const current=attemptRef.current;if(!current||!current.profile.aiEnabled||current.status!=='active')return;
  const taskId=current.activeTaskId,controller=new AbortController();aiAbort.current=controller;setAiBusy(true);setError('');
  try {const next=await request<AttemptView>(`/api/fp9/attempts/${current.id}/help`,{method:'POST',headers:jsonHeaders,signal:controller.signal,body:JSON.stringify({expectedRevision:current.revision,taskId,level,question})});
   if(!controller.signal.aborted&&attemptRef.current?.id===next.id&&attemptRef.current.revision<=next.revision){attemptRef.current=next;setAttempt(next);}
  }catch(e){if(!controller.signal.aborted){setSave('error');setError(e instanceof Error?e.message:'AI-hjælp kunne ikke hentes. Du kan fortsætte uden AI.');}}
  finally{if(aiAbort.current===controller){aiAbort.current=null;setAiBusy(false);}}
 };

 useEffect(()=>{
  if(!attempt||!active)return;const scene=attempt.scenes[active.id],pending=scene?.pendingRender;if(!pending)return;
  let cancelled=false;const frame=requestAnimationFrame(()=>{
   const run=async()=>{
    const current=attemptRef.current;if(cancelled||current?.id!==attempt.id||current.scenes[active.id]?.pendingRender?.token!==pending.token)return undefined;
    let rendered=false;
    try{rendered=scene.explanationObjects.filter(o=>o.visible).every(o=>document.querySelector(`[data-ai-object-id="${CSS.escape(o.id)}"]`)!==null);}catch{}
    try{
     const next=await request<AttemptView>(`/api/fp9/attempts/${attempt.id}/ack`,{method:'POST',headers:jsonHeaders,body:JSON.stringify({taskId:active.id,token:pending.token,revision:pending.revision,success:rendered})});
     if(attemptRef.current?.id===next.id&&attemptRef.current.revision<=next.revision){attemptRef.current=next;setAttempt(next);}return next;
    }catch(e){setError(e instanceof Error?e.message:'Forklaringslaget kunne ikke bekræftes.');return undefined;}
   };
   queue.current=queue.current.then(run,run);
  });return()=>{cancelled=true;cancelAnimationFrame(frame);};
 },[attempt?.id,attempt?.revision,active?.id]);
 if(screen==='setup') return <Setup catalog={catalog} attempts={attempts} setup={setup} setSetup={setSetup} error={error} create={create} load={load} remove={async id=>{try{await request(`/api/fp9/attempts/${id}`,{method:'DELETE'});setAttempts(old=>old.filter(x=>x.id!==id));}catch(e){setError(e instanceof Error?e.message:'Sletning fejlede.');}}} importAttempt={async file=>{try{const exportData=JSON.parse(await file.text());const next=await request<AttemptView>('/api/fp9/import',{method:'POST',headers:jsonHeaders,body:JSON.stringify({export:exportData})});attemptRef.current=next;setAttempt(next);setScreen(next.status==='submitted'?'review':'work');}catch(e){setError(e instanceof Error?e.message:'Importen kunne ikke læses.');}}}/>;
 if(!attempt||!active) return <main className="fp9"><p>Henter opgavesæt…</p>{error&&<p role="alert">{error}</p>}</main>;
 if(screen==='confirm') return <Confirm attempt={attempt} onBack={()=>setScreen('work')} error={error} onSubmit={async()=>{try{const submitted=await mutate({type:'submit'});if(submitted?.status==='submitted')setScreen('review');}catch{}}}/>;
 if(screen==='review') return <Review attempt={attempt} onHome={()=>void showHome()} onNew={()=>{setSetup({...setup,examType:attempt.profile.examType,aiEnabled:false,length:'topic',familyId:active.familyId,seed:active.seed===Number.MAX_SAFE_INTEGER?0:active.seed+1,feedback:'after-submit'});setScreen('setup');}}/>;
 return <main className="fp9"><header className="fp9-header"><a href="/" className="fp9-brand">Matematikværkstedet <span>FP9-træning</span></a><div><strong>{name(attempt.profile.examType)}</strong><span className={attempt.profile.aiEnabled?'fp9-assisted':'fp9-independent'}>{attempt.assistance.length?'Assisteret træning':attempt.profile.aiEnabled?'AI til · endnu ingen hjælp':'Selvstændig træning'}</span></div><SaveIndicator state={save} error={error}/>{failedSaves.current.size>0&&<button onClick={()=>void retrySaves()}>Gem ændringer igen</button>}<button onClick={()=>void flush().then(async ready=>{if(!ready)return;const a=await request<{attempts:AttemptSummary[]}>('/api/fp9/attempts');setAttempts(a.attempts);setScreen('setup');})}>Mine øverunder</button></header>
 <div className="fp9-layout"><AttemptNav attempt={attempt} active={active.id} onNavigate={id=>void mutate({type:'navigate',taskId:id})}/><section className="fp9-work"><div className="fp9-workhead"><p>Opgave {allParts(attempt).findIndex(t=>t.id===active.id)+1} af {allParts(attempt).length}</p><div><Clock attempt={attempt} mutate={mutate}/><button type="button" onClick={()=>window.print()}>Print</button><button type="button" onClick={()=>void flush().then(ready=>ready?exportAttempt(attempt.id):undefined).catch(e=>setError(String(e)))}>Eksportér</button><button type="button" onClick={()=>void flush().then(ready=>{if(ready)setScreen('confirm');})}>Aflever</button></div></div><TaskCard task={active} attempt={attempt} updateAnswer={updateAnswer} saveStudent={saveStudent} mutate={mutate}/>{attempt.profile.examType==='with-aids'&&<Tools locked={attempt.profile.timingMinutes!==null&&(!attempt.clock.lastResumedAt||elapsed(attempt.clock)>=attempt.profile.timingMinutes*60+attempt.clock.extraSeconds)} key={attempt.id+active.id} taskId={active.id} value={attempt.tools[active.id]??emptyToolState()} onChange={value=>void mutate({type:'tools',taskId:active.id,value})}/>}</section><Guide busy={aiBusy} attempt={attempt} task={active} toggleAi={toggleAi} sendHelp={sendHelp} mutate={mutate}/></div></main>;
}

function Setup({catalog,attempts,setup,setSetup,error,create,load,remove,importAttempt}:{catalog:Catalog|null;attempts:AttemptSummary[];setup:CreateAttempt;setSetup:(v:CreateAttempt)=>void;error:string;create:(seed?:boolean)=>Promise<void>;load:(id:string)=>Promise<void>;remove:(id:string)=>Promise<void>;importAttempt:(f:File)=>Promise<void>}){const field=<K extends keyof CreateAttempt>(key:K,value:CreateAttempt[K])=>setSetup({...setup,[key]:value});return <main className="fp9 fp9-setup"><header className="fp9-header"><a href="/" className="fp9-brand">Matematikværkstedet</a><span>FP9 · lokal træning</span></header><section><p className="fp9-kicker">SKRIFTLIG MATEMATIK · 9. KLASSE</p><h1>Start en øverunde</h1><p>Dette er træning, ikke et officielt prøvesystem. Kildeprofil: {catalog?`${catalog.sourceVersion}, ${catalog.sourceDate}`:'henter…'}.</p><fieldset><legend>Prøvetype</legend><label><input type="radio" checked={setup.examType==='without-aids'} onChange={()=>field('examType','without-aids')}/> Uden hjælpemidler</label><label><input type="radio" checked={setup.examType==='with-aids'} onChange={()=>field('examType','with-aids')}/> Med hjælpemidler</label></fieldset><fieldset><legend>AI som støttehjul</legend><label><input type="checkbox" checked={setup.aiEnabled} onChange={e=>field('aiEnabled',e.target.checked)}/> Jeg vil kunne bede om hjælp</label><small>Hjælp bliver synligt registreret som assisteret træning.</small></fieldset><fieldset><legend>Omfang</legend>{(['short','full','topic'] as const).map(x=><label key={x}><input type="radio" checked={setup.length===x} onChange={()=>field('length',x)}/> {x==='short'?'Kort, blandet runde':x==='full'?'Fuldt øvesæt':'Træn ét emne'}</label>)}{setup.length==='topic'&&<select aria-label="Emne" value={setup.familyId??''} onChange={e=>field('familyId',e.target.value as CreateAttempt['familyId'])}><option value="">Vælg emne</option>{catalog?.families.filter(f=>f.status==='implemented').map(f=><option key={f.id} value={f.id}>{f.id}: {f.title}</option>)}</select>}</fieldset><fieldset><legend>Tid og feedback</legend><label>Minutter <select value={setup.timingMinutes??''} onChange={e=>field('timingMinutes',e.target.value?Number(e.target.value):null)}><option value="">Ingen tidsgrænse</option><option value="30">30</option><option value="60">60</option><option value="180">180</option></select></label><label><input type="radio" checked={setup.feedback==='immediate'} onChange={()=>field('feedback','immediate')}/> Feedback undervejs</label><label><input type="radio" checked={setup.feedback==='after-submit'} onChange={()=>field('feedback','after-submit')}/> Feedback efter aflevering</label></fieldset><button className="fp9-primary" onClick={()=>void create()}>Opret øverunde</button><button className="fp9-secondary" onClick={()=>void create(true)}>Ny variant uden at genbruge opgaven</button>{error&&<p className="fp9-error" role="alert">{error}</p>}</section><section className="fp9-resume"><h2>Genoptag, importér eller slet</h2><label className="fp9-file">Importér eksportfil <input type="file" accept="application/json" onChange={e=>{const f=e.target.files?.[0];if(f)void importAttempt(f);}}/></label>{attempts.length?attempts.map(a=><div className="fp9-attempt" key={a.id}><span>{name(a.examType)} · {a.assisted?'assisteret':'selvstændig'}<small>{new Date(a.createdAt).toLocaleString('da-DK')}</small></span><button onClick={()=>void load(a.id)}>Åbn</button><button onClick={()=>void remove(a.id)}>Slet</button></div>):<p>Ingen gemte øverunder endnu.</p>}</section></main>}

function SaveIndicator({state,error}:{state:SaveState;error:string}){return <p className={`fp9-save ${state}`} role={error||state==='error'?'alert':'status'}>{error?error:state==='saving'?'Gemmer…':state==='saved'?'Alt er gemt':`Gemning fejlede${error?`: ${error}`:''}`}</p>}
function AttemptNav({attempt,active,onNavigate}:{attempt:AttemptView;active:string;onNavigate:(id:string)=>void}){return <nav className="fp9-nav" aria-label="Opgaver">{attempt.groups.map(g=><section key={g.id}><h2>{g.title}</h2>{g.parts.map(task=>{const done=task.questions.every(q=>hasAnswer(attempt.answers[task.id]?.[q.id]));const visited=attempt.visited.includes(task.id);const flagged=attempt.flagged.includes(task.id);return <button key={task.id} aria-current={task.id===active?'page':undefined} onClick={()=>onNavigate(task.id)}><span className={done?'done':visited?'visited':'new'}>{done?'✓':visited?'·':'○'}</span>{task.title}{flagged&&<b aria-label="Markeret til senere">⚑</b>}</button>;})}</section>)}</nav>}
function Clock({attempt,mutate}:{attempt:AttemptView;mutate:(a:LocalAction)=>Promise<AttemptView|undefined>}){const limit=attempt.profile.timingMinutes?attempt.profile.timingMinutes*60+attempt.clock.extraSeconds:null;const used=elapsed(attempt.clock);return <span className="fp9-clock">{limit?`Tilbage ${clockLabel(Math.max(0,limit-used))}`:`Tid ${clockLabel(used)}`} {attempt.clock.lastResumedAt?<button onClick={()=>void mutate({type:'pause'})}>Pause</button>:<button onClick={()=>void mutate({type:'resume'})}>Fortsæt</button>}<button onClick={()=>void mutate({type:'extra',seconds:300})}>+5 min</button></span>}

class SceneBoundary extends Component<{children:ReactNode},{failed:boolean}> {
 override state={failed:false}; static getDerivedStateFromError(){return {failed:true};}
 override render(){return this.state.failed?<p role="alert">Figuren kunne ikke vises. AI-handlingen bliver ikke bekræftet.</p>:this.props.children;}
}
function TaskCard({task,attempt,updateAnswer,saveStudent,mutate}:{task:PublicTask;attempt:AttemptView;updateAnswer:(t:string,q:string,a:Answer)=>void;saveStudent:(t:string,o:StudentObject[],s:string[])=>void;mutate:(a:LocalAction)=>Promise<AttemptView|undefined>}){
 const locked=attempt.status==='submitted'||(attempt.profile.timingMinutes!==null&&(!attempt.clock.lastResumedAt||elapsed(attempt.clock)>=attempt.profile.timingMinutes*60+attempt.clock.extraSeconds));
 return <article className="fp9-task"><p className="fp9-kicker">{task.familyId} · VARIANT {task.variant+1}</p><h1>{task.title}</h1><p className="fp9-story">{task.story}</p>{task.scene.kind!=='text'&&task.facts&&<ul>{task.facts.map((fact,i)=><li key={i}>{fact}</li>)}</ul>}
 <SceneBoundary key={task.id+':'+(attempt.scenes[task.id]?.pendingRender?.token??'ready')}><SceneView task={task} state={attempt.scenes[task.id]} withAids={attempt.profile.examType==='with-aids'} locked={locked} onStudent={(o,s)=>saveStudent(task.id,o,s)}/></SceneBoundary>
 {task.questions.map(q=><DraftAnswer key={attempt.id+task.id+q.id} question={q} initial={attempt.answers[task.id]?.[q.id]??{text:''}} locked={locked} onSave={a=>updateAnswer(task.id,q.id,a)}
  feedback={attempt.assessments[task.id]?.[q.id]} allowFeedback={attempt.profile.feedback==='immediate'&&!locked} onFeedback={()=>void mutate({type:'feedback',taskId:task.id,questionId:q.id})}/>)}
 <DraftNote key={attempt.id+task.id} initial={attempt.notes[task.id]??''} locked={locked} onSave={text=>void mutate({type:'note',taskId:task.id,text})}/>
 <div className="fp9-task-actions"><button disabled={locked} onClick={()=>void mutate({type:'flag',taskId:task.id,flagged:!attempt.flagged.includes(task.id)})}>{attempt.flagged.includes(task.id)?'Fjern markering':'Markér til senere'}</button><button disabled={locked} onClick={()=>void mutate({type:'undo',taskId:task.id})}>Fortryd AI-forklaring</button></div></article>;
}
function DraftAnswer({question:q,initial,locked,onSave,feedback,allowFeedback,onFeedback}:{question:PublicTask['questions'][number];initial:Answer;locked:boolean;onSave:(a:Answer)=>void;feedback:AttemptView['assessments'][string][string]|undefined;allowFeedback:boolean;onFeedback:()=>void}){
 const [draft,setDraft]=useState(initial);const lastSent=useRef<Answer|null>(null);
 // Geometry is shared with the plotted student layer; server changes must reach these fields.
 useEffect(()=>{if(q.answerKind!=='geometry')return;if(lastSent.current){if(JSON.stringify(initial.points)===JSON.stringify(lastSent.current.points))lastSent.current=null;return;}setDraft(initial);},[initial]);
 const change=(patch:Partial<Answer>)=>{const next={...draft,...patch};if(q.answerKind==='geometry')lastSent.current=next;setDraft(next);onSave(next);};
 return <section className="fp9-answer"><h2>{q.prompt}</h2>{q.answerKind==='geometry'?<GeometryAnswer answer={draft} disabled={locked} onChange={a=>change(a)}/>:<>
 <label>Dit svar{q.unit?` (${q.unit})`:''}{q.answerKind==='reasoning'?<textarea aria-label="Dit svar" disabled={locked} maxLength={4000} value={draft.text} onChange={e=>change({text:e.target.value})}/>:<input disabled={locked} maxLength={4000} inputMode={q.answerKind==='number'&&!['fraction','scientific'].includes(q.format??'')?'decimal':'text'} value={draft.text} onChange={e=>change({text:e.target.value})}/>}</label>
 {q.answerKind!=='reasoning'&&<label>Forklar din metode (når opgaven beder om det)<textarea aria-label="Forklar din metode (når opgaven beder om det)" disabled={locked} maxLength={4000} value={draft.explanation??''} onChange={e=>change({explanation:e.target.value})}/></label>}</>}
 {!locked&&<button onClick={()=>onSave(draft)}>Gem svar igen</button>}
 {allowFeedback&&<><button onClick={onFeedback}>Tjek mit svar</button><small>Feedback undervejs registreres som støtte.</small></>}{feedback&&<Assessment value={feedback}/>}</section>;
}
function DraftNote({initial,locked,onSave}:{initial:string;locked:boolean;onSave:(text:string)=>void}){const [text,setText]=useState(initial);return <label className="fp9-note">Dine noter<textarea aria-label="Dine noter" disabled={locked} maxLength={4000} value={text} onChange={e=>{setText(e.target.value);onSave(e.target.value);}}/></label>;}

function Assessment({value}:{value:NonNullable<AttemptView['assessments'][string]>[string]}){return <aside className="fp9-assessment"><strong>{value.status==='needs-review'?'Kræver gennemgang':value.status==='correct'?'Korrekt':value.status==='partial'?'Delvist korrekt':'Tjek dit svar'}</strong><p>{value.feedback}</p><p>Kriterier: {value.criteria.join(' ')}</p></aside>}
function CoordinateField({value,disabled,onSave}:{value:number;disabled:boolean;onSave:(value:string)=>void}){
 const [text,setText]=useState(String(value)),[invalid,setInvalid]=useState(false);
 useEffect(()=>{setText(String(value));setInvalid(false);},[value]);
 const commit=()=>{const normalized=text.trim().replace(',','.');if(!/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(normalized)||!Number.isFinite(Number(normalized))){setInvalid(true);return;}setInvalid(false);if(Number(normalized)!==value)onSave(normalized);};
 return <><input disabled={disabled} inputMode="decimal" aria-invalid={invalid} value={text} onChange={e=>setText(e.target.value)} onBlur={commit} onKeyDown={e=>{if(e.key==='Enter')commit();}}/>{invalid&&<small role="alert">Skriv et gyldigt koordinattal.</small>}</>;
}
function GeometryAnswer({answer,disabled,onChange}:{answer:Answer;disabled:boolean;onChange:(a:Answer)=>void}){const points=answer.points??[];const change=(index:number,axis:0|1,value:string)=>{const next=points.map(p=>[...p] as [number,number]);const parsed=Number(value);if(next[index])next[index][axis]=Number.isFinite(parsed)?parsed:0;onChange({...answer,points:next});};return <div className="fp9-geometry-answer"><p>Angiv dine punkter. Du kan også placere eller trække punkter på koordinatplanet ovenfor.</p>{points.map((p,i)=><fieldset key={i}><legend>Punkt {i+1}</legend><label>x <CoordinateField disabled={disabled} value={p[0]} onSave={value=>change(i,0,value)}/></label><label>y <CoordinateField disabled={disabled} value={p[1]} onSave={value=>change(i,1,value)}/></label><button disabled={disabled} onClick={()=>onChange({...answer,points:points.filter((_,x)=>x!==i)})}>Fjern</button></fieldset>)}<button disabled={disabled} onClick={()=>onChange({...answer,points:[...points,[0,0]]})}>Tilføj punkt</button></div>}


function Tools({taskId,value,onChange,locked}:{locked:boolean;taskId:string;value:ToolState;onChange:(v:ToolState)=>void}){const [local,setLocal]=useState(value);return <section className="fp9-tools-wrap"><fieldset disabled={locked}><MathTools value={local} onChange={v=>{setLocal(v);onChange(v);}}/></fieldset><p>Dit regneark og dine beregninger gemmes med opgaven.</p></section>;}

function Guide({busy,attempt,task,toggleAi,sendHelp,mutate}:{busy:boolean;attempt:AttemptView;task:PublicTask;toggleAi:(v:boolean)=>void;sendHelp:(l:HelpLevel,q:string)=>Promise<void>;mutate:(a:LocalAction)=>Promise<AttemptView|undefined>}){const [question,setQuestion]=useState('');const history=attempt.chat[task.id]??[];const help=attempt.assistance.filter(x=>x.taskId===task.id);return <aside className="fp9-guide"><h2>Støttehjul</h2><small>Aktiv opgave, svar, noter, figur og værktøjstilstand sendes til Codex via dit abonnement.</small>{busy&&<p role="status">Guiden tænker… <button onClick={()=>toggleAi(false)}>Stop og slå AI fra</button></p>}<label><input type="checkbox" checked={attempt.profile.aiEnabled} onChange={e=>toggleAi(e.target.checked)}/> AI-støtte</label><p>{attempt.profile.aiEnabled?'Du vælger selv støtteniveau.':'AI er slået fra. Dit tidligere arbejde og hjælpelog bevares.'}</p>{attempt.profile.aiEnabled&&<><div className="fp9-help-levels">{(['question','hint','step','solution'] as HelpLevel[]).map((level,i)=><button key={level} disabled={busy} onClick={()=>void sendHelp(level,question||`Hjælp mig med ${task.title}.`)}>{['Stil spørgsmål','Lille hint','Vis ét trin','Vis løsning'][i]}</button>)}</div><form onSubmit={e=>{e.preventDefault();void sendHelp('question',question);}}><label>Dit spørgsmål<input value={question} maxLength={2000} onChange={e=>setQuestion(e.target.value)} placeholder="Hvad vil du forstå?"/></label><button disabled={busy||!question.trim()}>Send til guiden</button></form></>}{history.length>0&&<section><h3>Synlig hjælphistorik</h3>{history.map((m,i)=><p className={`fp9-chat ${m.role}`} key={i}><b>{m.role==='guide'?'GUIDE':'DIG'}</b>{m.text}</p>)}</section>}{help.length>0&&<p className="fp9-assisted">Assisteret: {help.map(h=>h.level).join(', ')}</p>}<button onClick={()=>void mutate({type:'undo',taskId:task.id})}>Fortryd seneste AI-lag</button></aside>}
function Confirm({attempt,onBack,onSubmit,error}:{error:string;attempt:AttemptView;onBack:()=>void;onSubmit:()=>void}){const missing=unanswered(attempt);return <main className="fp9 fp9-confirm"><h1>Klar til aflevering?</h1>{error&&<p role="alert">{error}</p>}<p>Du har {missing.length} ubesvarede delopgave{missing.length===1?'':'r'}.</p>{missing.length>0&&<ul>{missing.map(x=><li key={`${x.taskId}/${x.questionId}`}>{allParts(attempt).findIndex(t=>t.id===x.taskId)+1}. {allParts(attempt).find(t=>t.id===x.taskId)?.questions.find(q=>q.id===x.questionId)?.prompt}</li>)}</ul>}<p>Efter aflevering låses svarene. Resultatet er læringsfeedback og ikke en officiel karakter.</p><button onClick={onBack}>Tilbage til opgaverne</button><button className="fp9-primary" onClick={onSubmit}>Aflever øverunden</button></main>}
function Review({attempt,onHome,onNew}:{attempt:AttemptView;onHome:()=>void;onNew:()=>void}){return <main className="fp9 fp9-review"><header className="fp9-header"><a href="/" className="fp9-brand">Matematikværkstedet</a><button onClick={onHome}>Til øverunder</button></header><h1>Afleveret øverunde</h1><button onClick={onNew}>Ny variant uden AI</button><button onClick={()=>void exportAttempt(attempt.id)}>Eksportér</button><button onClick={()=>window.print()}>Print</button><p>{attempt.assistance.length?'Assisteret træning':attempt.profile.aiEnabled?'AI til · endnu ingen hjælp':'Selvstændig træning'}. Dette er ikke en officiel karakter.</p>{allParts(attempt).map(task=><section key={task.id}><h2>{task.title}</h2><p>{task.story}</p>{task.scene.kind!=='text'&&task.facts&&<ul>{task.facts.map((fact,i)=><li key={i}>{fact}</li>)}</ul>}<SceneView task={task} state={attempt.scenes[task.id]} withAids={attempt.profile.examType==='with-aids'} locked={true} onStudent={()=>{}}/>{task.questions.map(q=>{const answer=attempt.answers[task.id]?.[q.id];const assessment=attempt.assessments[task.id]?.[q.id];return <article key={q.id}><h3>{q.prompt}</h3><p><b>Dit svar:</b> {answer?.text||answer?.points?.map(p=>`(${p[0]}, ${p[1]})`).join(', ')||'Ikke besvaret'}</p>{answer?.explanation&&<p>{answer.explanation}</p>}{assessment?<><Assessment value={assessment}/><details><summary>Referenceeksempler til gennemgang</summary>{assessment.examples.map((text,i)=><p key={i}>{text}</p>)}</details></>:<p>Ingen automatisk vurdering. Åbne svar kan kræve gennemgang.</p>}</article>;})}</section>)}</main>}

async function exportAttempt(id:string){const data=await request<unknown>(`/api/fp9/attempts/${id}/export`);const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=id+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
