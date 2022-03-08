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
require("./lib/env");
const api_1 = require("@ln-markets/api");
const tradingViewAPISignal_1 = __importDefault(require("./buySellSignals/tradingViewAPISignal"));
const sizingCalculation_1 = __importDefault(require("./lnmarketsAPI/sizingCalculation"));
const createOrder_1 = __importDefault(require("./lnmarketsAPI/createOrder"));
const accountBalance_1 = __importDefault(require("./lnmarketsAPI/accountBalance"));
const supabase_1 = require("./lib/supabase");
const checkUpdatePositionStatus_1 = require("./lnmarketsAPI/checkUpdatePositionStatus");
const telegram_1 = require("./lib/telegram");
const numberOfOpenRunningPositions_1 = __importDefault(require("./lnmarketsAPI/numberOfOpenRunningPositions"));
const manageCurrentPosition_1 = require("./lnmarketsAPI/manageCurrentPosition");
const previousPositionTimerDelay_1 = __importDefault(require("./lnmarketsAPI/previousPositionTimerDelay"));
const bidAndOfferHistory_1 = __importDefault(require("./lnmarketsAPI/bidAndOfferHistory"));
const lnm = new api_1.LNMarketsRest();
function startBot() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let bidAndOfferObj = yield (0, bidAndOfferHistory_1.default)(lnm);
            let accountBal = yield (0, accountBalance_1.default)(lnm);
            let totalNumberOfPositions = yield (0, numberOfOpenRunningPositions_1.default)(lnm);
            let checkPosition = totalNumberOfPositions["open"] + totalNumberOfPositions["running"] >= 1;
            let totalAmountOfPostitions = totalNumberOfPositions["open"] + totalNumberOfPositions["running"] + totalNumberOfPositions["closed"];
            let signalRecommendation = yield (0, tradingViewAPISignal_1.default)(process.env.TRADING_VIEW_API_TIMEFRAME);
            let nextPostionTimerDelay = yield (0, previousPositionTimerDelay_1.default)(lnm, signalRecommendation);
            if (checkPosition) {
                console.log(`Max position exceeded! Open: ${totalNumberOfPositions["open"]} Running: ${totalNumberOfPositions["running"]}`);
                (0, manageCurrentPosition_1.manageCurrentPosition)(lnm, signalRecommendation, bidAndOfferObj);
                (0, checkUpdatePositionStatus_1.checkUpdatePositionStatus)(lnm);
                // manage current positions
            }
            else if (!checkPosition && signalRecommendation !== "NEUTRAL" && nextPostionTimerDelay) {
                (0, manageCurrentPosition_1.manageCurrentPosition)(lnm, signalRecommendation, bidAndOfferObj);
                let messageTelegram = `NEW ORDERS: Signal: ${signalRecommendation} Start Balance: ${accountBal["totalAmountDeposited"]} Current Balance: ${accountBal["balance"]} Profit: ${accountBal["profit"]} Open: ${totalNumberOfPositions["open"]} Running: ${totalNumberOfPositions["running"]}`;
                (0, telegram_1.sendTelegram)(messageTelegram);
                console.log(messageTelegram);
                if (signalRecommendation === "BUY" || signalRecommendation === "STRONG_BUY") {
                    if (process.env.ON_SIGNAL_BUY === "BUY") {
                        let sizeCalculation = yield (0, sizingCalculation_1.default)(lnm, "BUY", bidAndOfferObj);
                        yield buyOrSell(sizeCalculation, "b");
                    }
                    else {
                        let sizeCalculation = yield (0, sizingCalculation_1.default)(lnm, "SELL", bidAndOfferObj);
                        yield buyOrSell(sizeCalculation, "s");
                    }
                }
                else if (signalRecommendation === "SELL" || signalRecommendation === "STRONG_SELL") {
                    if (process.env.ON_SIGNAL_SELL === "SELL") {
                        let sizeCalculation = yield (0, sizingCalculation_1.default)(lnm, "SELL", bidAndOfferObj);
                        yield buyOrSell(sizeCalculation, "s");
                    }
                    else {
                        let sizeCalculation = yield (0, sizingCalculation_1.default)(lnm, "BUY", bidAndOfferObj);
                        yield buyOrSell(sizeCalculation, "b");
                    }
                }
            }
            else if (totalAmountOfPostitions > 0) {
                (0, checkUpdatePositionStatus_1.checkUpdatePositionStatus)(lnm);
            }
            else {
                console.log("No signal match.");
            }
        }
        catch (err) {
            let messageTelegram = `Error, please check bot. ${err}`;
            console.log(messageTelegram);
            (0, telegram_1.sendTelegram)(messageTelegram);
        }
    });
}
function buyOrSell(sizeCalculation, side) {
    return __awaiter(this, void 0, void 0, function* () {
        let leverageSize = Number(process.env.LEVERAGE_SIZE);
        let randomText = (Math.random() + 1).toString(36).substring(7);
        for (let i = 0; i < Number(process.env.MAX_NO_POSITION); i++) {
            let orderDataUnSorted = yield (0, createOrder_1.default)(lnm, "l", side, sizeCalculation["buyOrSellPrice"][i], Math.floor(sizeCalculation["positionSizeInSat"] / Number(process.env.MAX_NO_POSITION)), leverageSize, sizeCalculation["takeProfitTargetFinal"][i], sizeCalculation["stopLoss"][i]);
            yield (0, supabase_1.insertPositionSupaBase)(orderDataUnSorted, sizeCalculation, i, randomText);
        }
    });
}
startBot();
