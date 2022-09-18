import { format } from "date-fns";

import { Month, Weekday } from "@/common/constants";
import { TypeConvesations } from "@/domain/interfaces";
import { UserSession } from "@/domain/models/user-sesssion";
import { IConversation } from "@/domain/usecases";
import { TypeSend } from "../interfaces";
import Messages from "../messages";

export class AppointmentConversation implements IConversation {
  conversations: TypeConvesations = {};

  constructor(
    private readonly send: TypeSend,
    private readonly rescheduleConversation: IConversation,
    private readonly cancelConversation: IConversation
  ) {}

  async ask(session: UserSession): Promise<void> {
    const appointment = session.data.appointment;
    this.send(session.id, {
      text: Messages.SHOWAPPOINTMENT.format(
        Weekday[appointment.marcada.getDay()].toLowerCase(),
        appointment.marcada.getDate().toString(),
        Month[appointment.marcada.getMonth()].toLowerCase(),
        format(appointment.marcada, "HH:mm")
      ),
      buttons: Messages.APPOINMENTACTIONS,
    });

    session.conversation = this;
  }

  async answer(session: UserSession, { clean_text }): Promise<void> {
    if (this.conversations[clean_text]) {
      session.data.appointment = undefined;
      return await this.conversations[clean_text].ask(session);
    }

    if (
      clean_text === "1" ||
      clean_text === "reagendar" ||
      clean_text === "reagenda"
    )
      await this.rescheduleConversation.ask(session);
    else if (
      clean_text === "2" ||
      clean_text === "cancelar" ||
      clean_text === "cancela"
    )
      await this.cancelConversation.ask(session);
    else
      await this.send(session.id, {
        text: Messages.SORRYNOTUDERSTAND,
      });
  }
}
