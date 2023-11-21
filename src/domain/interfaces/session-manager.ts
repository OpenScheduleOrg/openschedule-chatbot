import { ClinicModel, PatientModel } from "../models";
import { UserSession } from "../../core/user-sesssion";
import { IConversation } from "../usecases";

export interface ISessionManager {
  clinic: ClinicModel;
  create(
    id: string,
    conversation: IConversation,
    patient: PatientModel
  ): UserSession;
  get(id: string): UserSession;
  close(id: string): void;
}
