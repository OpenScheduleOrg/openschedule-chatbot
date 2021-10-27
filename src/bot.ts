import "./prototype";
import { sleep } from "./helpers";
import { Month, Weekday, Message } from "./constants";
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

import * as fs from "fs";
import * as fetch from "node-fetch";
import {
    Cliente,
    Chat,
    Tlistener,
    DataResponse,
    Response,
    Consulta,
    Consultas,
    Clinica,
} from "./interfaces";

process.env.TZ = 'America/Fortaleza';

class WhatsApp {
    wsp: WAConnection;
    constructor() {
        this.wsp = new WAConnection();
    }

    onlyNumber(jid: string): string {
        return jid.replace("@s.whatsapp.net", "");
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

        fs.existsSync("./auth_info.json") &&
            wsp.loadAuthInfo("./auth_info.json");

        await wsp.connect();
    }
}

class Bot extends WhatsApp {
    chats: Chat;

    constructor() {
        super();
        this.chats = {};
    }

    private async read(jid: string, text: string) {
        await this.wsp.chatRead(jid);
        text = text.trim();
        console.log(`Mensagens: ${text} de ${jid}`);

        if (jid in this.chats) {
            this.chats[jid]["session"]["listener"](jid, text);
        } else {
            let number = this.onlyNumber(jid);
            let res = await fetch("http://127.0.0.1:3000/telefone/" + number);

            if (res.ok) {
                let cliente: Cliente = (await res.json())["cliente"];

                if (cliente.id) {
                    this.new_chat(jid, cliente, this.l_menu);
                    let nome = cliente["nome"].split(/\s+/);
                    let res_text = Message.MENU.format(
                        "Tudo bem? Bom aqui tenho algumas opções para você achar o que procurar:"
                    );

                    this.send(jid, Message.WELCOMEBACK.format(nome[0]));
                    this.send(jid, res_text);
                } else {
                    this.new_chat(jid, cliente, this.sn_consulta);
                    this.send(jid, Message.SNCONSULTA);
                }
            } else {
                this.send(jid, Message.TECHNICALPROBLEMS);
            }
        }
    }

    private new_chat(jid: string, cliente: Cliente, listener: Tlistener) {
        this.chats[jid] = {
            id: cliente.id,
            nome: cliente.nome,
            session: { listener: listener, data: {} },
        };
    }

    private async send_consultas(jid: string, consultas: Consultas) {
        let data: Date,
            data_str: string,
            res_text: string,
            str_local_data: string,
            consulta: Consulta,
            horarios: string,
            day_consultas: Consulta[];

        this.chats[jid]["session"]["data"]["consultas"] = {};

        if (Object.keys(consultas).length > 1) {
            await this.send(jid, Message.SHOWCONSULTAS);
        }
        for (data_str in consultas) {
            data = new Date(data_str);
            day_consultas = consultas[data_str];

            str_local_data = data.toLocaleDateString("pt-BR", {
                timeZone: "UTC",
            });

            this.chats[jid]["session"]["data"]["consultas"][str_local_data] =
                day_consultas;

            horarios = `*${day_consultas[0]["hora"].slice(0, 5)}*`;
            for (let i = 1; i < day_consultas.length; i++) {
                if (i === day_consultas.length - 1) {
                    horarios +=
                        " e outra as " +
                        `*${day_consultas[i]["hora"].slice(0, 5)}*`;
                } else {
                    horarios +=
                        ", " + `*${day_consultas[i]["hora"].slice(0, 5)}*`;
                }
            }
            if (day_consultas.length === 2) {
                horarios += " ambas";
            }
            if (day_consultas.length > 2) {
                horarios += " todas";
            }

            res_text =
                str_local_data +
                " - " +
                Message.SHOWCONSULTA.format(
                    Weekday[data.getUTCDay()],
                    String(data.getUTCDate()),
                    Month[data.getUTCMonth()],
                    horarios,
                    consultas[data_str][0]["clinica"]
                );

            await this.send(jid, res_text);
        }
    }

    private l_menu: Tlistener = async (jid, text) => {
        const test_text = text.toLocaleLowerCase("pt-BR");
        let res_text: string;
        const today = new Date();
        const id = this.chats[jid]["id"];
        let res: { ok: boolean; consultas?: Consultas } | any,
            consultas: Consultas,
            clinica: Clinica,
            res_json: Response;

        if (
            test_text == "1" ||
            test_text.match(/((marcar|nova)\s*consulta)|(marcar$)/i)
        ) {
            if (id) {
                this.chats[jid]["session"]["listener"] = this.l_day;

                res_text = Message.DIACONSULTA.format(
                    String(today.monthDays()),
                    Weekday[today.getDay()],
                    String(today.getDate()),
                    Month[today.getMonth()]
                );
                await this.send(jid, Message.INTERRUPT);
                this.send(jid, res_text);
            } else {
                this.chats[jid]["session"]["listener"] = this.l_name;
                res_text = `${Message.NEWCLIENT}\n${Message.NAME}`;
                await this.send(jid, Message.INTERRUPT);
                this.send(jid, res_text);
            }
        } else if (
            test_text == "2" ||
            test_text.match(/((minhas?|ver)\s*consultas?)|(^consultas?)/i)
        ) {
            if (id) {
                res = await this.get_consultas(id);
                if (res.ok) {
                    consultas = res["consultas"];
                    if (Object.keys(consultas).length) {
                        this.chats[jid]["session"]["listener"] = this.l_default;
                        await this.send_consultas(jid, consultas);
                        delete this.chats[jid]["session"]["data"]["consultas"];
                        return;
                    }
                }
            }
            this.chats[jid]["session"]["listener"] = this.sn_consulta;
            this.send(jid, Message.NOCONSULTA);
        } else if (
            test_text == "3" ||
            test_text.match(/(reagendar\s*consultas?)|(reagendar)/i)
        ) {
            this.chats[jid]["session"]["listener"] = this.l_default;
            this.send(
                jid,
                "Desculpa mais ainda não é possível reagendar consultas.\n\nCancele sua consulta e marque outra que da no mesmo."
            );
        } else if (
            test_text == "4" ||
            test_text.match(/(cancelar\s*consultas?)|(cancelar)/i)
        ) {
            if (id) {
                res = await this.get_consultas(id);
                if (res.ok) {
                    consultas = res["consultas"];
                    if (Object.keys(consultas).length) {
                        this.chats[jid]["session"]["listener"] =
                            this.l_cancelar;
                        this.send(jid, Message.INTERRUPT);
                        await this.send_consultas(jid, consultas);
                        this.send(jid, Message.CANCELAR);
                        return;
                    }
                }
            }
            this.chats[jid]["session"]["listener"] = this.sn_consulta;
            this.send(jid, Message.NOCONSULTA);
        } else if (
            test_text == "5" ||
            test_text.match(
                /(sobre\s*(cl(í|i)nica|consult(ó|o)rio))|(sobre)|(cl(í|i)nica)|(consult(ó|o)rio)/i
            )
        ) {
            res = await fetch("http://localhost:3000/clinica/1");
            if (res.ok) {
                res_json = await res.json();
                clinica = res_json["clinica"];
                this.chats[jid]["session"]["listener"] = this.l_default;
                res_text = Message.ABOUT.format(
                    clinica.nome,
                    clinica.tipo,
                    clinica.fone_contato,
                    clinica.endereco.text
                );
                this.send(jid, res_text.toLocaleUpperCase("pt-BR"));
                this.send(
                    jid,
                    {
                        degreesLatitude: Number(clinica.endereco.coord.lat),
                        degreesLongitude: Number(clinica.endereco.coord.long),
                        address: clinica.endereco.text,
                    },
                    MessageType.location
                );
            } else {
                this.APIproblem(jid);
            }
        } else {
            this.send(jid, Message.INVALIDMENU);
        }
    };

    private sn_consulta: Tlistener = async (jid, text) => {
        text = text.toLocaleLowerCase("pt-BR");
        let res_text;

        if (text == "sim" || text == "s" || text == "si" || text == "1") {
            if (this.chats[jid]["id"]) {
                let today = new Date();

                res_text = Message.DIACONSULTA.format(
                    String(today.monthDays()),
                    Weekday[today.getDay()],
                    String(today.getDate()),
                    Month[today.getMonth()]
                );

                this.send(jid, res_text);
            } else {
                this.chats[jid]["session"]["listener"] = this.l_name;
                res_text = `${Message.NEWCLIENT}\n${Message.NAME}`;
                await this.send(jid, Message.INTERRUPT);
                this.send(jid, res_text);
            }
        } else {
            this.chats[jid]["session"]["listener"] = this.l_menu;
            let res_text = Message.MENU.format(
                "Bom, aqui estão algumas opções para acesso rápido:"
            );
            this.send(jid, res_text);
        }
    };

    private l_default: Tlistener = async (jid, text) => {
        this.chats[jid]["session"]["listener"] = this.l_menu;

        let res_text = Message.MENU.format(
            "De nada! Mas não entendo muita coisa, aqui estão algumas opções com o que consigo fazer:"
        );
        this.send(jid, res_text);
    };

    private l_name: Tlistener = async (jid, text) => {
        let test_text = text.toLocaleLowerCase("pt-BR");
        text = text.replace(/\s\s+/g, " ");
        let res_text: string;
        if (
            test_text == "0" ||
            test_text == "cancelar" ||
            test_text == "não" ||
            test_text == "n" ||
            test_text == "ñ" ||
            this.chats[jid].id
        ) {
            this.chats[jid]["session"]["listener"] = this.l_menu;
            res_text = Message.MENU.format(
                "Tudo bem, aqui estão algumas opções para acesso rápido:"
            );
            this.send(jid, res_text);
        } else if (test_text.length <= 3) {
            this.send(jid, Message.INVALIDNAME);
        } else {
            this.chats[jid]["session"]["listener"] = this.l_cpf;
            this.chats[jid]["session"]["data"]["nome"] = text;
            this.send(jid, Message.CPF);
        }
    };

    private l_cpf: Tlistener = async (jid, text) => {
        let test_text = text.toLocaleLowerCase("pt-BR");
        let fone = this.onlyNumber(jid);

        let res_text: string;

        if (
            test_text == "0" ||
            test_text == "cancelar" ||
            test_text == "não" ||
            test_text == "n" ||
            test_text == "ñ"
        ) {
            this.chats[jid]["session"]["listener"] = this.l_menu;
            delete this.chats[jid]["session"]["data"]["nome"];
            let res_text = Message.MENU.format(
                "Tudo bem, aqui estão algumas opções para acesso rápido:"
            );
            this.send(jid, res_text);
        } else if (!test_text.match(/^\d{11}$|^\d{3}\.\d{3}\.\d{3}-\d{2}$/)) {
            this.send(jid, Message.INVALIDCPF);
        } else {
            const body = {
                nome: this.chats[jid]["session"]["data"]["nome"],
                cpf: text,
                telefone: fone,
            };

            const res = await fetch("http://localhost:3000/cliente", {
                method: "POST",
                body: JSON.stringify(body),
                headers: { "Content-Type": "application/json" },
            });

            if (res.ok) {
                const cliente: Cliente = (await res.json())["cliente"];
                this.chats[jid].id = cliente.id;
                this.chats[jid].nome = cliente.nome;
                this.chats[jid]["session"]["listener"] = this.l_day;
                delete this.chats[jid]["session"]["data"]["nome"];

                let today = new Date();

                res_text = Message.DIACONSULTA.format(
                    String(today.monthDays()),
                    Weekday[today.getDay()],
                    String(today.getDate()),
                    Month[today.getMonth()]
                );

                this.send(jid, res_text);
            } else {
                this.APIproblem(jid);
            }
        }
    };

    private l_day: Tlistener = async (jid, text) => {
        function msg_horarios(
            horarios: [{ hora: string; id: number }],
            data: Date
        ): string {
            let res_text =
                Message.HORARIOS.format(
                    Weekday[data.getUTCDay()],
                    String(data.getUTCDate()),
                    Month[data.getUTCMonth()]
                ) + "\n";
            for (let i = 0; i < horarios.length; i++) {
                res_text =
                    res_text +
                    `\n${i + 1} - \u200E${horarios[i]["hora"].slice(
                        0,
                        4
                    )}‎\u200E${horarios[i]["hora"].slice(4, 5)}`;
            }
            res_text =
                res_text +
                "\n0 - escolher outro dia\n\n" +
                Message.HORACONSULTA;

            return res_text;
        }

        let test_text = text.toLocaleLowerCase("pt-BR");
        let day = Number(text);

        let today = new Date();
        let mouth_size = today.monthDays();

        let res_text: string;

        if (
            test_text == "0" ||
            test_text == "cancelar" ||
            test_text == "não" ||
            test_text == "n" ||
            test_text == "ñ"
        ) {
            this.chats[jid]["session"]["listener"] = this.l_menu;
            let res_text = Message.MENU.format(
                "Tudo bem, aqui estão algumas opções para acesso rápido:"
            );
            this.send(jid, res_text);
        } else if (!day || day < 1 || day > mouth_size) {
            let res_text = Message.INVALIDDAY.format(String(mouth_size));
            this.send(jid, res_text);
        } else {
            let res = await fetch("http://localhost:3000/horarios/" + text);
            if (res.ok) {
                let agenda: DataResponse = await res.json();
                let data = new Date(agenda["data"]);
                let horarios = agenda["horarios"];

                if (horarios.length > 0) {
                    res_text = msg_horarios(horarios, data);

                    this.chats[jid]["session"]["listener"] = this.l_horario;
                    this.chats[jid]["session"]["data"]["horarios"] = horarios;
                    this.send(jid, res_text);
                } else {
                    res_text = Message.NOHORARIOS.format(
                        Weekday[data.getUTCDay()],
                        String(data.getUTCDate()),
                        Month[data.getUTCMonth()]
                    );
                    this.send(jid, res_text);
                    this.send(jid, Message.NEWDAY);
                }
            } else {
                this.APIproblem(jid);
            }
        }
    };

    private l_horario: Tlistener = async (jid, text) => {
        let test_text = text.toLocaleLowerCase("pt-BR");
        let index = Number(text);
        let horarios = this.chats[jid]["session"]["data"]["horarios"];
        let res_text: string;
        if (index == NaN && text.match(/^([0-1]\d|2[0-3]):[0-5]\d$/)) {
            index = 1;
            for (let hora of horarios) {
                if (text == hora.hora) {
                    break;
                }
                index++;
            }
        }
        if (
            test_text == "cancelar" ||
            test_text == "não" ||
            test_text == "n" ||
            test_text == "ñ"
        ) {
            this.chats[jid]["session"]["listener"] = this.l_menu;
            delete this.chats[jid]["session"]["data"]["horarios"];

            let res_text = Message.MENU.format(
                "Tudo bem, aqui estão algumas opções para acesso rápido:"
            );
            this.send(jid, res_text);
        } else if (text === "0") {
            this.chats[jid]["session"]["listener"] = this.l_day;
            delete this.chats[jid]["session"]["data"]["horarios"];
            this.send(jid, Message.NEWDAY);
        } else if (index < 1 || index > horarios.length || !index) {
            this.send(jid, Message.INVALIDHORA);
        } else {
            let id_cliente = this.chats[jid]["id"];
            let id_clinica = 1;
            let id_data = horarios[index - 1]["id"];
            const body = {
                id_cliente,
                id_clinica,
                id_data,
            };

            const res = await fetch("http://localhost:3000/consulta", {
                method: "POST",
                body: JSON.stringify(body),
                headers: { "Content-Type": "application/json" },
            });

            if (res.ok) {
                let res_json: Response = await res.json();
                let consulta = res_json["consulta"];
                let data = new Date(consulta["data"]);

                this.chats[jid]["session"]["listener"] = this.l_default;
                delete this.chats[jid]["session"]["data"]["horarios"];

                res_text = Message.NOVACONSULTA.format(
                    Weekday[data.getUTCDay()],
                    String(data.getUTCDate()),
                    Month[data.getUTCMonth()],
                    consulta["hora"].slice(0, 5),
                    consulta["clinica"]
                );

                this.send(jid, res_text);
            } else {
                this.APIproblem(jid);
            }
        }
    };

    private l_cancelar: Tlistener = async (jid, text) => {
        let test_text = text.toLocaleLowerCase("pt-BR");

        let consultas = this.chats[jid]["session"]["data"]["consultas"];
        let res_text: string;
        let consulta: Consulta;
        let res: any, res_json: Response, data: Date;

        if (
            test_text == "0" ||
            test_text == "cancelar" ||
            test_text == "não" ||
            test_text == "n" ||
            test_text == "ñ"
        ) {
            this.chats[jid]["session"]["listener"] = this.l_menu;
            let res_text = Message.MENU.format(
                "Tudo bem, aqui estão algumas opções para acesso rápido:"
            );
            this.send(jid, res_text);
        } else if (consultas[text]) {
            consulta = consultas[text][0];
            res = await fetch("http://localhost:3000/consulta/" + consulta.id, {
                method: "DELETE",
            });
            if (res.ok) {
                this.chats[jid]["session"]["listener"] = this.l_default;
                res_json = await res.json();
                consulta = res_json["consulta"];
                data = new Date(consulta.data);
                res_text = Message.CONSULTACANCELADA.format(
                    Weekday[data.getUTCDay()],
                    String(data.getUTCDate()),
                    Month[data.getUTCMonth()]
                );
                delete this.chats[jid]["session"]["data"]["consultas"];
                this.send(jid, res_text);
            } else {
                this.APIproblem(jid);
            }
        } else {
            this.send(jid, Message.NODATACONSULTA.format(text));
        }
    };

    private send = async (
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

    private APIproblem(jid: string): void {
        delete this.chats[jid];
        this.send(jid, Message.TECHNICALPROBLEMS);
    }

    get_consultas(id: number): Promise<{ ok: boolean; consultas?: Consultas }> {
        return fetch("http://127.0.0.1:3000/cliente/" + id).then(
            async (res) => {
                if (res.ok) {
                    let cliente = ((await res.json()) as Response)["cliente"];
                    let consultas = cliente["consultas"];
                    return { ok: res.ok, consultas: consultas };
                } else {
                    return { ok: res.ok };
                }
            }
        );
    }

    async connect() {
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
                        msgType === MessageType.text ||
                        msgType === MessageType.extendedText
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

const bot = new Bot();

bot.connect().catch((err) => console.error(`encountered error: ${err}`));
