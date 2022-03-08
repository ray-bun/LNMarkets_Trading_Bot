/**
 * @Create position https://docs.lnmarkets.com/api/v1/#create
 */
import "../lib/env";
import { insertCashInPosition, updatePositionSupaBase, searchPositionSupaBase } from "../lib/supabase";
import { sendTelegram } from "../lib/telegram";
import positionAge from "../lib/positionAge";

export async function manageCurrentPosition(lnm: any, signalRecommendation: string, bidAndOfferObj: any) {
  try {
    let pendingPositionDB: any = await searchPositionSupaBase(false, `${process.env.USERNAME}_${process.env.TRADING_VIEW_API_TIMEFRAME}_positions`);
    let pendingCashInPositionDB: any = await searchPositionSupaBase(false, `${process.env.USERNAME}_${process.env.TRADING_VIEW_API_TIMEFRAME}_cashin_positions`);
    let runningPositions = await lnm.futuresGetPositions({
      type: "running",
    });
    let openPositions = await lnm.futuresGetPositions({
      type: "open",
    });
    // Manage open position. We close if it's older than 24 hours and no running positions.
    if (runningPositions.length === 0 && openPositions.length >= 1) {
      openPositions.map(async (activeOpenPosition: any) => {
        let openPositionAge: number = positionAge(activeOpenPosition["creation_ts"], "how_many_hours");
        console.log(`Open position age: ${openPositionAge} Date: ${activeOpenPosition["creation_ts"]}`);
        if (openPositionAge >= Number(process.env.OPEN_POSITION_HOUR_WAITTIME)) {
          await lnm.futuresCancelPosition({
            pid: activeOpenPosition["pid"],
          });
          sendTelegram(`Open position expired as it's more than ${openPositionAge} hours. Closing position ${activeOpenPosition["pid"]}`);
        }
      });
    }
    // Manage running positions
    runningPositions.map((activeLNMarketPosition: any) => {
      // Main position
      pendingPositionDB.map(async (activeSupaBasePosition: any) => {
        await positionManagement(lnm, signalRecommendation, activeLNMarketPosition, activeSupaBasePosition, bidAndOfferObj, "positions");
      });
      // Cash in position
      pendingCashInPositionDB.map(async (activeSupaBasePosition: any) => {
        await positionManagement(lnm, signalRecommendation, activeLNMarketPosition, activeSupaBasePosition, bidAndOfferObj, "cashin_positions");
        // Manage in CASH-IN postion
        let currentProfitLoss: number = Number(activeLNMarketPosition["pl"]) < 0 ? Number(activeLNMarketPosition["pl"]) : Number(activeLNMarketPosition["pl"]);
        if (
          Number(activeLNMarketPosition["pl"]) <= -Number(activeSupaBasePosition["previous_pl"]) &&
          Number(activeLNMarketPosition["pl"]) < 0 &&
          Number(activeSupaBasePosition["previous_pl"]) !== 0 &&
          activeSupaBasePosition["pid"] === activeLNMarketPosition["pid"]
        ) {
          await lnm.futuresClosePosition({
            pid: activeLNMarketPosition["pid"],
          });
          await updatePositionSupaBase(
            activeSupaBasePosition["pid"],
            activeLNMarketPosition["pl"],
            "STOPLOSS_PREVIOUS_PROFIT_EXCEEDED",
            true,
            bidAndOfferObj["bid"],
            `${process.env.USERNAME}_${process.env.TRADING_VIEW_API_TIMEFRAME}_cashin_positions`
          );
          sendTelegram(`LNMarket: ${activeLNMarketPosition["pid"]} has been closed because we have exceed previous profit.`);
        }
      });
    });
  } catch (err) {
    console.log("ERROR: manageCurrentPosition", err);
  }
}

async function positionManagement(lnm: any, signalRecommendation: string, activeLNMarketPosition: any, activeSupaBasePosition: any, bidAndOfferObj: any, table: string) {
  try {
    let marketSignal: string = "";
    if (signalRecommendation === "STRONG_BUY") {
      if (process.env.ON_SIGNAL_BUY === "SELL") {
        marketSignal = "SELL";
      } else {
        marketSignal = "BUY";
      }
    } else if (signalRecommendation === "STRONG_SELL") {
      if (process.env.ON_SIGNAL_BUY === "SELL") {
        marketSignal = "BUY";
      } else {
        marketSignal = "SELL";
      }
    }

    if (activeLNMarketPosition["pid"] === activeSupaBasePosition["pid"]) {
      // Continue to take profit from cash in position
      if (activeLNMarketPosition["pl"] >= activeSupaBasePosition["previous_pl"] && table === "cashin_positions") {
        let messageTelegram: string = `Continue to Cash in profit. ${activeLNMarketPosition["pl"]} Sats`;
        let pl: number = activeLNMarketPosition["pl"] - 500;
        sendTelegram(messageTelegram);
        let orderData: any = await lnm.futuresCashinPosition({
          amount: pl,
          pid: activeLNMarketPosition["pid"],
        });
        await insertCashInPosition(orderData, activeSupaBasePosition, pl);
        await updatePositionSupaBase(activeSupaBasePosition["pid"], pl, "Cash-In-Profit", true, bidAndOfferObj["bid"], `${process.env.USERNAME}_${process.env.TRADING_VIEW_API_TIMEFRAME}_${table}`);
      }

      // LONG POSITION Management
      if (activeLNMarketPosition["side"] === "b") {
        // TAKE SOME PROFIT OF LONG POSITION
        if (bidAndOfferObj["bid"] >= activeSupaBasePosition["take_profit"] && table !== "cashin_positions") {
          let messageTelegram: string = `LONG - Cash in profit. ${activeLNMarketPosition["pl"]} Sats`;
          let pl: number = activeLNMarketPosition["pl"] - 500;
          sendTelegram(messageTelegram);
          let orderData: any = await lnm.futuresCashinPosition({
            amount: pl,
            pid: activeLNMarketPosition["pid"],
          });
          await insertCashInPosition(orderData, activeSupaBasePosition, pl);
          await updatePositionSupaBase(activeSupaBasePosition["pid"], pl, "Cash-In-Profit", true, bidAndOfferObj["bid"], `${process.env.USERNAME}_${process.env.TRADING_VIEW_API_TIMEFRAME}_${table}`);
        }
        // Close if signal goes against the orginal order
        else if (marketSignal === "SELL" && process.env.SELL_ON_SIGNAL_AGAINST === "true") {
          await lnm.futuresClosePosition({
            pid: activeLNMarketPosition["pid"],
          });
          await updatePositionSupaBase(activeSupaBasePosition["pid"], activeLNMarketPosition["pl"], "Against-ORGINAL-Signal", true, bidAndOfferObj["bid"], `${process.env.USERNAME}_${process.env.TRADING_VIEW_API_TIMEFRAME}_${table}`);
          sendTelegram(`LNMarket: ${activeLNMarketPosition["pid"]} has been closed because the signal is against the original order.`);
        }
      } else if (activeLNMarketPosition["side"] === "s") {
        // TAKE SOME PROFIT OF SHORT POSITION
        if (bidAndOfferObj["bid"] <= activeSupaBasePosition["take_profit"] && table !== "cashin_positions") {
          let messageTelegram: string = `SHORT - Cash in profit. ${activeLNMarketPosition["pl"]} Sats`;
          let pl: number = activeLNMarketPosition["pl"] - 500;
          sendTelegram(messageTelegram);
          let orderData: any = await lnm.futuresCashinPosition({
            amount: pl,
            pid: activeLNMarketPosition["pid"],
          });
          await insertCashInPosition(orderData, activeSupaBasePosition, pl);
          await updatePositionSupaBase(activeSupaBasePosition["pid"], pl, "Cash-In-Profit", true, bidAndOfferObj["bid"], `${process.env.USERNAME}_${process.env.TRADING_VIEW_API_TIMEFRAME}_${table}`);
        }
        // Close if signal goes against the orginal order
        else if (marketSignal === "BUY" && process.env.SELL_ON_SIGNAL_AGAINST === "true") {
          await lnm.futuresClosePosition({
            pid: activeLNMarketPosition["pid"],
          });
          await updatePositionSupaBase(activeSupaBasePosition["pid"], activeLNMarketPosition["pl"], "Against-ORGINAL-Signal", true, bidAndOfferObj["bid"], `${process.env.USERNAME}_${process.env.TRADING_VIEW_API_TIMEFRAME}_${table}`);
          sendTelegram(`LNMarket: ${activeLNMarketPosition["pid"]} has been closed because the signal is against the original order.`);
        }
      }
    }
  } catch (err) {
    console.log("ERROR: positionManagement", err);
  }
}
