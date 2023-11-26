import { ClinicModel, PatientModel } from "../models";
import { UserSession } from "@/domain/session/user-session";
import { IConversation } from "@/domain/usecases";

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
