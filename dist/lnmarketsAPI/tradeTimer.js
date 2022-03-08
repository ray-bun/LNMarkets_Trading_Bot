"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let utcTime = new Date(new Date().toUTCString());
function tradeTimer() {
    let hour = utcTime.getUTCHours();
    let minute = utcTime.getUTCMinutes();
    // An hour break before we rebuy into the market
    if ((hour === 7 && minute >= 50) || (hour === 8 && minute <= 30)) {
        return "EXPIRED";
    }
    else {
        return "VALID";
    }
}
exports.default = tradeTimer;
