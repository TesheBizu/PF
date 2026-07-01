const Message  = require('../models/Message');
const sendEmail = require('../utils/sendEmail');

// @desc    Send a contact message (public)
// @route   POST /api/messages
// @access  Public
const sendMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const newMessage = await Message.create({ name, email, subject, message });
    res.status(201).json({
      success: true,
      message: 'Message sent successfully!',
      data: newMessage,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all messages (admin inbox)
// @route   GET /api/messages
// @access  Private (Admin)
const getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single message
// @route   GET /api/messages/:id
// @access  Private (Admin)
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
    res.status(200).json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete message
// @route   DELETE /api/messages/:id
// @access  Private (Admin)
const deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    res.status(200).json({ success: true, message: 'Message deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark message as read
// @route   PATCH /api/messages/:id/read
// @access  Private (Admin)
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
    res.status(200).json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
};

// @desc    Reply to a message via email
// @route   POST /api/messages/:id/reply
// @access  Private (Admin)
const replyToMessage = async (req, res, next) => {
  try {
    const { replyText } = req.body;

    if (!replyText || !replyText.trim()) {
      return res.status(400).json({ success: false, message: 'Reply message is required' });
    }

    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    // Build a clean, professional HTML email
    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #f9fafb; padding: 32px 16px;">
        <div style="background: #ffffff; border-radius: 12px; padding: 36px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">

          <div style="text-align:center; margin-bottom: 28px;">
            <div style="display:inline-block; background: linear-gradient(135deg,#6366f1,#8b5cf6); border-radius: 10px; padding: 10px 22px;">
              <span style="color:#fff; font-size: 1.1rem; font-weight: 700; letter-spacing: 0.04em;">Teshome Bizuayehu</span>
            </div>
          </div>

          <p style="color:#374151; font-size: 1rem; margin-bottom: 6px;">Hi <strong>${message.name}</strong>,</p>
          <p style="color:#6b7280; font-size: 0.93rem; margin-bottom: 24px;">
            Thank you for reaching out. Here is my reply to your message regarding: <em>"${message.subject}"</em>
          </p>

          <div style="background: #f3f4f6; border-left: 4px solid #6366f1; border-radius: 6px; padding: 18px 20px; margin-bottom: 28px; color: #1f2937; font-size: 0.97rem; line-height: 1.7;">
            ${replyText.replace(/\n/g, '<br/>')}
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

          <p style="color:#9ca3af; font-size: 0.82rem; text-align:center;">
            This email was sent in response to your inquiry on the portfolio contact form.<br/>
            You can reach me directly at <a href="mailto:${process.env.ADMIN_EMAIL}" style="color:#6366f1;">${process.env.ADMIN_EMAIL}</a>
          </p>
        </div>
      </div>
    `;

    // Send via Resend HTTPS API (port 443 — never blocked)
    await sendEmail({
      to:       message.email,
      subject:  `Re: ${message.subject}`,
      html,
      replyTo:  process.env.ADMIN_EMAIL,
    });

    // Persist the reply in the database
    const updated = await Message.findByIdAndUpdate(
      req.params.id,
      {
        isReplied: true,
        replyText: replyText.trim(),
        repliedAt: new Date(),
        isRead:    true,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: `Reply sent successfully to ${message.email}`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendMessage, getMessages, getMessage, deleteMessage, markAsRead, replyToMessage };

