import type {PublicTask} from './domain';
import type {Exploration,GuideAction} from './guide';
const fmt=(n:number)=>Number(n.toFixed(2)).toLocaleString('da-DK');
export function Visual({task,exploration,actions}:{task:PublicTask;exploration:Exploration;actions:GuideAction[]}){
 const active=(id:string)=>actions.some(a=>a.target===id&&a.kind==='highlight');
 const notes=actions.filter(a=>a.kind==='annotate');
 const data=task.scene.values;
 if(task.scene.kind==='data'){
  const grouped=!!task.scene.labels;
  const values=data.map((v,i)=>i===data.length-1?Math.max(0,v+exploration.offset):v);
  const max=Math.max(...data,...values,1)*1.2,w=480,h=260,base=220,step=400/data.length;
  return <div className="ma-visual"><svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={grouped?'Histogram med lige brede intervaller og hyppighed på y-aksen':'Observationsdiagram: nummer på x-aksen, værdi på y-aksen'}>
   {[0,1,2,3,4].map(i=><g key={i}><line x1="45" x2="465" y1={base-i*45} y2={base-i*45} stroke="#dce4df"/><text x="40" y={base-i*45+4} textAnchor="end" fontSize="11">{fmt(max*i/4)}</text></g>)}
   <text x="45" y="16" fontSize="12">{grouped?'Hyppighed':'Observationsværdi'}</text>
   {data.map((v,i)=><g key={i} id={`data-${i}`} data-gym-target={`data-${i}`}><rect x={52+i*step} y={base-v/max*180} width={step-(grouped?0:12)} height={v/max*180} fill={active(`data-${i}`)?'#bf762d':'#31745b'}/><text x={52+i*step+step/2-6} y={base-v/max*180-5} textAnchor="middle" fontSize="12">{fmt(v)}</text><text x={52+i*step+step/2-6} y="241" textAnchor="middle" fontSize="10">{task.scene.labels?.[i]??`nr. ${i+1}`}</text></g>)}
   {exploration.offset!==0&&<rect x={52+(data.length-1)*step} y={base-values.at(-1)!/max*180} width={step-(grouped?0:12)} height={values.at(-1)!/max*180} fill="none" stroke="#b27628" strokeWidth="3" strokeDasharray="5 3"/>}
  </svg><p>{grouped?'Intervallerne er lige brede. Søjlernes højder viser hyppigheder.':'Hver søjle er én observation, ikke en frekvensfordeling.'} Den stiplede kontur er din udforskning; opgavedata er uændrede.</p>{notes.map((a,i)=><p data-gym-action={i} key={i} className="ma-help">{a.text}</p>)}</div>;
 }
 const points=Array.from({length:data.length/2},(_,i)=>({x:data[i*2]!,y:data[i*2+1]!}));
 const circle=task.title==='Cirklens radius', radius=circle?Math.hypot(points[1]!.x-points[0]!.x,points[1]!.y-points[0]!.y):0;
 const xs=points.map(p=>p.x),ys=points.map(p=>p.y);
 const min=Math.floor(Math.min(-2,...xs,...ys,circle?points[0]!.x-radius:0,circle?points[0]!.y-radius:0))-2;
 const max=Math.ceil(Math.max(2,...xs,...ys,circle?points[0]!.x+radius:0,circle?points[0]!.y+radius:0))+2;
 const size=max-min,scale=330/size,X=(n:number)=>40+(n-min)*scale,Y=(n:number)=>360-(n-min)*scale;
 const tick=Math.max(1,Math.ceil(size/10)),ticks=Array.from({length:Math.floor(size/tick)+1},(_,i)=>min+i*tick);
 const labels=circle?['C','P']:points.length===3?['C','B','A']:['A','B'];
 return <div className="ma-visual"><svg viewBox="0 0 420 400" role="img" aria-label="Målfast koordinatfigur med samme skala på begge akser">
  {ticks.map(v=><g key={v}><line x1={X(v)} y1="30" x2={X(v)} y2="360" stroke="#e2e7e3"/><line x1="40" y1={Y(v)} x2="370" y2={Y(v)} stroke="#e2e7e3"/><text x={X(v)} y="380" textAnchor="middle" fontSize="10">{v}</text><text x="32" y={Y(v)+3} textAnchor="end" fontSize="10">{v}</text></g>)}
  <text x="385" y="380">x</text><text x="20" y="20">y</text>
  <g data-gym-target="figure" stroke={active('figure')?'#bf762d':'#31745b'} strokeWidth="2.5" fill="none">
   {circle?<><circle cx={X(points[0]!.x)} cy={Y(points[0]!.y)} r={radius*scale}/><line x1={X(points[0]!.x)} y1={Y(points[0]!.y)} x2={X(points[1]!.x)} y2={Y(points[1]!.y)}/></>:<polyline points={points.map(p=>`${X(p.x)},${Y(p.y)}`).concat(points.length===3?[`${X(points[0]!.x)},${Y(points[0]!.y)}`]:[]).join(' ')} fill={points.length===3?'#31745b15':'none'}/>}
  </g>
  {points.map((p,i)=><g key={i} data-gym-target={`point-${i}`}><circle cx={X(p.x)} cy={Y(p.y)} r="4" fill={active(`point-${i}`)?'#bf762d':'#31745b'}/><text x={X(p.x)+7} y={Y(p.y)-8} fontSize="12">{labels[i]}</text></g>)}
  {exploration.x>=min&&exploration.x<=max&&exploration.y>=min&&exploration.y<=max&&<g data-gym-cursor="true"><circle cx={X(exploration.x)} cy={Y(exploration.y)} r="6" stroke="#b27628" fill="none" strokeWidth="2"/><text x={X(exploration.x)+8} y={Y(exploration.y)+16} fontSize="11">Udforskning</text></g>}
 </svg><p>Samme målestok på x- og y-aksen. Punkter og figur følger opgavens data. Udforskningsmarkør: ({fmt(exploration.x)}; {fmt(exploration.y)}). {Math.min(exploration.x,exploration.y)<min||Math.max(exploration.x,exploration.y)>max?'Markøren er uden for det viste udsnit.':''}</p>{notes.map((a,i)=><p data-gym-action={i} key={i} className="ma-help">{a.text}</p>)}</div>;
}
