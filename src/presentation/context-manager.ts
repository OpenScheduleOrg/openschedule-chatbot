import { slugify } from "@/common/helpers";
import { ISessionManager } from "@/domain/interfaces";
import { PatientService } from "@/domain/services";
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
    private readonly patientService: PatientService,
    private readonly newUserConversation: IConversation,
    private readonly welcomeBackConversation: IConversation
  ) {
    app.read = this.read;
    this.send = app.send;
  }

  read: TypeRead = async (id: string, content: MessageInfo) => {
    let session = this.sessionManager.get(id);
    try {
      content.text = content.text.trim();

      if (!session) {
        const patient = await this.patientService
          .getByPhone(id)
          .catch(() => undefined);
        session = this.sessionManager.create(
          id,
          patient ? this.welcomeBackConversation : this.newUserConversation,
          patient
        );
        if (!patient) return await session.conversation.ask(session);
      }
      await session.conversation.answer(session, {
        text: content.text,
        clean_text: slugify(content.text),
      });
    } catch (e) {
      console.error(e);
      console.log(
        "\n\nRECEIVED MESSAGE: ",
        JSON.stringify(content, undefined, 2)
      );
      console.log(
        "\n\nSESSION STATE: ",
        JSON.stringify(
          {
            id: session.id,
            conversation: session.conversation?.constructor.name,
            conversation_stack: session.conversation_stack.map(
              (c) => c.constructor.name
            ),
          },
          undefined,
          2
        )
      );
      this.sessionManager.close(id);
      await this.send(id, { text: Messages.TECHNICALPROBLEMS });
    }
  };

  async connect(): Promise<void> {
    await this.app.connect();
  }
}
