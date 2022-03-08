function positionAge(positionDate: Date, timeFrame: string) {
  let positionDateConvert: any = new Date(positionDate);
  let date = new Date();
  let todayDateInUTC: any = date.toISOString();
  let todayDateInUTCConvert: any = new Date(todayDateInUTC);
  let howManyHoursOrDays: number = 0;
  switch (timeFrame) {
    case "how_many_hours":
      howManyHoursOrDays = Math.ceil(Math.abs(todayDateInUTCConvert - positionDateConvert) / 36e5);
      break;
    case "how_many_days":
      // let diff = Math.floor(today - positionDateConvert.getTime());
      // let day = 1000 * 60 * 60 * 24;
      // howManyHoursOrDays = Math.floor(diff / day);
      break;
    default:
      break;
  }
  return howManyHoursOrDays;
}

export default positionAge;
