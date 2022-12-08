import { AuthorizeHttpClient } from "@/data/http/authorize-http-client";
import { HttpClient } from "@/data/http/http-client";
import {
  ConsultaService,
  HorarioService,
  NotificationService,
} from "@/data/services";
import {
  AppointmentService,
  AuthService,
  CalendarService,
  ClinicService,
  PatientService,
} from "@/domain/services";
import { CredentialManager } from "@/security";
import axios, { Axios } from "axios";
import config from "../config";

const httpClient = new HttpClient(config.AUTH_DNS);
const authService = new AuthService(httpClient);
const credentials = new CredentialManager(authService, config.BEARER_TOKEN);

const authorizeHttpClient = new AuthorizeHttpClient(
  config.API_DNS,
  credentials
);

export const clinicService = new ClinicService(authorizeHttpClient);
export const patientService = new PatientService(authorizeHttpClient);
export const calendarService = new CalendarService(authorizeHttpClient);
export const appointmentService = new AppointmentService(authorizeHttpClient);

// TODO: garbage
const axiosInstance: Axios = axios.create({
  baseURL: config.API_DNS,
  headers: {
    "content-type": "application/json",
  },
  withCredentials: true,
});

export const consultaService = new ConsultaService(
  "/bot/consultas",
  axiosInstance
);
export const horarioService = new HorarioService("/horarios", axiosInstance);
export const notificationService = new NotificationService(
  "/notifications",
  axiosInstance
);
