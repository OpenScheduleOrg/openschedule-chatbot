import { INotificationService } from "@/domain/services";
import { Axios, AxiosResponse } from "axios";
import { ResponseNotificationModel } from "../models";

export class NotificationService implements INotificationService {
  constructor(
    private readonly url: string,
    private readonly httpClient: Axios
  ) {}

  async loadAll(): Promise<INotificationService.Model> {
    return (
      await this.httpClient.get<any, AxiosResponse<ResponseNotificationModel>>(
        this.url
      )
    ).data.data.notifications;
  }
}
