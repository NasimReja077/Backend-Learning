// src/commands/chat.js
import inquirer from 'inquirer';
import chalk from 'chalk';
import boxen from 'boxen';
import { mistralService } from '../services/mistralService.js';

export async function startChat(useRAG = false) {
  console.log(boxen(chalk.bold.cyan(' Mistral AI Streaming Chat '), {
    padding: 1,
    borderColor: 'blue',
    margin: { top: 1 }
  }));

  while (true) {
    const { input } = await inquirer.prompt([
      { type: 'input', name: 'input', message: chalk.greenBright('You →') }
    ]);

    if (!input?.trim()) continue;
    if (input.toLowerCase() === 'exit') break;
    if (input.toLowerCase() === 'clear') {
      console.clear();
      continue;
    }

    process.stdout.write(chalk.magenta('\nMistral → '));

    try {
      const reply = await mistralService.sendMessage(input, useRAG, true); // true = stream

      console.log(boxen(chalk.white(reply), {
        padding: 1,
        margin: { top: 1, bottom: 1 },
        borderColor: 'magenta',
        borderStyle: 'round'
      }));
    } catch (err) {
      console.log(chalk.red('✖ Error:'), err.message);
    }
  }
}