import { IMessageApp } from "@/infra/interfaces/message-app";

export const makeAppMock = (): IMessageApp => ({
  connect: jest.fn(),
  send: jest.fn(),
  read: jest.fn(),
});
