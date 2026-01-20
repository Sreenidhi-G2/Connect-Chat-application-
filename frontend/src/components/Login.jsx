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
        // Using localStorage for this artifact
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        localStorage.setItem('authToken', data.token);

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
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50">
      {/* Subtle animated shapes - Mint Fresh colors */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-teal-200/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-cyan-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-emerald-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Main container */}
      <div className="relative z-10 w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        
        {/* Left side - Welcome message */}
        <div className="text-center md:text-left space-y-6 p-8">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-teal-100">
            <MessageCircle className="w-8 h-8 text-teal-500" />
            <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Connect</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-teal-900 leading-tight">
            Find friends who share your 
            <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent"> interests</span>
          </h1>
          
          <p className="text-xl text-teal-700 leading-relaxed">
            Meet new people, discover shared hobbies, and have genuine conversations. Your next great friendship starts here.
          </p>

          {/* Feature highlights */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-teal-100 hover:border-teal-300 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <h3 className="font-semibold text-teal-900">Match by Interests</h3>
                <p className="text-sm text-teal-600">Connect with people who love what you love</p>
              </div>
            </div>    
            
            <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-cyan-100 hover:border-cyan-300 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
              <div>
                <h3 className="font-semibold text-teal-900">Start Conversations</h3>
                <p className="text-sm text-teal-600">Send requests and chat with new friends</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-emerald-100 hover:border-emerald-300 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✨</span>
              </div>
              <div>
                <h3 className="font-semibold text-teal-900">Genuine Connections</h3>
                <p className="text-sm text-teal-600">Build real friendships, one chat at a time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login card */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-8 md:p-10 border border-teal-100">
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl mb-4 shadow-lg">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-teal-900 mb-2">
                Welcome Back!
              </h2>
              <p className="text-teal-600">Sign in to continue your journey</p>
            </div>

            <div className="space-y-4">
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center animate-shake">
                  <X className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                  <span className="text-red-700 font-medium">{error}</span>
                </div>
              )}

              {success && (
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 flex items-center animate-bounce-in">
                  <Check className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                  <span className="text-emerald-700 font-medium">{success}</span>
                </div>
              )}

              {loading && (
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-xl p-4 flex items-center">
                  <Loader2 className="w-5 h-5 text-teal-600 mr-3 flex-shrink-0 animate-spin" />
                  <span className="text-teal-700 font-medium">Signing you in...</span>
                </div>
              )}

              <div className="space-y-4">
                <div
                  id="google-signin-button"
                  className={`transition-all duration-300 ${loading ? 'opacity-50 pointer-events-none scale-95' : 'opacity-100 scale-100'}`}
                ></div>

                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-teal-600">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm">Secure sign-in with Google</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center pt-4 border-t border-teal-100">
              <p className="text-xs text-teal-600">
                By continuing, you agree to our{' '}
                <span className="text-teal-700 font-medium hover:underline cursor-pointer">Terms</span>
                {' '}and{' '}
                <span className="text-teal-700 font-medium hover:underline cursor-pointer">Privacy Policy</span>
              </p>
            </div>
          </div>
        </div>
        
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        @keyframes bounce-in {
          0% { transform: scale(0.9); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }

        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }

        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Login;