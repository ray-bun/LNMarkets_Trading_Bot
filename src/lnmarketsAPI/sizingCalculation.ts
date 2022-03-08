import "../lib/env";
import alphavantageAPI from "../alphavantageAPI/alphavantageAPI";
/**
 * Calculate position sizing, example we only want to risk 2% of total balance amount
 */

type sizingCalculationType = {
  buyOrSell: string;
  candle: string;
  balance: number;
  riskSatsAmount: number;
  riskDollarAmount: number;
  satsPerDollar: number;
  walletDollarBalance: number;
  atrValue: any;
  atrRiskTarget: number;
  atrProfitTarget: number;
  atrPercentageStopLoss: number;
  positionSizeInSat: number;
  bitcoinPrice: number;
  buyOrSellPrice: number[];
  stopLoss: number[];
  stopLossFirst: number[];
  takeProfitFirst: number[];
  takeProfitTargetFinal: number[];
};

function sizingCalculation(lnm: any, buyOrSell: string, bidAndOfferObj: any) {
  return new Promise(async (resolve, reject) => {
    try {
      const getUserInfo = await lnm.getUser();
      let bitcoinPrice: number = 0;
      if (buyOrSell === "BUY") {
        bitcoinPrice = bidAndOfferObj["offer"];
      } else if (buyOrSell === "SELL") {
        bitcoinPrice = bidAndOfferObj["bid"];
      }

      if (Object.entries(getUserInfo).length > 1 && getUserInfo.constructor === Object) {
        let balance: number = getUserInfo["balance"];
        let riskSatsAmount: number = (balance * Number(process.env.RISK_PERCENTAGE)) | 0;
        let riskDollarAmount: number = (bitcoinPrice / 100000000) * riskSatsAmount;
        let satsPerDollar: number = (100000000 / bitcoinPrice) | 0; // 0 remove the double digit
        let walletDollarBalance = (balance / satsPerDollar) | 0;
        let atrValue: any = await alphavantageAPI("ATR", "BTCUSD", process.env.ALPHAVANTAGE_ATR_TIMEFRAME, Number(process.env.ALPHAVANTAGE_ATR_NUMBER_OF_CANDLES));
        //We use ATRRisk amount to put in our stop
        let atrRiskTarget: number = Number(atrValue["ATR"] * Number(process.env.ATR_RISK)) | 0;
        let atrProfitTarget: number = Number(atrValue["ATR"] * Number(process.env.ATR_PROFIT)) | 0;

        let buyOrSellPrice: number[] = [];

        let stopLoss: number[] = [],
          stopLossFirst: number[] = [];
        let takeProfitFirst: number[] = [],
          takeProfitTargetFinal: number[] = [];

        let atrValueBuySellTarget: number = (Number(atrValue["ATR"]) / Number(process.env.MAX_NO_POSITION)) | 0;
        console.log("atrValueBuySellTarget", atrValueBuySellTarget);

        if (buyOrSell === "BUY") {
          //Set multiple buy order rings prices
          for (let i = 0; i < Number(process.env.MAX_NO_POSITION); i++) {
            if (i === 0) {
              buyOrSellPrice[i] = bitcoinPrice - atrValueBuySellTarget;
              stopLoss[i] = buyOrSellPrice[i] - atrRiskTarget;
              stopLossFirst[i] = buyOrSellPrice[i] - atrRiskTarget / 2;
              takeProfitFirst[i] = buyOrSellPrice[i] + atrProfitTarget / 2;
              takeProfitTargetFinal[i] = buyOrSellPrice[i] + atrProfitTarget;
            } else {
              buyOrSellPrice[i] = buyOrSellPrice[i - 1] - atrValueBuySellTarget;
              stopLoss[i] = buyOrSellPrice[i] - atrRiskTarget;
              stopLossFirst[i] = buyOrSellPrice[i] - atrRiskTarget / 2;
              takeProfitFirst[i] = buyOrSellPrice[i] + atrProfitTarget / 2;
              takeProfitTargetFinal[i] = buyOrSellPrice[i] + atrProfitTarget;
            }
          }
        } else if (buyOrSell === "SELL") {
          for (let i = 0; i < Number(process.env.MAX_NO_POSITION); i++) {
            if (i === 0) {
              buyOrSellPrice[i] = bitcoinPrice + atrValueBuySellTarget;
              stopLoss[i] = buyOrSellPrice[i] + atrRiskTarget;
              stopLossFirst[i] = buyOrSellPrice[i] + atrRiskTarget / 2;
              takeProfitFirst[i] = buyOrSellPrice[i] - atrProfitTarget / 2;
              takeProfitTargetFinal[i] = buyOrSellPrice[i] - atrProfitTarget;
            } else {
              buyOrSellPrice[i] = buyOrSellPrice[i - 1] + atrValueBuySellTarget;
              stopLoss[i] = buyOrSellPrice[i] + atrRiskTarget;
              stopLossFirst[i] = buyOrSellPrice[i] + atrRiskTarget / 2;
              takeProfitFirst[i] = buyOrSellPrice[i] - atrProfitTarget / 2;
              takeProfitTargetFinal[i] = buyOrSellPrice[i] - atrProfitTarget;
            }
          }
        }

        /* Position Size = (Wallet Balance * Risk%) / (%Stop Loss * Leverage)
         * Difference of 100 and 90 = |100 - 90|/((100 + 90)/2) = 10/95 = 0.10526315789474 = 10.526315789474% https://www.calculator.net/percent-calculator.html?c3par1=100&c3par2=90&ctype=3&x=55&y=20#pctdifference
         * https://www.youtube.com/watch?v=BZYusmbiHLo on how to calculare position size
         */
        let bitcoinPriceStopPrice = bitcoinPrice - atrRiskTarget;
        let atrPercentageStopLoss: number = (bitcoinPrice - bitcoinPriceStopPrice) / ((bitcoinPrice + bitcoinPriceStopPrice) / 2);
        // Adjusting by 10000 sats to make sure we don't get invalid valid
        let positionSizeInSat: number = ((balance * Number(process.env.RISK_PERCENTAGE)) / (atrPercentageStopLoss * Number(process.env.LEVERAGE_SIZE)) - 10000) | 0;
        let sizingResponse: sizingCalculationType = {
          buyOrSell,
          candle: process.env.ALPHAVANTAGE_ATR_TIMEFRAME,
          balance,
          riskSatsAmount,
          riskDollarAmount,
          satsPerDollar,
          walletDollarBalance,
          atrValue: atrValue["ATR"] | 0,
          atrRiskTarget,
          atrProfitTarget,
          atrPercentageStopLoss,
          positionSizeInSat,
          bitcoinPrice,
          buyOrSellPrice,
          stopLoss,
          stopLossFirst,
          takeProfitFirst,
          takeProfitTargetFinal,
        };
        console.log("sizingResponse", sizingResponse);
        resolve(sizingResponse);
      }
    } catch (err) {
      reject(`Rejected sizingCalculation.ts (sizingCalculation) Error: ${err}`);
    }
  });
}

export default sizingCalculation;
