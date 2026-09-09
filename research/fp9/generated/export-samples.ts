/** Deterministisk generator-evidens. Den udfører ikke menneskelig/visuel gennemgang. */
import { families, generateTask, publicTask } from '../../../src/fp9/domain';

const out = new URL('./samples.json', import.meta.url);
const samples = families.flatMap((family) => [101, 202].flatMap((seed) => ([0, 1, 2] as const).map((variant) => {
  const examType = seed === 101 ? 'without-aids' as const : 'with-aids' as const;
  const task = publicTask(generateTask(family.id, seed, variant, examType));
  return { familyId: family.id, seed, variant, examType, id: task.id, scene: task.scene.kind, question: task.questions[0]!.prompt };
})));
await Bun.write(out, `${JSON.stringify({ generatorVersion: '1.1.0', samples }, null, 2)}\n`);
console.log(`Skrev ${samples.length} offentlige deskriptorer til ${out.pathname}`);
