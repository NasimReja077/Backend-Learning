import inquirer from 'inquirer';
import chalk from 'chalk';
import { chatCommand } from './commands/chat.js';
import { showToolsMenu } from './commands/tools.js';

export async function startApp() {
  if (!process.env.MISTRAL_API_KEY) {
    console.log(chalk.red('❌ MISTRAL_API_KEY is missing in .env'));
    process.exit(1);
  }

  console.log(chalk.green('\n🤖 Welcome to Mistral AI CLI\n'));

  while (true) {
    const { choice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'choice',
        message: 'Choose an option:',
        choices: [
          '💬 Start Chat',
          '🛠️  File System Tools',
          '🚪 Exit'
        ]
      }
    ]);

    if (choice === '🚪 Exit') {
      console.log(chalk.yellow('Goodbye! 👋'));
      process.exit(0);
    }

    if (choice === '💬 Start Chat') {
      await chatCommand();
    } else {
      await showToolsMenu();
    }
  }
}