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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.manageCurrentPosition = void 0;
/**
 * @Create position https://docs.lnmarkets.com/api/v1/#create
 */
require("../lib/env");
const supabase_1 = require("../lib/supabase");
const telegram_1 = require("../lib/telegram");
const positionAge_1 = __importDefault(require("../lib/positionAge"));
function manageCurrentPosition(lnm, signalRecommendation, bidAndOfferObj) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let pendingPositionDB = yield (0, supabase_1.searchPositionSupaBase)(false, `${process.env.USERNAME}_${process.env.TRADING_VIEW_API_TIMEFRAME}_positions`);
            let pendingCashInPositionDB = yield (0, supabase_1.searchPositionSupaBase)(false, `${process.env.USERNAME}_${process.env.TRADING_VIEW_API_TIMEFRAME}_cashin_positions`);
            let runningPositions = yield lnm.futuresGetPositions({
                type: "running",
            });
            let openPositions = yield lnm.futuresGetPositions({
                type: "open",
            });
            // Manage open position. We close if it's older than 24 hours and no running positions.
            if (runningPositions.length === 0 && openPositions.length >= 1) {
                openPositions.map((activeOpenPosition) => __awaiter(this, void 0, void 0, function* () {
                    let openPositionAge = (0, positionAge_1.default)(activeOpenPosition["creation_ts"], "how_many_hours");
                    console.log(`Open position age: ${openPositionAge} Date: ${activeOpenPosition["creation_ts"]}`);
                    if (openPositionAge >= Number(process.env.OPEN_POSITION_HOUR_WAITTIME)) {
                        yield lnm.futuresCancelPosition({
                            pid: activeOpenPosition["pid"],
                        });
                        (0, telegram_1.sendTelegram)(`Open position expired as it's more than ${openPositionAge} hours. Closing position ${activeOpenPosition["pid"]}`);
                    }
                }));
            }
            // Manage running positions
            runningPositions.map((activeLNMarketPosition) => {
                // Main position
                pendingPositionDB.map((activeSupaBasePosition) => __awaiter(this, void 0, void 0, function* () {
                    yield positionManagement(lnm, signalRecommendation, activeLNMarketPosition, activeSupaBasePosition, bidAndOfferObj, "positions");
                }));
                // Cash in position
                pendingCashInPositionDB.map((activeSupaBasePosition) => __awaiter(this, void 0, void 0, function* () {
                    yield positionManagement(lnm, signalRecommendation, activeLNMarketPosition, activeSupaBasePosition, bidAndOfferObj, "cashin_positions");
                    // Manage in CASH-IN postion
                    let currentProfitLoss = Number(activeLNMarketPosition["pl"]) < 0 ? Number(activeLNMarketPosition["pl"]) : Number(activeLNMarketPosition["pl"]);
                    if (Number(activeLNMarketPosition["pl"]) <= -Number(activeSupaBasePosition["previous_pl"]) &&
                        Number(activeLNMarketPosition["pl"]) < 0 &&
                        Number(activeSupaBasePosition["previous_pl"]) !== 0 &&
                        activeSupaBasePosition["pid"] === activeLNMarketPosition["pid"]) {
                        yield lnm.futuresClosePosition({
                            pid: activeLNMarketPosition["pid"],
                        });
                        yield (0, supabase_1.updatePositionSupaBase)(activeSupaBasePosition["pid"], activeLNMarketPosition["pl"], "STOPLOSS_PREVIOUS_PROFIT_EXCEEDED", true, bidAndOfferObj["bid"], `${process.env.USERNAME}_${process.env.TRADING_VIEW_API_TIMEFRAME}_cashin_positions`);
                        (0, telegram_1.sendTelegram)(`LNMarket: ${activeLNMarketPosition["pid"]} has been closed because we have exceed previous profit.`);
                    }
                }));
            });
        }
        catch (err) {
            console.log("ERROR: manageCurrentPosition", err);
        }
    });
}
exports.manageCurrentPosition = manageCurrentPosition;
function positionManagement(lnm, signalRecommendation, activeLNMarketPosition, activeSupaBasePosition, bidAndOfferObj, table) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let marketSignal = "";
            if (signalRecommendation === "STRONG_BUY") {
                if (process.env.ON_SIGNAL_BUY === "SELL") {
                    marketSignal = "SELL";
                }
                else {
                    marketSignal = "BUY";
                }
            }
            else if (signalRecommendation === "STRONG_SELL") {
                if (process.env.ON_SIGNAL_BUY === "SELL") {
                    marketSignal = "BUY";
                }
                else {
                    marketSignal = "SELL";
                }
            }
            if (activeLNMarketPosition["pid"] === activeSupaBasePosition["pid"]) {
                // Continue to take profit from cash in position
                if (activeLNMarketPosition["pl"] >= activeSupaBasePosition["previous_pl"] && table === "cashin_positions") {
                    let messageTelegram = `Continue to Cash in profit. ${activeLNMarketPosition["pl"]} Sats`;
                    let pl = activeLNMarketPosition["pl"] - 500;
                    (0, telegram_1.sendTelegram)(messageTelegram);
                    let orderData = yield lnm.futuresCashinPosition({
                        amount: pl,
                        pid: activeLNMarketPosition["pid"],
                    });
                    yield (0, supabase_1.insertCashInPosition)(orderData, activeSupaBasePosition, pl);
                    yield (0, supabase_1.updatePositionSupaBase)(activeSupaBasePosition["pid"], pl, "Cash-In-Profit", true, bidAndOfferObj["bid"], `${process.env.USERNAME}_${process.env.TRADING_VIEW_API_TIMEFRAME}_${table}`);
                }
                // LONG POSITION Management
                if (activeLNMarketPosition["side"] === "b") {
                    // TAKE SOME PROFIT OF LONG POSITION
                    if (bidAndOfferObj["bid"] >= activeSupaBasePosition["take_profit"] && table !== "cashin_positions") {
                        let messageTelegram = `LONG - Cash in profit. ${activeLNMarketPosition["pl"]} Sats`;
                        let pl = activeLNMarketPosition["pl"] - 500;
                        (0, telegram_1.sendTelegram)(messageTelegram);
                        let orderData = yield lnm.futuresCashinPosition({
                            amount: pl,
                            pid: activeLNMarketPosition["pid"],
                        });
                        yield (0, supabase_1.insertCashInPosition)(orderData, activeSupaBasePosition, pl);
                        yield (0, supabase_1.updatePositionSupaBase)(activeSupaBasePosition["pid"], pl, "Cash-In-Profit", true, bidAndOfferObj["bid"], `${process.env.USERNAME}_${process.env.TRADING_VIEW_API_TIMEFRAME}_${table}`);
                    }
                    // Close if signal goes against the orginal order
                    else if (marketSignal === "SELL" && process.env.SELL_ON_SIGNAL_AGAINST === "true") {
                        yield lnm.futuresClosePosition({
                            pid: activeLNMarketPosition["pid"],
                        });
                        yield (0, supabase_1.updatePositionSupaBase)(activeSupaBasePosition["pid"], activeLNMarketPosition["pl"], "Against-ORGINAL-Signal", true, bidAndOfferObj["bid"], `${process.env.USERNAME}_${process.env.TRADING_VIEW_API_TIMEFRAME}_${table}`);
                        (0, telegram_1.sendTelegram)(`LNMarket: ${activeLNMarketPosition["pid"]} has been closed because the signal is against the original order.`);
                    }
                }
                else if (activeLNMarketPosition["side"] === "s") {
                    // TAKE SOME PROFIT OF SHORT POSITION
                    if (bidAndOfferObj["bid"] <= activeSupaBasePosition["take_profit"] && table !== "cashin_positions") {
                        let messageTelegram = `SHORT - Cash in profit. ${activeLNMarketPosition["pl"]} Sats`;
                        let pl = activeLNMarketPosition["pl"] - 500;
                        (0, telegram_1.sendTelegram)(messageTelegram);
                        let orderData = yield lnm.futuresCashinPosition({
                            amount: pl,
                            pid: activeLNMarketPosition["pid"],
                        });
                        yield (0, supabase_1.insertCashInPosition)(orderData, activeSupaBasePosition, pl);
                        yield (0, supabase_1.updatePositionSupaBase)(activeSupaBasePosition["pid"], pl, "Cash-In-Profit", true, bidAndOfferObj["bid"], `${process.env.USERNAME}_${process.env.TRADING_VIEW_API_TIMEFRAME}_${table}`);
                    }
                    // Close if signal goes against the orginal order
                    else if (marketSignal === "BUY" && process.env.SELL_ON_SIGNAL_AGAINST === "true") {
                        yield lnm.futuresClosePosition({
                            pid: activeLNMarketPosition["pid"],
                        });
                        yield (0, supabase_1.updatePositionSupaBase)(activeSupaBasePosition["pid"], activeLNMarketPosition["pl"], "Against-ORGINAL-Signal", true, bidAndOfferObj["bid"], `${process.env.USERNAME}_${process.env.TRADING_VIEW_API_TIMEFRAME}_${table}`);
                        (0, telegram_1.sendTelegram)(`LNMarket: ${activeLNMarketPosition["pid"]} has been closed because the signal is against the original order.`);
                    }
                }
            }
        }
        catch (err) {
            console.log("ERROR: positionManagement", err);
        }
    });
}
