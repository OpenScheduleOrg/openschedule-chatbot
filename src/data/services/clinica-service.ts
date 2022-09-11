import { Axios, AxiosResponse } from "axios";

import { IClinicaService } from "@/domain/services";
import { ResponseClinicaModel } from "../models";

export class ClinicaService implements IClinicaService {
  constructor(
    private readonly url: string,
    private readonly httpClient: Axios
  ) {}

  async loadById(id: string): Promise<IClinicaService.Model> {
    return (
      await this.httpClient.get<any, AxiosResponse<ResponseClinicaModel>>(
        this.url + "/" + id
      )
    ).data.data.clinica;
  }
}
