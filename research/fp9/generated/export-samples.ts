/** QA artifacts contain generated reference answers; they are never imported into the student application. */
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {families,generateTask,publicTask} from '../../../src/fp9/domain';
import {createScene} from '../../../src/fp9/scene';
import {SceneView} from '../../../src/fp9/ui/SceneView';
const samples=families.flatMap(family=>[101,202].flatMap(seed=>[0,1,2].map(variant=>{
 const examType=seed===101?'without-aids' as const:'with-aids' as const;
 const task=generateTask(family.id,seed,variant,examType);
 return {familyId:family.id,seed,variant,examType,familyVersion:task.version,task:publicTask(task),reference:task.marking,review:{mathematicalChecks:'Covered by independent 100-seed tests; see generators.test.ts',visual:'pending',reviewer:null,date:null}};
})));
await Bun.write(new URL('./samples.json',import.meta.url),JSON.stringify({corpusVersion:'2',samples},null,2)+'\n');
const cards=samples.map(({task,reference})=>renderToStaticMarkup(React.createElement('article',{className:'fp9-task'},
 React.createElement('h2',null,`${task.familyId} · variant ${task.variant+1} · seed ${task.seed} · ${task.examType}`),
 React.createElement('p',null,task.story),...(task.facts??[]).map((f,i)=>React.createElement('p',{key:i},f)),
 React.createElement(SceneView,{task,state:createScene('qa',task.id,task.scene),withAids:task.examType==='with-aids',locked:true,onStudent:()=>{}}),
 ...task.questions.map(q=>React.createElement('section',{key:q.id},React.createElement('h3',null,q.prompt),React.createElement('p',null,`Svarform: ${q.answerKind}; enhed: ${q.unit??'ingen'}`),React.createElement('details',null,React.createElement('summary',null,'QA: kriterier og referenceeksempler'),...reference[q.id]!.criteria.map((s,i)=>React.createElement('p',{key:'c'+i},s)),...reference[q.id]!.examples.map((s,i)=>React.createElement('p',{key:'e'+i},s))))),
))).join('\n');
const css=await Bun.file(new URL('../../../src/fp9/ui/fp9.css',import.meta.url)).text();
const html=`<!doctype html><html lang="da"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>FP9 — 108 varianter til gennemgang</title><style>${css}\nbody{margin:0;padding:24px;background:#f5f4ed;font-family:system-ui;color:#172d23}.gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,360px),1fr));gap:24px}.gallery article{padding:20px;background:white;border:1px solid #ccd5ce;break-inside:avoid}.gallery svg{width:100%;height:auto;max-height:400px}.gallery h2{font-size:16px}.gallery h3{font-size:17px}button{font:inherit}@media print{.gallery{display:block}.gallery article{break-after:page}details{display:block}}</style><body class="fp9"><h1>108 FP9-varianter til faglig og visuel gennemgang</h1><p>18 familier × 3 strukturer × 2 seeds/prøvetyper. Maskingenereret QA-artefakt; visuel gennemgang og elevpilot er endnu ikke udført.</p><div class="gallery">${cards}</div></body></html>`;
await Bun.write(new URL('./gallery.html',import.meta.url),html);
console.log(`Generated ${samples.length} full QA cases and static HTML gallery.`);
