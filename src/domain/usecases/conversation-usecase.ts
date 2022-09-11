import { UserSession } from "../models/user-sesssion";

export interface IConversation {
  ask(session: UserSession): Promise<void>;
  answer(session: UserSession, text: string): Promise<void>;
}
