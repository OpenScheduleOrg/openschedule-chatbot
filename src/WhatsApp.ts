import * as fs from "fs";

import {
  WAConnection,
  MessageType,
  Presence,
  MessageOptions,
  Mimetype,
  WALocationMessage,
  WA_MESSAGE_STUB_TYPES,
  ReconnectMode,
  waChatKey,
} from "@adiwajshing/baileys";

export default class WhatsApp {
  wsp: WAConnection;
  constructor() {
    this.wsp = new WAConnection();
  }

  onlyNumber(jid: string): string {
    return jid.replace("@s.whatsapp.net", "");
  }

  tenDigits(jid: string): string {
    const with_ddi = this.onlyNumber(jid);

    return with_ddi.slice(2);
  }

  async connect() {
    const wsp = this.wsp;
    wsp.autoReconnect = ReconnectMode.onConnectionLost;

    wsp.on("chats-received", async ({ hasNewChats }) => {
      console.log(
        `you have ${wsp.chats.length} chats, new chats available: ${hasNewChats}`
      );

      const unread = await wsp.loadAllUnreadMessages();
      console.log("you have " + unread.length + " unread messages");
      for (let msg of unread) {
        // console.log(msg)
        await wsp.chatRead(msg.key.remoteJid);
      }
    });

    wsp.on("open", () => {
      console.log(`credentials updated!`);
      const authInfo = wsp.base64EncodedAuthInfo(); // get all the auth info we need to restore this session
      fs.writeFileSync(
        "./auth_info.json",
        JSON.stringify(authInfo, null, "\t")
      );
    });

    fs.existsSync("./auth_info.json") && wsp.loadAuthInfo("./auth_info.json");

    await wsp.connect();
  }
}
