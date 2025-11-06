import React, { useState } from 'react';
import { customizeAvatar } from '../services/geminiService';
import type { CognitiveProfile } from '../types';

interface AvatarCustomizerProps {
    profile: CognitiveProfile;
    currentAvatarUrl: string;
    onClose: () => void;
    onSave: (newAvatarUrl: string) => void;
}

const AvatarCustomizer: React.FC<AvatarCustomizerProps> = ({ profile, currentAvatarUrl, onClose, onSave }) => {
    const [modification, setModification] = useState('');
    const [newAvatar, setNewAvatar] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!modification.trim()) {
            setError('Please enter a modification description.');
            return;
        }
        setLoading(true);
        setError('');
        setNewAvatar(null);
        try {
            const result = await customizeAvatar(profile.avatarDescription, modification);
            setNewAvatar(result);
        } catch (err: any) {
            setError(err.message || 'Failed to generate new avatar. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleSave = () => {
        if (newAvatar) {
            onSave(newAvatar);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="neo-panel w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-start">
                    <h2 className="text-4xl uppercase" style={{ fontFamily: 'var(--font-header)', color: 'var(--primary-color)' }}>Customize Avatar</h2>
                    <button onClick={onClose} className="text-3xl font-bold hover:text-red-500">&times;</button>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    {/* Current Avatar */}
                    <div className="text-center">
                        <h3 className="text-2xl font-bold mb-2 uppercase" style={{color: 'var(--secondary-color)', fontFamily: 'var(--font-header)'}}>Current</h3>
                        <img src={currentAvatarUrl} alt="Current Avatar" className="w-64 h-64 mx-auto border-2 border-white" style={{ imageRendering: 'pixelated' }} />
                    </div>

                    {/* New Avatar */}
                    <div className="text-center">
                        <h3 className="text-2xl font-bold mb-2 uppercase" style={{color: 'var(--secondary-color)', fontFamily: 'var(--font-header)'}}>New Version</h3>
                        <div className="w-64 h-64 mx-auto border-2 border-dashed border-white bg-black/50 flex items-center justify-center">
                            {loading && <div className="text-xl" style={{fontFamily: 'var(--font-body)'}}>GENERATING...</div>}
                            {!loading && newAvatar && <img src={newAvatar} alt="New Avatar" className="w-full h-full border-2 border-white" style={{ imageRendering: 'pixelated' }} />}
                            {!loading && !newAvatar && <p className="text-sm p-4 opacity-70">Your new avatar will appear here.</p>}
                        </div>
                    </div>
                </div>

                <div className="mt-8 border-t-2 border-white pt-6">
                    <label htmlFor="modification" className="block text-lg font-bold mb-2" style={{fontFamily: 'var(--font-header)'}}>Describe your change:</label>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input
                            id="modification"
                            type="text"
                            value={modification}
                            onChange={(e) => setModification(e.target.value)}
                            placeholder="e.g., add a cyberpunk helmet..."
                            className="neo-input flex-grow"
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="neo-button secondary"
                        >
                            {loading ? 'Generating...' : 'Generate'}
                        </button>
                    </div>
                     {error && <p className="text-red-500 font-bold mt-4">{error}</p>}
                </div>

                <div className="mt-8 text-center">
                    <button
                        onClick={handleSave}
                        disabled={!newAvatar || loading}
                        className="neo-button text-xl"
                    >
                        SAVE NEW AVATAR
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AvatarCustomizer;
