import { Axios, AxiosResponse } from "axios";

import { IClienteService } from "@/domain/usecases";
import { ResponseClienteModel } from "../models";

export class ClienteService implements IClienteService {
  constructor(
    private readonly url: string,
    private readonly httpClient: Axios
  ) {}
  async create(body: IClienteService.Body): Promise<IClienteService.Model> {
    return (
      await this.httpClient.post<any, AxiosResponse<ResponseClienteModel>>(
        this.url,
        body
      )
    ).data.data.cliente;
  }

  async loadByPhone(phone: string): Promise<IClienteService.Model> {
    return (
      await this.httpClient.get<any, AxiosResponse<ResponseClienteModel>>(
        this.url,
        {
          params: {
            telefone: phone,
          },
        }
      )
    ).data.data.cliente;
  }
}
