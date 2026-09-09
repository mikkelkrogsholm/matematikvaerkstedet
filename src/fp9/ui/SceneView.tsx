import {useEffect,useRef,useState,type PointerEvent} from 'react';
import type {PublicTask,Axis} from '../domain';
import type {SceneState,StudentObject,ExplanationObject} from '../scene';

type Props={task:PublicTask;state:SceneState|undefined;withAids:boolean;locked:boolean;onStudent:(objects:StudentObject[],selection:string[])=>void};
export function SceneView({task,state,withAids,locked,onStudent}:Props){
 const [shown,setShown]=useState(true),[draft,setDraft]=useState<readonly StudentObject[]|null>(null);
 const drag=useRef<{id:string;x:number;y:number}|null>(null);
 const students=draft??state?.studentObjects??[], selection=state?.selection??[];
 const scene=task.scene;const viewport=state?.viewport;const x=viewport?{...scene.axes.x,min:viewport.xMin,max:viewport.xMax}:scene.axes.x,y=viewport?{...scene.axes.y,min:viewport.yMin,max:viewport.yMax}:scene.axes.y;
 useEffect(()=>{setDraft(null);},[state?.revision]);
 useEffect(()=>{if(state?.pendingRender)setShown(true);},[state?.pendingRender?.token]);
 const ai=shown?state?.explanationObjects??[]:[];
 const px=(n:number)=>(n-x.min)/(x.max-x.min)*100,py=(n:number)=>100-(n-y.min)/(y.max-y.min)*100;
 const coordinate=(event:PointerEvent<SVGSVGElement>)=>{
   const svg=event.currentTarget,p=svg.createSVGPoint();p.x=event.clientX;p.y=event.clientY;
   const matrix=svg.getScreenCTM();if(!matrix)return [0,0] as const;
   const local=p.matrixTransform(matrix.inverse());
   const round=(n:number)=>scene.kind==='grid'?Math.round(n):Math.round(n*10)/10;
   return [Math.max(x.min,Math.min(x.max,round(x.min+local.x/100*(x.max-x.min)))),Math.max(y.min,Math.min(y.max,round(y.max-local.y/100*(y.max-y.min))))] as const;
 };
 const save=(objects:readonly StudentObject[],selected:readonly string[])=>{if(!locked)onStudent([...objects],[...selected]);};
 const add=(a:number,b:number)=>{if(locked)return;const id=`student-${crypto.randomUUID()}`;save([...students,{id,source:'student',kind:'point',x:a,y:b,visible:true}],[id]);};
 const select=(id:string)=>save(students,[id]);
 const visibleGraph=scene.kind==='grid'||withAids||ai.some(o=>o.visible);
 const ticks=(axis:Axis)=>{const increment=Math.max(axis.step,Math.ceil((axis.max-axis.min)/10/axis.step)*axis.step);return Array.from({length:Math.floor((axis.max-axis.min)/increment)+1},(_,i)=>axis.min+i*increment);};
 const describe=(o:StudentObject)=>`Elevpunkt (${o.x}; ${o.y})`;
 const targets=[...students,...ai];
 function highlight(o:Extract<ExplanationObject,{kind:'highlight'}>){return <g data-ai-object-id={o.id} key={o.id}>{o.targetIds.map(id=>{const target=targets.find(t=>t.id===id);if(!target)return null;return 'x' in target && 'y' in target && typeof target.x==='number'&&typeof target.y==='number'?<circle key={id} cx={px(target.x)} cy={py(target.y)} r="3" fill="none" stroke="#8b4ba4" strokeWidth="1"/>:target.kind==='line'&&'x1' in target?<line key={id} x1={px(Number(target.x1))} y1={py(Number(target.y1))} x2={px(Number(target.x2))} y2={py(Number(target.y2))} stroke="#8b4ba4" strokeWidth="1.5" opacity=".6"/>:null;})}<text x="2" y="-3">{o.text}</text></g>;}
 return <section className="fp9-scene"><h2>Opgavegrundlag og din figur</h2>
 {scene.kind==='price'&&<table><caption>Givne priser — kr. pr. {scene.givens.unit}</caption><thead><tr><th>Tilbud</th><th>Startbetaling</th><th>Pr. besøg</th></tr></thead><tbody>{[['A',scene.givens.offerA],['B',scene.givens.offerB]].map(([label,offer])=>{const v=offer as typeof scene.givens.offerA;return <tr key={String(label)}><th>{String(label)}</th><td>{v.fixed}</td><td>{v.perUnit}</td></tr>;})}</tbody></table>}
 {scene.kind==='data'&&<table><caption>{scene.givens.description} Enhed: {scene.givens.unit}</caption><thead><tr><th>Serie</th>{scene.data[0]?.values.map((_,i)=><th key={i}>{i+1}</th>)}</tr></thead><tbody>{scene.data.map((row,j)=><tr key={row.label}><th>{row.label}</th>{row.values.map((v,i)=><td key={i}><button disabled={locked} onClick={()=>{const id=`student-data-${j}-${i}`;save([...students.filter(o=>o.id!==id),{id,source:'student',kind:'point',x:i+1,y:v,visible:true,text:`${row.label}, måling ${i+1}`}],[id]);}}>{v}</button></td>)}</tr>)}</tbody></table>}
 {scene.kind==='grid'&&<p>{scene.givens.instruction}</p>}
 {visibleGraph?<svg viewBox="-12 -9 126 126" role="img" aria-label={`Arbejdsfigur. ${x.label}${x.unit?' i '+x.unit:''}; ${y.label}${y.unit?' i '+y.unit:''}`} style={{touchAction:locked?'auto':'none'}}
 onPointerDown={e=>{if(locked||(!withAids&&scene.kind!=='grid'))return;const [a,b]=coordinate(e);if(a>=x.min&&a<=x.max&&b>=y.min&&b<=y.max)add(a,b);}}
 onPointerMove={e=>{if(!drag.current)return;const [a,b]=coordinate(e);drag.current={...drag.current,x:a,y:b};setDraft(students.map(o=>o.id===drag.current!.id?{...o,x:a,y:b}:o));}}
 onPointerUp={()=>{if(drag.current){save(students,[drag.current.id]);drag.current=null;}}} onPointerCancel={()=>{drag.current=null;setDraft(null);}}>
 {ticks(x).map(n=><g key={`x${n}`}><line className="grid" x1={px(n)} x2={px(n)} y1="0" y2="100"/><text x={px(n)} y="105" textAnchor="middle">{n.toLocaleString('da-DK',{maximumFractionDigits:2})}</text></g>)}
 {ticks(y).map(n=><g key={`y${n}`}><line className="grid" y1={py(n)} y2={py(n)} x1="0" x2="100"/><text x="-2" y={py(n)+1} textAnchor="end">{n.toLocaleString('da-DK',{maximumFractionDigits:2})}</text></g>)}
 <rect x="0" y="0" width="100" height="100" fill="none" stroke="#89998c" strokeWidth=".25"/>
 {x.min<=0&&x.max>=0&&<line className="axis" x1={px(0)} x2={px(0)} y1="0" y2="100"/>}{y.min<=0&&y.max>=0&&<line className="axis" x1="0" x2="100" y1={py(0)} y2={py(0)}/>}
 <text x="50" y="113" textAnchor="middle">{x.label} {x.unit?`(${x.unit})`:''}</text><text x="0" y="-5">{y.label} {y.unit?`(${y.unit})`:''}</text>
 {scene.kind==='price'&&withAids&&[scene.givens.offerA,scene.givens.offerB].map((offer,i)=><g key={i}><line x1={px(0)} y1={py(offer.fixed)} x2={px(x.max)} y2={py(offer.fixed+offer.perUnit*x.max)} stroke={i?'#b47a35':'#34765b'} strokeWidth=".7" strokeDasharray={i?'2 1':undefined}/><text x={px(x.max)-3} y={py(offer.fixed+offer.perUnit*x.max)-2}>{i?'B':'A'}</text></g>)}
 {scene.kind==='data'&&withAids&&scene.data.flatMap((row,j)=>row.values.map((v,i)=><g key={`${j}-${i}`}><circle cx={px(i+1)} cy={py(v)} r={j?1.8:1} fill={j?'none':'#34765b'} stroke={j?'#b47a35':'#34765b'} strokeWidth=".5"/><title>{row.label}: {v}</title></g>))}
 {scene.kind==='grid'&&scene.givens.points.map(p=><g key={p.id}><circle className="given-point" cx={px(p.point.x)} cy={py(p.point.y)} r="1.1"/><text x={px(p.point.x)+2} y={py(p.point.y)-2}>{p.id}</text></g>)}
 {students.map(o=>typeof o.x==='number'&&typeof o.y==='number'?<g key={o.id}><circle data-student-object-id={o.id} className="student-point" cx={px(o.x)} cy={py(o.y)} r={selection.includes(o.id)?1.8:1.3} role="button" tabIndex={locked?-1:0} aria-label={describe(o)} onKeyDown={e=>{if(locked)return;if(e.key==='Enter'){select(o.id);return;}const dx=e.key==='ArrowLeft'?-1:e.key==='ArrowRight'?1:0,dy=e.key==='ArrowDown'?-1:e.key==='ArrowUp'?1:0;if(dx||dy){e.preventDefault();save(students.map(p=>p.id===o.id?{...p,x:Math.max(x.min,Math.min(x.max,Number(o.x)+dx)),y:Math.max(y.min,Math.min(y.max,Number(o.y)+dy))}:p),[o.id]);}}} onPointerDown={e=>{e.stopPropagation();if(locked)return;drag.current={id:o.id,x:Number(o.x),y:Number(o.y)};e.currentTarget.setPointerCapture(e.pointerId);}}/><text x={px(o.x)+2} y={py(o.y)-2}>{selection.includes(o.id)?'Valgt':''}</text></g>:null)}
 <g className="ai-objects">{ai.filter(o=>o.visible).map(o=>o.kind==='highlight'?highlight(o):o.kind==='line'?<g data-ai-object-id={o.id} key={o.id}><line x1={px(o.x1)} y1={py(o.y1)} x2={px(o.x2)} y2={py(o.y2)}/><text x={px(o.x1)+2} y={py(o.y1)-2}>{o.text}</text></g>:<g data-ai-object-id={o.id} key={o.id}>{o.kind==='point'&&<circle cx={px(o.x)} cy={py(o.y)} r="1.5"/>}<text x={px(o.x)+2} y={py(o.y)-2}>{o.text}</text></g>)}</g>
 </svg>:<p>Her vises de givne oplysninger. Du vælger selv en metode uden automatiske hjælpeværktøjer.</p>}
 {scene.kind==='data'&&withAids&&<p>● {scene.data[0]?.label}　○ {scene.data[1]?.label}</p>}
 {scene.kind==='grid'&&<p>Samme målestok på begge akser. Klik i gitteret eller brug punktfelterne. Valgte punkter kan flyttes med piletaster.</p>}
 <div className="fp9-layer-key"><span>Grundlag</span><span>Dit arbejde</span><span>AI-forklaring</span></div>
 {!!state?.explanationObjects.length&&<label><input type="checkbox" checked={shown} onChange={e=>setShown(e.target.checked)}/> Vis AI-forklaring (særskilt lag)</label>}
 {!locked&&students.length>0&&<div><button onClick={()=>save(students,[])}>Fjern markering</button><button onClick={()=>save(students.filter(o=>!selection.includes(o.id)),[])}>Slet valgte elevpunkter</button></div>}
 </section>;
}
