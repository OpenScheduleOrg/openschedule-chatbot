import { ClinicModel, PatientModel } from "@/domain/models";

export const makeFakeClinic = (): ClinicModel => ({
  id: 1,
  name: "Nome Clinica",
  phone: "8881766745",
  cnpj: "13883312000132",
  address: "Endereco Clinica",
  latitude: "-89.283222",
  longitude: "38.232234",
});

export const makeFakePatient = (): PatientModel => ({
  id: 1,
  name: "Foo",
  cpf: "76887623412",
  phone: "7878672354",
});
