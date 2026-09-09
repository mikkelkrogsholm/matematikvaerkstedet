import type {Answer,Assessment,ExamType,Family,FamilyId,Profile,PublicTask} from './domain';
import type {SceneState,StudentObject} from './scene';
export type HelpLevel='question'|'hint'|'step'|'solution';
export type Group={id:string;title:string;parts:PublicTask[]};
export type Assistance={id:string;taskId:string;level:HelpLevel;source:'ai'|'local'|'feedback';at:string;tokens?:{input:number;output:number};latencyMs?:number};
export type ClockState={elapsedSeconds:number;lastResumedAt:string|null;extraSeconds:number;events:{kind:'pause'|'resume'|'extra';at:string;seconds?:number}[]};
export type ToolState={tab:'calculator'|'sheet'|'cas';expression:string;result:string;cells:Record<string,string>;rows:number};
export interface AttemptView {
 schemaVersion:'1';id:string;revision:number;createdAt:string;profile:Profile;status:'active'|'submitted';submittedAt:string|null;
 groups:Group[];answers:Record<string,Record<string,Answer>>;notes:Record<string,string>;scenes:Record<string,SceneState>;
 visited:string[];flagged:string[];activeTaskId:string;assistance:Assistance[];chat:Record<string,{role:'student'|'guide';text:string}[]>;
 clock:ClockState;assessments:Record<string,Record<string,Assessment>>;tools:Record<string,ToolState>;
 aiUsage:{calls:number;inputTokens:number;outputTokens:number;lastLatencyMs:number|null};
}
export type AttemptSummary={id:string;createdAt:string;status:'active'|'submitted';examType:ExamType;assisted:boolean};
export type CreateAttempt={examType:ExamType;aiEnabled:boolean;length:'short'|'full'|'topic';familyId?:FamilyId;seed?:number;timingMinutes:number|null;feedback:'immediate'|'after-submit'};
export type AttemptAction={expectedRevision:number}&(
 |{type:'answer';taskId:string;questionId:string;answer:Answer}
 |{type:'note';taskId:string;text:string}
 |{type:'navigate';taskId:string}
 |{type:'flag';taskId:string;flagged:boolean}
 |{type:'student';taskId:string;objects:StudentObject[];selection:string[]}
 |{type:'ai';enabled:boolean}
 |{type:'submit'|'pause'|'resume'}
 |{type:'extra';seconds:number}
 |{type:'tools';taskId:string;value:ToolState}
 |{type:'feedback';taskId:string;questionId:string}
 |{type:'undo'|'animation-stop';taskId:string}
 |{type:'animation-next';taskId:string;commandId:string}
);
export type HelpRequest={expectedRevision:number;taskId:string;level:HelpLevel;question:string};
export type AckRequest={taskId:string;token:string;revision:number;success:boolean};
export type Catalog={families:readonly Family[];sourceVersion:string;sourceDate:string};
export const allParts=(attempt:Pick<AttemptView,'groups'>)=>attempt.groups.flatMap(g=>g.parts);
