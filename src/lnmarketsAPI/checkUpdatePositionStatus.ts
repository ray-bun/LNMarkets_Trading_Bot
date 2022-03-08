import { updatePositionSupaBase, searchPositionSupaBase } from "../lib/supabase";
import { sendTelegram } from "../lib/telegram";

export function checkUpdatePositionStatus(lnm: any) {
  return new Promise<void>(async (resolve, reject) => {
    try {
      let pendingPositions: any = await searchPositionSupaBase(false, `${process.env.USERNAME}_${process.env.TRADING_VIEW_API_TIMEFRAME}_positions`);
      let cashInPositions: any = await searchPositionSupaBase(false, `${process.env.USERNAME}_${process.env.TRADING_VIEW_API_TIMEFRAME}_cashin_positions`);
      let closedPositions = await lnm.futuresGetPositions({
        type: "closed",
      });
      closedPositions.forEach((ClosedPosition: string) => {
        //search throught exisitng pid to see if it's a match, if match we update.
        pendingPositions.forEach(async (pendingPosition: string) => {
          if (ClosedPosition["pid"] === pendingPosition["pid"]) {
            if (ClosedPosition["stoploss_wi"] === "filled") {
              await updatePositionSupaBase(ClosedPosition["pid"], ClosedPosition["pl"], ClosedPosition["margin_wi"] + "_STOPLOSS", true, ClosedPosition["exit_price"], `${process.env.USERNAME}_${process.env.TRADING_VIEW_API_TIMEFRAME}_positions`);
              sendTelegram(`Position closed @ ${ClosedPosition["exit_price"]} Profit: ${ClosedPosition["pl"]} Reason: Stoploss`);
            } else {
              await updatePositionSupaBase(ClosedPosition["pid"], ClosedPosition["pl"], ClosedPosition["margin_wi"], true, ClosedPosition["exit_price"], `${process.env.USERNAME}_${process.env.TRADING_VIEW_API_TIMEFRAME}_positions`);
              sendTelegram(`Position closed @ ${ClosedPosition["exit_price"]} Profit: ${ClosedPosition["pl"]} Reason: ${ClosedPosition["margin_wi"]}`);
            }
            if (ClosedPosition["canceled"] === true) {
              await updatePositionSupaBase(ClosedPosition["pid"], ClosedPosition["pl"], "Canceled_Position", true, ClosedPosition["exit_price"], `${process.env.USERNAME}_${process.env.TRADING_VIEW_API_TIMEFRAME}_positions`);
              sendTelegram(`Position cancelled Reason: Time expired`);
            }
          }
        });
        //search throught cash-in exisitng pid to see if it's a match, if match we update.
        cashInPositions.forEach(async (pendingPosition: string) => {
          if (ClosedPosition["pid"] === pendingPosition["pid"]) {
            if (ClosedPosition["stoploss_wi"] === "filled") {
              await updatePositionSupaBase(
                ClosedPosition["pid"],
                ClosedPosition["pl"],
                ClosedPosition["margin_wi"] + "_STOPLOSS",
                true,
                ClosedPosition["exit_price"],
                `${process.env.USERNAME}_${process.env.TRADING_VIEW_API_TIMEFRAME}_cashin_positions`
              );
              sendTelegram(`Cash-In Position closed @ ${ClosedPosition["exit_price"]} Profit: ${ClosedPosition["pl"]} Reason: Stoploss`);
            } else {
              await updatePositionSupaBase(
                ClosedPosition["pid"],
                ClosedPosition["pl"],
                ClosedPosition["margin_wi"] + "_TAKEPROFIT",
                true,
                ClosedPosition["exit_price"],
                `${process.env.USERNAME}_${process.env.TRADING_VIEW_API_TIMEFRAME}_cashin_positions`
              );
              sendTelegram(`Cash-In Position closed @ ${ClosedPosition["exit_price"]} Profit: ${ClosedPosition["pl"]} Reason: ${ClosedPosition["margin_wi"]}`);
            }
          }
        });
      });
      resolve();
    } catch (err) {
      reject(`Rejected checkUpdatePositionStatus.ts. Error: ${err}`);
    }
  });
}
