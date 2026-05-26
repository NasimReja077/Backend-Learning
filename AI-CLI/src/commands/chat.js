// src/commands/chat.js
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import boxen from 'boxen';
import { mistralService } from '../services/mistralService.js';

export async function startChat(useRAG = false) {
  console.log(boxen(chalk.bold.cyan(' Mistral AI Chat '), { padding: 1, borderColor: 'blue', margin: { top: 1 } }));

  console.log(chalk.gray('Type "exit" to quit | "clear" to reset conversation\n'));

  while (true) {
    const { input } = await inquirer.prompt([
      {
        type: 'input',
        name: 'input',
        message: chalk.greenBright('You →'),
      }
    ]);

    if (!input.trim()) continue;

    if (input.toLowerCase() === 'exit') break;
    if (input.toLowerCase() === 'clear') {
      console.log(chalk.yellow('✓ Conversation cleared'));
      continue;
    }

    const spinner = ora({ text: 'Thinking...', color: 'cyan' }).start();

    try {
      const reply = await mistralService.sendMessage(input, useRAG);

      spinner.stop();

      console.log(boxen(chalk.white(reply), {
        padding: 1,
        margin: { top: 1, bottom: 1 },
        borderColor: 'magenta',
        borderStyle: 'round'
      }));
    } catch (err) {
      spinner.stop();
      console.log(chalk.red('✖ Error:'), err.message);
    }
  }
}