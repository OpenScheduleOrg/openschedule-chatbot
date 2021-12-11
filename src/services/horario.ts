import { AxiosResponse } from "axios";
import axios from ".";
import { timeStringToS } from "../helpers";
import { APIResponse } from "../interfaces";

import { GetHorarios } from "../interfaces/services";

export const getHorarios: GetHorarios = (params) =>
  axios
    .get("/horarios", { params })
    .then((res: AxiosResponse<APIResponse>) => {
      if (res.data.data.horarios) {
        const horarios = res.data.data.horarios;
        for (let i = 0; i < horarios.length; i++) {
          horarios[i].am_inicio = timeStringToS(
            horarios[i].am_inicio as string
          );
          if (horarios[i].am_fim)
            horarios[i].am_fim = timeStringToS(horarios[i].am_fim as string);
          if (horarios[i].pm_inicio)
            horarios[i].pm_inicio = timeStringToS(
              horarios[i].pm_inicio as string
            );
          horarios[i].pm_fim = timeStringToS(horarios[i].pm_fim as string);
          horarios[i].intervalo = timeStringToS(
            horarios[i].intervalo as string
          );
          horarios[i].dia_semana =
            horarios[i].dia_semana + 1 >= 7 ? 0 : horarios[i].dia_semana + 1;
        }
      } else {
        const horario = res.data.data.horario;
        horario.am_inicio = timeStringToS(horario.am_inicio as string);
        if (horario.am_fim)
          horario.am_fim = timeStringToS(horario.am_fim as string);
        if (horario.pm_inicio)
          horario.pm_inicio = timeStringToS(horario.pm_inicio as string);
        horario.pm_fim = timeStringToS(horario.pm_fim as string);
        horario.intervalo = timeStringToS(horario.intervalo as string);
        horario.dia_semana =
          horario.dia_semana + 1 >= 7 ? 0 : horario.dia_semana + 1;
      }

      return res.data;
    })
    .catch((e) => undefined);
