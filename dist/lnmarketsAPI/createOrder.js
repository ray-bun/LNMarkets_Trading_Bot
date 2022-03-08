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
require("../lib/env");
/**
 * @Create position https://docs.lnmarkets.com/api/v1/#create
 */
function createOrder(lnm, type, side, price, margin, leverage, takeprofit, stoploss) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (process.env.ENABLE_TRADING === "true") {
                let createNewPosition = yield lnm.futuresNewPosition({
                    type,
                    side,
                    price,
                    margin,
                    leverage,
                    stoploss,
                });
                resolve(createNewPosition);
            }
            else {
                reject("Rejected createOrder.ts (createOrder). Trading disabled");
            }
        }
        catch (err) {
            console.log(`Rejected createOrder.ts (createOrder) Error: ${err}`);
            reject(`Rejected createOrder.ts (createOrder) Error: ${err}`);
        }
    }));
}
exports.default = createOrder;
