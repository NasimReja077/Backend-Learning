import readline from 'readline/promises';

// OpenWeatherMap API Details
const API_KEY = '27cfc8d0c4b8df5f08069ec450b5cff7';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

const rl = readline.createInterface({
     input : process.stdin,
     output : process.stdout
})

const getWeatherData = async(city) =>{
     const url = `${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`;
     try {
          const response = await fetch(url);
          if(!response.ok){
               throw new Error(`City not found: ${city}`);
          }
          const getWeatherData = await response.json();
          console.log(getWeatherData);

          console.log(`Weather in ${getWeatherData.name}:`);
          console.log(`Country: ${getWeatherData.sys.country}`);
          console.log('city:', getWeatherData.name);
          console.log(`Temperature: ${getWeatherData.main.temp}°C`);
          console.log(`Humidity: ${getWeatherData.main.humidity}%`);
          console.log(`Conditions: ${getWeatherData.weather[0].description}`);
     } catch (error) {
          console.log("Error fetching weather data:", error);
     }
};

const city = await rl.question("Enter the city name to get weather data: ");
await getWeatherData(city);
rl.close();

