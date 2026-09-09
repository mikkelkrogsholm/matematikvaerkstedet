/**
 * A renderer-independent scene transaction boundary.  The AI may only write
 * its explicit explanation layer; task givens and the student's layer stay
 * outside of its authority.
 */

export type ObjectId = string;
export type Source = "student" | "ai";

export type PointObject = Readonly<{
  kind: "point";
  id: ObjectId;
  source: "ai";
  x: number;
  y: number;
  visible: boolean;
  text?: string;
}>;
export type LineObject = Readonly<{
  kind: "line";
  id: ObjectId;
  source: "ai";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  visible: boolean;
  text?: string;
}>;
export type LabelObject = Readonly<{
  kind: "label";
  id: ObjectId;
  source: "ai";
  x: number;
  y: number;
  text: string;
  visible: boolean;
}>;
export type HighlightObject = Readonly<{
  kind: "highlight";
  id: ObjectId;
  source: "ai";
  targetIds: readonly ObjectId[];
  text?: string;
  visible: boolean;
}>;
export type ExplanationObject = PointObject | LineObject | LabelObject | HighlightObject;

/** A domain renderer may keep additional data in a student object. */
export type StudentObject = Readonly<{
  id: ObjectId;
  source: "student";
  kind: string;
  visible?: boolean;
  [key: string]: unknown;
}>;

export type Viewport = Readonly<{ xMin: number; xMax: number; yMin: number; yMax: number }>;
export type Selection = readonly ObjectId[];

export type SceneAction = Readonly<{
  actionId: string;
  kind: "agent" | "student" | "policy" | "render" | "animation";
  revision: number;
  policyRevision: number;
  outcome: "applied" | "rejected" | "failed" | "confirmed" | "cancelled";
}>;

export type PendingRender = Readonly<{ token: string; actionId: string; revision: number; policyRevision: number }>;
export type RenderAcknowledgment = Readonly<{ token: string; revision: number }>;
export type RenderRecord = Readonly<{
  token: string;
  actionId: string;
  revision: number;
  status: "confirmed" | "failed";
}>;

export type SceneCommand = Readonly<{
  attemptId: string;
  sceneId: string;
  expectedRevision: number;
  policyRevision: number;
  actionId: string;
  operations: readonly SceneOperation[];
}>;

export type AddObjectOperation = Readonly<{ type: "addObject"; object: ExplanationObject }>;
export type MoveObjectOperation = Readonly<{
  type: "moveObject";
  objectId: ObjectId;
  position: Readonly<{ x: number; y: number }> | Readonly<{ x1: number; y1: number; x2: number; y2: number }>;
}>;
export type HighlightOperation = Readonly<{ type: "highlight"; object: HighlightObject }>;
export type RemoveExplanationObjectOperation = Readonly<{ type: "removeExplanationObject"; objectId: ObjectId }>;
export type SetVisibleOperation = Readonly<{ type: "setVisible"; objectId: ObjectId; visible: boolean }>;
export type SetViewportOperation = Readonly<{ type: "setViewport"; viewport: Viewport }>;
export type SceneOperation =
  | AddObjectOperation
  | MoveObjectOperation
  | HighlightOperation
  | RemoveExplanationObjectOperation
  | SetVisibleOperation
  | SetViewportOperation;

export type AnimationStep = Readonly<{ stepId: string; command: SceneCommand }>;
export type QueuedAnimation = Readonly<{ animationId: string; steps: readonly AnimationStep[] }>;

export type SceneState<G = unknown> = Readonly<{
  attemptId: string;
  sceneId: string;
  revision: number;
  policyRevision: number;
  aiEnabled: boolean;
  givens: Readonly<G>;
  studentObjects: readonly StudentObject[];
  explanationObjects: readonly ExplanationObject[];
  selection: Selection;
  viewport: Viewport | null;
  recentActions: readonly SceneAction[];
  pendingRender: PendingRender | null;
  renderRecords: readonly RenderRecord[];
  animation: QueuedAnimation | null;
  /** Internal replay ledger, intentionally data-only so states can be persisted. */
  actionLedger: readonly Readonly<{
    actionId: string;
    fingerprint: string;
    undone?: boolean;
    beforeExplanationObjects: readonly ExplanationObject[];
    beforeViewport: Viewport | null;
  }> [];
}>;

export type CommandResult<G = unknown> = Readonly<{
  status: "applied" | "rejected" | "stale";
  state: SceneState<G>;
  reason?: string;
  replayed?: boolean;
  pendingRender?: PendingRender;
}>;
export type RenderResult<G = unknown> = Readonly<{
  status: "confirmed" | "failed" | "rejected";
  state: SceneState<G>;
  reason?: string;
}>;

export type StudentUpdate = Readonly<{ objects?: readonly StudentObject[]; selection?: Selection }>;

const MAX_ID = 120;
const MAX_TEXT = 2_000;
const MAX_OBJECTS = 500;
const MAX_ACTIONS = 100;
const MAX_LEDGER = 500;

export function createScene<G>(attemptId: string, sceneId: string, givens: G): SceneState<G> {
  requireId(attemptId, "attemptId");
  requireId(sceneId, "sceneId");
  const copiedGivens = cloneSerializable(givens, "givens") as G;
  return freeze({
    attemptId,
    sceneId,
    revision: 0,
    policyRevision: 0,
    aiEnabled: false,
    givens: copiedGivens,
    studentObjects: [],
    explanationObjects: [],
    selection: [],
    viewport: null,
    recentActions: [],
    pendingRender: null,
    renderRecords: [],
    animation: null,
    actionLedger: [],
  });
}

/** Changing the policy invalidates pending agent work and any queued animation. */
export function setAiEnabled<G>(state: SceneState<G>, aiEnabled: boolean): SceneState<G> {
  if (typeof aiEnabled !== "boolean") throw new Error("aiEnabled must be boolean");
  if (state.aiEnabled === aiEnabled) return state;
  return next(state, {
    aiEnabled,
    policyRevision: state.policyRevision + 1,
    pendingRender: null,
    animation: null,
  }, "policy", state.animation ? "cancelled" : "applied");
}

/** Student updates never alter givens or explanation objects, and cancel animation. */
export function updateStudent<G>(state: SceneState<G>, update: StudentUpdate): SceneState<G> {
  if (!isPlainObject(update)) throw new Error("student update must be an object");
  const objects = update.objects === undefined ? state.studentObjects : validateStudentObjects(update.objects);
  if (objects.some(object => state.explanationObjects.some(ai => ai.id === object.id))) throw new Error("student object id overlaps explanation object");
  const selection = update.selection === undefined ? state.selection : validateSelection(update.selection, objects, state.explanationObjects);
  return next(state, { studentObjects: objects, selection, pendingRender: null, animation: null }, "student", state.animation ? "cancelled" : "applied");
}

/** Validate and atomically apply a server-approved agent command. */
export function applyCommand<G>(state: SceneState<G>, command: SceneCommand): CommandResult<G> {
  const basicError = validateCommandEnvelope(command);
  if (basicError) return rejected(state, basicError);
  if (command.attemptId !== state.attemptId || command.sceneId !== state.sceneId) return rejected(state, "command targets another attempt or scene");
  if (!state.aiEnabled) return rejected(state, "AI is disabled by policy");
  if (command.policyRevision !== state.policyRevision) return stale(state, "policy revision is stale");
  const fingerprint = stableStringify(command);
  const prior = state.actionLedger.find((entry) => entry.actionId === command.actionId);
  if (prior) {
    return prior.fingerprint === fingerprint
      ? { status: "applied", state, replayed: true, pendingRender: state.pendingRender ?? undefined }
      : rejected(state, "actionId was already used with different content");
  }
  if (command.attemptId !== state.attemptId || command.sceneId !== state.sceneId) return rejected(state, "command targets another attempt or scene");
  if (!state.aiEnabled) return rejected(state, "AI is disabled by policy");
  if (command.policyRevision !== state.policyRevision) return stale(state, "policy revision is stale");
  if (command.expectedRevision !== state.revision) return stale(state, "scene revision is stale");
  if (state.pendingRender) return rejected(state, "a prior agent action awaits render acknowledgment");
  if (state.actionLedger.length >= MAX_LEDGER) return rejected(state, "scene action limit reached");

  let applied: Pick<SceneState<G>, "explanationObjects" | "viewport" | "selection"> | string;
  try {
    applied = applyOperations(state, command.operations);
  } catch (error) {
    return rejected(state, errorMessage(error));
  }
  if (typeof applied === "string") return rejected(state, applied);
  const revision = state.revision + 1;
  const pendingRender: PendingRender = freeze({
    token: `render:${state.attemptId}:${command.actionId}:${revision}`,
    actionId: command.actionId,
    revision,
    policyRevision: state.policyRevision,
  });
  const nextState = next(state, {
    ...applied,
    pendingRender,
    actionLedger: bounded([...state.actionLedger, {
      actionId: command.actionId,
      fingerprint,
      beforeExplanationObjects: state.explanationObjects,
      beforeViewport: state.viewport,
    }], MAX_LEDGER),
  }, "agent", "applied", command.actionId);
  return { status: "applied", state: nextState, pendingRender };
}

/** Confirm the exact rendered revision.  A later UI change deliberately makes this late. */
export function acknowledgeRender<G>(state: SceneState<G>, acknowledgment: RenderAcknowledgment): RenderResult<G> {
  const pending = matchingPending(state, acknowledgment);
  if (typeof pending === "string") return { status: "rejected", state, reason: pending };
  return {
    status: "confirmed",
    state: next(state, {
      pendingRender: null,
      renderRecords: bounded([...state.renderRecords, { ...pending, status: "confirmed" }], MAX_ACTIONS),
    }, "render", "confirmed"),
  };
}

/** Report a render failure explicitly; it is not treated as a displayed success. */
export function reportRenderFailure<G>(state: SceneState<G>, acknowledgment: RenderAcknowledgment): RenderResult<G> {
  const pending = matchingPending(state, acknowledgment);
  if (typeof pending === "string") return { status: "rejected", state, reason: pending };
  return {
    status: "failed",
    state: next(state, {
      pendingRender: null,
      renderRecords: bounded([...state.renderRecords, { ...pending, status: "failed" }], MAX_ACTIONS),
    }, "render", "failed"),
  };
}

/** Safe gate for chat/UI wording such as "I have moved the point". */
export function isRenderConfirmed<G>(state: SceneState<G>, acknowledgment: RenderAcknowledgment): boolean {
  return state.renderRecords.some((record) => record.token === acknowledgment.token && record.revision === acknowledgment.revision && record.status === "confirmed");
}

/** Undo the latest confirmed/applied AI action without touching student objects. */
export function undoAgentAction<G>(state: SceneState<G>, actionId: string): CommandResult<G> {
  requireId(actionId, "actionId");
  if (state.pendingRender) return rejected(state, "cannot undo while render acknowledgment is pending");
  const latest = state.actionLedger.findLast(entry => !entry.undone);
  if (!latest || latest.actionId !== actionId) return rejected(state, "only the latest agent action can be undone");
  return {
    status: "applied",
    state: next(state, {
      explanationObjects: latest.beforeExplanationObjects,
      viewport: latest.beforeViewport,
      selection: state.selection.filter((id) => state.studentObjects.some((object) => object.id === id) || latest.beforeExplanationObjects.some((object) => object.id === id)),
      actionLedger: state.actionLedger.map(entry => entry.actionId === actionId ? { ...entry, undone: true } : entry),
      animation: null,
    }, "agent", "applied", `undo:${actionId}`),
  };
}

/**
 * Queue validated command steps. Each step retains its own expected revisions;
 * advancing after any intervening change therefore rejects it as stale.
 */
export function queueAnimation<G>(state: SceneState<G>, animationId: string, steps: readonly AnimationStep[]): CommandResult<G> {
  try {
    requireId(animationId, "animationId");
    if (!state.aiEnabled) return rejected(state, "AI is disabled by policy");
    if (steps.length === 0) return rejected(state, "animation needs at least one step");
    if (state.animation) return rejected(state, "an animation is already queued");
    for (const step of steps) {
      requireId(step.stepId, "stepId");
      const error = validateCommandEnvelope(step.command);
      if (error) return rejected(state, `invalid animation step: ${error}`);
      if (step.command.attemptId !== state.attemptId || step.command.sceneId !== state.sceneId) return rejected(state, "animation targets another attempt or scene");
    }
    return { status: "applied", state: next(state, { animation: { animationId, steps: cloneSerializable(steps, "animation steps") as AnimationStep[] } }, "animation", "applied") };
  } catch (error) {
    return rejected(state, errorMessage(error));
  }
}

export function advanceAnimation<G>(state: SceneState<G>): CommandResult<G> {
  const animation = state.animation;
  if (!animation) return rejected(state, "no animation is queued");
  if (!state.aiEnabled) return rejected(state, "AI is disabled by policy");
  const step = animation.steps[0];
  if (!step) return rejected(state, "animation has no next step");
  const result = applyCommand(state, step.command);
  if (result.status !== "applied" || result.replayed) return result;
  const remaining = animation.steps.slice(1);
  return {
    ...result,
    state: freeze({ ...result.state, animation: remaining.length ? { animationId: animation.animationId, steps: remaining } : null }),
  };
}

export function cancelAnimation<G>(state: SceneState<G>): SceneState<G> {
  return state.animation ? next(state, { animation: null }, "animation", "cancelled") : state;
}

/** Small snapshot for servers/models; it intentionally omits mutable bookkeeping. */
export function sceneSnapshot<G>(state: SceneState<G>): Readonly<Pick<SceneState<G>, "attemptId" | "sceneId" | "revision" | "policyRevision" | "aiEnabled" | "givens" | "studentObjects" | "explanationObjects" | "selection" | "viewport" | "recentActions">> {
  const { actionLedger: _ledger, pendingRender: _pending, renderRecords: _records, animation: _animation, ...snapshot } = state;
  return freeze(snapshot);
}

function applyOperations<G>(state: SceneState<G>, operations: readonly SceneOperation[]): Pick<SceneState<G>, "explanationObjects" | "viewport" | "selection"> | string {
  if (!Array.isArray(operations) || operations.length === 0 || operations.length > MAX_OBJECTS) return "operations must contain 1 to 500 items";
  let objects = [...state.explanationObjects];
  let viewport = state.viewport;
  for (const operation of operations) {
    if (!isPlainObject(operation) || typeof operation.type !== "string") return "unknown scene operation";
    const typed = operation as SceneOperation;
    switch (typed.type) {
      case "addObject": {
        const error = validateExplanationObject(typed.object);
        if (error) return error;
        if (objects.some((object) => object.id === typed.object.id) || state.studentObjects.some((object) => object.id === typed.object.id)) return "object id already exists";
        objects.push(cloneSerializable(typed.object, "explanation object") as ExplanationObject);
        break;
      }
      case "highlight": {
        const error = validateExplanationObject(typed.object);
        if (error || typed.object.kind !== "highlight") return error ?? "highlight requires a highlight object";
        if (objects.some((object) => object.id === typed.object.id) || state.studentObjects.some((object) => object.id === typed.object.id)) return "object id already exists";
        if (!typed.object.targetIds.every((id) => objects.some((object) => object.id === id) || state.studentObjects.some((object) => object.id === id))) return "highlight targets an unknown object";
        objects.push(cloneSerializable(typed.object, "highlight object") as HighlightObject);
        break;
      }
      case "moveObject": {
        requireId(typed.objectId, "objectId");
        const index = objects.findIndex((object) => object.id === typed.objectId);
        if (index < 0) return "AI may only move its own explanation objects";
        const existing = objects[index]!;
        const moved = moveObject(existing, typed.position);
        if (typeof moved === "string") return moved;
        objects[index] = moved;
        break;
      }
      case "removeExplanationObject": {
        requireId(typed.objectId, "objectId");
        if (!objects.some((object) => object.id === typed.objectId)) return "AI may only remove its own explanation objects";
        objects = objects.filter((object) => object.id !== typed.objectId);
        break;
      }
      case "setVisible": {
        requireId(typed.objectId, "objectId");
        if (typeof typed.visible !== "boolean") return "visible must be boolean";
        const index = objects.findIndex((object) => object.id === typed.objectId);
        if (index < 0) return "AI may only change visibility of its own explanation objects";
        objects[index] = { ...objects[index]!, visible: typed.visible } as ExplanationObject;
        break;
      }
      case "setViewport": {
        const error = validateViewport(typed.viewport);
        if (error) return error;
        viewport = cloneSerializable(typed.viewport, "viewport") as Viewport;
        break;
      }
      default:
        return "unknown scene operation";
    }
  }
  if (objects.length > MAX_OBJECTS) return "too many explanation objects";
  if (objects.some(object => object.kind === "highlight" && !object.targetIds.every(id => objects.some(target => target.id === id && target.kind !== "highlight") || state.studentObjects.some(target => target.id === id)))) return "highlight targets an unknown object";
  const knownIds = new Set([...state.studentObjects, ...objects].map((object) => object.id));
  return { explanationObjects: objects, viewport, selection: state.selection.filter((id) => knownIds.has(id)) };
}

function moveObject(object: ExplanationObject, position: MoveObjectOperation["position"]): ExplanationObject | string {
  if (!isPlainObject(position)) return "position must be an object";
  const coordinates = position as Record<string, unknown>;
  if (object.kind === "line") {
    if (!hasFinite(coordinates, "x1") || !hasFinite(coordinates, "y1") || !hasFinite(coordinates, "x2") || !hasFinite(coordinates, "y2")) return "line position requires finite x1, y1, x2, y2";
    return { ...object, x1: coordinates.x1 as number, y1: coordinates.y1 as number, x2: coordinates.x2 as number, y2: coordinates.y2 as number };
  }
  if (object.kind === "highlight") return "highlight objects cannot be moved";
  if (!hasFinite(coordinates, "x") || !hasFinite(coordinates, "y")) return "position requires finite x and y";
  return { ...object, x: coordinates.x as number, y: coordinates.y as number } as PointObject | LabelObject;
}

function validateCommandEnvelope(command: unknown): string | undefined {
  if (!isPlainObject(command)) return "command must be an object";
  const record = command as Record<string, unknown>;
  try {
    requireId(record.attemptId, "attemptId"); requireId(record.sceneId, "sceneId"); requireId(record.actionId, "actionId");
    if (!Number.isSafeInteger(record.expectedRevision) || (record.expectedRevision as number) < 0) return "expectedRevision must be a non-negative integer";
    if (!Number.isSafeInteger(record.policyRevision) || (record.policyRevision as number) < 0) return "policyRevision must be a non-negative integer";
    if (!Array.isArray(record.operations)) return "operations must be an array";
  } catch (error) { return errorMessage(error); }
  return undefined;
}

function validateExplanationObject(object: unknown): string | undefined {
  if (!isPlainObject(object)) return "explanation object must be an object";
  try {
    requireId(object.id, "object id");
    if (object.source !== "ai") return "explanation object source must be ai";
    if (typeof object.visible !== "boolean") return "explanation object visible must be boolean";
    if (object.text !== undefined) requireText(object.text, "object text");
    switch (object.kind) {
      case "point": case "label":
        if (!hasFinite(object, "x") || !hasFinite(object, "y")) return "point or label requires finite x and y";
        if (object.kind === "label" && typeof object.text !== "string") return "label requires text";
        break;
      case "line":
        if (!hasFinite(object, "x1") || !hasFinite(object, "y1") || !hasFinite(object, "x2") || !hasFinite(object, "y2")) return "line requires finite coordinates";
        break;
      case "highlight":
        if (!Array.isArray(object.targetIds) || object.targetIds.length === 0 || !object.targetIds.every((id) => typeof id === "string" && validId(id))) return "highlight requires bounded target ids";
        break;
      default: return "unknown explanation object kind";
    }
  } catch (error) { return errorMessage(error); }
  return undefined;
}

function validateStudentObjects(objects: readonly StudentObject[]): readonly StudentObject[] {
  if (!Array.isArray(objects) || objects.length > MAX_OBJECTS) throw new Error("student objects must contain at most 500 items");
  const ids = new Set<string>();
  for (const object of objects) {
    if (!isPlainObject(object) || object.source !== "student" || typeof object.kind !== "string") throw new Error("student objects must have source student and a kind");
    requireId(object.id, "student object id");
    if (ids.has(object.id)) throw new Error("student object ids must be unique");
    ids.add(object.id);
    if (object.visible !== undefined && typeof object.visible !== "boolean") throw new Error("student object visible must be boolean");
  }
  return cloneSerializable(objects, "student objects") as StudentObject[];
}

function validateSelection(selection: Selection, students: readonly StudentObject[], explanations: readonly ExplanationObject[]): Selection {
  if (!Array.isArray(selection) || selection.length > MAX_OBJECTS) throw new Error("selection must contain at most 500 ids");
  const known = new Set([...students, ...explanations].map((object) => object.id));
  const unique = new Set<string>();
  for (const id of selection) { requireId(id, "selection id"); if (!known.has(id)) throw new Error("selection contains an unknown object"); unique.add(id); }
  return [...unique];
}

function validateViewport(viewport: unknown): string | undefined {
  if (!isPlainObject(viewport) || !hasFinite(viewport, "xMin") || !hasFinite(viewport, "xMax") || !hasFinite(viewport, "yMin") || !hasFinite(viewport, "yMax")) return "viewport requires finite bounds";
  return (viewport.xMin as number) < (viewport.xMax as number) && (viewport.yMin as number) < (viewport.yMax as number) ? undefined : "viewport bounds must be ordered";
}

function matchingPending<G>(state: SceneState<G>, acknowledgment: RenderAcknowledgment): PendingRender | string {
  if (!isPlainObject(acknowledgment) || typeof acknowledgment.token !== "string" || !Number.isSafeInteger(acknowledgment.revision)) return "invalid render acknowledgment";
  const pending = state.pendingRender;
  if (!pending) return "no render acknowledgment is pending";
  if (pending.token !== acknowledgment.token || pending.revision !== acknowledgment.revision || state.revision !== pending.revision) return "render acknowledgment is late or does not match the current revision";
  return pending;
}

function next<G>(state: SceneState<G>, patch: Partial<SceneState<G>>, kind: SceneAction["kind"], outcome: SceneAction["outcome"], actionId = `${kind}:${state.revision + 1}`): SceneState<G> {
  const revision = state.revision + 1;
  const action: SceneAction = { actionId, kind, revision, policyRevision: patch.policyRevision ?? state.policyRevision, outcome };
  return freeze({ ...state, ...patch, revision, recentActions: bounded([...state.recentActions, action], MAX_ACTIONS) });
}

function rejected<G>(state: SceneState<G>, reason: string): CommandResult<G> { return { status: "rejected", state, reason }; }
function stale<G>(state: SceneState<G>, reason: string): CommandResult<G> { return { status: "stale", state, reason }; }
function bounded<T>(values: readonly T[], length: number): readonly T[] { return values.slice(-length); }
function validId(value: string): boolean { return value.length > 0 && value.length <= MAX_ID && /^[A-Za-z0-9._:-]+$/.test(value); }
function requireId(value: unknown, name: string): asserts value is string { if (typeof value !== "string" || !validId(value)) throw new Error(`${name} must be a bounded identifier`); }
function requireText(value: unknown, name: string): asserts value is string { if (typeof value !== "string" || value.length > MAX_TEXT) throw new Error(`${name} must be a bounded string`); }
function hasFinite(object: Record<string, unknown>, key: string): boolean { return typeof object[key] === "number" && Number.isFinite(object[key]) && Math.abs(object[key] as number) <= 1e6; }
function isPlainObject(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
function errorMessage(error: unknown): string { return error instanceof Error ? error.message : "invalid input"; }
function freeze<T>(value: T): T { return deepFreeze(value); }
function deepFreeze<T>(value: T): T { if (value && typeof value === "object" && !Object.isFrozen(value)) { Object.freeze(value); for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child); } return value; }
function cloneSerializable(value: unknown, name: string): unknown { try { return deepFreeze(structuredClone(value)); } catch { throw new Error(`${name} must be cloneable data`); } }
function stableStringify(value: unknown): string { if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`; if (isPlainObject(value)) return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`; return JSON.stringify(value); }
