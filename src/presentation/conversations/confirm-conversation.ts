import { TypeConvesations } from "@/domain/interfaces";
import { UserSession } from "@/domain/models/user-sesssion";
import { IConversation } from "@/domain/usecases";
import { TypeSend } from "../interfaces";
import Messages from "../messages";

export class ConfirmConversation implements IConversation {
  conversations: TypeConvesations = {};

  constructor(
    private readonly send: TypeSend,
    private readonly yesConveration: IConversation,
    private readonly noConversation: IConversation,
    private readonly undefinableConversation: IConversation
  ) {}

  async ask(session: UserSession, { complement }): Promise<void> {
    await this.send(session.id, {
      text: complement,
      buttons: Messages.SNBUTTONS,
    });
    session.conversation = this;
  }

  async answer(session: UserSession, { clean_text }): Promise<void> {
    if (clean_text === "1") await this.yesConveration.ask(session);
    else if (clean_text == "2") await this.noConversation.ask(session);
    else if (this.conversations[clean_text])
      await this.conversations[clean_text].ask(session);
    else
      await this.undefinableConversation.ask(session, {
        complement: Messages.SORRYUDERSTAND,
      });
  }
}
