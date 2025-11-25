import https from "https";
import readline from "readline";
import chalk from "chalk";
import { inflateRaw } from "zlib";

const rl = readline.createInterface({
     input: process.stdin,
     output: process.stdout
})

const API_KEY = "b1651d1d4b1b17dd955fe4ae";
const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`;

const convertCurrencyAmount = (amount, rate) => {
     return (parseFloat(amount) * rate).toFixed(2);
}

https.get(BASE_URL, (res) => {
     let data = "";

     res.on("data", (chunk) => {
          data += chunk;
     });

     res.on("end", () => {
          const rates = JSON.parse(data).conversion_rates;

          // amount = 100
          // targetCurrency = inr 
          // 90usd = how much inr
          // 1usd = 84.955 inr
          // 90usd = ? 
          // 90 * 84.955 = ?

          rl.question('Enter the amount in USD: ', (amount) => {
               rl.question('Enter the target currency (e.g., EUR, GBP, JPY): ', (targetCurrency) => {
                    const rate = rates[targetCurrency.toUpperCase()];
                    if (rate) {
                         console.log(`${amount} USD is approximately ${convertCurrencyAmount(amount, rate)} ${targetCurrency.toUpperCase()}`);
                    } else {
                         console.log(`Invalid currency code: ${targetCurrency}`);
                    }
                    rl.close();
               })
          })
     })
})