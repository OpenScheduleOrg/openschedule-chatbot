import { IClienteService } from "@/domain/services";

export const makeClienteServiceMock = (): IClienteService => ({
  create: jest.fn(),
  loadByPhone: jest.fn(),
});
