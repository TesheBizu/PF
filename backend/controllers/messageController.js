const Message = require('../models/Message');
const Notification = require('../models/Notification');
const { getIO } = require('../socket');

const sendMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const newMessage = await Message.create({ name, email, subject, message });
    getIO().emit('message:created', newMessage.toObject());

    Notification.create({
      type: 'message',
      title: `New message from ${name}`,
      body: subject,
      link: '/admin',
    }).then((n) => {
      getIO().emit('notification:new', n.toObject());
      Notification.countDocuments({ isRead: false }).then((c) => getIO().emit('notification:unreadCountChanged', c));
    }).catch(() => {});

    res.status(201).json({
      success: true,
      message: 'Message sent successfully!',
      data: newMessage,
    });
  } catch (error) {
    next(error);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    next(error);
  }
};

const getMessage = async (req, res, next) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    getIO().emit('message:read', message.toObject());
    res.status(200).json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
};

const deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    getIO().emit('message:deleted', message._id.toString());
    res.status(200).json({ success: true, message: 'Message deleted' });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    getIO().emit('message:read', message.toObject());
    res.status(200).json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendMessage, getMessages, getMessage, deleteMessage, markAsRead };
