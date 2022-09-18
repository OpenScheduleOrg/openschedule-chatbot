import { Axios, AxiosResponse } from "axios";

import { IHorarioService } from "@/domain/services";
import { ResponseHorariosModel } from "../models";

export class HorarioService implements IHorarioService {
  constructor(
    private readonly url: string,
    private readonly httpClient: Axios
  ) {}

  async availableDays(params: IHorarioService.Params): Promise<number[]> {
    return (
      await this.httpClient.get<any, AxiosResponse<ResponseHorariosModel>>(
        this.url + "/dias/livres",
        { params }
      )
    ).data.data.dias;
  }

  async availableSchedules(params: IHorarioService.Params): Promise<Date[]> {
    return (
      await this.httpClient.get<any, AxiosResponse<ResponseHorariosModel>>(
        this.url + "/livres",
        { params }
      )
    ).data.data.horarios_livres.map((s) => new Date(s));
  }
}
