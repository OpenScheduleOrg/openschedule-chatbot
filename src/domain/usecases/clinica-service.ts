import { ClinicaModel } from "../models";

export interface IClinicaService {
  loadById(id: string): Promise<IClinicaService.Model>;
}

export namespace IClinicaService {
  export type Model = ClinicaModel;
}
