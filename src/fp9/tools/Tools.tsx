import type {ToolState} from '../api-types';
import {calculate,simplify,solveLinear} from './math';
import {evaluateCell,type Cells} from './sheet';
const number=(value:number)=>value.toLocaleString('da-DK',{maximumFractionDigits:8});
export const emptyToolState=():ToolState=>({tab:'calculator',expression:'',result:'',cells:{},rows:6});
export function MathTools({value,onChange}:{value:ToolState;onChange:(next:ToolState)=>void}) {
 const {tab,expression,result,cells,rows}=value;
 const change=(patch:Partial<ToolState>)=>onChange({...value,...patch});
 function run(){try {let next='';if(tab==='calculator')next=number(calculate(expression));else if(expression.includes('=')){
   const solved=solveLinear(expression);next=solved.kind==='one'?`x = ${number(solved.x)}`:solved.kind==='all'?'Alle reelle x er løsninger.':'Ingen løsninger.';
 }else next=simplify(expression);change({result:next});}catch(e){change({result:e instanceof Error?e.message:'Udtrykket kunne ikke beregnes.'});}}
 return <section className="fp9-tools" aria-label="Matematiske hjælpemidler"><h3>Dine hjælpemidler</h3>
 <div role="group" aria-label="Vælg værktøj">{(['calculator','sheet','cas'] as const).map(t=><button key={t} type="button" aria-pressed={tab===t} onClick={()=>change({tab:t,result:''})}>{t==='calculator'?'Lommeregner':t==='sheet'?'Regneark':'Algebra'}</button>)}</div>
 {tab==='sheet'?<><p>Skriv tal eller formler som =A1+B1, =SUM(A1:A3) eller =MIDDEL(A1:A3). Tomme celler tæller som 0.</p><table><caption>Dit eget regneark — ændrer ikke opgavens data</caption><thead><tr><th scope="col">Række</th><th scope="col">A</th><th scope="col">B</th></tr></thead><tbody>{Array.from({length:rows},(_,r)=><tr key={r}><th scope="row">{r+1}</th>{['A','B'].map(c=>{const address=c+(r+1);let answer='';try{answer=cells[address]?number(evaluateCell(cells,address)):'';}catch{answer='Tjek formel';}return <td key={c}><input aria-label={`Celle ${address}`} value={cells[address]??''} maxLength={300} onChange={e=>change({cells:{...cells,[address]:e.target.value}})}/><output aria-label={`Resultat ${address}`}>{answer}</output></td>;})}</tr>)}</tbody></table><button type="button" disabled={rows>=20} onClick={()=>change({rows:rows+1})}>Tilføj række</button></>:<form onSubmit={e=>{e.preventDefault();run();}}><p>{tab==='calculator'?'Brug + − * /, parenteser, potenser 0–6 og sqrt(tal).':'Afgrænset CAS: saml polynomier til grad 6, eller løs en lineær ligning med x. Fx 2(x+3) eller 2x+3=9. Andre ligningstyper er ikke understøttet.'}</p><label>Udtryk<input value={expression} maxLength={300} onChange={e=>change({expression:e.target.value})}/></label><button>Beregn</button><output aria-live="polite">{result}</output></form>}
 </section>;
}
