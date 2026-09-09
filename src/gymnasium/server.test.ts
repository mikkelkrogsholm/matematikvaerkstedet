import {test,expect} from 'bun:test';
import {createGymnasiumApi,type Provider} from './server';
const ref={family:'ugrupperet',seed:1,variant:1};
const help={ref,revision:2,aiEnabled:true,level:'hint',question:'Hjælp mig',answer:'',exploration:{x:0,y:0,offset:0}};
const req=(path:string,body:unknown)=>new Request('http://localhost:4317/api/gymnasium/'+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
test('authoritative tasks, hidden marking, no calls when off',async()=>{
 let calls=0,prompt='';const provider:Provider=async p=>{calls++;prompt=p;return {output:{text:'Find først medianen i den nederste halvdel.',actions:[]},inputTokens:10,outputTokens:10,elapsedMs:1}};
 const api=createGymnasiumApi(provider);
 const task=await (await api(req('task',{ref}))).json();expect(task.answer).toBeUndefined();expect(task.explanation).toBeUndefined();
 const check=await (await api(req('check',{ref,answer:'6',task:{answer:100}}))).json();expect(check.correct).toBe(true);
 expect((await api(req('help',{...help,aiEnabled:false}))).status).toBe(403);expect(calls).toBe(0);
 const response=await api(req('help',help));expect(response.status).toBe(200);expect(calls).toBe(1);expect(prompt).not.toContain('referenceAnswer');
 expect((await response.json()).revision).toBe(2);
 expect((await api(req('help',{...help,level:'solution'}))).status).toBe(200);expect(prompt).toContain('referenceAnswer');
 expect((await createGymnasiumApi(null)(req('help',help))).status).toBe(403);
});
test('invalid targets, payloads and origins fail closed',async()=>{
 const api=createGymnasiumApi(async()=>({output:{text:'Hej',actions:[{kind:'highlight',target:'secret',text:'',x:0,y:0}]},inputTokens:1,outputTokens:1,elapsedMs:1}));
 expect((await api(req('help',help))).status).toBe(400);
 expect((await api(req('task',{ref:{...ref,seed:-1}}))).status).toBe(400);
 expect((await api(req('help',{...help,exploration:{x:0,y:0,offset:1e9}}))).status).toBe(400);
 const cross=req('task',{ref});cross.headers.set('origin','https://untrusted.example');expect((await api(cross)).status).toBe(403);
});
test('cancellation reaches provider and no answer is delivered',async()=>{
 let observed=false;
 const api=createGymnasiumApi(async(_p,signal)=>{await new Promise<void>((_resolve,reject)=>signal.addEventListener('abort',()=>{observed=true;reject(Error('cancelled'))},{once:true}));throw Error('unreachable');});
 const controller=new AbortController();const request=new Request(req('help',help),{signal:controller.signal});
 const response=api(request);await new Promise(r=>setTimeout(r,10));controller.abort();expect((await response).status).toBe(400);expect(observed).toBe(true);
});
