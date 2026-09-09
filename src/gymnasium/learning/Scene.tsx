import {average,fmt,lesson,median,type Context} from './model';
export function Scene({context,focus,onExplore}:{context:Context;focus:string;onExplore:(n:number)=>void}){
 const c=context,d=lesson(c),interactive=c.stage===1,transfer=c.stage>=4;
 if(c.topic==='geometry'){
  const a=transfer?{x:d.transferGeometry.x1,y:d.transferGeometry.y1}:{x:d.x,y:d.y};
  const change=c.stage===0?0:interactive?c.explore:2;
  const b=transfer?{x:d.transferGeometry.x2,y:d.transferGeometry.y2}:{x:d.x+d.dx,y:d.y+d.dy+change};
  const X=(x:number)=>50+(x+6)*15,Y=(y:number)=>350-(y+6)*15;
  // Equal pixels per unit preserve geometric proportions.
  const ticks=[-4,-2,0,2,4,6,8,10,12];
  return <div className="learn-figure"><svg viewBox="0 0 540 400" role="img" aria-label={`Linje fra ${transfer?'P':'A'}(${a.x};${a.y}) til ${transfer?'Q':'B'}(${b.x};${b.y}). Hældning beskriver y-ændring pr. x-enhed.`}>
   {ticks.map(t=><g key={t}><line x1={X(t)} x2={X(t)} y1="20" y2="355" className="learn-grid"/><text x={X(t)} y="380" textAnchor="middle">{t}</text></g>)}
   {[-6,-3,0,3,6,9,12,15].map(t=><g key={t}><line x1="50" x2="490" y1={Y(t)} y2={Y(t)} className="learn-grid"/><text x="35" y={Y(t)+4} textAnchor="end">{t}</text></g>)}
   <text x="510" y="380">x</text><text x="30" y="16">y</text>
   {interactive&&<line x1={X(a.x)} y1={Y(a.y)} x2={X(b.x)} y2={Y(d.y+d.dy)} stroke="#aab9bb" strokeWidth="2" strokeDasharray="6 5"/>}
   <line x1={X(a.x)} y1={Y(a.y)} x2={X(b.x)} y2={Y(b.y)} stroke="#176960" strokeWidth="4"/>
   {!transfer&&c.stage>0&&<><g data-focus="run" className={focus==='run'?'learn-highlight':''}><line x1={X(a.x)} y1={Y(a.y)} x2={X(b.x)} y2={Y(a.y)} stroke="#437fa3" strokeWidth="3" strokeDasharray="5 4"/><text x={(X(a.x)+X(b.x))/2} y={Math.max(Y(a.y),Y(b.y))+32} textAnchor="middle">Δx = {b.x-a.x}</text></g><g data-focus="rise" className={focus==='rise'?'learn-highlight':''}><line x1={X(b.x)} y1={Y(a.y)} x2={X(b.x)} y2={Y(b.y)} stroke="#b76b31" strokeWidth="3" strokeDasharray="5 4"/><text x={X(b.x)+32} y={(Y(a.y)+Y(b.y))/2}>Δy = {b.y-a.y}</text></g></>}
   {[a,b].map((p,i)=><g key={i}><circle cx={X(p.x)} cy={Y(p.y)} r="7" fill={i?'#b76b31':'#176960'}/><text x={X(p.x)-12} y={Y(p.y)+(i&&b.y<=a.y?22:-14)}>{(transfer?['P','Q']:['A','B'])[i]}</text></g>)}
  </svg><p className="learn-scene-data">{transfer?'P':'A'} = ({a.x}; {a.y}) · {transfer?'Q':'B'} = ({b.x}; {b.y})</p>{interactive&&<div className="learn-controls"><label>Flyt B lodret <output>{change>0?'+':''}{change} fra start</output><input aria-label="Flyt B lodret" type="range" min="-6" max="8" step="1" value={c.explore} onChange={e=>onExplore(Number(e.target.value))}/></label><p>Hældning nu: <b>{b.y-a.y} / {b.x-a.x} = {fmt((b.y-a.y)/(b.x-a.x))}</b></p><button onClick={()=>onExplore(2)}>Sammenlign med B flyttet 2 op</button></div>}<figcaption>{interactive?'Grå stiplet linje er udgangspunktet. Orange B er din ændring.':'Punkternes koordinater er opgavens givne data.'} Begge akser har samme målestok. Hældningen beregnes med koordinaterne.</figcaption></div>;
 }
 const data=transfer?d.transfer:c.stage===0?d.base:interactive?d.changed:d.fixed;
 const max=d.base.at(-1)!+25,X=(n:number)=>45+n/max*440;
 const mean=average(data),med=median(data),showMeasures=interactive||c.stage===3||c.stage===5;
 return <div className="learn-figure"><svg viewBox="0 0 540 260" role="img" aria-label={`Ventetider i minutter: ${data.join(', ')}. ${showMeasures?`Gennemsnit ${fmt(mean)}, median ${fmt(med)}.`:''}`}>
  <line x1="45" x2="500" y1="190" y2="190" stroke="#94a5a4"/>
  {[0,5,10,15,20,25,30].filter(v=>v<=max).map(v=><g key={v}><line x1={X(v)} x2={X(v)} y1="35" y2="195" className="learn-grid"/><text x={X(v)} y="215" textAnchor="middle">{v}</text></g>)}<text x="480" y="245">minutter</text>
  <g data-focus="data" className={focus==='data'?'learn-highlight':''}>{data.map((v,i)=><g key={i}><circle cx={X(v)} cy={165-data.slice(0,i).filter(n=>n===v).length*23} r="5.5" fill={i===data.length-1?'#b76b31':'#176960'}/></g>)}</g>
  {showMeasures&&<><g data-focus="mean" className={focus==='mean'?'learn-highlight':''}><line x1={X(mean)} x2={X(mean)} y1="55" y2="195" stroke="#437fa3" strokeWidth="3"/><text x={X(mean)} y="38" textAnchor="middle">Gennemsnit {fmt(mean)}</text></g><g data-focus="median" className={focus==='median'?'learn-highlight':''}><line x1={X(med)} x2={X(med)} y1="82" y2="195" stroke="#99577c" strokeWidth="3" strokeDasharray="6 4"/><text x={X(med)} y="72" textAnchor="middle">Median {fmt(med)}</text></g></>}
 </svg><p className="learn-scene-data">Ventetider: {data.join('; ')} minutter.{showMeasures&&<><br/>Gennemsnit: {fmt(mean)} · Median: {fmt(med)}</>}</p>{interactive&&<div className="learn-controls"><label>Forlæng kun den sidste ventetid <output>+{Math.max(0,c.explore)} minutter</output><input aria-label="Forlæng sidste ventetid" type="range" min="0" max="20" value={Math.max(0,c.explore)} onChange={e=>onExplore(Number(e.target.value))}/></label><button onClick={()=>onExplore(20)}>Sammenlign med 20 minutter ekstra</button></div>}<figcaption>Hver prik er én observation. Den orange prik er den sidste ventetid. {interactive?'Antallet af observationer er uændret.':''}</figcaption></div>;
}
