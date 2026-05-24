import fs from 'fs/promises';
import chalk from 'chalk';
import inquirer from 'inquirer';

export const fileController = {
  async createFile() {
    const { filename, content } = await inquirer.prompt([
      { name: 'filename', message: 'Enter file name:' },
      { name: 'content', message: 'Enter content:', type: 'editor' }
    ]);

    await fs.writeFile(filename, content);
    console.log(chalk.green(`✅ File created: ${filename}`));
  },

  async readFile() {
    const { filename } = await inquirer.prompt([
      { name: 'filename', message: 'Enter file name to read:' }
    ]);
    try {
      const data = await fs.readFile(filename, 'utf8');
      console.log(chalk.yellow('\n--- File Content ---\n') + data);
    } catch (e) {
      console.log(chalk.red('❌ File not found or cannot be read.'));
    }
  },

  async deleteFile() {
    const { filename } = await inquirer.prompt([
      { name: 'filename', message: 'Enter file name to delete:' }
    ]);
    try {
      await fs.unlink(filename);
      console.log(chalk.green(`✅ Deleted: ${filename}`));
    } catch (e) {
      console.log(chalk.red('❌ File not found.'));
    }
  },

  async listFiles() {
    const files = await fs.readdir('.');
    console.log(chalk.blue('\n📁 Directory Contents:'));
    files.forEach(file => console.log(`   📄 ${file}`));
  }
};