import { TypeConvesations } from "@/domain/interfaces";
import { UserSession } from "@/core/user-sesssion";
import { IConversation } from "@/domain/usecases";
import { TypeSend } from "../interfaces";
import Messages from "../messages";

export class InformFeedbackConversation implements IConversation {
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
      text: title || Messages.INFORMFEEDBACK,
    });

    session.setConversation(this);
  }

  async answer(session: UserSession, { clean_text }): Promise<void> {
    if (this.conversations[clean_text])
      return await this.conversations[clean_text].ask(session);
    
    if (clean_text < 1 || clean_text > 5){
        await this.ask(session, {
            complement: Messages.INVALIDFEEDBACK,
            title: undefined
        })
    }
    else{
        //ADD CODE TO FIREBASE
    }
  }
}