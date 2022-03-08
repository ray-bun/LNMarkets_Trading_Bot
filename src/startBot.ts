import "./lib/env";
import { LNMarketsRest } from "@ln-markets/api";
import tradingViewAPISignal from "./buySellSignals/tradingViewAPISignal";
import sizingCalculation from "./lnmarketsAPI/sizingCalculation";
import createOrder from "./lnmarketsAPI/createOrder";
import accountBalance from "./lnmarketsAPI/accountBalance";
import { insertPositionSupaBase } from "./lib/supabase";
import { checkUpdatePositionStatus } from "./lnmarketsAPI/checkUpdatePositionStatus";
import { sendTelegram } from "./lib/telegram";
import numberOfOpenRunningPositions from "./lnmarketsAPI/numberOfOpenRunningPositions";
import { manageCurrentPosition } from "./lnmarketsAPI/manageCurrentPosition";
import previousPositionTimerDelay from "./lnmarketsAPI/previousPositionTimerDelay";
import bidAndOfferHistory from "./lnmarketsAPI/bidAndOfferHistory";
const lnm = new LNMarketsRest();

async function startBot() {
  try {
    let bidAndOfferObj: any = await bidAndOfferHistory(lnm);
    let accountBal: any = await accountBalance(lnm);
    let totalNumberOfPositions = await numberOfOpenRunningPositions(lnm);
    let checkPosition: boolean = totalNumberOfPositions["open"] + totalNumberOfPositions["running"] >= 1;
    let totalAmountOfPostitions = totalNumberOfPositions["open"] + totalNumberOfPositions["running"] + totalNumberOfPositions["closed"];
    let signalRecommendation: any = await tradingViewAPISignal(process.env.TRADING_VIEW_API_TIMEFRAME);
    let nextPostionTimerDelay = await previousPositionTimerDelay(lnm, signalRecommendation);
    if (checkPosition) {
      console.log(`Max position exceeded! Open: ${totalNumberOfPositions["open"]} Running: ${totalNumberOfPositions["running"]}`);
      manageCurrentPosition(lnm, signalRecommendation, bidAndOfferObj);
      checkUpdatePositionStatus(lnm);
      // manage current positions
    } else if (!checkPosition && signalRecommendation !== "NEUTRAL" && nextPostionTimerDelay) {
      manageCurrentPosition(lnm, signalRecommendation, bidAndOfferObj);
      let messageTelegram: string = `NEW ORDERS: Signal: ${signalRecommendation} Start Balance: ${accountBal["totalAmountDeposited"]} Current Balance: ${accountBal["balance"]} Profit: ${accountBal["profit"]} Open: ${totalNumberOfPositions["open"]} Running: ${totalNumberOfPositions["running"]}`;
      sendTelegram(messageTelegram);
      console.log(messageTelegram);
      if (signalRecommendation === "BUY" || signalRecommendation === "STRONG_BUY") {
        if (process.env.ON_SIGNAL_BUY === "BUY") {
          let sizeCalculation = await sizingCalculation(lnm, "BUY", bidAndOfferObj);
          await buyOrSell(sizeCalculation, "b");
        } else {
          let sizeCalculation = await sizingCalculation(lnm, "SELL", bidAndOfferObj);
          await buyOrSell(sizeCalculation, "s");
        }
      } else if (signalRecommendation === "SELL" || signalRecommendation === "STRONG_SELL") {
        if (process.env.ON_SIGNAL_SELL === "SELL") {
          let sizeCalculation = await sizingCalculation(lnm, "SELL", bidAndOfferObj);
          await buyOrSell(sizeCalculation, "s");
        } else {
          let sizeCalculation = await sizingCalculation(lnm, "BUY", bidAndOfferObj);
          await buyOrSell(sizeCalculation, "b");
        }
      }
    } else if (totalAmountOfPostitions > 0) {
      checkUpdatePositionStatus(lnm);
    } else {
      console.log("No signal match.");
    }
  } catch (err) {
    let messageTelegram: string = `Error, please check bot. ${err}`;
    console.log(messageTelegram);
    sendTelegram(messageTelegram);
  }
}

async function buyOrSell(sizeCalculation: any, side: string) {
  let leverageSize: number = Number(process.env.LEVERAGE_SIZE);
  let randomText = (Math.random() + 1).toString(36).substring(7);
  for (let i = 0; i < Number(process.env.MAX_NO_POSITION); i++) {
    let orderDataUnSorted = await createOrder(
      lnm,
      "l",
      side,
      sizeCalculation["buyOrSellPrice"][i],
      Math.floor(sizeCalculation["positionSizeInSat"] / Number(process.env.MAX_NO_POSITION)),
      leverageSize,
      sizeCalculation["takeProfitTargetFinal"][i],
      sizeCalculation["stopLoss"][i]
    );
    await insertPositionSupaBase(orderDataUnSorted, sizeCalculation, i, randomText);
  }
}

startBot();
