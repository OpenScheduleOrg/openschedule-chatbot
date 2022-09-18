import { ISessionManager } from "@/domain/interfaces";
import { ClinicaModel, ClienteModel } from "@/domain/models";
import { UserSession } from "@/domain/models/user-sesssion";
import { IConversation } from "@/domain/usecases";

export class SessionManager implements ISessionManager {
  private sessions: { [id: string]: UserSession } = {};

  constructor(readonly clinica: ClinicaModel) {}

  create(
    id: string,
    conversation: IConversation,
    user: ClienteModel = undefined
  ): UserSession {
    return (this.sessions[id] = {
      id: id,
      userinfo: user,
      conversation: conversation,
      conversation_stack: [],
      data: {},
    });
  }

  get(id: string): UserSession {
    return this.sessions[id];
  }

  close(id: string): void {
    delete this.sessions[id];
  }
}
