import React, { useState, useEffect } from 'react';
import { Users, Home, Compass as CompassIcon, MessageCircle, Calendar, Bookmark, TrendingUp, User as UserIcon, Loader2, AlertCircle, LogOut, Bot, Send, Heart, Filter, Search } from 'lucide-react';

const MatchesPage = ({ currentUser, onLogout }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showCompassChat, setShowCompassChat] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [compassMessages, setCompassMessages] = useState([
    {
      role: 'assistant',
      content: `Hi ${currentUser?.name || 'there'}! I'm Compass, your AI friend. I'm here to help you connect with others, practice conversations, or just chat. How can I help you today?`
    }
  ]);
  const [compassInput, setCompassInput] = useState('');

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    setError('');

    try {
      const savedUser = localStorage.getItem('currentUser');
      const user = savedUser ? JSON.parse(savedUser) : null;
      const token = user?.token;

      const response = await fetch('http://localhost:8000/api/getmatch', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (response.ok) {
        const data = await response.json();
        const processedMatches = data.map(match => ({
          ...match,
          interests: typeof match.interests === 'string' 
            ? match.interests.split(', ').filter(Boolean)
            : match.interests || [],
          hobbies: typeof match.hobbies === 'string'
            ? match.hobbies.split(', ').filter(Boolean)
            : match.hobbies || []
        }));
        setMatches(processedMatches);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to load matches');
      }
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (match) => {
    console.log('Connecting with:', match);
    alert(`Connection request sent to ${match.name}!`);
  };

  const handleViewProfile = (match) => {
    setSelectedMatch(match);
  };

  const sendCompassMessage = async () => {
    if (!compassInput.trim()) return;

    const userMessage = { role: 'user', content: compassInput };
    setCompassMessages(prev => [...prev, userMessage]);
    setCompassInput('');

    setTimeout(() => {
      const responses = [
        "That's a great question! When starting a conversation, try asking about their interests or hobbies. People love talking about what they're passionate about.",
        "I'd be happy to help! Remember, genuine connections come from being yourself. What specifically would you like to know?",
        "That's wonderful! Building friendships takes time. Start with small talk and gradually deepen the conversation.",
        "Good thinking! Why not try complimenting something specific about their profile? It shows you've paid attention."
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setCompassMessages(prev => [...prev, { role: 'assistant', content: randomResponse }]);
    }, 1000);
  };

  // Calculate user stats
  const userStats = {
    friends: matches.length,
    connections: matches.length * 5,
    posts: 127
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 fixed h-full flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Connect</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Home className="w-5 h-5" />
            <span className="font-medium">Feed</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg">
            <CompassIcon className="w-5 h-5" />
            <span className="font-medium">Discover</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Users className="w-5 h-5" />
            <span className="font-medium">My Friends</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium">Messages</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">Events</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Bookmark className="w-5 h-5" />
            <span className="font-medium">Saved</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <TrendingUp className="w-5 h-5" />
            <span className="font-medium">Trending</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <UserIcon className="w-5 h-5" />
            <span className="font-medium">Profile</span>
          </button>
        </nav>

        {/* User Stats */}
        <div className="p-4 m-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100">
          <h3 className="font-semibold text-gray-900 mb-3">Your Stats</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Friends</span>
              <span className="font-bold text-blue-600">{userStats.friends}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Connections</span>
              <span className="font-bold text-purple-600">{userStats.connections}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Posts</span>
              <span className="font-bold text-blue-600">{userStats.posts}</span>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="max-w-6xl mx-auto px-8 py-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for friends, posts, or topics..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-8 py-8">
          {/* Hero Banner */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 mb-8 text-white">
            <div className="flex items-center gap-3 mb-3">
              <CompassIcon className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Discover People</h1>
            </div>
            <p className="text-blue-100 text-lg">Find amazing people who share your interests and passions</p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <h2 className="font-semibold text-gray-900">Filter by Interest</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  activeFilter === 'all'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Matches ({matches.length + 1})
              </button>
              <button
                onClick={() => setActiveFilter('high')}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  activeFilter === 'high'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                High Match (3)
              </button>
              <button
                onClick={() => setActiveFilter('travel')}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  activeFilter === 'travel'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Travel Lovers (5)
              </button>
              <button
                onClick={() => setActiveFilter('photography')}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  activeFilter === 'photography'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Photography (3)
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
              <p className="text-lg font-medium text-gray-900">Loading matches...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <AlertCircle className="w-6 h-6 text-red-600 mb-2" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Matches Grid */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Compass AI Card */}
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl overflow-hidden shadow-lg cursor-pointer transform hover:scale-105 transition-transform">
                <div className="relative h-48 bg-gradient-to-br from-blue-700 to-purple-700 flex items-center justify-center">
                  <Bot className="w-20 h-20 text-white/30" />
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    <CompassIcon className="w-4 h-4" />
                    100% Match
                  </div>
                </div>
                <div className="bg-white p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center -mt-12 border-4 border-white shadow-lg">
                        <Bot className="w-8 h-8 text-white" />
                      </div>
                      <div className="mt-2">
                        <h3 className="text-xl font-bold text-gray-900">Compass AI</h3>
                        <p className="text-sm text-gray-600">Your AI Friend & Guide</p>
                      </div>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full mt-3"></div>
                  </div>
                  <p className="text-gray-700 text-sm mb-4">
                    I'm here to help you connect, practice conversations, or just chat. Available 24/7!
                  </p>
                  <div className="flex items-center gap-2 mb-4 text-blue-600">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm font-medium">Always here to help</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {['Support', 'Advice', 'Chat', 'Practice'].map((tag, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowCompassChat(true)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Chat with Compass
                  </button>
                </div>
              </div>

              {/* User Matches */}
              {matches.slice(0, 5).map((match, index) => {
                const matchImages = [
                  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=300&fit=crop',
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=300&fit=crop',
                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=300&fit=crop',
                  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=300&fit=crop'
                ];
                
                return (
                  <div key={match._id || index} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow">
                    <div className="relative h-48 bg-gradient-to-br from-gray-300 to-gray-400 overflow-hidden">
                      <img 
                        src={matchImages[index % matchImages.length]} 
                        alt={match.name}
                        className="w-full h-full object-cover"
                      />
                      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-bold text-white flex items-center gap-1 ${
                        match.score >= 90 ? 'bg-green-500' : match.score >= 80 ? 'bg-blue-500' : 'bg-purple-500'
                      }`}>
                        <CompassIcon className="w-4 h-4" />
                        {match.score || 85}% Match
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center -mt-12 border-4 border-white shadow-lg overflow-hidden">
                            <img 
                              src={matchImages[index % matchImages.length]} 
                              alt={match.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="mt-2">
                            <h3 className="text-xl font-bold text-gray-900">{match.name}</h3>
                            <p className="text-sm text-gray-600">{match.Profession}</p>
                          </div>
                        </div>
                        <div className="w-3 h-3 bg-green-500 rounded-full mt-3"></div>
                      </div>
                      <p className="text-gray-700 text-sm mb-4 line-clamp-2">{match.bio}</p>
                      <div className="flex items-center gap-2 mb-4 text-blue-600">
                        <Heart className="w-4 h-4" />
                        <span className="text-sm font-medium">{Math.floor(Math.random() * 3) + 3} common interests</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {match.interests?.slice(0, 4).map((interest, i) => (
                          <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                            {interest}
                          </span>
                        ))}
                        {match.interests?.length > 4 && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                            +{match.interests.length - 4} more
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleConnect(match)}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
                        >
                          <Users className="w-5 h-5" />
                          Connect
                        </button>
                        <button
                          onClick={() => handleViewProfile(match)}
                          className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          <MessageCircle className="w-5 h-5" />
                        </button>
                        <button className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
                          <Heart className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Profile Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative h-48 bg-gradient-to-br from-blue-600 to-purple-600">
              <button
                onClick={() => setSelectedMatch(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-8 -mt-16">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-lg">
                <span className="text-4xl font-bold text-blue-600">{selectedMatch.name?.charAt(0)}</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedMatch.name}</h2>
              <p className="text-gray-600 mb-4">{selectedMatch.Profession}</p>
              <p className="text-gray-700 mb-6">{selectedMatch.bio}</p>
              
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedMatch.interests?.map((interest, i) => (
                    <span key={i} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  handleConnect(selectedMatch);
                  setSelectedMatch(null);
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold"
              >
                Send Connection Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compass Chat Modal */}
      {showCompassChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full h-[600px] flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white flex justify-between items-center rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold">Compass</h3>
                  <p className="text-xs text-blue-100">Your AI Friend</p>
                </div>
              </div>
              <button
                onClick={() => setShowCompassChat(false)}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {compassMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                      : 'bg-white text-gray-900'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={compassInput}
                  onChange={(e) => setCompassInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendCompassMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-600"
                />
                <button
                  onClick={sendCompassMessage}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default MatchesPage;