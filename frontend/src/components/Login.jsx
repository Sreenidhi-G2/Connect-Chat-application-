import React, { useState, useCallback, useMemo } from 'react';
import { Phone, MessageCircle, Check, X, Loader2, Shield, ArrowRight, UserPlus, User } from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
  const [currentStep, setCurrentStep] = useState('phone'); // 'phone' or 'otp'
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [username, setUsername] = useState('');
  const [userExists, setUserExists] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState('');

  const API_BASE = useMemo(() => 'http://localhost:5000/api', []);

  const handleSendOtp = useCallback(async () => {
    if (!mobileNumber || mobileNumber.length < 10) {
      setError('Please enter a valid mobile number');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE}/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: mobileNumber }),
      });

      const data = await response.json();

      if (response.ok) {
        setUserExists(data.userExists || false);
        setWelcomeMessage(data.data?.welcomeMessage || '');
        if (data.userExists) {
          setSuccess(data.data?.welcomeMessage || 'Welcome back! OTP sent successfully to your mobile!');
        } else {
          setSuccess('OTP sent successfully to your mobile!');
        }
        setCurrentStep('otp');
      } else {
        setError(data.error || data.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [mobileNumber, API_BASE]);

  const handleVerifyOtp = useCallback(async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    if (!userExists && (!username || username.trim().length < 2)) {
      setError('Please enter a valid username');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const requestBody = { 
        phoneNumber: mobileNumber,
        otp
      };

      // Only include username if user doesn't exist
      if (!userExists) {
        requestBody.username = username.trim();
      }

      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          onLoginSuccess(data.data.user);
        }, 1000);
      } else {
        setError(data.error || data.message || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [otp, username, mobileNumber, API_BASE, onLoginSuccess, userExists]);

  const handleKeyPress = useCallback((e, action) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  }, []);

  const handleMobileChange = useCallback((e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setMobileNumber(value);
    }
  }, []);

  const handleOtpChange = useCallback((e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 6) {
      setOtp(value);
    }
  }, []);

  const handleUsernameChange = useCallback((e) => {
    setUsername(e.target.value);
  }, []);

  const handleBackToPhone = useCallback(() => {
    setCurrentStep('phone');
    setOtp('');
    setUsername('');
    setError('');
    setSuccess('');
    setUserExists(false);
    setWelcomeMessage('');
  }, []);

  // Memoized components to prevent unnecessary re-renders
  const PhoneStep = useMemo(() => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <MessageCircle className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-3">Welcome to Connect</h1>
        <p className="text-gray-600 text-lg">Enter your mobile number to get started</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Mobile Number
          </label>
          <div className="relative">
            <Phone className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              value={mobileNumber}
              onChange={handleMobileChange}
              onKeyDown={(e) => handleKeyPress(e, handleSendOtp)}
              placeholder="Enter your mobile number"
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-300 text-lg"
              maxLength="10"
              autoComplete="tel"
            />
          </div>
        </div>

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

        <button
          onClick={handleSendOtp}
          disabled={loading || !mobileNumber || mobileNumber.length < 10}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Sending OTP...
            </>
          ) : (
            <>
              Send OTP
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </button>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-500">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  ), [mobileNumber, error, success, loading, handleMobileChange, handleSendOtp, handleKeyPress]);

  const OtpStep = useMemo(() => (
    <div className="space-y-6">
      <div className="text-center">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg ${
          userExists 
            ? 'bg-gradient-to-br from-green-500 to-teal-600' 
            : 'bg-gradient-to-br from-purple-500 to-pink-600'
        }`}>
          {userExists ? (
            <User className="w-10 h-10 text-white" />
          ) : (
            <UserPlus className="w-10 h-10 text-white" />
          )}
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-3">
          {userExists ? 'Welcome Back!' : 'Create Account'}
        </h1>
        <p className="text-gray-600 text-lg mb-2">
          {userExists 
            ? 'Enter the verification code to continue' 
            : 'Choose a username and verify your number'
          }
        </p>
        <p className="text-blue-600 font-semibold text-lg">{mobileNumber}</p>
        {userExists && welcomeMessage && (
          <p className="text-green-600 font-medium text-base mt-2">{welcomeMessage}</p>
        )}
      </div>

      <div className="space-y-4">
        {!userExists && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Choose Username
            </label>
            <div className="relative">
              <UserPlus className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={handleUsernameChange}
                placeholder="Enter your username"
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all duration-300 text-lg"
                autoComplete="username"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Enter Verification Code
          </label>
          <div className="relative">
            <Shield className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={otp}
              onChange={handleOtpChange}
              onKeyDown={(e) => handleKeyPress(e, handleVerifyOtp)}
              placeholder="000000"
              maxLength="6"
              className={`w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 outline-none transition-all duration-300 text-center text-2xl tracking-widest font-mono ${
                userExists 
                  ? 'focus:ring-green-100 focus:border-green-500' 
                  : 'focus:ring-purple-100 focus:border-purple-500'
              }`}
              autoComplete="one-time-code"
            />
          </div>
        </div>

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

        <button
          onClick={handleVerifyOtp}
          disabled={
            loading || 
            !otp || 
            otp.length !== 6 || 
            (!userExists && (!username || username.trim().length < 2))
          }
          className={`w-full text-white py-4 rounded-xl font-semibold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg flex items-center justify-center ${
            userExists
              ? 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              {userExists ? 'Signing In...' : 'Creating Account...'}
            </>
          ) : (
            <>
              {userExists ? 'Sign In' : 'Create Account'}
              <Check className="w-5 h-5 ml-2" />
            </>
          )}
        </button>

        <div className="flex items-center justify-between">
          <button
            onClick={handleBackToPhone}
            className="text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200 flex items-center"
          >
            ← Change Number
          </button>
          <button
            onClick={handleSendOtp}
            disabled={loading}
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
          >
            Resend OTP
          </button>
        </div>
      </div>
    </div>
  ), [
    mobileNumber, 
    username, 
    otp, 
    error, 
    success, 
    loading, 
    userExists, 
    welcomeMessage,
    handleUsernameChange, 
    handleOtpChange, 
    handleVerifyOtp, 
    handleKeyPress, 
    handleBackToPhone, 
    handleSendOtp
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/20">
        {currentStep === 'phone' ? PhoneStep : OtpStep}
      </div>
    </div>
  );
};

export default Login;