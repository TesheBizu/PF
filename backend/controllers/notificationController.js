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

module.exports = { getNotifications, createNotification, markAsRead, markAllAsRead, deleteNotification };
