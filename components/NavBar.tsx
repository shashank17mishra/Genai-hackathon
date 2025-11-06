import React from 'react';
import type { CognitiveProfile } from '../types';

interface NavItemData {
    id: string;
    icon: React.ReactNode;
    label: string;
}

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active = false, onClick }) => (
    <button onClick={onClick} className={`w-full flex items-center p-4 transition-all duration-200 justify-start text-white border-2 ${active ? 'bg-[var(--primary-color)] text-black border-white' : 'border-transparent hover:bg-white/20'}`}>
        <div className="w-8 h-8 shrink-0">{icon}</div>
        <span className="ml-4 font-bold whitespace-nowrap uppercase text-sm tracking-wider">{label}</span>
    </button>
);

interface NavBarProps {
    avatarUrl: string;
    profile: CognitiveProfile;
    onSignOut: () => void;
    activeView: string;
    onNavigate: (view: string) => void;
    navItems: NavItemData[];
}

const NavBar: React.FC<NavBarProps> = ({ avatarUrl, profile, onSignOut, activeView, onNavigate, navItems }) => {
    
    return (
        <nav 
            className="hidden md:flex flex-col h-full border-r-2 border-white p-3 space-y-4 shrink-0 w-64 z-20"
            style={{ backgroundColor: 'rgba(20, 20, 20, 0.6)', backdropFilter: 'blur(10px)'}}
        >
            <div className="relative flex h-14 items-center justify-center overflow-hidden border-2 border-white p-2">
                <h1 className="text-2xl text-white uppercase tracking-widest" style={{ fontFamily: 'var(--font-header)'}}>Quester</h1>
            </div>

            <div className="flex-grow space-y-2">
                {navItems.map(item => (
                    <NavItem 
                        key={item.id}
                        icon={item.icon}
                        label={item.label}
                        active={activeView === item.id} 
                        onClick={() => onNavigate(item.id)}
                    />
                ))}
            </div>

            <div className="pt-4 border-t-2 border-white">
                 <div className="flex items-center p-2 mb-2">
                    <img src={avatarUrl} alt="User Avatar" className="w-12 h-12 border-2 border-white shrink-0" style={{ imageRendering: 'pixelated' }} />
                    <div className="ml-3 overflow-hidden">
                        <p className="font-bold text-base truncate" style={{fontFamily: 'var(--font-header)'}}>{profile.name}</p>
                    </div>
                </div>
                 <button
                    onClick={onSignOut}
                    className="w-full mt-2 flex items-center justify-center p-4 transition-colors duration-200 text-white hover:bg-[var(--secondary-color)] hover:text-black"
                >
                    <span className="font-bold whitespace-nowrap uppercase text-sm tracking-wider">Sign Out</span>
                </button>
            </div>
        </nav>
    );
};

export default NavBar;