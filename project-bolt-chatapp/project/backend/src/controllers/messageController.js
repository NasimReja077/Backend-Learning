import Message from '../models/Message.js';
import Chat from '../models/Chat.js';

export const sendMessage = async (req, res) => {
  try {
    const { chatId, content } = req.body;

    const message = new Message({
      sender: req.user._id,
      content,
      chat: chatId
    });

    await message.save();
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: message._id
    });

    await message.populate('sender', 'fullName avatar');

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findByIdAndUpdate(
      messageId,
      { $addToSet: { readBy: req.user._id } },
      { new: true }
    );

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: 'Error marking message as read', error: error.message });
  }
};