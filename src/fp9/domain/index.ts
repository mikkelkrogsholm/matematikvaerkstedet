import { parseNumberAnswer, exactFractionMatches } from './number-answer';
import { generateAdditional } from './generators';
import { equivalent } from '../tools/math';
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
  if (!['with-aids','without-aids'].includes(profile.examType)) errors.push('Ukendt prøvetype.');
  if (typeof profile.aiEnabled !== 'boolean') errors.push('AI-status skal være sand eller falsk.');
  if (!['immediate','after-submit'].includes(profile.feedback)) errors.push('Ukendt feedbacktid.');
  if (profile.examType === 'with-aids' && profile.aids !== 'standard') errors.push('Med hjælpemidler kræver hjælpemiddelprofilen standard.');
  if (profile.examType === 'without-aids' && profile.aids !== 'none') errors.push('Uden hjælpemidler kræver hjælpemiddelprofilen none.');
  if (profile.timingMinutes !== null && (!Number.isFinite(profile.timingMinutes) || profile.timingMinutes <= 0 || !Number.isInteger(profile.timingMinutes))) errors.push('Tid skal være et positivt helt antal minutter eller null.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(profile.sourceDate)) errors.push('Kildedato skal have formatet ÅÅÅÅ-MM-DD.');
  if (!profile.sourceVersion.trim()) errors.push('Kildeversion må ikke være tom.');
  return errors;
}

export interface SourceNote {
  kind: 'official-information' | 'historical-observation' | 'product-design';
  version?: string;
  accessed?: string;
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
  assessmentTypes: ('numeric'|'expression'|'geometry'|'review')[];
  variants: {variant:0|1|2;version:string;examTypes:ExamType[];estimatedMinutes:number}[];
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
const implemented = new Set<FamilyId>(Object.keys(familyNames) as FamilyId[]);
const details: Record<FamilyId, Pick<Family, 'skills'|'prerequisites'|'action'|'answerForms'>> = {
 F01:{skills:['brøk, decimal og ækvivalens'],prerequisites:['de fire regningsarter'],action:'omskrive og beregne',answerForms:['number']}, F02:{skills:['procent og forhold'],prerequisites:['multiplikation og division'],action:'beregne og finde den oprindelige størrelse',answerForms:['number']}, F03:{skills:['potenser, rødder og tierpotenser'],prerequisites:['pladsværdi'],action:'beregne, overslagsregne og sammenligne',answerForms:['number']}, F04:{skills:['ligninger, uligheder og systemer'],prerequisites:['regning med negative tal'],action:'opstille og løse',answerForms:['number']}, F05:{skills:['polynomier og algebraisk omskrivning'],prerequisites:['distributiv lov'],action:'forenkle og kontrollere',answerForms:['expression','reasoning']}, F06:{skills:['lineære prisfunktioner','diskrete antal','sammenligning'],prerequisites:['multiplikation','ligninger'],action:'modellere, sammenligne og begrunde',answerForms:['number','expression']}, F07:{skills:['procentvis og kvadratisk vækst'],prerequisites:['potenser'],action:'modellere og sammenligne',answerForms:['number','reasoning']}, F08:{skills:['fart og enhedsomregning'],prerequisites:['division','enheder'],action:'beregne og omregne',answerForms:['number']}, F09:{skills:['vinkelsum og parallelle linjer'],prerequisites:['grader'],action:'bestemme og begrunde',answerForms:['number','reasoning']}, F10:{skills:['målestok og ligedannethed'],prerequisites:['forhold','areal'],action:'skalere og beregne',answerForms:['number']}, F11:{skills:['omkreds, areal og rumfang'],prerequisites:['multiplikation','enheder'],action:'beregne og isolere størrelse',answerForms:['number']}, F12:{skills:['Pythagoras'],prerequisites:['kvadratrødder'],action:'beregne og begrunde',answerForms:['number','reasoning']}, F13:{skills:['koordinater','konstruktion','flytning'],prerequisites:['koordinatplan','areal'],action:'konstruere og kontrollere egenskaber',answerForms:['geometry']}, F14:{skills:['spejling, rotation og translation'],prerequisites:['koordinatplan'],action:'flytte punkter efter regel',answerForms:['geometry']}, F15:{skills:['gennemsnit, median og andele'],prerequisites:['sortering','procent'],action:'beregne og aflæse',answerForms:['number']}, F16:{skills:['datasammenligning','gennemsnit','median','outlier'],prerequisites:['læse tabeller','gennemsnit'],action:'undersøge data og begrunde valg',answerForms:['reasoning']}, F17:{skills:['sandsynlighed og komplement'],prerequisites:['brøker'],action:'beregne og finde antal',answerForms:['number']}, F18:{skills:['uafhængige og afhængige hændelser'],prerequisites:['brøker','sandsynlighed'],action:'beregne og vurdere simulation',answerForms:['number','reasoning']},
};

/** Dækningsregister: historiske eksempler er observationer, mens familien er et produktvalg. */
export const families: readonly Family[] = (Object.keys(familyNames) as FamilyId[]).map((id) => ({
  id,
  title: familyNames[id],
  skills: details[id].skills, prerequisites: details[id].prerequisites, action: details[id].action,
  examTypes: ['with-aids', 'without-aids'],
  answerForms: details[id].answerForms,
  assessmentTypes: details[id].answerForms.map(form=>form==='reasoning'?'review':form==='number'?'numeric':form),
  variants: ([0,1,2] as const).map(variant=>({variant,version:id==='F06'||id==='F13'?'1.0.0':id==='F14'?'1.1.0':'2.0.0',examTypes:['with-aids','without-aids'],estimatedMinutes:details[id].answerForms.includes('reasoning')?5:3})),
  sources: [
    {kind:'official-information' as const,reference:'UVM-CURRICULUM; UVM-STATUS',version:'2024, med statusforbehold i sources.json',accessed:'2026-09-09',note:'Officielt fagligt baggrundsgrundlag. Familien og variantfordelingen er produktvalg, ikke en officiel opgaveplan.'},
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
  categories?: string[];
  axes: { x: Axis; y: Axis };
  data: Array<{ label: string; values: number[] }>;
  givens: { unit: string; description: string };
}
export interface TextScene { kind: 'text'; axes: { x: Axis; y: Axis }; givens: { heading: string; lines: string[]; note?: string }; }
export interface ShapeScene { kind:'shape'; axes:{x:Axis;y:Axis}; givens:{points:{id:string;x:number;y:number}[];edges:[string,string][];labels:{x:number;y:number;text:string}[];caption:string}; }
export type Scene = PriceScene | GridScene | DataScene | TextScene | ShapeScene;
export interface Question { id: string; prompt: string; answerKind: AnswerKind; unit?: string; format?: 'fraction'|'scientific'|'decimal'|'integer'; }
export interface Marking {
  kind: 'numeric' | 'geometry' | 'review' | 'expression';
  criteria: string[];
  examples: string[];
  requiresExplanation?: boolean;
  expected?: number;
  tolerance?: number;
  unit?: string;
  integer?: boolean;
  fraction?: boolean;
  rational?: {numerator:number;denominator:number};
  scientific?: boolean;
  expression?: string;
  expanded?: boolean;
  format?: 'decimal';
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
  facts?: string[];
  questions: Question[];
  scene: Scene;
  marking: Record<string, Marking>;
  examType: ExamType;
  allowedExamTypes?: ExamType[];
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

/** Genererer én selvstændigt besvarbar delopgave. Varianten ændrer ukendt eller repræsentation. */
export function generateTask(familyId: FamilyId, seed: number, variant: number, examType: ExamType): Task {
  checkInputs(seed, variant);
  if(!['with-aids','without-aids'].includes(examType))throw Error('Ukendt prøvetype.');
  if (familyId === 'F06') return generatePrice(seed, variant, examType);
  if (familyId === 'F13') return generateGrid(seed, variant, examType);
  if (familyId === 'F16') return generateData(seed, variant, examType);
  if (familyId === 'F14') return generateTransform(seed, variant, examType);
  return generateAdditional(familyId, seed, variant, examType);
}

function generatePrice(seed: number, variant: 0 | 1 | 2, examType: ExamType): Task {
  const a = integer(seed, 1, 20, 40); const b = integer(seed, 2, 8, 18); const crossing = integer(seed, 3, 4, 10);
  const fixedB = crossing * (a - b); const count = integer(seed, 4, 2, 12); const scene: PriceScene = { kind: 'price', axes: { x: axis('Antal besøg', 0, Math.max(16, crossing + 4), 1), y: axis('Pris', 0, Math.max(a * 16, fixedB + b * 16) + 20, 20, 'kr.') }, givens: { offerA: { fixed: 0, perUnit: a }, offerB: { fixed: fixedB, perUnit: b }, unit: 'besøg', discrete: true } };
  const qid = 'q1';
  const q = variant === 0 ? { id: qid, answerKind: 'number' as const, unit: 'kr.', prompt: `Hvad koster tilbud A ved ${count} besøg?` } : variant === 1 ? { id: qid, answerKind: 'number' as const, unit: 'besøg', prompt: `Du har højst ${fixedB + b * count} kr. Hvor mange hele besøg kan du højst købe med tilbud B?` } : { id: qid, answerKind: 'number' as const, unit: 'besøg', prompt: 'Ved hvor mange hele besøg er tilbuddene lige dyre? Skriv også kort, hvordan du finder det.' };
  const expected = variant === 0 ? a * count : variant === 1 ? count : crossing;
  return { id: taskId('F06', seed, variant, examType), familyId: 'F06', version: '1.0.0', seed, variant, examType, allowedExamTypes: ['with-aids','without-aids'], title: 'Vælg et tilbud', story: `To steder tilbyder klippekort. A koster ${a} kr. pr. besøg. B koster ${fixedB} kr. i startbetaling og ${b} kr. pr. besøg. Antal besøg er hele tal.`, questions: [q], scene, marking: { [qid]: { kind: 'numeric', expected, requiresExplanation: variant === 2, criteria: variant === 2 ? ['Sætter priserne lige store eller forklarer samme idé.', 'Angiver et helt antal besøg.'] : ['Bruger den relevante prisfunktion.', 'Respekterer at antal besøg er helt.'], examples: variant === 2 ? [`${a}·n = ${fixedB} + ${b}·n, så n = ${crossing}.`, `Ved ${crossing} besøg er begge priser ${a * crossing} kr.`] : [`Det korrekte tal er ${expected}.`] } } };
}

function generateGrid(seed: number, variant: 0 | 1 | 2, examType: ExamType): Task {
  const x = integer(seed, 1, -4, 1); const y = integer(seed, 2, -3, 3); const width = integer(seed, 3, 3, 6); const height = integer(seed, 4, 2, 5); const qid = 'q1';
  const baseA = { x, y }; const baseB = { x: x + width, y };
  const scene: GridScene = { kind: 'grid', axes: { x: axis('x', -10, 10, 1), y: axis('y', -10, 10, 1) }, givens: { points: variant === 2 ? [{ id: 'P', point: baseA }] : [{ id: 'A', point: baseA }, { id: 'B', point: baseB }], instruction: variant === 0 ? `Tegn et rektangel med AB som side og areal ${width * height}.` : variant === 1 ? `Tegn en trekant med grundlinjen AB og areal ${width * height / 2}.` : `Flyt P med vektoren (${width}, ${height}).` } };
  const prompt = variant === 0 ? 'Indtegn rektanglets fire hjørner. Rækkefølgen er ligegyldig.' : variant === 1 ? 'Indtegn A, B og et tredje hjørne til en trekant med det angivne areal.' : 'Indtegn det flyttede punkt P\'.';
  const geometry = variant === 0 ? { variant, base: [baseA, baseB] as [Point, Point], area: width * height } : variant === 1 ? { variant, base: [baseA, baseB] as [Point, Point], area: width * height / 2 } : { variant, source: baseA, translation: { x: width, y: height } };
  return { id: taskId('F13', seed, variant, examType), familyId: 'F13', version: '1.0.0', seed, variant, examType, allowedExamTypes: ['with-aids','without-aids'], title: 'Konstruktion på koordinatplan', story: 'Brug koordinatgitteret. Der findes flere gyldige konstruktioner i de to første opgaver.', questions: [{ id: qid, prompt, answerKind: 'geometry' }], scene, marking: { [qid]: { kind: 'geometry', geometry, criteria: variant === 0 ? ['Har A og B som hjørner.', 'Danner et rektangel med areal som angivet.'] : variant === 1 ? ['Har A og B som grundlinje.', 'Det tredje hjørne giver det angivne areal.'] : ['Flytter både x- og y-koordinat med den givne vektor.'], examples: variant === 0 ? ['Rektanglet kan ligge over eller under AB.', 'Hjørnerne kan angives i vilkårlig rækkefølge.'] : variant === 1 ? ['Det tredje hjørne kan ligge på flere lodrette linjer.', 'Trekanten kan ligge på begge sider af AB.'] : [`P' = (${baseA.x + width}, ${baseA.y + height}).`, 'Læg vektorens x-led til x og y-led til y.'] } } };
}

function generateTransform(seed:number,variant:0|1|2,examType:ExamType):Task {
 const p={x:integer(seed,1,-5,4),y:integer(seed,2,-4,5)}, dx=integer(seed,3,1,4),dy=integer(seed,4,-3,3); const qid='q1';
 const target=variant===0?{x:-p.x,y:p.y}:variant===1?{x:-p.y,y:p.x}:{x:p.x+dx,y:p.y+dy};
 const instruction=variant===0?'Spejl punktet P i y-aksen.':variant===1?'Drej punktet P 90° mod uret om (0,0).':`Flyt punktet P med vektoren (${dx}, ${dy}).`;
 return {id:taskId('F14',seed,variant,examType),familyId:'F14',version:'1.1.0',seed,variant,examType,allowedExamTypes:['with-aids','without-aids'],title:'Flytning i koordinatplan',story:'Brug koordinaterne; punktsættet vurderes efter den geometriske regel, ikke efter et billede.',questions:[{id:qid,prompt:'Indtegn billedpunktet P\'.',answerKind:'geometry'}],scene:{kind:'grid',axes:{x:axis('x',-10,10,1),y:axis('y',-10,10,1)},givens:{points:[{id:'P',point:p}],instruction}},marking:{[qid]:{kind:'geometry',geometry:{variant:2,source:p,translation:{x:target.x-p.x,y:target.y-p.y}},criteria:[instruction,'Angiver præcis ét billedpunkt.'],examples:[`P' = (${target.x}, ${target.y}).`]}}};
}

function generateData(seed:number,variant:0|1|2,examType:ExamType):Task {
  const core=integer(seed,1,8,14),spread=integer(seed,2,2,4),outlier=core+integer(seed,3,12,20);
  const a=[core-spread,core,core,core+spread,core],b=[core-1,core-1,core,core+1,core+1],withOutlier=[...b.slice(0,4),outlier];
  const data=variant===0?[{label:'Hold A',values:a},{label:'Hold B',values:b}]:variant===1?[{label:'Hold A',values:a},{label:'Hold B',values:withOutlier}]:[{label:'Oprindelige målinger',values:b},{label:'Med ændret sidste måling',values:withOutlier}];
  const average=(values:number[])=>values.reduce((sum,n)=>sum+n,0)/values.length;
  const questions=[
    'Hvilket hold har de mest stabile tider? Begrund med konkrete værdier eller et relevant mål for spredningen.',
    'Klubben vil beskrive en typisk tid på hvert hold. Vil du bruge gennemsnit eller median her? Begrund dit valg og forklar, hvad den usædvanligt lange tid betyder.',
    'Den sidste måling er ændret til en usædvanligt høj værdi. Bør den undersøges, før klubben konkluderer? Forklar med data og mindst én mulig årsag.',
  ];
  const examples=variant===0?[
    `Hold B har variationsbredde 2 minutter, mens hold A har ${spread*2}. B varierer derfor mindst.`,
    `Begge hold har midte ${core} minutter. B ligger højst 1 minut fra midten, mens A når ${spread} minutter væk. Det understøtter, at B er mest stabilt.`,
  ]:variant===1?[
    `Medianen er ${core} minutter for begge hold. Den er et muligt mål for den typiske tid, fordi den ikke trækkes op af værdien ${outlier}.`,
    `Hold B har gennemsnit ${average(withOutlier).toLocaleString('da-DK')} minutter mod ${core} på A. Gennemsnittet er relevant, hvis alle tidsforbrug skal tælle med, men den lange tid skal omtales; det er ikke samme spørgsmål som den typiske deltagers tid.`,
  ]:[
    `Den sidste tid ændres fra ${core+1} til ${outlier}. Gennemsnittet stiger fra ${core} til ${average(withOutlier).toLocaleString('da-DK')} minutter. En indtastningsfejl bør undersøges.`,
    `Tiden ${outlier} kan også være reel, fx hvis nogen blev afbrudt. Man bør kontrollere årsagen frem for automatisk at slette målingen.`,
  ];
  return {id:`fp9-f16-v2-${examType}-${seed}-${variant}`,familyId:'F16',version:'2.0.0',seed,variant,examType,allowedExamTypes:['with-aids','without-aids'],title:'Undersøg målinger',story:'En klub har registreret tider på en træningsøvelse. Alle data er opdigtede øvedata.',questions:[{id:'q1',prompt:questions[variant]!,answerKind:'reasoning'}],scene:{kind:'data',axes:{x:axis('Måling',1,5,1),y:axis('Minutter',0,Math.max(...data.flatMap(d=>d.values))+2,1,'min.')},data,givens:{unit:'minutter',description:'Hver række indeholder fem målinger.'}},marking:{q1:{kind:'review',criteria:['Henviser til konkrete værdier eller et relevant mål i dataene.','Forklarer, hvordan beregningen eller observationen understøtter konklusionen.','Skelner mellem en observation og en sikker forklaring.'],examples}}};
}

/** Fjerner bedømmelsesgrundlaget før opgaven gives til elevens almindelige scene. */
export function publicTask(task: Task): PublicTask {
  const { marking: _marking, ...visible } = task;
  return visible;
}

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
  if (marking.kind === 'expression') {
    // Parseren er begrænset og ren; ingen eval eller punktprøver bruges.
    const correct=!!marking.expression&&(!marking.expanded||!/[()]/.test(answer.text))&&equivalent(answer.text,marking.expression);
    return {status:correct?'correct':'incorrect',feedback:correct?'Udtrykket er algebraisk ækvivalent.':'Udtrykket kunne ikke bekræftes. Brug tal, x, parenteser og + − * / ^ inden for værktøjets grænser.',criteria:marking.criteria,examples:marking.examples};
  }
  if (marking.kind === 'numeric') {
    const value = parseNumberAnswer(answer.text, {...marking,unit:marking.unit??task.questions.find(q=>q.id===questionId)?.unit});
    if (value !== null && (marking.rational?exactFractionMatches(answer.text,marking.rational):Math.abs(value - marking.expected!) <= (marking.tolerance ?? 1e-10)) && (!marking.integer || Number.isInteger(value))) {
      if (marking.requiresExplanation && !answer.explanation?.trim()) return { status: 'partial', feedback: 'Tallet er korrekt, men opgaven beder også om en kort forklaring.', criteria: marking.criteria, examples: marking.examples };
      if (marking.requiresExplanation) return { status: 'needs-review', feedback: 'Tallet er korrekt. Din begrundelse skal gennemgås ud fra kriterierne.', criteria: marking.criteria, examples: marking.examples };
      return { status: 'correct', feedback: 'Dit svar opfylder den kontrollerbare del af opgaven.', criteria: marking.criteria, examples: marking.examples };
    }
    return { status: 'incorrect', feedback: 'Kontrollér beregningen, enheden og det svarformat, opgaven beder om.', criteria: marking.criteria, examples: marking.examples };
  }
  if (!(answer.points ?? []).every(p => p.length === 2 && p.every(v => Number.isFinite(v) && v >= -10 && v <= 10))) return { status: 'incorrect', feedback: 'Punkterne skal ligge i det viste koordinatgitter.', criteria: marking.criteria, examples: marking.examples };
  const points = unique((answer.points ?? []).map(([x, y]) => ({ x, y })));
  const geometry = marking.geometry!;
  let correct = false;
  if (geometry.variant === 0) correct = points.length === 4 && contains(points, geometry.base![0]) && contains(points, geometry.base![1]) && isRectangle(points, geometry.area!) && points.every(p => p.x === geometry.base![0].x || p.x === geometry.base![1].x);
  if (geometry.variant === 1) correct = points.length === 3 && contains(points, geometry.base![0]) && contains(points, geometry.base![1]) && points.some((p) => triangleArea2(geometry.base![0], geometry.base![1], p) === 2 * geometry.area!);
  if (geometry.variant === 2) correct = points.length === 1 && samePoint(points[0]!, { x: geometry.source!.x + geometry.translation!.x, y: geometry.source!.y + geometry.translation!.y });
  return { status: correct ? 'correct' : 'incorrect', feedback: correct ? 'Konstruktionen opfylder de krævede egenskaber.' : 'Kontrollér punkterne og de geometriske egenskaber; der kan være flere gyldige konstruktioner.', criteria: marking.criteria, examples: marking.examples };
}
