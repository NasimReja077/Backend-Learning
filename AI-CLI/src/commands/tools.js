import inquirer from 'inquirer';
import { fileController } from '../controllers/fileController.js';

export async function showToolsMenu() {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'File System Tools:',
      choices: [
        'Create New File',
        'Read File',
        'Delete File',
        'List Current Directory',
        'Back to Main Menu'
      ]
    }
  ]);

  switch (action) {
    case 'Create New File': await fileController.createFile(); break;
    case 'Read File': await fileController.readFile(); break;
    case 'Delete File': await fileController.deleteFile(); break;
    case 'List Current Directory': await fileController.listFiles(); break;
  }
}