import React, { useState, useEffect } from 'react';
import { Users, Heart, Briefcase, Sparkles, MessageCircle, Loader2, AlertCircle, LogOut } from 'lucide-react';

const MatchesPage = ({ currentUser, onLogout }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMatch, setSelectedMatch] = useState(null);

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
        setMatches(data);
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
    // TODO: Implement connection request logic
    console.log('Connecting with:', match);
    alert(`Connection request sent to ${match.name}!`);
  };

  const handleViewProfile = (match) => {
    setSelectedMatch(match);
  };

  const closeModal = () => {
    setSelectedMatch(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Connect</h1>
                <p className="text-xs text-gray-500">Find your perfect match</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800">{currentUser?.name || 'User'}</p>
                <p className="text-xs text-gray-500">{currentUser?.email || ''}</p>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full animate-ping opacity-75"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              </div>
            </div>
            <p className="text-xl font-semibold text-gray-700">Loading your matches...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 flex items-center gap-4">
            <AlertCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-800 mb-1">Error Loading Matches</h3>
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchMatches}
                className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Matches Grid */}
        {!loading && !error && matches.length > 0 && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Matches</h2>
              <p className="text-gray-600">Found {matches.length} people with similar interests</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map((match, index) => (
                <div
                  key={match._id || index}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Match Score Badge */}
                  <div className="relative">
                    <div className="h-32 bg-gradient-to-br from-blue-400 to-purple-500"></div>
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-bold text-gray-800">{match.score || 0}% Match</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{match.name}</h3>
                    <div className="flex items-center gap-2 text-gray-600 mb-3">
                      <Briefcase className="w-4 h-4" />
                      <span className="text-sm">{match.Profession}</span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{match.bio}</p>

                    {/* Interests Tags */}
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-500 mb-2">Interests</p>
                      <div className="flex flex-wrap gap-1">
                        {match.interests?.slice(0, 3).map((interest, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                          >
                            {interest}
                          </span>
                        ))}
                        {match.interests?.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{match.interests.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Hobbies Tags */}
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-500 mb-2">Hobbies</p>
                      <div className="flex flex-wrap gap-1">
                        {match.hobbies?.slice(0, 3).map((hobby, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                          >
                            {hobby}
                          </span>
                        ))}
                        {match.hobbies?.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{match.hobbies.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewProfile(match)}
                        className="flex-1 px-4 py-2 border-2 border-blue-500 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
                      >
                        View Profile
                      </button>
                      <button
                        onClick={() => handleConnect(match)}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Connect
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Matches State */}
        {!loading && !error && matches.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No matches found</h3>
            <p className="text-gray-600 mb-6">We couldn't find anyone matching your interests yet. Check back later!</p>
            <button
              onClick={fetchMatches}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
            >
              Refresh
            </button>
          </div>
        )}
      </main>

      {/* Profile Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="sticky top-0 bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-3xl font-bold mb-2">{selectedMatch.name}</h2>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    <span>{selectedMatch.Profession}</span>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full inline-flex">
                <Sparkles className="w-4 h-4" />
                <span className="font-semibold">{selectedMatch.score || 0}% Match Score</span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">About</h3>
                <p className="text-gray-600">{selectedMatch.bio}</p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedMatch.interests?.map((interest, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-medium"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">Hobbies</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedMatch.hobbies?.map((hobby, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium"
                    >
                      {hobby}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Gender</h3>
                <p className="text-gray-600">{selectedMatch.gender}</p>
              </div>

              <button
                onClick={() => {
                  handleConnect(selectedMatch);
                  closeModal();
                }}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Send Connection Request
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
          opacity: 0;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
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