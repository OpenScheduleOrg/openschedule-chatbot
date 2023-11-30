import { ISessionManager } from "@/presentation/session";
import { ClinicModel } from "@/data/services/models";
import { UserSession } from "@/domain/session/user-session";
import { Logger } from "winston";
import { PatientService } from "@/data/services";
import { UserFields } from "../repositories/fields";
import { User } from "../repositories/models";
import { Repository } from "../repositories/repository";
import { ResourceNotFoundError } from "@/infra/errors";

export class SessionManager implements ISessionManager {
  private sessions: { [id: string]: UserSession } = {};

  constructor(readonly clinic: ClinicModel, private readonly logger: Logger,
    private readonly patientService: PatientService, private readonly userRepository: Repository<User, UserFields>
  ) { }

  async create(id: string): Promise<UserSession> {
    let patient = undefined;
    try {
      patient = await this.patientService.getByPhone(id);
    } catch (error) {
      if (!(error instanceof ResourceNotFoundError))
        throw error;
    }

    let user = await this.userRepository.findById(id);

    if(patient && !user){ 
      user = { id, name: patient.name, patient_id: patient.id };
      await this.userRepository.insert(user);
    } else if(patient && user && patient.name != user.name && patient.id && user.id) {
      user.patient_id= patient.id;
      user.name = patient.name;
      this.userRepository.update(user);
    }

    const userSession = new UserSession(user, this.logger.child({ user_id: id }))

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
