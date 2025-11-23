import https from "https";
import chalk from "chalk";

const getJoke = () => {
     const url = 'https://official-joke-api.appspot.com/random_joke';

     https.get(url, (res)=> {
          let data = "";
          res.on('data', (chunk) => {
               data += chunk;
          });

          res.on('end', ()=>{
               const joke = JSON.parse(data);
               console.log(joke);
               console.log(`O Boy! Here's a random ${joke.type} joke for you:`);
               console.log(chalk.bgRedBright(`${joke.setup}`));
               console.log(chalk.blue.bgRed.bold(`${joke.punchline}`));

          });

          res.on('error', (err) =>{
               console.log(`Error Feaching the joke: ${err.message}`);
          });
     })
}

getJoke();