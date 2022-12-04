import { ClinicModel, ClienteModel } from "../models";
import { UserSession } from "../models/user-sesssion";
import { IConversation } from "../usecases";

export interface ISessionManager {
  clinic: ClinicModel;
  create(
    id: string,
    conversation: IConversation,
    user: ClienteModel
  ): UserSession;
  get(id: string): UserSession;
  close(id: string): void;
}
