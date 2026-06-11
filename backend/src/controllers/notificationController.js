const NotificationService = require('../services/notificationService');
const { success } = require('../utils/responseHandler');

const getNotifications = async (req, res) => {
  const notifications = await NotificationService.getForUser(req.user.id);
  const unread = await NotificationService.getUnreadCount(req.user.id);
  return success(res, { notifications, unread_count: unread });
};

const markRead = async (req, res) => {
  await NotificationService.markRead(req.params.id, req.user.id);
  return success(res, {}, 'Marked as read');
};

const markAllRead = async (req, res) => {
  await NotificationService.markAllRead(req.user.id);
  return success(res, {}, 'All marked as read');
};

module.exports = { getNotifications, markRead, markAllRead };
