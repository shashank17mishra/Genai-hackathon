import React from 'react';

const CognitiveCoreAsset: React.FC = () => {
  return (
    <div className="w-48 h-48 relative animate-glow">
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Main brain shape with pulsing animation */}
        <path
          d="M100 20 C 50 20, 20 60, 20 100 C 20 140, 50 180, 100 180 C 150 180, 180 140, 180 100 C 180 60, 150 20, 100 20 Z M100 30 C 145 30, 170 65, 170 100 C 170 135, 145 170, 100 170 C 55 170, 30 135, 30 100 C 30 65, 55 30, 100 30 Z"
          fill="none"
          stroke="var(--accent2-color)"
          strokeWidth="3"
          className="animate-pulse-slow"
        />
        {/* Inner core */}
        <circle cx="100" cy="100" r="15" fill="var(--accent1-color)" className="animate-pulse-slow" style={{ animationDelay: '0.5s' }} />
        
        {/* Data flow lines */}
        <path
          d="M 60 50 Q 80 80 100 100 T 140 150"
          fill="none"
          stroke="var(--accent1-color)"
          strokeWidth="1.5"
          className="animate-data-flow"
        />
        <path
          d="M 140 50 Q 120 80 100 100 T 60 150"
          fill="none"
          stroke="var(--accent1-color)"
          strokeWidth="1.5"
          className="animate-data-flow"
          style={{ animationDirection: 'reverse', animationDelay: '0.8s' }}
        />
         <path
          d="M 50 140 Q 80 120 100 100 T 150 60"
          fill="none"
          stroke="var(--accent2-color)"
          strokeWidth="1.5"
          className="animate-data-flow"
           style={{ animationDelay: '1.2s' }}
        />
      </svg>
    </div>
  );
};

export default CognitiveCoreAsset;