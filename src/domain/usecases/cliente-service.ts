import { ClienteModel } from "../models";

export interface IClienteService {
  create(body: IClienteService.Body): Promise<IClienteService.Model>;
  loadByPhone(phone: string): Promise<IClienteService.Model>;
}

export namespace IClienteService {
  export type Body = {
    nome: string;
    sobrenome: string;
    cpf: string;
    telefone: string;
  };

  export type Model = ClienteModel;
}
