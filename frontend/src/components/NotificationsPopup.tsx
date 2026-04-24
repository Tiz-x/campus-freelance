import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { FiBell, FiX, FiCheckCircle, FiTrendingUp, FiBriefcase, FiUserPlus } from "react-icons/fi";

interface NotificationsPopupProps {
  userId: string;
  onClose: () => void;
}

const NotificationsPopup = ({ userId, onClose }: NotificationsPopupProps) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    
    const subscription = supabase
      .channel('notifications-channel')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, 
        () => { fetchNotifications(); }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30);

    if (!error && data) {
      setNotifications(data);
    }
    setLoading(false);
  };

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    
    fetchNotifications();
  };

  const markAllAsRead = async () => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId);
    
    fetchNotifications();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'bid_accepted':
        return <FiCheckCircle style={{ color: "#1a9c6e" }} />;
      case 'bid_received':
        return <FiUserPlus style={{ color: "#3b82f6" }} />;
      case 'job_posted':
        return <FiBriefcase style={{ color: "#f59e0b" }} />;
      case 'new_job':
        return <FiTrendingUp style={{ color: "#8b5cf6" }} />;
      default:
        return <FiBell style={{ color: "#6c757d" }} />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="notifications-popup">
      <div className="notifications-header">
        <h3>System Notifications</h3>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="mark-all-read">
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="close-btn">
            <FiX />
          </button>
        </div>
      </div>
      
      <div className="notifications-list">
        {loading ? (
          <div className="notifications-loading">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="notifications-empty">
            <FiBell />
            <p>No system notifications yet</p>
            <small>You'll be notified when bids are accepted, new jobs are posted, etc.</small>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`notification-item ${!notif.is_read ? 'unread' : ''}`}
              onClick={() => markAsRead(notif.id)}
            >
              <div className="notification-icon">
                {getIcon(notif.type)}
              </div>
              <div className="notification-content">
                <div className="notification-title">{notif.title}</div>
                <div className="notification-message">{notif.message}</div>
                <div className="notification-time">{formatTime(notif.created_at)}</div>
              </div>
              {!notif.is_read && <div className="notification-dot" />}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPopup;