import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { Bell, CheckCheck } from 'lucide-react';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await API.get('/notifications');
      setNotifications(res.data.data?.notifications || []);
      setUnreadCount(res.data.data?.unread_count || 0);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markRead = async (id) => {
    await API.patch(`/notifications/${id}/read`);
    loadNotifications();
  };

  const markAllRead = async () => {
    await API.patch('/notifications/read-all');
    loadNotifications();
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Notifications</h1>
        <p>You have {unreadCount} unread notification{unreadCount === 1 ? '' : 's'}</p>
      </div>

      <div className="section-header" style={{ marginBottom: 16 }}>
        <span />
        <button type="button" className="btn-outline btn-sm" onClick={markAllRead} disabled={!notifications.length}>
          <CheckCheck size={16} /> Mark all read
        </button>
      </div>

      {loading ? (
        <div className="loading-screen">
          <div className="spinner" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <Bell size={44} />
          <h3>No notifications yet</h3>
          <p>Updates from your appointments and payments will appear here.</p>
          <Link to="/" className="btn-primary btn-sm">Back to Home</Link>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <article key={notification.id} className={`notification-card ${notification.is_read ? 'read' : 'unread'}`}>
              <div className="notification-copy">
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>
                <small>{notification.created_at ? new Date(notification.created_at).toLocaleString() : ''}</small>
              </div>
              {!notification.is_read && (
                <button type="button" className="btn-primary btn-sm" onClick={() => markRead(notification.id)}>
                  Mark read
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
