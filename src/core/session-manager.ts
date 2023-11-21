import { ISessionManager } from "@/domain/interfaces";
import { ClinicModel, PatientModel } from "@/domain/models";
import { UserSession } from "@/core/user-sesssion";
import { IConversation } from "@/domain/usecases";
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
