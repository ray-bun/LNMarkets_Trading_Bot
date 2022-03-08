import axios from "axios";

/**
 * See doco for reference:
 * https://docs.lnmarkets.com/api/v1/#futures-bid-and-offer-history
 */

function bidAndOfferHistory(lnm: any) {
  return new Promise(async (resolve, reject) => {
    try {
      const latestBidOffer = await lnm.futuresBidOfferHistory({
        limit: 20,
      });
      let obj: any = latestBidOffer[0];
      if (Object.entries(obj).length > 1 && obj.constructor === Object) {
        let bid: number = obj["bid"];
        let offer: number = obj["offer"];
        resolve({ bid, offer });
      } else {
        reject();
      }
    } catch (err) {
      reject(`Rejected bidAndOfferHistory.ts (bidAndOfferHistory) Error: ${err}`);
    }
  });
}
//bidAndOfferHistory();

export default bidAndOfferHistory;
