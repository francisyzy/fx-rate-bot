import https from "https";
import { format, subDays } from "date-fns";

async function getJson(url: string, backup?: string) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          if (res.statusCode !== 200) {
            console.log(`HTTP error! status: ${res.statusCode}`);
            reject(
              new Error(`HTTP error! status: ${res.statusCode}`),
            );
          } else {
            resolve(JSON.parse(data));
          }
        });
      })
      .on("error", (error) => {
        console.error(error);
        if (backup) {
          getJson(backup).then(resolve).catch(reject);
        } else {
          reject(error);
        }
      });
  });
}

export async function getUnion(): Promise<any> {
  const formattedDate = format(new Date(), "yyyyMMdd");
  const formattedYesterday = format(
    subDays(new Date(), 1),
    "yyyyMMdd",
  );

  return await getJson(
    `https://www.unionpayintl.com/upload/jfimg/${formattedDate}.json`,
    `https://www.unionpayintl.com/upload/jfimg/${formattedYesterday}.json`,
  ).catch((error) => console.error(error));
}
export async function getMaster(): Promise<any> {
  return await getJson(
    "https://www.mastercard.us/settlement/currencyrate/conversion-rate?fxDate=0000-00-00&transCurr=KRW&crdhldBillCurr=SGD&bankFee=0&transAmt=1000",
  );
}
export async function getVisa() {
  //Neeed to pull the cookies first
  const formattedDate = format(new Date(), "MM/dd/yyyy");
  const formattedYesterday = format(
    subDays(new Date(), 1),
    "yyyyMMdd",
  );

  return await getJson(
    `https://www.visa.com.sg/cmsapi/fx/rates?amount=1000&fee=0&utcConvertedDate=${formattedDate}&exchangedate=${formattedDate}&fromCurr=SGD&toCurr=KRW`,
    `https://www.visa.com.sg/cmsapi/fx/rates?amount=1000&fee=0&utcConvertedDate=${formattedYesterday}&exchangedate=${formattedYesterday}&fromCurr=SGD&toCurr=KRW`,
  );
}
