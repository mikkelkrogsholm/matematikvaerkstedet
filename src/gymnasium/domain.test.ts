import {describe,test,expect} from 'bun:test';
import {makeTask,publicTask,assess,families} from './domain';
import {validateReply,validateExploration} from './guide';

describe('STX pilot independent mathematics',()=>{
 test('100 seeds per structure: geometry and data invariants',()=>{
  for(let seed=0;seed<100;seed++)for(let v=0;v<3;v++)for(const f of families){
   const t=makeTask(f.id,seed,v),d=t.scene.values;
   expect(makeTask(f.id,seed,v)).toEqual(t);
   let expected=0;
   if(f.id==='analytisk')expected=v===0?(d[3]!-d[1]!)/(d[2]!-d[0]!):v===1?-(d[2]!-d[0]!)/(d[3]!-d[1]!):Math.hypot(d[2]!-d[0]!,d[3]!-d[1]!);
   if(f.id==='trekant'){
    if(v===0)expected=Math.hypot(d[4]!-d[0]!,d[5]!-d[1]!);
    if(v===1)expected=Math.abs(d[0]!*(d[3]!-d[5]!)+d[2]!*(d[5]!-d[1]!)+d[4]!*(d[1]!-d[3]!))/2;
    if(v===2)expected=Math.hypot(d[4]!-d[2]!,d[5]!-d[3]!);
   }
   if(f.id==='ugrupperet')expected=v===1?[...d].sort((a,b)=>a-b)[1]!:d.reduce((a,b)=>a+b,0)/d.length;
   if(f.id==='grupperet'){
    const n=d.reduce((a,b)=>a+b,0);expect(n%2).toBe(1);
    if(v===0)expected=100*(d[0]!+d[1]!)/n;
    if(v===1)expected=d.flatMap((count,i)=>Array(count).fill(i*10+5)).reduce((a,b)=>a+b,0)/n;
    if(v===2)expected=d.flatMap((count,i)=>Array(count).fill(i*10))[Math.floor(n/2)];
   }
   expect(t.answer).toBeCloseTo(expected,9);
   expect(assess(t,expected.toFixed(2)).correct).toBe(true);
   expect(publicTask(t)).not.toHaveProperty('answer');
   expect(publicTask(t)).not.toHaveProperty('explanation');
  }
 });
 test('quartile regression, invalid refs and decimal input',()=>{
  const t=makeTask('ugrupperet',1,1);expect(t.answer).toBe(6);
  expect(assess(t,'6,0').correct).toBe(true);expect(assess(t,'6.5').correct).toBe(false);
  expect(assess(t,'').correct).toBe(false);expect(assess(t,'Infinity').correct).toBe(false);
  for(const seed of [-1,NaN,2**40,1.5])expect(()=>makeTask('trekant',seed,0)).toThrow();
  expect(()=>makeTask('bad' as any,1,0)).toThrow();expect(()=>makeTask('trekant',1,3)).toThrow();
  expect(assess(makeTask('trekant',1,0),'4.99').correct).toBe(false);
 });
 test('only bounded scene actions and exploration are accepted',()=>{
  const task=publicTask(makeTask('analytisk',1,0));
  expect(()=>validateReply({text:'Hej',actions:[{kind:'highlight',target:'point-0',text:'',x:0,y:0}]},task)).not.toThrow();
  for(const a of [{kind:'eval',target:'point-0',text:'',x:0,y:0},{kind:'cursor',target:'figure',text:'',x:Infinity,y:0},{kind:'highlight',target:'answer',text:'',x:0,y:0}])expect(()=>validateReply({text:'Hej',actions:[a]},task)).toThrow();
  expect(()=>validateExploration({x:0,y:0,offset:NaN})).toThrow();
 });
});
