import { format } from "date-fns";

import { Weekday } from "@/common/constants";
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
    session.conversation_stack = [];

    const appointment = session.data.appointment;
    this.send(session.id, {
      text: Messages.SHOWAPPOINTMENT.format(
        appointment.specialty_description,
        appointment.professional_name,
        Weekday[appointment.scheduled_day.getDay()] +
          " - " +
          format(appointment.scheduled_day, "dd/MM"),
        appointment.start_time.toClockTime()
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
    ) {
      session.conversation_stack = [this];
      session.data.specialty_id = session.data.appointment.specialty_id;
      await this.rescheduleConversation.ask(session);
    } else if (
      clean_text === "2" ||
      clean_text === "cancelar" ||
      clean_text === "cancela"
    ) {
      session.conversation_stack = [this];
      await this.cancelConversation.ask(session);
    } else
      await this.send(session.id, {
        text: Messages.SORRYNOTUDERSTAND,
      });
  }
}
