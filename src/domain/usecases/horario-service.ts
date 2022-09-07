export interface IHorarioService {
  availables(params: IHorarioService.Params): Promise<Date[]>;
}

export namespace IHorarioService {
  export type Params = {
    consulta_dia: Date;
    clinica_id: string;
  };
}
