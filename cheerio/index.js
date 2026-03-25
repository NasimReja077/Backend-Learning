import axios from "axios";
import cheerio from "cheerio";

const url = "https://example.com";

const scrape = async () => {
     const response = await axios.get(url);
     const $ = cheerio.load(response.data);
     const title = $("h1").text();
     console.log(title);
}
scrape();
