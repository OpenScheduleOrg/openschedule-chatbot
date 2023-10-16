import {Telegraf, Context, Markup} from "telegraf";
import {message} from "telegraf/filters";
import {MessageApp} from "@/presentation/apps";
import {MessageTemplate} from "@/presentation/models";
import {TypeRead} from "@/presentation/interfaces";
import {InlineKeyboardMarkup, InlineKeyboardButton} from "telegraf/typings/core/types/typegram";

export class Telegram implements MessageApp {
    private connection : Telegraf;
    read : TypeRead;
    private map_userid_phone : {
        [phone : string]: string
    } = {}
    private map_phone_chatid : {
        [phone : string]: number
    } = {}


    constructor(private readonly token : string) {};

    send = async (id : string, message : MessageTemplate) => {
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

        console.info("Response to", id);
        console.info("Message:", text);

        await this.connection.telegram.sendMessage(this.map_phone_chatid[id], text, {
            reply_markup: reply_markup,
            parse_mode: "Markdown"
        })
    };

    async connect() {
        this.connection = new Telegraf(this.token);

        this.connection.on("callback_query", this.processMessage)
        this.connection.on(message("text"), this.processMessage)
        this.connection.on(message("contact"), this.processContact);

        console.log("connecting to telegram");
        await this.connection.launch()
    }

    private processMessage = (ctx) => {
        if (ctx.from.is_bot) 
            return;
        

        const user_id = ctx.from.id;
        if (user_id in this.map_userid_phone) {
            const phone_number = this.map_userid_phone[user_id];
            this.map_phone_chatid[phone_number] = ctx.chat.id;

            console.info(phone_number, "send a message", );
            console.info("Message received:", ctx.message?.text || ctx.callbackQuery.data);

            this.read(phone_number, {
                text: ctx.message?.text || ctx.callbackQuery.data,
                timestamp: ctx.message ?. message_id || ctx.callbackQuery.message_id
            })
        } else {
            this.sendContactMessage(ctx);
        }
    }

    private sendContactMessage(ctx : Context) {
        console.info("Request contact to", ctx.from.first_name);
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

            console.info("Phone number received", phone_number);

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

