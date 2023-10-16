import { MessageApp } from "@/presentation/apps";

export const makeAppMock = (): MessageApp => ({
  connect: jest.fn(),
  send: jest.fn(),
  read: jest.fn(),
});
