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
 * See doco for reference:
 * https://docs.lnmarkets.com/api/v1/#futures-bid-and-offer-history
 */
function bidAndOfferHistory(lnm) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            const latestBidOffer = yield lnm.futuresBidOfferHistory({
                limit: 20,
            });
            let obj = latestBidOffer[0];
            if (Object.entries(obj).length > 1 && obj.constructor === Object) {
                let bid = obj["bid"];
                let offer = obj["offer"];
                resolve({ bid, offer });
            }
            else {
                reject();
            }
        }
        catch (err) {
            reject(`Rejected bidAndOfferHistory.ts (bidAndOfferHistory) Error: ${err}`);
        }
    }));
}
//bidAndOfferHistory();
exports.default = bidAndOfferHistory;
