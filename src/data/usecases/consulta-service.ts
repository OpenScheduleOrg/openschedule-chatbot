import { Axios, AxiosResponse } from "axios";

import { IConsuleService, IConsultaService } from "@/domain/usecases";
import { ResponseConsultaModel, ResponseConsultasModel } from "../models";

export class ConsultaService implements IConsultaService {
  constructor(
    private readonly url: string,
    private readonly httpClient: Axios
  ) {}

  async create(body: IConsuleService.Body): Promise<IConsuleService.Model> {
    const response_consulta = (
      await this.httpClient.post<any, AxiosResponse<ResponseConsultaModel>>(
        this.url,
        body
      )
    ).data.data.consulta;

    return {
      ...response_consulta,
      marcada: new Date(response_consulta.marcada),
    };
  }

  async update(
    id: string,
    body: IConsuleService.Body
  ): Promise<IConsuleService.Model> {
    const response_consulta = (
      await this.httpClient.put<any, AxiosResponse<ResponseConsultaModel>>(
        this.url + "/" + id,
        body
      )
    ).data.data.consulta;

    return {
      ...response_consulta,
      marcada: new Date(response_consulta.marcada),
    };
  }

  async loadAll(
    params: IConsuleService.Params
  ): Promise<IConsuleService.Model[]> {
    return (
      await this.httpClient.get<any, AxiosResponse<ResponseConsultasModel>>(
        this.url,
        { params }
      )
    ).data.data.consultas.map((c) => {
      return { ...c, marcada: new Date(c.marcada) };
    });
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(this.url + "/" + id);
  }
}
