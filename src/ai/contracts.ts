// Shared data only: no provider, credentials or process code in the browser.
export type Scene =
  | { mode: 'fractions'; n: number; d: number; view: 'bar' | 'line' }
  | { mode: 'functions'; a: number; x: number };
export type ChatMessage = { role: 'guide' | 'student'; text: string };
export type TutorRequest = { question: string; history: ChatMessage[]; scene: Scene; task: string | null };
export type TutorReply = { message: string; scene: Scene | null };

function object(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
function bounded(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}
export function validScene(value: unknown): value is Scene {
  if (!object(value)) return false;
  if (value.mode === 'fractions') return bounded(value.d, 2, 12) && Number.isInteger(value.d)
    && bounded(value.n, 0, value.d) && Number.isInteger(value.n) && ['bar','line'].includes(String(value.view));
  return value.mode === 'functions' && bounded(value.a, .25, 2) && Number.isInteger(value.a * 4)
    && bounded(value.x, -1.8, 1.8);
}
export function parseRequest(value: unknown): TutorRequest {
  if (!object(value) || typeof value.question !== 'string' || !value.question.trim() || value.question.length > 2000
    || !validScene(value.scene) || !Array.isArray(value.history) || value.history.length > 8
    || !value.history.every(m => object(m) && ['guide','student'].includes(String(m.role)) && typeof m.text === 'string' && m.text.length <= 4000)
    || !(value.task === null || typeof value.task === 'string' && value.task.length <= 1000)) throw Error('Ugyldigt spørgsmål eller figur.');
  return value as TutorRequest;
}
export function parseReply(value: unknown, mode: Scene['mode']): TutorReply {
  if (!object(value) || typeof value.message !== 'string' || !value.message.trim() || value.message.length > 4000
    || !(value.scene === null || validScene(value.scene) && value.scene.mode === mode)) throw Error('AI-svaret kunne ikke valideres. Prøv igen.');
  return { message: value.message, scene: value.scene as Scene | null };
}
export const replySchema = {
  type: 'object', additionalProperties: false, required: ['message', 'scene'],
  properties: {
    message: { type: 'string' },
    scene: { anyOf: [
      { type: 'null' },
      { type: 'object', additionalProperties: false, required: ['mode','n','d','view'], properties: {
        mode: { type: 'string', enum: ['fractions'] }, n: { type: 'integer' }, d: { type: 'integer' }, view: { type: 'string', enum: ['bar','line'] },
      } },
      { type: 'object', additionalProperties: false, required: ['mode','a','x'], properties: {
        mode: { type: 'string', enum: ['functions'] }, a: { type: 'number' }, x: { type: 'number' },
      } },
    ] },
  },
};
