# FP9 integration contract for next delivery

Existing prototype remains at /; FP9 is reachable at /fp9 (server serves same index, main selects component by path). No new dependencies. Server modules do not enter browser bundles.

Core types imported from src/fp9/domain and src/fp9/scene. One API types file owned by coordinator, imported by UI and server using `import type` only.

AttemptView:
- schemaVersion:'1', id:string, revision:number, createdAt:string
- profile:Profile, status:'active'|'submitted', submittedAt:string|null
- groups:{id:string,title:string,parts:PublicTask[]}[]
- answers:Record<taskId,Record<questionId,Answer>>
- notes:Record<taskId,string>, scenes:Record<taskId,SceneState>
- visited:string[], flagged:string[], activeTaskId:string
- assistance:{id,taskId,level:'question'|'hint'|'step'|'solution',source:'ai'|'local'|'feedback',at:string}[]
- chat:Record<taskId,{role:'student'|'guide';text:string}[]>
- clock:{elapsedSeconds:number,lastResumedAt:string|null,extraSeconds:number,events:{kind:'pause'|'resume'|'extra';at:string;seconds?:number}[]}
- assessments:Record<taskId,Record<questionId,Assessment>>, tools: JSON tool state
- aiUsage:{calls:number,inputTokens:number,outputTokens:number,lastLatencyMs:number|null}
- profileSource is fixed configured foundation, no future official equivalence claim.

Endpoints, all JSON same origin loopback:
GET /api/fp9/catalog -> {families, sourceVersion, sourceDate}
GET /api/fp9/attempts -> {attempts:{id,createdAt,status,examType,assisted}[]}
POST /api/fp9/attempts {examType,aiEnabled,length:'short'|'full'|'topic',familyId?,seed?,timingMinutes:null|number,feedback} -> AttemptView
GET /api/fp9/attempts/:id -> AttemptView
POST /api/fp9/attempts/:id/action body:{expectedRevision:number,type,...} -> AttemptView
Actions: answer{taskId,questionId,answer}, note{taskId,text}, navigate{taskId}, flag{taskId,flagged:boolean}, student{taskId,objects,selection}, ai{enabled:boolean}, submit{}, pause{}, resume{}, extra{seconds}, tools{value}, feedback{taskId,questionId}, undo{taskId}.
POST /api/fp9/attempts/:id/help {expectedRevision,taskId,level,question} -> AttemptView with pending render scene OR confirmed text if no operations. Server owns command envelope and policy. Abort on AI disable/submission/revision changes. AI disabled means no calls. Max calls and timeout env config. Actual provider via Codex subscription, reuse/refactor generic CLI runner; preserve existing prototype adapter.
POST /api/fp9/attempts/:id/ack {taskId,token,revision,success:boolean} -> AttemptView, releasing held model text ONLY on matching successful render acknowledgment. Failed render rolls back explanation. All stale failures 409 + {error}; client refetches state, does not overwrite newer local edits.
GET /api/fp9/attempts/:id/export -> versioned export JSON, no credentials or hidden marking. Import POST /api/fp9/import {export} validates bounds, regenerates seeded content and marks unsupported versions error; preserve immutable submitted status and logged help, cancel pending provider/actions.
DELETE /api/fp9/attempts/:id (local user-requested deletion).

Backend stores local attempt files under .local/fp9 with atomic write rename, serializes per-attempt writes, keeps separate internal marking from public projection. Persisted imports must be validated without trusting client counters/policies. Limit body and counts. No elevation, cloud or identity. UI saves edits explicitly/debounced serially, exposes save status; submit waits pending edits. Confirmation screen counts blanks before submit; locks submitted answers. Printing uses print CSS+window.print via explicit button. Attempt JSON restores tools/notes/constructions; no secret facit in browser.

Full no-aids has20groups/50parts: first10groups3parts, next10groups2parts. Full aids7groups3parts with varied family stories/open work. Short3groups1part (vertical F06/F13/F16 until all families). Topic onegroup3variants. Product blueprint versioned with domain coverage; no official weights claim.
