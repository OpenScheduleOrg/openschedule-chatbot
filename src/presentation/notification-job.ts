import { INotificationService } from "@/domain/services";
import { IMessageApp } from "@/infra/interfaces/message-app";
import { TypeSend } from "./interfaces";
import { MessageInfo } from "./models";

export class NotificationJob {
  send: TypeSend;

  constructor(
    app: IMessageApp,
    private readonly notificationService: INotificationService
  ) {
    this.send = app.send;
  }

  run = async (): Promise<void> => {
    const notifications = await this.notificationService.loadAll();
    for (const phone in notifications) this.notify(phone, notifications[phone]);
  };

  notify = async (id: string, messages: string[]): Promise<void> => {
    for (const msg of messages) await this.send(id, { text: msg });
  };
}
