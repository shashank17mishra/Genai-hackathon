import React, { useState } from 'react';
import type { CognitiveProfile, Skill, QuestionnaireAnswers } from '../types';
import { generateCognitiveProfile, generateAvatar, generateInitialSkills } from '../services/geminiService';
import Card from './common/Card';

interface QuestionnaireProps {
  onComplete: (profile: CognitiveProfile, avatarUrl: string, initialSkills: Skill[]) => Promise<void>;
}

const questions = [
  { id: 'name', text: "First, what should we call you?" },
  { 
    id: 'q1', 
    text: "When starting a new project, what's your first move?", 
    options: [
      "Dive right in and start building", 
      "Plan everything out meticulously", 
      "Research and gather inspiration", 
      "Collaborate and brainstorm with others"
    ] 
  },
  { 
    id: 'q2', 
    text: "How do you prefer to learn new things?", 
    options: [
      "Watching videos and demonstrations (Visual)", 
      "Reading books and articles (Reading/Writing)", 
      "Hands-on experimentation (Kinesthetic)", 
      "Listening to lectures or podcasts (Auditory)"
    ] 
  },
  { 
    id: 'q3', 
    text: "What kind of environment helps you focus best?", 
    options: [
      "A quiet, solitary space", 
      "A bustling cafe with background noise", 
      "A collaborative open-plan office", 
      "Out in nature"
    ] 
  },
  { 
    id: 'q4', 
    text: "When faced with a difficult problem, you tend to:", 
    options: [
      "Break it down into smaller, logical pieces", 
      "Look for a creative, unconventional solution", 
      "Consult with experts or friends for their opinions", 
      "Power through with persistence and determination"
    ] 
  },
  { 
    id: 'q5', 
    text: "Which of these fictional roles appeals to you most?", 
    options: [
      "The wise wizard, keeper of ancient knowledge", 
      "The daring adventurer, exploring new worlds", 
      "The master artisan, creating beautiful things", 
      "The charismatic leader, uniting people for a cause"
    ] 
  },
  { 
    id: 'q6', 
    text: "What motivates you the most in your work or hobbies?", 
    options: [
      "Mastering a new skill to perfection", 
      "The freedom to create something uniquely mine", 
      "Solving a complex puzzle or challenge", 
      "Making a positive impact on others"
    ] 
  },
  { 
    id: 'q7', 
    text: "Your ideal team is:", 
    options: [
      "A small group of trusted experts", 
      "A large, diverse group with many perspectives", 
      "I prefer to work independently", 
      "A single partner who complements my skills"
    ] 
  },
  { 
    id: 'q8', 
    text: "How do you typically react to unexpected changes or failure?", 
    options: [
      "Analyze what went wrong to learn from it", 
      "Feel disappointed, but pivot quickly to a new approach", 
      "Seek feedback from others to understand different views", 
      "See it as a challenge and redouble my efforts"
    ] 
  },
  { 
    id: 'q9', 
    text: "If you had unlimited resources, what would you create?", 
    options: [
      "A groundbreaking scientific discovery", 
      "An immersive artistic masterpiece", 
      "A global business that solves a major problem", 
      "A foundation to support community projects"
    ] 
  },
  { 
    id: 'q10', 
    text: "In a fantasy world, what would be your tool of choice?", 
    options: [
      "A spellbook filled with ancient knowledge", 
      "A finely crafted sword for direct action", 
      "A versatile set of tools to build anything", 
      "A silver tongue to navigate social challenges"
    ] 
  },
];


const withTimeout = <T,>(promise: Promise<T>, ms: number, timeoutMessage = 'API call timed out'): Promise<T> => {
  const timeoutPromise = new Promise<T>((_, reject) => {
    setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, ms);
  });
  return Promise.race([promise, timeoutPromise]);
};

const Questionnaire: React.FC<QuestionnaireProps> = ({ onComplete }) => {
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('');

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    const currentQuestionId = questions[currentStep].id;
    if (!answers[currentQuestionId]?.trim()) {
      setError('Please provide an answer.');
      return;
    }
    setError('');
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      setLoadingMessage('Analyzing your responses...');
      const profile = await withTimeout(
        generateCognitiveProfile(answers),
        30000,
        'Profile analysis took too long.'
      );

      setLoadingMessage('Crafting your avatar...');
      const [avatarUrl, initialSkills] = await Promise.all([
        withTimeout(
          generateAvatar(profile.avatarDescription),
          60000,
          'Avatar generation took too long.'
        ),
        withTimeout(
          generateInitialSkills(profile),
          30000,
          'Skill generation took too long.'
        )
      ]);
      
      setLoadingMessage('Plotting your quests...');
      await onComplete(profile, avatarUrl, initialSkills);
    } catch (err: any)
    {
      console.error(err);
      setError(`An error occurred: ${err.message}. Please try again.`);
      setLoading(false);
    }
  };

  const progress = ((currentStep + 1) / questions.length) * 100;
  const currentQuestion = questions[currentStep];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-2xl text-center">
          <h2 className="text-3xl mb-4" style={{ fontFamily: 'var(--font-header)' }}>{loadingMessage}</h2>
          <div className="text-2xl my-8 animate-pulse" style={{fontFamily: 'var(--font-body)'}}>
            PLEASE WAIT...
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="bg-black/50 h-4 w-full border-2 border-white">
            <div 
              className="bg-[var(--primary-color)] h-full transition-all duration-300 border-r-2 border-white"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-right mt-1 uppercase tracking-wider" style={{ fontFamily: 'var(--font-header)' }}>Step {currentStep + 1} of {questions.length}</p>
        </div>

        {/* Question */}
        <div className="min-h-[250px]">
           <label htmlFor={currentQuestion.id} className="block text-2xl mb-4 leading-snug" style={{fontFamily: 'var(--font-header)'}}>
            {currentQuestion.text}
          </label>
          {'options' in currentQuestion && currentQuestion.options ? (
            <div className="space-y-3 mt-4">
              {(currentQuestion.options as string[]).map((option: string) => (
                <button
                  key={option}
                  onClick={() => handleAnswerChange(currentQuestion.id, option)}
                  className={`w-full text-left p-3 border-2 transition-all text-base ${
                    answers[currentQuestion.id] === option 
                      ? 'bg-[var(--accent-color)] text-black border-white' 
                      : 'border-white bg-transparent hover:bg-white/20 text-white'
                  }`}
                  style={{fontFamily: 'var(--font-body)'}}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : (
            <input
              id={currentQuestion.id}
              type="text"
              value={answers[currentQuestion.id] || ''}
              className="neo-input"
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
              placeholder="Your name..."
            />
          )}
        </div>
        
        {error && <p className="text-[var(--secondary-color)] font-bold mt-4 text-center">{error}</p>}
        
        <div className="mt-8 flex justify-between items-center">
          {currentStep > 0 ? (
             <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="font-bold py-3 px-8 hover:underline uppercase tracking-wider"
               style={{ fontFamily: 'var(--font-header)' }}
            >
              Back
            </button>
          ) : <div></div>}
          <button
            onClick={handleNext}
            className="neo-button"
          >
            {currentStep === questions.length - 1 ? 'Generate Profile' : 'Next'}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Questionnaire;