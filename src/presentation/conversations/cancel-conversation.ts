import { format } from "date-fns";
import { Month, Weekday } from "@/common/constants";
import { TypeConvesations } from "@/domain/interfaces";
import { UserSession } from "@/domain/models/user-sesssion";
import { IConsultaService } from "@/domain/services";
import { IConversation } from "@/domain/usecases";
import { TypeSend } from "../interfaces";
import Messages from "../messages";

export class CancelConversation implements IConversation {
  conversations: TypeConvesations = {};

  constructor(
    private readonly send: TypeSend,
    private readonly consultaService: IConsultaService,
    private readonly youAreWelcomeConversation: IConversation
  ) {}

  async ask(session: UserSession): Promise<void> {
    const appointment = session.data.appointment;

    await this.send(session.id, {
      text: Messages.CANCELAPPOINTMENT.format(
        Weekday[appointment.marcada.getDay()].toLowerCase(),
        appointment.marcada.getDate().toString(),
        Month[appointment.marcada.getMonth() + 1].toLowerCase(),
        format(appointment.marcada, "HH:mm")
      ),
      buttons: Messages.SNBUTTONS,
    });
    session.conversation = this;
  }

  async answer(session: UserSession, { clean_text }): Promise<void> {
    if (this.conversations[clean_text]) {
      session.data.appointment = undefined;
      await this.conversations[clean_text].ask(session);
    }

    if (clean_text === "sim") {
      const appointment = session.data.appointment;
      await this.consultaService.delete(session.data.appointment.id);
      await this.send(session.id, {
        text: Messages.CANCELEDAPPOINTMENT.format(
          appointment.marcada.getDate().toString(),
          Month[appointment.marcada.getMonth() + 1].toLowerCase(),
          format(appointment.marcada, "HH:mm")
        ),
      });
      session.data.appointment = undefined;
      await this.youAreWelcomeConversation.ask(session);
    } else if (clean_text == "nao") {
      await session.conversation_stack.pop()?.ask(session);
    } else await this.send(session.id, { text: Messages.SORRYNOTUDERSTAND });
  }
}
