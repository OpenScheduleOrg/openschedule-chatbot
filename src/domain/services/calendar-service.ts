import { HttpClient } from "@/data/http/http-client";
import { ScheduleResponseModel, SpecialtyResponseModel } from "@/data/models";
import { ScheduleModel, SpecialtyModel } from "../models";
import { CalendarParams } from "../params";
import { parseISO } from "date-fns";

export class CalendarService {
  constructor(private readonly httpClient: HttpClient) {}

  loadSpecialties = async (
    params: CalendarParams
  ): Promise<SpecialtyModel[]> => {
    return await this.httpClient.get<SpecialtyResponseModel[]>(
      "/calendar/specialties",
      { params }
    );
  };

  freeDays = async (params: CalendarParams): Promise<Date[]> => {
    return (
      await this.httpClient.get<string[]>("/calendar/free/days", { params })
    ).map((d) => parseISO(d));
  };

  availableSchedules = async (
    params: CalendarParams
  ): Promise<ScheduleModel[]> => {
    return (
      await this.httpClient.get<ScheduleResponseModel[]>(
        "/calendar/available/schedules",
        { params }
      )
    ).map((sc) => ({
      ...sc,
      start_date: parseISO(sc.start_date),
      end_date: sc.end_date ? parseISO(sc.end_date) : undefined,
    }));
  };
}
