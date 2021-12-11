import { MessageType, WALocationMessage } from "@adiwajshing/baileys";

import { Consulta, Clinica, Cliente, Horario } from "./models";

export * from "./models";

export interface APIResponseSuccess {
  consulta: Consulta;
  clinica: Clinica;
  cliente: Cliente;
  horario: Horario;
  consultas: Consulta[];
  clientes: Cliente[];
  horarios: Horario[];
}

export interface APIResponseFail {
  payload: { [param: string]: string };
  detail: { [param: string]: string };
}

export type APIResponse =
  | {
      status: "success" | "fail" | "error";
      message?: string;
      data: APIResponseSuccess & APIResponseFail;
      path?: string;
    }
  | undefined;

export interface Chat {
  [jid: string]: {
    id: number | undefined;
    nome: string;
    sobrenome: string;
    session: {
      listener: Tlistener;
      data: {
        nome?: string;
        sobrenome?: string;
        cpf?: string;
        horarios?: { marcada: Date; hhmm: string }[];
        data?: Date;
        consultas?: {[ISODate:string]: Consulta[]};
      };
    };
  };
}

export type Tlistener = (jid: string, text: string) => void;

export interface IController {
  chats: Chat;
  clinica: Clinica;
  horarios: Horario[];
  read: (jid: string, text: string) => void;
  send: (
    jid: string,
    content: string | WALocationMessage,
    type?: MessageType
  ) => void;
  newChat: (jid: string, cliente: Cliente, listener: Tlistener) => void;
  APIProblem: (jid: string) => void;
  connect: () => void;
}
