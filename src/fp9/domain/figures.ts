import type {Scene,ShapeScene} from './index';
type P={id:string;x:number;y:number};
/** Metric SVG instructions: values are generated data, never copied examination artwork. */
function figure(points:P[],edges:[string,string][],labels:ShapeScene['givens']['labels'],caption:string):ShapeScene{
 const coordinates=points.flatMap(p=>[p.x,p.y]),min=Math.min(0,...coordinates)-2,max=Math.max(...coordinates)+2;
 return {kind:'shape',axes:{x:{label:'x',min,max,step:1},y:{label:'y',min,max,step:1}},givens:{points,edges,labels,caption}};
}
export function triangleAngles(alpha:number,beta:number,variant:number):Scene{
 const ta=Math.tan(alpha*Math.PI/180),tb=Math.tan(beta*Math.PI/180),h=10*ta*tb/(ta+tb),x=h/ta;
 const points=[{id:'A',x:0,y:0},{id:'B',x:10,y:0},{id:'C',x,y:h}];
 const edges:[string,string][]=[['A','B'],['B','C'],['C','A']];
 const labels:ShapeScene['givens']['labels']=[{x:0,y:-1,text:'A'},{x:10,y:-1,text:'B'},{x,y:h+1,text:'C'}];
 if(variant===0)labels.push({x:1,y:.5,text:`${alpha}°`},{x:8,y:.5,text:`${beta}°`});
 if(variant===1){points.push({id:'D',x:1.4*x,y:1.4*h});edges.push(['C','D']);labels.push({x:1,y:.5,text:`A: ${alpha}°`},{x:x+2.5,y:h+.5,text:`Ydre: ${alpha+beta}°`});}
 if(variant===2){points.push({id:'L',x:x-6,y:h},{id:'R',x:x+6,y:h});edges.push(['L','R']);labels.push({x:x+4,y:h+1,text:'parallel med AB'});}
 return figure(points,edges,labels,'Trekant i korrekt størrelsesforhold. Bogstaver og kendte vinkler er markeret.');
}
export function rectangle(width:number,height:number,unknownWidth:boolean):Scene{
 return figure([{id:'A',x:0,y:0},{id:'B',x:width,y:0},{id:'C',x:width,y:height},{id:'D',x:0,y:height}], [['A','B'],['B','C'],['C','D'],['D','A']], [{x:width/2,y:-1,text:unknownWidth?'? cm':`${width} cm`},{x:width+.5,y:height/2,text:`${height} cm`},...(unknownWidth?[{x:width/2,y:height/2,text:`Areal ${width*height} cm²`}]:[])], 'Rektangel i korrekt størrelsesforhold.');
}
export function rightTriangle(leg:number,other:number,hyp:number,variant:number):Scene{
 const labels=[{x:leg/2,y:-1,text:`${leg} cm`},{x:-1,y:other/2,text:variant===1?'? cm':`${other} cm`},{x:leg/2+1,y:other/2+1,text:variant===0?'? cm':`${hyp} cm`}];
 return figure([{id:'A',x:0,y:0},{id:'B',x:leg,y:0},{id:'C',x:0,y:other}], [['A','B'],['B','C'],['C','A']], labels,'Retvinklet trekant i korrekt størrelsesforhold. Den rette vinkel er ved nederste venstre hjørne.');
}
