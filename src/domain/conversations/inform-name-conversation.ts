import { TypeConvesations } from "@/presentation/session";
import { UserSession } from "@/domain/session/user-session";
import { IConversation } from "@/presentation/conversations";
import { TypeSend } from "@/presentation/apps/send-read";
import Messages from "@/presentation/messages";

export class InformNameConversation implements IConversation {
  conversations: TypeConvesations = {};

  constructor(
    private readonly send: TypeSend,
    private readonly informCpfConversation: IConversation
  ) { }

  async ask(session: UserSession): Promise<void> {
    this.send(session.id, { text: Messages.INFORMNAME });
    session.setConversation(this);
  }

  async answer(session: UserSession, { text, clean_text }): Promise<void> {
    if (this.conversations[clean_text])
      return await this.conversations[clean_text].ask(session);

    const name = text.replace(/\s+/g, " ");
    if (name.length < 2)
      return await this.send(session.id, {
        text: Messages.INVALIDNAME,
      });

    session.data = { name };

    await this.informCpfConversation.ask(session);
  }
}
