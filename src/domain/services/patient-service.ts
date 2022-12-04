import { HttpClient } from "@/data/http/http-client";
import { PatientResponseModel } from "@/data/models";
import { PatientModel } from "../models";
import { PatientBody, PatientFilter } from "../params";

import { parseISO } from "date-fns";

export class PatientService {
  constructor(private readonly httpClient: HttpClient) {}

  create = async (body: PatientBody): Promise<PatientModel> => {
    const patient = await this.httpClient.post<PatientResponseModel>(
      "/patients",
      {
        body,
      }
    );

    return {
      ...patient,
      birthdate: patient.birthdate ? parseISO(patient.birthdate) : undefined,
    };
  };

  update = async (id: number, body: PatientBody): Promise<PatientModel> => {
    const patient = await this.httpClient.put<PatientResponseModel>(
      `/patients/${id}`,
      { body }
    );

    return {
      ...patient,
      birthdate: patient.birthdate ? parseISO(patient.birthdate) : undefined,
    };
  };

  load = async (filters?: PatientFilter): Promise<PatientModel[]> => {
    const patients = await this.httpClient.get<PatientResponseModel[]>(
      "/patients",
      {
        params: filters,
      }
    );

    return patients.map((p) => ({
      ...p,
      birthdate: p.birthdate ? parseISO(p.birthdate) : undefined,
    }));
  };

  getById = async (id: number): Promise<PatientModel> => {
    const patient = await this.httpClient.get<PatientResponseModel>(
      `/patients/${id}`
    );

    return {
      ...patient,
      birthdate: patient.birthdate ? parseISO(patient.birthdate) : undefined,
    };
  };

  getByPhone = async (phone: string): Promise<PatientModel> => {
    const patient = await this.httpClient.get<PatientResponseModel>(
      `/patients/${phone}/phone`
    );

    return {
      ...patient,
      birthdate: patient.birthdate ? parseISO(patient.birthdate) : undefined,
    };
  };

  getByCpf = async (cpf: string): Promise<PatientModel> => {
    const patient = await this.httpClient.get<PatientResponseModel>(
      `/patients/${cpf}/cpf`
    );

    return {
      ...patient,
      birthdate: patient.birthdate ? parseISO(patient.birthdate) : undefined,
    };
  };

  deleteById = async (id: number): Promise<void> => {
    await this.httpClient.delete(`/patients/${id}`);
  };
}
