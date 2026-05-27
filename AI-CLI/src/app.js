// src/app.js
import inquirer from 'inquirer';
import chalk from 'chalk';
import boxen from 'boxen';
import gradient from 'gradient-string';

import { startChat } from './commands/chat.js';
import { startRAGChat } from './commands/ragChat.js';
import { showToolsMenu } from './commands/tools.js';
import { ragService } from './rag/index.js';

const gradientHeader = gradient(['#00ffcc', '#0099ff', '#00ffcc']);

export async function startApp() {
  if (!process.env.MISTRAL_API_KEY) {
    console.log(chalk.red('❌ MISTRAL_API_KEY is missing in .env'));
    process.exit(1);
  }

  console.clear();

  // Beautiful Header
  console.log(
    gradientHeader(
      boxen('   MISTRAL AI CLI   ', {
        padding: { left: 4, right: 4, top: 0, bottom: 0 },
        margin: { top: 1, bottom: 1 },
        borderStyle: 'double',
        borderColor: 'cyan',
        title: 'v1.0',
        titleAlignment: 'center'
      })
    )
  );

  console.log(chalk.gray('   Powered by Mistral Large + RAG System\n'));

  while (true) {
    const { mainChoice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'mainChoice',
        message: chalk.cyan.bold('Select an option:'),
        pageSize: 10,
        choices: [
          new inquirer.Separator(chalk.cyan('─'.repeat(50))),

          { 
            name: chalk.bold('💬  Normal Chat'), 
            value: 'chat',
            short: 'Normal Chat'
          },
          { 
            name: chalk.bold('🧠  RAG Chat (Knowledge Base)'), 
            value: 'rag',
            short: 'RAG Chat'
          },

          new inquirer.Separator(chalk.cyan('─'.repeat(50))),

          { 
            name: chalk.bold('📥  Index Documents'), 
            value: 'index',
            short: 'Index Documents'
          },

          new inquirer.Separator(chalk.cyan('─'.repeat(50))),

          { 
            name: chalk.bold('🛠️  File System Tools'), 
            value: 'tools',
            short: 'File Tools'
          },

          new inquirer.Separator(chalk.cyan('─'.repeat(50))),

          { 
            name: chalk.red.bold('🚪  Exit Program'), 
            value: 'exit',
            short: 'Exit'
          }
        ]
      }
    ]);

    console.log('');

    switch (mainChoice) {
      case 'chat':
        await startChat(false);
        break;
      case 'rag':
        await startRAGChat();
        break;
      case 'index':
        await ragService.indexFolder();
        break;
      case 'tools':
        await showToolsMenu();
        break;
      case 'exit':
        console.log(
          boxen(chalk.yellow('Thank you for using Mistral AI CLI 👋'), {
            padding: 1,
            borderColor: 'yellow',
            margin: { top: 1 }
          })
        );
        process.exit(0);
    }
  }
}