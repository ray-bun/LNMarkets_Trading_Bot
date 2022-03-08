import "../lib/env";
import TelegramBot from "node-telegram-bot-api";
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN);

export function sendTelegram(messageTelegram: any): void {
  let currentEnv: string = process.env.LNMARKETS_API_NETWORK === "testnet" ? "TESTNET" : "MAINNET";
  bot.sendMessage(process.env.TELEGRAM_CHATID, `${currentEnv}_${process.env.TRADING_VIEW_API_TIMEFRAME} - ${messageTelegram}`);
}
