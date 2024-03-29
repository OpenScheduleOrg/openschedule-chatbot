import { slugify } from "@/common/helpers";
import { ISessionManager } from "@/presentation/session";
import { PatientService } from "@/data/services";
import { IConversation } from "@/presentation/conversations";
import { MessageApp } from "@/presentation/apps";
import Messages from "./messages";
import { Logger } from "winston";
import { TypeRead, TypeSend } from "./apps/send-read";
import { MessageInfo } from "./apps/message-info";

export class ContextManager {
  send: TypeSend;

  constructor(
    private readonly app: MessageApp,
    private readonly sessionManager: ISessionManager,
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
          session = await this.sessionManager.create(id);
          session.setConversation(session.patient_id ? this.welcomeBackConversation : this.newUserConversation)
      }

      await session.getConversation().answer(session, { text: content.text, clean_text: slugify(content.text) });
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
