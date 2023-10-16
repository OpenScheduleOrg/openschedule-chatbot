import { TypeRead, TypeSend } from "@/presentation/interfaces";

export interface MessageApp {
  read: TypeRead;
  send: TypeSend;
  connect(): Promise<void>;
}
