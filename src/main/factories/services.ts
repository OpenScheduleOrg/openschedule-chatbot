import {
  ClienteService,
  ClinicaService,
  ConsultaService,
  HorarioService,
  NotificationService,
} from "@/data/services";
import axios, { Axios } from "axios";
import config from "../config";

const axiosInstance: Axios = axios.create({
  baseURL: config.APIDNS,
  headers: {
    "content-type": "application/json",
  },
});

export const consultaService = new ConsultaService(
  "/bot/consultas",
  axiosInstance
);
export const clienteService = new ClienteService("/clientes", axiosInstance);
export const clinicaService = new ClinicaService("/clinicas", axiosInstance);
export const horarioService = new HorarioService("/horarios", axiosInstance);
export const notificationService = new NotificationService(
  "/notifications",
  axiosInstance
);
