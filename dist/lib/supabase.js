"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchPositionSupaBase = exports.updatePositionSupaBase = exports.insertCashInPosition = exports.insertPositionSupaBase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
require("../lib/env");
const telegram_1 = require("./telegram");
let supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
function insertPositionSupaBase(orderDataUnSorted, sizeCalculation, positionNumber, randomText) {
    return __awaiter(this, void 0, void 0, function* () {
        let orderData = orderDataUnSorted["position"];
        let orderDataInsert = {
            id: orderData["id"],
            pid: orderData["pid"],
            side: orderData["side"],
            type: orderData["type"],
            price: orderData["price"],
            take_profit: sizeCalculation["takeProfitTargetFinal"][positionNumber],
            take_profit_target_one: sizeCalculation["takeProfitFirst"][positionNumber],
            stoploss_price: sizeCalculation["stopLoss"][positionNumber],
            stoploss_target_one: sizeCalculation["stopLossFirst"][positionNumber],
            pl: orderData["pl"],
            position_status: orderData["margin_wi"] === null ? "open" : "running",
            positionLabel: `${positionNumber}_${randomText}`,
        };
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { error } = yield supabase.from(`${process.env.USERNAME}_${process.env.TRADING_VIEW_API_TIMEFRAME}_positions`).insert([orderDataInsert]);
                (0, telegram_1.sendTelegram)(`${sizeCalculation["buyOrSell"]}_${positionNumber} @ ${orderData["price"]} Candle: ${sizeCalculation["candle"]} StopLoss: ${sizeCalculation["stopLoss"][positionNumber]} Profit_#1: ${sizeCalculation["takeProfitFirst"][positionNumber]} TakeProfit_#2: ${sizeCalculation["takeProfitTargetFinal"][positionNumber]}`);
                if (error) {
                    console.log("Error @ positions", error);
                    reject(error);
                }
                else
                    resolve(true);
            }
            catch (err) {
                reject(`Rejected supabase.ts (insertPositionSupaBase) Error: ${err}`);
            }
        }));
    });
}
exports.insertPositionSupaBase = insertPositionSupaBase;
function insertCashInPosition(orderData, activeSupaBasePosition, pl) {
    return __awaiter(this, void 0, void 0, function* () {
        let orderDataInsert = {
            id: orderData["id"],
            pid: orderData["pid"],
            pid_parent: orderData["parent"],
            side: orderData["side"],
            type: orderData["type"],
            price: orderData["price"],
            take_profit: activeSupaBasePosition["take_profit"],
            stoploss_price: activeSupaBasePosition[`${process.env.MOVE_STOPLOSS_ON_WIN === "true" ? "price" : "stoploss_target_one"}`],
            previous_pl: pl,
            position_status: orderData["margin_wi"],
        };
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { error } = yield supabase.from(`${process.env.USERNAME}_${process.env.TRADING_VIEW_API_TIMEFRAME}_cashin_positions`).insert([orderDataInsert]);
                (0, telegram_1.sendTelegram)(`Take profit executed`);
                if (error) {
                    console.log("Error @ positions", error);
                    reject(error);
                }
                else
                    resolve(true);
            }
            catch (err) {
                reject(`Rejected supabase.ts (insertPositionSupaBase) Error: ${err}`);
            }
        }));
    });
}
exports.insertCashInPosition = insertCashInPosition;
/*
Position_status: running, closed
*/
function updatePositionSupaBase(pid, pl, position_status, trade_completed, exit_price, table) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                let win = pl <= 0 ? false : true;
                const { error } = yield supabase.from(table).update({ position_status, trade_completed, pl, win, exit_price }).eq("pid", pid);
                if (error) {
                    reject(`Rejected supabase.ts (updatePositionSupaBase in IF clause) Error: ${error}`);
                }
                else {
                    resolve();
                }
            }
            catch (err) {
                reject(`Rejected supabase.ts (updatePositionSupaBase) Error: ${err}`);
            }
        }));
    });
}
exports.updatePositionSupaBase = updatePositionSupaBase;
/*
Position_status: running, closed
*/
function searchPositionSupaBase(trade_completed, table) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                let { data, error } = yield supabase.from(table).select("*").eq("trade_completed", trade_completed);
                if (error) {
                    reject(`Rejected supabase.ts (searchPositionSupaBase) Error: ${error}`);
                }
                else {
                    resolve(data);
                }
            }
            catch (err) {
                reject(`Rejected supabase.ts (searchPositionSupaBase) Error: ${err}`);
            }
        }));
    });
}
exports.searchPositionSupaBase = searchPositionSupaBase;
