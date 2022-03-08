/**
 * @Create position https://docs.lnmarkets.com/api/v1/#create
 */
function accountBalance(lnm: any) {
  return new Promise(async (resolve, reject) => {
    try {
      let closedPositions = await lnm.futuresGetPositions({ type: "closed" });
      let depositHistory = await lnm.depositHistory({
        limit: 10,
      });
      let totalClosedProfit = 0;
      let totalClosedLoss = 0;
      let totalAmountDeposited = 0;
      depositHistory.map((depositHist: any) => {
        if (depositHist["success"]) {
          totalAmountDeposited += depositHist["amount"];
        }
      });
      closedPositions.map((closedPosition: any) => {
        if (closedPosition["pl"] < 0) {
          totalClosedLoss += closedPosition["pl"];
        } else {
          totalClosedProfit += closedPosition["pl"];
        }
      });
      let profit: number = totalClosedProfit + totalClosedLoss;
      let balance: number = totalAmountDeposited + profit;
      resolve({ totalAmountDeposited, totalClosedProfit, totalClosedLoss, profit, balance });
    } catch (err) {
      reject(`Rejected accountBalance.ts. Error: ${err}`);
    }
  });
}

export default accountBalance;
