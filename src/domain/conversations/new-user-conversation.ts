import { TypeConvesations } from "@/presentation/session";
import { UserSession } from "@/domain/session/user-session";
import { IConversation } from "@/presentation/conversations";
import { TypeSend } from "@/presentation/apps/send-read";
import Messages from "@/presentation/messages";

export class NewUserConversation implements IConversation {
  conversations: TypeConvesations = {};

  constructor(
    private readonly send: TypeSend,
    private readonly informNameConveration: IConversation,
  ) {}

  async ask(
    session: UserSession,
    { complement } = { complement: Messages.WELCOME }
  ): Promise<void> {
    await this.send(session.id, { text: complement });
    await this.send(session.id, {
      text: Messages.SNCADASTRO,
      buttons: Messages.SNBUTTONS,
    });
    session.setConversation(this);
  }

  async answer(session: UserSession, { clean_text }): Promise<void> {
    if (clean_text === "sim" || clean_text == 1) await this.informNameConveration.ask(session);
    else if (clean_text == "nao" || clean_text == 2) await this.send(session.id, { text: Messages.ITFINE });
    else
      await this.ask(session, { complement: Messages.WELCOME });
  }
}
