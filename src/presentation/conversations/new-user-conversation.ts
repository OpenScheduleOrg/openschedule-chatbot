import { TypeConvesations } from "@/domain/interfaces";
import { UserSession } from "@/domain/models/user-sesssion";
import { IConversation } from "@/domain/usecases";
import { TypeSend } from "../interfaces";
import Messages from "../messages";

export class NewUserConversation implements IConversation {
  constructor(
    private readonly send: TypeSend,
    private readonly informNameConveration: IConversation,
    private readonly optionsConversation: IConversation,
    private readonly undefinableConversation: IConversation,
    private readonly conversations: TypeConvesations
  ) {}

  async ask(session: UserSession): Promise<void> {
    await this.send(session.id, { text: Messages.WELCOME });
    await this.send(session.id, {
      text: Messages.SNCADASTRO,
      buttons: Messages.SNBUTTONS,
    });
    session.conversation = this;
  }

  async answer(session: UserSession, { clean_text }): Promise<void> {
    if (clean_text === "sim") await this.informNameConveration.ask(session);
    else if (clean_text == "nao") await this.optionsConversation.ask(session);
    else if (this.conversations[clean_text])
      await this.conversations[clean_text].ask(session);
    else
      await this.undefinableConversation.ask(session, {
        complement: Messages.SORRYUDERSTAND,
      });
  }
}
