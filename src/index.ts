import Bot from "./Bot";

const bot = new Bot();

bot.connect().catch((err) => console.error(`encountered error: ${err}`));
