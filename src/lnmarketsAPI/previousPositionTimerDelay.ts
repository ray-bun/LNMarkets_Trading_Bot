import positionAge from "../lib/positionAge";

async function previousPositionTimerDelay(lnm: any, signalRecommendation: string) {
  let closedPositions = await lnm.futuresGetPositions({
    type: "closed",
  });
  if (closedPositions.length >= 5) {
    let lastClosedItems = [];
    for (let i = 0; i < 5; i++) {
      lastClosedItems.push(closedPositions[i]["closed_ts"]);
      if (i === 4) {
        let lastOrderTime = Math.max(...lastClosedItems);
        for (let i = 0; i < lastClosedItems.length; i++) {
          if (closedPositions[i]["closed_ts"] === lastOrderTime) {
            let lastPositionTimer = positionAge(closedPositions[i]["closed_ts"], "how_many_hours");
            console.log("Last closed Position Hour: " + lastPositionTimer);
            if (process.env.NO_SAME_SIDE_IF_LOSS === "true" && lastPositionTimer >= Number(process.env.SAME_SIDE_WAITTIME) && closedPositions[i]["pl"] < 0) {
              console.log("More than 24 hours since last closed a losing position. Lets buy/sell something.");
              return true;
            } else if (process.env.NO_SAME_SIDE_IF_LOSS === "true" && lastPositionTimer < Number(process.env.SAME_SIDE_WAITTIME) && closedPositions[i]["pl"] < 0) {
              console.log("Less than 24 hours since last closed a losing position. Not buying");
              return false;
            } else if (signalRecommendation === "BUY" && closedPositions[i]["side"] === "b" && closedPositions[i]["pl"] < 0 && process.env.NO_SAME_SIDE_IF_LOSS === "true") {
              //previous stop loss postion was a buy and it was a loss
              console.log("Previous stop loss postion was a buy and it was a loss. Ignoring signal to buy.");
              return false;
            } else if (signalRecommendation === "SELL" && closedPositions[i]["side"] === "s" && closedPositions[i]["pl"] < 0 && process.env.NO_SAME_SIDE_IF_LOSS === "true") {
              //previous stop loss postion was a sell and it was a loss
              console.log("Previous stop loss postion was a sell and it was a loss. Ignoring signal to buy.");
              return false;
            } else if (lastPositionTimer >= Number(process.env.STOPLOSS_HOUR_WAITTIME) && closedPositions[i]["stoploss_wi"] === "filled") {
              // Last stop loss is more than certain hours, we allow it to trade again
              return true;
            } else if (closedPositions[i]["canceled"]) {
              // if last position was canceled due to expiry, we allow it to trade again
              return true;
            } else if (closedPositions[i]["closed"] && closedPositions[i]["pl"] > 1 && lastPositionTimer >= Number(process.env.DELAY_TRADE_AFTER_WIN)) {
              // Winning position delay
              return true;
            } else {
              console.log("BUY/SELL criteria not met in previousPositionTimerDelay.");
              return false;
            }
          } else if (closedPositions.length === 0) {
            return true;
          } else {
            false;
          }
        }
      }
    }
  } else {
    return true;
  }
}

export default previousPositionTimerDelay;
