import { createClient } from "@supabase/supabase-js";
import "../lib/env";
import { sendTelegram } from "./telegram";

let supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

type orderDatatype = {
  id: number;
  pid: string;
  side: string;
  type: string;
  price: number;
  take_profit: number;
  take_profit_target_one: number;
  stoploss_price: number;
  stoploss_target_one: number;
  pl: number;
  position_status: string;
  positionLabel: string;
};

export async function insertPositionSupaBase(orderDataUnSorted: any, sizeCalculation: any, positionNumber: number, randomText: string) {
  let orderData = orderDataUnSorted["position"];
  let orderDataInsert: orderDatatype = {
    id: orderData["id"],
    pid: orderData["pid"],
    side: orderData["side"],
    type: orderData["type"],
    price: orderData["price"],
    take_profit: sizeCalculation["takeProfitTargetFinal"][positionNumber],
    take_profit_target_one: sizeCalculation["takeProfitFirst"][positionNumber],
    stoploss_price: sizeCalculation["stopLoss"][positionNumber],
    stoploss_target_one: sizeCalculation["stopLossFirst"][positionNumber],
    pl: orderData["pl"],
    position_status: orderData["margin_wi"] === null ? "open" : "running",
    positionLabel: `${positionNumber}_${randomText}`,
  };
  return new Promise(async (resolve, reject) => {
    try {
      const { error } = await supabase.from(`${process.env.USERNAME}_${process.env.TRADING_VIEW_API_TIMEFRAME}_positions`).insert([orderDataInsert]);
      sendTelegram(
        `${sizeCalculation["buyOrSell"]}_${positionNumber} @ ${orderData["price"]} Candle: ${sizeCalculation["candle"]} StopLoss: ${sizeCalculation["stopLoss"][positionNumber]} Profit_#1: ${sizeCalculation["takeProfitFirst"][positionNumber]} TakeProfit_#2: ${sizeCalculation["takeProfitTargetFinal"][positionNumber]}`
      );
      if (error) {
        console.log("Error @ positions", error);
        reject(error);
      } else resolve(true);
    } catch (err) {
      reject(`Rejected supabase.ts (insertPositionSupaBase) Error: ${err}`);
    }
  });
}

type cashInDataType = {
  id: number;
  pid: string;
  pid_parent: string;
  side: string;
  type: string;
  price: number;
  take_profit: number;
  stoploss_price: number;
  previous_pl: number;
  position_status: string;
};

export async function insertCashInPosition(orderData: any, activeSupaBasePosition: any, pl: number) {
  let orderDataInsert: cashInDataType = {
    id: orderData["id"],
    pid: orderData["pid"],
    pid_parent: orderData["parent"],
    side: orderData["side"],
    type: orderData["type"],
    price: orderData["price"],
    take_profit: activeSupaBasePosition["take_profit"],
    stoploss_price: activeSupaBasePosition[`${process.env.MOVE_STOPLOSS_ON_WIN === "true" ? "price" : "stoploss_target_one"}`],
    previous_pl: pl,
    position_status: orderData["margin_wi"],
  };
  return new Promise(async (resolve, reject) => {
    try {
      const { error } = await supabase.from(`${process.env.USERNAME}_${process.env.TRADING_VIEW_API_TIMEFRAME}_cashin_positions`).insert([orderDataInsert]);
      sendTelegram(`Take profit executed`);
      if (error) {
        console.log("Error @ positions", error);
        reject(error);
      } else resolve(true);
    } catch (err) {
      reject(`Rejected supabase.ts (insertPositionSupaBase) Error: ${err}`);
    }
  });
}

/*
Position_status: running, closed
*/
export async function updatePositionSupaBase(pid: string, pl: number, position_status: string, trade_completed: boolean, exit_price: number, table: string) {
  return new Promise<void>(async (resolve, reject) => {
    try {
      let win = pl <= 0 ? false : true;
      const { error } = await supabase.from(table).update({ position_status, trade_completed, pl, win, exit_price }).eq("pid", pid);
      if (error) {
        reject(`Rejected supabase.ts (updatePositionSupaBase in IF clause) Error: ${error}`);
      } else {
        resolve();
      }
    } catch (err) {
      reject(`Rejected supabase.ts (updatePositionSupaBase) Error: ${err}`);
    }
  });
}
/*
Position_status: running, closed
*/
export async function searchPositionSupaBase(trade_completed: boolean, table: string) {
  return new Promise(async (resolve, reject) => {
    try {
      let { data, error } = await supabase.from(table).select("*").eq("trade_completed", trade_completed);
      if (error) {
        reject(`Rejected supabase.ts (searchPositionSupaBase) Error: ${error}`);
      } else {
        resolve(data);
      }
    } catch (err) {
      reject(`Rejected supabase.ts (searchPositionSupaBase) Error: ${err}`);
    }
  });
}
