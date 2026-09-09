import type { PublicTask } from './domain';

export type GuideAction = {kind:'highlight'|'annotate'|'cursor';target:string;text:string;x:number;y:number};
export type Exploration = {x:number;y:number;offset:number};
export type GuideReply = {text:string;actions:GuideAction[]};
export const targets=(task:PublicTask)=>task.scene.kind==='data'
  ? task.scene.values.map((_,i)=>`data-${i}`)
  : ['figure','point-0','point-1',...(task.scene.values.length===6?['point-2']:[])];
export function validateExploration(value:unknown):Exploration {
  const v=value as Exploration;
  if(!v||![v.x,v.y,v.offset].every(n=>typeof n==='number'&&Number.isFinite(n))||Math.abs(v.x)>50||Math.abs(v.y)>50||Math.abs(v.offset)>20)throw Error('Ugyldig udforskning.');
  return {x:v.x,y:v.y,offset:v.offset};
}
export function validateReply(value:unknown,task:PublicTask):GuideReply {
  const v=value as GuideReply;
  if(!v||typeof v.text!=='string'||!v.text.trim()||v.text.length>2200||!Array.isArray(v.actions)||v.actions.length>3)throw Error('Guiden gav et ugyldigt svar.');
  const allowed=targets(task);
  for(const a of v.actions){
    if(!a||!['highlight','annotate','cursor'].includes(a.kind)||typeof a.text!=='string'||a.text.length>300||!allowed.includes(a.target)||![a.x,a.y].every(n=>typeof n==='number'&&Number.isFinite(n)&&Math.abs(n)<=50))throw Error('Guidens figurhandling blev afvist.');
    if(a.kind==='cursor'&&task.scene.kind!=='geo')throw Error('Markøren kræver en geometrifigur.');
  }
  return {text:v.text,actions:v.actions.map(a=>({kind:a.kind,target:a.target,text:a.text,x:a.x,y:a.y}))};
}
export const replySchema = {
 type:'object', additionalProperties:false, required:['text','actions'],
 properties:{
  text:{type:'string'},
  actions:{type:'array',items:{
   type:'object',additionalProperties:false,required:['kind','target','text','x','y'],
   properties:{kind:{type:'string',enum:['highlight','annotate','cursor']},target:{type:'string'},text:{type:'string'},x:{type:'number'},y:{type:'number'}}
  }}
 }
};
