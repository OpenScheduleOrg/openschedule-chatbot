import { format, formatISO } from "date-fns";

import { WeekdayMinimal } from "@/common/constants";
import { TypeConvesations } from "@/domain/interfaces";
import { UserSession } from "@/domain/models/user-sesssion";
import { IConversation } from "@/domain/usecases";
import { TypeSend } from "../interfaces";
import { AppointmentService } from "@/domain/services";
import { ClinicModel } from "@/domain/models";
import Messages from "../messages";

export class AppointmentsConversation implements IConversation {
  conversations: TypeConvesations = {};

  constructor(
    private readonly send: TypeSend,
    private readonly clinic: ClinicModel,
    private readonly appointmentService: AppointmentService,
    private readonly newAppointmentConversation: IConversation,
    private readonly showAppointmentConversation: IConversation,
    private readonly newUserConversation: IConversation
  ) {}

  async ask(
    session: UserSession,
    { complement } = { complement: undefined }
  ): Promise<void> {
    if (!session.patient)
      return this.newUserConversation.ask(session, {
        complement: Messages.NEEDREGISTER,
      });

    if (complement) await this.send(session.id, { text: complement });
    const now = new Date();

    const appointments = await this.appointmentService.load({
      clinic_id: this.clinic.id,
      patient_id: session.patient.id,
      start_date: formatISO(now, { representation: "date" }),
      start_time: now.getHours() * 60 + now.getMinutes(),
    });

    if (!appointments.length)
      return await this.newAppointmentConversation.ask(session, {
        complement: Messages.NOCONSULTA,
      });

    const buttons = [];
    for (let appointment of appointments) {
      buttons.push({
        buttonId: appointment.id,
        buttonText: {
          displayText: Messages.APPOINTMENTBUTTON.format(
            appointment.specialty_description,
            WeekdayMinimal[appointment.scheduled_day.getDay()],
            format(appointment.scheduled_day, "dd/MM"),
            appointment.start_time.toClockTime()
          ),
        },
        type: 1,
      });
    }

    this.send(session.id, {
      text: Messages.SHOWAPPOINTMENTS,
      buttons,
    });

    session.data.appointments = appointments;

    session.conversation = this;
  }

  async answer(session: UserSession, { clean_text }): Promise<void> {
    if (this.conversations[clean_text])
      return await this.conversations[clean_text].ask(session);

    const appointment = session.data.appointments.find(
      (a) => a.id == Number(clean_text)
    );
    if (!appointment)
      return this.ask(session, { complement: "Entrada inválida!" });

    session.data.appointment = appointment;

    await this.showAppointmentConversation.ask(session);
  }
}
