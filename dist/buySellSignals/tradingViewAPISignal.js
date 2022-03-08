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
const axios_1 = __importDefault(require("axios"));
require("../lib/env");
/**
 * Run your own Trading View API
 * https://github.com/RielBitcoin/TradingView_Technical_Analysis_API
 */
function tradingViewAPISignal(timeFrame) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(`${process.env.TRADINGVIEW_SIGNAL_URL}/${process.env.TRADINGVIEW_SIGNAL_SYMBOL}/crypto/${process.env.TRADINGVIEW_SIGNAL_EXCHANGE}/${timeFrame}`, {
                headers: { "User-Agent": "request" },
            });
            let obj = response.data;
            if (Object.entries(obj).length > 1 && obj.constructor === Object) {
                let signalRecommendation = obj["RECOMMENDATION"];
                console.log("Current signal recommendation: " + signalRecommendation);
                if (signalRecommendation === "BUY" || signalRecommendation === "STRONG_BUY") {
                    if (signalRecommendation === "STRONG_BUY" && process.env.STRONG_SIGNAL_TRADE === "true") {
                        resolve("STRONG_BUY");
                    }
                    else if (process.env.STRONG_SIGNAL_TRADE === "false" && (signalRecommendation === "BUY" || signalRecommendation === "STRONG_BUY")) {
                        resolve("BUY");
                    }
                    else {
                        resolve("NEUTRAL");
                    }
                }
                else if (signalRecommendation === "SELL" || signalRecommendation === "STRONG_SELL") {
                    if (signalRecommendation === "STRONG_SELL" && process.env.STRONG_SIGNAL_TRADE === "true") {
                        resolve("STRONG_SELL");
                    }
                    else if (process.env.STRONG_SIGNAL_TRADE === "false" && (signalRecommendation === "SELL" || signalRecommendation === "STRONG_SELL")) {
                        resolve("SELL");
                    }
                    else {
                        resolve("NEUTRAL");
                    }
                }
            }
            else {
                reject();
            }
        }
        catch (err) {
            reject(err);
        }
    }));
}
exports.default = tradingViewAPISignal;
