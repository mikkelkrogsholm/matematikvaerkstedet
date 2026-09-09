import { Context } from 'cordis';

export type Lesson = { id: 'fractions' | 'functions'; grade: string; title: string; description: string };
export const lessons: Lesson[] = [
  { id: 'fractions', grade: '6. klasse', title: 'Brøker & procent', description: 'Se, hvordan en del af noget bliver til procent.' },
  { id: 'functions', grade: '2.g', title: 'Funktioner & tangenter', description: 'Undersøg, hvordan en graf ændrer sig lige her.' },
];

// Each lesson is registered as a Cordis plugin; disposal removes its capability.
export async function createLessonRegistry() {
  const context = new Context();
  const registry = new Map<string, Lesson>();
  for (const lesson of lessons) {
    await context.plugin((ctx: Context) => {
      ctx.effect(() => {
        registry.set(lesson.id, lesson);
        return () => { registry.delete(lesson.id); };
      });
    });
  }
  return { context, registry };
}
