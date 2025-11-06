import React, { useState, useEffect } from 'react';
import { socket } from '../services/socket';
import axios from 'axios';
import { Bell, Shield, AlertTriangle } from 'lucide-react';

const AdminNotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Fetch initial system notifications
    fetchSystemNotifications();

    // Listen for real-time system notifications
    socket.on('systemNotification', (newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(count => count + 1);
      
      // Play alert sound for high severity notifications
      if (newNotification.severity === 'high') {
        playAlertSound();
      }
    });

    return () => {
      socket.off('systemNotification');
    };
  }, []);

  const playAlertSound = () => {
    const audio = new Audio('/notification-sound.mp3');
    audio.play().catch(e => console.log('Error playing sound:', e));
  };

  const fetchSystemNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications/system');
      const systemNotifications = response.data.filter(n => 
        ['SYSTEM_RISK', 'FAILED_LOGIN', 'UNUSUAL_ACTIVITY'].includes(n.type)
      );
      setNotifications(systemNotifications);
      setUnreadCount(systemNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching system notifications:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`/api/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, read: true } : n
      ));
      setUnreadCount(count => count - 1);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      default:
        return 'text-blue-500';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'SYSTEM_RISK':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'FAILED_LOGIN':
        return <Shield className="w-5 h-5 text-yellow-500" />;
      case 'UNUSUAL_ACTIVITY':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      default:
        return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full"
      >
        <Shield className={`w-6 h-6 ${unreadCount > 0 ? 'text-red-500' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs px-2">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50 max-h-[80vh] overflow-y-auto">
          <div className="p-3 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-700">System Notifications</h3>
          </div>
          <div className="divide-y">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No system notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? 'bg-red-50' : ''
                  }`}
                  onClick={() => !notification.read && markAsRead(notification._id)}
                >
                  <div className="flex items-center gap-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">
                          {notification.title}
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          getSeverityColor(notification.severity)
                        }`}>
                          {notification.severity?.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </div>
                      <div className="text-xs text-gray-400 mt-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  {notification.metadata && (
                    <div className="mt-2 text-xs bg-gray-50 p-2 rounded">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(notification.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotificationBell;
