import { describe, expect, test } from "bun:test";
import {
  acknowledgeRender,
  advanceAnimation,
  applyCommand,
  cancelAnimation,
  createScene,
  isRenderConfirmed,
  queueAnimation,
  reportRenderFailure,
  setAiEnabled,
  undoAgentAction,
  updateStudent,
  type SceneCommand,
  type SceneState,
} from "./index.ts";

function enabled(): SceneState<{ readonly price: number }> {
  return setAiEnabled(createScene("attempt-1", "scene-1", { price: 30 }), true);
}

function pointCommand(state: SceneState<unknown>, actionId = "action-1"): SceneCommand {
  return {
    attemptId: state.attemptId,
    sceneId: state.sceneId,
    expectedRevision: state.revision,
    policyRevision: state.policyRevision,
    actionId,
    operations: [{ type: "addObject", object: { kind: "point", id: `point-${actionId}`, source: "ai", x: 2, y: 3, visible: true } }],
  };
}

describe("transactional FP9 scene", () => {
  test("server acceptance followed by render failure cannot be described as displayed", () => {
    const accepted = applyCommand(enabled(), pointCommand(enabled()));
    expect(accepted.status).toBe("applied");
    const pending = accepted.pendingRender!;
    const failed = reportRenderFailure(accepted.state, { token: pending.token, revision: pending.revision });
    expect(failed.status).toBe("failed");
    expect(isRenderConfirmed(failed.state, { token: pending.token, revision: pending.revision })).toBe(false);
  });

  test("only a matching, current delayed render confirmation permits success", () => {
    const start = enabled();
    const accepted = applyCommand(start, pointCommand(start));
    const pending = accepted.pendingRender!;
    expect(isRenderConfirmed(accepted.state, { token: pending.token, revision: pending.revision })).toBe(false);
    const confirmed = acknowledgeRender(accepted.state, { token: pending.token, revision: pending.revision });
    expect(confirmed.status).toBe("confirmed");
    expect(isRenderConfirmed(confirmed.state, { token: pending.token, revision: pending.revision })).toBe(true);
    expect(acknowledgeRender(confirmed.state, { token: pending.token, revision: pending.revision }).status).toBe("rejected");
  });

  test("same action replay is idempotent but differing content is rejected", () => {
    const start = enabled();
    const command = pointCommand(start);
    const accepted = applyCommand(start, command);
    expect(applyCommand(accepted.state, command)).toMatchObject({ status: "applied", replayed: true });
    expect(applyCommand(accepted.state, { ...command, operations: [] }).status).toBe("rejected");
  });

  test("invalid batches are atomic and cannot target student-owned objects", () => {
    const start = updateStudent(enabled(), { objects: [{ id: "student-point", kind: "point", source: "student" }] });
    const command: SceneCommand = {
      ...pointCommand(start),
      operations: [
        { type: "addObject", object: { kind: "point", id: "agent-point", source: "ai", x: 1, y: 1, visible: true } },
        { type: "moveObject", objectId: "student-point", position: { x: 4, y: 4 } },
      ],
    };
    const result = applyCommand(start, command);
    expect(result.status).toBe("rejected");
    expect(result.state.explanationObjects).toHaveLength(0);
    expect(result.state.studentObjects).toHaveLength(1);
  });

  test("rejects another attempt, stale policy, and AI-off commands", () => {
    const start = enabled();
    expect(applyCommand(start, { ...pointCommand(start), attemptId: "attempt-else" }).status).toBe("rejected");
    const off = setAiEnabled(start, false);
    expect(applyCommand(off, pointCommand(off)).status).toBe("rejected");
    const toggled = setAiEnabled(off, true);
    expect(applyCommand(toggled, pointCommand(start)).status).toBe("stale");
  });

  test("student work survives pending agent rendering, while the old acknowledgment becomes late", () => {
    const start = enabled();
    const accepted = applyCommand(start, pointCommand(start));
    const pending = accepted.pendingRender!;
    const edited = updateStudent(accepted.state, { objects: [{ id: "student-work", kind: "answer", source: "student", answer: "45 kr." }] });
    expect(edited.studentObjects[0]?.id).toBe("student-work");
    expect(acknowledgeRender(edited, { token: pending.token, revision: pending.revision }).status).toBe("rejected");
  });

  test("undo restores only the explanation snapshot and preserves student work", () => {
    const start = updateStudent(enabled(), { objects: [{ id: "student-work", kind: "answer", source: "student", answer: 45 }] });
    const command = pointCommand(start);
    const accepted = applyCommand(start, command);
    const confirmed = acknowledgeRender(accepted.state, { token: accepted.pendingRender!.token, revision: accepted.pendingRender!.revision });
    const undone = undoAgentAction(confirmed.state, command.actionId);
    expect(undone.status).toBe("applied");
    expect(undone.state.explanationObjects).toHaveLength(0);
    expect(undone.state.studentObjects[0]?.id).toBe("student-work");
  });

  test("animation steps are explicit, need current revisions, and cancellation clears them", () => {
    const start = enabled();
    const queued = queueAnimation(start, "demo-1", [{ stepId: "one", command: pointCommand({ ...start, revision: start.revision + 1 }) }]);
    expect(queued.status).toBe("applied");
    expect(cancelAnimation(queued.state).animation).toBeNull();

    const ready = queueAnimation(start, "demo-2", [{ stepId: "one", command: pointCommand({ ...start, revision: start.revision + 1 }, "animated") }]);
    const advanced = advanceAnimation(ready.state);
    expect(advanced.status).toBe("applied");
    expect(advanced.state.animation).toBeNull();
    const policyChanged = setAiEnabled(ready.state, false);
    expect(policyChanged.animation).toBeNull();
  });
});

test('AI disable rejects replay and undo keeps action identity reserved', () => {
 const initial=setAiEnabled(createScene('attempt-extra','scene-extra',{}),true);
 const command={attemptId:initial.attemptId,sceneId:initial.sceneId,expectedRevision:initial.revision,policyRevision:initial.policyRevision,actionId:'action-extra',operations:[{type:'addObject' as const,object:{kind:'point' as const,id:'ai-p',source:'ai' as const,x:0,y:0,visible:true}}]};
 const applied=applyCommand(initial,command);
 expect(applyCommand(setAiEnabled(applied.state,false),command).status).toBe('rejected');
 const confirmed=acknowledgeRender(applied.state,applied.pendingRender!);
 const undone=undoAgentAction(confirmed.state,'action-extra');
 expect(undone.state.explanationObjects).toHaveLength(0);
 expect(applyCommand(undone.state,{...command,expectedRevision:undone.state.revision}).status).toBe('rejected');
});

test('moving objects refreshes coordinate captions instead of keeping stale text',()=>{
 let state=enabled();
 const command=(actionId:string,operations:SceneCommand['operations']):SceneCommand=>({attemptId:state.attemptId,sceneId:state.sceneId,expectedRevision:state.revision,policyRevision:state.policyRevision,actionId,operations});
 const added=applyCommand(state,command('caption-add',[{type:'addObject',object:{id:'dot',source:'ai',kind:'point',x:2,y:4,text:'(2,4)',visible:true}}]));
 state=acknowledgeRender(added.state,added.state.pendingRender!).state;
 const moved=applyCommand(state,command('caption-move',[{type:'moveObject',objectId:'dot',position:{x:3,y:5},text:'(3,5)'}]));
 expect(moved.state.explanationObjects[0]?.text).toBe('(3,5)');
 state=acknowledgeRender(moved.state,moved.state.pendingRender!).state;
 const again=applyCommand(state,command('caption-clear',[{type:'moveObject',objectId:'dot',position:{x:4,y:6}}]));
 expect(again.state.explanationObjects[0]?.text).toBe('');
});
