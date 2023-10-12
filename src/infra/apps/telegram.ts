import { IMessageApp } from "@/infra/interfaces/message-app";
import { MessageTemplate } from "@/presentation/models";
import { TypeRead } from "@/presentation/interfaces";

export class Telegram implements IMessageApp {
  read: TypeRead;

  constructor(private readonly token: string) {};

  send = async (id: string, message: MessageTemplate) => {
    throw new Error("Not implemented")
  };

  async connect() {
    throw new Error("Not implemented")
  }
}
