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
exports.checkUpdatePositionStatus = void 0;
const supabase_1 = require("../lib/supabase");
const telegram_1 = require("../lib/telegram");
function checkUpdatePositionStatus(lnm) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            let pendingPositions = yield (0, supabase_1.searchPositionSupaBase)(false, `${process.env.USERNAME}_${process.env.TRADING_VIEW_API_TIMEFRAME}_positions`);
            let cashInPositions = yield (0, supabase_1.searchPositionSupaBase)(false, `${process.env.USERNAME}_${process.env.TRADING_VIEW_API_TIMEFRAME}_cashin_positions`);
            let closedPositions = yield lnm.futuresGetPositions({
                type: "closed",
            });
            closedPositions.forEach((ClosedPosition) => {
                //search throught exisitng pid to see if it's a match, if match we update.
                pendingPositions.forEach((pendingPosition) => __awaiter(this, void 0, void 0, function* () {
                    if (ClosedPosition["pid"] === pendingPosition["pid"]) {
                        if (ClosedPosition["stoploss_wi"] === "filled") {
                            yield (0, supabase_1.updatePositionSupaBase)(ClosedPosition["pid"], ClosedPosition["pl"], ClosedPosition["margin_wi"] + "_STOPLOSS", true, ClosedPosition["exit_price"], `${process.env.USERNAME}_${process.env.TRADING_VIEW_API_TIMEFRAME}_positions`);
                            (0, telegram_1.sendTelegram)(`Position closed @ ${ClosedPosition["exit_price"]} Profit: ${ClosedPosition["pl"]} Reason: Stoploss`);
                        }
                        else {
                            yield (0, supabase_1.updatePositionSupaBase)(ClosedPosition["pid"], ClosedPosition["pl"], ClosedPosition["margin_wi"], true, ClosedPosition["exit_price"], `${process.env.USERNAME}_${process.env.TRADING_VIEW_API_TIMEFRAME}_positions`);
                            (0, telegram_1.sendTelegram)(`Position closed @ ${ClosedPosition["exit_price"]} Profit: ${ClosedPosition["pl"]} Reason: ${ClosedPosition["margin_wi"]}`);
                        }
                        if (ClosedPosition["canceled"] === true) {
                            yield (0, supabase_1.updatePositionSupaBase)(ClosedPosition["pid"], ClosedPosition["pl"], "Canceled_Position", true, ClosedPosition["exit_price"], `${process.env.USERNAME}_${process.env.TRADING_VIEW_API_TIMEFRAME}_positions`);
                            (0, telegram_1.sendTelegram)(`Position cancelled Reason: Time expired`);
                        }
                    }
                }));
                //search throught cash-in exisitng pid to see if it's a match, if match we update.
                cashInPositions.forEach((pendingPosition) => __awaiter(this, void 0, void 0, function* () {
                    if (ClosedPosition["pid"] === pendingPosition["pid"]) {
                        if (ClosedPosition["stoploss_wi"] === "filled") {
                            yield (0, supabase_1.updatePositionSupaBase)(ClosedPosition["pid"], ClosedPosition["pl"], ClosedPosition["margin_wi"] + "_STOPLOSS", true, ClosedPosition["exit_price"], `${process.env.USERNAME}_${process.env.TRADING_VIEW_API_TIMEFRAME}_cashin_positions`);
                            (0, telegram_1.sendTelegram)(`Cash-In Position closed @ ${ClosedPosition["exit_price"]} Profit: ${ClosedPosition["pl"]} Reason: Stoploss`);
                        }
                        else {
                            yield (0, supabase_1.updatePositionSupaBase)(ClosedPosition["pid"], ClosedPosition["pl"], ClosedPosition["margin_wi"] + "_TAKEPROFIT", true, ClosedPosition["exit_price"], `${process.env.USERNAME}_${process.env.TRADING_VIEW_API_TIMEFRAME}_cashin_positions`);
                            (0, telegram_1.sendTelegram)(`Cash-In Position closed @ ${ClosedPosition["exit_price"]} Profit: ${ClosedPosition["pl"]} Reason: ${ClosedPosition["margin_wi"]}`);
                        }
                    }
                }));
            });
            resolve();
        }
        catch (err) {
            reject(`Rejected checkUpdatePositionStatus.ts. Error: ${err}`);
        }
    }));
}
exports.checkUpdatePositionStatus = checkUpdatePositionStatus;
