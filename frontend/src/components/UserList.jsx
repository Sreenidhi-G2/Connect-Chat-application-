import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  MessageCircle, 
  LogOut, 
  User, 
  Phone,
  Loader2,
  AlertCircle,
  Sparkles
} from 'lucide-react';

const UserList = ({ currentUser, onSelectUser, onLogout }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE = 'http://localhost:5000/api';

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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/allusers`);
      const data = await response.json();

      if (response.ok) {
        // Filter out current user from the list
        const otherUsers = (data.users || []).filter(user => user.id !== currentUser?.id);
        setUsers(otherUsers);
        setFilteredUsers(otherUsers);
      } else {
        setError('Failed to fetch users. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (user) => {
    // Try to get name from different possible fields
    const name = user.name || user.username;
    if (name && typeof name === 'string') {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    
    // Fallback to phone number - check both possible field names
    const phone = user.phoneNumber || user.mobileNumber;
    if (phone && typeof phone === 'string') {
      return phone.slice(-2);
    }
    
    // Final fallback
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
    return colors[userId % colors.length];
  };

  const getDisplayName = (user) => {
    return user.name || user.username || 'Anonymous User';
  };

  const getDisplayPhone = (user) => {
    return user.phoneNumber || user.mobileNumber || 'No phone';
  };

  const handleUserSelect = (user) => {
    onSelectUser(user);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
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
            />
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-6 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
            <span className="text-red-700 font-medium">{error}</span>
            <button
              onClick={fetchUsers}
              className="ml-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
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
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => handleUserSelect(user)}
                className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 hover:bg-white hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 border border-white/20 hover:border-blue-200"
              >
                <div className="text-center">
                  <div className={`w-16 h-16 bg-gradient-to-br ${getAvatarColor(user.id)} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                    <span className="text-white font-bold text-lg">
                      {getInitials(user)}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-gray-800 text-lg mb-2 group-hover:text-blue-600 transition-colors">
                    {getDisplayName(user)}
                  </h3>
                  
                  <div className="flex items-center justify-center text-gray-600 mb-4">
                    <Phone className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">{getDisplayPhone(user)}</span>
                  </div>
                  
                  <div className="flex items-center justify-center bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium group-hover:bg-blue-100 transition-colors">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Start Chat
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-16 pb-8">
          <div className="flex items-center justify-center text-gray-500 mb-2">
            <Sparkles className="w-4 h-4 mr-2" />
            <span className="text-sm">Connect with people around you</span>
          </div>
          <p className="text-xs text-gray-400">
            {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} available
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserList;