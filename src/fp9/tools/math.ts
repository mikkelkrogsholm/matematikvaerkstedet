/** A deliberately bounded arithmetic/polynomial parser. Never executes input. */
type Polynomial = number[];
const trim = (p: Polynomial) => { while (p.length > 1 && Math.abs(p[p.length-1]!) < 1e-12) p.pop(); return p; };
function add(a: Polynomial, b: Polynomial, sign = 1): Polynomial {
  return trim(Array.from({length: Math.max(a.length,b.length)}, (_,i)=>(a[i]??0)+sign*(b[i]??0)));
}
function multiply(a: Polynomial,b: Polynomial): Polynomial {
  if (a.length+b.length > 8) throw Error('Højst sjettegradspolynomier.');
  const result = Array(a.length+b.length-1).fill(0) as number[];
  a.forEach((x,i)=>b.forEach((y,j)=>{result[i+j]! += x*y;}));
  return trim(result);
}
export function polynomial(raw: string, allowVariable = true): Polynomial {
  if (raw.length > 300) throw Error('Udtrykket er for langt.');
  const text = raw.replaceAll('−','-').replaceAll('·','*').replaceAll(',','.').replaceAll('²','^2').replaceAll('³','^3').replace(/\s/g,'');
  const tokens = text.match(/sqrt|\d+(?:\.\d*)?|\.\d+|[x()+*/^\-]/g) ?? [];
  if (!text || tokens.join('') !== text) throw Error('Brug tal, x, parenteser, + − * / ^ og sqrt.');
  let cursor=0;
  const peek=()=>tokens[cursor];
  const take=()=>tokens[cursor++];
  function atom(): Polynomial {
    const token = take();
    if (token === '(') { const p=sum(); if(take()!==')') throw Error('En parentes mangler.'); return p; }
    if (token === 'sqrt') {
      if(take()!=='(') throw Error('Skriv sqrt(tal).');
      const p=sum(); if(take()!==')'||p.length!==1||p[0]!<0) throw Error('Kvadratroden kræver et ikke-negativt tal.');
      return [Math.sqrt(p[0]!)];
    }
    if (token==='x' && allowVariable) return [0,1];
    if(token && /^(?:\d+(?:\.\d*)?|\.\d+)$/.test(token)) return [Number(token)];
    throw Error('Et tal eller en parentes mangler.');
  }
  function power(): Polynomial {
    let p=atom();
    if(peek()==='^') {
      take(); const exponent=unary();
      if(exponent.length!==1||!Number.isInteger(exponent[0])||exponent[0]!<0||exponent[0]!>6) throw Error('Potensen skal være et heltal fra 0 til 6.');
      let result:Polynomial=[1]; for(let i=0;i<exponent[0]!;i++) result=multiply(result,p); p=result;
    }
    return p;
  }
  function unary():Polynomial {
    if(peek()==='+'){take();return unary();}
    if(peek()==='-'){take();return unary().map(v=>-v);}
    return power();
  }
  function product(): Polynomial {
    let p=unary();
    while(peek()==='*'||peek()==='/'||peek()==='x'||peek()==='('||peek()==='sqrt') {
      const implicit = !['*','/'].includes(peek()!); const op=implicit?'*':take(); const q=unary();
      if(op==='/') {if(q.length!==1||q[0]===0)throw Error('Division kræver et konstant tal forskelligt fra nul.');p=p.map(v=>v/q[0]!);}
      else p=multiply(p,q);
    }
    return p;
  }
  function sum(): Polynomial {let p=product();while(peek()==='+'||peek()==='-'){const op=take();p=add(p,product(),op==='+'?1:-1);}return p;}
  const p=sum();
  if(cursor!==tokens.length||!p.every(Number.isFinite)||p.some(v=>Math.abs(v)>1e12)) throw Error('Udtrykket kan ikke beregnes inden for værktøjets grænser.');
  return trim(p);
}
export function calculate(raw:string):number { return polynomial(raw,false)[0]!; }
export function equivalent(left:string,right:string):boolean {
  try {const a=polynomial(left),b=polynomial(right);return Array.from({length:Math.max(a.length,b.length)},(_,i)=>Math.abs((a[i]??0)-(b[i]??0))<=1e-9).every(Boolean);}catch{return false;}
}
export function simplify(raw:string):string {
  const p=polynomial(raw);
  return p.map((v,i)=>v===0?'':`${v<0?'-':'+'}${Math.abs(v)===1&&i?'':Number(Math.abs(v).toPrecision(10))}${i===0?'':i===1?'x':`x^${i}`}`).reverse().filter(Boolean).join(' ').replace(/^\+/, '').trim()||'0';
}
export function solveLinear(raw:string):{kind:'one';x:number}|{kind:'all'|'none'} {
  const sides=raw.split('=');if(sides.length!==2)throw Error('Skriv én ligning med =.');
  const p=add(polynomial(sides[0]!),polynomial(sides[1]!),-1);
  if(p.length>2)throw Error('Løseren understøtter kun lineære ligninger.');
  return p[1] ? {kind:'one',x:-p[0]!/p[1]} : {kind:p[0]===0?'all':'none'};
}
export function statistics(values:number[]) {
  if(values.length===0||values.length>100||!values.every(Number.isFinite))throw Error('Brug mellem 1 og 100 endelige tal.');
  const sorted=[...values].sort((a,b)=>a-b), mid=Math.floor(sorted.length/2), sum=values.reduce((a,b)=>a+b,0);
  return {sum,mean:sum/values.length,median:sorted.length%2?sorted[mid]!:(sorted[mid-1]!+sorted[mid]!)/2,min:sorted[0]!,max:sorted.at(-1)!};
}
