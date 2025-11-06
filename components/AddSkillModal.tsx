import React, { useState } from 'react';
import type { CognitiveProfile, Skill } from '../types';
import { generateCustomSkill } from '../services/geminiService';

interface AddSkillModalProps {
  profile: CognitiveProfile;
  skills: Skill[];
  onClose: () => void;
  onSkillAdd: (newSkill: Skill) => void;
}

const AddSkillModal: React.FC<AddSkillModalProps> = ({ profile, skills, onClose, onSkillAdd }) => {
  const [skillName, setSkillName] = useState('');
  const [dependencies, setDependencies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const unlockedSkills = skills.filter(s => s.status !== 'locked');

  const handleDependencyChange = (skillId: string) => {
    setDependencies(prev => 
      prev.includes(skillId) ? prev.filter(id => id !== skillId) : [...prev, skillId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) {
      setError('Please enter a skill or career path name.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const newSkill = await generateCustomSkill(skillName, profile, dependencies);
      onSkillAdd(newSkill);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create skill. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="neo-panel w-full max-w-lg" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-3xl uppercase" style={{ fontFamily: 'var(--font-header)', color: 'var(--primary-color)' }}>Add Skill Path</h2>
          <button onClick={onClose} className="text-3xl font-bold hover:text-red-500">&times;</button>
        </div>
        
        <p className="mb-6" style={{fontFamily: 'var(--font-body)'}}>Define a new skill you want to learn. Our AI will create a starting point for your new quest.</p>
        
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="skillName" className="block text-xl font-bold mb-2 uppercase" style={{color: 'var(--secondary-color)', fontFamily: 'var(--font-header)'}}>Skill Name</label>
            <input
              id="skillName"
              type="text"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              placeholder="e.g., Creative Writing..."
              className="neo-input"
              disabled={loading}
            />
          </div>

          <div className="mt-4">
              <label className="block text-xl font-bold mb-2 uppercase" style={{color: 'var(--secondary-color)', fontFamily: 'var(--font-header)'}}>Dependencies</label>
              <div className="max-h-32 overflow-y-auto bg-black/40 p-2 border-2 border-white space-y-1">
                  {unlockedSkills.length > 0 ? unlockedSkills.map(skill => (
                      <div key={skill.id} className="flex items-center p-1">
                          <input 
                              type="checkbox"
                              id={`dep-${skill.id}`}
                              checked={dependencies.includes(skill.id)}
                              onChange={() => handleDependencyChange(skill.id)}
                              className="h-5 w-5 shrink-0 accent-[var(--secondary-color)]"
                          />
                          <label htmlFor={`dep-${skill.id}`} className="ml-2 cursor-pointer" style={{fontFamily: 'var(--font-body)'}}>{skill.name}</label>
                      </div>
                  )) : (
                      <p className="text-sm opacity-60 px-2 py-1">This will be a new root skill.</p>
                  )}
              </div>
          </div>

          {error && <p className="text-red-500 font-bold mt-4">{error}</p>}
          <div className="mt-8 text-right">
            <button
              type="submit"
              disabled={loading}
              className="neo-button"
            >
              {loading ? 'Generating...' : 'Create Skill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSkillModal;
