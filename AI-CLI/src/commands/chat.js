export { startChat } from '../controllers/chatController.js';

export async function chatCommand() {
  await startChat();
}