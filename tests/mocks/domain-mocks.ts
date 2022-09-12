import { ISessionManager } from "@/domain/interfaces";
import { IConversation } from "@/domain/usecases";
import { makeFakeClinica } from "./fake-models";

export const makeSessionManagerMock = (): ISessionManager => ({
  clinica: makeFakeClinica(),
  create: jest.fn().mockImplementation((id, conversation, cliente) => ({
    id,
    userinfo: conversation,
    conversation: conversation,
    data: {},
  })),
  get: jest.fn(),
  close: jest.fn(),
});

export const makeConversationMock = (): IConversation => ({
  ask: jest.fn(),
  answer: jest.fn(),
});
