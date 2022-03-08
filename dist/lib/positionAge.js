"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function positionAge(positionDate, timeFrame) {
    let positionDateConvert = new Date(positionDate);
    let date = new Date();
    let todayDateInUTC = date.toISOString();
    let todayDateInUTCConvert = new Date(todayDateInUTC);
    let howManyHoursOrDays = 0;
    switch (timeFrame) {
        case "how_many_hours":
            howManyHoursOrDays = Math.ceil(Math.abs(todayDateInUTCConvert - positionDateConvert) / 36e5);
            break;
        case "how_many_days":
            // let diff = Math.floor(today - positionDateConvert.getTime());
            // let day = 1000 * 60 * 60 * 24;
            // howManyHoursOrDays = Math.floor(diff / day);
            break;
        default:
            break;
    }
    return howManyHoursOrDays;
}
exports.default = positionAge;
