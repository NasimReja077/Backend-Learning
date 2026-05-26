// src/commands/ragChat.js
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { mistralService } from '../services/mistralService.js';

export async function startRAGChat() {
  console.log(boxen(chalk.bold.magenta(' Mistral AI RAG Chat (Knowledge Base) '), {
  padding: 1,
  borderColor: 'magenta',
  margin: { top: 1 }
}));
  console.log(chalk.gray('AI will use your documents to answer.\nType "exit" to quit, "clear" to reset.\n'));

  while (true) {
    const { input } = await inquirer.prompt([
      {
        type: 'input',
        name: 'input',
        message: chalk.green('You:')
      }
    ]);

    if (input.toLowerCase() === 'exit') break;
    if (input.toLowerCase() === 'clear') {
      console.log(chalk.yellow('Chat cleared.'));
      continue;
    }

    const spinner = ora(chalk.blue('Searching documents and thinking...')).start();

    try {
      const reply = await mistralService.sendMessage(input, true); // true = use RAG
      spinner.stop();
      console.log(boxen(chalk.white(reply), {
        padding: 1,
        margin: { top: 1, bottom: 1 },
        borderColor: 'magenta',
        borderStyle: 'round'
      }));
    } catch (err) {
      spinner.stop();
      console.log(chalk.red('Error:'), err.message);
    }
  }
}