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
/**
 * @Create position https://docs.lnmarkets.com/api/v1/#create
 */
function accountBalance(lnm) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            let closedPositions = yield lnm.futuresGetPositions({ type: "closed" });
            let depositHistory = yield lnm.depositHistory({
                limit: 10,
            });
            let totalClosedProfit = 0;
            let totalClosedLoss = 0;
            let totalAmountDeposited = 0;
            depositHistory.map((depositHist) => {
                if (depositHist["success"]) {
                    totalAmountDeposited += depositHist["amount"];
                }
            });
            closedPositions.map((closedPosition) => {
                if (closedPosition["pl"] < 0) {
                    totalClosedLoss += closedPosition["pl"];
                }
                else {
                    totalClosedProfit += closedPosition["pl"];
                }
            });
            let profit = totalClosedProfit + totalClosedLoss;
            let balance = totalAmountDeposited + profit;
            resolve({ totalAmountDeposited, totalClosedProfit, totalClosedLoss, profit, balance });
        }
        catch (err) {
            reject(`Rejected accountBalance.ts. Error: ${err}`);
        }
    }));
}
exports.default = accountBalance;
