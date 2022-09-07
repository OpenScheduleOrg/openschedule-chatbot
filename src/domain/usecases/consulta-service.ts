import { ConsultaModel } from "../models";

export interface IConsultaService {
  create(body: IConsuleService.Body): Promise<IConsuleService.Model>;
  update(
    id: string,
    body: IConsuleService.Body
  ): Promise<IConsuleService.Model>;
  loadAll(params: IConsuleService.Params): Promise<IConsuleService.Model[]>;
  delete(id: string): Promise<void>;
}

export namespace IConsuleService {
  export type Body = {
    clinica_id?: string;
    cliente_id?: string;
    marcada: Date;
  };
  export type Params = {
    clinica_id: string;
    cliente_id: string;
    date_start: Date;
  };
  export type Model = ConsultaModel;
}
