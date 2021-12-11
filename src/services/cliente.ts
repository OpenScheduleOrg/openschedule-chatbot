import axios from ".";

import { GetClientes, CreateCliente } from "../interfaces/services";

export const createCliente: CreateCliente = (cliente) =>
  axios
    .post("/cliente", cliente)
    .then((res) => res.data)
    .catch((e) => undefined);

export const getClientes: GetClientes = (params, id = undefined) =>
  axios
    .get("/clientes" + (id ? `/${id}` : ""), { params })
    .then((res) => res.data)
    .catch((e) => undefined);
