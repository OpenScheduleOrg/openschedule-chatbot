import { HttpClient } from "@/data/http/http-client";
import { AppointmentResponseModel } from "@/data/models";
import { parseISO } from "date-fns";
import { AppointmentModel } from "../models";
import { AppointmentBody, AppointmentFilter } from "../params";

export class AppointmentService {
  constructor(private readonly httpClient: HttpClient) {}

  create = async (body: AppointmentBody): Promise<AppointmentModel> => {
    const appointment = await this.httpClient.post<AppointmentResponseModel>(
      "/appointments",
      { body }
    );

    return {
      ...appointment,
      scheduled_day: parseISO(appointment.scheduled_day),
    };
  };

  update = async (
    id: number,
    body: AppointmentBody
  ): Promise<AppointmentModel> => {
    const appointment = await this.httpClient.put<AppointmentResponseModel>(
      `/appointments/${id}`,
      { body }
    );

    return {
      ...appointment,
      scheduled_day: parseISO(appointment.scheduled_day),
    };
  };

  load = async (filters?: AppointmentFilter): Promise<AppointmentModel[]> => {
    const appoitments = await this.httpClient.get<AppointmentResponseModel[]>(
      "/appointments",
      { params: filters }
    );

    return appoitments.map((ap) => ({
      ...ap,
      scheduled_day: parseISO(ap.scheduled_day),
    }));
  };

  getById = async (id: number): Promise<AppointmentModel> => {
    const appointment = await this.httpClient.get<AppointmentResponseModel>(
      `/appointments/${id}`
    );

    return {
      ...appointment,
      scheduled_day: parseISO(appointment.scheduled_day),
    };
  };

  deleteById = async (id: number): Promise<void> => {
    await this.httpClient.delete(`/appointments/${id}`);
  };
}
