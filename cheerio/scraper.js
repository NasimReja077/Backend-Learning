import axios from "axios";
import cheerio from "cheerio";

const url = "https://news.ycombinator.com/";

const scrapeNews = async () => {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);

  $(".titleline a").each((i, el) => {
    const title = $(el).text();
    const link = $(el).attr("href");

    console.log({ title, link });
  });
};

scrapeNews();



// import axios from "axios";
// import cheerio from "cheerio";

// const url = "https://example.com";

// const scrape = async () => {
//      try {
//          const response = await axios.get(url);

//     const $ = cheerio.load(response.data);

//     const title = $("h1").text();

//     console.log("Title:", title);
//      } catch (error) {
//           console.log(error.message);
//      }
// }

// scrape();