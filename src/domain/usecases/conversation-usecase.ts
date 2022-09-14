import { UserSession } from "../models/user-sesssion";

export interface IConversation {
  ask(session: UserSession): Promise<void>;
  answer(
    session: UserSession,
    texts: { text: string; clean_text: string }
  ): Promise<void>;
}
