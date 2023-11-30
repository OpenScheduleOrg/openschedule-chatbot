import { TypeSend } from "@/presentation/apps";
import { IConversation } from "@/presentation/conversations";
import { TypeConvesations } from "@/presentation/session";
import { UserSession } from "../session";
import Messages from "@/presentation/messages";
import { Repository } from "../repositories/repository";
import { Feedback } from "../repositories/models";
import { FeedbackFields } from "../repositories/fields";

export class InformFeedbackConversation implements IConversation {
  conversations: TypeConvesations = {};

  constructor(
    private readonly send: TypeSend,
    private readonly feedbackRepository: Repository<Feedback, FeedbackFields>,
    private readonly youAreWelcomeConversation: IConversation
  ) { }

  async ask(
    session: UserSession,
    { complement } = { complement: undefined }
  ): Promise<void> {
    if(complement)
      await this.send(session.id, { text: complement });

    await this.send(session.id, { text: Messages.INFORMFEEDBACK });

    session.setConversation(this);
  }

  async answer(session: UserSession, { clean_text, text }): Promise<void> {
    if (this.conversations[clean_text])
      return await this.conversations[clean_text].ask(session);

    await this.feedbackRepository.insert({ phone: session.id, message: text });

    session.last_feedback = new Date();

    await this.send(session.id, { text: "Muito obrigado!" });
    await this.youAreWelcomeConversation.ask(session);
  }
}