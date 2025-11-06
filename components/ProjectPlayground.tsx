import React, { useState } from 'react';
import type { CognitiveProfile, Skill, Project } from '../types';
import ProjectGenesisModal from './ProjectGenesisModal';
import { motion } from 'framer-motion';

interface ProjectPlaygroundProps {
    profile: CognitiveProfile;
    skills: Skill[];
    projects: Project[];
    onProjectCreated: (project: Project) => void;
    onAddSkills: (skills: Skill[]) => void;
}

const ProjectCard: React.FC<{project: Project, onClick: () => void}> = ({ project, onClick }) => (
    <motion.div
        onClick={onClick}
        className="neo-panel cursor-pointer hover:bg-black/40"
        whileHover={{ y: -5, x: -5 }}
    >
        <h4 className="text-lg truncate" style={{ fontFamily: 'var(--font-header)', color: 'var(--secondary-color)' }}>{project.idea}</h4>
        <p className="text-sm mt-1 truncate" style={{fontFamily: 'var(--font-body)'}}>"{project.angle}"</p>
        <div className="flex justify-between items-center mt-3 text-xs">
            <span>{(project.roadmap || []).length} Phases</span>
            <span>{(project.blueprint?.requiredSkills || []).length} Skills Required</span>
        </div>
    </motion.div>
);

const ProjectDetailView: React.FC<{project: Project, onClose: () => void}> = ({ project, onClose }) => {
    return (
        <div className="neo-panel h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-3xl uppercase tracking-wider" style={{ fontFamily: 'var(--font-header)', color: 'var(--secondary-color)' }}>{project.idea}</h3>
                    <p className="italic" style={{fontFamily: 'var(--font-body)'}}>"{project.angle}"</p>
                </div>
                <button onClick={onClose} className="neo-button text-sm">
                    &larr; Back
                </button>
            </div>
            <div className="flex-grow overflow-y-auto space-y-4 pr-2">
                {(project.roadmap || []).map((phase, index) => (
                    <div key={index} className="bg-black/40 p-4 border-2 border-l-4 border-white">
                        <h4 className="text-xl" style={{fontFamily: 'var(--font-header)'}}>{phase.phaseName}</h4>
                        <ul className="mt-2 space-y-2 list-disc list-inside pl-2" style={{fontFamily: 'var(--font-body)'}}>
                            {(phase.tasks || []).map((task, taskIndex) => (
                                <li key={taskIndex}>
                                    <strong>{task.taskName}:</strong>
                                    <span className="ml-2">{task.description}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    )
};


const ProjectPlayground: React.FC<ProjectPlaygroundProps> = (props) => {
    const [isCreating, setIsCreating] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    const GameHeader: React.FC<{children: React.ReactNode}> = ({children}) => (
        <h3 className="text-3xl mb-4 uppercase tracking-wider" style={{ fontFamily: 'var(--font-header)' }}>
            {children}
        </h3>
    );
    
    if (selectedProject) {
        return <ProjectDetailView project={selectedProject} onClose={() => setSelectedProject(null)} />;
    }

    return (
        <div className="flex-grow flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <GameHeader>Project Genesis</GameHeader>
                <button
                    onClick={() => setIsCreating(true)}
                    className="neo-button"
                >
                    + Forge Project
                </button>
            </div>

            <div className="flex-grow overflow-y-auto pr-2">
                {props.projects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {props.projects.map(p => <ProjectCard key={p.id} project={p} onClick={() => setSelectedProject(p)} />)}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-white/50 border-2 border-dashed border-white">
                        <p className="text-xl" style={{fontFamily: 'var(--font-header)'}}>Your Forge is Quiet</p>
                        <p>Begin a new project to see your creations here.</p>
                    </div>
                )}
            </div>

            {isCreating && (
                <ProjectGenesisModal
                    {...props}
                    onClose={() => setIsCreating(false)}
                />
            )}
        </div>
    );
};

export default ProjectPlayground;