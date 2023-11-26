import { TypeRead, TypeSend } from "@/presentation/apps/send-read";

export interface MessageApp {
  read: TypeRead;
  send: TypeSend;
  connect(): Promise<void>;
}
