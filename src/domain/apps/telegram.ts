import {Telegraf, Context, Markup} from "telegraf";
import {message} from "telegraf/filters";
import {MessageApp, MessageTemplate} from "@/presentation/apps";
import {InlineKeyboardMarkup, InlineKeyboardButton} from "telegraf/typings/core/types/typegram";
import { AppDataStorage } from "./app-data-storage";
import { Logger } from "winston";
import { TypeRead } from "@/presentation/apps/send-read";

export class Telegram implements MessageApp {
    private connection : Telegraf;
    read : TypeRead;
    private map_userid_phone : {
        [phone : string]: string
    } = {}
    private map_phone_chatid : {
        [phone : string]: number
    } = {}


    constructor(private readonly token : string, private readonly appDataStorage: AppDataStorage, private readonly logger: Logger) {};

    send = async (id : string, message : MessageTemplate) => {
        this.logger.info("send message to " + id)

        if (message.location) {
            await this.connection.telegram.sendLocation(this.map_phone_chatid[id], message.location.degreesLatitude, message.location.degreesLongitude)
            return;
        }

        const text = message.text.replaceAll("**", "*");

        let reply_markup: InlineKeyboardMarkup = undefined
        if (message.buttons != null) {
            const inline_keyboard: InlineKeyboardButton[][] = []
            message.buttons.forEach(x => {
                inline_keyboard.push([{
                        text: x.buttonText.displayText,
                        callback_data: x.buttonId
                    }])
            });
            reply_markup = {
                inline_keyboard: inline_keyboard
            };
        }

        await this.connection.telegram.sendMessage(this.map_phone_chatid[id], text, {
            reply_markup: reply_markup,
            parse_mode: "Markdown"
        })
    };

    async connect() {
        this.map_userid_phone = await this.appDataStorage.loadMap("telegram", "map_userid_phone")

        this.connection = new Telegraf(this.token);

        this.connection.on("callback_query", this.processMessage)
        this.connection.on(message("text"), this.processMessage)
        this.connection.on(message("contact"), this.processContact);

        this.logger.info("connecting to telegram");
        await this.connection.launch()
    }

    private processMessage = (ctx) => {
        if (ctx.from.is_bot) 
            return;

        const user_id = ctx.from.id;
        if (user_id in this.map_userid_phone) {
            const phone_number = this.map_userid_phone[user_id];
            this.map_phone_chatid[phone_number] = ctx.chat.id;

            const text = ctx.message?.text || ctx.callbackQuery.data;
            this.logger.info({phone_number, text});

            this.read(phone_number, {
                text,
                timestamp: ctx.message?.date || ctx.callbackQuery.message.date
            })
        } else {
            this.sendContactMessage(ctx);
        }
    }

    private sendContactMessage(ctx : Context) {
        this.logger.info("Request contact to", ctx.from.first_name);
        ctx.reply("Poderia nos enviar seu contato por favor.", Markup.keyboard([[Markup.button.contactRequest("📲 Enviar contato")]]))
    }

    private processContact = (ctx) => {
        const contact = ctx.message.contact;

        if (contact.user_id in this.map_userid_phone) {
            ctx.reply("Desculpa não entendi");
            return;
        }

        if (contact.user_id === ctx.from.id) {
            const phone_number = contact.phone_number.slice(2, 4) + contact.phone_number.slice(5);

            this.logger.info("Phone number received + ", phone_number);

            this.appDataStorage.insertToMap("telegram", "map_userid_phone", contact.user_id, phone_number)

            this.map_userid_phone[contact.user_id] = phone_number;
            this.map_phone_chatid[phone_number] = ctx.chat.id;
            ctx.reply("Obrigado!", {
                reply_markup: {
                    remove_keyboard: true
                }
            });
            this.read(phone_number, {
                text: "",
                timestamp: ctx.message.message_id
            })
        } else {
            ctx.reply("Desculpa, mas esse não parece ser seu contato.");
            this.sendContactMessage(ctx);
        }
    }
}

