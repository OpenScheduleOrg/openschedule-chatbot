import { TypeConvesations } from "@/domain/interfaces";
import { ClinicaModel } from "@/domain/models";
import { UserSession } from "@/domain/models/user-sesssion";
import { IConversation } from "@/domain/usecases";
import { TypeSend } from "../interfaces";
import Messages from "../messages";

export class AboutClinicConversation implements IConversation {
  conversations: TypeConvesations = {};

  constructor(
    private readonly send: TypeSend,
    private readonly clinica: ClinicaModel,
    private readonly optionsConversation: IConversation
  ) {}

  async ask(session: UserSession): Promise<void> {
    await this.send(session.id, {
      text: Messages.ABOUT.format(
        this.clinica.nome,
        this.clinica.telefone.phoneMask(),
        this.clinica.endereco
      ),
    });

    await this.send(session.id, {
      location: {
        degreesLatitude: Number(this.clinica.latitude),
        degreesLongitude: Number(this.clinica.logintude),
        address: this.clinica.endereco,
      },
    });
    session.conversation = this;
  }

  async answer(session: UserSession, { clean_text }): Promise<void> {
    if (this.conversations[clean_text])
      return await this.conversations[clean_text].ask(session);
    await this.optionsConversation.ask(session, {
      complement: Messages.YOUAREWELCOME,
    });
  }
}
