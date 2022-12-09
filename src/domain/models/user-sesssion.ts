import { IConversation } from "../usecases";
import { AppointmentModel } from "./appointment-model";
import { PatientModel } from "./patient-model";
import { ScheduleModel } from "./schedule-model";
import { SpecialtyModel } from "./specialty-model";

export type UserSession = {
  id: string;
  patient?: PatientModel;
  conversation: IConversation;
  conversation_stack: IConversation[];
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
};
