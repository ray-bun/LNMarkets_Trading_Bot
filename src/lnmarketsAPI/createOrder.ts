import "../lib/env";
/**
 * @Create position https://docs.lnmarkets.com/api/v1/#create
 */
function createOrder(lnm: any, type: string, side: string, price: number, margin: number, leverage: number, takeprofit: number, stoploss: number) {
  return new Promise(async (resolve, reject) => {
    try {
      if (process.env.ENABLE_TRADING === "true") {
        let createNewPosition = await lnm.futuresNewPosition({
          type,
          side,
          price,
          margin,
          leverage,
          stoploss,
        });
        resolve(createNewPosition);
      } else {
        reject("Rejected createOrder.ts (createOrder). Trading disabled");
      }
    } catch (err) {
      console.log(`Rejected createOrder.ts (createOrder) Error: ${err}`);
      reject(`Rejected createOrder.ts (createOrder) Error: ${err}`);
    }
  });
}

export default createOrder;
