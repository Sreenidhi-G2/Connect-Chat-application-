import React, { useEffect, useState } from 'react';

const Popup = () => {
  const [show, setShow] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // Auto-close after 6 seconds
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      // Remove from DOM after animation completes
      setTimeout(() => setShow(false), 300);
    }, 6000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => setShow(false), 300);
  };

  if (!show) return null;

  return (
    <div className={`
      fixed top-6 left-1/2 transform -translate-x-1/2 
      bg-gradient-to-r from-blue-50 to-indigo-50
      border border-blue-200/50
      backdrop-blur-sm
      px-6 py-4 
      rounded-2xl 
      shadow-lg shadow-blue-100/50
      z-50
      max-w-md mx-4
      transition-all duration-300 ease-out
      ${isVisible 
        ? 'opacity-100 translate-y-0 scale-100' 
        : 'opacity-0 -translate-y-4 scale-95'
      }
    `}>
      <div className="flex items-start gap-3">
        {/* Animated Icon */}
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center animate-pulse">
            <svg 
              className="w-3.5 h-3.5 text-white" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path 
                fillRule="evenodd" 
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-slate-800 mb-1">
            Backend Loading Notice
          </div>
          <div className="text-sm text-slate-600 leading-relaxed">
            Our backend is hosted on <span className="font-medium text-blue-700">Render</span>. 
            The first request may take a few seconds. Thank you for your patience! 
          </div>
        </div>
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-blue-100/50 transition-colors duration-200 group"
          aria-label="Close notification"
        >
          <svg 
            className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
        </button>
      </div>
      
      {/* Progress Bar */}
      <div className="mt-3 w-full bg-blue-100/50 rounded-full h-1 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse"
          style={{
            animation: 'progress 6s linear forwards'
          }}
        />
      </div>
      
      <style jsx>{`
        @keyframes progress {
          from { width: 0% }
          to { width: 100% }
        }
      `}</style>    
    </div>
  );
};

export default Popup;