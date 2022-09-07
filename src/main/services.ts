import {
  ClienteService,
  ClinicaService,
  ConsultaService,
  HorarioService,
} from "@/data/usecases";
import axios, { Axios } from "axios";

const axiosInstance: Axios = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "content-type": "application/json",
  },
});

export const consultaService = new ConsultaService("/consultas", axiosInstance);
export const clienteService = new ClienteService("/clientes", axiosInstance);
export const clinicaService = new ClinicaService("/clinicas", axiosInstance);
export const horarioService = new HorarioService("/horarios", axiosInstance);
