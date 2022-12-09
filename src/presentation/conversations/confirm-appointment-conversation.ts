import { Month, Weekday } from "@/common/constants";
import { TypeConvesations } from "@/domain/interfaces";
import { UserSession } from "@/domain/models/user-sesssion";
import { AppointmentService } from "@/domain/services";
import { IConversation } from "@/domain/usecases";
import { format } from "date-fns";
import { TypeSend } from "../interfaces";
import Messages from "../messages";

export class ConfirmAppointmentConversation implements IConversation {
  conversations: TypeConvesations = {};

  private readonly buttons = [
    {
      buttonId: "confirmar",
      buttonText: { displayText: "Confirmar" },
      type: 2,
    },
    {
      buttonId: "refazer",
      buttonText: { displayText: "Refazer" },
      type: 2,
    },
  ];

  constructor(
    private readonly send: TypeSend,
    private readonly appointmentService: AppointmentService,
    private readonly youAreWelcomeConversation: IConversation
  ) {}

  async ask(session: UserSession): Promise<void> {
    const day = session.data.day;
    const schedule = session.data.schedule;
    await this.send(session.id, {
      text: (session.data.appointment
        ? Messages.CONFIRMREAPPOINTMENT
        : Messages.CONFIRMAPPOINTMENT
      ).format(
        schedule.specialty_description,
        schedule.professional_name,
        Weekday[day.getDay()] + " - " + format(day, "dd/MM"),
        schedule.start_time.toClockTime()
      ),
      buttons: this.buttons,
    });
    session.conversation = this;
  }

  async answer(session: UserSession, { clean_text }): Promise<void> {
    if (this.conversations[clean_text]) {
      session.data.appointment = undefined;
      return await this.conversations[clean_text].ask(session);
    }

    if (clean_text === "refazer") {
      session.conversation_stack.pop(); // Remove inform schedule
      if (!session.data.appointment) session.conversation_stack.pop(); // Remove inform day if not appointment
      return session.conversation_stack.pop().ask(session); // Ask inform specialty or inform day
    } else if (clean_text !== "confirmar") return await this.ask(session);

    const appointment = session.data.appointment;
    const day = session.data.day;
    const start_time = session.data.schedule.start_time;

    if (appointment) {
      await this.appointmentService.update(appointment.id, {
        patient_id: appointment.patient_id,
        acting_id: appointment.acting_id,
        scheduled_day: day,
        start_time: start_time,
      });

      this.send(session.id, {
        text: `Reagendamento realizado com sucesso para ${
          Weekday[day.getDay()]
        }, ${day.getDate()} de ${
          Month[day.getMonth() + 1]
        } as ${start_time.toClockTime()}.`,
      });
    } else {
      await this.appointmentService.create({
        patient_id: session.patient.id,
        scheduled_day: session.data.day,
        start_time: session.data.schedule.start_time,
        acting_id: session.data.schedule.acting_id,
      });

      this.send(session.id, { text: "Agendamento realizado com sucesso!" });
    }
    session.data = {};
    session.data.appointment = undefined;
    session.conversation = this.youAreWelcomeConversation;
    this.youAreWelcomeConversation.ask(session);
  }
}
