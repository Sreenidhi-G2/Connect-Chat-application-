import React, { useState, useEffect } from 'react';
import { Users, MessageCircle, MapPin, Briefcase, User, LogOut, Filter, Search } from 'lucide-react';

const ProfileGallery = ({ currentUser, onLogout }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('');

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

  // Filter matches based on search and location
  const filteredMatches = matches.filter(match => {
    const matchesSearch = searchTerm === '' || 
      match.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.Profession.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = filterLocation === '' || 
      match.location?.toLowerCase().includes(filterLocation.toLowerCase());
    
    return matchesSearch && matchesLocation;
  });

  // Function to get initials for avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Function to get a consistent color based on name
  const getAvatarColor = (name) => {
    const colors = [
      'bg-blue-100 text-blue-600 border-blue-200',
      'bg-blue-50 text-blue-700 border-blue-100',
      'bg-blue-200 text-blue-800 border-blue-300',
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center border-2 border-blue-500">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-black">Connect</h1>
                {/* <p className="text-sm text-gray-600">Professional Network</p> */}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-black">{currentUser?.name || 'User'}</p>
                <p className="text-xs text-gray-600">{currentUser?.email || ''}</p>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-gray-200"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search & Filter Bar */}
      {/* <div className="bg-gray-50 border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or profession..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter by location..."
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </div>
          </div>
        </div>
      </div> */}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-black mb-2">Your Matches</h2>
          <p className="text-gray-600">
            Showing {filteredMatches.length} of {matches.length} matches
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-xl h-64 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchMatches}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Profiles Grid - Similar to your image */}
        {!loading && !error && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredMatches.map((match, index) => (
              <div
                key={match._id || index}
                
                className="bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
                onClick={() => setSelectedProfile(match)}
              >
                {console.log(match)}
                {/* Profile Avatar */}
                <div className="p-6 flex flex-col items-center">
                  <div className={`w-24 h-24 rounded-full border-4 ${getAvatarColor(match.name)} flex items-center justify-center mb-4`}>
                    {match.profilePicture ? (
                      <img 
                        src={match.profilePicture} 
                        alt={match.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <>
                        <User className="w-12 h-12 opacity-80" />
                        {/* <span className="absolute text-2xl font-bold">
                          {getInitials(match.name)}
                        </span> */}
                      </>
                    )}
                  </div>
                  
                  {/* Name with match score badge */}
                  <div className="text-center mb-3">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-black">{match.name}</h3>
                      {match.score && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
                          {match.score}%
                        </span>
                      )}
                    </div>
                    
                    {/* Profession */}
                    <div className="flex items-center justify-center gap-1 text-gray-700 mb-2">
                      <Briefcase className="w-4 h-4" />
                      <p className="text-sm">{match.Profession || 'Professional'}</p>
                    </div>
                    
                    {/* Location */}
                    <div className="flex items-center justify-center gap-1 text-gray-600">
                     
                
                    </div>
                  </div>
                </div>

                {/* Quick Connect Button */}
                <div className="border-t border-gray-100 p-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle connect logic
                      console.log('Connect with:', match);
                    }}
                    className="w-full py-2 bg-white border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Connect
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && !error && filteredMatches.length === 0 && matches.length > 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-black mb-2">No matches found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterLocation('');
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* No Matches at All */}
        {!loading && !error && matches.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-black mb-2">No matches yet</h3>
            <p className="text-gray-600 mb-6">Check back later for new connections</p>
            <button
              onClick={fetchMatches}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        )}
      </main>

      {/* Profile Detail Modal */}
      {selectedProfile && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedProfile(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header with Avatar */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
              <button
                onClick={() => setSelectedProfile(null)}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center"
              >
                ✕
              </button>
              
              <div className="flex flex-col items-center">
                <div className={`w-32 h-32 rounded-full border-4 border-white ${getAvatarColor(selectedProfile.name)} flex items-center justify-center mb-4`}>
                  {selectedProfile.profilePicture ? (
                    <img 
                      src={selectedProfile.profilePicture} 
                      alt={selectedProfile.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <>
                      <User className="w-16 h-16 opacity-80" />
                      <span className="absolute text-3xl font-bold text-white">
                        {getInitials(selectedProfile.name)}
                      </span>
                    </>
                  )}
                </div>
                
                <h2 className="text-2xl font-bold">{selectedProfile.name}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <Briefcase className="w-4 h-4" />
                  <span>{selectedProfile.Profession || 'Professional'}</span>
                </div>
                {selectedProfile.score && (
                  <div className="mt-3 px-4 py-1 bg-white/20 rounded-full text-sm">
                    {selectedProfile.score}% Match
                  </div>
                )}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Location */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-2">LOCATION</h3>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="text-black">{selectedProfile.location || 'Not specified'}</span>
                </div>
              </div>

              {/* Bio */}
              {selectedProfile.bio && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">ABOUT</h3>
                  <p className="text-gray-700">{selectedProfile.bio}</p>
                </div>
              )}

              {/* Interests */}
              {selectedProfile.interests?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">INTERESTS</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProfile.interests.map((interest, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Hobbies */}
              {selectedProfile.hobbies?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">HOBBIES</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProfile.hobbies.map((hobby, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {hobby}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setSelectedProfile(null)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    console.log('Connect with:', selectedProfile);
                    setSelectedProfile(null);
                  }}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Connect
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .grid {
          display: grid;
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .5;
          }
        }
      `}</style>
    </div>
  );
};

export default ProfileGallery;