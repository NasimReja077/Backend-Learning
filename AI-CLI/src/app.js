// src/app.js
import inquirer from 'inquirer';
import chalk from 'chalk';
import boxen from 'boxen';
import gradient from 'gradient-string';

import { startChat } from './commands/chat.js';
import { startRAGChat } from './commands/ragChat.js';
import { showToolsMenu } from './commands/tools.js';
import { ragService } from './rag/index.js';
import { settings } from './config/settings.js';

const headerGradient = gradient(['#00ffcc', '#00aaff', '#ff00cc']);

export async function startApp() {
  if (!process.env.MISTRAL_API_KEY) {
    console.log(chalk.red.bold('❌ MISTRAL_API_KEY missing in .env'));
    process.exit(1);
  }

  console.clear();

  while (true) {
    console.log(
      headerGradient(
        boxen('✨ MISTRAL AI CLI ✨ ', {
          padding: 1, margin: { top: 1, bottom: 1 },
          borderStyle: 'double',
          borderColor: 'cyan',
          title: 'v1.1',
          titleAlignment: 'center'
        })
      )
    );

    const { mainChoice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'mainChoice',
        message: chalk.cyan.bold('Choose an action:'),
        pageSize: 12,
        choices: [
          new inquirer.Separator(chalk.cyan('═'.repeat(60))),

          { name: chalk.bold.hex('#00ffcc')('💬  Normal Chat'), value: 'chat' },
          { name: chalk.bold.hex('#ff00ff')('🧠  RAG Chat (Knowledge)'), value: 'rag' },

          new inquirer.Separator(chalk.cyan('─'.repeat(60))),

          { name: chalk.bold.hex('#ffff00')('📥  Index Documents'), value: 'index' },
          { name: chalk.bold.hex('#00ffff')('🛠️  File System Tools'), value: 'tools' },

          new inquirer.Separator(chalk.cyan('─'.repeat(60))),

          { name: chalk.bold.hex('#ff8800')('⚙️  Settings & Model'), value: 'settings' },
          { name: chalk.bold.hex('#88ff88')('💾  Save / Load Chat'), value: 'history' },
          { name: chalk.red.bold('🚪  Exit'), value: 'exit' },
        ]
      }
    ]);

    console.log('');
    switch (mainChoice) {
      case 'chat': await startChat(false); break;
      case 'rag': await startRAGChat(); break;
      case 'index': await ragService.indexFolder(); break;
      case 'tools': await showToolsMenu(); break;
      case 'settings': await settings.showMenu(); break;
      case 'history':
        console.log(chalk.yellow('History feature coming soon...'));
        break;
      case 'exit':
        console.log(boxen(chalk.yellow.bold('Thank you for using Mistral AI CLI 👋'), {
          padding: 1,
          borderColor: 'yellow'
        }));
        process.exit(0);
    }
  }
}