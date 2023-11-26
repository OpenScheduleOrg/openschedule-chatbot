import { TypeConvesations } from "@/presentation/session";
import { ClinicModel } from "@/domain/models";
import { UserSession } from "@/domain/session/user-session";
import { CalendarService } from "@/domain/services";
import { IConversation } from "@/presentation/conversations";
import { TypeSend } from "@/presentation/apps/send-read";
import Messages from "@/presentation/messages";

export class InformSpecialtyConversation implements IConversation {
  conversations: TypeConvesations = {};

  constructor(
    private readonly send: TypeSend,
    private readonly clinic: ClinicModel,
    private readonly calendarService: CalendarService,
    private readonly informDayConversation: IConversation,
    private readonly optionsConversation: IConversation
  ) {}

  async ask(
    session: UserSession,
    { complement } = { complement: undefined }
  ): Promise<void> {
    if (complement) await this.send(session.id, { text: complement });

    const clinic_specialties = await this.calendarService.loadSpecialties({
      clinic_id: this.clinic.id,
    });

    if (!clinic_specialties.length) {
      return await this.optionsConversation.ask(session, {
        complement: Messages.WITHOUTSPECIALTIES,
        title: "Mas, aqui temos outras de nossas funcionalidades:",
      });
    }

    const buttons = [];

    for (const specialty of clinic_specialties) {
      buttons.push({
        buttonText: { displayText: specialty.description },
        buttonId: specialty.id,
        type: 1,
      });
    }

    session.data.specialties = clinic_specialties;

    await this.send(session.id, {
      text: "Especialidade do agendamento?\n\nDigite *cancelar* para voltar ou selecione umas das opções abaixo:",
      buttons: buttons,
    });

    session.setConversation(this);
  }

  async answer(session: UserSession, { clean_text }): Promise<void> {
    if (this.conversations[clean_text]) {
      session.data.appointment = undefined;
      return await this.conversations[clean_text].ask(session);
    }

    if (clean_text == "volta" || clean_text == "voltar")
      return await session.lastConversation().ask(session);

    const specialty_id = Number(clean_text);

    if (!session.data.specialties.find((s) => s.id == specialty_id))
      return await this.ask(session, { complement: Messages.INVALIDSPECIALTY });

    session.data.specialty_id = specialty_id;

    await this.informDayConversation.ask(session);
  }
}
