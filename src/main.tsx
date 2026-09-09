import { LearningApp } from './gymnasium/learning/App';
import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Mafs, Coordinates, Plot, MovablePoint, Line } from 'mafs';
import { parseReply, type Scene } from './ai/contracts';
import { FP9App } from './fp9/ui/FP9App';
import { MatematikAApp } from './gymnasium/MatematikAApp';
import type { Lesson } from './lessons';
import { percent, curve, slope, tangent, format, parseAnswer } from './math';
import 'mafs/core.css';
import './style.css';

type Mode = Lesson['id'];
type Message = { role: 'guide' | 'student'; text: string };
const introductions: Record<Mode, string> = {
  fractions: 'Lad os gøre brøker synlige. Det grønne er den del, vi har valgt. Klik på felterne, og se brøken blive til procent.',
  functions: 'En tangent viser grafens hældning i ét punkt. Flyt det grønne punkt, og hold øje med, hvordan den stiplede linje drejer.',
};

function App() {
  const [catalog, setCatalog] = useState<Lesson[]>([]);
  const [loadError, setLoadError] = useState(false);
  useEffect(() => { fetch('/api/lessons').then(r => { if (!r.ok) throw Error(); return r.json(); }).then(data => {
    if (!Array.isArray(data) || !data.every(l => l && ['fractions','functions'].includes(l.id) && typeof l.title === 'string' && typeof l.grade === 'string')) throw Error('Invalid lesson catalog');
    setCatalog(data as Lesson[]);
  }).catch(() => setLoadError(true)); }, []);
  const [mode, setMode] = useState<Mode>('fractions');
  const [n, setN] = useState(3); const [d, setD] = useState(4);
  const [a, setA] = useState(1); const [x, setX] = useState(1);
  const [view, setView] = useState<'bar' | 'line'>('bar');
  const [step, setStep] = useState(0);
  const [messages, setMessages] = useState<Message[]>([{ role: 'guide', text: introductions.fractions }]);
  const messagePanel = useRef<HTMLDivElement>(null);
  useEffect(() => { if (messagePanel.current) messagePanel.current.scrollTop = messagePanel.current.scrollHeight; }, [messages]);
  const [input, setInput] = useState('');
  const [answer, setAnswer] = useState(''); const [feedback, setFeedback] = useState('');
  const [exercise, setExercise] = useState(0);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [aiStatus, setAiStatus] = useState({ available: false, detail: 'Kontrollerer Codex-login…' });
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState('');
  const pending = useRef<AbortController | null>(null);
  useEffect(() => {
    fetch('/api/ai/status').then(r => r.json()).then(setAiStatus)
      .catch(() => setAiStatus({ available: false, detail: 'AI-status kunne ikke hentes.' }));
    return () => pending.current?.abort();
  }, []);
  const scene: Scene = mode === 'fractions' ? { mode, n, d, view } : { mode, a, x };
  // A revision also catches a student changing a value and then changing it back.
  const currentScene = useRef({ key: '', revision: 0 });
  const contextKey = JSON.stringify({ scene, step, exercise });
  if (currentScene.current.key !== contextKey) currentScene.current = { key: contextKey, revision: currentScene.current.revision + 1 };
  function cancelAi() { pending.current?.abort(); pending.current = null; setAiBusy(false); setAiError(''); }
  async function askGuide(question: string) {
    if (pending.current || !aiEnabled || !aiStatus.available) return;
    const controller = new AbortController(); pending.current = controller;
    const revision = currentScene.current.revision;
    const request = { question, history: messages.slice(-8), scene, task: step === 2 ? task.question : null };
    setMessages(old => [...old.slice(-7), { role: 'student', text: question }]);
    setAiBusy(true); setAiError('');
    try {
      const response = await fetch('/api/ai/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request), signal: controller.signal });
      const data = await response.json();
      if (!response.ok) throw Error(data.error || 'AI-forbindelsen fejlede.');
      const reply = parseReply(data, mode);
      if (controller.signal.aborted) return;
      if (revision !== currentScene.current.revision) {
        setAiError('Du ændrede figuren eller opgaven undervejs. Spørg igen, så guiden tager udgangspunkt i det, du ser nu.'); return;
      }
      if (reply.scene?.mode === 'fractions') { setN(reply.scene.n); setD(reply.scene.d); setView(reply.scene.view); }
      if (reply.scene?.mode === 'functions') { setA(reply.scene.a); setX(reply.scene.x); }
      say(reply.message + (reply.scene ? '\n\nFiguren er opdateret af AI-guiden.' : ''));
    } catch (error) {
      if (!controller.signal.aborted) setAiError(error instanceof Error ? error.message : 'AI-forbindelsen fejlede.');
    } finally {
      if (pending.current === controller) { pending.current = null; setAiBusy(false); }
    }
  }
  const junior = mode === 'fractions';
  const tasks = junior ? [
    { question: 'Hvor mange procent er 3 ud af 4 lige store dele?', expected: 75, hint: 'Find først én del: 100 ÷ 4. Gang derefter med 3.' },
    { question: 'Hvor mange procent er 2 ud af 5 lige store dele?', expected: 40, hint: 'Én femtedel er 100 ÷ 5 procent. Du skal bruge to.' },
    { question: 'Hvor mange procent er 7 ud af 10 lige store dele?', expected: 70, hint: 'Én tiendedel er 10 %. Hvor meget er syv?' },
  ] : [
    { question: 'For f(x) = x²: Hvad er tangentens hældning ved x = 2?', expected: 4, hint: 'Den afledte er f′(x) = 2x. Sæt x = 2 ind.' },
    { question: 'For f(x) = 0,5x²: Hvad er hældningen ved x = −2?', expected: -2, hint: 'Her er f′(x) = x. Sæt x = −2 ind.' },
    { question: 'For f(x) = 2x²: Hvad er hældningen ved x = 0?', expected: 0, hint: 'I toppunktet ligger tangenten vandret.' },
  ];
  const task = tasks[exercise % tasks.length]!;
  const say = (text: string) => setMessages(old => [...old.slice(-7), { role: 'guide', text }]);
  function selectMode(next: Mode) {
    cancelAi(); setMode(next); setStep(0); setExercise(0); setAnswer(''); setFeedback(''); setInput('');
    setMessages([{ role: 'guide', text: introductions[next] }]);
  }
  function explain() {
    if (aiEnabled) { void askGuide('Forklar det, jeg ser i figuren.'); return; }
    say(junior
      ? `Vi har ${n} af ${d} lige store dele. Hele bjælken er 100 %. Én del er 100 ÷ ${d} ≈ ${format(100/d)} %. Derfor er ${n}/${d} ≈ ${format(percent(n,d))} %. ${n === d ? 'Alle dele er valgt: en hel!' : 'Skift antallet af valgte dele og sammenlign.'}`
      : `Her er f(x) = ${format(a)}x², så f′(x) = ${format(2*a)}x. Ved x = ${format(x)} er hældningen ${format(slope(a,x))}. ${Math.abs(x)<0.01 ? 'Tangenten er vandret i toppunktet.' : slope(a,x)>0 ? 'Den positive hældning betyder, at grafen stiger her.' : 'Den negative hældning betyder, at grafen falder her.'}`);
  }
  function submit(event: React.FormEvent) {
    event.preventDefault(); if (!input.trim()) return;
    const value = input.trim(); setInput('');
    if (aiEnabled) { void askGuide(value); return; }
    setMessages(old => [...old.slice(-7), { role: 'student', text: value }]);
    say('AI er slået fra. Du kan fortsat undersøge figuren og bruge de faste forklaringer.');
  }

  function check(event: React.FormEvent) {
    event.preventDefault(); const value = parseAnswer(answer);
    setFeedback(value === null ? 'Skriv et tal. Du må gerne bruge decimalkomma.' : Math.abs(value-task.expected)<0.001 ? 'Rigtigt! Prøv den næste opgave.' : 'Ikke helt endnu. ' + task.hint);
  }
  const steps = junior ? ['Se delene', 'Find procenten', 'Prøv selv'] : ['Undersøg grafen', 'Forstå hældningen', 'Prøv selv'];
  return <div className="app-shell">
    <header className="topbar flex items-center justify-between gap-4">
      <a href="/" className="brand flex items-center gap-3"><span className="brand-symbol">m<span>·</span></span><span>matematik<span className="brand-light">værkstedet</span></span></a>
      <span className="prototype-label">ET STED AT FORSTÅ</span><a className="status" href="/matematik-a">Matematik A · STX</a><a className="status" href="/fp9">FP9-træning</a><span className="status"><i/> Lokal prototype</span>
    </header>
    <div className="workspace">
      <aside className="sidebar">
        <span className="eyebrow">DIT VÆRKSTED</span><h2>Hvad vil du<br/>blive klogere på?</h2>
        <div className="grade-switch" role="group" aria-label="Vælg klassetrin">
          <button aria-pressed={junior} onClick={()=>selectMode('fractions')}>6. klasse</button><button aria-pressed={!junior} onClick={()=>selectMode('functions')}>2.g</button>
        </div>
        <span className="eyebrow mt-9 block">EMNE</span>
        {loadError ? <p role="alert">Emnerne kunne ikke hentes. Genindlæs siden.</p> : catalog.length === 0 ? <div className="skeleton">Henter emner…</div> : catalog.filter(l=>l.id===mode).map(l=><button key={l.id} className="topic" onClick={()=>selectMode(l.id)}><span className="topic-icon">{junior ? '¾' : 'ƒ'}</span><span><strong>{l.title}</strong><small>{l.grade} · Undersøg & forstå</small></span><span>›</span></button>)}
        <div className="learning-path"><span className="eyebrow">I DIT TEMPO</span>{steps.map((label,i)=><button key={label} aria-current={step===i?'step':undefined} onClick={()=>setStep(i)}><span>{i+1}</span>{label}</button>)}</div>
        <div className="sidebar-note"><span className="note-symbol">↗</span><p>Matematik giver mening,<br/>når du kan se det.</p><small>Flyt. Prøv. Opdag.</small></div>
      </aside>
      <main className="main-panel min-w-0">
        <div className="lesson-meta flex items-center justify-between"><span>{junior?'TAL & SAMMENHÆNGE':'FUNKTIONER & FORANDRING'}</span><span>{junior?'6. KLASSE':'2.G'} <span className="dot-separator">/</span> {step+1} AF 3</span></div>
        <h1>{junior ? 'En del af det hele.' : 'Hvad sker der lige her?'}</h1>
        <p className="intro">{junior ? 'Fra brøk til procent. Se sammenhængen med dine egne øjne.' : 'Flyt et punkt. Se tangenten. Find grafens hældning.'}</p>
        <section className="canvas-card" aria-label={junior?'Interaktiv brøkvisualisering':'Interaktiv funktionsgraf'}>
          <div className="canvas-toolbar flex items-center justify-between gap-3"><span className="canvas-label"><i/> {junior?'BRØKVÆRKSTEDET':'FUNKTIONSLABORATORIET'}</span>{junior ? <div className="view-toggle"><button aria-pressed={view==='bar'} onClick={()=>setView('bar')}>Dele</button><button aria-pressed={view==='line'} onClick={()=>setView('line')}>Tallinje</button></div> : <span className="formula-small">f(x) = {format(a)}x²</span>}</div>
          {junior ? <div className="fraction-scene">
            <div className="fraction-equation"><span className="fraction"><span>{n}</span><span>{d}</span></span><span className="equals">{Number.isInteger(percent(n,d))?'=':'≈'}</span><span className="percentage">{format(percent(n,d))}<small>%</small></span></div>
            {view==='bar' ? <div className="fraction-bar" style={{gridTemplateColumns:`repeat(${d}, minmax(0,1fr))`}}>{Array.from({length:d},(_,i)=><button key={i} aria-label={`Vælg ${i+1} af ${d} dele`} aria-pressed={i<n} onClick={()=>setN(i+1===n?n-1:i+1)}><span>{i<n?'1':''}</span><small>{i<n?`/${d}`:''}</small></button>)}</div> : <div className="number-line"><div className="number-track"/>{Array.from({length:d+1},(_,i)=><button key={i} style={{left:`${100*i/d}%`}} className={i===n?'chosen':''} aria-label={`Vælg ${i} af ${d} på tallinjen`} onClick={()=>setN(i)}><i/><span>{i===0?'0':i===d?'1':`${i}/${d}`}</span></button>)}</div>}
            <div className="whole-bracket"><span/>én hel = 100 %<span/></div>
            <p className="scene-caption">{n} af {d} lige store dele er valgt.<br/><span>{view==='bar'?'Klik på et felt for at vælge flere eller færre.':'Klik på et punkt på tallinjen.'}</span></p>
          </div> : <div className="graph-scene"><Mafs height={340} viewBox={{x:[-3.5,3.5],y:[-2,7]}} pan={false} zoom={false}>
            <Coordinates.Cartesian/><Plot.OfX y={v=>curve(a,v)} color="#34765b" weight={3}/><Plot.OfX y={v=>tangent(a,x,v)} color="#8e7654" style="dashed" weight={2}/>
            <Line.Segment point1={[x,0]} point2={[x,curve(a,x)]} color="#a8b1a7" style="dashed"/>
            <MovablePoint point={[x,curve(a,x)]} onMove={p=>setX(Math.round(p[0]*100)/100)} constrain={p=>{const q=Math.max(-1.8,Math.min(1.8,p[0]));return [q,curve(a,q)];}} color="#34765b"/>
          </Mafs><div className="graph-legend"><span><i/>f(x)</span><span><i/>tangent</span><span>Træk i det grønne punkt</span></div></div>}
          <div className="controls-grid">
            {junior ? <><Slider label="Lige store dele" value={d} min={2} max={12} onChange={v=>{setD(v);setN(Math.min(n,v));}}/><Slider label="Valgte dele" value={n} min={0} max={d} onChange={setN}/></> : <><Slider label="Form på parablen · a" value={a} min={0.25} max={2} step={0.25} onChange={setA}/><Slider label="Punktets position · x" value={x} min={-1.8} max={1.8} step={0.1} onChange={setX}/></>}
          </div>
        </section>
        <div className="insight-row"><span className="insight-icon">{junior?'=':'↗'}</span><div><strong>{junior ? `${n}/${d} ${Number.isInteger(percent(n,d))?'=':'≈'} ${format(percent(n,d))} %` : `Hældning: f′(${format(x)}) = ${format(slope(a,x))}`}</strong><p>{junior?'Samme mængde. To måder at skrive den på.':`Punktet ligger i (${format(x)}; ${format(curve(a,x))}). ${x===0?'Her er tangenten vandret.':x>0?'Grafen stiger her.':'Grafen falder her.'}`}</p></div><button onClick={explain}>Forklar det <span>↗</span></button></div>
        {step===0 && <div className="step-footer"><p>Begynd med at ændre {junior?'antallet af dele.':'punktets position.'}</p><button className="primary" onClick={()=>{setStep(1);}}>Se sammenhængen <span>→</span></button></div>}
        {step===1 && <section className="explanation"><span className="eyebrow">SAMMENHÆNGEN</span><h3>{junior?'Brøk × 100 = procent':'Den afledte fortæller om hældningen'}</h3><p>{junior?`Del først ${n} med ${d}, og gang med 100. Så får du cirka ${format(percent(n,d))} %. Bjælken har samme størrelse, uanset hvor mange dele du deler den i.`:`For f(x) = ax² er f′(x) = 2ax. Hældningen er negativ til venstre for toppunktet og positiv til højre. Prøv x = 0 og se, hvad der sker.`}</p><button className="primary" onClick={()=>setStep(2)}>Prøv en opgave <span>→</span></button></section>}
        {step===2 && <section className="exercise"><span className="eyebrow">DIN TUR · OPGAVE {exercise+1}</span><h3>{task.question}</h3><p>Opgaven har sine egne tal. Du kan bruge figuren ovenfor som hjælp.</p><form onSubmit={check}><label htmlFor="answer">Dit svar{junior?' i procent':''}</label><div className="answer-row"><input id="answer" inputMode="decimal" value={answer} onChange={e=>{setAnswer(e.target.value);setFeedback('');}} placeholder={junior?'Fx 25':'Fx −2'}/><button className="primary">Tjek svar</button></div></form><p className="feedback" role="status">{feedback}</p><button className="text-button" onClick={()=>{setExercise(v=>(v+1)%3);setAnswer('');setFeedback('');}}>Næste opgave →</button></section>}
      </main>
      <aside className="guide-panel"><div className="guide-heading"><span className="guide-avatar">m.</span><div><h2>Din matematikguide</h2><small>Vi tager det ét skridt ad gangen</small></div></div><div className="demo-notice"><label><input type="checkbox" checked={aiEnabled} onChange={e=>{cancelAi();setAiEnabled(e.target.checked);}}/> AI som støttehjul</label><small>{aiEnabled ? aiStatus.detail : 'AI fra · faste forklaringer'}</small></div><div ref={messagePanel} className="messages" aria-live="polite">{messages.map((m,i)=><div className={`message ${m.role}`} key={i}><span>{m.role==='guide'?'GUIDEN':'DIG'}</span><p>{m.text}</p></div>)}{aiBusy && <p role="status">Guiden tænker… <button className="text-button" onClick={cancelAi}>Stop</button></p>}{aiError && <p role="alert" className="ai-error">{aiError}</p>}</div><div className="guide-bottom"><span className="eyebrow">PRØV AT SPØRGE</span><button className="suggestion" disabled={aiEnabled && (aiBusy || !aiStatus.available)} onClick={explain}>Forklar det, jeg ser <span>↗</span></button><button className="suggestion" disabled={aiEnabled && (aiBusy || !aiStatus.available)} onClick={()=>{if(aiEnabled) void askGuide('Giv et lille hint til denne opgave uden facit: ' + task.question); else {setStep(2);say(task.hint);}}}>Giv mig et hint <span>↗</span></button><form className="chat-form" onSubmit={submit}><label htmlFor="question" className="sr-only">Spørg matematikguiden</label><input id="question" maxLength={2000} value={input} onChange={e=>setInput(e.target.value)} placeholder="Spørg til figuren…"/><button aria-label="Send spørgsmål" disabled={!input.trim() || aiBusy || (aiEnabled && !aiStatus.available)}>↑</button></form><small>{aiEnabled ? 'Spørgsmål og figur sendes til Codex via dit abonnement.' : 'Ingen AI-kald. Figurerne virker stadig.'}</small></div></aside>
    </div><footer className="page-footer"><span>MATEMATIKVÆRKSTEDET</span><span>En lille prototype til store aha-oplevelser.</span></footer>
  </div>;
}
function Slider({label,value,min,max,step=1,onChange}:{label:string;value:number;min:number;max:number;step?:number;onChange:(value:number)=>void}) {
  return <label className="slider"><span>{label}<output>{format(value)}</output></span><input aria-label={label} type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.target.value))}/><span className="range-labels"><small>{format(min)}</small><small>{format(max)}</small></span></label>;
}
createRoot(document.getElementById('root')!).render(window.location.pathname.startsWith('/fp9') ? <FP9App/> : window.location.pathname.startsWith('/matematik-a/opgaver') ? <MatematikAApp/> : window.location.pathname.startsWith('/matematik-a') ? <LearningApp/> : <App/>);
