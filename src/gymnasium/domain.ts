export type Family = 'analytisk' | 'trekant' | 'ugrupperet' | 'grupperet';
export type Task = { id:string; title:string; story:string; variant:number; givens:string[]; question:string; unit:string; answerLabel:string; answer:number; tolerance:number; explanation:string; scene: { kind:'geo'|'data'; values:number[]; labels?:string[] } };
export const families: { id:Family; tab:'PLANGEOMETRI'|'DESKRIPTIV STATISTIK'; title:string; subtitle:string }[] = [
  {id:'analytisk',tab:'PLANGEOMETRI',title:'Linjer og cirkler',subtitle:'Koordinater, hældning og afstand'},
  {id:'trekant',tab:'PLANGEOMETRI',title:'Trekanter i planen',subtitle:'Pythagoras, areal og trigonometriske regler'},
  {id:'ugrupperet',tab:'DESKRIPTIV STATISTIK',title:'Ugrupperede data',subtitle:'Gennemsnit, median og kvartiler'},
  {id:'grupperet',tab:'DESKRIPTIV STATISTIK',title:'Grupperede data',subtitle:'Frekvens, estimation og medianinterval'},
];
const rng=(n:number)=>{let x=(n>>>0)||1; return ()=>((x=(x*1664525+1013904223)>>>0)/4294967296)};
const r=(f:()=>number,a:number,b:number)=>a+Math.floor(f()*(b-a+1));
export const fmt=(n:number)=>Number.isInteger(n)?String(n):n.toFixed(2).replace('.',',');
export function makeTask(family:Family, seed:number, variant:number):Task {
  if(!families.some(f=>f.id===family)||!Number.isSafeInteger(seed)||seed<0||seed>2_000_000_000||!Number.isInteger(variant)||variant<0||variant>2) throw Error('Ugyldig opgavereference.');
  const random=rng(seed + variant*1009); const id=`${family}:${seed}:${variant%3}`; const v=variant%3;
  if(family==='analytisk') {
    if(v===0){const x1=r(random,-4,0), y1=r(random,-3,3), dx=r(random,2,5), m=r(random,-3,3)||2, x2=x1+dx,y2=y1+m*dx; return {id,title:'Linje gennem to punkter',story:'En cykelrute tegnes i et koordinatsystem.',variant:v,givens:[`A(${x1}; ${y1})`,`B(${x2}; ${y2})`],question:'Bestem linjens hældningskoefficient a.',unit:'',answerLabel:'a =',answer:m,tolerance:.001,explanation:'Brug a = (y₂ − y₁)/(x₂ − x₁).',scene:{kind:'geo',values:[x1,y1,x2,y2]}};}
    if(v===1){const m=r(random,1,4), x=r(random,-2,3), y=r(random,-3,4); return {id,title:'Vinkelret linje',story:'En rampe skal stå vinkelret på en markeret sti.',variant:v,givens:[`Stiens hældning er ${m}`,`Rampen går gennem P(${x}; ${y})`],question:'Angiv rampens hældning som decimaltal. Afrund til 2 decimaler.',unit:'',answerLabel:'hældning =',answer:-1/m,tolerance:.00501,explanation:'Vinkelrette linjer har hældninger, der ganges til −1.',scene:{kind:'geo',values:[x,y,x+2,y+2*m]}};}
    const cx=r(random,-2,2),cy=r(random,-2,2),rad=r(random,2,5); return {id,title:'Cirklens radius',story:'En rund legeplads er målt op fra centrum.',variant:v,givens:[`Centrum C(${cx}; ${cy})`,`Punkt på cirklen: P(${cx+rad}; ${cy})`],question:'Bestem radius.',unit:'enheder',answerLabel:'r =',answer:rad,tolerance:.001,explanation:'Radius er afstanden fra centrum til et punkt på cirklen.',scene:{kind:'geo',values:[cx,cy,cx+rad,cy]}};
  }
  if(family==='trekant') {
    if(v===0){const a=r(random,3,8),b=r(random,4,9),c=Math.hypot(a,b);return {id,title:'Pythagoras',story:'En stige danner en retvinklet trekant med en væg.',variant:v,givens:[`Kateter: ${a} m og ${b} m`],question:'Hvor lang er hypotenusen? Afrund til 2 decimaler.',unit:'m',answerLabel:'c =',answer:c,tolerance:.00501,explanation:'c² = a² + b², så c = √(a² + b²).',scene:{kind:'geo',values:[0,0,a,0,a,b]}};}
    if(v===1){const b=r(random,4,10),h=r(random,3,8);return {id,title:'Trekantens areal',story:'Et trekantet blomsterbed skal dækkes med jord.',variant:v,givens:[`Grundlinje: ${b} m`,`Højde: ${h} m`],question:'Bestem trekantens areal.',unit:'m²',answerLabel:'A =',answer:b*h/2,tolerance:.001,explanation:'A = ½ · grundlinje · højde.',scene:{kind:'geo',values:[0,0,b,0,b/3,h]}};}
    const a=r(random,5,10), b=r(random,5,10), C=r(random,35,75), c=Math.sqrt(a*a+b*b-2*a*b*Math.cos(C*Math.PI/180));return {id,title:'Cosinusrelationen',story:'To vandrestier mødes ved et udsigtspunkt.',variant:v,givens:[`a = ${a} km`,`b = ${b} km`,`C = ${C}°`],question:'Bestem siden c. Afrund til 2 decimaler.',unit:'km',answerLabel:'c =',answer:c,tolerance:.00501,explanation:'c² = a² + b² − 2ab cos(C).',scene:{kind:'geo',values:[0,0,a,0,b*Math.cos(C*Math.PI/180),b*Math.sin(C*Math.PI/180)]}};
  }
  if(family==='ugrupperet') { const vals=Array.from({length:7},()=>r(random,2,12)).sort((a,b)=>a-b);
    if(v===0){const mean=vals.reduce((a,b)=>a+b,0)/vals.length;return {id,title:'Gennemsnit',story:'Syv elever tæller dagens cykelture.',variant:v,givens:[`Data: ${vals.join(', ')}`],question:'Bestem gennemsnittet. Afrund til 2 decimaler.',unit:'ture',answerLabel:'gennemsnit =',answer:mean,tolerance:.00501,explanation:'Læg alle observationer sammen og divider med antallet.',scene:{kind:'data',values:vals}};}
    if(v===1){const q1=vals[1]!;return {id,title:'Nedre kvartil',story:'Et hold sammenligner tider på en kort bane.',variant:v,givens:[`Sorterede tider: ${vals.join(', ')}`, 'Konvention: medianen af hver halvdel; central observation udelades.'],question:'Bestem nedre kvartil Q1.',unit:'min',answerLabel:'Q1 =',answer:q1,tolerance:.001,explanation:'Del data ved medianen og find medianen i den nedre halvdel.',scene:{kind:'data',values:vals}};}
    const base=vals.slice(0,6), out=base[5]!+20,mean=[...base,out].reduce((a,b)=>a+b,0)/7;return {id,title:'Effekt af en outlier',story:'En fejlregistreret meget lang leveringstid undersøges.',variant:v,givens:[`Data: ${[...base,out].join(', ')}`,`Den største værdi (${out}) er en outlier.`],question:'Bestem gennemsnittet med outlieren. Afrund til 2 decimaler.',unit:'min',answerLabel:'gennemsnit =',answer:mean,tolerance:.00501,explanation:'Gennemsnittet påvirkes kraftigt af en enkelt meget stor værdi; medianen er mere robust.',scene:{kind:'data',values:[...base,out]}};
  }
  const counts=[r(random,3,8),r(random,5,12),r(random,4,10),r(random,2,7)], mids=[5,15,25,35];
  if(counts.reduce((a,b)=>a+b,0)%2===0)counts[3]!++; // Odd count prevents median lying between classes.
  if(v===0){const total=counts.reduce((a,b)=>a+b,0);return {id,title:'Frekvens og kumuleret frekvens',story:'Besøgende tælles i fire tydelige aldersintervaller.',variant:v,givens:counts.map((c,i)=>`[${i*10}; ${i*10+10}[ år: ${c}`),question:'Bestem den kumulerede frekvens for observationer under 20 år. Svar i procent med 2 decimaler.',unit:'%',answerLabel:'kumuleret frekvens =',answer:100*(counts[0]!+counts[1]!)/total,tolerance:.00501,explanation:'Læg alle hyppigheder sammen. Kumuleret frekvens bygges derefter op trin for trin.',scene:{kind:'data',values:counts,labels:['[0; 10[','[10; 20[','[20; 30[','[30; 40[']}};}
  if(v===1){const total=counts.reduce((a,b)=>a+b,0),estimate=counts.reduce((s,c,i)=>s+c*mids[i]!,0)/total;return {id,title:'Grupperet gennemsnit',story:'Pakker er vejet i intervaller på 10 kg.',variant:v,givens:counts.map((c,i)=>`[${i*10}; ${i*10+10}[ kg: ${c}`),question:'Bestem det vægtede gennemsnitsestimat med klassemidtpunkterne 5, 15, 25 og 35. Afrund til 2 decimaler.',unit:'kg',answerLabel:'estimat =',answer:estimate,tolerance:.00501,explanation:'Dette er et estimat: gang hvert klassemidtpunkt med sin hyppighed og divider med n.',scene:{kind:'data',values:counts,labels:['[0; 10[','[10; 20[','[20; 30[','[30; 40[']}};}
  const total=counts.reduce((a,b)=>a+b,0), target=total/2; let acc=0, idx=0; while(acc+counts[idx]!<target){acc+=counts[idx]!;idx++;} return {id,title:'Medianinterval',story:'Ventetider er registreret i intervaller på 10 minutter.',variant:v,givens:counts.map((c,i)=>`[${i*10}; ${i*10+10}[ min: ${c}`),question:'Hvilket interval indeholder medianen? Svar med intervallets nederste grænse.',unit:'min',answerLabel:'nedre grænse =',answer:idx*10,tolerance:.001,explanation:'Find den observation, der ligger midt i den kumulerede hyppighed. Intervallerne er tydeligt afgrænsede.',scene:{kind:'data',values:counts,labels:['[0; 10[','[10; 20[','[20; 30[','[30; 40[']}};
}


export type TaskRef = {family:Family; seed:number; variant:number};
export type PublicTask = Omit<Task,'answer'|'tolerance'|'explanation'>;
export function publicTask(task:Task):PublicTask {
  const {answer,tolerance,explanation,...view}=task;
  return view;
}
export function reference(value:unknown):TaskRef {
  if(!value||typeof value!=='object')throw Error('Opgavereference mangler.');
  const v=value as TaskRef;makeTask(v.family,v.seed,v.variant);
  return {family:v.family,seed:v.seed,variant:v.variant};
}
export function assess(task:Task, raw:unknown) {
  if(typeof raw!=='string'||raw.length>100)throw Error('Ugyldigt svar.');
  const text=raw.trim().replace(',', '.');
  if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text))return {correct:false,feedback:'Skriv et tal. Brug komma eller punktum som decimaltegn.'};
  const n=Number(text), correct=Number.isFinite(n)&&Math.abs(n-task.answer)<=task.tolerance;
  return {correct,feedback:correct?'Dit svar passer. Prøv at forklare, hvorfor metoden virker.':'Ikke helt endnu. Kontrollér de givne værdier, din metode og afrundingen.'};
}
