import { TypeConvesations } from "@/domain/interfaces";
import { UserSession } from "@/domain/session/user-session";
import { IConversation } from "@/domain/usecases";
import Messages from "../messages";

export class YouAreWelcomeConversation implements IConversation {
  conversations: TypeConvesations = {};

  constructor(private readonly optionsConversation: IConversation) {}

  async ask(session: UserSession): Promise<void> {
    session.setConversation(this);
  }

  async answer(session: UserSession, { clean_text }): Promise<void> {
    if (this.conversations[clean_text])
      return await this.conversations[clean_text].ask(session);

    await this.optionsConversation.ask(session, {
      complement: Messages.YOUAREWELCOME,
    });
  }
}
