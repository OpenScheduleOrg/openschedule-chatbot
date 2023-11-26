import { Logger } from "winston";
import { IConversation } from "../usecases";
import { AppointmentModel } from "../models/appointment-model";
import { PatientModel } from "../models/patient-model";
import { ScheduleModel } from "../models/schedule-model";
import { SpecialtyModel } from "../models/specialty-model";

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
  };

  private conversation: IConversation;
  private conversation_stack: IConversation[];
  private last_interaction: number; 
  patient: PatientModel;

  constructor(readonly id: string, patient: PatientModel, readonly logger: Logger) {
    this.data = { }
    this.conversation = undefined;
    this.conversation_stack = []
    this.last_interaction = Date.now()
    this.patient = patient;
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
