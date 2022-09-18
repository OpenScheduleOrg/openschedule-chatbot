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
        title: format(schedules[i], "kk:mm"),
        rowId: i + 1,
      });
      manyIndexes(
        [(i + 1).toString(), format(schedules[i], "kk:mm")],
        schedules[i],
        session.data.schedules
      );
    }

    await this.send(session.id, {
      text: Messages.INFORMSCHEDULE.format(
        session.data.day.toString(),
        Month[session.data.month].toLowerCase()
      ),
      buttonText: "Horarios livres para agendametno",
      sections: [{ rows }],
    });

    session.conversation = this;
  }

  async answer(session: UserSession, { clean_text }): Promise<void> {
    if (this.conversations[clean_text])
      return await this.conversations[clean_text].ask(session);

    const marcada = session.data.schedules[clean_text];
    if (!marcada)
      return await this.ask(session, { complement: Messages.INVALIDSCHEDULE });

    const consulta = await this.consultaService.create({
      clinica_id: this.clinica.id,
      marcada,
      cliente_id: session.cliente.id,
    });

    await this.send(session.id, {
      text: Messages.SUCCESSAPOINTMENT.format(
        Weekday[marcada.getDay()],
        marcada.getDate().toString(),
        Month[marcada.getMonth() + 1].toLocaleLowerCase(),
        format(marcada, "kk:mm")
      ),
    });

    await this.youAreWelcomeConversation.ask(session);
  }
}
