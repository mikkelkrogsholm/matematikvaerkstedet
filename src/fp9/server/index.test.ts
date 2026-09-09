import {afterEach,expect,test} from 'bun:test';
import {mkdtemp,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {Fp9Service,LocalAttemptStore,createFp9Api,type Fp9Provider,type Fp9Prompt} from './index';
import {allParts,type AttemptView} from '../api-types';
import type {SceneOperation} from '../scene';
const directories:string[]=[];
afterEach(async()=>{for(const p of directories.splice(0))await rm(p,{recursive:true,force:true});});
async function service(provider:Fp9Provider|null=null){const dir=await mkdtemp(join(tmpdir(),'fp9-test-'));directories.push(dir);return new Fp9Service(new LocalAttemptStore(dir),provider);}
const base={examType:'without-aids' as const,aiEnabled:false,length:'short' as const,seed:161,timingMinutes:null,feedback:'after-submit' as const};
const result=(operations:SceneOperation[]=[])=>({text:'Se mit eksempel.',operations,inputTokens:100,outputTokens:25,elapsedMs:10});
const point:SceneOperation={type:'addObject',object:{id:'ai-example',kind:'point',source:'ai',visible:true,text:'AI',x:1,y:1}};
const question=(v:AttemptView,level:'question'|'hint'|'step'|'solution'='question')=>({expectedRevision:v.revision,taskId:v.activeTaskId,level,question:'Hjælp med det, jeg ser.'});

test('all four independent modes complete, generate offline and lock submitted state',async()=>{
 for(const examType of ['without-aids','with-aids'] as const)for(const aiEnabled of [false,true]){
  let calls=0;const s=await service({reply:async()=>{calls++;return result();}});let v=await s.create({...base,examType,aiEnabled});
  const task=allParts(v)[0]!,id=task.id;
  v=await s.action(v.id,{type:'answer',expectedRevision:v.revision,taskId:id,questionId:'q1',answer:{text:'12'}});
  v=await s.action(v.id,{type:'submit',expectedRevision:v.revision});
  expect(calls).toBe(0);expect(v.status).toBe('submitted');expect(v.assessments[id]?.q1).toBeDefined();
  for(const action of [{type:'answer',taskId:id,questionId:'q1',answer:{text:'99'}},{type:'ai',enabled:false},{type:'extra',seconds:300},{type:'note',taskId:id,text:'rewrite'},{type:'student',taskId:id,objects:[],selection:[]}]){
   await expect(s.action(v.id,{...action,expectedRevision:v.revision} as never)).rejects.toThrow('afleveret');
  }
  expect((await s.load(v.id)).answers[id]?.q1?.text).toBe('12');
 }
});
test('full blueprint has 20 groups / 50 parts and round-trips with no marking',async()=>{
 const s=await service();for(const examType of ['without-aids','with-aids'] as const){const v=await s.create({...base,examType,length:'full'});
 expect(v.groups.length).toBe(examType==='without-aids'?20:7);expect(allParts(v).length).toBe(examType==='without-aids'?50:21);
 expect(allParts(v).reduce((n,t)=>n+t.questions.length,0)).toBe(examType==='without-aids'?50:21);
 const out=await s.export(v.id);expect(JSON.stringify(out)).not.toContain('"marking"');const restored=await s.import(out);
 expect(restored.groups).toEqual(v.groups);expect(restored.id).not.toBe(v.id);expect(restored.profile.aiEnabled).toBe(false);
 }
});
test('AI-off gates calls, pending changes are confirmed or rolled back and assistance persists after off',async()=>{
 let calls=0;const s=await service({reply:async()=>{calls++;return result([point]);}});let v=await s.create(base);
 await expect(s.help(v.id,question(v,'step'))).rejects.toThrow('AI er slået fra');expect(calls).toBe(0);
 v=await s.action(v.id,{type:'ai',expectedRevision:v.revision,enabled:true});v=await s.help(v.id,question(v,'step'));
 expect(v.chat[v.activeTaskId]?.filter(m=>m.role==='guide')).toHaveLength(0);expect(v.assistance).toHaveLength(0);
 const pending=v.scenes[v.activeTaskId]!.pendingRender!;
 v=await s.ack(v.id,{taskId:v.activeTaskId,token:pending.token,revision:pending.revision,success:false});
 expect(v.scenes[v.activeTaskId]!.explanationObjects).toHaveLength(0);expect(v.assistance).toHaveLength(0);
 v=await s.help(v.id,question(v,'step'));const p=v.scenes[v.activeTaskId]!.pendingRender!;
 v=await s.ack(v.id,{taskId:v.activeTaskId,token:p.token,revision:p.revision,success:true});expect(v.assistance).toHaveLength(1);
 v=await s.action(v.id,{type:'ai',expectedRevision:v.revision,enabled:false});expect(v.assistance).toHaveLength(1);expect((await s.list())[0]!.assisted).toBe(true);
});
test('submission and accepted student edits invalidate pending render text',async()=>{
 const s=await service({reply:async()=>result([point])});for(const submit of [false,true]){let v=await s.create({...base,aiEnabled:true});v=await s.help(v.id,question(v,'step'));
 const p=v.scenes[v.activeTaskId]!.pendingRender!;
 v=await s.action(v.id,submit?{type:'submit',expectedRevision:v.revision}:{type:'note',taskId:v.activeTaskId,text:'Min note',expectedRevision:v.revision});
 await expect(s.ack(v.id,{taskId:v.activeTaskId,token:p.token,revision:p.revision,success:true})).rejects.toThrow();
 expect(v.scenes[v.activeTaskId]!.explanationObjects).toHaveLength(0);expect(v.chat[v.activeTaskId]?.some(m=>m.text==='Se mit eksempel.')).toBe(false);
 }
});
test('cancelled calls consume call budget, invalid stale mutations do not cancel current call',async()=>{
 let began!:()=>void;const ready=new Promise<void>(r=>began=r);let captured:AbortSignal|undefined;
 const s=await service({reply:async(_,signal)=>{captured=signal;began();return new Promise((_,reject)=>signal.addEventListener('abort',()=>reject(Error('aborted'))));}});
 let v=await s.create({...base,aiEnabled:true});const running=s.help(v.id,question(v)).then(()=>null,e=>e as Error);await ready;
 await expect(s.action(v.id,{type:'ai',expectedRevision:999,enabled:false})).rejects.toThrow();expect(captured!.aborted).toBe(false);
 v=await s.action(v.id,{type:'ai',expectedRevision:v.revision,enabled:false});expect((await running)?.message).toContain('annulleret');
 expect((await s.load(v.id)).aiUsage.calls).toBe(1);
});
test('only explicit solution receives marking; hints cannot mutate and feedback withholds solutions',async()=>{
 const seen:Fp9Prompt[]=[];const s=await service({reply:async input=>{seen.push(input);return result();}});let v=await s.create({...base,aiEnabled:true,feedback:'immediate'});
 for(const level of ['question','hint','step','solution'] as const)v=await s.help(v.id,question(v,level));
 expect(seen.slice(0,3).every(p=>p.marking===undefined)).toBe(true);expect(seen[3]!.marking).toBeDefined();expect(seen[0]!.scene).not.toHaveProperty('actionLedger');
 v=await s.action(v.id,{type:'answer',taskId:v.activeTaskId,questionId:'q1',answer:{text:'-99'},expectedRevision:v.revision});
 v=await s.action(v.id,{type:'feedback',taskId:v.activeTaskId,questionId:'q1',expectedRevision:v.revision});
 expect(v.assessments[v.activeTaskId]!.q1!.examples).toEqual([]);expect(v.assessments[v.activeTaskId]!.q1!.criteria).toEqual([]);
});
test('export/import preserves constructions, notes, tools and submitted review; invalid import leaves no orphan',async()=>{
 const s=await service();let v=await s.create({...base,examType:'with-aids',length:'topic',familyId:'F13'}),task=v.activeTaskId;
 v=await s.action(v.id,{type:'student',taskId:task,objects:[{id:'student-one',kind:'point',source:'student',x:1,y:2}],selection:['student-one'],expectedRevision:v.revision});
 expect(v.answers[task]!.q1!.points).toEqual([[1,2]]);
 v=await s.action(v.id,{type:'note',taskId:task,text:'Min egen metode',expectedRevision:v.revision});
 v=await s.action(v.id,{type:'tools',taskId:task,value:{tab:'sheet',expression:'2+2',result:'4',rows:6,cells:{A1:'2',B1:'=A1*3'}},expectedRevision:v.revision});
 v=await s.action(v.id,{type:'pause',expectedRevision:v.revision});v=await s.action(v.id,{type:'extra',seconds:300,expectedRevision:v.revision});
 v=await s.action(v.id,{type:'submit',expectedRevision:v.revision});
 const restored=await s.import(await s.export(v.id));expect(restored.status).toBe('submitted');expect(restored.notes).toEqual(v.notes);expect(restored.tools).toEqual(v.tools);expect(restored.answers).toEqual(v.answers);expect(restored.clock.extraSeconds).toBe(300);expect(restored.scenes[task]!.studentObjects).toEqual(v.scenes[task]!.studentObjects);
 const bad=await s.export(v.id);bad.attempt.answers[task]!.q1={text:'x'.repeat(5000)};
 const count=(await s.list()).length;await expect(s.import(bad)).rejects.toThrow();expect(await s.list()).toHaveLength(count);
});
test('with-aids tools remain after AI off; without-aids refuses tool mutations; timed pause prevents working',async()=>{
 const s=await service();let v=await s.create({...base,timingMinutes:30});
 const tools={tab:'calculator' as const,expression:'2+2',result:'4',cells:{},rows:6};
 await expect(s.action(v.id,{type:'tools',taskId:v.activeTaskId,value:tools,expectedRevision:v.revision})).rejects.toThrow('Hjælpemidler');
 v=await s.action(v.id,{type:'pause',expectedRevision:v.revision});await expect(s.action(v.id,{type:'answer',taskId:v.activeTaskId,questionId:'q1',answer:{text:'4'},expectedRevision:v.revision})).rejects.toThrow('uret');
 v=await s.action(v.id,{type:'resume',expectedRevision:v.revision});expect(v.clock.events.map(e=>e.kind)).toEqual(['resume','pause','resume']);
});
test('API rejects wrong origin, malformed body and unknown ids',async()=>{
 const s=await service(),api=createFp9Api(s);
 expect((await api(new Request('http://127.0.0.1/api/fp9/catalog',{headers:{Origin:'https://example.org'}}))).status).toBe(403);
 expect((await api(new Request('http://127.0.0.1/api/fp9/attempts',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'}))).status).toBe(400);
 await expect(s.store.get('fp9-/../../elsewhere')).rejects.toThrow();
});
