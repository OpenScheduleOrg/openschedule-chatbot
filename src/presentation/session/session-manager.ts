import { ClinicModel, PatientModel } from "@/data/services/models";
import { UserSession } from "@/domain/session/user-session";

export interface ISessionManager {
  clinic: ClinicModel;
  create(id: string): Promise<UserSession>;
  get(id: string): UserSession;
  close(id: string): void;
}
