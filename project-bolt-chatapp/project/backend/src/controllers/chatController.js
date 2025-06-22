import Chat from '../models/Chat.js';
import Message from '../models/Message.js';

export const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user._id })
      .populate('participants', 'fullName email avatar')
      .populate('lastMessage')
      .sort('-updatedAt');

    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chats', error: error.message });
  }
};

export const createChat = async (req, res) => {
  try {
    const { userId } = req.body;

    let chat = await Chat.findOne({
      participants: { $all: [req.user._id, userId] },
      isGroup: false
    });

    if (chat) {
      return res.json(chat);
    }

    chat = new Chat({
      participants: [req.user._id, userId],
      isGroup: false
    });

    await chat.save();
    await chat.populate('participants', 'fullName email avatar');

    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Error creating chat', error: error.message });
  }
};

export const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'fullName avatar')
      .sort('-createdAt');

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
};