import { format } from "date-fns";

import { Month, Weekday } from "@/common/constants";
import { TypeConvesations } from "@/domain/interfaces";
import { ClinicaModel } from "@/domain/models";
import { UserSession } from "@/domain/models/user-sesssion";
import { IConsultaService, IHorarioService } from "@/domain/services";
import { IConversation } from "@/domain/usecases";
import { TypeSend } from "../interfaces";
import Messages from "../messages";
import { manyIndexes } from "@/common/helpers";

export class InformScheduleConversation implements IConversation {
  conversations: TypeConvesations = {};

  constructor(
    private readonly send: TypeSend,
    private readonly clinica: ClinicaModel,
    private readonly horarioService: IHorarioService,
    private readonly consultaService: IConsultaService,
    private readonly youAreWelcomeConversation: IConversation
  ) {}

  async ask(
    session: UserSession,
    { complement } = { complement: undefined }
  ): Promise<void> {
    if (complement) await this.send(session.id, { text: complement });

    const schedules = await this.horarioService.availableSchedules({
      clinica_id: this.clinica.id,
      consulta_dia: new Date(
        session.data.year,
        session.data.month - 1,
        session.data.day
      ),
    });

    if (!schedules.length) {
      await session.conversation.ask(session, {
        complement: Messages.WITHOUTFREESCHEDULES.format(
          session.data.day.toString(),
          Month[session.data.month].toLowerCase()
        ),
      });
      return;
    }

    const rows = [];
    session.data.schedules = {};

    for (let i = 0; i < schedules.length; i++) {
      rows.push({
        title: format(schedules[i], "HH:mm"),
        rowId: i + 1,
      });
      manyIndexes(
        [(i + 1).toString(), format(schedules[i], "HH:mm")],
        schedules[i],
        session.data.schedules
      );
    }

    await this.send(session.id, {
      text: session.data.appointment
        ? Messages.INFORMSCHEDULEREAPPOINTMENT.format(
            session.data.day.toString(),
            Month[session.data.month].toLowerCase()
          )
        : Messages.INFORMSCHEDULE.format(
            session.data.day.toString(),
            Month[session.data.month].toLowerCase()
          ),
      buttonText: "Horarios livres para agendametno",
      sections: [{ rows }],
    });

    session.conversation = this;
  }

  async answer(session: UserSession, { clean_text }): Promise<void> {
    if (this.conversations[clean_text]) {
      session.data.appointment = undefined;
      return await this.conversations[clean_text].ask(session);
    }

    if (
      clean_text == "volta" ||
      clean_text == "voltar" ||
      clean_text == "outro dia"
    )
      return await session.conversation_stack.pop()?.ask(session);

    const marcada = session.data.schedules[clean_text];
    if (!marcada)
      return await this.ask(session, { complement: Messages.INVALIDSCHEDULE });

    if (session.data.appointment)
      await this.consultaService.update(session.data.appointment.id, {
        marcada: new Date(format(marcada, "yyyy-MM-dd'T'HH:mm:ss'Z'")),
      });
    else
      await this.consultaService.create({
        clinica_id: this.clinica.id,
        marcada: new Date(format(marcada, "yyyy-MM-dd'T'HH:mm:ss'Z'")),
        cliente_id: session.cliente.id,
      });

    const old_appointment = session.data.appointment;
    await this.send(session.id, {
      text: old_appointment
        ? Messages.SUCCESSREAPOINTMENT.format(
            old_appointment.marcada.getDate().toString(),
            Month[old_appointment.marcada.getMonth() + 1].toLocaleLowerCase(),
            format(old_appointment.marcada, "HH:mm"),
            Weekday[marcada.getDay()].toLowerCase(),
            marcada.getDate().toString(),
            Month[marcada.getMonth() + 1].toLowerCase(),
            format(marcada, "HH:mm")
          )
        : Messages.SUCCESSAPOINTMENT.format(
            Weekday[marcada.getDay()],
            marcada.getDate().toString(),
            Month[marcada.getMonth() + 1].toLocaleLowerCase(),
            format(marcada, "HH:mm")
          ),
    });

    session.data.appointment = undefined;
    await this.youAreWelcomeConversation.ask(session);
  }
}
