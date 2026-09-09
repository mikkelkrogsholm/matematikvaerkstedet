import type { TutorRequest, TutorReply } from './contracts';

// A future API adapter implements this interface; lessons and UI remain unchanged.
export interface TutorProvider {
  readonly id: string;
  status(): Promise<{ available: boolean; detail: string }>;
  reply(request: TutorRequest, signal: AbortSignal): Promise<TutorReply>;
}
