/**
 * @Create position https://docs.lnmarkets.com/api/v1/#create
 */
function numberOfOpenRunningPositions(lnm: any) {
  return new Promise(async (resolve, reject) => {
    try {
      let runningPositions = await lnm.futuresGetPositions({
        type: "running",
      });
      let openPositions = await lnm.futuresGetPositions({
        type: "open",
      });
      let closedPositions = await lnm.futuresGetPositions({
        type: "closed",
      });
      let numberOfOpenRunningPositions: any = { running: Number(Object.entries(runningPositions).length), open: Number(Object.entries(openPositions).length), closed: Number(Object.entries(closedPositions).length) };
      resolve(numberOfOpenRunningPositions);
    } catch (err) {
      reject(err);
    }
  });
}

export default numberOfOpenRunningPositions;
