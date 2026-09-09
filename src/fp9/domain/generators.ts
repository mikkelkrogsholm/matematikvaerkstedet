import {triangleAngles,rectangle,rightTriangle} from './figures';
import type {ExamType,FamilyId,Marking,Scene,Task,DataScene} from './index';

const num=(n:number)=>Number(n.toFixed(8)).toLocaleString('da-DK',{maximumFractionDigits:8,useGrouping:false});
function random(seed:number,offset:number,min:number,max:number){let x=(seed|0)^Math.imul(offset+1,0x9e3779b9);x^=x<<13;x^=x>>>17;x^=x<<5;return min+((x>>>0)%(max-min+1));}
const textScene=(heading:string,lines:string[]):Scene=>({kind:'text',axes:{x:{label:'x',min:0,max:10,step:1},y:{label:'y',min:0,max:10,step:1}},givens:{heading,lines}});
const dataScene=(values:number[],description:string):DataScene=>({kind:'data',axes:{x:{label:'Observation',min:1,max:Math.max(2,values.length),step:1},y:{label:'Værdi',min:0,max:Math.max(...values)+2,step:1}},data:[{label:'Registreringer',values}],givens:{unit:'antal',description}});
interface Definition {title:string;story:string;givens:string[];prompt:string;marking:Marking;scene?:Scene;}
const numeric=(expected:number,unit?:string,extra:Partial<Marking>={}):Marking=>({kind:'numeric',expected,...(unit?{unit}:{}),criteria:['Bruger de givne oplysninger og den relevante matematiske sammenhæng.','Angiver resultat i den efterspurgte enhed eller form.'],examples:[`${num(expected)}${unit?' '+unit:''}.`],...extra});
const review=(criteria:string[],examples:string[]):Marking=>({kind:'review',criteria,examples});
const expression=(value:string,expanded=false):Marking=>({kind:'expression',expression:value,expanded,criteria:[expanded?'Bruger den distributive lov og skriver uden parenteser.':'Bevarer udtrykkets værdi for alle reelle x.'],examples:[value,'Et algebraisk ækvivalent udtryk accepteres, når det opfylder det ønskede format.']});

/** Original Danish contexts. Parameters are bounded; no model or hidden previous answer is used. */
export function generateAdditional(f:FamilyId,s:number,v:0|1|2,e:ExamType):Task {
 const a=random(s,1,2,8),b=random(s,2,2,6),c=random(s,3,3,9),n=random(s,4,3,7);
 let d:Definition;
 switch(f){
 case 'F01': {
  const den=[4,5,8,10][random(s,5,0,3)]!,p=random(s,6,1,den-1),q=random(s,7,1,den-1),factor=random(s,8,2,5);
  d={title:'Dele af en helhed',story:'Et hold deler materialer til en fælles udstilling.',givens:[`En hel plade er delt i ${den} lige store dele.`],prompt:'',marking:numeric(0)};
  if(v===0){d.prompt=`Holdet bruger ${p}/${den} af pladen. Skriv denne brøk som decimaltal.`;d.marking=numeric(p/den,undefined,{format:'decimal',examples:[`${p} ÷ ${den} = ${num(p/den)}.`]});}
  if(v===1){d.prompt=`Først bruges ${p}/${den} plade, derefter ${q}/${den} plade fra en anden plade. Hvor meget bruges i alt? Skriv svaret som brøk.`;d.marking=numeric((p+q)/den,undefined,{fraction:true,rational:{numerator:p+q,denominator:den},examples:[`${p}/${den} + ${q}/${den} = ${p+q}/${den}. En forkortet ækvivalent brøk accepteres også.`]});}
  if(v===2){d.prompt=`Hvilket tal skal erstatte □, så □/${den*factor} = ${p}/${den}?`;d.marking=numeric(p*factor,undefined,{integer:true,examples:[`Nævneren er ganget med ${factor}, så tælleren bliver ${p} · ${factor} = ${p*factor}.`]});}
  break;
 }
 case 'F02': {
  const price=100*c,pct=5*a,discounted=price*(100-pct)/100;
  d={title:'Indkøb til klassefesten',story:'Klassen sammenligner priser og mængder, før der købes ind.',givens:[],prompt:'',marking:numeric(0)};
  if(v===0){d.givens=[`Normalpris: ${price} kr.`,`Rabat: ${pct} %.`];d.prompt='Hvor mange kroner sparer klassen?';d.marking=numeric(price*pct/100,'kr.',{examples:[`${pct}/100 · ${price} = ${price*pct/100} kr.`]});}
  if(v===1){d.givens=[`Prisen efter rabat er ${discounted} kr.`,`Rabatten er ${pct} % af normalprisen.`];d.prompt='Hvad var normalprisen?';d.marking=numeric(price,'kr.',{examples:[`${discounted} ÷ ${num((100-pct)/100)} = ${price} kr.`]});}
  if(v===2){d.givens=[`${a} liter saftevand kræver ${b} dl koncentrat.`,`Blandingsforholdet skal være det samme.`];d.prompt=`Hvor mange dl koncentrat kræver ${a*n} liter saftevand?`;d.marking=numeric(b*n,'dl',{examples:[`Mængden bliver ${n} gange så stor: ${b} · ${n} = ${b*n} dl.`]});}
  break;
 }
 case 'F03': {
  d={title:'Størrelser og overslag',story:'Et værksted kontrollerer beregninger, før materialerne bestilles.',givens:[],prompt:'',marking:numeric(0)};
  if(v===0){d.givens=[`En kvadratisk flise har sidelængde ${a} cm.`];d.prompt='Beregn flisens areal.';d.marking=numeric(a*a,'cm²');}
  if(v===1){const z=a*a+a;d.givens=[`En kvadratisk plade har areal ${z} cm².`];d.prompt='Mellem hvilke to på hinanden følgende hele antal cm ligger sidelængden? Angiv kun det mindste af de to hele tal.';d.marking=numeric(a,'cm',{integer:true,examples:[`${a}² < ${z} < ${a+1}², så sidelængden ligger mellem ${a} og ${a+1} cm.`]});}
  if(v===2){const exponent=random(s,6,3,6),mantissa=a+b/10;d.givens=[`Et datasæt fylder ${num(mantissa*10**exponent)} byte.`];d.prompt='Skriv størrelsen på videnskabelig form a · 10^n, hvor 1 ≤ a < 10. Enheden behøver ikke stå i feltet.';d.marking=numeric(mantissa*10**exponent,'byte',{scientific:true,examples:[`${num(mantissa)} · 10^${exponent} byte.`]});}
  break;
 }
 case 'F04': {
  d={title:'Find den ukendte størrelse',story:'En forening bruger ligninger til at beskrive sine udgifter.',givens:[],prompt:'',marking:numeric(0)};
  if(v===0){d.givens=[`${a}x + ${b} = ${a*n+b}.`];d.prompt='Løs ligningen. Angiv værdien af x.';d.marking=numeric(n,undefined,{examples:[`Træk ${b} fra begge sider og dividér med ${a}: x = ${n}.`]});}
  if(v===1){d.givens=[`${a}x > ${a*n}.`,`x skal være et helt tal.`];d.prompt='Hvad er den mindste mulige værdi af x?';d.marking=numeric(n+1,undefined,{integer:true,examples:[`x > ${n}, så det mindste hele tal er ${n+1}. Grænsen ${n} opfylder ikke den strenge ulighed.`]});}
  if(v===2){d.givens=[`x + y = ${a+b}.`,`2x + y = ${2*a+b}.`];d.prompt='Bestem x. Begge ligninger skal være opfyldt.';d.marking=numeric(a,undefined,{examples:[`Træk første ligning fra den anden: x = ${a}. Derefter kan y = ${b} bruges til kontrol.`]});}
  break;
 }
 case 'F05': {
  d={title:'Algebra på to måder',story:'To elever forsøger at beskrive den samme beregning.',givens:[],prompt:'',marking:numeric(0)};
  if(v===0){d.givens=[`Udtryk: ${a}(x + ${b}).`];d.prompt='Udvid udtrykket, så dit svar ikke indeholder parenteser.';d.marking=expression(`${a}x+${a*b}`,true);}
  if(v===1){d.givens=[`Arealet af en figur beskrives ved A = ${a}x + ${a*b}.`,`x er et positivt reelt tal.`];d.prompt=`Skriv det udtryk, der skal stå i □, så A = ${a} · □. Brug x som variabel.`;d.marking=expression(`x+${b}`);}
  if(v===2){d.givens=[`En elev skriver ${a}(x + ${b}) = ${a}x + ${b}.`];d.prompt='Forklar fejlen, og skriv en korrekt omskrivning.';d.marking=review(['Forklarer, at begge led i parentesen skal multipliceres.','Giver den korrekte omskrivning eller et modbevis og en rettelse.'],[`Begge led ganges med ${a}: ${a}x + ${a*b}.`,`Ved x=0 giver elevens højre side ${b}, men venstre side giver ${a*b}. Fejlen er det manglende gangeled på konstanten.`]);}
  break;
 }
 case 'F07': {
  const rate=10*b,start=100*c,years=2,grown=start*(1+rate/100)**years;
  d={title:'Når væksten gentager sig',story:'En klub undersøger, hvordan forskellige vækstregler ændrer en størrelse.',givens:[],prompt:'',marking:numeric(0)};
  if(v===0){d.givens=[`Startbeløb: ${start} kr.`,`Beløbet vokser ${rate} % om året i ${years} år.`];d.prompt='Hvor stort er beløbet efter de to år? Angiv kroner med to decimaler, hvis det er nødvendigt.';d.marking=numeric(grown,'kr.',{tolerance:0.005,examples:[`${start} · ${num(1+rate/100)}² = ${num(grown)} kr. Procenten beregnes af det nye beløb hvert år.`]});}
  if(v===1){d.givens=[`Efter ${years} års vækst på ${rate} % om året er beløbet ${num(grown)} kr.`];d.prompt='Hvad var startbeløbet?';d.marking=numeric(start,'kr.',{tolerance:0.005,examples:[`${num(grown)} ÷ ${num((1+rate/100)**years)} = ${start} kr.`]});}
  if(v===2){const values=[1,2,3,4].map(k=>a*k*k);d.givens=['Trinnummer: 1, 2, 3, 4.',`Antal brikker: ${values.join(', ')}.`];d.prompt='En elev mener, at antallet vokser med det samme antal brikker hver gang. Vurder påstanden ved hjælp af tabellen, og foreslå en regel.';d.scene=dataScene(values,'Antal brikker på de fire trin.');d.marking=review(['Sammenligner mindst to på hinanden følgende forskelle.','Afviser konstant tilvækst og foreslår en regel, der passer til alle fire værdier.'],[`Forskellene er ${3*a}, ${5*a} og ${7*a}; de er ikke ens. Reglen ${a} · n² passer til tabellen.`,`Når trinnummeret fordobles fra 1 til 2, firedobles antallet. En kvadratisk regel passer, mens konstant addition ikke gør.`]);}
  break;
 }
 case 'F08': {
  const speed=10*c,time=b,distance=speed*time;
  d={title:'På vej til lejrskole',story:'Klassen planlægger transport og undersøger enhederne i sine beregninger.',givens:[],prompt:'',marking:numeric(0)};
  if(v===0){d.givens=[`Afstand: ${distance} km.`,`Køretid uden pauser: ${time} timer.`];d.prompt='Bestem den gennemsnitlige fart i km/t.';d.marking=numeric(speed,'km/t',{examples:[`${distance} km ÷ ${time} timer = ${speed} km/t.`]});}
  if(v===1){d.givens=[`Afstand: ${distance} km.`,`Konstant fart: ${speed} km/t.`];d.prompt='Hvor mange minutter tager turen uden pauser?';d.marking=numeric(time*60,'min.',{examples:[`${distance} ÷ ${speed} = ${time} timer = ${time*60} minutter.`]});}
  if(v===2){const cubic=s%2===0;d.givens=[cubic?`En beholder rummer ${a} dm³.`:`Et bord har areal ${a} m².`];d.prompt=cubic?'Omregn rumfanget til cm³.':'Omregn arealet til cm².';d.marking=numeric(a*(cubic?1000:10000),cubic?'cm³':'cm²',{examples:[cubic?'1 dm³ = 10 · 10 · 10 cm³ = 1000 cm³.':'1 m² = 100 · 100 cm² = 10000 cm².']});}
  break;
 }
 case 'F09': {
  const alpha=a*10,beta=b*10;
  d={title:'Vinkler i et design',story:'Et hold bruger trekanter og parallelle linjer i et mønster.',givens:[],prompt:'',marking:numeric(0)};
  if(v===0){d.givens=[`En trekants vinkler A og B er ${alpha}° og ${beta}°.`];d.prompt='Bestem den tredje vinkel C.';d.marking=numeric(180-alpha-beta,'°',{examples:[`C = 180° − ${alpha}° − ${beta}° = ${180-alpha-beta}°.`]});}
  if(v===1){d.givens=[`Trekant ABC har en ydre vinkel ved C på ${alpha+beta}°.`,`Vinkel A er ${alpha}°.`];d.prompt='Bestem den indre vinkel B.';d.marking=numeric(beta,'°',{examples:[`Den ydre vinkel er A+B, så B = ${alpha+beta}° − ${alpha}° = ${beta}°.`]});}
  if(v===2){d.givens=['Trekant ABC er tegnet i et almindeligt plant koordinatsystem.','Gennem C tegnes en linje parallel med siden AB.'];d.prompt='Forklar, hvordan den parallelle linje kan bruges til at begrunde, at trekantens vinkelsum er 180°.';d.marking=review(['Bruger lighed mellem vinkler ved parallelle linjer.','Knytter de tre vinkler til en lige vinkel på 180°.'],['Vinklerne ved A og B kan genfindes ved C som vinkler mellem parallelle linjer. Sammen med C fylder de en lige vinkel.','Man kan flytte kopier af A og B op ved C langs den parallelle linje. De tre vinkler ligger ved siden af hinanden og summerer til 180°.']);}
  d.scene=triangleAngles(alpha,beta,v);
  break;
 }
 case 'F10': {
  const scale=c*1000;
  d={title:'Fra tegning til virkelighed',story:'En park skal vises på et kort, og et skilt skal forstørres.',givens:[],prompt:'',marking:numeric(0)};
  if(v===0){d.givens=[`Afstand på kortet: ${a} cm.`,`Målestok 1:${scale}.`];d.prompt='Hvor mange meter er afstanden i virkeligheden?';d.marking=numeric(a*scale/100,'m',{examples:[`${a} · ${scale} cm = ${a*scale/100} m.`]});}
  if(v===1){d.givens=[`En afstand på ${a*c} meter er ${a} cm på tegningen.`];d.prompt='Målestokken skrives 1:n. Bestem n.';d.marking=numeric(c*100,undefined,{integer:true,examples:[`Virkelighedens ${a*c*100} cm divideres med tegningens ${a} cm, så n = ${c*100}.`]});}
  if(v===2){d.givens=[`Et skilt har areal ${c} cm².`,`Alle længder forstørres med faktor ${a}.`];d.prompt='Hvad bliver arealet af det forstørrede skilt?';d.marking=numeric(c*a*a,'cm²',{examples:[`Arealet ganges med ${a}², så det bliver ${c*a*a} cm².`]});}
  break;
 }
 case 'F11': {
  d={title:'Byg en udstillingskasse',story:'Et værksted beregner mål på rektangulære dele og en kasse.',givens:[],prompt:'',marking:numeric(0)};
  if(v===0){d.givens=[`En rektangulær plade er ${a} cm lang og ${b} cm bred.`];d.prompt='Bestem omkredsen.';d.marking=numeric(2*(a+b),'cm',{examples:[`2 · (${a} + ${b}) = ${2*(a+b)} cm.`]});}
  if(v===1){d.givens=[`En rektangulær plade har areal ${a*b} cm² og bredde ${b} cm.`];d.prompt='Bestem længden.';d.marking=numeric(a,'cm',{examples:[`${a*b} cm² ÷ ${b} cm = ${a} cm.`]});}
  if(v===2){d.givens=[`En kasse har indvendige mål ${a} dm × ${b} dm × ${c} dm.`,`1 dm³ svarer til 1 liter.`];d.prompt='Hvor mange liter kan kassen rumme?';d.marking=numeric(a*b*c,'liter',{examples:[`${a} · ${b} · ${c} = ${a*b*c} dm³ = ${a*b*c} liter.`]});}
  if(v<2)d.scene=rectangle(a,b,v===1);
  break;
 }
 case 'F12': {
  const triples=[[3,4,5],[5,12,13],[8,15,17]] as const;const [l,k,h]=triples[random(s,6,0,2)]!,factor=e==='without-aids'?1:random(s,7,1,3),leg=l*factor,other=k*factor,hyp=h*factor;
  d={title:'Kontrollér en ret vinkel',story:'En håndværker kontrollerer en trekantet konstruktion.',givens:[],prompt:'',marking:numeric(0)};
  if(v===0){d.givens=[`Trekanten er retvinklet. Kateterne er ${leg} cm og ${other} cm.`];d.prompt='Bestem hypotenusen.';d.marking=numeric(hyp,'cm',{examples:[`√(${leg}² + ${other}²) = ${hyp} cm.`]});}
  if(v===1){d.givens=[`Trekanten er retvinklet. Hypotenusen er ${hyp} cm, og én katete er ${leg} cm.`];d.prompt='Bestem den anden katete.';d.marking=numeric(other,'cm',{examples:[`√(${hyp}² − ${leg}²) = ${other} cm.`]});}
  if(v===2){const longest=hyp+(s%2===0?0:1);d.givens=[`Siderne måler ${leg} cm, ${other} cm og ${longest} cm.`];d.prompt='Er trekanten retvinklet? Begrund dit svar med en beregning.';d.marking=review(['Identificerer den længste side.','Sammenligner summen af de to kortere siders kvadrater med den længste sides kvadrat.','Drager en konklusion, der passer til beregningen.'],[`${leg}² + ${other}² = ${leg*leg+other*other}, mens ${longest}² = ${longest*longest}. Trekanten er ${longest===hyp?'':'ikke '}retvinklet.`,`Den relevante kontrol er a²+b²=c² med c som længste side. ${longest===hyp?'Ligheden gælder.':'Ligheden gælder ikke; det er ikke nok, at siderne næsten passer.'}`]);}
  if(v<2)d.scene=rightTriangle(leg,other,hyp,v);
  break;
 }
 case 'F15': {
  d={title:'Læs klassens registreringer',story:'Klassen samler opdigtede data til en lille undersøgelse.',givens:[],prompt:'',marking:numeric(0)};
  if(v===0){const values=[a,b,c,a+b,a+c];d.givens=[`Antal bøger: ${values.join(', ')}.`];d.prompt='Bestem medianen.';d.scene=dataScene(values,'Fem elevers antal læste bøger.');d.marking=numeric([...values].sort((x,y)=>x-y)[2]!,'bøger',{examples:[`Sorter tallene: ${[...values].sort((x,y)=>x-y).join(', ')}. Medianen er det midterste tal.`]});}
  if(v===1){const values=[c-2,c,c+1],missing=c+1;d.givens=[`Fire registreringer har gennemsnit ${c}.`,`De første tre er ${values.join(', ')}.`];d.prompt='Bestem den fjerde registrering.';d.marking=numeric(missing,undefined,{examples:[`Summen skal være 4 · ${c} = ${4*c}. Træk summen ${3*c-1} af de kendte værdier fra.`]});}
  if(v===2){const cyclists=a*2,total=20;d.givens=[`Der er ${total} elever.`,`Cykel: ${cyclists}; bus: ${total-cyclists}.`];d.prompt='Hvor mange procent af eleverne cykler?';d.scene={...dataScene([cyclists,total-cyclists],'Transportvalg i klassen.'),categories:['Cykel','Bus']};d.scene.axes.x={label:'Transport',min:0,max:3,step:1};d.marking=numeric(cyclists/total*100,'%',{examples:[`${cyclists}/${total} · 100 = ${cyclists*5} %.`]});}
  break;
 }
 case 'F17': {
  d={title:'Tilfældige træk',story:'Et spil bruger lige sandsynlige kort og kugler.',givens:[],prompt:'',marking:numeric(0)};
  if(v===0){d.givens=[`En pose indeholder ${a} røde og ${b} blå kugler.`,`Én kugle trækkes tilfældigt; alle kugler er lige sandsynlige.`];d.prompt='Hvad er sandsynligheden for rød? Skriv som brøk.';d.marking=numeric(a/(a+b),undefined,{fraction:true,rational:{numerator:a,denominator:a+b},examples:[`${a} gunstige ud af ${a+b} mulige: ${a}/${a+b}.`]});}
  if(v===1){d.givens=[`Sandsynligheden for en gevinst er ${a}/10.`];d.prompt='Hvad er sandsynligheden for ingen gevinst? Skriv som brøk.';d.marking=numeric((10-a)/10,undefined,{fraction:true,rational:{numerator:10-a,denominator:10},examples:[`1 − ${a}/10 = ${10-a}/10.`]});}
  if(v===2){d.givens=[`Andelen af grønne kort er ${a}/${a+b}.`,`Der er ${n*(a+b)} kort i alt.`];d.prompt='Hvor mange af kortene er grønne?';d.marking=numeric(a*n,'kort',{integer:true,examples:[`${a}/${a+b} · ${n*(a+b)} = ${a*n} kort.`]});}
  break;
 }
 case 'F18': {
  d={title:'To træk og en simulation',story:'Et spil undersøges med både beregning og gentagne forsøg.',givens:[],prompt:'',marking:numeric(0)};
  if(v<2){d.givens=[`Posen indeholder ${a} røde og ${b} blå kugler.`,`To kugler trækkes tilfældigt ${v===0?'med':'uden'} tilbagelægning.`];d.prompt='Hvad er sandsynligheden for to røde? Skriv som brøk.';d.marking=numeric(a/(a+b)*(v===0?a/(a+b):(a-1)/(a+b-1)),undefined,{fraction:true,rational:{numerator:v===0?a*a:a*(a-1),denominator:v===0?(a+b)**2:(a+b)*(a+b-1)},examples:[v===0?`${a}/${a+b} · ${a}/${a+b} = ${a*a}/${(a+b)**2}.`:`${a}/${a+b} · ${a-1}/${a+b-1} = ${a*(a-1)}/${(a+b)*(a+b-1)}.`]});}
  else{const trials=10*n,hits=Math.floor(trials*.7);d.givens=[`En simulation af en fair mønt gav ${hits} plat i ${trials} kast.`];d.prompt='En elev mener, at dette beviser, at sandsynligheden for plat er 70 %. Vurder konklusionen, og foreslå en bedre undersøgelse.';d.marking=review(['Skelner mellem observeret hyppighed og teoretisk sandsynlighed.','Forklarer tilfældig variation og foreslår flere uafhængige forsøg.'],[`Den observerede andel er ${hits}/${trials}, men et endeligt forsøg beviser ikke sandsynligheden. En fair mønt har teoretisk sandsynlighed 1/2.`,`Gentag forsøget mange gange og undersøg, hvordan andelene varierer. Flere kast kan give et bedre estimat, men gør ikke én observeret andel til et bevis.`]);}
  break;
 }
 default: throw Error(`Ukendt opgavefamilie: ${f}`);
 }
 const scene=d.scene??textScene(d.title,d.givens);
 return {id:`fp9-${f.toLowerCase()}-v2-${e}-${s}-${v}`,familyId:f,version:'2.0.0',seed:s,variant:v,examType:e,allowedExamTypes:['with-aids','without-aids'],title:d.title,story:d.story,facts:d.givens,questions:[{id:'q1',prompt:d.prompt,answerKind:d.marking.kind==='review'?'reasoning':d.marking.kind==='expression'?'expression':'number',...(d.marking.unit?{unit:d.marking.unit}:{}),...(d.marking.fraction?{format:'fraction' as const}:d.marking.scientific?{format:'scientific' as const}:d.marking.format?{format:d.marking.format}:d.marking.integer?{format:'integer' as const}:{})}],scene,marking:{q1:d.marking}};
}
