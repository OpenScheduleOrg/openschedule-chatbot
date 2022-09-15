import { TypeConvesations } from "@/domain/interfaces";
import { UserSession } from "@/domain/models/user-sesssion";
import { IConversation } from "@/domain/usecases";
import { TypeSend } from "../interfaces";
import Messages from "../messages";

export class OptionsConversation implements IConversation {
  informMounthConversation: IConversation;
  appointmentsConversation: IConversation;
  aboutClinicConversation: IConversation;
  conversations: TypeConvesations = {};

  constructor(private readonly send: TypeSend) {}

  async ask(
    session: UserSession,
    { complement } = { complement: Messages.ITFINE }
  ): Promise<void> {
    await this.send(session.id, { text: complement });

    await this.send(session.id, {
      text: Messages.EASYACCESS,
      buttons: Messages.MENUOPTIONS,
    });
    session.conversation = this;
  }

  async answer(session: UserSession, { clean_text }): Promise<void> {
    if (this.conversations[clean_text])
      return await this.conversations[clean_text].ask(session);

    if (clean_text === "1") await this.informMounthConversation.ask(session);
    else if (clean_text === "2")
      await this.appointmentsConversation.ask(session);
    else if (clean_text === "3")
      await this.aboutClinicConversation.ask(session);
    else
      await this.ask(session, {
        complement: Messages.SORRYUDERSTAND,
      });
  }
}
