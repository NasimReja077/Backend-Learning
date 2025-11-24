import https from "https";
import readline from "readline";
import chalk from "chalk";

const rl = readline.createInterface({
     input: process.stdin,
     output: process.stdout
})

const API_KEY = "b1651d1d4b1b17dd955fe4ae";
const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`;

https.get(url, (res) => {
     let data = "";

     res.on("data", (chalk) => {
          data += chalk;
     });

     res.on("end", () =>{
          const rates = JSON.parse(data).conversion_rates;

     })

})