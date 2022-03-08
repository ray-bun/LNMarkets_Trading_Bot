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
/**
 * See doco for reference:
 * https://alternative.me/crypto/fear-and-greed-index/
 */
function fearAndGreedIndicator() {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(`https://api.alternative.me/fng/`, {
                headers: { "User-Agent": "request" },
            });
            let obj = response.data;
            if (Object.entries(obj).length > 1 && obj.constructor === Object) {
                let valueClassification = obj["data"][0]["value_classification"];
                console.log(valueClassification);
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
exports.default = fearAndGreedIndicator;
fearAndGreedIndicator();
