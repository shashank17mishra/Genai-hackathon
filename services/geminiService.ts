
import { GoogleGenAI, Type } from "@google/genai";
import type { CognitiveProfile, QuestionnaireAnswers, Skill, QuizQuestion, ProjectBlueprint, ProjectPhase } from '../types';

// --- API KEY CONFIGURATION ---
// The app uses the API key from the environment variable `process.env.API_KEY`.
const apiKey = process.env.API_KEY;


// This service will use mock data if the Gemini API key is not provided.
// This prevents the app from getting stuck if the environment is not configured.
export const useMockData = !apiKey;


const mockProfile: CognitiveProfile = {
  name: 'Quester',
  focus: 'Visionary Tinkerer',
  personality: 'A highly imaginative individual who thrives on building new things. You enjoy deconstructing complex problems and finding novel solutions, blending creativity with a hands-on approach.',
  strengths: ['Creative Ideation', 'Problem-Solving', 'Hands-on Prototyping'],
  weaknesses: ['Project Scoping', 'Maintaining Focus'],
  dream: 'To build an open-source platform that helps inventors collaborate on sustainable technology projects.',
  learningStyle: 'Kinesthetic',
  avatarDescription: 'An adventurous ranger, looking out from a watchtower over a vast, stylized forest at sunset. They are a guide and explorer.'
};

const mockAvatar = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzZDNzFDNCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTUlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlyeT0icGl4ZWwiIGZvbnQtc2l6ZT0iNjAiIGZpbGw9IiNmZmYiPk1PQ0s8L3RleHQ+PC9zdmc+';
const mockCustomAvatar = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzRDOUFERiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTUlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlyeT0icGl4ZWwiIGZvbnQtc2l6ZT0iNDgiIGZpbGw9IiNmZmYiPkNVU1RPTTwvdGV4dD48L3N2Zz4=';


const mockSkills: Skill[] = [
  { id: 'core-concepts', name: 'Core Concepts', description: 'Understand the fundamentals.', status: 'learning', dependencies: [] },
  { id: 'rapid-prototyping', name: 'Rapid Prototyping', description: 'Quickly build and test new ideas.', status: 'locked', dependencies: ['core-concepts'] },
  { id: 'systems-thinking', name: 'Systems Thinking', description: 'Understand how components of a system interact.', status: 'locked', dependencies: ['core-concepts'] },
  { id: 'agile-methodology', name: 'Agile Methodology', description: 'Learn to manage projects with iterative progress.', status: 'locked', dependencies: ['rapid-prototyping'] },
  { id: 'feedback-analysis', name: 'Feedback Analysis', description: 'Effectively gather and interpret user feedback.', status: 'locked', dependencies: ['rapid-prototyping', 'systems-thinking'] },
];

const ai = !useMockData ? new GoogleGenAI({ apiKey: apiKey! }) : null;

// A helper to parse Gemini's JSON responses, which can be wrapped in markdown
const parseJsonResponse = <T,>(jsonString: string): T => {
    const cleanedString = jsonString.replace(/^```json\s*|```\s*$/g, '').trim();
    try {
        return JSON.parse(cleanedString);
    } catch (e) {
        console.error("Failed to parse JSON response:", cleanedString);
        throw new Error("Invalid JSON response from API");
    }
};

export const generateCognitiveProfile = async (answers: QuestionnaireAnswers): Promise<CognitiveProfile> => {
  if (useMockData) return Promise.resolve(mockProfile);

  const prompt = `
    Based on the following answers to a multiple-choice questionnaire, generate a detailed cognitive profile for a user.
    The user is exploring their strengths and weaknesses for personal growth.
    Analyze their choices to infer their personality, strengths, and learning preferences.

    The output MUST be a valid JSON object with the following structure:
    {
      "name": "string (The user's provided name from the 'name' key in the answers. Extract it directly.)",
      "focus": "string (A short, catchy title for the user's cognitive focus based on their answers, e.g., 'Analytical Strategist', 'Visionary Creator')",
      "personality": "string (A one-paragraph summary of their personality, synthesizing the patterns in their choices)",
      "strengths": ["string", "string", "string"] (A list of 3 key strengths inferred from their answers)",
      "weaknesses": ["string", "string"] (A list of 2 potential areas for growth, framed positively, inferred from their choices)",
      "dream": "string (Based on their answer to 'If you had unlimited resources...', synthesize an inspiring one-sentence dream or goal)",
      "learningStyle": "string (Directly extract the learning style from the answer to 'How do you prefer to learn new things?...', e.g., 'Visual', 'Kinesthetic', 'Auditory', 'Reading/Writing')",
      "avatarDescription": "string (A visually descriptive prompt for a fantasy/sci-fi avatar that represents this profile, drawing inspiration from their choices for roles and tools, e.g., 'A wise old tree with glowing runes on its bark')"
    }

    Questionnaire Answers:
    ${JSON.stringify(answers, null, 2)}
    `;
    const response = await ai!.models.generateContent({
        model: 'gemini-2.5-pro', 
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    focus: { type: Type.STRING },
                    personality: { type: Type.STRING },
                    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                    weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                    dream: { type: Type.STRING },
                    learningStyle: { type: Type.STRING },
                    avatarDescription: { type: Type.STRING },
                },
            }
        }
    });

  return parseJsonResponse<CognitiveProfile>(response.text);
};


export const generateAvatar = async (description: string): Promise<string> => {
    if (useMockData) return Promise.resolve(mockAvatar);

    const response = await ai!.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: `An adventurous ranger, a "Quester", serving as a guide. The character is looking out at a vast, scenic landscape. Clean, illustrative, 2.5D art style inspired by the video game Firewatch. The prompt is: "${description}". Square aspect ratio.`,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/png',
            aspectRatio: '1:1',
        },
    });

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/png;base64,${base64ImageBytes}`;
};

export const customizeAvatar = async (originalDescription: string, modification: string): Promise<string> => {
    if (useMockData) return Promise.resolve(mockCustomAvatar);

    const prompt = `An adventurous ranger, a "Quester", serving as a guide. The character is looking out at a vast, scenic landscape. Clean, illustrative, 2.5D art style inspired by the video game Firewatch.
    The original description is: "${originalDescription}".
    Now, apply this modification: "${modification}".
    Square aspect ratio. Maintain the overall character and art style but incorporate the change.`;

    const response = await ai!.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/png',
            aspectRatio: '1:1',
        },
    });

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/png;base64,${base64ImageBytes}`;
};

export const generateInitialSkills = async (profile: CognitiveProfile): Promise<Skill[]> => {
    if (useMockData) return Promise.resolve(mockSkills);

    const prompt = `
        Based on this cognitive profile: ${JSON.stringify(profile, null, 2)}, generate a list of 5 starter skills for a skill tree.
        The skills should be relevant to the user's strengths and help address their weaknesses.
        Create a logical tree structure. One or two skills should be root skills with no dependencies. Other skills should depend on one or more of the other generated skills.
        The output MUST be a valid JSON array of objects, where each object has:
        - "id": a unique kebab-case string (e.g., "creative-writing")
        - "name": a string (e.g., "Creative Writing")
        - "description": a short, one-sentence string describing the skill.
        - "status": a string, either "learning" or "locked" (root skills should be "learning", others "locked").
        - "dependencies": an array of strings, containing the 'id' of parent skills. Root skills should have an empty array [].
    `;
    const response = await ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        status: { type: Type.STRING },
                        dependencies: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                },
            },
        }
    });

    return parseJsonResponse<Skill[]>(response.text);
};

export const generateImprovementSuggestions = async (profile: CognitiveProfile): Promise<string[]> => {
    if (useMockData) return Promise.resolve(["Leverage your 'Creative Ideation' to brainstorm ways to document your project progress, turning a weakness into a strength.", "Find a mentor who is strong in project management to help you scope your ambitious ideas.", "Use your kinesthetic learning style by building physical models or sketches to plan your projects."]);

    const prompt = `
      Based on the user's cognitive profile, generate 3 actionable and personalized improvement suggestions.
      Focus on leveraging their strengths to address their weaknesses. Frame them as clear, encouraging next steps.

      Cognitive Profile:
      - Strengths: ${profile.strengths.join(', ')}
      - Weaknesses: ${profile.weaknesses.join(', ')}
      - Learning Style: ${profile.learningStyle}

      The output MUST be a valid JSON array of strings. Each string is one suggestion.
    `;
    const response = await ai!.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            }
        }
    });

    return parseJsonResponse<string[]>(response.text);
}


// --- Project Genesis Functions ---

export const generateProjectAngles = async (idea: string): Promise<string[]> => {
    if (useMockData) return Promise.resolve([
        `A social media twist on: ${idea}`,
        `A gamified version of: ${idea}`,
        `A niche, subscription-based service for: ${idea}`,
    ]);

    const prompt = `As a creative project strategist, brainstorm 3 distinct and innovative angles for the following project idea: "${idea}". Frame them as short, compelling pitches. The output MUST be a valid JSON array of strings.`;

    const response = await ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            }
        }
    });
    return parseJsonResponse<string[]>(response.text);
};


export const generateProjectBlueprint = async (projectAngle: string, userSkills: Skill[]): Promise<ProjectBlueprint> => {
    const masteredSkills = userSkills.filter(s => s.status === 'mastered').map(s => s.name);
    
    if (useMockData) return Promise.resolve({
        requiredSkills: ['Project Management', 'UI/UX Design', ...masteredSkills],
        skillStrengths: masteredSkills,
        skillGaps: ['Project Management', 'UI/UX Design'],
    });

    const prompt = `
        Analyze the following project concept: "${projectAngle}".
        A user has already mastered these skills: ${JSON.stringify(masteredSkills)}.
        
        First, determine a list of 5-7 essential skills required to successfully complete this project.
        Second, compare this list of required skills with the user's mastered skills.
        
        The output MUST be a valid JSON object with the following structure:
        {
            "requiredSkills": ["A list of all skills needed for the project"],
            "skillStrengths": ["A list of skills the user ALREADY HAS that are on the required list"],
            "skillGaps": ["A list of skills the user IS MISSING from the required list"]
        }
    `;

    const response = await ai!.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                    skillStrengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                    skillGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['requiredSkills', 'skillStrengths', 'skillGaps']
            }
        }
    });
    return parseJsonResponse<ProjectBlueprint>(response.text);
};

export const generateProjectRoadmap = async (projectAngle: string): Promise<ProjectPhase[]> => {
    if (useMockData) return Promise.resolve([
        { phaseName: 'Phase 1: Research & Prototyping', tasks: [{taskName: 'Market Research', description: 'Analyze competitors'}, {taskName: 'Create Wireframes', description: 'Design the basic UI layout.'}] },
        { phaseName: 'Phase 2: Core Development', tasks: [{taskName: 'Setup Database', description: 'Initialize the data schema.'}, {taskName: 'Build Login System', description: 'Implement user authentication.'}] },
    ]);

    const prompt = `
        Create a detailed, actionable project roadmap for the project: "${projectAngle}".
        Break the roadmap down into 3-4 logical phases (e.g., 'Prototyping', 'Development', 'Launch').
        For each phase, generate 2-3 specific tasks. Each task needs a short name and a one-sentence description.
        
        The output MUST be a valid JSON array of phase objects.
        Each phase object must have:
        {
            "phaseName": "string",
            "tasks": [
                { "taskName": "string", "description": "string" }
            ]
        }
    `;

    const response = await ai!.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        phaseName: { type: Type.STRING },
                        tasks: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    taskName: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                },
                                required: ['taskName', 'description']
                            }
                        }
                    },
                    required: ['phaseName', 'tasks']
                }
            }
        }
    });
    return parseJsonResponse<ProjectPhase[]>(response.text);
};


// --- END Project Genesis Functions ---

export const generateSkillChallenge = async (skillName: string): Promise<string> => {
    if (useMockData) return Promise.resolve(`Build a small project that showcases your understanding of ${skillName}. For example, a command-line tool or a simple web component.`);

    const prompt = `Generate a single, short, project-based challenge to test the understanding of the skill "${skillName}". The challenge should be described in one or two sentences. Do not respond in JSON, just a plain string.`;
    
    const response = await ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    return response.text.trim();
};

export const generateVideoRecommendations = async (skillName: string, profile: CognitiveProfile): Promise<{title: string, description: string, youtubeSearchUrl: string}[]> => {
    if (useMockData) return Promise.resolve([
        { title: `Introduction to ${skillName}`, description: `A beginner-friendly overview of the core concepts of ${skillName}.`, youtubeSearchUrl: `https://www.youtube.com/results?search_query=Introduction+to+${encodeURIComponent(skillName)}` },
        { title: `${skillName} Project Tutorial`, description: `A hands-on tutorial to build a project using ${skillName}.`, youtubeSearchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(skillName)}+project+tutorial` },
        { title: `Advanced ${skillName} Techniques`, description: 'Explore more advanced topics and best practices.', youtubeSearchUrl: `https://www.youtube.com/results?search_query=Advanced+${encodeURIComponent(skillName)}+techniques` },
    ]);
    
    const prompt = `
        Based on the skill "${skillName}" and the user's learning style "${profile.learningStyle}", generate 3 video recommendations from YouTube.
        For each recommendation, provide a catchy title, a short one-sentence description, and a valid YouTube search URL.
        The output MUST be a valid JSON array of objects.
    `;

    const response = await ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        youtubeSearchUrl: { type: Type.STRING },
                    },
                    required: ["title", "description", "youtubeSearchUrl"]
                },
            },
        }
    });

    return parseJsonResponse<{title: string, description: string, youtubeSearchUrl: string}[]>(response.text);
};

export const generateCustomSkill = async (skillName: string, profile: CognitiveProfile, dependencies: string[]): Promise<Skill> => {
    if (useMockData) return Promise.resolve({
        id: skillName.toLowerCase().replace(/\s+/g, '-'),
        name: skillName,
        description: `This is a mock description for ${skillName}, tailored for a ${profile.learningStyle} learner.`,
        status: dependencies.length > 0 ? 'locked' : 'learning',
        dependencies: dependencies,
    });
    
    const prompt = `
        A user with the cognitive profile: ${JSON.stringify(profile)} wants to add a new skill called "${skillName}".
        This new skill depends on the following existing skills (by ID): ${JSON.stringify(dependencies)}.
        Generate a single skill object for this new skill.
        The output MUST be a valid JSON object with the following structure:
        - "id": a unique kebab-case string based on the skill name.
        - "name": the skill name "${skillName}".
        - "description": a short, one-sentence description of the skill, personalized to the user's learning style.
        - "status": "learning" if the dependencies array is empty, and "locked" otherwise.
        - "dependencies": the provided array of dependency IDs: ${JSON.stringify(dependencies)}.
    `;

    const response = await ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    status: { type: Type.STRING },
                    dependencies: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                 required: ["id", "name", "description", "status", "dependencies"]
            },
        }
    });

    return parseJsonResponse<Skill>(response.text);
};

export const generateCareerSkillTree = async (careerPath: string, profile: CognitiveProfile): Promise<Skill[]> => {
    if (useMockData) return Promise.resolve([
        { id: 'foundation-skills', name: `Foundations for ${careerPath}`, description: 'Core concepts for your new career.', status: 'learning', dependencies: [] },
        { id: 'specialized-tool', name: 'Specialized Tool', description: 'Learn a key tool for the industry.', status: 'locked', dependencies: ['foundation-skills'] },
        { id: 'first-project', name: 'First Portfolio Project', description: 'Build a project to showcase your abilities.', status: 'locked', dependencies: ['foundation-skills', 'specialized-tool'] },
    ]);
    
    const prompt = `
        Generate a starter skill tree for a user aspiring to become a "${careerPath}".
        Their cognitive profile is: ${JSON.stringify(profile, null, 2)}.
        The skill tree should consist of 5-7 skills.
        Create a logical tree structure. One or two skills should be root skills.
        The output MUST be a valid JSON array of skill objects. Each object needs:
        - "id": a unique kebab-case string (e.g., "creative-writing")
        - "name": a string (e.g., "Creative Writing")
        - "description": a short, one-sentence string describing the skill.
        - "status": a string, either "learning" or "locked" (root skills should be "learning", others "locked").
        - "dependencies": an array of strings, containing the 'id' of parent skills.
    `;

    const response = await ai!.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        status: { type: Type.STRING },
                        dependencies: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ["id", "name", "description", "status", "dependencies"]
                },
            },
        }
    });

    return parseJsonResponse<Skill[]>(response.text);
};

export const generateSkillAssessment = async (skillName: string): Promise<QuizQuestion[]> => {
    if (useMockData) return Promise.resolve([
        { question: `What is the primary purpose of ${skillName}?`, options: ['Option A', 'Option B', 'The Correct One', 'Option D'], correctAnswer: 'The Correct One' },
        { question: 'Which of the following is a key feature?', options: ['Correct Answer', 'Feature B', 'Feature C', 'Feature D'], correctAnswer: 'Correct Answer' },
        { question: 'How would you apply this skill in a project?', options: ['Incorrectly', 'Correctly', 'Maybe?', 'Not sure'], correctAnswer: 'Correctly' },
    ]);

    const prompt = `
        Generate a 3-question multiple-choice quiz to assess a user's understanding of the skill: "${skillName}".
        Each question should have 4 options, and one must be the correct answer. The questions should be practical and concept-based.
        The output MUST be a valid JSON array of objects, where each object has:
        - "question": a string with the question text.
        - "options": an array of 4 strings.
        - "correctAnswer": a string that exactly matches one of the items in the "options" array.
    `;

    const response = await ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        correctAnswer: { type: Type.STRING },
                    },
                    required: ["question", "options", "correctAnswer"]
                },
            },
        }
    });

    return parseJsonResponse<QuizQuestion[]>(response.text);
};
