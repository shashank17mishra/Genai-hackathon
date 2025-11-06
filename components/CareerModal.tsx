import React, { useState } from 'react';
import type { CognitiveProfile, Skill } from '../types';
import { generateCareerSkillTree } from '../services/geminiService';

interface CareerModalProps {
  profile: CognitiveProfile;
  onClose: () => void;
  onTreeGenerated: (newSkills: Skill[]) => void;
}

const presetPaths = ["Web Developer", "Data Scientist", "UX/UI Designer", "Game Developer", "AI Specialist"];

const CareerModal: React.FC<CareerModalProps> = ({ profile, onClose, onTreeGenerated }) => {
  const [customPath, setCustomPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (path: string) => {
    if (!path.trim()) {
      setError('Please select or enter a career path.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const newSkills = await generateCareerSkillTree(path, profile);
      onTreeGenerated(newSkills);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to generate skill tree. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleGenerate(customPath);
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="neo-panel w-full max-w-2xl" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-3xl uppercase" style={{ fontFamily: 'var(--font-header)', color: 'var(--primary-color)' }}>Chart a New Path</h2>
          <button onClick={onClose} className="text-3xl font-bold hover:text-red-500">&times;</button>
        </div>
        
        <p className="mb-6" style={{fontFamily: 'var(--font-body)'}}>Select a career path to generate a personalized skill map. This will replace your current skill tree.</p>
        
        {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[200px]">
                <p className="text-2xl animate-pulse" style={{fontFamily: 'var(--font-body)'}}>GENERATING NEW QUEST MAP...</p>
            </div>
        ) : (
            <>
                <div className="mb-4">
                    <label className="block text-xl font-bold mb-3 uppercase" style={{color: 'var(--secondary-color)', fontFamily: 'var(--font-header)'}}>Choose a preset path</label>
                    <div className="flex flex-wrap gap-3">
                        {presetPaths.map(path => (
                            <button
                                key={path}
                                onClick={() => handleGenerate(path)}
                                className="neo-button bg-transparent hover:bg-white/20 text-white"
                            >
                                {path}
                            </button>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 border-t-2 border-white pt-6">
                    <label htmlFor="customPath" className="block text-xl font-bold mb-3 uppercase" style={{color: 'var(--secondary-color)', fontFamily: 'var(--font-header)'}}>Or define your own</label>
                    <div className="flex gap-4">
                        <input
                            id="customPath"
                            type="text"
                            value={customPath}
                            onChange={(e) => setCustomPath(e.target.value)}
                            placeholder="e.g., Quantum Physicist..."
                            className="neo-input flex-grow"
                        />
                        <button
                            type="submit"
                            className="neo-button"
                        >
                            Generate
                        </button>
                    </div>
                </form>

                {error && <p className="text-red-500 font-bold mt-4 text-center">{error}</p>}
            </>
        )}
      </div>
    </div>
  );
};

export default CareerModal;
