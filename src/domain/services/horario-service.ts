export interface IHorarioService {
  availableSchedules(params: IHorarioService.Params): Promise<Date[]>;
  availableDays(params: IHorarioService.Params): Promise<number[]>;
}

export namespace IHorarioService {
  export type Params = {
    consulta_dia?: Date;
    clinica_id: string;
    month?: number;
  };
}
