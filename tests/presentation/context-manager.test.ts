import { ResourceNotFoundError } from "@/infra/errors";
import { ISessionManager } from "@/presentation/session";
import { PatientService } from "@/data/services";
import { IConversation } from "@/presentation/conversations";
import { MessageApp } from "@/presentation/apps";
import { ContextManager } from "@/presentation";
import Messages from "@/presentation/messages";
import {
  makeAppMock,
  makePatientServiceMock,
  makeConversationMock,
  makeSessionManagerMock,
} from "../mocks";
import { makeFakePatient } from "../mocks/fake-models";
import { createLogger } from "winston";

type SutTypes = {
  sut: ContextManager;
  appMock: MessageApp;
  sessionManagerMock: ISessionManager;
  patientServiceMock: PatientService;
  newUserConversationMock: IConversation;
  welcomeBackConversationMock: IConversation;
};

const makeSut = (): SutTypes => {
  const appMock: MessageApp = makeAppMock();

  const sessionManagerMock: ISessionManager = makeSessionManagerMock();

  const patientServiceMock = makePatientServiceMock();

  const newUserConversationMock: IConversation = makeConversationMock();

  const welcomeBackConversationMock: IConversation = makeConversationMock();
  const logger = createLogger();

  const sut = new ContextManager(
    appMock,
    sessionManagerMock,
    patientServiceMock,
    newUserConversationMock,
    welcomeBackConversationMock,
    logger
  );

  return {
    sut,
    appMock,
    sessionManagerMock,
    patientServiceMock,
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
    const { sut, patientServiceMock } = makeSut();

    await sut.read(id, message);
    expect(patientServiceMock.getByPhone).toBeCalledTimes(1);
    expect(patientServiceMock.getByPhone).toBeCalledWith(id);
  });

  test("Should create a new session with new user conversation if session and user not exists", async () => {
    const {
      sut,
      sessionManagerMock,
      newUserConversationMock,
      patientServiceMock,
    } = makeSut();

    (patientServiceMock.getByPhone as jest.Mock).mockRejectedValueOnce(
      new ResourceNotFoundError()
    );
    await sut.read(id, message);

    expect(sessionManagerMock.create).toBeCalledTimes(1);
    expect(sessionManagerMock.create).toBeCalledWith(
      id,
      newUserConversationMock,
      undefined
    );

    expect(newUserConversationMock.ask).toBeCalledTimes(1);
  });

  test("Should create a new session with welcome back conversation if only session not exists", async () => {
    const {
      sut,
      patientServiceMock,
      sessionManagerMock,
      welcomeBackConversationMock,
    } = makeSut();

    const patient = makeFakePatient();
    (patientServiceMock.getByPhone as jest.Mock).mockResolvedValueOnce(patient);

    await sut.read(id, message);

    expect(sessionManagerMock.create).toBeCalledTimes(1);
    expect(sessionManagerMock.create).toBeCalledWith(
      id,
      welcomeBackConversationMock,
      patient
    );

    expect(welcomeBackConversationMock.answer).toBeCalledTimes(1);
  });

  test("Should call answer with clean text using slugify function", async () => {
    const { sut, patientServiceMock, welcomeBackConversationMock } = makeSut();

    const patient = makeFakePatient();
    (patientServiceMock.getByPhone as jest.Mock).mockResolvedValueOnce(patient);

    const dirty_message = "Não";

    await sut.read(id, { text: dirty_message, timestamp: 0 });

    expect(welcomeBackConversationMock.answer).toBeCalledTimes(1);
    expect(welcomeBackConversationMock.answer).toBeCalledWith(
      expect.anything(),
      {
        text: "Não",
        clean_text: "nao",
      }
    );
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
