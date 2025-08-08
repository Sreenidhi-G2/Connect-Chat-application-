import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import {
  ArrowLeft,
  Send,
  Check,
  CheckCheck,
  Clock,
  User,
  Bell,
  BellOff
} from 'lucide-react';

const ChatBox = ({ currentUser, selectedUser, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const socketRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const typingTimeoutRef = useRef(null);
  const messageIdsRef = useRef(new Set());
  const [notifications, setNotifications] = useState([]);
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);

  const API_BASE = 'http://localhost:5000/api';
  const SOCKET_URL = 'http://localhost:5000/';

  // Request notification permission on component mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);
      });
    }
  }, []);

  // Early return if selectedUser is not available
  if (!selectedUser || !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Loading Chat...</h2>
            <p className="text-gray-600">Please wait while we set up your conversation.</p>
            {onBack && (
              <button
                onClick={onBack}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Go Back
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Helper function to get user identifier
  const getUserId = (user) => {
    return user.id || user._id || user.phoneNumber || user.username;
  };

  const isUserOnline = onlineUsers.includes(getUserId(selectedUser));

  // Helper function to generate unique message ID
  const generateMessageId = (message) => {
    const { from, to, message: text, time } = message;
    return `${from}_${to}_${text}_${new Date(time).getTime()}`;
  };

  // Helper function to check if message is duplicate
  const isDuplicateMessage = (newMessage, existingMessages) => {
    const newId = newMessage._id || newMessage.messageId || generateMessageId(newMessage);

    // Check against our tracking set
    if (messageIdsRef.current.has(newId)) {
      return true;
    }

    // Check against existing messages with multiple criteria
    return existingMessages.some(msg => {
      const existingId = msg._id || msg.messageId || generateMessageId(msg);

      // Same ID
      if (existingId === newId) return true;

      // Same content, sender, and close timestamp (within 2 seconds)
      const timeDiff = Math.abs(new Date(msg.time) - new Date(newMessage.time));
      return (
        msg.from === newMessage.from &&
        msg.to === newMessage.to &&
        msg.message === newMessage.message &&
        timeDiff < 2000
      );
    });
  };

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

  // Initialize Socket.IO connection
  useEffect(() => {
    if (currentUser && selectedUser) {

      // Clear message tracking when changing users
      messageIdsRef.current.clear();

      socketRef.current = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        upgrade: true,
        rememberUpgrade: true,
        timeout: 20000,
        forceNew: true
      });

      const socket = socketRef.current;
      const currentUserId = getUserId(currentUser);
      const selectedUserId = getUserId(selectedUser);

      // Connection handlers
      socket.on('connect', () => {
        ('✅ Connected to server with socket ID:', socket.id);
        setIsConnected(true);
        setError('');

        // Announce user is online
        socket.emit('user_online', currentUserId);

        // Join the chat room
        socket.emit('join_room', {
          user1: currentUserId,
          user2: selectedUserId
        });

        ('🏠 Joined room between', currentUserId, 'and', selectedUserId);
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
      });

      socket.on('connect_error', (error) => {
        console.error('🔴 Connection error:', error);
        setError('Connection failed. Retrying...');
        setIsConnected(false);
      });

      socket.on('online_users', (users) => {
        ('👥 Online users updated:', users);
        setOnlineUsers(users);
      });

      // Message handlers
      socket.on('receive_message', (data) => {
        ('📨 Received message:', data);

        setMessages(prev => {
          // Check for duplicates using improved logic
          if (isDuplicateMessage(data, prev)) {
            ('📋 Message already exists, skipping duplicate');
            return prev;
          }

          const messageId = data._id || data.messageId || generateMessageId(data);
          const newMessage = {
            ...data,
            _id: messageId,
            status: 'delivered'
          };

          // Add to tracking set
          messageIdsRef.current.add(messageId);

          return [...prev, newMessage];
        });
      });

      // In-app notifications
      socket.on('new_notification', (data) => {
        ('🔔 Received in-app notification:', data);
        
        const senderName = getDisplayName(selectedUser);
        
        addInAppNotification({
          from: data.from,
          message: data.message,
          time: data.time,
          senderName,
          type: 'message'
        });
      });

      // Browser notifications
      socket.on('browser_notification', (data) => {
        ('🌐 Received browser notification trigger:', data);
        
        const senderName = getDisplayName(selectedUser);
        
        showBrowserNotification(
          `New message from ${senderName}`,
          data.message.length > 50 ? data.message.substring(0, 50) + '...' : data.message
        );
      });

      // Typing indicators
      socket.on('typing', ({ from, isTyping: typing }) => {
        if (from === selectedUserId) {
          setIsTyping(typing);
          if (typing) {
            // Clear typing after 3 seconds
            setTimeout(() => setIsTyping(false), 3000);
          }
        }
      });

      // Message status updates
      socket.on('message_saved', ({ messageId, success, error: saveError, _id }) => {
        ('💾 Message save response:', { messageId, success, saveError, _id });
        
        if (success) {
          setMessages(prev =>
            prev.map(msg =>
              (msg._id === messageId || msg.messageId === messageId)
                ? { ...msg, status: 'sent', _id: _id || msg._id }
                : msg
            )
          );
        } else {
          console.error('❌ Message save failed:', saveError);
          setMessages(prev =>
            prev.map(msg =>
              (msg._id === messageId || msg.messageId === messageId)
                ? { ...msg, status: 'failed' }
                : msg
            )
          );
        }
      });

      // User status updates
      socket.on('user_status', ({ userId, status }) => {
        (`👤 User ${userId} is now ${status}`);
      });

      // Debug handlers
      socket.on('debug_room_response', (info) => {
        ('🔍 Room debug info:', info);
      });

      // Fetch initial messages
      fetchMessages();

      // Cleanup function
      return () => {
        ('🧹 Cleaning up socket connection');
        if (socket) {
          // Leave room before disconnecting
          socket.emit('leave_room', {
            user1: currentUserId,
            user2: selectedUserId
          });
          socket.disconnect();
        }
        // Clear message tracking
        messageIdsRef.current.clear();
      };
    }
  }, [currentUser, selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError('');

      const currentUserId = getUserId(currentUser);
      const selectedUserId = getUserId(selectedUser);
      
      ('📥 Fetching messages between:', currentUserId, 'and', selectedUserId);

      const response = await fetch(`${API_BASE}/messages/${currentUserId}/${selectedUserId}`);
      const data = await response.json();

      if (response.ok) {
        const messagesArray = Array.isArray(data) ? data : [];

        // Clear and rebuild message tracking
        messageIdsRef.current.clear();
        messagesArray.forEach(msg => {
          const id = msg._id || msg.messageId || generateMessageId(msg);
          messageIdsRef.current.add(id);
        });

        setMessages(messagesArray);
        ('📥 Fetched', messagesArray.length, 'messages');
      } else {
        setError(data.error || 'Failed to fetch messages');
        console.error('❌ Fetch error:', data);
      }
    } catch (err) {
      setError('Network error while fetching messages');
      console.error('❌ Network error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !socketRef.current) return;

    const currentUserId = getUserId(currentUser);
    const selectedUserId = getUserId(selectedUser);
    const messageId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    const messageData = {
      from: currentUserId,
      to: selectedUserId,
      message: newMessage.trim(),
      time: new Date().toISOString(),
      messageId
    };

    ('📤 Sending message:', messageData);

    // Optimistically add message to UI
    const tempMessage = {
      ...messageData,
      _id: messageId,
      status: 'sending'
    };

    // Add to tracking set to prevent duplicates
    messageIdsRef.current.add(messageId);

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    setError('');

    // Send via Socket.IO
    socketRef.current.emit('send_message', messageData);

    // Update status after a short delay if no response
    setTimeout(() => {
      setMessages(prev =>
        prev.map(msg =>
          msg._id === messageId && msg.status === 'sending'
            ? { ...msg, status: 'sent' }
            : msg
        )
      );
    }, 2000);
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (socketRef.current) {
      const currentUserId = getUserId(currentUser);
      const selectedUserId = getUserId(selectedUser);

      // Send typing indicator
      socketRef.current.emit('typing', {
        from: currentUserId,
        to: selectedUserId,
        isTyping: true
      });

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing indicator after 2 seconds
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current.emit('typing', {
          from: currentUserId,
          to: selectedUserId,
          isTyping: false
        });
      }, 2000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Debug function
  const debugRoom = () => {
    if (socketRef.current) {
      const currentUserId = getUserId(currentUser);
      const selectedUserId = getUserId(selectedUser);

      socketRef.current.emit('debug_room_info', {
        user1: currentUserId,
        user2: selectedUserId
      });
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (user) => {
    if (!user) return '??';

    if (user.name && typeof user.name === 'string') {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    if (user.username && typeof user.username === 'string') {
      return user.username.substring(0, 2).toUpperCase();
    }

    const phone = user.phoneNumber || user.mobileNumber;
    if (phone && typeof phone === 'string') {
      return phone.slice(-2);
    }

    return '??';
  };

  const getDisplayName = (user) => {
    if (!user) return 'Unknown User';
    return user.name || user.username || 'Anonymous User';
  };

  const getDisplayPhone = (user) => {
    if (!user) return '';
    return user.phoneNumber || user.mobileNumber || '';
  };

  const getMessageStatus = (message) => {
    const currentUserId = getUserId(currentUser);
    if (message.from !== currentUserId) return null;

    switch (message.status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-gray-400" />;
      case 'sent':
        return <Check className="w-3 h-3 text-gray-500" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-500" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      case 'failed':
        return <span className="text-red-500 text-xs">Failed</span>;
      default:
        return <Check className="w-3 h-3 text-gray-500" />;
    }
  };

  const removeNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
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
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-yellow-800 text-sm">
              🔄 Connecting to real-time chat...
            </span>
          </div>
        </div>
      )}

      {/* Notification Permission Banner */}
      {notificationPermission === 'default' && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
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

      {/* Chat Header */}
      <div className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>

              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3 shadow-lg relative">
                  <span className="text-white font-bold text-sm">
                    {getInitials(selectedUser)}
                  </span>
                  {/* Connection indicator */}
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${isUserOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                </div>
                <div>
                  <h2 className="font-semibold text-gray-800 text-lg">
                    {getDisplayName(selectedUser)}
                  </h2>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>{getDisplayPhone(selectedUser)}</span>
                    {isUserOnline && (
                      <span className="ml-2 text-green-600">• Online</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center text-sm text-gray-500">
                {notificationPermission === 'granted' ? (
                  <Bell className="w-4 h-4 text-green-500" />
                ) : (
                  <BellOff className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <button
                onClick={debugRoom}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 text-gray-500"
                title="Debug Room Info"
              >
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 overflow-y-auto">
        {loading && (
          <div className="text-center py-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 inline-block">
              <span className="text-gray-600">Loading messages...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-center">
            <span className="text-red-700 text-sm">{error}</span>
            <button
              onClick={() => setError('')}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        <div className="space-y-4">
          {messages.length === 0 && !loading ? (
            <div className="text-center py-12">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto">
                <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Start your conversation
                </h3>
                <p className="text-gray-500 text-sm">
                  Send a message to begin chatting with {getDisplayName(selectedUser)}
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => {
              const currentUserId = getUserId(currentUser);
              return (
                <div
                  key={message._id || message.id}
                  className={`flex ${message.from === currentUserId ? 'justify-end' : 'justify-start'
                    }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm ${message.from === currentUserId
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-sm'
                        : 'bg-white/80 backdrop-blur-sm text-gray-800 rounded-bl-sm border border-white/20'
                      }`}
                  >
                    <p className="text-sm leading-relaxed break-words">
                      {message.message}
                    </p>
                    <div
                      className={`flex items-center justify-end mt-1 space-x-1 ${message.from === currentUserId ? 'text-blue-100' : 'text-gray-500'
                        }`}
                    >
                      <span className="text-xs">
                        {formatTime(message.time || message.timestamp)}
                      </span>
                      {getMessageStatus(message)}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-white/20">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white/90 backdrop-blur-sm border-t border-white/20 sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
              
            </button>

            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={handleTyping}
                onKeyPress={handleKeyPress}
                placeholder={isConnected ? "Type a message..." : "Connecting..."}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-12"
                disabled={loading || !isConnected}
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors duration-200">

              </button>
            </div>

            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || loading || !isConnected}
              className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
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

export default ChatBox;