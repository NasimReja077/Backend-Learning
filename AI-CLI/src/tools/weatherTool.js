// src/tools/weatherTool.js
import axios from 'axios';
import inquirer from 'inquirer';
import chalk from 'chalk';
import boxen from 'boxen';
import ora from 'ora';
import Table from 'cli-table3';
import { settings } from '../config/settings.js';

const WEATHER_ICONS = {
  'clear sky': '☀️',
  'few clouds': '🌤️',
  'scattered clouds': '⛅',
  'broken clouds': '☁️',
  'overcast clouds': '☁️',
  'light rain': '🌦️',
  'moderate rain': '🌧️',
  'heavy intensity rain': '⛈️',
  'thunderstorm': '⛈️',
  'snow': '❄️',
  'mist': '🌫️',
  'fog': '🌫️',
  'haze': '🌫️',
};

function weatherIcon(description) {
  const key = Object.keys(WEATHER_ICONS).find(k => description.toLowerCase().includes(k));
  return WEATHER_ICONS[key] || '🌡️';
}

export const weatherTool = {
  async run() {
    const apiKey = settings.getWeatherKey();
    if (!apiKey) {
      console.log(boxen(
        chalk.yellow('⚠️  Weather API key not set.\n') +
        chalk.gray('Go to ⚙️  Settings → Set Weather API Key\n') +
        chalk.gray('Get a free key at: ') + chalk.cyan('https://openweathermap.org/api'),
        { padding: 1, borderColor: 'yellow' }
      ));
      return;
    }

    console.log(boxen(chalk.bold.hex('#ffff00')('  🌤️   Weather Tool  '), {
      padding: 1, borderColor: 'yellow', margin: { top: 1, bottom: 1 }
    }));

    const { city } = await inquirer.prompt([{
      name: 'city',
      message: 'Enter city name:',
      validate: v => v.trim().length > 0 || 'City name required'
    }]);

    const { type } = await inquirer.prompt([{
      type: 'list',
      name: 'type',
      message: 'What would you like?',
      choices: [
        { name: '🌡️  Current Weather', value: 'current' },
        { name: '📅  5-Day Forecast', value: 'forecast' },
      ]
    }]);

    const spinner = ora(`Fetching weather for ${city}...`).start();

    try {
      if (type === 'current') {
        const res = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
        );
        spinner.stop();
        displayCurrent(res.data);
      } else {
        const res = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
        );
        spinner.stop();
        displayForecast(res.data);
      }
    } catch (err) {
      spinner.fail(chalk.red(
        err.response?.status === 404 ? `City "${city}" not found.` : 'Weather API error: ' + err.message
      ));
    }
  }
};

function displayCurrent(data) {
  const icon = weatherIcon(data.weather[0].description);
  const windDir = degreesToCompass(data.wind.deg);

  console.log('\n' + boxen(
    chalk.bold.white(`${icon}  ${data.name}, ${data.sys.country}\n`) +
    chalk.gray('─'.repeat(36)) + '\n' +
    chalk.cyan('Temperature : ') + chalk.yellow(`${data.main.temp}°C`) +
    chalk.gray(` (feels like ${data.main.feels_like}°C)`) + '\n' +
    chalk.cyan('Condition   : ') + chalk.white(data.weather[0].description) + '\n' +
    chalk.cyan('Humidity    : ') + chalk.white(`${data.main.humidity}%`) + '\n' +
    chalk.cyan('Wind        : ') + chalk.white(`${data.wind.speed} m/s ${windDir}`) + '\n' +
    chalk.cyan('Visibility  : ') + chalk.white(`${(data.visibility / 1000).toFixed(1)} km`) + '\n' +
    chalk.cyan('Pressure    : ') + chalk.white(`${data.main.pressure} hPa`) + '\n' +
    chalk.gray(`\nUpdated: ${new Date(data.dt * 1000).toLocaleTimeString()}`),
    { padding: 1, borderColor: 'cyan', title: '🌍 Current Weather', titleAlignment: 'center' }
  ));
}

function displayForecast(data) {
  console.log('\n' + chalk.bold.cyan(`📅 5-Day Forecast: ${data.city.name}, ${data.city.country}\n`));

  const table = new Table({
    head: [
      chalk.cyan('Date & Time'),
      chalk.cyan('Icon'),
      chalk.cyan('Condition'),
      chalk.cyan('Temp °C'),
      chalk.cyan('Humidity'),
      chalk.cyan('Wind m/s'),
    ],
    colWidths: [22, 6, 22, 10, 10, 10],
    style: { border: ['cyan'] }
  });

  // Show 8 entries (1 per 3 hours = ~24h coverage) then every 3rd for forecast
  data.list.slice(0, 16).forEach(item => {
    const date = new Date(item.dt * 1000);
    const icon = weatherIcon(item.weather[0].description);
    table.push([
      date.toLocaleString('en-GB', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      icon,
      item.weather[0].description,
      `${item.main.temp.toFixed(1)}°`,
      `${item.main.humidity}%`,
      `${item.wind.speed}`,
    ]);
  });

  console.log(table.toString() + '\n');
}

function degreesToCompass(deg) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}