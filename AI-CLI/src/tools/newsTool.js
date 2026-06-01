// src/tools/newsTool.js
import axios from 'axios';
import inquirer from 'inquirer';
import chalk from 'chalk';
import boxen from 'boxen';
import ora from 'ora';
import open from 'open';
import { settings } from '../config/settings.js';
import { mistralService } from '../services/mistralService.js';

const CATEGORIES = ['general', 'business', 'entertainment', 'health', 'science', 'sports', 'technology'];

export const newsTool = {
  async run() {
    const apiKey = settings.getNewsKey();
    if (!apiKey) {
      console.log(boxen(
        chalk.yellow('⚠️  News API key not set.\n') +
        chalk.gray('Go to ⚙️  Settings → Set News API Key\n') +
        chalk.gray('Get a free key at: ') + chalk.cyan('https://newsapi.org'),
        { padding: 1, borderColor: 'yellow' }
      ));
      return;
    }

    console.log(boxen(chalk.bold.hex('#ff8800')('  📰  News Tool  '), {
      padding: 1, borderColor: 'yellow', margin: { top: 1, bottom: 1 }
    }));

    const { mode } = await inquirer.prompt([{
      type: 'list',
      name: 'mode',
      message: 'Choose news mode:',
      choices: [
        { name: '🔝  Top Headlines', value: 'headlines' },
        { name: '🔍  Search News', value: 'search' },
        { name: '📂  Browse by Category', value: 'category' },
      ]
    }]);

    let articles = [];

    if (mode === 'headlines') {
      articles = await fetchNews(apiKey, { endpoint: 'top-headlines', params: { country: 'us', pageSize: 10 } });
    }

    if (mode === 'search') {
      const { query } = await inquirer.prompt([{
        name: 'query',
        message: 'Search for:',
        validate: v => v.trim().length > 0 || 'Enter a search term'
      }]);
      articles = await fetchNews(apiKey, { endpoint: 'everything', params: { q: query, pageSize: 10, sortBy: 'relevancy' } });
    }

    if (mode === 'category') {
      const { cat } = await inquirer.prompt([{
        type: 'list', name: 'cat',
        message: 'Choose category:',
        choices: CATEGORIES.map(c => ({ name: c.charAt(0).toUpperCase() + c.slice(1), value: c }))
      }]);
      articles = await fetchNews(apiKey, { endpoint: 'top-headlines', params: { country: 'us', category: cat, pageSize: 10 } });
    }

    if (!articles.length) return;

    displayArticles(articles);

    const { action } = await inquirer.prompt([{
      type: 'list',
      name: 'action',
      message: 'What next?',
      choices: [
        { name: '🤖  Summarize all with AI', value: 'summarize' },
        { name: '🔗  Open an article in browser', value: 'open' },
        { name: '🔙  Back', value: 'back' },
      ]
    }]);

    if (action === 'summarize') {
      await summarizeNews(articles);
    }

    if (action === 'open') {
      const { idx } = await inquirer.prompt([{
        type: 'list',
        name: 'idx',
        message: 'Choose article to open:',
        choices: articles.map((a, i) => ({ name: `${i + 1}. ${a.title}`, value: i }))
      }]);
      await open(articles[idx].url);
      console.log(chalk.green('✅ Opened in browser.'));
    }
  }
};

async function fetchNews(apiKey, { endpoint, params }) {
  const spinner = ora('Fetching news...').start();
  try {
    const res = await axios.get(`https://newsapi.org/v2/${endpoint}`, {
      params: { ...params, apiKey }
    });
    spinner.succeed(`Found ${res.data.articles.length} articles`);
    return res.data.articles.filter(a => a.title && a.title !== '[Removed]');
  } catch (err) {
    spinner.fail('Failed to fetch news: ' + (err.response?.data?.message || err.message));
    return [];
  }
}

function displayArticles(articles) {
  console.log('');
  articles.forEach((article, i) => {
    const num = chalk.gray(`${i + 1}.`);
    const title = chalk.bold.white(article.title);
    const source = chalk.cyan(article.source?.name || 'Unknown');
    const time = article.publishedAt
      ? chalk.gray(new Date(article.publishedAt).toLocaleDateString())
      : '';
    const desc = article.description
      ? chalk.gray('   ' + article.description.slice(0, 100) + (article.description.length > 100 ? '…' : ''))
      : '';

    console.log(`  ${num} ${title} ${chalk.gray('—')} ${source} ${time}`);
    if (desc) console.log(desc);
    console.log('');
  });
}

async function summarizeNews(articles) {
  const spinner = ora('AI is summarizing the news...').start();
  const headlines = articles.map((a, i) => `${i + 1}. ${a.title}: ${a.description || ''}`).join('\n');

  try {
    const summary = await mistralService.oneShot(
      `Here are today's news headlines:\n\n${headlines}\n\nProvide a concise, well-structured summary of the most important stories. Group by theme where relevant.`,
      'You are a professional news analyst. Summarize clearly and neutrally.'
    );
    spinner.stop();
    console.log('\n' + boxen(chalk.white(summary), {
      padding: 1, borderColor: 'yellow', title: '🤖 AI News Summary', titleAlignment: 'center', margin: { top: 1 }
    }));
  } catch (err) {
    spinner.fail('AI summary failed: ' + err.message);
  }
}