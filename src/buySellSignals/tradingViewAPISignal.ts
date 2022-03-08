import axios from "axios";
import "../lib/env";
/**
 * Run your own Trading View API
 * https://github.com/RielBitcoin/TradingView_Technical_Analysis_API
 */

function tradingViewAPISignal(timeFrame: string) {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.get(`${process.env.TRADINGVIEW_SIGNAL_URL}/${process.env.TRADINGVIEW_SIGNAL_SYMBOL}/crypto/${process.env.TRADINGVIEW_SIGNAL_EXCHANGE}/${timeFrame}`, {
        headers: { "User-Agent": "request" },
      });
      let obj: any = response.data;
      if (Object.entries(obj).length > 1 && obj.constructor === Object) {
        let signalRecommendation: string = obj["RECOMMENDATION"];
        console.log("Current signal recommendation: " + signalRecommendation);
        if (signalRecommendation === "BUY" || signalRecommendation === "STRONG_BUY") {
          if (signalRecommendation === "STRONG_BUY" && process.env.STRONG_SIGNAL_TRADE === "true") {
            resolve("STRONG_BUY");
          } else if (process.env.STRONG_SIGNAL_TRADE === "false" && (signalRecommendation === "BUY" || signalRecommendation === "STRONG_BUY")) {
            resolve("BUY");
          } else {
            resolve("NEUTRAL");
          }
        } else if (signalRecommendation === "SELL" || signalRecommendation === "STRONG_SELL") {
          if (signalRecommendation === "STRONG_SELL" && process.env.STRONG_SIGNAL_TRADE === "true") {
            resolve("STRONG_SELL");
          } else if (process.env.STRONG_SIGNAL_TRADE === "false" && (signalRecommendation === "SELL" || signalRecommendation === "STRONG_SELL")) {
            resolve("SELL");
          } else {
            resolve("NEUTRAL");
          }
        }
      } else {
        reject();
      }
    } catch (err) {
      reject(err);
    }
  });
}
export default tradingViewAPISignal;
