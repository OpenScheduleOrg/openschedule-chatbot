import { AuthorizeHttpClient } from "@/infra/http/authorize-http-client";
import { HttpClient } from "@/infra/http/http-client";
import {
  AppointmentService,
  AuthService,
  CalendarService,
  ClinicService,
  PatientService,
} from "@/data/services";
import { CredentialManager } from "@/security";
import config from "@/main/config";

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
