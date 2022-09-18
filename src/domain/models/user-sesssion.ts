import { IConversation } from "../usecases";
import { ClienteModel } from "./cliente-model";

export type UserSession = {
  id: string;
  userinfo?: ClienteModel;
  conversation: IConversation;
  conversation_stack: IConversation[];
  data: {
    name?: string;
    last_name?: string;
    year?: number;
    month?: number;
    day?: number;
    schedules?: Date[];
  };
};
