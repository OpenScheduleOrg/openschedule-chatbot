import { TypeConvesations } from "@/presentation/session";
import { UserSession } from "@/domain/session/user-session";
import { IConversation } from "@/presentation/conversations";
import { TypeSend } from "@/presentation/apps/send-read";
import Messages from "@/presentation/messages";

export class WelcomeBackConversation implements IConversation {
  conversations: TypeConvesations = {};

  constructor(
    private readonly send: TypeSend,
    private readonly optionsConversation: IConversation
  ) {}

  async answer(session: UserSession, { clean_text }): Promise<void> {
    if (this.conversations[clean_text]) {
      await this.send(session.id, {
        text: Messages.WELCOMEBACK.format(session.patient.name.split(" ")[0]),
      });
      return await this.conversations[clean_text].ask(session);
    }
    this.optionsConversation.ask(session, {
      complement: Messages.WELCOMEBACK.format(
        session.patient.name.split(" ")[0]
      ),
    });
  }
}
