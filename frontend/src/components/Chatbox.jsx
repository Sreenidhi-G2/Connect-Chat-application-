import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Send, 
  Smile, 
  Paperclip, 
  Phone, 
  Video, 
  MoreVertical,
  Check,
  CheckCheck,
  Clock,
  User
} from 'lucide-react';

const ChatBox = ({ currentUser, selectedUser, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const API_BASE = 'http://localhost:5000/api';

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

  useEffect(() => {
    if (currentUser && selectedUser) {
      fetchMessages();
    }
  }, [currentUser, selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Helper function to get user identifier
  const getUserId = (user) => {
    return user.id || user._id || user.phoneNumber || user.username;
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      
      const currentUserId = getUserId(currentUser);
      const selectedUserId = getUserId(selectedUser);
      
      console.log('Fetching messages between:', currentUserId, 'and', selectedUserId);
      
      const response = await fetch(`${API_BASE}/messages/${currentUserId}/${selectedUserId}`);
      const data = await response.json();

      if (response.ok) {
        // Backend returns messages array directly, not wrapped in an object
        setMessages(Array.isArray(data) ? data : []);
      } else {
        setError(data.error || 'Failed to fetch messages');
        console.error('Fetch error:', data);
      }
    } catch (err) {
      setError('Network error while fetching messages');
      console.error('Network error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const currentUserId = getUserId(currentUser);
    const selectedUserId = getUserId(selectedUser);

    // Match the backend API exactly - use 'time' not 'timestamp'
    const messageData = {
      from: currentUserId,
      to: selectedUserId,
      message: newMessage.trim(),
      time: new Date().toISOString(), // Backend expects 'time' field
    };

    // Optimistically add message to UI
    const tempMessage = {
      ...messageData,
      _id: 'temp_' + Date.now(), // Use _id to match backend response
      status: 'sending'
    };
    
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    setError(''); // Clear previous errors

    try {
      const response = await fetch(`${API_BASE}/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      const responseData = await response.json();

      if (response.ok) {
        // Replace temp message with actual message from server
        setMessages(prev => 
          prev.map(msg => 
            msg._id === tempMessage._id 
              ? { ...responseData, status: 'sent' }
              : msg
          )
        );
      } else {
        // Update message status to failed
        setMessages(prev => 
          prev.map(msg => 
            msg._id === tempMessage._id 
              ? { ...msg, status: 'failed' }
              : msg
          )
        );
        setError(responseData.error || 'Failed to send message');
        console.error('Send error:', responseData);
      }
    } catch (err) {
      setMessages(prev => 
        prev.map(msg => 
          msg._id === tempMessage._id 
            ? { ...msg, status: 'failed' }
            : msg
        )
      );
      setError('Network error while sending message');
      console.error('Network error:', err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (user) => {
    if (!user) return '??';
    
    // Try to get name first
    if (user.name && typeof user.name === 'string') {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    
    // Try username
    if (user.username && typeof user.username === 'string') {
      return user.username.substring(0, 2).toUpperCase();
    }
    
    // Try phoneNumber (note: using phoneNumber not mobileNumber)
    const phone = user.phoneNumber || user.mobileNumber;
    if (phone && typeof phone === 'string') {
      return phone.slice(-2);
    }
    
    // Final fallback
    return '??';
  };

  const getDisplayName = (user) => {
    if (!user) return 'Unknown User';
    return user.name || user.username || 'Anonymous User';
  };

  const getDisplayPhone = (user) => {
    if (!user) return '';
    // Use phoneNumber from your backend structure
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
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
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3 shadow-lg">
                  <span className="text-white font-bold text-sm">
                    {getInitials(selectedUser)}
                  </span>
                </div>
                <div>
                  <h2 className="font-semibold text-gray-800 text-lg">
                    {getDisplayName(selectedUser)}
                  </h2>
                  <div className="flex items-center text-sm text-gray-500">
                    <Phone className="w-3 h-3 mr-1" />
                    <span>{getDisplayPhone(selectedUser)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
    
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
              
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
              
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
                  className={`flex ${
                    message.from === currentUserId ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm ${
                      message.from === currentUserId
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-sm'
                        : 'bg-white/80 backdrop-blur-sm text-gray-800 rounded-bl-sm border border-white/20'
                    }`}
                  >
                    <p className="text-sm leading-relaxed break-words">
                      {message.message}
                    </p>
                    <div
                      className={`flex items-center justify-end mt-1 space-x-1 ${
                        message.from === currentUserId ? 'text-blue-100' : 'text-gray-500'
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
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-12"
                disabled={loading}
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors duration-200">
                
              </button>
            </div>
            
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || loading}
              className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;