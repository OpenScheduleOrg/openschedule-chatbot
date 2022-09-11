import { ClienteModel, ClinicaModel } from "../models";
import { UserSession } from "../models/user-sesssion";
import { IConversation } from "../usecases";

export interface ISessionManager {
  clinica: ClinicaModel;
  create(
    id: string,
    conversation: IConversation,
    user: ClienteModel
  ): UserSession;
  get(id: string): UserSession;
  close(id: string): void;
}
