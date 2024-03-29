import { format } from "date-fns";

import { Weekday } from "@/common/constants";
import { TypeConvesations } from "@/presentation/session";
import { UserSession } from "@/domain/session/user-session";
import { IConversation } from "@/presentation/conversations";
import { TypeSend } from "@/presentation/apps/send-read";
import Messages from "@/presentation/messages";

export class AppointmentConversation implements IConversation {
  conversations: TypeConvesations = {};

  constructor(
    private readonly send: TypeSend,
    private readonly rescheduleConversation: IConversation,
    private readonly cancelConversation: IConversation
  ) { }

  async ask(session: UserSession): Promise<void> {
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

    session.setConversation(this);
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
      session.data.specialty_id = session.data.appointment.specialty_id;
      await this.rescheduleConversation.ask(session);
    } else if (
      clean_text === "2" ||
      clean_text === "cancelar" ||
      clean_text === "cancela"
    ) {
      await this.cancelConversation.ask(session);
    } else
      await this.send(session.id, {
        text: Messages.SORRYNOTUDERSTAND,
      });
  }
}
