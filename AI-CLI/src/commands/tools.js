// src/commands/tools.js
import inquirer from 'inquirer';
import { fileController } from '../controllers/fileController.js';

export async function showToolsMenu() {
  while (true) {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'File System Tools',
        choices: [
          { name: '📝 Create New File', value: 'create' },
          { name: '📖 Read File', value: 'read' },
          { name: '🗑️  Delete File', value: 'delete' },
          { name: '📂 List Current Directory', value: 'list' },
          { name: '🔙 Back to Main Menu', value: 'back' }
        ]
      }
    ]);

    if (action === 'back') break;

    switch (action) {
      case 'create':
        await fileController.createFile();
        break;
      case 'read':
        await fileController.readFile();
        break;
      case 'delete':
        await fileController.deleteFile();
        break;
      case 'list':
        await fileController.listFiles();
        break;
    }

    console.log(''); // empty line for better UX
  }
}