import { TypeRead, TypeSend } from "@/presentation/session";

export interface MessageApp {
  read: TypeRead;
  send: TypeSend;
  connect(): Promise<void>;
}
