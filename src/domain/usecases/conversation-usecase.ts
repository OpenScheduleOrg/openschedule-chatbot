import { UserSession } from "../../core/user-sesssion";

export interface IConversation {
  ask?(
    session: UserSession,
    optional?: { complement?: string; title?: string }
  ): Promise<void>;
  answer(
    session: UserSession,
    texts: { text: string; clean_text: string }
  ): Promise<void>;
}
