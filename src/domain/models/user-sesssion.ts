import { IConversation } from "../usecases";
import { ClienteModel } from "./cliente-model";

export type UserSession = {
  id: string;
  userinfo?: ClienteModel;
  conversation: IConversation;
  data: { name?: string; last_name?: string };
};
