import axios from "axios";
import "../lib/env";

/**
 * See doco for reference:
 * https://www.alphavantage.co/query?function=ATR&symbol=IBM&interval=daily&time_period=14&apikey=demo
 */

function alphavantageAPI(func: string, symbol: string, interval: string, time_period: number) {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.get(`https://www.alphavantage.co/query?function=${func}&symbol=${symbol}&interval=${interval}&time_period=${time_period}&apikey=${process.env.ALPHAVANTAGE_KEY}`, {
        headers: { "User-Agent": "request" },
      });
      let obj: any = response.data;
      // console.log(obj);
      if (Object.entries(obj).length > 1 && obj.constructor === Object) {
        let lastValue: number = obj[`Technical Analysis: ${func}`];
        let lastValueExtract: number = lastValue[Object.keys(lastValue)[0]];
        //console.log(lastValueExtract);
        resolve(lastValueExtract);
      } else {
        reject();
      }
    } catch (err) {
      reject(err);
    }
  });
}
export default alphavantageAPI;
//alphavantageAPI("ATR", "BTCUSD", "60min", 14);
