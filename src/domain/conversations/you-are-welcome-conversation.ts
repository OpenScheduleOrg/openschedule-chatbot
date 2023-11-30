import { TypeConvesations } from "@/presentation/session";
import { UserSession } from "@/domain/session/user-session";
import { IConversation } from "@/presentation/conversations";
import Messages from "@/presentation/messages";

export class YouAreWelcomeConversation implements IConversation {
  conversations: TypeConvesations = {};

  constructor(private readonly optionsConversation: IConversation) {}

  async ask(session: UserSession): Promise<void> {
    session.setConversation(this);
  }

  async answer(session: UserSession, { clean_text }): Promise<void> {
    if (this.conversations[clean_text])
      return await this.conversations[clean_text].ask(session);

    await this.optionsConversation.ask(session);
  }
}
