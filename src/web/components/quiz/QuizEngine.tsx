import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { useUser } from '@clerk/clerk-react';
import PraxyMascot from '../praxy-mascot';
import QuestionCard from './QuestionCard';
import QuizComplete from './QuizComplete';
import { getQuestionsByLevel, submitAnswer } from '../../lib/api/questions';
import { saveSession, updateProgress } from '../../lib/api';
import type { Question, AnswerResult } from '../../types/quiz';

interface QuizEngineProps {
  levelId: string;
  levelNumber: number;
  levelTitle: string;
  backLink: string;
  onComplete?: (score: number, total: number, xp: number) => void;
  onNextLevel?: () => void;
}

const QuizEngine = ({ levelId, levelNumber, levelTitle, backLink, onComplete, onNextLevel }: QuizEngineProps) => {
  const { user } = useUser();

  // Quiz state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<'selecting' | 'correct' | 'incorrect' | null>(null);
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [saving, setSaving] = useState(false);

  const startTimeRef = useRef<number>(Date.now());

  // Fetch questions
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      const data = await getQuestionsByLevel(levelId);
      if (data.length === 0) {
        setError('No questions found for this level.');
      } else {
        setQuestions(data);
      }
      setLoading(false);
    };
    fetchQuestions();
  }, [levelId]);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const progressPercent = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;

  const handleSelect = (value: string) => {
    if (answerState) return;
    setSelectedAnswer(value);
  };

  const handleSubmit = async () => {
    if (!selectedAnswer || !currentQuestion) return;

    const result = await submitAnswer(
      currentQuestion.id,
      selectedAnswer,
      user?.id
    );

    setAnswerResult(result);

    if (result.correct) {
      setAnswerState('correct');
      setScore((s) => s + 1);
      setXpEarned((xp) => xp + result.xp_earned);
    } else {
      setAnswerState('incorrect');
    }

    setShowFeedback(true);
  };

  const handleContinue = async () => {
    setShowFeedback(false);
    setSelectedAnswer(null);
    setAnswerState(null);
    setAnswerResult(null);
    setShowHint(false);

    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      // Quiz finished - use current score state directly
      // Note: score has already been incremented in handleSubmit if last answer was correct
      const finalScore = Math.min(score, totalQuestions); // Cap at total questions
      const finalXP = xpEarned;
      const timeSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

      setSaving(true);
      try {
        await saveSession(levelNumber, finalScore, totalQuestions, timeSeconds);
        const isPassing = (finalScore / totalQuestions) >= 0.6;
        if (isPassing) {
          await updateProgress(levelNumber, finalScore, true, undefined, 'balance-sheet');
        }
      } catch (e) {
        console.error('Failed to save quiz results:', e);
      }
      setSaving(false);

      onComplete?.(finalScore, totalQuestions, finalXP);
      setQuizComplete(true);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswerState(null);
    setAnswerResult(null);
    setScore(0);
    setXpEarned(0);
    setShowFeedback(false);
    setShowHint(false);
    setQuizComplete(false);
    startTimeRef.current = Date.now();
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <PraxyMascot size={80} waving={false} expression="thinking" />
          <p className="font-inter text-charcoal/60 mt-4">Loading questions...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center max-w-md">
          <PraxyMascot size={80} waving={false} expression="sympathetic" />
          <p className="font-inter text-charcoal/70 mt-4 mb-6">{error}</p>
          <Link href={backLink}>
            <button className="px-6 py-3 rounded-[12px] gradient-coral text-white font-nunito font-bold hover:opacity-90 transition-opacity shadow-warm">
              Go Back
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Quiz complete state
  if (quizComplete) {
    const timeSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
    return (
      <QuizComplete
        score={score}
        total={totalQuestions}
        xpEarned={xpEarned}
        timeSeconds={timeSeconds}
        levelId={levelId}
        onRetry={handleRetry}
        onNextLevel={onNextLevel}
      />
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-coral/5 rounded-full blur-3xl" />
        <div className="absolute top-60 right-10 w-80 h-80 bg-yellow/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-1/3 w-72 h-72 bg-mint/8 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative py-4 px-4 md:px-12 border-b border-charcoal/10 bg-cream/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link href={backLink}>
                <button className="w-10 h-10 rounded-full bg-white shadow-warm hover:shadow-warm-lg transition-all flex items-center justify-center hover:-translate-x-0.5">
                  <svg className="w-5 h-5 text-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </Link>
              <h1 className="font-nunito font-bold text-base md:text-lg text-charcoal">
                Level {levelNumber} Quiz
              </h1>
            </div>
            <span className="font-inter font-semibold text-sm text-charcoal/60">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-charcoal/10 rounded-full overflow-hidden">
            <div
              className="h-full gradient-coral transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative py-8 md:py-10 px-4 md:px-12 lg:px-20">
        <div className="max-w-3xl mx-auto">
          {/* Praxy Question Prompt */}
          <div className="mb-8 animate-fade-in-up">
            <div className="flex items-start gap-4 md:gap-5">
              <div className="flex-shrink-0 pt-1">
                <PraxyMascot size={60} waving={false} expression="thinking" />
              </div>
              <div className="relative flex-1">
                <div className="gradient-coral rounded-[16px] p-4 md:p-5 shadow-warm">
                  <p className="font-inter font-medium text-white text-sm md:text-base leading-relaxed">
                    {currentQuestion.prompt}
                  </p>
                  {currentQuestion.context && (
                    <p className="font-inter text-white/80 text-xs md:text-sm mt-2">
                      {currentQuestion.context}
                    </p>
                  )}
                </div>
                <div
                  className="absolute left-0 top-6 -translate-x-2 w-0 h-0"
                  style={{
                    borderTop: '8px solid transparent',
                    borderBottom: '8px solid transparent',
                    borderRight: '10px solid #FF6B6B',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Question Card */}
          <div className="mb-6">
            <QuestionCard
              question={currentQuestion}
              selectedAnswer={selectedAnswer}
              answerState={answerState}
              onSelect={handleSelect}
            />
          </div>

          {/* Hint */}
          {currentQuestion.hint && !answerState && (
            <div className="mb-6 animate-fade-in-up delay-200">
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-2 text-teal font-inter font-semibold text-sm hover:opacity-80 transition-opacity"
              >
                <span className="text-lg">💡</span>
                <span>Need a hint?</span>
                <svg
                  className={`w-4 h-4 transition-transform ${showHint ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showHint && (
                <div className="mt-3 p-4 bg-teal/10 border border-teal/20 rounded-[12px] animate-fade-in-up">
                  <p className="font-inter text-sm text-teal">{currentQuestion.hint}</p>
                </div>
              )}
            </div>
          )}

          {/* Submit / Continue Button */}
          {!showFeedback ? (
            <div className="animate-fade-in-up delay-300">
              <button
                onClick={handleSubmit}
                disabled={!selectedAnswer || !!answerState}
                className={`w-full py-4 rounded-[12px] font-nunito font-bold text-lg transition-all shadow-warm ${
                  selectedAnswer && !answerState
                    ? 'gradient-coral text-white hover:opacity-90 cursor-pointer'
                    : 'bg-charcoal/10 text-charcoal/40 cursor-not-allowed'
                }`}
              >
                Check Answer
              </button>
            </div>
          ) : (
            /* Feedback inline */
            <div className="animate-fade-in-up">
              <div
                className={`rounded-[16px] p-5 mb-4 ${
                  answerResult?.correct
                    ? 'bg-mint/10 border-2 border-mint/30'
                    : 'bg-rose/10 border-2 border-rose/30'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <PraxyMascot
                    size={48}
                    waving={false}
                    expression={answerResult?.correct ? 'celebrating' : 'sympathetic'}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{answerResult?.correct ? '✅' : '❌'}</span>
                      <h3 className="font-nunito font-extrabold text-lg text-charcoal">
                        {answerResult?.correct ? 'Correct!' : 'Not quite!'}
                      </h3>
                      {answerResult?.correct && (
                        <span className="font-inter font-bold text-mint text-sm ml-auto">
                          +{answerResult.xp_earned} XP
                        </span>
                      )}
                    </div>
                    <p className="font-inter text-sm text-charcoal/80 leading-relaxed">
                      {answerResult?.explanation}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleContinue}
                disabled={saving}
                className="w-full py-4 rounded-[12px] gradient-coral text-white font-nunito font-bold text-lg hover:opacity-90 transition-opacity shadow-warm"
              >
                {saving
                  ? 'Saving...'
                  : currentIndex < totalQuestions - 1
                  ? 'Next Question →'
                  : 'See Results →'}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default QuizEngine;
