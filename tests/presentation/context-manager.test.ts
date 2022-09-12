import { ISessionManager } from "@/domain/interfaces";
import { IClienteService } from "@/domain/services";
import { IConversation } from "@/domain/usecases";
import { IMessageApp } from "@/infra/interfaces/message-app";
import { ContextManager } from "@/presentation";
import Messages from "@/presentation/messages";
import {
  makeAppMock,
  makeClienteServiceMock,
  makeConversationMock,
  makeSessionManagerMock,
} from "../mocks";
import { makeFakeCliente } from "../mocks/fake-models";

type SutTypes = {
  sut: ContextManager;
  appMock: IMessageApp;
  sessionManagerMock: ISessionManager;
  clienteServiceMock: IClienteService;
  newUserConversationMock: IConversation;
  welcomeBackConversationMock: IConversation;
};

const makeSut = (): SutTypes => {
  const appMock: IMessageApp = makeAppMock();

  const sessionManagerMock: ISessionManager = makeSessionManagerMock();

  const clienteServiceMock: IClienteService = makeClienteServiceMock();

  const newUserConversationMock: IConversation = makeConversationMock();

  const welcomeBackConversationMock: IConversation = makeConversationMock();

  const sut = new ContextManager(
    appMock,
    sessionManagerMock,
    clienteServiceMock,
    newUserConversationMock,
    welcomeBackConversationMock
  );

  return {
    sut,
    appMock,
    sessionManagerMock,
    clienteServiceMock,
    newUserConversationMock,
    welcomeBackConversationMock,
  };
};

describe("ContextManager", () => {
  const id = "8687676756";
  const message = { text: "Any message", timestamp: 1 };

  test("Should get session", async () => {
    const { sut, sessionManagerMock } = makeSut();

    sut.read(id, message);
    expect(sessionManagerMock.get).toBeCalledTimes(1);
  });

  test("Should try otain user if session not exists", async () => {
    const { sut, clienteServiceMock } = makeSut();

    await sut.read(id, message);
    expect(clienteServiceMock.loadByPhone).toBeCalledTimes(1);
    expect(clienteServiceMock.loadByPhone).toBeCalledWith(id);
  });

  test("Should create a new session with new user convesation if session and user not exists", async () => {
    const { sut, sessionManagerMock, newUserConversationMock } = makeSut();

    await sut.read(id, message);

    expect(sessionManagerMock.create).toBeCalledTimes(1);
    expect(sessionManagerMock.create).toBeCalledWith(
      id,
      newUserConversationMock,
      undefined
    );

    expect(newUserConversationMock.ask).toBeCalledTimes(1);
  });

  test("Should create a new session with welcome back convesation if only session not exists", async () => {
    const {
      sut,
      clienteServiceMock,
      sessionManagerMock,
      welcomeBackConversationMock,
    } = makeSut();
    const cliente = makeFakeCliente();

    (clienteServiceMock.loadByPhone as jest.Mock).mockImplementation(
      () => cliente
    );

    await sut.read(id, message);

    expect(sessionManagerMock.create).toBeCalledTimes(1);
    expect(sessionManagerMock.create).toBeCalledWith(
      id,
      welcomeBackConversationMock,
      cliente
    );

    expect(welcomeBackConversationMock.answer).toBeCalledTimes(1);
  });

  test("Should close session if some exception occurs", async () => {
    const { sut, newUserConversationMock, sessionManagerMock } = makeSut();

    (newUserConversationMock.ask as jest.Mock).mockRejectedValue(
      new Error("Any error message")
    );

    await sut.read(id, message);

    expect(sessionManagerMock.close).toBeCalledTimes(1);
    expect(sessionManagerMock.close).toBeCalledWith(id);
  });

  test("Should send message tecnical problems if some exception occurs", async () => {
    const { sut, newUserConversationMock, appMock } = makeSut();

    (newUserConversationMock.ask as jest.Mock).mockRejectedValue(
      new Error("Any error message")
    );

    await sut.read(id, message);

    expect(appMock.send).toBeCalledTimes(1);
    expect(appMock.send).toBeCalledWith(id, {
      text: Messages.TECHNICALPROBLEMS,
    });
  });

  test("Should call app connect", async () => {
    const { sut, appMock } = makeSut();

    await sut.connect();
    expect(appMock.connect).toBeCalledTimes(1);
  });
});
