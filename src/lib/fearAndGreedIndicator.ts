import axios from "axios";
/**
 * See doco for reference:
 * https://alternative.me/crypto/fear-and-greed-index/
 */

function fearAndGreedIndicator() {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.get(`https://api.alternative.me/fng/`, {
        headers: { "User-Agent": "request" },
      });
      let obj: any = response.data;
      if (Object.entries(obj).length > 1 && obj.constructor === Object) {
        let valueClassification: string = obj["data"][0]["value_classification"];
        console.log(valueClassification);
      } else {
        reject();
      }
    } catch (err) {
      reject(err);
    }
  });
}
export default fearAndGreedIndicator;
fearAndGreedIndicator();
