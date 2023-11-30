import { Logger } from "winston";
import { IConversation } from "../../presentation/conversations";
import { AppointmentModel } from "../../data/services/models/appointment-model";
import { PatientModel } from "../../data/services/models/patient-model";
import { ScheduleModel } from "../../data/services/models/schedule-model";
import { SpecialtyModel } from "../../data/services/models/specialty-model";
import { User } from "../repositories/models";
import config from "@/common/config";

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
  private last_interaction: Date; 

  id: string;
  name: string;
  patient_id: number;
  last_feedback: Date;
  last_rating: Date;

  constructor(user: User, readonly logger: Logger) {
    this.data = { }
    this.conversation = undefined;
    this.conversation_stack = []
    this.last_interaction = user.last_interaction;
    this.id = user.id;
    this.name = user.name;
    this.patient_id = user.patient_id;
    this.last_rating = user.last_rating;
    this.last_feedback = user.last_feedback;
  }

  setConversation(conversation: IConversation) {
    if(this.conversation)
      this.conversation_stack.push(this.conversation);
    this.conversation = conversation;

    const conversation_name = (conversation as any).constructor.name;
    this.logger.info("set conversation", { conversation: conversation_name })
  }

  getConversation(): IConversation {
    this.last_interaction = new Date();

    const conversation_name = (this.conversation as any).constructor.name;
    this.logger.info("get conversation", { conversation: conversation_name })

    return this.conversation;
  }

  lastConversation(): IConversation {
    return this.conversation_stack.pop();
  }

  expired(seconds: number = 3600): boolean {
    return (this.last_interaction.getTime() + (seconds * 1000)) < Date.now();
  }

  requestRating(): boolean {
    return !this.last_rating || this.last_rating.addSeconds(config.REQUESTRATING_PERIOD * 24 * 60 * 60) < new Date();
  }

  requestFeedback(): boolean {
    return !this.last_feedback || this.last_feedback.addSeconds(config.REQUESTFEEDBACK_PERIOD * 24 * 60 * 60) < new Date();
  }
};
