import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CognitiveProfile, Skill, Project, ProjectBlueprint, ProjectPhase } from '../types';
import {
    generateProjectAngles,
    generateProjectBlueprint,
    generateProjectRoadmap,
    generateCustomSkill
} from '../services/geminiService';

interface ProjectGenesisModalProps {
    profile: CognitiveProfile;
    skills: Skill[];
    onClose: () => void;
    onProjectCreated: (project: Project) => void;
    onAddSkills: (skills: Skill[]) => void;
}

const STAGES = {
    SPARK: 'spark',
    BLUEPRINT: 'blueprint',
    ROADMAP: 'roadmap',
};

const StageIndicator: React.FC<{currentStage: string}> = ({ currentStage }) => {
    const stageIndex = Object.values(STAGES).indexOf(currentStage);
    const stages = ['The Spark', 'The Blueprint', 'The Roadmap'];
    return (
        <div className="flex justify-center items-center mb-4">
            {stages.map((stage, index) => (
                <React.Fragment key={stage}>
                    <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 border-white text-black ${index <= stageIndex ? 'bg-[var(--primary-color)]' : 'bg-transparent text-white'}`}>
                            {index + 1}
                        </div>
                        <p className={`ml-2 uppercase tracking-wider font-bold ${index <= stageIndex ? 'text-white' : 'text-white/50'}`} style={{fontFamily: 'var(--font-header)'}}>{stage}</p>
                    </div>
                    {index < stages.length - 1 && <div className={`w-16 h-1 mx-2 ${index < stageIndex ? 'bg-[var(--primary-color)]' : 'bg-white'}`}></div>}
                </React.Fragment>
            ))}
        </div>
    );
};

const LoadingState: React.FC<{message: string}> = ({ message }) => (
    <div className="flex flex-col items-center justify-center text-center p-8 min-h-[300px]">
        <p className="text-2xl animate-pulse" style={{fontFamily: 'var(--font-body)'}}>{message.toUpperCase()}</p>
    </div>
);

const ProjectGenesisModal: React.FC<ProjectGenesisModalProps> = (props) => {
    const [stage, setStage] = useState(STAGES.SPARK);
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState('');

    // Project data
    const [idea, setIdea] = useState('');
    const [angles, setAngles] = useState<string[]>([]);
    const [selectedAngle, setSelectedAngle] = useState('');
    const [blueprint, setBlueprint] = useState<ProjectBlueprint | null>(null);
    const [roadmap, setRoadmap] = useState<ProjectPhase[] | null>(null);

    const handleGenerateAngles = async () => {
        if (!idea.trim()) return;
        setLoading(true);
        setLoadingMessage('Thinking of creative angles...');
        setError('');
        try {
            const result = await generateProjectAngles(idea);
            setAngles(result);
        } catch (e: any) { setError(e.message); }
        setLoading(false);
    };

    const handleSelectAngle = async (angle: string) => {
        setSelectedAngle(angle);
        setStage(STAGES.BLUEPRINT);
        setLoading(true);
        setLoadingMessage('Analyzing your skills...');
        try {
            const result = await generateProjectBlueprint(angle, props.skills);
            setBlueprint(result);
        } catch (e: any) { setError(e.message); }
        setLoading(false);
    };
    
    const handleGenerateQuest = async (skillName: string) => {
        setLoading(true);
        setLoadingMessage(`Generating quest for ${skillName}...`);
        try {
            const newSkill = await generateCustomSkill(skillName, props.profile, []); // For simplicity, new quests are root nodes
            props.onAddSkills([newSkill]);
            // Visually remove the gap
            if (blueprint) {
                setBlueprint({
                    ...blueprint,
                    skillGaps: blueprint.skillGaps.filter(g => g !== skillName),
                    skillStrengths: [...blueprint.skillStrengths, skillName],
                });
            }
        } catch (e: any) { setError(e.message); }
        setLoading(false);
    }
    
    const handleConfirmBlueprint = async () => {
        if (!selectedAngle) return;
        setStage(STAGES.ROADMAP);
        setLoading(true);
        setLoadingMessage('Building your project roadmap...');
        try {
            const result = await generateProjectRoadmap(selectedAngle);
            setRoadmap(result);
        } catch (e: any) { setError(e.message); }
        setLoading(false);
    }

    const handleFinishProject = () => {
        if (!blueprint || !roadmap) return;
        const newProject: Project = {
            id: crypto.randomUUID(),
            idea,
            angle: selectedAngle,
            blueprint,
            roadmap,
        };
        props.onProjectCreated(newProject);
        props.onClose();
    };


    const renderSparkStage = () => (
        <div>
            <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Describe a project, a passion, or a problem..."
                className="neo-input"
            />
            <button onClick={handleGenerateAngles} disabled={!idea.trim() || loading} className="neo-button w-full mt-4">
                Generate Angles
            </button>
            
            {loading && <LoadingState message={loadingMessage} />}

            {angles.length > 0 && !loading && (
                <div className="mt-4 space-y-3">
                    <h4 className="font-bold text-center" style={{fontFamily: 'var(--font-header)'}}>Select an angle to proceed:</h4>
                    {angles.map((angle, i) => (
                        <button key={i} onClick={() => handleSelectAngle(angle)} className="w-full p-4 text-left border-2 border-white bg-transparent hover:bg-white/20 transition-colors">
                           &rarr; <span style={{fontFamily: 'var(--font-body)'}}>{angle}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
    
    const renderBlueprintStage = () => (
        loading ? <LoadingState message={loadingMessage} /> : blueprint && (
            <div>
                <p className="text-center italic text-white/80 mb-4" style={{fontFamily: 'var(--font-body)'}}>"{selectedAngle}"</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{fontFamily: 'var(--font-body)'}}>
                    <div className="p-4 border-2 border-white bg-[var(--primary-color)] text-black">
                        <h4 className="text-lg font-bold" style={{fontFamily: 'var(--font-header)'}}>Your Strengths</h4>
                        <ul className="mt-2 space-y-1 list-disc list-inside">
                            {(blueprint.skillStrengths || []).map(s => <li key={s}>{s}</li>)}
                        </ul>
                    </div>
                     <div className="p-4 border-2 border-white bg-[var(--secondary-color)] text-black">
                        <h4 className="text-lg font-bold" style={{fontFamily: 'var(--font-header)'}}>New Quests</h4>
                        {blueprint.skillGaps.length > 0 ? (
                           <ul className="mt-2 space-y-2">
                            {(blueprint.skillGaps || []).map(gap => (
                                <li key={gap} className="flex justify-between items-center">
                                    <span>{gap}</span>
                                    <button onClick={() => handleGenerateQuest(gap)} className="text-xs bg-white text-black font-bold py-1 px-2 border-2 border-black hover:bg-gray-200">
                                        + Add
                                    </button>
                                </li>
                            ))}
                        </ul>
                        ) : <p className="text-sm italic opacity-80">No skill gaps detected. You're ready to go!</p>}
                    </div>
                </div>
                 <button onClick={handleConfirmBlueprint} className="neo-button w-full mt-6">
                    Generate Roadmap
                </button>
            </div>
        )
    );
    
    const renderRoadmapStage = () => (
        loading ? <LoadingState message={loadingMessage} /> : roadmap && (
            <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-3">
                 {(roadmap || []).map((phase, index) => (
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
                <button onClick={handleFinishProject} className="neo-button w-full mt-4 accent">
                    Forge Project & Close
                </button>
            </div>
        )
    );

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={props.onClose}>
            <div className="neo-panel w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
                 <div className="flex justify-between items-start mb-4">
                    <h2 className="text-3xl uppercase" style={{ fontFamily: 'var(--font-header)', color: 'var(--primary-color)' }}>Project Genesis</h2>
                    <button onClick={props.onClose} className="text-3xl font-bold hover:text-red-500">&times;</button>
                </div>

                <StageIndicator currentStage={stage} />

                <div className="mt-6">
                    {stage === STAGES.SPARK && renderSparkStage()}
                    {stage === STAGES.BLUEPRINT && renderBlueprintStage()}
                    {stage === STAGES.ROADMAP && renderRoadmapStage()}
                    {error && <p className="text-red-500 font-bold mt-4 text-center">{error}</p>}
                </div>
            </div>
        </div>
    );
};

export default ProjectGenesisModal;