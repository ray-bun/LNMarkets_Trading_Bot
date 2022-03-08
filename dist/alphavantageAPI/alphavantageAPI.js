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
 * See doco for reference:
 * https://www.alphavantage.co/query?function=ATR&symbol=IBM&interval=daily&time_period=14&apikey=demo
 */
function alphavantageAPI(func, symbol, interval, time_period) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(`https://www.alphavantage.co/query?function=${func}&symbol=${symbol}&interval=${interval}&time_period=${time_period}&apikey=${process.env.ALPHAVANTAGE_KEY}`, {
                headers: { "User-Agent": "request" },
            });
            let obj = response.data;
            // console.log(obj);
            if (Object.entries(obj).length > 1 && obj.constructor === Object) {
                let lastValue = obj[`Technical Analysis: ${func}`];
                let lastValueExtract = lastValue[Object.keys(lastValue)[0]];
                //console.log(lastValueExtract);
                resolve(lastValueExtract);
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
exports.default = alphavantageAPI;
//alphavantageAPI("ATR", "BTCUSD", "60min", 14);
