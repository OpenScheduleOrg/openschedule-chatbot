import { AxiosResponse } from "axios";
import axios from ".";
import { APIResponse } from "../interfaces";

import {
  CreateConsulta,
  GetConsultas,
  UpdateCliente,
  DeleteConsulta,
  UpdateConsulta,
} from "../interfaces/services";

export const createConsulta: CreateConsulta = (consulta) =>
  axios
    .post("/consulta", consulta)
    .then((res) => res.data)
    .catch((e) => undefined);

export const getConsultas: GetConsultas = (params, id = undefined) =>
  axios
    .get("/consultas" + (id ? `/${id}` : ""), { params })
    .then((res: AxiosResponse<APIResponse>) => {
      if (res.data.data.consultas) {
        const consultas = res.data.data.consultas;
        for (let i = 0; i < consultas.length; i++) {
          const marcada = new Date(consultas[i].marcada);
          consultas[i].marcada = marcada;
          consultas[i].his =
            marcada.getHours() * 3600 +
            marcada.getMinutes() * 60 +
            marcada.getSeconds();
        }
      } else {
        res.data.data.consulta.marcada = new Date(
          res.data.data.consulta.marcada
        );
        res.data.data.consulta.his =
          res.data.data.consulta.marcada.getHours() * 3600 +
          res.data.data.consulta.marcada.getMinutes() * 60 +
          res.data.data.consulta.marcada.getSeconds();
      }

      return res.data;
    })
    .catch((e) => undefined);

export const updateConsulta: UpdateConsulta = (
  id,
  marcada,
  realizada,
  descricao
) =>
  axios
    .put("/consulta/" + id, { marcada, realizada, descricao })
    .then((res) => res.data)
    .catch((e) => undefined);

export const deleteConsulta: DeleteConsulta = (id) =>
  axios
    .delete("/consulta" + `/${id}`)
    .then((res) => res.data)
    .catch((e) => undefined);
