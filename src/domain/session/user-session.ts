import { Logger } from "winston";
import { IConversation } from "../../presentation/conversations";
import { AppointmentModel } from "../../data/services/models/appointment-model";
import { PatientModel } from "../../data/services/models/patient-model";
import { ScheduleModel } from "../../data/services/models/schedule-model";
import { SpecialtyModel } from "../../data/services/models/specialty-model";
import { User } from "../repositories/models";

export class UserSession {

  data: {
    name?: string;
    day?: Date;
    specialty_id?: number;
    schedules?: ScheduleModel[];
    schedule?: ScheduleModel;
    appointments?: AppointmentModel[];
    appointment?: AppointmentModel;
    specialties?: SpecialtyModel[];
    patient?: PatientModel
  };

  private conversation: IConversation;
  private conversation_stack: IConversation[];
  private last_interaction: number; 

  id: string;
  name: string;
  patient_id: number;
  

  constructor(user: User, readonly logger: Logger) {
    this.data = { }
    this.conversation = undefined;
    this.conversation_stack = []
    this.last_interaction = Date.now()
    this.id = user.id;
    this.name = user.name;
    this.patient_id = user.patient_id;
  }

  setConversation(conversation: IConversation) {
    if(this.conversation)
      this.conversation_stack.push(this.conversation);
    this.conversation = conversation;

    const conversation_name = (conversation as any).constructor.name;
    this.logger.info("set conversation", { conversation: conversation_name })
  }

  getConversation(): IConversation {
    this.last_interaction = Date.now();

    const conversation_name = (this.conversation as any).constructor.name;
    this.logger.info("get conversation", { conversation: conversation_name })

    return this.conversation;
  }

  lastConversation(): IConversation {
    return this.conversation_stack.pop();
  }

  expired(seconds: number = 3600): boolean {
    return (this.last_interaction + (seconds * 1000)) < Date.now();
  }
};
