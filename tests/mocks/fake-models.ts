import { ClienteModel, ClinicModel } from "@/domain/models";

export const makeFakeClinic = (): ClinicModel => ({
  id: 1,
  name: "Nome Clinica",
  phone: "8881766745",
  cnpj: "13883312000132",
  address: "Endereco Clinica",
  latitude: "-89.283222",
  longitude: "38.232234",
});

export const makeFakeCliente = (): ClienteModel => ({
  id: "1",
  nome: "Foo",
  sobrenome: "Bar",
  cpf: "76887623412",
  telefone: "7878672354",
});
