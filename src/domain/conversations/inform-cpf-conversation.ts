import { TypeConvesations } from "@/presentation/session";
import { UserSession } from "@/domain/session/user-session";
import { PatientService } from "@/domain/services";
import { IConversation } from "@/presentation/conversations";
import { TypeSend } from "@/presentation/apps/send-read";
import Messages from "@/presentation/messages";

export class InformCpfConversation implements IConversation {
  conversations: TypeConvesations = {};

  constructor(
    private readonly send: TypeSend,
    private readonly patientService: PatientService,
    private readonly optionsConversation: IConversation
  ) {}

  async ask(session: UserSession): Promise<void> {
    this.send(session.id, { text: Messages.INFORMCPF });
    session.setConversation(this);
  }

  async answer(session: UserSession, { text, clean_text }): Promise<void> {
    if (this.conversations[clean_text])
      return await this.conversations[clean_text].ask(session);

    if (
      clean_text == "volta" ||
      clean_text == "voltar" ||
      clean_text == "corrige nome" ||
      clean_text == "corrigir nome" ||
      clean_text == "outro nome"
    )
      return await session.lastConversation().ask(session);

    const cpf = text.replace(/\D/g, "");
    if (!cpf.match(/^\d{11}$/))
      return this.send(session.id, { text: Messages.INVALIDCPF });
    session.patient = await this.patientService.create({
      name: session.data.name,
      cpf: cpf,
      phone: session.id,
    });
    await this.send(session.id, { text: Messages.SUCCESSREGISTER });

    await this.optionsConversation.ask(session, {
      complement: Messages.THANKS,
    });
  }
}
