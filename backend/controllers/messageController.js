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

const seedMessages = async (req, res, next) => {
  try {
    await Message.deleteMany({ isSeedData: true });
    const now = Date.now();
    const seeds = [
      { name: 'Sarah Johnson', email: 'sarah.j@example.com', subject: 'Collaboration Inquiry', message: 'Hi! I really love your portfolio. I run a web development agency and we are looking for a frontend developer for an upcoming project. Would you be interested in discussing this further?', isRead: false, createdAt: now - 86400000 * 6 },
      { name: 'Michael Chen', email: 'm.chen@example.com', subject: 'Freelance Project Opportunity', message: 'Hello, I came across your work through a mutual connection. We need a React developer to build a dashboard interface for our SaaS platform. The project would start next month. Let me know if you are available!', isRead: false, createdAt: now - 86400000 * 5 },
      { name: 'Emily Rodriguez', email: 'emily.r@example.com', subject: 'Thank You!', message: 'Just wanted to say thank you for the amazing portfolio template. I used it as inspiration for my own site and it turned out great! Keep up the fantastic work.', isRead: true, createdAt: now - 86400000 * 4 },
      { name: 'David Kim', email: 'david.kim@example.com', subject: 'Speaking Engagement', message: 'We are organizing a tech conference in Addis Ababa next quarter and would love to have you as a speaker. Your experience as a full-stack developer would be invaluable to our audience.', isRead: false, createdAt: now - 86400000 * 3 },
      { name: 'Priya Patel', email: 'priya.p@example.com', subject: 'Code Review Request', message: 'Hi! I am a junior developer and I have been following your tutorials. Would you mind taking a look at my GitHub repo and giving some feedback? I would really appreciate your insights.', isRead: true, createdAt: now - 86400000 * 2 },
      { name: 'James Wilson', email: 'j.wilson@example.com', subject: 'Job Offer - Senior Developer', message: 'We are impressed by your portfolio and would like to invite you to apply for a Senior Full-Stack Developer position at our company. Remote work is available. Please check the attached job description.', isRead: false, createdAt: now - 86400000 * 1 },
      { name: 'Amina Hassan', email: 'amina.h@example.com', subject: 'Partnership Proposal', message: 'I run a coding bootcamp and we are looking for guest instructors. Your expertise in React and Node.js would be perfect for our advanced track. We offer competitive compensation for part-time instructors.', isRead: false, createdAt: now - 86400000 * 0.5 },
    ];
    const created = await Message.insertMany(seeds.map((s) => ({ ...s, isSeedData: true })));
    res.status(200).json({ success: true, message: `Seeded ${created.length} messages`, count: created.length });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendMessage, getMessages, getMessage, deleteMessage, markAsRead, seedMessages };
