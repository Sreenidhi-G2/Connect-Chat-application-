import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Search, 
  MessageCircle, 
  LogOut, 
  User, 
  Phone,
  Loader2,
  AlertCircle,
  Sparkles,
  Bell,
  BellOff
} from 'lucide-react';
import axios from 'axios';
import io from 'socket.io-client';

const UserList = ({ currentUser, onSelectUser, onLogout }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
  const [onlineUsers, setOnlineUsers] = useState([]);
  
  const socketRef = useRef(null);
  const SOCKET_URL = 'http://35.154.146.220:8000';
  const API_BASE = 'http://35.154.146.220:8000/api';

  // Configure axios instance
  const api = axios.create({
    baseURL: API_BASE,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
  });

  // Helper function to get user identifier
  const getUserId = (user) => {
    return user.id || user._id || user.phoneNumber || user.username;
  };

  // Request notification permission on component mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);
      });
    }
  }, []);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (currentUser) {
      ('🔌 Initializing socket connection in UserList...');

      socketRef.current = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        upgrade: true,
        rememberUpgrade: true,
        timeout: 20000,
        forceNew: true
      });

      const socket = socketRef.current;
      const currentUserId = getUserId(currentUser);

      // Connection handlers
      socket.on('connect', () => {
    
        setIsConnected(true);
        setError('');

        // Announce user is online
        socket.emit('user_online', currentUserId);
      });

      socket.on('disconnect', () => {
        ('UserList disconnected from server');
        setIsConnected(false);
      });

      socket.on('connect_error', (error) => {
        console.error('UserList connection error:', error);
        setIsConnected(false);
      });

      socket.on('online_users', (users) => {
        ('👥 Online users updated in UserList:', users);
        setOnlineUsers(users);
      });

      // Listen for new notifications
      socket.on('new_notification', (data) => {
        ('🔔 UserList received notification:', data);
        
        const senderId = data.from;
        const senderUser = users.find(u => getUserId(u) === senderId);
        const senderName = senderUser ? getDisplayName(senderUser) : 'Unknown User';
        
        // Add to toast notifications
        addInAppNotification({
          from: senderId,
          message: data.message,
          time: data.time,
          senderName,
          type: 'message'
        });

        // Update unread count
        setUnreadCounts(prev => {
          const newCounts = new Map(prev);
          const currentCount = newCounts.get(senderId) || 0;
          newCounts.set(senderId, currentCount + 1);
          return newCounts;
        });
      });

      // Browser notifications
      socket.on('browser_notification', (data) => {
        
        const senderId = data.from;
        const senderUser = users.find(u => getUserId(u) === senderId);
        const senderName = senderUser ? getDisplayName(senderUser) : 'Unknown User';
        
        showBrowserNotification(
          `New message from ${senderName}`,
          data.message.length > 50 ? data.message.substring(0, 50) + '...' : data.message
        );
      });

      // Cleanup function
      return () => {
        if (socket) {
          socket.disconnect();
        }
      };
    }
  }, [currentUser, users]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(user => {
        const name = user.name || user.username || '';
        const phone = user.phoneNumber || user.mobileNumber || '';
        return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               phone.includes(searchTerm);
      });
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  // Show browser notification
  const showBrowserNotification = (title, body, icon = null) => {
    if (notificationPermission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'chat-message',
        requireInteraction: false,
        silent: false
      });

      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000);

      // Handle click to focus window
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    }
    return null;
  };

  // Add in-app notification
  const addInAppNotification = (notificationData) => {
    const notification = {
      id: Date.now(),
      ...notificationData,
      timestamp: new Date().toISOString()
    };

    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep only last 5

    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const removeNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      ('Fetching users from:', `${API_BASE}/allusers`);
      
      const response = await api.get('/allusers');
      
      ('Response status:', response.status);
      ('Response data:', response.data);

      if (response.data.success) {
        // Filter out current user from the list
        const otherUsers = (response.data.users || []).filter(user => 
          user.id !== currentUser?.id && user._id !== currentUser?.id
        );
        ('Filtered users:', otherUsers);
        setUsers(otherUsers);
        setFilteredUsers(otherUsers);
      } else {
        // Handle different types of errors
        const errorMessage = response.data.message || `Failed to fetch users`;
        console.error('API Error:', errorMessage);
        setError(errorMessage);
      }
    } catch (err) {
      console.error('API Error:', err);
      if (err.response) {
        // Server responded with error status
        const errorMessage = err.response.data?.message || 
                            `HTTP ${err.response.status}: Failed to fetch users`;
        setError(errorMessage);
      } else if (err.request) {
        // Network error
        setError(`Network error: ${err.message}. Please check your connection and server.`);
      } else {
        // Other error
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (user) => {
    const name = user.name || user.username;
    if (name && typeof name === 'string') {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    
    const phone = user.phoneNumber || user.mobileNumber;
    if (phone && typeof phone === 'string') {
      return phone.slice(-2);
    }
    
    return '??';
  };

  const getAvatarColor = (userId) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-green-500 to-green-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600',
      'from-orange-500 to-orange-600',
      'from-teal-500 to-teal-600',
      'from-red-500 to-red-600',
    ];
    const id = userId || user._id || 0;
    return colors[Math.abs(String(id).split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % colors.length];
  };

  const getDisplayName = (user) => {
    return user.name || user.username || 'Anonymous User';
  };

  const getDisplayPhone = (user) => {
    const phone = user.phoneNumber || user.mobileNumber || 'No phone';
    if (phone.length > 4) {
      return phone.replace(/(\+\d{1,3})\d*(\d{4})/, '$1******$2');
    }
    return phone;
  };

  const handleUserSelect = (user) => {
    const userId = getUserId(user);
    
    // Clear unread count for this user when selecting them
    setUnreadCounts(prev => {
      const newCounts = new Map(prev);
      newCounts.delete(userId);
      return newCounts;
    });

    // Remove any notifications from this user
    setNotifications(prev => prev.filter(n => n.from !== userId));
    
    onSelectUser(user);
  };

  const handleRetry = () => {
    fetchUsers();
  };

  const isUserOnline = (user) => {
    const userId = getUserId(user);
    return onlineUsers.includes(userId);
  };

  const getUserUnreadCount = (user) => {
    const userId = getUserId(user);
    return unreadCounts.get(userId) || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading users...</p>
          <p className="text-gray-500 text-sm mt-2">Fetching available contacts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* In-app Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm animate-slide-in-right"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-1">
                  <Bell className="w-4 h-4 text-blue-500 mr-2" />
                  <span className="font-semibold text-sm text-gray-800">
                    {notification.senderName}
                  </span>
                </div>
                <p className="text-sm text-gray-600 break-words">
                  {notification.message}
                </p>
                <span className="text-xs text-gray-400">
                  {formatTime(notification.time)}
                </span>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="text-gray-400 hover:text-gray-600 ml-2"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
          <div className="max-w-6xl mx-auto text-center">
            <span className="text-yellow-800 text-sm">
              🔄 Connecting to real-time notifications...
            </span>
          </div>
        </div>
      )}

      {/* Notification Permission Banner */}
      {notificationPermission === 'default' && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <span className="text-blue-800 text-sm">
              🔔 Enable notifications to get alerts when you receive new messages
            </span>
            <button
              onClick={() => {
                Notification.requestPermission().then(permission => {
                  setNotificationPermission(permission);
                });
              }}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Enable
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Connect</h1>
                <p className="text-gray-600 text-sm">Choose someone to chat with</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center bg-gray-100 rounded-full px-4 py-2">
                <User className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-gray-700 font-medium">
                  {currentUser?.name || currentUser?.username || `${currentUser?.phoneNumber || currentUser?.mobileNumber}`}
                </span>
              </div>

              <button
                onClick={async () => {
                  ('🔔 Bell icon clicked, current permission:', notificationPermission);
                  
                  // Check if Notification API is supported
                  if (!('Notification' in window)) {
                    console.error('❌ This browser does not support notifications');
                    addInAppNotification({
                      from: 'system',
                      message: 'Your browser does not support notifications.',
                      time: new Date().toISOString(),
                      senderName: 'System',
                      type: 'system'
                    });
                    return;
                  }

                  if (notificationPermission === 'default') {
                    ('🔔 Requesting notification permission...');
                    
                    try {
                      // Use both callback and promise approach for better compatibility
                      let permission;
                      
                      if (Notification.requestPermission.length === 0) {
                        // Modern promise-based approach
                        permission = await Notification.requestPermission();
                      } else {
                        // Legacy callback approach
                        permission = await new Promise((resolve) => {
                          Notification.requestPermission(resolve);
                        });
                      }
                      
                      ('✅ Permission result:', permission);
                      setNotificationPermission(permission);
                      
                      if (permission === 'granted') {
                        addInAppNotification({
                          from: 'system',
                          message: 'Browser notifications enabled successfully!',
                          time: new Date().toISOString(),
                          senderName: 'System',
                          type: 'system'
                        });
                        
                        // Test notification
                        setTimeout(() => {
                          new Notification('Test Notification', {
                            body: 'Notifications are now working!',
                            icon: '/favicon.ico'
                          });
                        }, 1000);
                      } else if (permission === 'denied') {
                        addInAppNotification({
                          from: 'system',
                          message: 'Notifications were denied. You can enable them in browser settings.',
                          time: new Date().toISOString(),
                          senderName: 'System',
                          type: 'system'
                        });
                      }
                    } catch (error) {
                      console.error('❌ Error requesting notification permission:', error);
                      addInAppNotification({
                        from: 'system',
                        message: 'Error requesting notification permission. Please try again.',
                        time: new Date().toISOString(),
                        senderName: 'System',
                        type: 'system'
                      });
                    }
                  } else if (notificationPermission === 'denied') {
                    ('🔔 Notifications are blocked, showing help message');
                    addInAppNotification({
                      from: 'system',
                      message: 'Notifications are blocked. To enable: Click the lock/bell icon in your address bar, or go to Settings > Privacy > Notifications.',
                      time: new Date().toISOString(),
                      senderName: 'System',
                      type: 'system'
                    });
                  } else if (notificationPermission === 'granted') {
                    ('🔔 Notifications already granted, showing test notification');
                    // Show test notification
                    new Notification('Test Notification', {
                      body: 'Notifications are working perfectly!',
                      icon: '/favicon.ico'
                    });
                  }
                }}
                className={`flex items-center text-sm p-2 rounded-full transition-all duration-200 ${
                  notificationPermission === 'granted' 
                    ? 'text-green-500 hover:bg-green-50' 
                    : notificationPermission === 'denied'
                    ? 'text-red-500 hover:bg-red-50'
                    : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'
                }`}
                title={
                  notificationPermission === 'granted' 
                    ? 'Notifications enabled' 
                    : notificationPermission === 'denied'
                    ? 'Notifications blocked - click for help'
                    : 'Click to enable notifications'
                }
              >
                {notificationPermission === 'granted' ? (
                  <Bell className="w-4 h-4" />
                ) : (
                  <BellOff className="w-4 h-4" />
                )}
              </button>
              
              <button
                onClick={onLogout}
                className="flex items-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or phone number..."
              className="w-full pl-12 pr-4 py-4 bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-300 text-lg shadow-lg"
              disabled={!!error}
            />
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-6 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
            <div className="flex-1">
              <span className="text-red-700 font-medium block">{error}</span>
              {error.includes('Session expired') && (
                <span className="text-red-600 text-sm mt-1 block">
                  Redirecting to login...
                </span>
              )}
            </div>
            <button
              onClick={handleRetry}
              className="ml-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              disabled={error.includes('Session expired')}
            >
              Retry
            </button>
          </div>
        )}

        {/* Users Grid */}
        {filteredUsers.length === 0 && !error ? (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm ? 'No users found' : 'No users available'}
            </h3>
            <p className="text-gray-500">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Check back later for available users'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredUsers.map((user) => {
              const unreadCount = getUserUnreadCount(user);
              const isOnline = isUserOnline(user);
              
              return (
                <div
                  key={user.id || user._id}
                  onClick={() => handleUserSelect(user)}
                  className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 hover:bg-white hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 border border-white/20 hover:border-blue-200 relative"
                >
                  {/* Unread message badge */}
                  {unreadCount > 0 && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse shadow-lg">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </div>
                  )}

                  <div className="text-center">
                    <div className={`w-16 h-16 bg-gradient-to-br ${getAvatarColor(user.id || user._id)} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 relative`}>
                      <span className="text-white font-bold text-lg">
                        {getInitials(user)}
                      </span>
                      {/* Online indicator */}
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    </div>
                    
                    <h3 className="font-semibold text-gray-800 text-lg mb-2 group-hover:text-blue-600 transition-colors">
                      {getDisplayName(user)}
                    </h3>
                    
                    <div className="flex items-center justify-center text-gray-600 mb-2">
                      <Phone className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">{getDisplayPhone(user)}</span>
                    </div>

                    {isOnline && (
                      <div className="text-xs text-green-600 mb-3">
                        • Online
                      </div>
                    )}
                    
                    <div className="flex items-center justify-center bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium group-hover:bg-blue-100 transition-colors">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      {unreadCount > 0 ? `${unreadCount} New Message${unreadCount > 1 ? 's' : ''}` : 'Start Chat'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-16 pb-8">
          <div className="flex items-center justify-center text-gray-500 mb-2">
            <span className="text-sm">Connect with people around you</span>
          </div>
          <p className="text-xs text-gray-400">
            {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} available
            {onlineUsers.length > 0 && ` • ${onlineUsers.length} online`}
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default UserList;