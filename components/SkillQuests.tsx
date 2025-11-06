import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
} from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import { useParallax } from './useParallax';

import type { Skill, CognitiveProfile } from '../types';
import { generateSkillChallenge, generateVideoRecommendations } from '../services/geminiService';
import SkillAssessmentModal from './SkillAssessmentModal';
import AddSkillModal from './AddSkillModal';
import CareerModal from './CareerModal';

// --- CUSTOM NODE ---
const SkillNode: React.FC<{ data: Skill }> = React.memo(({ data }) => {
  return (
    <div className={`skill-node-star ${data.status}`}>
      <div className="node-label">{data.name}</div>
    </div>
  );
});
const nodeTypes = { skill: SkillNode };


// --- HIERARCHICAL LAYOUT LOGIC ---
const getLayoutedElements = (skills: Skill[], canvasWidth: number, canvasHeight: number) => {
    if (!skills.length || canvasWidth === 0 || canvasHeight === 0) {
        return { nodes: [], edges: [] };
    }

    const nodeWidth = 130;
    const xSpacing = 220; // Increased spacing for constellation feel
    const ySpacing = 220;
    
    const memo = new Map<string, number>();

    const getLevel = (skillId: string): number => {
        if (memo.has(skillId)) return memo.get(skillId)!;

        const skill = skills.find(s => s.id === skillId);
        if (!skill) {
             memo.set(skillId, 0); // Fallback
             return 0;
        }

        if (!skill.dependencies || skill.dependencies.length === 0) {
            memo.set(skillId, 0);
            return 0;
        }

        const parentLevels = skill.dependencies.map(depId => getLevel(depId));
        const maxParentLevel = Math.max(...parentLevels);
        const level = maxParentLevel + 1;
        memo.set(skillId, level);
        return level;
    };

    skills.forEach(skill => getLevel(skill.id));
    
    const nodesByLevel = new Map<number, Skill[]>();
    for (const [skillId, level] of memo.entries()) {
        if (!nodesByLevel.has(level)) {
            nodesByLevel.set(level, []);
        }
        const skill = skills.find(s => s.id === skillId)!;
        nodesByLevel.get(level)!.push(skill);
    }
    
    const nodes: Node[] = [];
    for (const [level, skillsInLevel] of nodesByLevel.entries()) {
        const levelWidth = (skillsInLevel.length - 1) * xSpacing;
        const startX = (canvasWidth / 2) - (levelWidth / 2) - (nodeWidth / 2);
        
        skillsInLevel.forEach((skill, index) => {
            nodes.push({
                id: skill.id,
                type: 'skill',
                data: skill,
                position: {
                    x: startX + index * xSpacing,
                    y: level * ySpacing + 50,
                },
            });
        });
    }

    const edges: Edge[] = [];
    skills.forEach(skill => {
        (skill.dependencies || []).forEach(depId => {
            const sourceSkill = skills.find(s => s.id === depId);
            if (sourceSkill) {
                edges.push({
                    id: `${depId}-${skill.id}`,
                    source: depId,
                    target: skill.id,
                    type: 'bezier',
                    animated: sourceSkill.status === 'mastered' && skill.status === 'learning',
                });
            }
        });
    });

    return { nodes, edges };
};


// --- SIDE PANEL ---
const SkillDetailPanel: React.FC<{
    skill: Skill;
    profile: CognitiveProfile;
    onStartAssessment: (skill: Skill) => void;
    onClose: () => void;
}> = ({ skill, profile, onStartAssessment, onClose }) => {
    const [isLoadingQuest, setIsLoadingQuest] = useState(false);
    const [questError, setQuestError] = useState('');
    const [challenge, setChallenge] = useState<string | null>(null);
    const [videos, setVideos] = useState<{title: string, description: string, youtubeSearchUrl: string}[] | null>(null);

    const handleLoadQuest = async () => {
        setIsLoadingQuest(true);
        setQuestError('');
        setChallenge(null);
        setVideos(null);
        try {
            const [challengeResult, videosResult] = await Promise.all([
                generateSkillChallenge(skill.name),
                generateVideoRecommendations(skill.name, profile)
            ]);
            setChallenge(challengeResult);
            setVideos(videosResult);
        } catch (e: any) {
            setQuestError(e.message || "Failed to load quest materials.");
        } finally {
            setIsLoadingQuest(false);
        }
    };

    return (
         <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute top-0 right-0 h-full w-full md:w-1/3 lg:w-1/4 z-10"
        >
            <div className="neo-panel h-full flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl uppercase tracking-wider" style={{ fontFamily: 'var(--font-header)', color: 'var(--primary-color)' }}>
                        {skill.name}
                    </h3>
                    <button onClick={onClose} className="text-2xl font-bold hover:text-red-500">&times;</button>
                </div>
                <p className="mb-4" style={{fontFamily: 'var(--font-body)'}}>{skill.description}</p>
                
                <div className="flex-grow overflow-y-auto pr-2">
                    { !challenge && !videos && !isLoadingQuest && (
                        <button onClick={handleLoadQuest} className="neo-button w-full">Load Quest</button>
                    )}
                    {isLoadingQuest && <p className="animate-pulse">Loading Quest...</p>}
                    {questError && <p className="text-red-500">{questError}</p>}
                    
                    {challenge && (
                        <div className="mt-4">
                            <h4 className="text-xl font-bold" style={{fontFamily: 'var(--font-header)'}}>Challenge</h4>
                            <div className="bg-black/40 p-3 mt-2 border-l-4 border-white">{challenge}</div>
                        </div>
                    )}
                    {videos && (
                         <div className="mt-4">
                            <h4 className="text-xl font-bold" style={{fontFamily: 'var(--font-header)'}}>Video Guides</h4>
                            <div className="space-y-3 mt-2">
                                {videos.map(video => (
                                    <a href={video.youtubeSearchUrl} target="_blank" rel="noopener noreferrer" key={video.title} className="block bg-black/40 p-3 hover:bg-black/60 border-l-4 border-white">
                                        <p className="font-bold">{video.title}</p>
                                        <p className="text-sm opacity-80">{video.description}</p>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                
                {skill.status === 'learning' && (
                    <button onClick={() => onStartAssessment(skill)} className="neo-button accent w-full mt-4">Take Assessment</button>
                )}
            </div>
        </motion.div>
    )
}

// --- MAIN COMPONENT ---
interface SkillQuestsProps {
  skills: Skill[];
  onUpdateSkillStatus: (skillId: string) => void;
  onSkillAdd: (newSkill: Skill) => void;
  profile: CognitiveProfile;
  onGenerateCareerTree: (newSkills: Skill[]) => void;
}

const SkillQuestsContent: React.FC<SkillQuestsProps> = (props) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const parallaxContainerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  useParallax(parallaxContainerRef, 20);

  useEffect(() => {
    const handleResize = () => {
        if (reactFlowWrapper.current) {
            setDimensions({
                width: reactFlowWrapper.current.offsetWidth,
                height: reactFlowWrapper.current.offsetHeight,
            });
        }
    };
    handleResize(); // Initial measurement
    const resizeObserver = new ResizeObserver(handleResize);
    if(reactFlowWrapper.current) {
        resizeObserver.observe(reactFlowWrapper.current);
    }
    return () => resizeObserver.disconnect();
  }, []);

  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(
      () => getLayoutedElements(props.skills, dimensions.width, dimensions.height), 
      [props.skills, dimensions.width, dimensions.height]
  );
  
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);
  const [activeSkill, setActiveSkill] = useState<Skill | null>(null);
  const [assessingSkill, setAssessingSkill] = useState<Skill | null>(null);
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [isGeneratingCareer, setIsGeneratingCareer] = useState(false);
  
  useEffect(() => {
    const { nodes, edges } = getLayoutedElements(props.skills, dimensions.width, dimensions.height);
    setNodes(nodes);
    setEdges(edges);
  }, [props.skills, dimensions.width, dimensions.height, setNodes, setEdges]);
  
  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setActiveSkill(node.data);
  }, []);
  
  const handleAssessmentComplete = (passed: boolean) => {
    if (passed && assessingSkill) {
      props.onUpdateSkillStatus(assessingSkill.id);
    }
    setAssessingSkill(null);
  };
  
    const onNodeMouseEnter = useCallback((_: any, node: Node) => {
        setEdges((eds) =>
            eds.map((edge) => {
                if (edge.source === node.id || edge.target === node.id) {
                    return { ...edge, className: 'highlighted' };
                }
                return edge;
            })
        );
    }, [setEdges]);

    const onNodeMouseLeave = useCallback(() => {
        setEdges((eds) => eds.map((edge) => ({ ...edge, className: '' })));
    }, [setEdges]);

  return (
    <div className="relative flex-grow flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-3xl uppercase tracking-wider" style={{ fontFamily: 'var(--font-header)' }}>
          Quest Map
        </h3>
        <div className="flex gap-2">
            <button onClick={() => setIsAddingSkill(true)} className="neo-button text-sm">Add Custom Skill</button>
            <button onClick={() => setIsGeneratingCareer(true)} className="neo-button secondary text-sm">Chart New Path</button>
        </div>
      </div>
      
      <div ref={reactFlowWrapper} className="flex-grow relative neo-panel p-0 overflow-hidden" style={{ transition: 'transform 0.1s linear' }}>
         <div ref={parallaxContainerRef} className="w-full h-full">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={handleNodeClick}
              onNodeMouseEnter={onNodeMouseEnter}
              onNodeMouseLeave={onNodeMouseLeave}
              nodeTypes={nodeTypes}
              fitView
              proOptions={{ hideAttribution: true }}
              nodesDraggable={false}
              nodesConnectable={false}
              minZoom={0.2}
              maxZoom={1.5}
            />
        </div>
        <AnimatePresence>
            {activeSkill && (
                <SkillDetailPanel
                    skill={activeSkill}
                    profile={props.profile}
                    onStartAssessment={setAssessingSkill}
                    onClose={() => setActiveSkill(null)}
                />
            )}
        </AnimatePresence>
      </div>

       {assessingSkill && (
            <SkillAssessmentModal
                skill={assessingSkill}
                onClose={handleAssessmentComplete}
            />
        )}
       {isAddingSkill && (
           <AddSkillModal
               profile={props.profile}
               skills={props.skills}
               onClose={() => setIsAddingSkill(false)}
               onSkillAdd={props.onSkillAdd}
           />
       )}
       {isGeneratingCareer && (
           <CareerModal
               profile={props.profile}
               onClose={() => setIsGeneratingCareer(false)}
               onTreeGenerated={props.onGenerateCareerTree}
           />
       )}
    </div>
  );
};

const SkillQuests: React.FC<SkillQuestsProps> = (props) => (
    <ReactFlowProvider>
        <SkillQuestsContent {...props} />
    </ReactFlowProvider>
);

export default SkillQuests;