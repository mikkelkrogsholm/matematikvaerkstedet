import {expect,test} from 'bun:test';
import {evaluateCell} from './sheet';
test('spreadsheet references, ranges and cycles',()=>{
 const cells={A1:'10',A2:'20',A3:'=A1+A2',B1:'=SUM(A1:A3)',B2:'=MIDDEL(A1:A3)'};
 expect(evaluateCell(cells,'A3')).toBe(30);expect(evaluateCell(cells,'B1')).toBe(60);expect(evaluateCell(cells,'B2')).toBe(20);
 expect(()=>evaluateCell({A1:'=B1',B1:'=A1'},'A1')).toThrow();
 expect(()=>evaluateCell({A1:'=SUM(A2:B3)'},'A1')).toThrow();
});
