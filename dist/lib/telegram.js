"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTelegram = void 0;
require("../lib/env");
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const bot = new node_telegram_bot_api_1.default(process.env.TELEGRAM_TOKEN);
function sendTelegram(messageTelegram) {
    let currentEnv = process.env.LNMARKETS_API_NETWORK === "testnet" ? "TESTNET" : "MAINNET";
    bot.sendMessage(process.env.TELEGRAM_CHATID, `${currentEnv}_${process.env.TRADING_VIEW_API_TIMEFRAME} - ${messageTelegram}`);
}
exports.sendTelegram = sendTelegram;
