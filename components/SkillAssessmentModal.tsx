import React, { useState, useEffect } from 'react';
import type { Skill, QuizQuestion } from '../types';
import { generateSkillAssessment } from '../services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';

interface SkillAssessmentModalProps {
  skill: Skill;
  onClose: (passed: boolean) => void;
}

const PASS_THRESHOLD = 0.6; // 60% correct to pass

const SkillAssessmentModal: React.FC<SkillAssessmentModalProps> = ({ skill, onClose }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  const fetchQuiz = async () => {
    setLoading(true);
    setError('');
    try {
      const quizQuestions = await generateSkillAssessment(skill.name);
      setQuestions(quizQuestions);
    } catch (err: any) {
      setError(err.message || 'Could not load the assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
    fetchQuiz();
  };
  
  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const score = answers.reduce((correctCount, answer, index) => {
    return questions[index] && answer === questions[index].correctAnswer ? correctCount + 1 : correctCount;
  }, 0);
  
  const passed = questions.length > 0 && score / questions.length >= PASS_THRESHOLD;

  const renderContent = () => {
    if (!quizStarted) {
        return (
            <div className="text-center p-8">
                <h3 className="text-2xl mb-4" style={{ fontFamily: 'var(--font-header)' }}>Ready to prove your mastery?</h3>
                <p className="mb-6" style={{fontFamily: 'var(--font-body)'}}>This is a short, AI-generated quiz to assess your understanding of <strong>{skill.name}</strong>.</p>
                <button 
                    onClick={handleStartQuiz} 
                    className="neo-button"
                >
                    START ASSESSMENT
                </button>
            </div>
        );
    }

    if (loading) {
      return (
        <div className="text-center p-8 min-h-[200px] flex items-center justify-center">
            <p className="text-2xl animate-pulse" style={{fontFamily: 'var(--font-body)'}}>PREPARING QUIZ...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center p-8">
          <p className="text-red-500 font-bold">{error}</p>
          <button onClick={() => onClose(false)} className="neo-button mt-4">Close</button>
        </div>
      );
    }

    if (quizFinished) {
      return (
        <div className="text-center p-8">
          <h3 className="text-3xl mb-4 uppercase tracking-wider" style={{ fontFamily: 'var(--font-header)', color: passed ? 'var(--primary-color)' : 'var(--secondary-color)' }}>
            {passed ? 'Quest Complete!' : 'Try Again!'}
          </h3>
          <p className="text-xl font-bold" style={{fontFamily: 'var(--font-body)'}}>You scored {score} out of {questions.length}</p>
          <p className="mt-4 mb-6" style={{fontFamily: 'var(--font-body)'}}>{passed ? `You have mastered the skill: ${skill.name}!` : "Review the learning materials and give it another shot."}</p>
          <button 
            onClick={() => onClose(passed)} 
            className="neo-button"
            style={{ backgroundColor: passed ? 'var(--primary-color)' : 'var(--secondary-color)' }}
          >
            CONTINUE
          </button>
        </div>
      );
    }

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return null;

    return (
      <AnimatePresence mode="wait">
        <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
        >
            <div className="p-1 mb-4 text-sm text-center border-2 border-white bg-black/40 w-fit mx-auto px-4">
                Question {currentQuestionIndex + 1} of {questions.length}
            </div>
            <h4 className="text-xl font-bold mb-6 min-h-[56px] text-center" style={{fontFamily: 'var(--font-header)'}}>{currentQuestion.question}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{fontFamily: 'var(--font-body)'}}>
            {currentQuestion.options.map((option, index) => (
                <button
                key={index}
                onClick={() => handleAnswer(option)}
                className="w-full text-left p-4 border-2 border-white bg-transparent hover:bg-white/20 transition-all text-lg"
                >
                {option}
                </button>
            ))}
            </div>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div 
        className="neo-panel w-full max-w-2xl"
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-3xl uppercase tracking-wider" style={{ fontFamily: 'var(--font-header)', color: 'var(--primary-color)' }}>Assessment: {skill.name}</h2>
          {!quizFinished && (
             <button onClick={() => onClose(false)} className="text-3xl font-bold hover:text-red-500">&times;</button>
          )}
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default SkillAssessmentModal;
