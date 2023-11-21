import { slugify } from "@/common/helpers";
import { ISessionManager } from "@/domain/interfaces";
import { PatientService } from "@/domain/services";
import { IConversation } from "@/domain/usecases";
import { MessageApp } from "@/presentation/apps";
import { IContextManager, TypeSend, TypeRead } from "./interfaces";
import Messages from "./messages";
import { MessageInfo } from "./models";
import { Logger } from "winston";

export class ContextManager implements IContextManager {
  send: TypeSend;

  constructor(
    private readonly app: MessageApp,
    private readonly sessionManager: ISessionManager,
    private readonly patientService: PatientService,
    private readonly newUserConversation: IConversation,
    private readonly welcomeBackConversation: IConversation,
    private readonly logger: Logger 
  ) {
    app.read = this.read;
    this.send = app.send;
  }

  read: TypeRead = async (id: string, content: MessageInfo) => {
    let session = this.sessionManager.get(id);
    try {
      content.text = content.text.trim();

      if (!session) {
        try {
          const patient = await this.patientService.getByPhone(id);
          session = this.sessionManager.create(id, this.welcomeBackConversation, patient);
        } catch (error) {
          session = this.sessionManager.create(id, this.newUserConversation, undefined);
          return await session.getConversation().ask(session);
        }
      }

      await session.getConversation().answer(session, {
        text: content.text,
        clean_text: slugify(content.text),
      });
    } catch (e) {
      this.logger.error(e.message);
      this.sessionManager.close(id);
      await this.send(id, { text: Messages.TECHNICALPROBLEMS });
    }
  };

  async connect(): Promise<void> {
    await this.app.connect();
  }
}
