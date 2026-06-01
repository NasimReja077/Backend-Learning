// src/tools/searchTool.js
import axios from 'axios';
import inquirer from 'inquirer';
import chalk from 'chalk';
import boxen from 'boxen';
import ora from 'ora';
import open from 'open';
import { mistralService } from '../services/mistralService.js';

export const searchTool = {
  async run() {
    console.log(boxen(chalk.bold.hex('#00aaff')('  🔍  Web Search Tool  '), {
      padding: 1, borderColor: 'blue', margin: { top: 1, bottom: 1 }
    }));

    const { query } = await inquirer.prompt([{
      name: 'query',
      message: 'Search query:',
      validate: v => v.trim().length > 0 || 'Enter a search query'
    }]);

    const spinner = ora(`Searching for "${query}"...`).start();

    try {
      // DuckDuckGo Instant Answer API — no key needed
      const res = await axios.get('https://api.duckduckgo.com/', {
        params: { q: query, format: 'json', no_redirect: 1, no_html: 1, skip_disambig: 1 }
      });

      spinner.stop();
      const data = res.data;

      if (!data.AbstractText && !data.RelatedTopics?.length) {
        console.log(chalk.yellow('\nNo instant results found. Opening browser search...\n'));
        await open(`https://duckduckgo.com/?q=${encodeURIComponent(query)}`);
        return;
      }

      // Display result
      if (data.AbstractText) {
        console.log('\n' + boxen(
          chalk.bold.white(data.Heading || query) + '\n\n' +
          chalk.white(data.AbstractText) + '\n' +
          (data.AbstractURL ? chalk.gray('\nSource: ') + chalk.cyan(data.AbstractURL) : ''),
          { padding: 1, borderColor: 'blue', title: '🔍 Instant Answer', titleAlignment: 'center' }
        ));
      }

      if (data.RelatedTopics?.length) {
        const topics = data.RelatedTopics
          .filter(t => t.Text)
          .slice(0, 5);

        if (topics.length) {
          console.log(chalk.bold.cyan('\n  Related Results:\n'));
          topics.forEach((t, i) => {
            console.log(`  ${chalk.gray(`${i + 1}.`)} ${chalk.white(t.Text.slice(0, 120))}${t.Text.length > 120 ? '…' : ''}`);
            if (t.FirstURL) console.log(`     ${chalk.cyan(t.FirstURL)}`);
            console.log('');
          });
        }
      }

      // Ask if user wants AI analysis
      if (data.AbstractText) {
        const { analyze } = await inquirer.prompt([{
          type: 'confirm',
          name: 'analyze',
          message: '🤖 Analyze and expand on this with AI?',
          default: false
        }]);

        if (analyze) {
          const spinner2 = ora('AI is analyzing...').start();
          try {
            const insight = await mistralService.oneShot(
              `Topic: ${data.Heading || query}\n\nSummary: ${data.AbstractText}\n\nProvide deeper analysis, key facts, and useful context about this topic.`,
              'You are a knowledgeable research assistant. Provide clear, insightful analysis.'
            );
            spinner2.stop();
            console.log('\n' + boxen(chalk.white(insight), {
              padding: 1, borderColor: 'magenta', title: '🤖 AI Analysis', titleAlignment: 'center'
            }));
          } catch (err) {
            spinner2.fail('Analysis failed: ' + err.message);
          }
        }
      }

      // Open in browser option
      const { openBrowser } = await inquirer.prompt([{
        type: 'confirm',
        name: 'openBrowser',
        message: '🌐 Open full search results in browser?',
        default: false
      }]);

      if (openBrowser) {
        await open(`https://duckduckgo.com/?q=${encodeURIComponent(query)}`);
        console.log(chalk.green('✅ Opened in browser.'));
      }

    } catch (err) {
      spinner.fail('Search failed: ' + err.message);
    }
  }
};