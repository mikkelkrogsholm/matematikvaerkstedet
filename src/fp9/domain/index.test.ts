import { expect, test } from 'bun:test';
import { assess, createProfile, families, generateTask, publicTask, validateProfile } from './index';

test('registrerer alle 18 familier og holder belæg og produktvalg adskilt', () => {
  expect(families).toHaveLength(18);
  expect(families.filter((family) => family.status === 'implemented').map((family) => family.id)).toEqual(['F06', 'F13', 'F16']);
  expect(families[5]!.sources.some((source) => source.kind === 'historical-observation')).toBe(true);
  expect(families[6]!.sources.some((source) => source.kind === 'historical-observation')).toBe(false);
});

test('profil kombinerer prøvetype og AI uafhængigt', () => {
  for (const examType of ['with-aids', 'without-aids'] as const) for (const aiEnabled of [true, false]) {
    expect(validateProfile(createProfile(examType, aiEnabled, { feedback: 'after-submit', timingMinutes: 25 }))).toEqual([]);
  }
  expect(() => createProfile('with-aids', false, { aids: 'none' })).toThrow();
});

test('100 seeds i hver lodret familie og variant er reproducerbare og har kun elevsynlig scene', () => {
  for (const familyId of ['F06', 'F13', 'F16'] as const) for (let variant = 0 as 0 | 1 | 2; variant < 3; variant++) for (let seed = -50; seed < 50; seed++) {
    const task = generateTask(familyId, seed, variant, 'with-aids');
    expect(generateTask(familyId, seed, variant, 'with-aids')).toEqual(task);
    expect(task.scene.axes.x.step).toBeGreaterThan(0);
    expect(task.questions).toHaveLength(1);
    expect(publicTask(task)).not.toHaveProperty('marking');
  }
});

test('F06 tjekker kendte tal og kræver forklaring ved lighed', () => {
  const task = generateTask('F06', 7, 2, 'without-aids');
  const marking = task.marking.q1!;
  expect(assess(task, 'q1', { text: String(marking.expected) }).status).toBe('partial');
  expect(assess(task, 'q1', { text: String(marking.expected), explanation: 'Jeg satte de to priser lige store.' }).status).toBe('correct');
  expect(assess(task, 'q1', { text: '1' }).status).toBe('incorrect');
});

test('F13 accepterer flere gyldige figurer efter egenskaber', () => {
  const rectangle = generateTask('F13', 4, 0, 'with-aids');
  const g = rectangle.marking.q1!.geometry!;
  const [a, b] = g.base!; const h = g.area! / (b.x - a.x);
  expect(assess(rectangle, 'q1', { text: '', points: [[a.x, a.y], [b.x, b.y], [a.x, a.y + h], [b.x, b.y + h]] }).status).toBe('correct');
  expect(assess(rectangle, 'q1', { text: '', points: [[a.x, a.y], [b.x, b.y], [a.x, a.y - h], [b.x, b.y - h]] }).status).toBe('correct');
  const triangle = generateTask('F13', 4, 1, 'with-aids'); const triangleMarking = triangle.marking.q1!.geometry!; const base = triangleMarking.base!;
  const targetY = base[0].y + (2 * triangleMarking.area! / (base[1].x - base[0].x));
  expect(assess(triangle, 'q1', { text: '', points: [[base[0].x, base[0].y], [base[1].x, base[1].y], [base[0].x + 1, targetY]] }).status).toBe('correct');
});

test('F16 er altid tydeligt menneskelig vurdering med flere eksempler', () => {
  const task = generateTask('F16', 3, 2, 'without-aids');
  const result = assess(task, 'q1', { text: 'Den store værdi kan ændre gennemsnittet, så jeg vil undersøge den.' });
  expect(result.status).toBe('needs-review');
  expect(result.examples.length).toBeGreaterThanOrEqual(2);
});

test('afviser randtilfælde og endnu ikke implementerede familier', () => {
  expect(() => generateTask('F01', 1, 0, 'with-aids')).toThrow('ikke implementeret');
  expect(() => generateTask('F06', 1.5, 0, 'with-aids')).toThrow('Seed');
  expect(() => generateTask('F06', 1, 3, 'with-aids')).toThrow('Variant');
});
