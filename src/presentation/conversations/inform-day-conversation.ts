import { lastDayOfMonth } from "date-fns";

import { Month, Weekday } from "@/common/constants";
import { TypeConvesations } from "@/domain/interfaces";
import { ClinicaModel } from "@/domain/models";
import { UserSession } from "@/domain/models/user-sesssion";
import { IHorarioService } from "@/domain/services";
import { IConversation } from "@/domain/usecases";
import { TypeSend } from "../interfaces";
import Messages from "../messages";

export class InformDayConversation implements IConversation {
  conversations: TypeConvesations = {};

  constructor(
    private readonly send: TypeSend,
    private readonly clinica: ClinicaModel,
    private readonly horarioService: IHorarioService,
    private readonly informScheduleConversation: IConversation
  ) {}

  async ask(
    session: UserSession,
    { complement } = { complement: undefined }
  ): Promise<void> {
    if (complement) await this.send(session.id, { text: complement });
    const month = session.data.month - 1;

    const days = await this.horarioService.availableDays({
      clinica_id: this.clinica.id,
      month: month + 1,
    });

    if (!days.length) {
      await this.send(session.id, { text: Messages.WITHOUTFREEDAYS });
      return;
    }
    const rows = [];

    for (const day of days) {
      rows.push({
        title: `${day.toString()} - ${
          Weekday[new Date(session.data.year, month, day).getDay()]
        } `,
        rowId: day.toString(),
      });
    }

    await this.send(session.id, {
      text: session.data.appointment
        ? Messages.INFORMDAYREAPOINTMENT.format(
            Month[session.data.month].toLowerCase()
          )
        : Messages.INFORMDAY.format(Month[session.data.month].toLowerCase()),
      buttonText: "Dias disponíveis para agendamento",
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
      clean_text == "outro mês" ||
      clean_text == "outro mes"
    )
      return await session.conversation_stack.pop()?.ask(session);

    const day = Number(clean_text);

    if (
      isNaN(day) ||
      day < 1 ||
      day >
        lastDayOfMonth(
          new Date(session.data.year, session.data.month)
        ).getDate()
    )
      return await this.ask(session, { complement: Messages.INVALIDDAY });

    session.data.day = day;

    session.conversation_stack.push(this);
    await this.informScheduleConversation.ask(session);
  }
}
