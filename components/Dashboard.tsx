import React from 'react';
import type { CognitiveProfile } from '../types';
import { motion } from 'framer-motion';

interface DashboardProps {
  profile: CognitiveProfile;
  avatarUrl: string;
  onCustomizeClick: () => void;
}

const BentoBox: React.FC<{children: React.ReactNode, className?: string, title?: string}> = ({children, className, title}) => (
    <div className={`neo-panel flex flex-col ${className}`}>
        {title && <h3 className="text-xl uppercase mb-2" style={{ fontFamily: 'var(--font-header)'}}>{title}</h3>}
        <div className="flex-grow">{children}</div>
    </div>
);


const Dashboard: React.FC<DashboardProps> = ({ profile, avatarUrl, onCustomizeClick }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 h-full">
      {/* Avatar Panel (Large) */}
      <BentoBox className="lg:col-span-2 md:row-span-2 relative group p-0 overflow-hidden">
         <img 
              src={avatarUrl} 
              alt="User Avatar" 
              className="w-full h-full object-cover"
              style={{ imageRendering: 'pixelated' }}
            />
        <button 
          onClick={onCustomizeClick}
          className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xl neo-button"
        >
          CUSTOMIZE
        </button>
      </BentoBox>

      {/* Focus Panel */}
      <BentoBox className="lg:col-span-2" title={`Welcome, ${profile.name}!`}>
        <h2 className="text-3xl md:text-4xl" style={{ fontFamily: 'var(--font-header)', color: 'var(--secondary-color)' }}>{profile.focus}</h2>
      </BentoBox>

      {/* Dream Panel */}
      <BentoBox className="lg:col-span-2" title="Your Quest">
        <p className="text-lg" style={{fontFamily: 'var(--font-body)'}}>{profile.dream}</p>
      </BentoBox>

      {/* Strengths */}
      <BentoBox title="Strengths">
          <div className="flex flex-wrap gap-2">
            {(profile.strengths || []).map(s => <span key={s} className="bg-[var(--primary-color)] text-black text-sm font-bold px-2 py-1 border-2 border-white">{s}</span>)}
          </div>
      </BentoBox>

       {/* Weaknesses */}
      <BentoBox title="Growth Areas">
           <div className="flex flex-wrap gap-2">
            {(profile.weaknesses || []).map(w => <span key={w} className="bg-[var(--secondary-color)] text-black text-sm font-bold px-2 py-1 border-2 border-white">{w}</span>)}
          </div>
      </BentoBox>

      {/* Learning Style */}
       <BentoBox title="Learning Style" className="lg:col-span-2">
            <p className="text-2xl" style={{fontFamily: 'var(--font-body)'}}>{profile.learningStyle}</p>
      </BentoBox>
    </div>
  );
};

export default Dashboard;