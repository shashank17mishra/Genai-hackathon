import React, { useState } from 'react';
import type { CognitiveProfile } from '../types';
import { generateImprovementSuggestions } from '../services/geminiService';

const FuturisticBrainAsset = () => (
    <svg viewBox="0 0 100 100" className="w-48 h-48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 15 C 25 15, 15 35, 15 50 C 15 65, 25 85, 50 85 C 75 85, 85 65, 85 50 C 85 35, 75 15, 50 15 Z" stroke="var(--primary-color)" strokeWidth="3" className="opacity-50" />
        <path d="M50 20 C 30 20, 20 40, 20 50 C 20 60, 30 80, 50 80 C 70 80, 80 60, 80 50 C 80 40, 70 20, 50 20 Z" stroke="var(--primary-color)" strokeWidth="2" />
        <circle cx="50" cy="50" r="10" stroke="var(--accent-color)" strokeWidth="2" />
        <path d="M50 20 V 80 M 20 50 H 80" stroke="var(--secondary-color)" strokeWidth="1" strokeDasharray="4 4" />
        <circle cx="50" cy="30" r="3" fill="var(--secondary-color)" />
        <circle cx="50" cy="70" r="3" fill="var(--secondary-color)" />
        <circle cx="30" cy="50" r="3" fill="var(--accent-color)" />
        <circle cx="70" cy="50" r="3" fill="var(--accent-color)" />
    </svg>
);


interface CognitiveMirrorProps {
    profile: CognitiveProfile;
}

const CognitiveMirror: React.FC<CognitiveMirrorProps> = ({ profile }) => {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        setLoading(true);
        setError('');
        try {
            const result = await generateImprovementSuggestions(profile);
            setSuggestions(result);
        } catch (err: any) {
            setError(err.message || "Failed to get suggestions. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="neo-panel h-full flex flex-col">
            <h3 className="text-3xl uppercase tracking-wider" style={{ fontFamily: 'var(--font-header)', color: 'var(--secondary-color)' }}>
                Cognitive Core
            </h3>
            
            <div className="flex-grow flex flex-col md:flex-row items-center justify-center gap-8 my-6">
                {/* Brain Image */}
                <div className="relative animate-pulse">
                    <FuturisticBrainAsset />
                </div>

                {/* Profile Summary */}
                <div className="max-w-xl text-center md:text-left">
                    <h2 className="text-4xl" style={{ fontFamily: 'var(--font-header)', color: 'var(--primary-color)' }}>{profile.focus}</h2>
                    <p className="mt-2 text-lg" style={{fontFamily: 'var(--font-body)'}}>{profile.personality}</p>
                </div>
            </div>

            <div className="mt-auto">
                {suggestions.length === 0 && !loading && (
                    <div className="text-center">
                         <button
                            onClick={handleGenerate}
                            className="neo-button"
                        >
                            Scan for Insights
                        </button>
                    </div>
                )}
                 {loading && (
                    <div className="flex items-center justify-center">
                        <p className="text-xl animate-pulse" style={{fontFamily: 'var(--font-body)'}}>SCANNING...</p>
                    </div>
                )}

                {error && <p className="text-red-500 font-bold text-center mt-4">{error}</p>}
                
                {suggestions.length > 0 && !loading && (
                    <div className="space-y-3">
                        <h4 className="text-2xl font-bold text-center mb-4 uppercase" style={{ fontFamily: 'var(--font-header)' }}>Actionable Insights</h4>
                        {suggestions.map((suggestion, index) => (
                            <div key={index} className="bg-black/40 p-4 border-2 border-l-4 border-white">
                               <p style={{fontFamily: 'var(--font-body)'}}>{suggestion}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
export default CognitiveMirror;
