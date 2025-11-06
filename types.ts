// FIX: Removed circular self-import of 'MindMapNode' which is no longer used.

export interface CognitiveProfile {
  name: string;
  focus: string;
  personality: string;
  strengths: string[];
  weaknesses: string[];
  dream: string;
  learningStyle: string;
  avatarDescription: string;
}

export type SkillStatus = "locked" | "learning" | "mastered";

export interface Skill {
  id: string;
  name: string;
  description: string;
  status: SkillStatus;
  dependencies: string[];
}

export interface QuestionnaireAnswers {
  [key:string]: string;
}

// --- NEW Project Genesis Types ---
export interface ProjectBlueprint {
  requiredSkills: string[];
  skillGaps: string[];
  skillStrengths: string[];
}

export interface ProjectTask {
  taskName: string;
  description: string;
}

export interface ProjectPhase {
  phaseName: string;
  tasks: ProjectTask[];
}

export interface Project {
  id: string; // Using crypto.randomUUID() for a unique ID
  idea: string;
  angle: string;
  blueprint: ProjectBlueprint;
  roadmap: ProjectPhase[];
}
// --- END NEW Types ---


export interface UserData {
  profile: CognitiveProfile;
  avatarUrl: string;
  skills: Skill[];
  projects: Project[]; // Updated from MindMapNode[]
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}