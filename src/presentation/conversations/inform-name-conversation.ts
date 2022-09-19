import { TypeConvesations } from "@/domain/interfaces";
import { UserSession } from "@/domain/models/user-sesssion";
import { IConversation } from "@/domain/usecases";
import { TypeSend } from "../interfaces";
import Messages from "../messages";

export class InformNameConversation implements IConversation {
  conversations: TypeConvesations = {};

  constructor(
    private readonly send: TypeSend,
    private readonly informCpfConversation: IConversation
  ) {}

  async ask(session: UserSession): Promise<void> {
    session.conversation_stack = [];

    this.send(session.id, { text: Messages.INFORMNAME });
    session.conversation = this;
  }

  async answer(session: UserSession, { text, clean_text }): Promise<void> {
    if (this.conversations[clean_text])
      return await this.conversations[clean_text].ask(session);

    const fullname = text.replace(/\s+/g, " ").split(" ");
    if (fullname.length < 2)
      return await this.send(session.id, {
        text: Messages.INVALIDNAME,
      });

    const name = fullname[0];
    const last_name = fullname.slice(1).join(" ");
    session.data = { name, last_name };

    session.conversation_stack.push(this);
    await this.informCpfConversation.ask(session);
  }
}
