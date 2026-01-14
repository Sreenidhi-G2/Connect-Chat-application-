import React, { useState, useRef } from 'react';
import { User, Briefcase, Heart, Sparkles, FileText, Users, Camera, ChevronRight, Check } from 'lucide-react';

const ProfileSetup = ({ onProfileComplete }) => {
  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState({
    name: '',
    profilePicture: null,
    profilePicturePreview: null,
    profession: '',
    hobbies: [],
    interests: [],
    bio: '',
    gender: ''
  });
  const [hobbyInput, setHobbyInput] = useState('');
  const [interestInput, setInterestInput] = useState('');

  const fileInputRef = useRef(null);
  const totalSteps = 4;

  // Predefined options
  const hobbyOptions = [
    'Reading', 'Gaming', 'Cooking', 'Photography', 'Traveling',
    'Music', 'Sports', 'Art', 'Dancing', 'Writing',
    'Gardening', 'Hiking', 'Yoga', 'Movies', 'Fitness'
  ];

  const interestOptions = [
    'Technology', 'Science', 'Fashion', 'Food', 'Nature',
    'History', 'Politics', 'Philosophy', 'Psychology', 'Business',
    'Health', 'Finance', 'Education', 'Environment', 'Entertainment'
  ];

  const genderOptions = ['Male', 'Female', 'Prefer not to say'];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({
          ...profileData,
          profilePicture: file,
          profilePicturePreview: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSelection = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const addCustomItem = (field, value, setInput) => {
    const trimmedValue = value.trim();
    if (trimmedValue && !profileData[field].includes(trimmedValue)) {
      setProfileData(prev => ({
        ...prev,
        [field]: [...prev[field], trimmedValue]
      }));
      setInput('');
    }
  };

  const removeItem = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: prev[field].filter(item => item !== value)
    }));
  };

  const handleKeyPress = (e, field, value, setInput) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomItem(field, value, setInput);
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    // Validate all fields are filled
    if (profileData.name && profileData.profession && profileData.hobbies.length > 0 && 
        profileData.interests.length > 0 && profileData.bio && profileData.gender) {
      onProfileComplete(profileData);
    }
  };

  const isStepValid = () => {
    switch(step) {
      case 1:
        return profileData.name.trim() !== '' && profileData.gender !== '';
      case 2:
        return profileData.profession.trim() !== '';
      case 3:
        return profileData.hobbies.length > 0 && profileData.interests.length > 0;
      case 4:
        return profileData.bio.trim() !== '';
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Animated background blobs */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-pink-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg mb-4">
        
            <span className="text-xl font-bold text-gray-800">Create Your Profile</span>
          </div>
          <p className="text-gray-600 text-lg">Let's get to know you better!</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                  step >= num ? 'bg-blue-500 text-white scale-110' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > num ? <Check className="w-5 h-5" /> : num}
                </div>
                {num < 4 && (
                  <div className={`flex-1 h-1 mx-2 rounded transition-all duration-300 ${
                    step > num ? 'bg-blue-500' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 px-2">
            <span>Basic Info</span>
            <span>Profession</span>
            <span>Interests</span>
            <span>About You</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 border border-gray-100">
          
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6 animate-slide-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <User className="w-6 h-6 text-blue-500" />
                Basic Information
              </h2>

              {/* Profile Picture */}
              <div className="flex flex-col items-center mb-6">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center cursor-pointer group hover:scale-105 transition-transform duration-300 overflow-hidden"
                >
                  {profileData.profilePicturePreview ? (
                    <img src={profileData.profilePicturePreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-12 h-12 text-blue-500 group-hover:scale-110 transition-transform" />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all rounded-full flex items-center justify-center">
                    <Camera className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <p className="text-sm text-gray-500 mt-2">Click to upload profile picture</p>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Gender *</label>
                <div className="grid grid-cols-3 gap-3">
                  {genderOptions.map((gender) => (
                    <button
                      key={gender}
                      type="button"
                      onClick={() => setProfileData({ ...profileData, gender })}
                      className={`px-4 py-3 rounded-xl border-2 font-medium transition-all duration-300 ${
                        profileData.gender === gender
                          ? 'border-blue-500 bg-blue-50 text-blue-700 scale-105'
                          : 'border-gray-200 text-gray-700 hover:border-blue-300'
                      }`}
                    >
                      {gender}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Profession */}
          {step === 2 && (
            <div className="space-y-6 animate-slide-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-blue-500" />
                Your Profession
              </h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">What do you do? *</label>
                <input
                  type="text"
                  value={profileData.profession}
                  onChange={(e) => setProfileData({ ...profileData, profession: e.target.value })}
                  placeholder="e.g., Software Engineer, Teacher, Student"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-700">
                  💡 <strong>Tip:</strong> Your profession helps us connect you with like-minded professionals!
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Hobbies & Interests */}
          {step === 3 && (
            <div className="space-y-6 animate-slide-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Heart className="w-6 h-6 text-blue-500" />
                Hobbies & Interests
              </h2>

              {/* Hobbies */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select your hobbies * <span className="text-gray-500 font-normal">({profileData.hobbies.length} selected)</span>
                </label>
                
                {/* Custom input for hobbies */}
                <div className="mb-3 flex gap-2">
                  <input
                    type="text"
                    value={hobbyInput}
                    onChange={(e) => setHobbyInput(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, 'hobbies', hobbyInput, setHobbyInput)}
                    placeholder="Type your own hobby and press Enter"
                    className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => addCustomItem('hobbies', hobbyInput, setHobbyInput)}
                    className="px-6 py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
                  >
                    Add
                  </button>
                </div>

                {/* Selected hobbies */}
                {profileData.hobbies.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {profileData.hobbies.map((hobby) => (
                      <div
                        key={hobby}
                        className="px-4 py-2 bg-blue-500 text-white rounded-full font-medium flex items-center gap-2 shadow-md"
                      >
                        {hobby}
                        <button
                          onClick={() => removeItem('hobbies', hobby)}
                          className="hover:bg-blue-600 rounded-full p-0.5 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-xs text-gray-500 mb-2">Or select from suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {hobbyOptions.map((hobby) => (
                    <button
                      key={hobby}
                      type="button"
                      onClick={() => toggleSelection('hobbies', hobby)}
                      className={`px-4 py-2 rounded-full border-2 font-medium transition-all duration-300 transform ${
                        profileData.hobbies.includes(hobby)
                          ? 'border-blue-500 bg-blue-500 text-white scale-105 shadow-lg'
                          : 'border-gray-200 text-gray-700 hover:border-blue-300 hover:scale-105'
                      }`}
                    >
                      {hobby}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select your interests * <span className="text-gray-500 font-normal">({profileData.interests.length} selected)</span>
                </label>
                
                {/* Custom input for interests */}
                <div className="mb-3 flex gap-2">
                  <input
                    type="text"
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, 'interests', interestInput, setInterestInput)}
                    placeholder="Type your own interest and press Enter"
                    className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => addCustomItem('interests', interestInput, setInterestInput)}
                    className="px-6 py-2 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors"
                  >
                    Add
                  </button>
                </div>

                {/* Selected interests */}
                {profileData.interests.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {profileData.interests.map((interest) => (
                      <div
                        key={interest}
                        className="px-4 py-2 bg-purple-500 text-white rounded-full font-medium flex items-center gap-2 shadow-md"
                      >
                        {interest}
                        <button
                          onClick={() => removeItem('interests', interest)}
                          className="hover:bg-purple-600 rounded-full p-0.5 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-xs text-gray-500 mb-2">Or select from suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {interestOptions.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleSelection('interests', interest)}
                      className={`px-4 py-2 rounded-full border-2 font-medium transition-all duration-300 transform ${
                        profileData.interests.includes(interest)
                          ? 'border-purple-500 bg-purple-500 text-white scale-105 shadow-lg'
                          : 'border-gray-200 text-gray-700 hover:border-purple-300 hover:scale-105'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Bio */}
          {step === 4 && (
            <div className="space-y-6 animate-slide-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-500" />
                Tell Us About Yourself
              </h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bio * <span className="text-gray-500 font-normal">({profileData.bio.length}/500)</span>
                </label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value.slice(0, 500) })}
                  placeholder="Share a bit about yourself, what you're looking for in connections, or what makes you unique..."
                  rows="6"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4">
                <p className="text-sm text-gray-700">
                <strong>Almost there!</strong> Your bio is your chance to shine and attract friends who share your vibe.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 transition-all"
              >
                Back
              </button>
            )}
            
            {step < totalSteps ? (
              <button
                onClick={handleNext}
                disabled={!isStepValid()}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                  isStepValid()
                    ? 'bg-blue-500 text-white hover:bg-blue-600 hover:scale-105 shadow-lg'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Next <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!isStepValid()}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                  isStepValid()
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 hover:scale-105 shadow-lg'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Complete Profile <Check className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-slide-in {
          animation: slide-in 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProfileSetup;