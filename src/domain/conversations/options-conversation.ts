import { TypeConvesations } from "@/presentation/session";
import { UserSession } from "@/domain/session/user-session";
import { IConversation } from "@/presentation/conversations";
import { TypeSend } from "@/presentation/apps/send-read";
import Messages from "@/presentation/messages";

export class OptionsConversation implements IConversation {
  newAppointmentEntry: IConversation;
  appointmentsConversation: IConversation;
  aboutClinicConversation: IConversation;
  informFeedbackConversation: IConversation;
  conversations: TypeConvesations = {};

  constructor(private readonly send: TypeSend) {}

  async ask(
    session: UserSession,
    { complement, title } = { complement: undefined, title: undefined }
  ): Promise<void> {
    if(complement)
      await this.send(session.id, {
        text: complement || Messages.ITFINE,
      });

    await this.send(session.id, {
      text: title || Messages.EASYACCESS,
      buttons: Messages.MENUOPTIONS,
    });

    session.setConversation(this);
  }

  async answer(session: UserSession, { clean_text }): Promise<void> {
    if (this.conversations[clean_text])
      return await this.conversations[clean_text].ask(session);

    if (clean_text == "1" || clean_text == "marcar consulta") await this.newAppointmentEntry.ask(session);
    else if (clean_text == "2" || clean_text == "minhas consultas")
      await this.appointmentsConversation.ask(session);
    else if (clean_text == "3" || clean_text == "sobre clinica")
      await this.aboutClinicConversation.ask(session);
    else if (clean_text == "4" || clean_text == "feedback")
      await this.informFeedbackConversation.ask(session);
    else
      await this.ask(session, {
        complement: Messages.SORRYUDERSTAND,
        title: undefined,
      });
  }
}