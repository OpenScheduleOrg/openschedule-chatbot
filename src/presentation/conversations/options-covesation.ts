import { TypeConvesations } from "@/domain/interfaces";
import { UserSession } from "@/domain/models/user-sesssion";
import { IConversation } from "@/domain/usecases";
import { TypeSend } from "../interfaces";
import Messages from "../messages";

export class OptionsConversation implements IConversation {
  newAppointmentEntry: IConversation;
  appointmentsConversation: IConversation;
  aboutClinicConversation: IConversation;
  conversations: TypeConvesations = {};

  constructor(private readonly send: TypeSend) {}

  async ask(
    session: UserSession,
    { complement, title } = { complement: undefined, title: undefined }
  ): Promise<void> {
    await this.send(session.id, {
      text: complement || Messages.ITFINE,
    });

    await this.send(session.id, {
      text: title || Messages.EASYACCESS,
      buttons: Messages.MENUOPTIONS,
    });
    session.conversation = this;
  }

  async answer(session: UserSession, { clean_text }): Promise<void> {
    if (this.conversations[clean_text])
      return await this.conversations[clean_text].ask(session);

    if (clean_text === "1" || clean_text.toLowerCase() === "marcar consulta") await this.newAppointmentEntry.ask(session);
    else if (clean_text === "2" || clean_text.toLowerCase() === "minhas consultas")
      await this.appointmentsConversation.ask(session);
    else if (clean_text === "3" || clean_text.toLowerCase() === "sobre clinica")
      await this.aboutClinicConversation.ask(session);
    else
      await this.ask(session, {
        complement: Messages.SORRYUDERSTAND,
        title: undefined,
      });
  }
}
