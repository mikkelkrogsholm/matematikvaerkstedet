import { test, expect } from 'bun:test';
import { percent, curve, slope, tangent, parseAnswer } from './math';
import { createLessonRegistry } from './lessons';
test('fractions preserve proportions and handle zero and whole', () => {
  expect(percent(3,4)).toBe(75); expect(percent(2,5)).toBe(40);
  expect(percent(0,12)).toBe(0); expect(percent(12,12)).toBe(100);
  expect(percent(1,2)).toBe(percent(2,4));
});
test('tangent passes through curve and has analytical slope', () => {
  for (const a of [.25,1,2]) for (const x of [-1.8,0,1.8]) {
    expect(tangent(a,x,x)).toBeCloseTo(curve(a,x),10);
    expect(tangent(a,x,x+1)-tangent(a,x,x)).toBeCloseTo(slope(a,x),10);
  }
});
test('Danish answer parsing rejects empty and nonnumeric values',()=>{
  expect(parseAnswer('')).toBeNull();expect(parseAnswer('75abc')).toBeNull();
  expect(parseAnswer('75 %')).toBe(75);expect(parseAnswer('-2,5')).toBe(-2.5);
});
test('Cordis registers both lesson plugins and cleans them up', async()=>{
  const {context,registry}=await createLessonRegistry();expect(registry.size).toBe(2);
  await context.fiber.dispose();expect(registry.size).toBe(0);
});
