export type Topic='geometry'|'statistics';
export type Stage=0|1|2|3|4|5;
export type Context={topic:Topic;seed:number;stage:Stage;explore:number};
export const steps=['Forudsig','Udforsk','Beregn','Forklar','Prøv selv'] as const;
export const titles={geometry:'Hvad bestemmer en linjes hældning?',statistics:'Hvornår er gennemsnittet misvisende?'};
export function validateContext(value:unknown):Context{
 const v=value as Context;
 if(!v||!['geometry','statistics'].includes(v.topic)||!Number.isSafeInteger(v.seed)||v.seed<1||v.seed>1e6||!Number.isInteger(v.stage)||v.stage<0||v.stage>5||!Number.isInteger(v.explore)||v.explore<(v.topic==='geometry'?-6:0)||v.explore>(v.topic==='geometry'?8:20))throw Error('Ugyldigt forløb.');
 return {topic:v.topic,seed:v.seed,stage:v.stage,explore:v.explore};
}
export const fmt=(n:number)=>n.toLocaleString('da-DK',{maximumFractionDigits:2});
export const average=(a:number[])=>a.reduce((s,n)=>s+n,0)/a.length;
export function median(a:number[]){const s=[...a].sort((x,y)=>x-y),m=Math.floor(s.length/2);return s.length%2?s[m]!:(s[m-1]!+s[m]!)/2;}
export function lesson(c:Context){
 const a=2+c.seed%4,dx=2*(2+c.seed%3),dy=2+c.seed%3,y=1+c.seed%3,x=-2;
 const base=[a,a+1,a+2,a+3,a+4];
 const transfer=[a+1,a+2,a+2,a+3,a+4,a+5,a+24];
 return {x,y,dx,dy,base,changed:[...base.slice(0,-1),base.at(-1)!+Math.max(0,c.explore)],fixed:[...base.slice(0,-1),base.at(-1)!+20],transfer,
  transferGeometry:{x1:-3,y1:a+2+c.seed%4,x2:c.seed%3,y2:a-1},
  currentSlope:(dy+c.explore)/dx,baseSlope:dy/dx,targetSlope:(dy+2)/dx};
}
export function visibleFocus(c:Context):string[]{
 if(c.topic==='geometry')return c.stage>=1&&c.stage<=3?['none','rise','run']:['none'];
 return [1,3,5].includes(c.stage)?['none','mean','median','data']:['none','data'];
}
export function snapshot(c:Context){
 const d=lesson(c),offset=c.stage===0?0:c.stage===1?c.explore:2;
 if(c.topic==='geometry')return c.stage>=4?{P:[d.transferGeometry.x1,d.transferGeometry.y1],Q:[d.transferGeometry.x2,d.transferGeometry.y2]}:{A:[d.x,d.y],B:[d.x+d.dx,d.y+d.dy+offset],originalB:[d.x+d.dx,d.y+d.dy],horizontalChange:d.dx,verticalChange:d.dy+offset};
 return {data:c.stage===0?d.base:c.stage===1?d.changed:c.stage>=4?d.transfer:d.fixed,originalData:d.base,unit:'minutter'};
}
export function prompt(c:Context){const d=lesson(c);
 const geometry=[
  'Punkt B flyttes 2 enheder op. A og B’s x-koordinat bliver stående. Hvad sker der med hældningskoefficienten?',
  'Flyt B op og ned. Hvad ændrer sig i forholdet mellem lodret og vandret ændring? Prøv også B under A.',
  `Nu fastholder vi B 2 enheder over startpunktet. Beregn hældningen som et decimaltal. Den lodrette ændring er ${d.dy+2}, den vandrette er ${d.dx}. Afrund til 2 decimaler.`,
  'Hvilken begrundelse forklarer, at hældningen voksede? Vælg en begrundelse og forklar den med dine egne ord.',
  `En ny linje går gennem P(${d.transferGeometry.x1}; ${d.transferGeometry.y1}) og Q(${d.transferGeometry.x2}; ${d.transferGeometry.y2}). Beregn hældningen, og forklar dens fortegn. Ingen guide eller hjælpelinjer i dette trin.`,
  'Dit forløb er gennemført.'
 ];
 const statistics=[
  `Vi erstatter kun den største ventetid (${d.base.at(-1)} min.) med en, der er 20 minutter større. Hvad sker der med gennemsnittet og medianen?`,
  'Forlæng den sidste ventetid. Undersøg, hvilke mål der flytter sig, og hvilket der bliver stående.',
  `De nye ventetider er ${d.fixed.join(', ')} minutter. Beregn gennemsnit og median. Afrund gennemsnittet til 2 decimaler.`,
  'Du skal beskrive en typisk ventetid for en ven. Hvilket mål er mest robust over for den enkelte meget lange ventetid? Forklar også, hvornår det andet mål kan være nyttigt.',
  `Et andet hold har ventetiderne ${d.transfer.join(', ')} minutter. Find gennemsnit og median. Begrund, hvilket mål du ville bruge til at beskrive en typisk ventetid.`,
  'Dit forløb er gennemført.'
 ];return (c.topic==='geometry'?geometry:statistics)[c.stage]!;
}
export const choices={
 geometry:{prediction:['Hældningen bliver større','Hældningen bliver mindre','Hældningen er uændret'],explanation:['Den lodrette ændring vokser, mens den vandrette er uændret','Begge koordinater vokser lige meget','Hældningen er altid lig med B’s y-koordinat']},
 statistics:{prediction:['Gennemsnittet vokser; medianen er uændret','Begge vokser lige meget','Medianen vokser; gennemsnittet er uændret'],explanation:['Medianen er mere robust her; gennemsnittet er nyttigt, når alle venteminutter skal tælle','Gennemsnittet er altid forkert, når en værdi er stor','Medianen tager højde for, hvor stor hver observation er']}
};
function number(v:unknown):number|null{if(typeof v!=='string'||v.length>100)return null;const s=v.trim().replace(',','.');if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s))return null;const n=Number(s);return Number.isFinite(n)?n:null;}
export function check(c:Context,input:unknown){
 const v=input as {first:string;second:string;choice:number;explanation:string};if(!v)throw Error('Svar mangler.');
 const d=lesson(c),n=number(v.first),m=number(v.second),near=(a:number|null,b:number)=>a!==null&&Math.abs(a-b)<=.00501;
 if(c.stage===3){
  if(v.choice!==0)return {correct:false,text:c.topic==='geometry'?'Tænk på forskellen mellem koordinaterne: ændrede afstanden i x-retningen sig?':'Et enkelt stort tal påvirker summen, men behøver ikke flytte den midterste observation.'};
  if(typeof v.explanation!=='string'||v.explanation.trim().length<12||v.explanation.length>1200)return {correct:false,text:'Skriv en kort forklaring med egne ord. Det gør din tankegang synlig.'};
  return {correct:true,text:'Du har valgt den relevante begrundelse. Din egen tekst er gemt til refleksion; den er ikke automatisk fagligt godkendt.'};
 }
 if(c.stage!==2&&c.stage!==4)throw Error('Dette trin vurderes ikke som en beregning.');
 if(n===null||(c.topic==='statistics'&&m===null))return {correct:false,text:'Skriv tal i alle beregningsfelter. Komma og punktum kan begge bruges.'};
 const transfer=c.stage===4;
 if(c.topic==='geometry'){
  const wanted=transfer?(d.transferGeometry.y2-d.transferGeometry.y1)/(d.transferGeometry.x2-d.transferGeometry.x1):d.targetSlope;
  if(near(n,wanted))return {correct:true,text:transfer?'Hældningen er korrekt. Sammenlign nu din forklaring med kontrolspørgsmålene nedenfor.':'Beregningen passer. Prøv nu at forklare sammenhængen.'};
  if(near(n,1/wanted))return {correct:false,text:'Det ligner vandret ændring divideret med lodret ændring. Hældning er ændringen i y for hver enhed i x.'};
  if(transfer&&near(n,-wanted))return {correct:false,text:'Størrelsen passer, men se på fortegnet: Q ligger lavere end P, mens x vokser.'};
  if(!transfer&&near(n,d.y+d.dy+2))return {correct:false,text:'Du ser ud til at bruge B’s y-koordinat. Brug højdeforskellen mellem B og A, og divider med afstanden i x-retningen.'};
  return {correct:false,text:transfer?'Kontrollér rækkefølgen: brug Q minus P i både tæller og nævner. Dette er feedback efter dit forsøg.':'Beregn først forskellen i y og forskellen i x. Divider derefter i den rækkefølge.'};
 }
 const data=transfer?d.transfer:d.fixed,mean=average(data),med=median(data);
 if(near(n,mean)&&near(m,med))return {correct:true,text:transfer?'Begge mål er korrekte. Din begrundelse kan nu sammenlignes med kontrolspørgsmålene.':'Begge beregninger passer. Forklar nu, hvorfor målene reagerer forskelligt.'};
 if(near(n,med)&&near(m,mean))return {correct:false,text:'Du ser ud til at have byttet om på målene: gennemsnit bruger summen; median er den midterste værdi efter sortering.'};
 if(!near(n,mean)&&near(m,med))return {correct:false,text:`Medianen passer. Kontrollér summen og divider med alle ${data.length} observationer, også den lange ventetid.`};
 if(near(n,mean))return {correct:false,text:'Gennemsnittet passer. Sortér data og find den midterste observation; medianen er ikke midtpunktet mellem mindste og største.'};
 return {correct:false,text:'Arbejd med målene hver for sig: summen divideret med antal, og derefter den midterste værdi i den sorterede liste.'};
}
