import {expect,test} from 'bun:test';
import {calculate,equivalent,simplify,solveLinear,statistics} from './math';
test('bounded parser preserves arithmetic precedence and rejects execution',()=>{
 expect(calculate('2+3*4')).toBe(14);expect(calculate('-2^2')).toBe(-4);expect(calculate('(-2)^2')).toBe(4);
 expect(calculate('1/2 + 0,25')).toBe(.75);expect(calculate('sqrt(81)')).toBe(9);
 for(const x of ['alert(1)','1/0','sqrt(-1)','2**3','x','1e309','2^7'])expect(()=>calculate(x)).toThrow();
});
test('symbolic equivalence uses coefficients, not sampled points',()=>{
 expect(equivalent('2(x+3)','2x+6')).toBe(true);expect(equivalent('(x+1)^2','x^2+2x+1')).toBe(true);
 expect(equivalent('x(x-1)(x-2)','0')).toBe(false);expect(equivalent('x/x','1')).toBe(false);
 expect(simplify('2(x+3)-x')).toBe('x +6');expect(solveLinear('2x+3=9')).toEqual({kind:'one',x:3});
 expect(solveLinear('x=x')).toEqual({kind:'all'});expect(solveLinear('x=x+1')).toEqual({kind:'none'});
 expect(()=>solveLinear('x^2=4')).toThrow();
});
test('statistics handles even/odd size and outlier without mutating inputs',()=>{
 const xs=[100,1,2,3];expect(statistics(xs)).toEqual({sum:106,mean:26.5,median:2.5,min:1,max:100});
 expect(xs).toEqual([100,1,2,3]);expect(statistics([3,1,2]).median).toBe(2);expect(()=>statistics([])).toThrow();
});
