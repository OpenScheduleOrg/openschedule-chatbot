import { NotificationModel } from "../models";

export interface INotificationService {
  loadAll(): Promise<INotificationService.Model>;
}

export namespace INotificationService {
  export type Model = NotificationModel;
}
