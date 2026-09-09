import {describe,test,expect} from 'bun:test';
import {check,lesson,snapshot,validateContext,visibleFocus,type Context} from './model';
import {createLearningApi,validReply} from './server';
const context=(topic:Context['topic']='geometry',stage:Context['stage']=2,seed=1):Context=>({topic,stage,seed,explore:0});
const answer=(first:number,second=0)=>({first:first.toFixed(2).replace('.',','),second:second.toFixed(2),explanation:'Jeg sammenligner ændringerne og fortegnet.',choice:0});
describe('Learning journeys: independent mathematics',()=>{
 test('100 seeds: positive training slopes, varied negative transfer slopes and robust median',()=>{
  const slopes=new Set<number>();
  for(let seed=1;seed<=100;seed++){
   const a=2+seed%4,dx=2*(2+seed%3),dy=2+seed%3;
   expect(check(context('geometry',2,seed),answer((dy+2)/dx)).correct).toBe(true);
   const slope=((a-1)-(a+2+seed%4))/((seed%3)-(-3));slopes.add(slope);
   expect(slope).toBeLessThan(0);
   expect(check(context('geometry',4,seed),answer(slope)).correct).toBe(true);
   expect(check(context('geometry',4,seed),answer(-slope)).text).toContain('fortegnet');
   expect(check(context('statistics',2,seed),answer(a+6,a+2)).correct).toBe(true);
   // Seven data values, duplicates, and a new outlier: sum is 7a+41.
   expect(check(context('statistics',4,seed),answer((7*a+41)/7,a+3)).correct).toBe(true);
   for(const explore of [0,1,10,20]){
    const d=lesson({...context('statistics',1,seed),explore});
    expect(d.changed.reduce((s,n)=>s+n,0)-d.base.reduce((s,n)=>s+n,0)).toBe(explore);
    expect(d.changed[2]).toBe(d.base[2]);
   }
  }
  expect(slopes.size).toBeGreaterThan(5);
 });
 test('targeted feedback catches inversion, coordinates, swapped descriptors and missing input',()=>{
  expect(check(context(),answer(6/5)).text).toContain('vandret ændring divideret');
  expect(check(context(),answer(7)).text).toContain('B’s y-koordinat');
  expect(check(context('statistics'),answer(5,9)).text).toContain('byttet om');
  expect(check(context(),{first:''}).correct).toBe(false);
  expect(check(context('statistics'),answer(8,5)).text).toContain('Medianen passer');
 });
 test('written reasoning is recorded, never falsely certified',()=>{
  expect(check(context('geometry',3),{choice:0,explanation:'kort'}).correct).toBe(false);
  const result=check(context('geometry',3),{choice:0,explanation:'En tilstrækkelig lang, men ikke nødvendigvis korrekt tekst.'});
  expect(result.correct).toBe(true);expect(result.text).toContain('ikke automatisk fagligt godkendt');
 });
 test('AI snapshot always describes displayed stage, not previous slider position',()=>{
  expect(snapshot({...context('geometry',2),explore:-6})).toMatchObject({B:[4,7],verticalChange:5});
  expect(snapshot({...context('statistics',2),explore:1})).toMatchObject({data:[3,4,5,6,27]});
  expect(visibleFocus(context('statistics',2))).not.toContain('mean');
  expect(()=>validateContext({...context(),explore:20})).toThrow();
  expect(()=>validateContext({...context('statistics'),explore:-1})).toThrow();
  expect(()=>validReply({text:'x',focus:'rise',explore:null},context('geometry',0))).toThrow();
 });
});
const req=(body:object,path='help')=>new Request('http://127.0.0.1:4319/api/learning/'+path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
describe('Learning guide boundary',()=>{
 test('independent final task and AI off make zero provider calls',async()=>{
  let calls=0;const api=createLearningApi(async()=>{calls++;return {output:{text:'Hint',focus:'none',explore:null}};});
  expect((await api(req({context:context('geometry',4),aiEnabled:true}))).status).toBe(403);
  expect((await api(req({context:context(),aiEnabled:false}))).status).toBe(403);
  expect(calls).toBe(0);
  expect((await createLearningApi(null)(req({context:context(),aiEnabled:true}))).status).toBe(403);
 });
 test('real context, history and bounded actions travel through provider contract',async()=>{
  let sent='';const api=createLearningApi(async(p)=>{sent=p;return {output:{text:'Se på den lodrette ændring.',focus:'rise',explore:2}};});
  const r=await api(req({context:{...context('geometry',1),explore:-2},aiEnabled:true,revision:7,question:'Hvorfor?',history:[{role:'student',text:'Min tidligere idé'}],answer:{first:'12'}}));
  expect(r.status).toBe(200);expect(await r.json()).toMatchObject({revision:7,explore:2,focus:'rise'});
  expect(sent).toContain('Min tidligere idé');expect(sent).toContain('"B":[4,3]');expect(sent).toContain('"first":"12"');
 });
 test('invalid invisible or out-of-stage action is rejected',async()=>{
  for(const output of [{text:'x',focus:'mean',explore:null},{text:'x',focus:'none',explore:2}]){
   const api=createLearningApi(async()=>({output}));
   expect((await api(req({context:context('statistics',2),aiEnabled:true,revision:0,question:'hint'}))).status).toBe(400);
  }
 });
 test('cross-origin request is rejected and cancellation propagates',async()=>{
  const api=createLearningApi(async(_p,signal)=>{expect(signal.aborted).toBe(true);return {output:{text:'x',focus:'none',explore:null}};});
  const r=req({context:context(),aiEnabled:true,revision:0,question:'hint'});r.headers.set('origin','https://untrusted.example');expect((await api(r)).status).toBe(403);
  const controller=new AbortController();controller.abort();
  const cancelled=new Request(req({context:context(),aiEnabled:true,revision:0,question:'hint'}),{signal:controller.signal});
  expect((await api(cancelled)).status).toBe(400);
 });
});
