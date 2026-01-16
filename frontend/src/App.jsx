

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from '../src/components/Login';
import ProfileSetup from '../src/components/Profilesetup';
import MatchesPage from '../src/components/MatchPage';
import UserList from '../src/components/UserList';
import ChatBox from '../src/components/Chatbox';

// Protected Route Component
const ProtectedRoute = ({ children, currentUser }) => {
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Profile Required Route Component
const ProfileRequiredRoute = ({ children, currentUser }) => {
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  if (!currentUser.profileCompleted) {
    return <Navigate to="/setup-profile" replace />;
  }
  return children;
};

// Main App Component
const AppContent = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();

  const API_BASE = 'http://localhost:5000/api';

  // Check if user is already logged in when app starts
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  // Handle successful login
  const handleLoginSuccess = (user, token) => {
    const userData = {
      ...user,
      token: token,
      profileCompleted: user.onboardingcompleted || false // Map backend field to frontend field
    };
    
    setCurrentUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
    
    // Redirect based on onboarding status
    if (userData.profileCompleted) {
      navigate('/matches');
    } else {
      navigate('/setup-profile');
    }
  };

  // Handle profile completion
  const handleProfileComplete = async (profileData) => {
    try {
      // Send profile data to backend
      const response = await fetch(`${API_BASE}/profile/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        
        // Update user with profile completed flag
        const userData = {
          ...currentUser,
          ...updatedUser,
          profileCompleted: true,
          onboardingcompleted: true // Also update the backend field name
        };
        
        setCurrentUser(userData);
        localStorage.setItem('currentUser', JSON.stringify(userData));
        navigate('/matches');
      } else {
        console.error('Failed to save profile');
        alert('Failed to save profile. Please try again.');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Network error. Please check your connection and try again.');
    }
  };

  // Handle logout
  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedUser(null);
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  // Handle user selection
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    navigate(`/chat/${user.id}`);
  };

  // Handle back navigation from chat
  const handleBackToUserList = () => {
    setSelectedUser(null);
    navigate('/users');
  };

  return (
    <Routes>
      {/* Login Route */}
      <Route 
        path="/login" 
        element={
          currentUser ? (
            currentUser.profileCompleted ? (
              <Navigate to="/matches" replace />
            ) : (
              <Navigate to="/setup-profile" replace />
            )
          ) : (
            <Login 
              onLoginSuccess={handleLoginSuccess}
              apiBase={API_BASE}
            />
          )
        } 
      />

      {/* Profile Setup Route */}
      <Route 
        path="/setup-profile" 
        element={
          <ProtectedRoute currentUser={currentUser}>
            {currentUser?.profileCompleted ? (
              <Navigate to="/matches" replace />
            ) : (
              <ProfileSetup 
                onProfileComplete={handleProfileComplete}
              />
            )}
          </ProtectedRoute>
        } 
      />

      {/* Matches Page Route - Requires completed profile */}
      <Route 
        path="/matches" 
        element={
          <ProfileRequiredRoute currentUser={currentUser}>
            <MatchesPage 
              currentUser={currentUser}
              onLogout={handleLogout}
            />
          </ProfileRequiredRoute>
        } 
      />

      {/* User List Route - Requires completed profile */}
      <Route 
        path="/users" 
        element={
          <ProfileRequiredRoute currentUser={currentUser}>
            <UserList 
              currentUser={currentUser}
              onSelectUser={handleUserSelect}
              onLogout={handleLogout}
              apiBase={API_BASE}
            />
          </ProfileRequiredRoute>
        } 
      />

      {/* Chat Route - Requires completed profile */}
      <Route 
        path="/chat/:userId" 
        element={
          <ProfileRequiredRoute currentUser={currentUser}>
            <ChatBox 
              currentUser={currentUser}
              selectedUser={selectedUser}
              onBack={handleBackToUserList}
              apiBase={API_BASE}
            />
          </ProfileRequiredRoute>
        } 
      />

      {/* Default Route */}
      <Route 
        path="/" 
        element={
          currentUser ? (
            currentUser.profileCompleted ? (
              <Navigate to="/matches" replace />
            ) : (
              <Navigate to="/setup-profile" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />

      {/* 404 Route */}
      <Route 
        path="*" 
        element={
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">404 - Page Not Found</h1>
              <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
              <button 
                onClick={() => navigate(currentUser ? (currentUser.profileCompleted ? '/matches' : '/setup-profile') : '/login')}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Go {currentUser ? (currentUser.profileCompleted ? 'to Matches' : 'to Profile Setup') : 'to Login'}
              </button>
            </div>
          </div>
        } 
      />
    </Routes>
  );
};

// Root App Component with Router
function App() {
  return (
    <Router>
      <div className="App">
        <AppContent />
      </div>
    </Router>
  );
}

export default App;