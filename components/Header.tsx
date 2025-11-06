import React from 'react';

interface HeaderProps {
  onMenuClick?: () => void;
}

const HamburgerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);


const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const hasSession = !!onMenuClick;

  return (
    <header className="relative z-10 p-4 shrink-0 border-b-2 border-white" style={{ backgroundColor: 'rgba(20, 20, 20, 0.6)', backdropFilter: 'blur(10px)'}}>
      <div className={`container mx-auto flex items-center ${hasSession ? 'justify-between md:justify-center' : 'justify-center'}`}>
        {/* Hamburger Menu - only on mobile with session */}
        {hasSession && (
          <button onClick={onMenuClick} className="md:hidden p-2 text-white">
            <HamburgerIcon />
          </button>
        )}
        
        <h1 
          className="text-3xl text-white uppercase tracking-widest" 
          style={{ fontFamily: 'var(--font-header)' }}
        >
          Quester
        </h1>
        
        {/* Spacer for mobile view to center the title */}
         {hasSession && (
            <div className="md:hidden w-8 h-8"></div>
         )}
      </div>
    </header>
  );
};

export default Header;