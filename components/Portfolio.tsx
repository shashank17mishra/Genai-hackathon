import React from 'react';
import type { Skill, Project } from '../types';

interface PortfolioProps {
  skills: Skill[];
  projects: Project[];
}

const Portfolio: React.FC<PortfolioProps> = ({ skills, projects }) => {
    const unlockedSkills = skills.filter(s => s.status !== 'locked');

    const GameHeader: React.FC<{children: React.ReactNode}> = ({children}) => (
        <h3 className="text-3xl uppercase tracking-wider" style={{ fontFamily: 'var(--font-header)' }}>
            {children}
        </h3>
    );

  return (
    <div className="h-full flex flex-col gap-6">
      <GameHeader>Portfolio</GameHeader>

      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
        <div className="neo-panel flex flex-col">
          <h4 className="text-xl border-b-2 border-white pb-2 uppercase" style={{color: 'var(--primary-color)', fontFamily: 'var(--font-header)'}}>Unlocked Skills ({unlockedSkills.length})</h4>
          {unlockedSkills.length > 0 ? (
            <ul className="space-y-2 pt-3 flex-grow overflow-y-auto pr-2" style={{fontFamily: 'var(--font-body)'}}>
                {unlockedSkills.map(skill => (
                    <li key={skill.id} className="p-2 border-2 border-white bg-black/40">{skill.name}</li>
                ))}
            </ul>
          ) : (
            <p className="text-sm mt-2 opacity-70">No skills unlocked yet. Complete quests to grow!</p>
          )}
        </div>
        <div className="neo-panel flex flex-col">
          <h4 className="text-xl border-b-2 border-white pb-2 uppercase" style={{color: 'var(--secondary-color)', fontFamily: 'var(--font-header)'}}>Created Projects ({projects.length})</h4>
           {projects.length > 0 ? (
            <ul className="space-y-2 pt-3 flex-grow overflow-y-auto pr-2" style={{fontFamily: 'var(--font-body)'}}>
                {projects.map(project => (
                    <li key={project.id} className="p-2 border-2 border-white bg-black/40">{project.idea}</li>
                ))}
            </ul>
          ) : (
            <p className="text-sm mt-2 opacity-70">No projects created yet. Visit the Playground!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
