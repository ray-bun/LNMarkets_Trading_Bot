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
require("../lib/env");
const alphavantageAPI_1 = __importDefault(require("../alphavantageAPI/alphavantageAPI"));
function sizingCalculation(lnm, buyOrSell, bidAndOfferObj) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            const getUserInfo = yield lnm.getUser();
            let bitcoinPrice = 0;
            if (buyOrSell === "BUY") {
                bitcoinPrice = bidAndOfferObj["offer"];
            }
            else if (buyOrSell === "SELL") {
                bitcoinPrice = bidAndOfferObj["bid"];
            }
            if (Object.entries(getUserInfo).length > 1 && getUserInfo.constructor === Object) {
                let balance = getUserInfo["balance"];
                let riskSatsAmount = (balance * Number(process.env.RISK_PERCENTAGE)) | 0;
                let riskDollarAmount = (bitcoinPrice / 100000000) * riskSatsAmount;
                let satsPerDollar = (100000000 / bitcoinPrice) | 0; // 0 remove the double digit
                let walletDollarBalance = (balance / satsPerDollar) | 0;
                let atrValue = yield (0, alphavantageAPI_1.default)("ATR", "BTCUSD", process.env.ALPHAVANTAGE_ATR_TIMEFRAME, Number(process.env.ALPHAVANTAGE_ATR_NUMBER_OF_CANDLES));
                //We use ATRRisk amount to put in our stop
                let atrRiskTarget = Number(atrValue["ATR"] * Number(process.env.ATR_RISK)) | 0;
                let atrProfitTarget = Number(atrValue["ATR"] * Number(process.env.ATR_PROFIT)) | 0;
                let buyOrSellPrice = [];
                let stopLoss = [], stopLossFirst = [];
                let takeProfitFirst = [], takeProfitTargetFinal = [];
                let atrValueBuySellTarget = (Number(atrValue["ATR"]) / Number(process.env.MAX_NO_POSITION)) | 0;
                console.log("atrValueBuySellTarget", atrValueBuySellTarget);
                if (buyOrSell === "BUY") {
                    //Set multiple buy order rings prices
                    for (let i = 0; i < Number(process.env.MAX_NO_POSITION); i++) {
                        if (i === 0) {
                            buyOrSellPrice[i] = bitcoinPrice - atrValueBuySellTarget;
                            stopLoss[i] = buyOrSellPrice[i] - atrRiskTarget;
                            stopLossFirst[i] = buyOrSellPrice[i] - atrRiskTarget / 2;
                            takeProfitFirst[i] = buyOrSellPrice[i] + atrProfitTarget / 2;
                            takeProfitTargetFinal[i] = buyOrSellPrice[i] + atrProfitTarget;
                        }
                        else {
                            buyOrSellPrice[i] = buyOrSellPrice[i - 1] - atrValueBuySellTarget;
                            stopLoss[i] = buyOrSellPrice[i] - atrRiskTarget;
                            stopLossFirst[i] = buyOrSellPrice[i] - atrRiskTarget / 2;
                            takeProfitFirst[i] = buyOrSellPrice[i] + atrProfitTarget / 2;
                            takeProfitTargetFinal[i] = buyOrSellPrice[i] + atrProfitTarget;
                        }
                    }
                }
                else if (buyOrSell === "SELL") {
                    for (let i = 0; i < Number(process.env.MAX_NO_POSITION); i++) {
                        if (i === 0) {
                            buyOrSellPrice[i] = bitcoinPrice + atrValueBuySellTarget;
                            stopLoss[i] = buyOrSellPrice[i] + atrRiskTarget;
                            stopLossFirst[i] = buyOrSellPrice[i] + atrRiskTarget / 2;
                            takeProfitFirst[i] = buyOrSellPrice[i] - atrProfitTarget / 2;
                            takeProfitTargetFinal[i] = buyOrSellPrice[i] - atrProfitTarget;
                        }
                        else {
                            buyOrSellPrice[i] = buyOrSellPrice[i - 1] + atrValueBuySellTarget;
                            stopLoss[i] = buyOrSellPrice[i] + atrRiskTarget;
                            stopLossFirst[i] = buyOrSellPrice[i] + atrRiskTarget / 2;
                            takeProfitFirst[i] = buyOrSellPrice[i] - atrProfitTarget / 2;
                            takeProfitTargetFinal[i] = buyOrSellPrice[i] - atrProfitTarget;
                        }
                    }
                }
                /* Position Size = (Wallet Balance * Risk%) / (%Stop Loss * Leverage)
                 * Difference of 100 and 90 = |100 - 90|/((100 + 90)/2) = 10/95 = 0.10526315789474 = 10.526315789474% https://www.calculator.net/percent-calculator.html?c3par1=100&c3par2=90&ctype=3&x=55&y=20#pctdifference
                 * https://www.youtube.com/watch?v=BZYusmbiHLo on how to calculare position size
                 */
                let bitcoinPriceStopPrice = bitcoinPrice - atrRiskTarget;
                let atrPercentageStopLoss = (bitcoinPrice - bitcoinPriceStopPrice) / ((bitcoinPrice + bitcoinPriceStopPrice) / 2);
                // Adjusting by 10000 sats to make sure we don't get invalid valid
                let positionSizeInSat = ((balance * Number(process.env.RISK_PERCENTAGE)) / (atrPercentageStopLoss * Number(process.env.LEVERAGE_SIZE)) - 10000) | 0;
                let sizingResponse = {
                    buyOrSell,
                    candle: process.env.ALPHAVANTAGE_ATR_TIMEFRAME,
                    balance,
                    riskSatsAmount,
                    riskDollarAmount,
                    satsPerDollar,
                    walletDollarBalance,
                    atrValue: atrValue["ATR"] | 0,
                    atrRiskTarget,
                    atrProfitTarget,
                    atrPercentageStopLoss,
                    positionSizeInSat,
                    bitcoinPrice,
                    buyOrSellPrice,
                    stopLoss,
                    stopLossFirst,
                    takeProfitFirst,
                    takeProfitTargetFinal,
                };
                console.log("sizingResponse", sizingResponse);
                resolve(sizingResponse);
            }
        }
        catch (err) {
            reject(`Rejected sizingCalculation.ts (sizingCalculation) Error: ${err}`);
        }
    }));
}
exports.default = sizingCalculation;
