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
function numberOfOpenRunningPositions(lnm) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            let runningPositions = yield lnm.futuresGetPositions({
                type: "running",
            });
            let openPositions = yield lnm.futuresGetPositions({
                type: "open",
            });
            let closedPositions = yield lnm.futuresGetPositions({
                type: "closed",
            });
            let numberOfOpenRunningPositions = { running: Number(Object.entries(runningPositions).length), open: Number(Object.entries(openPositions).length), closed: Number(Object.entries(closedPositions).length) };
            resolve(numberOfOpenRunningPositions);
        }
        catch (err) {
            reject(err);
        }
    }));
}
exports.default = numberOfOpenRunningPositions;
