import { TypeConvesations } from "@/presentation/session";
import { UserSession } from "@/domain/session/user-session";
import { IConversation } from "@/presentation/conversations";
import { TypeSend } from "@/presentation/apps/send-read";
import Messages from "@/presentation/messages";

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
    session.setConversation(this);
  }

  async answer(session: UserSession, { clean_text }): Promise<void> {
    if (clean_text == "1" || clean_text == "sim") await this.yesConveration.ask(session);
    else if (clean_text == "2" || clean_text == "nao") await this.noConversation.ask(session);
    else if (this.conversations[clean_text])
      await this.conversations[clean_text].ask(session);
    else
      await this.undefinableConversation.ask(session, {
        complement: Messages.SORRYUDERSTAND,
      });
  }
}
