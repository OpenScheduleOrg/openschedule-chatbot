import { TypeConvesations } from "@/domain/interfaces";
import { UserSession } from "@/domain/models/user-sesssion";
import { IClienteService } from "@/domain/services";
import { IConversation } from "@/domain/usecases";
import { TypeSend } from "../interfaces";
import Messages from "../messages";

export class InformCpfConversation implements IConversation {
  conversations: TypeConvesations = {};

  constructor(
    private readonly send: TypeSend,
    private readonly clienteService: IClienteService,
    private readonly optionsConversation: IConversation
  ) {}

  async ask(session: UserSession): Promise<void> {
    this.send(session.id, { text: Messages.INFORMCPF });
    session.conversation = this;
  }

  async answer(session: UserSession, { text, clean_text }): Promise<void> {
    if (this.conversations[clean_text])
      return await this.conversations[clean_text].ask(session);

    const cpf = text.replace(/\D/g, "");
    if (!cpf.match(/^\d{11}$/))
      return this.send(session.id, { text: Messages.INVALIDCPF });
    session.cliente = await this.clienteService.create({
      nome: session.data.name,
      sobrenome: session.data.last_name,
      cpf: cpf,
      telefone: session.id,
    });
    await this.send(session.id, { text: Messages.SUCCESSREGISTER });

    await this.optionsConversation.ask(session, {
      complement: Messages.THANKS,
    });
  }
}
