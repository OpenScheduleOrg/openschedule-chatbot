import { TypeRead, TypeSend } from "@/presentation/interfaces";

export interface IMessageApp {
  read: TypeRead;
  send: TypeSend;
  connect(): Promise<void>;
}
