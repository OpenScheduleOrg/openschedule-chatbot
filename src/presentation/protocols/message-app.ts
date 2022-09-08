import { TypeRead, TypeSend } from "@/presentation/interfaces";

export interface IMessageApp {
  read: TypeSend;
  send: TypeRead;
  connect(): Promise<void>;
}
