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
const positionAge_1 = __importDefault(require("../lib/positionAge"));
function previousPositionTimerDelay(lnm, signalRecommendation) {
    return __awaiter(this, void 0, void 0, function* () {
        let closedPositions = yield lnm.futuresGetPositions({
            type: "closed",
        });
        if (closedPositions.length >= 5) {
            let lastClosedItems = [];
            for (let i = 0; i < 5; i++) {
                lastClosedItems.push(closedPositions[i]["closed_ts"]);
                if (i === 4) {
                    let lastOrderTime = Math.max(...lastClosedItems);
                    for (let i = 0; i < lastClosedItems.length; i++) {
                        if (closedPositions[i]["closed_ts"] === lastOrderTime) {
                            let lastPositionTimer = (0, positionAge_1.default)(closedPositions[i]["closed_ts"], "how_many_hours");
                            console.log("Last closed Position Hour: " + lastPositionTimer);
                            if (process.env.NO_SAME_SIDE_IF_LOSS === "true" && lastPositionTimer >= Number(process.env.SAME_SIDE_WAITTIME) && closedPositions[i]["pl"] < 0) {
                                console.log("More than 24 hours since last closed a losing position. Lets buy/sell something.");
                                return true;
                            }
                            else if (process.env.NO_SAME_SIDE_IF_LOSS === "true" && lastPositionTimer < Number(process.env.SAME_SIDE_WAITTIME) && closedPositions[i]["pl"] < 0) {
                                console.log("Less than 24 hours since last closed a losing position. Not buying");
                                return false;
                            }
                            else if (signalRecommendation === "BUY" && closedPositions[i]["side"] === "b" && closedPositions[i]["pl"] < 0 && process.env.NO_SAME_SIDE_IF_LOSS === "true") {
                                //previous stop loss postion was a buy and it was a loss
                                console.log("Previous stop loss postion was a buy and it was a loss. Ignoring signal to buy.");
                                return false;
                            }
                            else if (signalRecommendation === "SELL" && closedPositions[i]["side"] === "s" && closedPositions[i]["pl"] < 0 && process.env.NO_SAME_SIDE_IF_LOSS === "true") {
                                //previous stop loss postion was a sell and it was a loss
                                console.log("Previous stop loss postion was a sell and it was a loss. Ignoring signal to buy.");
                                return false;
                            }
                            else if (lastPositionTimer >= Number(process.env.STOPLOSS_HOUR_WAITTIME) && closedPositions[i]["stoploss_wi"] === "filled") {
                                // Last stop loss is more than certain hours, we allow it to trade again
                                return true;
                            }
                            else if (closedPositions[i]["canceled"]) {
                                // if last position was canceled due to expiry, we allow it to trade again
                                return true;
                            }
                            else if (closedPositions[i]["closed"] && closedPositions[i]["pl"] > 1 && lastPositionTimer >= Number(process.env.DELAY_TRADE_AFTER_WIN)) {
                                // Winning position delay
                                return true;
                            }
                            else {
                                console.log("BUY/SELL criteria not met in previousPositionTimerDelay.");
                                return false;
                            }
                        }
                        else if (closedPositions.length === 0) {
                            return true;
                        }
                        else {
                            false;
                        }
                    }
                }
            }
        }
        else {
            return true;
        }
    });
}
exports.default = previousPositionTimerDelay;
