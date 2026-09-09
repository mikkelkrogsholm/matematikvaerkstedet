import {expect,test} from 'bun:test';
import {assess,families,generateTask,publicTask,type Task} from './index';
import {parseNumberAnswer} from './number-answer';
const numbers=(text:string)=>[...text.matchAll(/-?\d+(?:[,.]\d+)?/g)].map(m=>Number(m[0].replace(',','.')));
const close=(actual:number|undefined,expected:number)=>{expect(actual).toBeDefined();expect(Math.abs(actual!-expected)).toBeLessThan(1e-7);};
// These checks reconstruct results from the public wording/data, never from generator parameters or its marking solver.
test('100 seeds per family/variant/type satisfy independent public-data mathematics',()=>{
 for(const family of families)for(const examType of ['with-aids','without-aids'] as const)for(let v=0;v<3;v++)for(let seed=0;seed<100;seed++){
  const t=generateTask(family.id,seed,v,examType),m=t.marking.q1!,p=t.questions[0]!.prompt,q=numbers(p);
  const lines=t.facts??(t.scene.kind==='text'?t.scene.givens.lines:[]),g=lines.map(numbers),flat=g.flat();
  expect(t.allowedExamTypes).toContain(examType);expect(t.questions).toHaveLength(1);
  expect(JSON.stringify(publicTask(t))).not.toContain('"marking"');
  if(m.kind==='review'){expect(m.examples.length).toBeGreaterThanOrEqual(2);expect(m.criteria.length).toBeGreaterThanOrEqual(2);expect(assess(t,'q1',{text:'En begrundelse'}).status).toBe('needs-review');}
  switch(family.id){
   case 'F01': close(m.expected,v===0?q[0]!/q[1]!:v===1?q[0]!/q[1]!+q[2]!/q[3]!:q[0]!*q[1]!/q[2]!);break;
   case 'F02': close(m.expected,v===0?flat[0]!*flat[1]!/100:v===1?flat[0]!/(1-flat[1]!/100):q[0]!*flat[1]!/flat[0]!);break;
   case 'F03': if(v===0)close(m.expected,flat[0]!**2);if(v===1){expect(m.expected!**2).toBeLessThan(flat[0]!);expect((m.expected!+1)**2).toBeGreaterThan(flat[0]!);}if(v===2)close(m.expected,flat[0]!);break;
   case 'F04': close(m.expected,v===0?(g[0]![2]!-g[0]![1]!)/g[0]![0]!:v===1?Math.floor(g[0]![1]!/g[0]![0]!)+1:g[1]![1]!-g[0]![0]!);break;
   case 'F05': if(v<2){const a=g[0]![0]!,b=g[0]![1]!;const valid=v===0?`${a}x+${a*b}`:`x+${b/a}`;expect(assess(t,'q1',{text:valid}).status).toBe('correct');expect(assess(t,'q1',{text:valid+'+1'}).status).toBe('incorrect');}break;
   case 'F06': if(t.scene.kind!=='price')throw Error();{const {offerA:a,offerB:b}=t.scene.givens;close(m.expected,v===0?a.fixed+a.perUnit*q[0]!:v===1?Math.floor((q[0]!-b.fixed)/b.perUnit):(b.fixed-a.fixed)/(a.perUnit-b.perUnit));}break;
   case 'F07': if(v===0)close(m.expected,g[0]![0]!*(1+g[1]![0]!/100)**g[1]![1]!);if(v===1)close(m.expected,g[0]![2]!/(1+g[0]![1]!/100)**g[0]![0]!);if(v===2){if(t.scene.kind!=='data')throw Error();const values=t.scene.data[0]!.values;expect(values[3]!/values[0]!).toBe(16);expect(values[2]!-values[1]!).not.toBe(values[1]!-values[0]!);}break;
   case 'F08': close(m.expected,v===0?flat[0]!/flat[1]!:v===1?flat[0]!/flat[1]!*60:flat[0]!*(lines[0]!.includes('dm³')?1000:10000));break;
   case 'F09': if(v===0)close(m.expected,180-flat[0]!-flat[1]!);if(v===1)close(m.expected,flat[0]!-flat[1]!);break;
   case 'F10': close(m.expected,v===0?g[0]![0]!*g[1]![1]!/100:v===1?g[0]![0]!*100/g[0]![1]!:g[0]![0]!*g[1]![0]!**2);break;
   case 'F11': close(m.expected,v===0?2*(flat[0]!+flat[1]!):v===1?flat[0]!/flat[1]!:g[0]![0]!*g[0]![1]!*g[0]![2]!);break;
   case 'F12': if(v===0)close(m.expected,Math.hypot(flat[0]!,flat[1]!));if(v===1)close(m.expected,Math.sqrt(flat[0]!**2-flat[1]!**2));if(v===2){const [a,b,c]=flat;expect(a!+b!).toBeGreaterThan(c!);expect(m.examples[0]).toContain(c!**2===a!**2+b!**2?'er retvinklet':'er ikke retvinklet');}break;
   case 'F13': {if(t.scene.kind!=='grid')throw Error();const [a,b]=t.scene.givens.points.map(p=>p.point);if(v===2){const [dx,dy]=numbers(t.scene.givens.instruction);expect(assess(t,'q1',{text:'',points:[[a!.x+dx!,a!.y+dy!]]}).status).toBe('correct');}else{const area=numbers(t.scene.givens.instruction).at(-1)!,height=area/(b!.x-a!.x)*(v===1?2:1);const points:[number,number][]=[[a!.x,a!.y],[b!.x,b!.y],[b!.x,b!.y+height]];if(v===0)points.push([a!.x,a!.y+height]);expect(assess(t,'q1',{text:'',points}).status).toBe('correct');}break;}
   case 'F14': {if(t.scene.kind!=='grid')throw Error();const p=t.scene.givens.points[0]!.point,delta=numbers(t.scene.givens.instruction),target:[number,number]=v===0?[-p.x,p.y]:v===1?[-p.y,p.x]:[p.x+delta[0]!,p.y+delta[1]!];expect(assess(t,'q1',{text:'',points:[target]}).status).toBe('correct');expect(assess(t,'q1',{text:'',points:[[target[0]+1,target[1]]]}).status).toBe('incorrect');break;}
   case 'F15': if(v===0){if(t.scene.kind!=='data')throw Error();close(m.expected,[...t.scene.data[0]!.values].sort((a,b)=>a-b)[2]!);}if(v===1)close(m.expected,4*g[0]![0]!-g[1]!.reduce((a,b)=>a+b,0));if(v===2){if(t.scene.kind!=='data')throw Error();const [a,b]=t.scene.data[0]!.values;close(m.expected,a!/(a!+b!)*100);}break;
   case 'F16': {if(t.scene.kind!=='data')throw Error();const [a,b]=t.scene.data.map(d=>d.values);expect(a).toHaveLength(5);expect(b).toHaveLength(5);if(v===0){expect(a!.reduce((s,x)=>s+x,0)).toBe(b!.reduce((s,x)=>s+x,0));expect(Math.max(...a!)-Math.min(...a!)).toBeGreaterThan(Math.max(...b!)-Math.min(...b!));}else expect(Math.max(...b!)).toBeGreaterThan(Math.max(...a!));break;}
   case 'F17': close(m.expected,v===0?flat[0]!/(flat[0]!+flat[1]!):v===1?1-flat[0]!/flat[1]!:flat[0]!/flat[1]!*flat[2]!);break;
   case 'F18': if(v<2){const [a,b]=g[0]!;close(m.expected,a!/(a!+b!)*(v===0?a!/(a!+b!):(a!-1)/(a!+b!-1)));}break;
  }
  if(m.kind==='numeric'&&!m.fraction&&!m.scientific){expect(assess(t,'q1',{text:String(m.expected),...(m.requiresExplanation?{explanation:'Til gennemgang'}:{})}).status).toBe(m.requiresExplanation?'needs-review':'correct');expect(assess(t,'q1',{text:String(m.expected!+2)}).status).toBe('incorrect');}
 }
});
test('answer forms, optional correct units, wrong units and scientific normalization',()=>{
 const m={kind:'numeric' as const,criteria:[],examples:[],expected:12,unit:'cm²'};
 for(const text of ['12','12 cm²','12 cm^2','24/2'])expect(parseNumberAnswer(text,m)).toBe(12);
 for(const text of ['12 m²','12 cm','1 2','Infinity','1/0','12 cm²junk','12x'])expect(parseNumberAnswer(text,m)).toBeNull();
 expect(parseNumberAnswer('1,25',{...m,unit:undefined})).toBe(1.25);
 expect(parseNumberAnswer('2/4',{...m,fraction:true,unit:undefined})).toBe(.5);
 expect(parseNumberAnswer('0,5',{...m,fraction:true,unit:undefined})).toBeNull();
 expect(parseNumberAnswer('2/4',{...m,format:'decimal',unit:undefined})).toBeNull();
 expect(parseNumberAnswer('2,5 · 10^4 byte',{...m,unit:'byte',scientific:true})).toBe(25000);
 for(const text of ['25 * 10^3','25000','0.25 * 10^5','2.5 * 10^100'])expect(parseNumberAnswer(text,{...m,unit:undefined,scientific:true})).toBeNull();
 const expanded=generateTask('F05',12,0,'without-aids');const original=expanded.scene.kind==='text'?expanded.scene.givens.lines[0]!.replace('Udtryk: ','').replace(/\.$/,''):'';
 expect(assess(expanded,'q1',{text:original}).status).toBe('incorrect');
});

test('metric figures preserve angles, side ratios and equal axis scales over 100 seeds',()=>{
 for(let seed=0;seed<100;seed++)for(const id of ['F09','F11','F12'] as const)for(const variant of [0,1] as const){
  const task=generateTask(id,seed,variant,'with-aids'),scene=task.scene;if(scene.kind!=='shape')throw Error('Missing figure');
  close(scene.axes.x.max-scene.axes.x.min,scene.axes.y.max-scene.axes.y.min);
  for(const p of scene.givens.points){expect(p.x).toBeGreaterThanOrEqual(scene.axes.x.min);expect(p.y).toBeLessThanOrEqual(scene.axes.y.max);}
  const [a,b,c]=scene.givens.points;
  if(id==='F09'){
   const alpha=Math.atan2(c!.y-a!.y,c!.x-a!.x)*180/Math.PI;
   const given=variant===0?numbers(task.facts![0]!)[0]!:numbers(task.facts![1]!)[0]!;
   close(alpha,given);
  }
  if(id==='F11'){
   const values=numbers(task.facts![0]!);const width=b!.x-a!.x,height=c!.y-b!.y;
   close(variant===0?width:width*height,values[0]!);close(height,values[1]!);
  }
  if(id==='F12'){
   const values=numbers(task.facts![0]!);const width=b!.x-a!.x,height=c!.y-a!.y;
   close(variant===0?width:Math.hypot(width,height),values[0]!);
  }
 }
});
test('equivalent probability fractions are exact, including multiplication roundoff regression',()=>{
 for(let seed=-50;seed<50;seed++){
  const t=generateTask('F18',seed,1,'without-aids'),[a,b]=numbers(t.facts![0]!);
  expect(assess(t,'q1',{text:`${a!*(a!-1)}/${(a!+b!)*(a!+b!-1)}`}).status).toBe('correct');
 }
 const t=generateTask('F17',0,0,'without-aids'),r=t.marking.q1!.rational!;
 expect(assess(t,'q1',{text:`${r.numerator*1000000+1}/${r.denominator*1000000}`}).status).toBe('incorrect');
});
