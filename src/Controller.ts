import { MessageType, Presence, WALocationMessage } from "@adiwajshing/baileys";

import { sleep } from "./helpers";
import { Message } from "./constants";

import {
  Cliente,
  Chat,
  Tlistener,
  Clinica,
  Horario,
  IController,
} from "./interfaces";

import { getClientes } from "./services/cliente";
import { getHorarios } from "./services/horario";
import { getClinicas } from "./services/clinica";

import WhatsApp from "./WhatsApp";

export default class Controller extends WhatsApp implements IController {
  chats: Chat;
  clinica: Clinica;
  horarios: Horario[];
  l_menu: Tlistener;
  sn_consulta: Tlistener;

  constructor() {
    super();
    this.chats = {};
  }

  async read(jid, text) {
    await this.wsp.chatRead(jid);
    text = text.trim();
    console.log(`Mensagens: ${text} de ${jid}`);

    if (jid in this.chats) {
      this.chats[jid]["session"]["listener"](jid, text);
    } else {
      let fone_number = this.tenDigits(jid);
      let res = await getClientes({ telefone: fone_number });

      if (res) {
        let cliente: Cliente =
          res.data && (res.data.cliente || res.data.clientes[0]);

        if (cliente) {
          this.newChat(jid, cliente, this.l_menu);

          let nome = cliente["nome"].split(/\s+/)[0];
          let res_text = Message.MENU.format(
            "Tudo bem? Bom aqui tenho algumas opções para você achar o que procurar:"
          );

          this.send(jid, Message.WELCOMEBACK.format(nome));
          this.send(jid, res_text);
        } else {
          this.newChat(jid, cliente, this.sn_consulta);
          this.send(jid, Message.SNCONSULTA);
        }
      } else {
        this.send(jid, Message.TECHNICALPROBLEMS);
      }
    }
  }

  newChat(jid, cliente, listener) {
    this.chats[jid] = {
      id: cliente && cliente.id,
      nome: cliente && cliente.nome,
      sobrenome: cliente && cliente.sobrenome,
      session: { listener: listener, data: {} },
    };
  }

  send = async (
    jid: string,
    content: string | WALocationMessage,
    type: MessageType = MessageType.text
  ) => {
    await this.wsp.updatePresence(jid, Presence.available);
    await this.wsp.updatePresence(jid, Presence.composing);

    await sleep(1000);

    let response = await this.wsp.sendMessage(jid, content, type);

    // console.log("Resposta: ");
    // console.log(response);
  };

  APIProblem(jid) {
    delete this.chats[jid];
    this.send(jid, Message.TECHNICALPROBLEMS);
  }

  async connect() {
    const res = await getClinicas({}, 1);
    const clinica = res && res.data && res.data.clinica;
    if (!clinica) throw "Clinica não existe impossível de continuar.";
    const horarios = (await getHorarios({ clinica_id: clinica.id })).data
      .horarios;

    await super.connect();
    this.wsp.on("chat-update", async (chat) => {
      if (chat.hasNewMessage) {
        const msg = chat.messages.all()[0];

        if (msg.key.fromMe) return;

        let msgContent = msg.message;

        const msgType = Object.keys(msgContent)[0];

        if (
          !msgContent ||
          !(
            msgType === MessageType.text || msgType === MessageType.extendedText
          ) ||
          msg.participant
        ) {
          await this.wsp.chatRead(msg.key.remoteJid);
          return;
        }
        let text = "";
        if (msgType === MessageType.text) {
          text = msgContent[MessageType.text];
        } else {
          text = msgContent[MessageType.extendedText]["text"];
        }

        this.read(msg.key.remoteJid, text);
      } else {
        if (chat.messages) {
          // console.log(chat.messages.first);
        }
      }
    });
  }
}
