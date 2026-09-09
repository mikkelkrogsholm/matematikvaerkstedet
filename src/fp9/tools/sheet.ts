import {calculate} from './math';
export type Cells = Record<string,string>;
const addressPattern=/^[A-Z][1-9]\d?$/;
export function evaluateCell(cells:Cells,address:string,ancestors:string[]=[]):number {
 if(!addressPattern.test(address)||ancestors.includes(address)||ancestors.length>50)throw Error('Ugyldig reference eller cirkelreference.');
 const raw=(cells[address]??'').trim();if(!raw)return 0;
 if(!raw.startsWith('='))return calculate(raw);
 const stack=[...ancestors,address];
 let expression=raw.slice(1).toUpperCase();
 expression=expression.replace(/(SUM|MIDDEL|MEAN)\(([A-Z])([1-9]\d?):([A-Z])([1-9]\d?)\)/g,(_,fn,c1,r1,c2,r2)=>{
   const first=Number(r1),last=Number(r2);if(c1!==c2||last<first||last-first>50)throw Error('Brug ét lodret område med højst 51 celler.');
   const values=Array.from({length:last-first+1},(_,i)=>evaluateCell(cells,`${c1}${first+i}`,stack));
   return `(${values.reduce((a,b)=>a+b,0)/(fn==='SUM'?1:values.length)})`;
 });
 expression=expression.replace(/[A-Z][1-9]\d?/g,ref=>`(${evaluateCell(cells,ref,stack)})`);
 return calculate(expression.toLowerCase());
}
