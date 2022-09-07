import { ClienteModel, ClinicaModel, ConsultaModel } from "@/domain/models";
import { AnyMessageContent } from "@adiwajshing/baileys";

export interface IBot {
  read: (jid: string, content: any) => Promise<void>;
  send: (jid: string, content: any) => Promise<void>;
}

export interface Chat {
  [jid: string]: {
    id: string | undefined;
    nome: string;
    sobrenome: string;
    session: {
      listeners: GlobalListeners;
      default: Tlistener;
      data: {
        nome?: string;
        sobrenome?: string;
        cpf?: string;
        horarios?: Date[];
        data?: Date;
        consulta?: ConsultaModel;
        consultas?: ConsultaModel[] | { [ISODate: string]: ConsultaModel[] };
      };
    };
  };
}

export type SimpleListener = (jid: string) => Promise<void>;

export type Tlistener = (jid: string, text: string) => Promise<void>;

export type GlobalListeners = { [text: string]: SimpleListener };

export interface IController {
  chats: Chat;
  clinica: ClinicaModel;
  read: (jid: string, text: string) => void;
  send: (jid: string, content: AnyMessageContent, location?: boolean) => void;
  newChat: (jid: string, cliente: ClienteModel, listener: Tlistener) => void;
  APIProblem: (jid: string) => void;
  connect: () => void;
}
