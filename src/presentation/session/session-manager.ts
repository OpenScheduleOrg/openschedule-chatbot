import { ClinicModel, PatientModel } from "@/domain/models";
import { UserSession } from "@/domain/session/user-session";
import { IConversation } from "@/presentation/conversations";

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
