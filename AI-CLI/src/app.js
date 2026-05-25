// src/app.js
import inquirer from 'inquirer';
import chalk from 'chalk';
import { startChat } from './commands/chat.js';
import { showToolsMenu } from './commands/tools.js';

export async function startApp() {
  if (!process.env.MISTRAL_API_KEY) {
    console.log(chalk.red('❌ MISTRAL_API_KEY is missing in .env file'));
    process.exit(1);
  }

  console.log(chalk.green('\n🤖 Welcome to Mistral AI CLI\n'));

  while (true) {
    const { mainChoice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'mainChoice',
        message: 'Main Menu',
        choices: [
          { name: '💬 Start Chat with Mistral', value: 'chat' },
          { name: '🛠️  File System Tools', value: 'tools' },
          { name: '🚪 Exit', value: 'exit' }
        ]
      }
    ]);

    if (mainChoice === 'exit') {
      console.log(chalk.yellow('\nGoodbye! 👋'));
      process.exit(0);
    }

    if (mainChoice === 'chat') {
      await startChat();
    } else if (mainChoice === 'tools') {
      await showToolsMenu();
    }

    // Small separator after returning from chat or tools
    console.log(chalk.gray('─'.repeat(60)));
  }
}