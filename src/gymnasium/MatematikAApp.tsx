import {useEffect,useRef,useState} from 'react';
import type {Family,PublicTask,TaskRef} from './domain';
import {validateReply,type Exploration,type GuideAction} from './guide';
import {Visual} from './Visual';

type Message={role:'student'|'guide';text:string};
type Feedback={task:TaskRef;difficulty:string;note:string;at:string};
type Saved={ref:TaskRef;answer:string;assisted:boolean;aiEnabled:boolean;feedback:Feedback[];messages:Message[]};
const key='matematik-a-pilot-v2';
const initial=():Saved=>{
 try{const v=JSON.parse(localStorage.getItem(key)||'null');if(v&&['analytisk','trekant','ugrupperet','grupperet'].includes(v.ref?.family)&&Number.isSafeInteger(v.ref.seed)&&v.ref.seed>=0&&v.ref.seed<=2e9&&[0,1,2].includes(v.ref.variant)&&typeof v.answer==='string'&&v.answer.length<=100&&Array.isArray(v.feedback)&&Array.isArray(v.messages))return {...v,aiEnabled:typeof v.aiEnabled==='boolean'?v.aiEnabled:true,assisted:v.assisted===true,feedback:v.feedback.filter((f:Feedback)=>f&&typeof f.note==='string'&&typeof f.difficulty==='string'&&f.task).slice(-100),messages:v.messages.filter((m:Message)=>m&&['student','guide'].includes(m.role)&&typeof m.text==='string').slice(-12)};}catch{}
 return {ref:{family:'analytisk',seed:Math.floor(Math.random()*1e8),variant:0},answer:'',assisted:false,aiEnabled:true,feedback:[],messages:[]};
};
async function api<T>(path:string,body?:unknown,signal?:AbortSignal):Promise<T>{
 const r=await fetch('/api/gymnasium/'+path,body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal}:{signal});
 const data=await r.json();if(!r.ok)throw Error(data.error||'Forbindelsen fejlede.');return data;
}
export function MatematikAApp(){
 const [saved,setSaved]=useState<Saved>(initial),[task,setTask]=useState<PublicTask|null>(null);
 const [catalog,setCatalog]=useState<{id:Family;tab:string;title:string;subtitle:string}[]>([]);
 const [aiAvailable,setAiAvailable]=useState(false),[ai,setAi]=useState(saved.aiEnabled),[busy,setBusy]=useState(false),[error,setError]=useState(''),[result,setResult]=useState('');
 const [exploration,setExploration]=useState<Exploration>({x:0,y:0,offset:0}),[actions,setActions]=useState<GuideAction[]>([]);
 const [question,setQuestion]=useState(''),[note,setNote]=useState(''),[difficulty,setDifficulty]=useState('passer'),[feedbackStatus,setFeedbackStatus]=useState('');
 const [summaries,setSummaries]=useState(false);
 const revision=useRef(0),pending=useRef<AbortController|null>(null),sceneRoot=useRef<HTMLDivElement>(null);
 const cancel=()=>{revision.current++;pending.current?.abort();pending.current=null;setBusy(false);};
 useEffect(()=>{api<{families:typeof catalog;aiAvailable:boolean}>('catalog').then(v=>{setCatalog(v.families);setAiAvailable(v.aiAvailable)}).catch(e=>setError(String(e)));return()=>pending.current?.abort();},[]);
 useEffect(()=>{try{localStorage.setItem(key,JSON.stringify(saved));}catch{setError('Browseren kunne ikke gemme lokalt. Eksportér din feedback før du lukker.');}},[saved]);
 useEffect(()=>{
  const controller=new AbortController();setTask(null);setError('');setResult('');setActions([]);setSummaries(false);setExploration({x:0,y:0,offset:0});
  api<PublicTask>('task',{ref:saved.ref},controller.signal).then(setTask).catch(e=>{if(!controller.signal.aborted)setError(String(e))});
  return()=>controller.abort();
 },[saved.ref.family,saved.ref.seed,saved.ref.variant]);
 const select=(ref:TaskRef)=>{cancel();setSaved(s=>({...s,ref,answer:'',assisted:false,messages:[]}));setNote('');setFeedbackStatus('');};
 const updateExploration=(v:Exploration)=>{cancel();setActions([]);setExploration(v);};
 async function check(){
  if(!task)return;setError('');const rev=revision.current;
  try{const value=await api<{feedback:string}>('check',{ref:saved.ref,answer:saved.answer});if(revision.current===rev)setResult(value.feedback);}catch(e){setError(String(e));}
 }
 async function help(level:'hint'|'step'|'solution'){
  if(!task||!ai||!aiAvailable||pending.current)return;
  const controller=new AbortController(),rev=revision.current;pending.current=controller;setBusy(true);setError('');
  const q=question.trim()||({hint:'Giv mig et hint uden at give facit.',step:'Vis et næste trin og markér det relevante i figuren.',solution:'Forklar løsningen og metoden.'}[level]);
  setSaved(s=>({...s,messages:[...s.messages,{role:'student',text:q}].slice(-12) as Message[]}));setQuestion('');
  try{
   const value=await api<{text:string;actions:GuideAction[];revision:number;taskId:string}>('help',{ref:saved.ref,answer:saved.answer,question:q,level,exploration,revision:rev,aiEnabled:true},controller.signal);
   if(controller.signal.aborted||rev!==revision.current||value.taskId!==task.id||value.revision!==rev)return;
   const reply=validateReply(value,task);setSaved(s=>({...s,assisted:true}));setActions(reply.actions);
   for(const action of reply.actions)if(action.kind==='cursor')setExploration(e=>({...e,x:action.x,y:action.y}));
   await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));
   if(controller.signal.aborted||rev!==revision.current)return;
   const rendered=reply.actions.every(a=>a.kind==='annotate'?!!sceneRoot.current?.textContent?.includes(a.text):a.kind==='cursor'?!!sceneRoot.current?.querySelector('[data-gym-cursor]'):!!sceneRoot.current?.querySelector(`[data-gym-target="${a.target}"]`));
   if(!rendered){setActions([]);setExploration(exploration);throw Error('Figurhandlingen kunne ikke vises. Prøv igen.');}
   setSaved(s=>({...s,assisted:true,messages:[...s.messages,{role:'guide',text:reply.text+(reply.actions.length?'\nForklaringslaget er opdateret.':'')}].slice(-12) as Message[]}));
  }catch(e){if(!controller.signal.aborted)setError(e instanceof Error?e.message:'AI-forbindelsen fejlede.');}
  finally{if(pending.current===controller){pending.current=null;setBusy(false);}}
 }
 const tab=saved.ref.family==='analytisk'||saved.ref.family==='trekant'?'PLANGEOMETRI':'DESKRIPTIV STATISTIK';
 const saveFeedback=()=>{setSaved(s=>({...s,feedback:[...s.feedback,{task:{...s.ref},difficulty,note:note.trim(),at:new Date().toISOString()}].slice(-100)}));setFeedbackStatus('Feedback gemt på denne enhed.');setNote('');};
 const exportFeedback=()=>{const blob=new Blob([JSON.stringify({version:1,feedback:saved.feedback},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='matematik-a-feedback.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 return <div className="ma-app"><header className="ma-header"><a className="brand" href="/">matematikværkstedet</a><span>MATEMATIK A · STX</span><a href="/fp9">FP9-træning</a></header><main className="ma-main">
  <aside className="ma-nav"><p>EMNETRÆNING</p><h2>Træn en idé ad gangen</h2><div className="ma-tabs">{(['PLANGEOMETRI','DESKRIPTIV STATISTIK'] as const).map(t=><button key={t} aria-pressed={tab===t} onClick={()=>select({...saved.ref,family:t==='PLANGEOMETRI'?'analytisk':'ugrupperet',variant:0})}>{t}</button>)}</div>{catalog.filter(f=>f.tab===tab).map(f=><button className="ma-family" aria-current={f.id===saved.ref.family?'page':undefined} key={f.id} onClick={()=>select({...saved.ref,family:f.id,variant:0})}><strong>{f.title}</strong><small>{f.subtitle}</small></button>)}<p className="ma-limit">Et første udvalg til afprøvning. Flere emner kommer senere.</p></aside>
  <section className="ma-work"><p className="ma-kicker">MATEMATIK A PÅ GYMNASIENIVEAU</p>{error&&<p role="alert" className="ma-error">{error}</p>}{!task?<p>Henter opgave…</p>:<><h1>{task.title}</h1><p>{task.story}</p><small>Variant {saved.ref.variant+1} · {saved.assisted?'Assisteret træning':'Ingen hjælp brugt'} · Opgave {saved.ref.seed}</small><div className="ma-card"><section><h3>Givet</h3><ul>{task.givens.map((x,i)=><li key={i}>{x}</li>)}</ul></section><div ref={sceneRoot}><Visual task={task} exploration={exploration} actions={actions}/></div></div>
  <details><summary>Undersøg figuren — opgavens data ændres ikke</summary>{task.scene.kind==='geo'?<>{(['x','y'] as const).map(axis=><label key={axis}>Markørens {axis}: {exploration[axis]}<input aria-label={`Markør ${axis}`} type="range" min="-10" max="20" step="0.5" value={exploration[axis]} onChange={e=>updateExploration({...exploration,[axis]:Number(e.target.value)})}/></label>)}</>:<><label>Ændr den sidste søjle i udforskningen: {exploration.offset}<input aria-label="Udforsk sidste søjle" type="range" min="-2" max="20" value={exploration.offset} onChange={e=>updateExploration({...exploration,offset:Number(e.target.value)})}/></label><button onClick={()=>{setSummaries(v=>!v);setSaved(s=>({...s,assisted:true}));}}>Vis/skjul deskriptorer som hjælp</button>{summaries&&<Statistics values={task.scene.values.map((v,i)=>i===task.scene.values.length-1?Math.max(0,v+exploration.offset):v)} grouped={!!task.scene.labels}/>}</>}</details>
  <section className="ma-question"><h2>{task.question}</h2><form onSubmit={e=>{e.preventDefault();void check();}}><label>{task.answerLabel}<input aria-label="Dit svar" value={saved.answer} onChange={e=>{cancel();setResult('');setSaved(s=>({...s,answer:e.target.value}));}} maxLength={100} inputMode="decimal" placeholder="Skriv dit svar"/> {task.unit}</label><button className="ma-primary" type="submit">Tjek svar</button></form><p role="status">{result}</p><div className="ma-actions"><button onClick={()=>select({...saved.ref,seed:Math.floor(Math.random()*1e8)})}>Ny opgave</button><button onClick={()=>select({...saved.ref,variant:(saved.ref.variant+1)%3})}>Ny variant</button></div></section></>}
  <section className="ma-feedback"><h3>Giv feedback på opgaven</h3><label>Sværhedsgrad<select value={difficulty} onChange={e=>setDifficulty(e.target.value)}><option value="let">Let</option><option value="passer">Passer</option><option value="svær">Svær</option><option value="forvirrende">Forvirrende</option></select></label><label>Din oplevelse<input value={note} onChange={e=>setNote(e.target.value)} maxLength={500} placeholder="Hvad var godt eller svært at forstå?"/></label><button disabled={!task} onClick={saveFeedback}>Gem feedback</button><button onClick={exportFeedback}>Eksportér feedback ({saved.feedback.length})</button><p role="status">{feedbackStatus}</p></section>
  </section><aside className="ma-guide"><h2>Matematikguide</h2><label><input type="checkbox" checked={ai} onChange={e=>{cancel();setAi(e.target.checked);setSaved(s=>({...s,aiEnabled:e.target.checked}));}}/> AI-støtte {ai?'til':'fra'}</label><p>{!ai?'Du arbejder uden AI.':aiAvailable?'Guiden bruger det lokale Codex-login. Opgave, svar og udforskning sendes, når du beder om hjælp.':'AI er ikke tilgængelig. Du kan stadig løse opgaverne.'}</p><div className="ma-messages" aria-live="polite">{saved.messages.map((m,i)=><p key={i} className={m.role==='guide'?'ma-help':''}><b>{m.role==='guide'?'Guide':'Dig'}:</b> {m.text}</p>)}</div><label>Spørg om opgaven<textarea value={question} onChange={e=>setQuestion(e.target.value)} maxLength={1200} placeholder="Hvad vil du gerne forstå?"/></label><div className="ma-actions"><button disabled={!ai||!aiAvailable||busy||!task} onClick={()=>void help('hint')}>Giv et hint</button><button disabled={!ai||!aiAvailable||busy||!task} onClick={()=>void help('step')}>Vis næste skridt</button><button disabled={!ai||!aiAvailable||busy||!task} onClick={()=>void help('solution')}>Vis løsning</button></div>{busy&&<><p role="status">Guiden tænker…</p><button onClick={cancel}>Stop</button></>}<button disabled={!actions.length} onClick={()=>{cancel();setActions([]);}}>Ryd forklaringslag</button><small>Dette er emnetræning, ikke en eksamenssimulation. Deskriptiv statistik er undervisningsstof; piloten dækker ikke hele emnet.</small></aside>
 </main></div>;
}
function Statistics({values,grouped}:{values:number[];grouped:boolean}){
 const sorted=[...values].sort((a,b)=>a-b),median=(a:number[])=>a.length%2?a[Math.floor(a.length/2)]!:(a[a.length/2-1]!+a[a.length/2]!)/2;
 const total=values.reduce((a,b)=>a+b,0),mean=grouped?values.reduce((s,n,i)=>s+n*(i*10+5),0)/total:total/values.length;
 const variance=grouped?values.reduce((s,n,i)=>s+n*(i*10+5-mean)**2,0)/total:values.reduce((s,n)=>s+(n-mean)**2,0)/values.length;
 const fmt=(n:number)=>n.toLocaleString('da-DK',{maximumFractionDigits:2});
 if(grouped){let sum=0;return <div><p>Udforskning: gennemsnitsestimat {fmt(mean)}; variansestimat {fmt(variance)}; spredningsestimat {fmt(Math.sqrt(variance))}. Klassemidtpunkter 5, 15, 25 og 35; vægtning med hyppigheder.</p><table><caption>Kumuleret frekvens (sumkurvens punkter)</caption><thead><tr><th>Øvre grænse</th><th>Kumuleret frekvens</th></tr></thead><tbody><tr><td>0</td><td>0 %</td></tr>{values.map((n,i)=>{sum+=n;return <tr key={i}><td>{(i+1)*10}</td><td>{fmt(sum/total*100)} %</td></tr>})}</tbody></table></div>}
 const q1=median(sorted.slice(0,Math.floor(sorted.length/2))),q2=median(sorted),q3=median(sorted.slice(Math.ceil(sorted.length/2))),min=sorted[0]!,max=sorted.at(-1)!,X=(n:number)=>30+(n-min)/Math.max(1,max-min)*350;
 return <div><p>Udforskning: gennemsnit {fmt(mean)}; median {fmt(q2)}; Q1 {fmt(q1)}; Q3 {fmt(q3)}; varians {fmt(variance)}; spredning {fmt(Math.sqrt(variance))}. Variansen divideres med n. Kvartiler: median af halvdele, den centrale observation udelades.</p><svg viewBox="0 0 410 95" role="img" aria-label="Boksplot over udforskningsdata"><line x1={X(min)} x2={X(max)} y1="40" y2="40" stroke="#31745b"/><rect x={X(q1)} y="20" width={X(q3)-X(q1)} height="40" fill="#e5efe8" stroke="#31745b"/>{[min,q1,q2,q3,max].map((v,i)=><g key={i}><line x1={X(v)} x2={X(v)} y1="20" y2="60" stroke="#31745b"/><text x={X(v)} y={i%2?88:75} textAnchor="middle" fontSize="11">{fmt(v)}</text></g>)}</svg></div>;
}
