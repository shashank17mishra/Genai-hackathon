import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CognitiveProfile } from '../types';

interface NavItemData {
    id: string;
    icon: React.ReactNode;
    label: string;
}

interface MobileNavProps {
    isOpen: boolean;
    onClose: () => void;
    avatarUrl: string;
    profile: CognitiveProfile;
    onSignOut: () => void;
    activeView: string;
    onNavigate: (view: string) => void;
    navItems: NavItemData[];
}

const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose, avatarUrl, profile, onSignOut, activeView, onNavigate, navItems }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    />
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed top-0 left-0 h-full w-4/5 max-w-sm z-50 flex flex-col p-6 border-r-2 border-white md:hidden"
                        style={{ backgroundColor: 'rgba(15, 15, 15, 0.8)', backdropFilter: 'blur(10px)'}}
                    >
                        <div className="mb-8">
                            <h1 className="text-4xl text-white uppercase tracking-widest" style={{ fontFamily: 'var(--font-header)'}}>
                                Quester
                            </h1>
                        </div>

                        <div className="flex-grow space-y-3">
                            {navItems.map(item => (
                                <button 
                                    key={item.id}
                                    onClick={() => onNavigate(item.id)}
                                    className={`w-full flex items-center p-4 text-xl transition-all duration-200 border-2 border-white text-white ${activeView === item.id ? 'bg-[var(--primary-color)] text-black' : 'bg-transparent hover:bg-white/20'}`}
                                >
                                    <div className="w-7 h-7 shrink-0">{item.icon}</div>
                                    <span className="ml-4 font-bold uppercase tracking-wider text-base">{item.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="pt-4 border-t-2 border-white space-y-4">
                            <div className="flex items-center p-2">
                                <img src={avatarUrl} alt="User Avatar" className="w-14 h-14 border-2 border-white" style={{ imageRendering: 'pixelated' }} />
                                <div className="ml-4 overflow-hidden">
                                    <p className="font-bold text-lg truncate" style={{fontFamily: 'var(--font-header)'}}>{profile.name}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => { onSignOut(); onClose(); }}
                                className="w-full flex items-center justify-center p-4 text-xl transition-colors duration-200 border-2 border-white text-white hover:bg-[var(--secondary-color)] hover:text-black"
                            >
                                <span className="font-bold uppercase tracking-wider text-base">Sign Out</span>
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default MobileNav;