import type {Marking} from './index';
const units:Record<string,string[]>={
 'kr.':['kr.','kr','kroner'],'km/t':['km/t','km/h'],'min.':['min.','min','minutter'],
 'timer':['timer','time','t'],'liter':['liter','l'],'cm²':['cm²','cm^2'],'cm³':['cm³','cm^3'],
 'm²':['m²','m^2'],'m³':['m³','m^3'],'°':['°','grader'],'%':['%','procent'],
};
/** Units may be omitted when the answer field already supplies them. A different supplied unit is rejected. */
export function parseNumberAnswer(text:string,marking:Marking):number|null{
 let raw=text.trim().replaceAll('−','-').replaceAll('×','*').replaceAll('·','*').replaceAll(',','.');
 if(raw.length>4000)return null;
 if(marking.unit){
  const aliases=units[marking.unit]??[marking.unit];
  for(const alias of [...aliases].sort((a,b)=>b.length-a.length))if(raw.toLowerCase().endsWith(alias.toLowerCase())){raw=raw.slice(0,-alias.length).trim();break;}
 }
 const decimal='[+-]?(?:\\d+(?:\\.\\d+)?|\\.\\d+)';
 if(marking.scientific){
  const match=raw.match(new RegExp(`^(${decimal})\\s*\\*\\s*10\\s*\\^\\s*([+-]?\\d+)$`));
  if(!match)return null;const coefficient=Number(match[1]),power=Number(match[2]);
  if(Math.abs(coefficient)<1||Math.abs(coefficient)>=10||Math.abs(power)>12)return null;
  return coefficient*10**power;
 }
 const fraction=raw.match(/^([+-]?\d+)\s*\/\s*(\d+)$/);
 if(fraction&&marking.format!=='decimal'){
  const numerator=Number(fraction[1]),denominator=Number(fraction[2]);
  return Number.isSafeInteger(numerator)&&Number.isSafeInteger(denominator)&&denominator!==0?numerator/denominator:null;
 }
 if(marking.fraction)return null;
 if(!new RegExp(`^${decimal}$`).test(raw))return null;
 const value=Number(raw);return Number.isFinite(value)&&Math.abs(value)<=1e12?value:null;
}

export function exactFractionMatches(text:string,expected:{numerator:number;denominator:number}):boolean{
 const match=text.trim().match(/^([+-]?\d+)\s*\/\s*(\d+)$/);
 if(!match||match[1]!.length>17||match[2]!.length>17)return false;
 const p=BigInt(match[1]!),q=BigInt(match[2]!);
 return q!==0n&&p*BigInt(expected.denominator)===BigInt(expected.numerator)*q;
}
