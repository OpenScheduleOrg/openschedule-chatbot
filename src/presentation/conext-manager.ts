import { ISessionManager } from "@/domain/interfaces";
import { IClienteService } from "@/domain/services";
import { IConversation } from "@/domain/usecases";
import { IMessageApp } from "@/infra/interfaces/message-app";
import { IContextManager, TypeSend, TypeRead } from "./interfaces";
import Messages from "./messages";
import { MessageInfo } from "./models";

export class ContextManager implements IContextManager {
  send: TypeSend;

  constructor(
    private readonly app: IMessageApp,
    private readonly sessionManager: ISessionManager,
    private readonly clienteService: IClienteService,
    private readonly newUserConversation: IConversation,
    private readonly welcomeBackConversation: IConversation
  ) {
    app.read = this.read;
    this.send = app.send;
  }

  read: TypeRead = async (id: string, content: MessageInfo) => {
    try {
      let session = this.sessionManager.get(id);
      if (!session) {
        const cliente = await this.clienteService.loadByPhone(id);
        session = this.sessionManager.create(
          id,
          cliente ? this.welcomeBackConversation : this.newUserConversation,
          cliente
        );
        if (!cliente) {
          await session.conversation.ask(session);
          return;
        }
      }
      await session.conversation.answer(session, content.text);
    } catch (e) {
      this.sessionManager.close(id);
      await this.send(id, { text: Messages.TECHNICALPROBLEMS });
    }
  };

  async connect(): Promise<void> {
    await this.app.connect();
  }
}
