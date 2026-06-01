import ora from 'ora';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { mistralService } from '../services/mistralService.js';

export async function startChat() {
  console.log(chalk.bold.cyan('\n=== Mistral AI Chat ===\n'));
  console.log(chalk.gray('Type "clear" to reset chat, "exit" to quit\n'));


  while (true) {
    const { input } = await inquirer.prompt([
      { type: 'input', name: 'input', message: chalk.green('You:') }
    ]);

    
    if (input.toLowerCase() === 'exit') break;
    if (input.toLowerCase() === 'clear') {
      mistralService.clearHistory();
      console.log(chalk.yellow('Chat history cleared.'));
      continue;
    }

    const spinner = ora(chalk.blue('Mistral is thinking...')).start();

    try {
      const reply = await mistralService.sendMessage(input);
      spinner.stop();
      console.log(chalk.magenta('\nMistral: ') + chalk.white(reply) + '\n');
    } catch (err) {
      spinner.stop();
      console.log(chalk.red('Error:'), err.message);
    }
  }
}