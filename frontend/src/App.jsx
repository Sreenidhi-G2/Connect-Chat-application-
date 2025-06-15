import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import UserList from './components/UserList';
import ChatBox from './components/Chatbox';

// Protected Route Component
const ProtectedRoute = ({ children, currentUser }) => {
  if (!currentUser) {
    return <Navigate to="/login" replace />;
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
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    navigate('/users');
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
            <Navigate to="/users" replace />
          ) : (
            <Login 
              onLoginSuccess={handleLoginSuccess}
              apiBase={API_BASE}
            />
          )
        } 
      />

      {/* User List Route */}
      <Route 
        path="/users" 
        element={
          <ProtectedRoute currentUser={currentUser}>
            <UserList 
              currentUser={currentUser}
              onSelectUser={handleUserSelect}
              onLogout={handleLogout}
              apiBase={API_BASE}
            />
          </ProtectedRoute>
        } 
      />

      {/* Chat Route */}
      <Route 
        path="/chat/:userId" 
        element={
          <ProtectedRoute currentUser={currentUser}>
            <ChatBox 
              currentUser={currentUser}
              selectedUser={selectedUser}
              onBack={handleBackToUserList}
              apiBase={API_BASE}
            />
          </ProtectedRoute>
        } 
      />

      {/* Default Route */}
      <Route 
        path="/" 
        element={
          currentUser ? (
            <Navigate to="/users" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />

      {/* 404 Route */}
      <Route 
        path="*" 
        element={
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">404 - Page Not Found</h1>
              <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
              <button 
                onClick={() => navigate(currentUser ? '/users' : '/login')}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Go {currentUser ? 'to Users' : 'to Login'}
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