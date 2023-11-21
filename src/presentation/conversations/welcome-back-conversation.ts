import { TypeConvesations } from "@/domain/interfaces";
import { UserSession } from "@/core/user-sesssion";
import { IConversation } from "@/domain/usecases";
import { TypeSend } from "../interfaces";
import Messages from "../messages";

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
