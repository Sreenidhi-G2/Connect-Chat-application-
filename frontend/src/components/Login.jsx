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
          client_id:  '646414565186-r4d29tbo24ob7sosi91lpsu5m9ulnm7t.apps.googleusercontent.com',
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
      const backendResponse = await fetch('http://localhost:5000/api/google-signin', {
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
        
        // Store JWT token in localStorage (or wherever you prefer)
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/20">
        <div className="space-y-6">
          <div className="text-center">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <MessageCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-3">Welcome to Connect</h1>
            <p className="text-gray-600 text-lg">Sign in with your Google account to continue</p>
          </div>

          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center animate-pulse">
                <X className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                <span className="text-red-700 font-medium">{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-green-700 font-medium">{success}</span>
              </div>
            )}

            {loading && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex items-center">
                <Loader2 className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0 animate-spin" />
                <span className="text-blue-700 font-medium">Signing you in...</span>
              </div>
            )}

            <div className="space-y-4">
              <div 
                id="google-signin-button" 
                className={`transition-opacity duration-300 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
              ></div>
              
              {/* Fallback button if Google button doesn't load */}
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Secure sign-in powered by Google
                </p>
                <div className="flex items-center justify-center mt-2">
                  <Shield className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-xs text-green-600 font-medium">Protected by Google Security</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;