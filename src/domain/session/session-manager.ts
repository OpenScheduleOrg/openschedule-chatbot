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

		if (patient && !user) {
			user = { id, name: patient.name, patient_id: patient.id };
			await this.userRepository.insert(user);
		} else if (patient && user && patient.name != user.name && patient.id && user.id) {
			user.patient_id = patient.id;
			user.name = patient.name;
		}

		user.last_interaction = new Date();

		this.userRepository.update(user);

		const userSession = new Proxy(new UserSession(user, this.logger.child({ user_id: id })), { set: this.updateUserProxy })

		this.sessions[id] = userSession;
		return userSession;
	}

	updateUserProxy = (target, prop, val): boolean => {
		if(prop == "last_interaction")
			this.userRepository.update({ id: target.id, last_interaction: val} as User)
		else if(prop == "last_rating")
				this.userRepository.update({ id: target.id, last_rating: val} as User)
		else if(prop == "last_feedback")
				this.userRepository.update({ id: target.id, last_feedback: val} as User)
		else if(prop == "name")
			this.userRepository.update({ id: target.id, name: val} as User)
		else if(prop == "patient_id")
			this.userRepository.update({ id: target.id, patient_id: val} as User)

		target[prop] = val;
		return true;
	}

	get(id: string): UserSession {
		return this.sessions[id];
	}

	close(id: string): void {
		delete this.sessions[id];
	}
}
