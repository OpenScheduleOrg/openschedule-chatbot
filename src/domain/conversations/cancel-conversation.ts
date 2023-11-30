import { Month, Weekday } from "@/common/constants";
import { TypeConvesations } from "@/presentation/session";
import { UserSession } from "@/domain/session/user-session";
import { AppointmentService } from "@/data/services";
import { IConversation } from "@/presentation/conversations";
import { TypeSend } from "@/presentation/apps/send-read";
import Messages from "@/presentation/messages";

export class CancelConversation implements IConversation {
  conversations: TypeConvesations = {};

  constructor(
    private readonly send: TypeSend,
    private readonly appointmentService: AppointmentService,
    private readonly youAreWelcomeConversation: IConversation
  ) {}

  async ask(session: UserSession): Promise<void> {
    const appointment = session.data.appointment;

    await this.send(session.id, {
      text: Messages.CANCELAPPOINTMENT.format(
        Weekday[appointment.scheduled_day.getDay()].toLowerCase(),
        appointment.scheduled_day.getDate().toString(),
        Month[appointment.scheduled_day.getMonth() + 1].toLowerCase(),
        appointment.start_time.toClockTime()
      ),
      buttons: Messages.SNBUTTONS,
    });

    session.setConversation(this);
  }

  async answer(session: UserSession, { clean_text }): Promise<void> {
    if (this.conversations[clean_text]) {
      session.data.appointment = undefined;
      await this.conversations[clean_text].ask(session);
    }

    if (clean_text === "sim" || clean_text == 1) {
      const appointment = session.data.appointment;
      await this.appointmentService.deleteById(session.data.appointment.id);
      await this.send(session.id, {
        text: Messages.CANCELEDAPPOINTMENT.format(
          Weekday[appointment.scheduled_day.getDay()].toLowerCase(),
          appointment.scheduled_day.getDate().toString(),
          Month[appointment.scheduled_day.getMonth() + 1].toLowerCase(),
          appointment.start_time.toClockTime()
        ),
      });
      session.data.appointment = undefined;
      await this.youAreWelcomeConversation.ask(session);
    } else if (clean_text == "nao" || clean_text == 2) {
      await session.lastConversation().ask(session);
    } else await this.send(session.id, { text: Messages.SORRYNOTUDERSTAND });
  }
}
