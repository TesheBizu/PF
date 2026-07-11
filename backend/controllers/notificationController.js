const Notification = require('../models/Notification');
const { getIO } = require('../socket');

const getNotifications = async (req, res, next) => {
  try {
    const { unread } = req.query;
    const filter = unread === 'true' ? { isRead: false } : {};
    const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(100);
    const totalUnread = await Notification.countDocuments({ isRead: false });
    res.status(200).json({ success: true, count: notifications.length, totalUnread, data: notifications });
  } catch (error) {
    next(error);
  }
};

const createNotification = async (req, res, next) => {
  try {
    const notification = await Notification.create(req.body);
    const full = notification.toObject();
    getIO().emit('notification:new', full);
    getIO().emit('notification:unreadCountChanged', await Notification.countDocuments({ isRead: false }));
    res.status(201).json({ success: true, data: full });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    getIO().emit('notification:read', notification.toObject());
    getIO().emit('notification:unreadCountChanged', await Notification.countDocuments({ isRead: false }));
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    const result = await Notification.updateMany({ isRead: false }, { isRead: true });
    getIO().emit('notification:allRead');
    getIO().emit('notification:unreadCountChanged', 0);
    res.status(200).json({ success: true, message: 'All notifications marked as read', modifiedCount: result.modifiedCount });
  } catch (error) {
    next(error);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    getIO().emit('notification:deleted', req.params.id);
    getIO().emit('notification:unreadCountChanged', await Notification.countDocuments({ isRead: false }));
    res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
};

const seedNotifications = async (req, res, next) => {
  try {
    await Notification.deleteMany({ isSeedData: true });
    const now = Date.now();
    const seeds = [
      { type: 'message', title: 'New message from Sarah Johnson', body: 'Collaboration Inquiry', isRead: false, createdAt: now - 86400000 * 6 },
      { type: 'message', title: 'New message from Michael Chen', body: 'Freelance Project Opportunity', isRead: false, createdAt: now - 86400000 * 5 },
      { type: 'system', title: 'Portfolio performance update', body: 'Your portfolio received 230 visits this week — a 12% increase from last week.', isRead: true, createdAt: now - 86400000 * 4 },
      { type: 'message', title: 'New message from David Kim', body: 'Speaking Engagement', isRead: false, createdAt: now - 86400000 * 3 },
      { type: 'alert', title: 'New login detected', body: 'Admin panel accessed from a new device (Chrome on Windows).', isRead: true, createdAt: now - 86400000 * 2 },
      { type: 'alert', title: 'Password changed successfully', body: 'Your admin password was updated.', isRead: false, createdAt: now - 86400000 * 1.5 },
      { type: 'message', title: 'New message from James Wilson', body: 'Job Offer - Senior Developer', isRead: false, createdAt: now - 86400000 * 1 },
      { type: 'message', title: 'New message from Amina Hassan', body: 'Partnership Proposal', isRead: false, createdAt: now - 86400000 * 0.5 },
      { type: 'system', title: 'Daily analytics report', body: '30 unique visitors — 3 contact submissions today.', isRead: false, createdAt: now - 86400000 * 0.2 },
    ];
    const created = await Notification.insertMany(seeds.map((s) => ({ ...s, isSeedData: true })));
    const totalUnread = await Notification.countDocuments({ isRead: false });
    getIO().emit('notification:unreadCountChanged', totalUnread);
    res.status(200).json({ success: true, message: `Seeded ${created.length} notifications`, count: created.length });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotifications, createNotification, markAsRead, markAllAsRead, deleteNotification, seedNotifications };
