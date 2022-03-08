let utcTime = new Date(new Date().toUTCString());

function tradeTimer(): string {
  let hour: number = utcTime.getUTCHours();
  let minute: number = utcTime.getUTCMinutes();
  // An hour break before we rebuy into the market
  if ((hour === 7 && minute >= 50) || (hour === 8 && minute <= 30)) {
    return "EXPIRED";
  } else {
    return "VALID";
  }
}
export default tradeTimer;
