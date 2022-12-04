import { format } from "date-fns";

import { Month, WeekdayMinimal } from "@/common/constants";
import { TypeConvesations } from "@/domain/interfaces";
import { UserSession } from "@/domain/models/user-sesssion";
import { IConversation } from "@/domain/usecases";
import { TypeSend } from "../interfaces";
import { IConsultaService } from "@/domain/services";
import { ClinicModel } from "@/domain/models";
import Messages from "../messages";
import { manyIndexes } from "@/common/helpers";

export class AppointmentsConversation implements IConversation {
  conversations: TypeConvesations = {};

  constructor(
    private readonly send: TypeSend,
    private readonly clinic: ClinicModel,
    private readonly consultaService: IConsultaService,
    private readonly newAppointmentConversation: IConversation,
    private readonly showAppointmentConversation: IConversation,
    private readonly newUserConversation: IConversation,
    private readonly optionsConversation: IConversation
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

    const appointments = await this.consultaService.loadAll({
      cliente_id: String(session.patient.id),
      clinica_id: String(this.clinic.id),
      date_start: new Date(format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'Z'")),
    });

    if (!appointments.length)
      return await this.newAppointmentConversation.ask(session, {
        complement: Messages.NOCONSULTA,
      });

    session.data.appointments = {};
    const buttons = [];
    for (let i = 0; i < appointments.length; i++) {
      const appointment = appointments[i];
      buttons.push({
        buttonId: (i + 1).toString(),
        buttonText: {
          displayText: Messages.APPOINTMENTBUTTON.format(
            WeekdayMinimal[appointment.marcada.getDay()],
            appointment.marcada.getDate().toString(),
            Month[appointment.marcada.getMonth() + 1].toLocaleLowerCase(),
            format(appointment.marcada, "HH:mm")
          ),
        },
        type: 1,
      });
      manyIndexes(
        [(i + 1).toString(), format(appointment.marcada, "dd/MM HH:mm")],
        appointment,
        session.data.appointments
      );
    }

    this.send(session.id, {
      text: Messages.SHOWAPPOINTMENTS,
      buttons,
    });

    session.conversation = this;
  }

  async answer(session: UserSession, { clean_text }): Promise<void> {
    if (this.conversations[clean_text])
      return await this.conversations[clean_text].ask(session);

    if (!session.data.appointments[clean_text])
      return await this.optionsConversation.ask(session, {
        complement: Messages.SORRYUDERSTAND,
      });

    session.data.appointment = session.data.appointments[clean_text];

    await this.showAppointmentConversation.ask(session);
  }
}
