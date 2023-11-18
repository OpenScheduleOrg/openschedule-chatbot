import { TypeConvesations } from "@/domain/interfaces";
import { UserSession } from "@/domain/models/user-sesssion";
import { IConversation } from "@/domain/usecases";
import { TypeSend } from "../interfaces";
import Messages from "../messages";

export class NewUserConversation implements IConversation {
  conversations: TypeConvesations = {};

  constructor(
    private readonly send: TypeSend,
    private readonly informNameConveration: IConversation,
    private readonly optionsConversation: IConversation,
    private readonly undefinableConversation: IConversation
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
    session.conversation = this;
  }

  async answer(session: UserSession, { clean_text }): Promise<void> {
    if (clean_text === "sim" || clean_text == 1) await this.informNameConveration.ask(session);
    else if (clean_text == "nao" || clean_text == 2) await this.send(session.id, { text: Messages.ITFINE });
    else
      await this.ask(session, { complement: Messages.WELCOME });
  }
}
