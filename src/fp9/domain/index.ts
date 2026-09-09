/**
 * Seedede FP9-opgaver. Modulet er lokalt og indeholder bevidst ingen LLM-kald.
 * `Task.marking` er internt; brug `publicTask` til data, der må sendes til UI'et.
 */

export type FamilyId =
  | 'F01' | 'F02' | 'F03' | 'F04' | 'F05' | 'F06' | 'F07' | 'F08' | 'F09'
  | 'F10' | 'F11' | 'F12' | 'F13' | 'F14' | 'F15' | 'F16' | 'F17' | 'F18';
export type ExamType = 'with-aids' | 'without-aids';
export type Aids = 'standard' | 'none';
export type FeedbackTiming = 'immediate' | 'after-submit';
export type AnswerKind = 'number' | 'expression' | 'geometry' | 'reasoning';

/** Prøveindstillinger. AI, prøvetype og feedback er bevidst uafhængige felter. */
export interface Profile {
  examType: ExamType;
  aids: Aids;
  aiEnabled: boolean;
  timingMinutes: number | null;
  feedback: FeedbackTiming;
  sourceVersion: string;
  sourceDate: string;
}

export interface ProfileSettings {
  aids?: Aids;
  timingMinutes?: number | null;
  feedback?: FeedbackTiming;
  sourceVersion?: string;
  sourceDate?: string;
}

/** Opretter en gyldig træningsprofil med dokumenteret kildeversion og -dato. */
export function createProfile(examType: ExamType, aiEnabled: boolean, settings: ProfileSettings = {}): Profile {
  const profile: Profile = {
    examType,
    aids: settings.aids ?? (examType === 'with-aids' ? 'standard' : 'none'),
    aiEnabled,
    timingMinutes: settings.timingMinutes ?? null,
    feedback: settings.feedback ?? 'immediate',
    sourceVersion: settings.sourceVersion ?? 'fp9-foundation-2026-09-09',
    sourceDate: settings.sourceDate ?? '2026-09-09',
  };
  const errors = validateProfile(profile);
  if (errors.length) throw new Error(`Ugyldig prøveprofil: ${errors.join(' ')}`);
  return profile;
}

/** Validerer profilens indbyrdes konsistens uden at slå AI og prøvetype sammen. */
export function validateProfile(profile: Profile): string[] {
  const errors: string[] = [];
  if (profile.examType === 'with-aids' && profile.aids !== 'standard') errors.push('Med hjælpemidler kræver hjælpemiddelprofilen standard.');
  if (profile.examType === 'without-aids' && profile.aids !== 'none') errors.push('Uden hjælpemidler kræver hjælpemiddelprofilen none.');
  if (profile.timingMinutes !== null && (!Number.isFinite(profile.timingMinutes) || profile.timingMinutes <= 0 || !Number.isInteger(profile.timingMinutes))) errors.push('Tid skal være et positivt helt antal minutter eller null.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(profile.sourceDate)) errors.push('Kildedato skal have formatet ÅÅÅÅ-MM-DD.');
  if (!profile.sourceVersion.trim()) errors.push('Kildeversion må ikke være tom.');
  return errors;
}

export interface SourceNote {
  kind: 'historical-observation' | 'product-design';
  reference: string;
  note: string;
}
export interface Family {
  id: FamilyId;
  title: string;
  skills: string[];
  prerequisites: string[];
  action: string;
  examTypes: ExamType[];
  answerForms: AnswerKind[];
  sources: SourceNote[];
  evidence: 'curriculum-informed-product-family';
  status: 'implemented' | 'pending';
}

const familyNames: Record<FamilyId, string> = {
  F01: 'Tal, brøker og decimaler', F02: 'Procent, forhold og opskalering', F03: 'Overslag, potenser og rødder',
  F04: 'Ligninger, uligheder og enkle systemer', F05: 'Formler, omskrivning og fejl', F06: 'Lineære modeller og tilbud',
  F07: 'Vækst og ikke-lineære modeller', F08: 'Enheder, fart og sammensatte mål', F09: 'Vinkler og geometriske egenskaber',
  F10: 'Målestok og ligedannethed', F11: 'Omkreds, areal og rumfang', F12: 'Retvinklede trekanter',
  F13: 'Konstruktioner og koordinatgeometri', F14: 'Symmetri og flytninger', F15: 'Diagrammer og deskriptorer',
  F16: 'Dataundersøgelser', F17: 'Enkle sandsynligheder', F18: 'Sammensatte hændelser og simulering',
};
const observed: Partial<Record<FamilyId, string>> = {
  F01: 'EXAM-2022-A 1.1; EXAM-2023-N 1', F02: 'EXAM-2022-A 1.2; EXAM-2023-N 3', F03: 'EXAM-2023-N 8; EXAM-2023-N 9',
  F04: 'EXAM-2022-A 4.2; EXAM-2023-N 7', F05: 'EXAM-2022-A 4.1; EXAM-2023-N 6', F06: 'EXAM-2022-A 1.1; EXAM-2022-A 1.4; EXAM-2023-N 11; EXAM-2023-N 16',
  F08: 'EXAM-2022-A 4.1; EXAM-2023-N 4', F09: 'EXAM-2023-N 13', F10: 'EXAM-2022-A 3.1; EXAM-2023-N 14',
  F11: 'EXAM-2022-A 7.1; EXAM-2023-N 15', F12: 'EXAM-2022-A 3.1; EXAM-2022-A 3.3', F13: 'EXAM-2022-A 7.1',
  F15: 'EXAM-2022-A 2.1; EXAM-2023-N 18', F16: 'EXAM-2022-A 2.1; EXAM-2022-A 5.2; EXAM-2022-A 5.3', F17: 'EXAM-2023-N 20',
};
const implemented = new Set<FamilyId>(['F06', 'F13', 'F16']);

/** Dækningsregister: historiske eksempler er observationer, mens familien er et produktvalg. */
export const families: readonly Family[] = (Object.keys(familyNames) as FamilyId[]).map((id) => ({
  id,
  title: familyNames[id],
  skills: id === 'F06' ? ['lineære prisfunktioner', 'diskrete antal', 'sammenligning'] : id === 'F13' ? ['koordinater', 'konstruktion', 'flytning'] : id === 'F16' ? ['datasammenligning', 'gennemsnit', 'median', 'outlier'] : ['fagområde under afgrænsning'],
  prerequisites: id === 'F06' ? ['multiplikation', 'ligninger'] : id === 'F13' ? ['koordinatplan', 'areal'] : id === 'F16' ? ['læse tabeller', 'gennemsnit'] : ['afklares før implementering'],
  action: id === 'F06' ? 'modellere, sammenligne og begrunde' : id === 'F13' ? 'konstruere og kontrollere egenskaber' : id === 'F16' ? 'undersøge data og begrunde valg' : 'afklares før implementering',
  examTypes: ['with-aids', 'without-aids'],
  answerForms: id === 'F13' ? ['geometry'] : id === 'F16' ? ['reasoning'] : id === 'F06' ? ['number', 'expression'] : ['number'],
  sources: [
    ...(observed[id] ? [{ kind: 'historical-observation' as const, reference: observed[id]!, note: 'Observeret i det valgte opgavekort; ikke en påstand om gældende prøveregler.' }] : []),
    { kind: 'product-design' as const, reference: 'research/fp9/coverage.csv', note: 'Læreplansinformeret produktfamilie og ikke dokumentation for fuld prøvedækning.' },
  ],
  evidence: 'curriculum-informed-product-family',
  status: implemented.has(id) ? 'implemented' : 'pending',
}));

export interface Point { x: number; y: number; }
export interface Axis { label: string; unit?: string; min: number; max: number; step: number; }
export interface PriceScene {
  kind: 'price';
  axes: { x: Axis; y: Axis };
  givens: { offerA: { fixed: number; perUnit: number }; offerB: { fixed: number; perUnit: number }; unit: string; discrete: true };
}
export interface GridScene {
  kind: 'grid';
  axes: { x: Axis; y: Axis };
  givens: { points: Array<{ id: string; point: Point }>; instruction: string };
}
export interface DataScene {
  kind: 'data';
  axes: { x: Axis; y: Axis };
  data: Array<{ label: string; values: number[] }>;
  givens: { unit: string; description: string };
}
export type Scene = PriceScene | GridScene | DataScene;
export interface Question { id: string; prompt: string; answerKind: AnswerKind; unit?: string; }
export interface Marking {
  kind: 'numeric' | 'geometry' | 'review';
  criteria: string[];
  examples: string[];
  requiresExplanation?: boolean;
  expected?: number;
  geometry?: { variant: 0 | 1 | 2; base?: [Point, Point]; area?: number; translation?: Point; source?: Point };
}
export interface Task {
  id: string;
  familyId: FamilyId;
  version: string;
  seed: number;
  variant: 0 | 1 | 2;
  title: string;
  story: string;
  questions: Question[];
  scene: Scene;
  marking: Record<string, Marking>;
  examType: ExamType;
}
export type PublicTask = Omit<Task, 'marking'>;
export interface Answer { text: string; explanation?: string; points?: [number, number][]; }
export interface Assessment { status: 'correct' | 'incorrect' | 'partial' | 'needs-review'; feedback: string; criteria: string[]; examples: string[]; }

const axis = (label: string, min: number, max: number, step: number, unit?: string): Axis => ({ label, min, max, step, ...(unit ? { unit } : {}) });
const integer = (seed: number, offset: number, min: number, max: number): number => {
  let value = (seed | 0) ^ Math.imul(offset + 1, 0x9e3779b9);
  value ^= value << 13; value ^= value >>> 17; value ^= value << 5;
  return min + (Math.abs(value >>> 0) % (max - min + 1));
};
function checkInputs(seed: number, variant: number): asserts variant is 0 | 1 | 2 {
  if (!Number.isSafeInteger(seed)) throw new Error('Seed skal være et sikkert heltal.');
  if (!Number.isInteger(variant) || variant < 0 || variant > 2) throw new Error('Variant skal være 0, 1 eller 2.');
}
const taskId = (familyId: FamilyId, seed: number, variant: number, examType: ExamType) => `fp9-${familyId.toLowerCase()}-v1-${examType}-${seed}-${variant}`;

/** Genererer en reproducerbar opgave; de resterende familier er registreret, men ikke genereret endnu. */
export function generateTask(familyId: FamilyId, seed: number, variant: number, examType: ExamType): Task {
  checkInputs(seed, variant);
  if (!implemented.has(familyId)) throw new Error(`${familyId} er registreret, men generatoren er ikke implementeret endnu.`);
  if (familyId === 'F06') return generatePrice(seed, variant, examType);
  if (familyId === 'F13') return generateGrid(seed, variant, examType);
  return generateData(seed, variant, examType);
}

function generatePrice(seed: number, variant: 0 | 1 | 2, examType: ExamType): Task {
  const a = integer(seed, 1, 18, 40); const b = integer(seed, 2, 8, 18); const crossing = integer(seed, 3, 4, 10);
  const fixedB = crossing * (a - b); const count = integer(seed, 4, 2, 12); const scene: PriceScene = { kind: 'price', axes: { x: axis('Antal besøg', 0, Math.max(16, crossing + 4), 1), y: axis('Pris', 0, Math.max(a * 16, fixedB + b * 16) + 20, 20, 'kr.') }, givens: { offerA: { fixed: 0, perUnit: a }, offerB: { fixed: fixedB, perUnit: b }, unit: 'besøg', discrete: true } };
  const qid = 'q1';
  const q = variant === 0 ? { id: qid, answerKind: 'number' as const, unit: 'kr.', prompt: `Hvad koster tilbud A ved ${count} besøg?` } : variant === 1 ? { id: qid, answerKind: 'number' as const, unit: 'besøg', prompt: `Du har højst ${fixedB + b * count} kr. Hvor mange hele besøg kan du højst købe med tilbud B?` } : { id: qid, answerKind: 'number' as const, unit: 'besøg', prompt: 'Ved hvor mange hele besøg er tilbuddene lige dyre? Skriv også kort, hvordan du finder det.' };
  const expected = variant === 0 ? a * count : variant === 1 ? count : crossing;
  return { id: taskId('F06', seed, variant, examType), familyId: 'F06', version: '1.0.0', seed, variant, examType, title: 'Vælg et tilbud', story: `To steder tilbyder klippekort. A koster ${a} kr. pr. besøg. B koster ${fixedB} kr. i startbetaling og ${b} kr. pr. besøg. Antal besøg er hele tal.`, questions: [q], scene, marking: { [qid]: { kind: 'numeric', expected, requiresExplanation: variant === 2, criteria: variant === 2 ? ['Sætter priserne lige store eller forklarer samme idé.', 'Angiver et helt antal besøg.'] : ['Bruger den relevante prisfunktion.', 'Respekterer at antal besøg er helt.'], examples: variant === 2 ? [`${a}·n = ${fixedB} + ${b}·n, så n = ${crossing}.`, `Ved ${crossing} besøg er begge priser ${a * crossing} kr.`] : [`Det korrekte tal er ${expected}.`] } } };
}

function generateGrid(seed: number, variant: 0 | 1 | 2, examType: ExamType): Task {
  const x = integer(seed, 1, -4, 1); const y = integer(seed, 2, -3, 3); const width = integer(seed, 3, 3, 6); const height = integer(seed, 4, 2, 5); const qid = 'q1';
  const baseA = { x, y }; const baseB = { x: x + width, y };
  const scene: GridScene = { kind: 'grid', axes: { x: axis('x', -10, 10, 1), y: axis('y', -10, 10, 1) }, givens: { points: variant === 2 ? [{ id: 'P', point: baseA }] : [{ id: 'A', point: baseA }, { id: 'B', point: baseB }], instruction: variant === 0 ? `Tegn et rektangel med AB som side og areal ${width * height}.` : variant === 1 ? `Tegn en trekant med grundlinjen AB og areal ${width * height / 2}.` : `Flyt P med vektoren (${width}, ${height}).` } };
  const prompt = variant === 0 ? 'Indtegn rektanglets fire hjørner. Rækkefølgen er ligegyldig.' : variant === 1 ? 'Indtegn A, B og et tredje hjørne til en trekant med det angivne areal.' : 'Indtegn det flyttede punkt P\'.';
  const geometry = variant === 0 ? { variant, base: [baseA, baseB] as [Point, Point], area: width * height } : variant === 1 ? { variant, base: [baseA, baseB] as [Point, Point], area: width * height / 2 } : { variant, source: baseA, translation: { x: width, y: height } };
  return { id: taskId('F13', seed, variant, examType), familyId: 'F13', version: '1.0.0', seed, variant, examType, title: 'Konstruktion på koordinatplan', story: 'Brug koordinatgitteret. Der findes flere gyldige konstruktioner i de to første opgaver.', questions: [{ id: qid, prompt, answerKind: 'geometry' }], scene, marking: { [qid]: { kind: 'geometry', geometry, criteria: variant === 0 ? ['Har A og B som hjørner.', 'Danner et rektangel med areal som angivet.'] : variant === 1 ? ['Har A og B som grundlinje.', 'Det tredje hjørne giver det angivne areal.'] : ['Flytter både x- og y-koordinat med den givne vektor.'], examples: variant === 0 ? ['Rektanglet kan ligge over eller under AB.', 'Hjørnerne kan angives i vilkårlig rækkefølge.'] : variant === 1 ? ['Det tredje hjørne kan ligge på flere lodrette linjer.', 'Trekanten kan ligge på begge sider af AB.'] : [`P' = (${baseA.x + width}, ${baseA.y + height}).`, 'Læg vektorens x-led til x og y-led til y.'] } } };
}

function generateData(seed: number, variant: 0 | 1 | 2, examType: ExamType): Task {
  const core = integer(seed, 1, 8, 14); const spread = integer(seed, 2, 1, 3); const a = [core - spread, core, core, core + spread, core]; const b = [core - 1, core - 1, core, core + 1, core + 1]; const outlier = core + integer(seed, 3, 12, 20); const data = variant === 2 ? [{ label: 'Fem normale målinger', values: b }, { label: 'Med én usædvanlig måling', values: [...b.slice(0, 4), outlier] }] : [{ label: 'Hold A', values: a }, { label: 'Hold B', values: b }];
  const prompts: [string, string, string] = [
    'Sammenlign holdenes resultater. Hvilket hold vil du beskrive som mest stabilt? Begrund med data.',
    'Vil gennemsnit eller median være mest retvisende til at sammenligne holdene? Begrund dit valg.',
    'Vurder, om den usædvanlige måling bør undersøges nærmere før man konkluderer. Begrund med data.',
  ];
  const examples = variant === 0 ? ['Hold B er mest stabilt, fordi tallene ligger tættere omkring midten.', 'Man kan sammenligne spændvidderne og forklare, hvad den mindre spredning betyder.'] : variant === 1 ? ['Median kan være et godt valg, når man vil være mindre følsom over for enkelte ekstreme værdier.', 'Gennemsnittet bruger alle værdier; derfor skal valget begrundes ud fra formålet.'] : ['Den usædvanlige måling kan påvirke gennemsnittet meget og bør kontrolleres.', 'Man kan både nævne en mulig fejl og en mulig reel forklaring, før man vælger at fjerne en værdi.'];
  return { id: taskId('F16', seed, variant, examType), familyId: 'F16', version: '1.0.0', seed, variant, examType, title: 'Undersøg målinger', story: 'To grupper har registreret antal minutter på en træningsøvelse. Dataene er opdigtede øvedata.', questions: [{ id: 'q1', prompt: prompts[variant], answerKind: 'reasoning' }], scene: { kind: 'data', axes: { x: axis('Måling', 1, 5, 1), y: axis('Minutter', 0, Math.max(outlier, core + 4) + 2, 1, 'min.') }, data, givens: { unit: 'minutter', description: 'Hver liste indeholder fem målinger.' } }, marking: { q1: { kind: 'review', criteria: ['Henviser til konkrete værdier eller et relevant mål i dataene.', 'Forklarer hvordan spredning, gennemsnit, median eller outlier understøtter konklusionen.', 'Skelner mellem en observation og en sikker forklaring.'], examples } } };
}

/** Fjerner bedømmelsesgrundlaget før opgaven gives til elevens almindelige scene. */
export function publicTask(task: Task): PublicTask {
  const { marking: _marking, ...visible } = task;
  return visible;
}

const parseNumber = (text: string): number | null => {
  const normalized = text.trim().replace(',', '.').replace(/\s*(kr\.?|besøg)\s*$/i, '');
  if (!/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(normalized)) return null;
  const value = Number(normalized); return Number.isFinite(value) ? value : null;
};
const samePoint = (a: Point, b: Point) => a.x === b.x && a.y === b.y;
const unique = (points: Point[]) => points.filter((p, i) => points.findIndex((other) => samePoint(p, other)) === i);
const contains = (points: Point[], point: Point) => points.some((p) => samePoint(p, point));
const triangleArea2 = (a: Point, b: Point, c: Point) => Math.abs((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x));
function isRectangle(points: Point[], area: number): boolean {
  if (points.length !== 4) return false;
  for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) for (let k = j + 1; k < 4; k++) {
    const l = 6 - i - j - k; const p = points[i]!; const q = points[j]!; const r = points[k]!; const s = points[l]!;
    const dot = (q.x - p.x) * (r.x - p.x) + (q.y - p.y) * (r.y - p.y);
    const parallelogram = q.x + r.x === p.x + s.x && q.y + r.y === p.y + s.y;
    if (dot === 0 && parallelogram && Math.abs((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x)) === area) return true;
  }
  return false;
}

/** Vurderer sikre tal- og geometriegenskaber lokalt; åbne begrundelser sendes aldrig til falsk automatisk scoring. */
export function assess(task: Task, questionId: string, answer: Answer): Assessment {
  const marking = task.marking[questionId];
  if (!marking) throw new Error(`Ukendt spørgsmål: ${questionId}`);
  if (marking.kind === 'review') return { status: 'needs-review', feedback: answer.text.trim() || answer.explanation?.trim() ? 'Din begrundelse gemmes til gennemgang ud fra kriterierne. Der gives ingen automatisk pointscore.' : 'Skriv en begrundelse, som kan gennemgås ud fra kriterierne.', criteria: marking.criteria, examples: marking.examples };
  if (marking.kind === 'numeric') {
    const value = parseNumber(answer.text);
    if (value === marking.expected) {
      if (marking.requiresExplanation && !answer.explanation?.trim()) return { status: 'partial', feedback: 'Tallet er korrekt, men opgaven beder også om en kort forklaring.', criteria: marking.criteria, examples: marking.examples };
      return { status: 'correct', feedback: 'Dit svar opfylder den kontrollerbare del af opgaven.', criteria: marking.criteria, examples: marking.examples };
    }
    return { status: 'incorrect', feedback: 'Tjek prisopstillingen og at antal besøg er hele tal.', criteria: marking.criteria, examples: marking.examples };
  }
  const points = unique((answer.points ?? []).map(([x, y]) => ({ x, y })));
  const geometry = marking.geometry!;
  let correct = false;
  if (geometry.variant === 0) correct = points.length === 4 && contains(points, geometry.base![0]) && contains(points, geometry.base![1]) && isRectangle(points, geometry.area!);
  if (geometry.variant === 1) correct = points.length === 3 && contains(points, geometry.base![0]) && contains(points, geometry.base![1]) && points.some((p) => triangleArea2(geometry.base![0], geometry.base![1], p) === 2 * geometry.area!);
  if (geometry.variant === 2) correct = points.length === 1 && samePoint(points[0]!, { x: geometry.source!.x + geometry.translation!.x, y: geometry.source!.y + geometry.translation!.y });
  return { status: correct ? 'correct' : 'incorrect', feedback: correct ? 'Konstruktionen opfylder de krævede egenskaber.' : 'Kontrollér punkterne og de geometriske egenskaber; der kan være flere gyldige konstruktioner.', criteria: marking.criteria, examples: marking.examples };
}
