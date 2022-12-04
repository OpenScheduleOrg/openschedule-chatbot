import { IConversation } from "../usecases";
import { ConsultaModel } from "./consulta-model";
import { PatientModel } from "./patient-model";

export type UserSession = {
  id: string;
  patient?: PatientModel;
  conversation: IConversation;
  conversation_stack: IConversation[];
  data: {
    name?: string;
    year?: number;
    month?: number;
    day?: number;
    schedules?: { [index: string]: Date };
    appointments?: { [index: string]: ConsultaModel };
    appointment?: ConsultaModel;
  };
};
