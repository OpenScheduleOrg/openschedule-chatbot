import {Boom} from "@hapi/boom";
import makeWASocket, {delay, DisconnectReason, proto, useMultiFileAuthState} from "@whiskeysockets/baileys";

import {MessageTemplate} from "@/presentation/models";
import {TypeRead} from "@/presentation/interfaces";
import {onlyNumber} from "@/common/helpers";
import {MessageApp} from "@/presentation/apps";

export class Whatsapp implements MessageApp {
    sock : any;
    read : TypeRead;

    private readonly current_options : {
    [jid: string]: {[option: string]: string} 
    } = {};

    send = async (id : string, message : MessageTemplate) => {
        id = "55" + id + "@s.whatsapp.net";
        if (message.text) 
            message.text = message.text.replaceAll("**", "*");

        await this.sock.presenceSubscribe(id);
        await delay(500);

        await this.sock.sendPresenceUpdate("composing", id);
        await delay(500);

        await this.sock.sendPresenceUpdate("paused", id);
        if ("buttons" in message) 
            await this.sock.sendMessage(id, this.getOptionsMessage(message, id));
         else 
            await this.sock.sendMessage(id, message);
    };

    private getOptionsMessage = (message : MessageTemplate, jid: string) => {
        let textMessage = message.text + "\n";

        this.current_options[jid] = {}

        for (let i = 0; i < message.buttons.length; i++) {
            const button = message.buttons[i];
            this.current_options[jid][i + 1] = button.buttonId.toString();

            textMessage += "\n"
            textMessage += `${
                i + 1
            } - ${
                button.buttonText.displayText
            }`
        }

        return {text: textMessage};
    };

    async connect() {
        const {state, saveCreds} = await useMultiFileAuthState("baileys_auth_info");

        const sock = (this.sock = makeWASocket({printQRInTerminal: true, auth: state}));

        sock.ev.process(async (events) => {
            if (events["connection.update"]) {
                const update = events["connection.update"];
                const {connection, lastDisconnect} = update;
                if (connection === "close") { // reconnect if not logged out
                    if ((lastDisconnect ?. error as Boom) ?. output ?. statusCode !== DisconnectReason.loggedOut) {
                        this.connect();
                    } else {
                        console.log("Connection closed. You are logged out.");
                    }
                }
                console.log("connection update", update);
            }

            if (events["chats.set"]) {
                const {chats, isLatest} = events["chats.set"];
                console.log(`recv ${
                    chats.length
                } chats (is latest: ${isLatest})`);
            }

            if (events["creds.update"]) {
                await saveCreds();
            }

            if (events["messages.set"]) {
                const {messages, isLatest} = events["messages.set"];
                console.log(`recv ${
                    messages.length
                } messages (is latest: ${isLatest})`);
            }

            if (events["messages.upsert"]) {
                const upsert = events["messages.upsert"];

                if (upsert.type === "notify") 
                    for (const msg of upsert.messages) 
                        if (! msg.key.fromMe && msg.message) 
                            this.processMessage(msg);
            }
        });
    }

    async processMessage(msg : proto.IWebMessageInfo) {
        await this.sock !.readMessages([msg.key]);

        let text = msg.message.conversation || msg.message ?. extendedTextMessage ?. text || msg.message ?. buttonsResponseMessage ?. selectedButtonId || msg.message ?. listResponseMessage ?. singleSelectReply ?. selectedRowId;

        if (text && msg.key.remoteJid.endsWith("s.whatsapp.net")) {
            const current_option = this.current_options[msg.key.remoteJid];
            text = (current_option && current_option[text?.trim()]) || text;

            delete this.current_options[msg.key.remoteJid];

            await this.read(onlyNumber(msg.key.remoteJid), {text, timestamp: msg.messageTimestamp as number});
        }
    }
}