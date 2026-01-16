import React, { useState, useCallback, useEffect } from 'react';
import { MessageCircle, Loader2, Check, X, Shield } from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Initialize Google Sign-In
  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: '646414565186-r4d29tbo24ob7sosi91lpsu5m9ulnm7t.apps.googleusercontent.com',
          callback: handleGoogleSignIn,
          auto_select: false,
          cancel_on_tap_outside: false,
        });

        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
          }
        );
      }
    };

    // Load Google Sign-In script
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      document.head.appendChild(script);
    } else {
      initializeGoogleSignIn();
    }
  }, []);

  const handleGoogleSignIn = useCallback(async (response) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Send the Google ID token to your backend
      const backendResponse = await fetch('http://localhost:8000/api/google-signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: response.credential,
        }),
      });

      const data = await backendResponse.json();

      if (backendResponse.ok) {
        setSuccess('Login successful! Redirecting...');

        // Store JWT token (Note: In production, consider more secure storage methods)
        // Using in-memory storage for this artifact
        setTimeout(() => {
          onLoginSuccess(data.user, data.token);
        }, 1000);
      } else {
        setError(data.error || data.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [onLoginSuccess]);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Subtle animated shapes */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-pink-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Main container */}
      <div className="relative z-10 w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        
        {/* Left side - Welcome message */}
        <div className="text-center md:text-left space-y-6 p-8">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
            <MessageCircle className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-bold text-gray-800">Connect</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 leading-tight">
            Find friends who share your 
            <span className="text-blue-500"> interests</span>
          </h1>
          
          <p className="text-xl text-gray-600 leading-relaxed">
            Meet new people, discover shared hobbies, and have genuine conversations. Your next great friendship starts here.
          </p>

          {/* Feature highlights */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl"></span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Match by Interests</h3>
                <p className="text-sm text-gray-600">Connect with people who love what you love</p>
              </div>
            </div>    
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl"></span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Start Conversations</h3>
                <p className="text-sm text-gray-600">Send requests and chat with new friends</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                <span className="text-2xl"></span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Genuine Connections</h3>
                <p className="text-sm text-gray-600">Build real friendships, one chat at a time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 border border-gray-100">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Welcome Back!
              </h2>
              <p className="text-gray-600">Sign in to continue your journey</p>
            </div>

            <div className="space-y-4">
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center animate-shake">
                  <X className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                  <span className="text-red-700 font-medium">{error}</span>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center animate-bounce-in">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-green-700 font-medium">{success}</span>
                </div>
              )}

              {loading && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4 flex items-center">
                  <Loader2 className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 animate-spin" />
                  <span className="text-blue-700 font-medium">Signing you in...</span>
                </div>
              )}

              <div className="space-y-4">
                <div
                  id="google-signin-button"
                  className={`transition-all duration-300 ${loading ? 'opacity-50 pointer-events-none scale-95' : 'opacity-100 scale-100'}`}
                ></div>

                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Secure sign-in with Google</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                By continuing, you agree to our{' '}
                <span className="text-blue-600 hover:underline cursor-pointer">Terms</span>
                {' '}and{' '}
                <span className="text-blue-600 hover:underline cursor-pointer">Privacy Policy</span>
              </p>
            </div>
          </div>
        </div>
        
      </div>

      {/* CSS Animations */}
      
    </div>
  );
};

export default Login;