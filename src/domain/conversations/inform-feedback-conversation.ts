import { TypeSend } from "@/presentation/apps";
import { IConversation } from "@/presentation/conversations";
import { TypeConvesations } from "@/presentation/session";
import { UserSession } from "../session";
import Messages from "@/presentation/messages";

export class InformFeedbackConversation implements IConversation {
  newAppointmentEntry: IConversation;
  appointmentsConversation: IConversation;
  aboutClinicConversation: IConversation;
  conversations: TypeConvesations = {};

  constructor(
    private readonly send: TypeSend,
    private readonly youAreWelcomeConversation: IConversation
    ) {}

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
    
    const textIsNumeric = !isNaN(clean_text);
    
    if (!textIsNumeric || clean_text <= 1 || clean_text > 5){
        await this.ask(session, {
            complement: Messages.INVALIDFEEDBACK,
            title: undefined
        })
    }
    else{
      //ADD CODE TO FIREBASE
      this.send(session.id, { text: "Muito obrigado!" });
      this.youAreWelcomeConversation.ask(session);
    }
  }
}