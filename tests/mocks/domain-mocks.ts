import { ISessionManager } from "@/domain/interfaces";
import { IConversation } from "@/domain/usecases";
import { makeFakeClinic } from "./fake-models";

export const makeSessionManagerMock = (): ISessionManager => ({
  clinic: makeFakeClinic(),
  create: jest.fn().mockImplementation((id, conversation, patient) => ({
    id,
    patient: patient,
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
