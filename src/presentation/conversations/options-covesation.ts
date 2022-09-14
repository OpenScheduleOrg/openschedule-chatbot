import { TypeConvesations } from "@/domain/interfaces";
import { UserSession } from "@/domain/models/user-sesssion";
import { IConversation } from "@/domain/usecases";
import { TypeSend } from "../interfaces";
import Messages from "../messages";

export class OptionsConversation implements IConversation {
  constructor(
    private readonly send: TypeSend,
    private readonly conversations: TypeConvesations
  ) {}

  async ask(
    session: UserSession,
    { complement } = { complement: Messages.ITFINE }
  ): Promise<void> {
    if (complement) await this.send(session.id, { text: complement });

    await this.send(session.id, {
      text: Messages.EASYACCESS,
      buttons: Messages.MENUOPTIONS,
    });
    session.conversation = this;
  }

  async answer(session: UserSession, { clean_text }): Promise<void> {}
}
