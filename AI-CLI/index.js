#!/usr/bin/env node

import { program } from 'commander';
import figlet from 'figlet';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { startApp } from './src/app.js';

dotenv.config();

console.log(chalk.cyan(figlet.textSync('Mistral CLI', { horizontalLayout: 'full' })));

program
  .name('mistral')
  .description('Powerful Mistral AI CLI with tools')
  .version('1.0.0')
  .action(startApp);

program.parse();