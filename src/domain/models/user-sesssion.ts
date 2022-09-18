import { IConversation } from "../usecases";
import { ClienteModel } from "./cliente-model";

export type UserSession = {
  id: string;
  cliente?: ClienteModel;
  conversation: IConversation;
  conversation_stack: IConversation[];
  data: {
    name?: string;
    last_name?: string;
    year?: number;
    month?: number;
    day?: number;
    schedules?: { [index: string]: Date };
  };
};
