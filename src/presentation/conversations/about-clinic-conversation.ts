import { TypeConvesations } from "@/domain/interfaces";
import { ClinicModel } from "@/domain/models";
import { UserSession } from "@/core/user-sesssion";
import { IConversation } from "@/domain/usecases";
import { TypeSend } from "../interfaces";
import Messages from "../messages";

export class AboutClinicConversation implements IConversation {
  conversations: TypeConvesations = {};

  constructor(
    private readonly send: TypeSend,
    private readonly clinic: ClinicModel,
    private readonly optionsConversation: IConversation
  ) {}

  async ask(session: UserSession): Promise<void> {
    await this.send(session.id, {
      text: Messages.ABOUT.format(
        this.clinic.name,
        this.clinic.phone.phoneMask(),
        this.clinic.address
      ),
    });

    if (this.clinic.latitude && this.clinic.longitude)
      await this.send(session.id, {
        location: {
          degreesLatitude: Number(this.clinic.latitude),
          degreesLongitude: Number(this.clinic.longitude),
          address: this.clinic.address,
        },
      });
    session.setConversation(this);
  }

  async answer(session: UserSession, { clean_text }): Promise<void> {
    if (this.conversations[clean_text])
      return await this.conversations[clean_text].ask(session);
    await this.optionsConversation.ask(session, {
      complement: Messages.YOUAREWELCOME,
    });
  }
}
