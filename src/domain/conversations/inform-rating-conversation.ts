import { TypeSend } from "@/presentation/apps";
import { IConversation } from "@/presentation/conversations";
import { TypeConvesations } from "@/presentation/session";
import { UserSession } from "../session";
import Messages from "@/presentation/messages";
import { Repository } from "../repositories/repository";
import { RatingFields } from "../repositories/fields";
import { Rating } from "../repositories/models";

export class InformRatingConversation implements IConversation {
  conversations: TypeConvesations = {};

  constructor(
    private readonly send: TypeSend,
    private readonly ratingRepository: Repository<Rating, RatingFields>,
    private readonly youAreWelcomeConversation: IConversation,
    private readonly informFeedbackConversation: IConversation
  ) { }

  async ask(
    session: UserSession,
    { complement } = { complement: undefined }
  ): Promise<void> {
    if (complement)
      await this.send(session.id, { text: complement });

    await this.send(session.id, { text: Messages.INFORMRATING });

    session.setConversation(this);
  }

  async answer(session: UserSession, { clean_text }): Promise<void> {
    if (this.conversations[clean_text])
      return await this.conversations[clean_text].ask(session);

    const textIsNumeric = !isNaN(clean_text);

    if (!textIsNumeric || clean_text <= 1 || clean_text > 5)
      return await this.ask(session, { complement: Messages.INFORMRATING })

    await this.ratingRepository.insert({ phone: session.id, rate: Number(clean_text) });

    session.last_rating = new Date();

    await this.send(session.id, { text: "Muito obrigado!" });
    if (session.requestFeedback())
      await this.informFeedbackConversation.ask(session);
    else
      await this.youAreWelcomeConversation.ask(session);
  }
}