import { ClienteModel, ClinicaModel } from "@/domain/models";

export const makeFakeClinica = (): ClinicaModel => ({
  id: "1",
  nome: "Nome Clinica",
  telefone: "8881766745",
  endereco: "Endereco Clinica",
  tipo: "1",
  latitude: "-89.283222",
  logintude: "38.232234",
});

export const makeFakeCliente = (): ClienteModel => ({
  id: "1",
  nome: "Foo",
  sobrenome: "Bar",
  cpf: "76887623412",
  telefone: "7878672354",
});
