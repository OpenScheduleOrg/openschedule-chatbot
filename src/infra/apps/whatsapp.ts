import { Boom } from "@hapi/boom";
import makeWASocket, {
  AnyMessageContent,
  delay,
  DisconnectReason,
  proto,
  useMultiFileAuthState,
} from "@adiwajshing/baileys";

import { IMessageApp } from "@/infra/interfaces/message-app";
import { ContentSend } from "@/presentation/models";
import { TypeRead } from "@/presentation/interfaces";
import { onlyNumber } from "@/common/helpers";

export default class Whatsapp implements IMessageApp {
  sock: any;

  read: TypeRead;

  send = async (id: string, content: ContentSend) => {
    id = "55" + id + "@s.whatsapp.net";

    await this.sock.presenceSubscribe(id);
    await delay(500);

    await this.sock.sendPresenceUpdate("composing", id);
    await delay(2000);

    await this.sock.sendPresenceUpdate("paused", id);
    await this.sock.sendMessage(id, content);
  };

  async connect() {
    const { state, saveCreds } = await useMultiFileAuthState(
      "baileys_auth_info"
    );

    const sock = (this.sock = makeWASocket({
      printQRInTerminal: true,
      auth: state,
    }));

    sock.ev.process(async (events) => {
      if (events["connection.update"]) {
        const update = events["connection.update"];
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
          // reconnect if not logged out
          if (
            (lastDisconnect?.error as Boom)?.output?.statusCode !==
            DisconnectReason.loggedOut
          ) {
            this.connect();
          } else {
            console.log("Connection closed. You are logged out.");
          }
        }
        console.log("connection update", update);
      }

      if (events["chats.set"]) {
        const { chats, isLatest } = events["chats.set"];
        console.log(`recv ${chats.length} chats (is latest: ${isLatest})`);
      }

      if (events["creds.update"]) {
        await saveCreds();
      }

      if (events["messages.set"]) {
        const { messages, isLatest } = events["messages.set"];
        console.log(
          `recv ${messages.length} messages (is latest: ${isLatest})`
        );
      }

      if (events["messages.upsert"]) {
        const upsert = events["messages.upsert"];
        console.log("recv messages ", JSON.stringify(upsert, undefined, 2));

        if (upsert.type === "notify")
          for (const msg of upsert.messages)
            if (!msg.key.fromMe && msg.message) this.processMessage(msg);
      }
    });
  }

  async processMessage(msg: proto.IWebMessageInfo) {
    await this.sock!.readMessages([msg.key]);

    const text =
      msg.message.conversation ||
      (msg.message.extendedTextMessage && msg.message.extendedTextMessage.text);
    if (text)
      await this.read(onlyNumber(msg.key.remoteJid), {
        text,
        timestamp: msg.messageTimestamp as number,
      });
  }
}
