import { ISessionManager } from "@/presentation/session";
import { ClinicModel, PatientModel } from "@/data/services/models";
import { UserSession } from "@/domain/session/user-session";
import { IConversation } from "@/presentation/conversations";
import { Logger } from "winston";

export class SessionManager implements ISessionManager {
  private sessions: { [id: string]: UserSession } = {};

  constructor(readonly clinic: ClinicModel, private readonly logger: Logger) { }

  create(
    id: string,
    conversation: IConversation,
    user: PatientModel = undefined
  ): UserSession {
    const userSession = new UserSession(id, user, this.logger.child({ user_id: id }))
    userSession.setConversation(conversation);
    this.sessions[id] = userSession;

    return userSession;
  }

  get(id: string): UserSession {
    return this.sessions[id];
  }

  close(id: string): void {
    delete this.sessions[id];
  }
}
