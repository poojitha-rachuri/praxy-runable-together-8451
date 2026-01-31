import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import PraxyMascot from "../components/praxy-mascot";
import { saveSession, updateProgress, getQuestionsByLevel, QuestionData } from "../lib/api";

// Types for quiz
interface CompanyComparisonOption {
  name: string;
  currentAssets: string;
  currentLiabilities: string;
  ratio: string;
}

interface QuizQuestion {
  id: number;
  type: "company-comparison" | "yes-no" | "multiple-choice" | "ratio-comparison" | "visual-comparison";
  praxyMessage: string;
  options: string[] | CompanyComparisonOption[];
  correctAnswer: number;
  hint?: string;
  explanations: {
    correct: string;
    wrong: string;
  };
}

// Fallback quiz questions (used if DB fetch fails)
const fallbackQuizQuestions: QuizQuestion[] = [
  {
    id: 1,
    type: "company-comparison",
    praxyMessage: "Quick check! Which company can pay its short-term bills?",
    options: [
      {
        name: "COMPANY A",
        currentAssets: "$500K",
        currentLiabilities: "$300K",
        ratio: "1.67",
      },
      {
        name: "COMPANY B",
        currentAssets: "$300K",
        currentLiabilities: "$450K",
        ratio: "0.67",
      },
    ] as CompanyComparisonOption[],
    correctAnswer: 0,
    hint: "Remember: Above 1.5 = healthy, Below 1.0 = danger zone",
    explanations: {
      correct: "Company A has a ratio of 1.67, which means they have $1.67 for every $1 they owe. That's healthy!",
      wrong: "Company B has a ratio of 0.67, meaning they owe more than they have in liquid assets. They'd struggle to pay their bills!",
    },
  },
  {
    id: 2,
    type: "yes-no",
    praxyMessage: "Company X has a Current Ratio of 0.8. Can they comfortably pay their short-term debts?",
    options: ["YES", "NO"],
    correctAnswer: 1,
    explanations: {
      correct: "A ratio below 1.0 means they owe more than they have in liquid assets. They'd struggle to cover their short-term obligations.",
      wrong: "With a ratio of 0.8, they only have $0.80 for every $1 they owe. That's in the danger zone!",
    },
  },
  {
    id: 3,
    type: "multiple-choice",
    praxyMessage: "A company's Current Ratio improved from 0.9 to 1.3. What happened?",
    options: [
      "They're now in the danger zone",
      "They moved from danger to acceptable range",
      "No significant change",
      "They have too much cash",
    ],
    correctAnswer: 1,
    explanations: {
      correct: "Going from 0.9 (below 1.0 = danger) to 1.3 (between 1.0-1.5 = acceptable) is a positive improvement!",
      wrong: "0.9 is below 1.0 (danger zone). 1.3 is between 1.0-1.5 (acceptable range). This is actually a healthy improvement!",
    },
  },
  {
    id: 4,
    type: "ratio-comparison",
    praxyMessage: "Which company has better liquidity?",
    options: [
      { name: "Option A", currentAssets: "", currentLiabilities: "", ratio: "2.1" },
      { name: "Option B", currentAssets: "", currentLiabilities: "", ratio: "0.95" },
    ] as CompanyComparisonOption[],
    correctAnswer: 0,
    explanations: {
      correct: "A ratio of 2.1 means they have over $2 for every $1 they owe — very healthy liquidity!",
      wrong: "0.95 is below 1.0, which means they owe more than they can easily pay. Option A with 2.1 has much better liquidity.",
    },
  },
  {
    id: 5,
    type: "yes-no",
    praxyMessage: "Tesla's Current Ratio is 1.67. Is this considered healthy?",
    options: ["YES", "NO"],
    correctAnswer: 0,
    explanations: {
      correct: "Above 1.5 is healthy! Tesla has $1.67 for every $1 of short-term debt. They're in great shape.",
      wrong: "1.67 is above the 1.5 threshold for healthy liquidity. Tesla can comfortably pay its short-term bills!",
    },
  },
];

// Helper function to convert DB questions to quiz format
const convertDbQuestionsToQuizFormat = (dbQuestions: QuestionData[]): QuizQuestion[] => {
  return dbQuestions.map((q, index) => {
    const type = q.type === 'visual-comparison' ? 'company-comparison' : q.type as any;
    
    let options: string[] | CompanyComparisonOption[];
    let correctAnswer = 0;
    
    if (q.type === 'visual-comparison') {
      // Convert visual comparison options to company cards
      options = q.options.map(opt => ({
        name: opt.label,
        currentAssets: opt.data?.currentAssets ? `${(opt.data.currentAssets / 1000).toFixed(0)}K` : '',
        currentLiabilities: opt.data?.currentLiabilities ? `${(opt.data.currentLiabilities / 1000).toFixed(0)}K` : '',
        ratio: opt.data?.ratio?.toString() || '',
      }));
      correctAnswer = q.options.findIndex(opt => opt.value === q.correct_answer);
    } else if (q.type === 'yes-no') {
      options = q.options.map(opt => opt.label.toUpperCase());
      correctAnswer = q.options.findIndex(opt => opt.value === q.correct_answer);
    } else {
      // Multiple choice
      options = q.options.map(opt => opt.label);
      correctAnswer = q.options.findIndex(opt => opt.value === q.correct_answer);
    }
    
    return {
      id: index + 1,
      type,
      praxyMessage: q.prompt,
      options,
      correctAnswer: correctAnswer >= 0 ? correctAnswer : 0,
      hint: q.hint || undefined,
      explanations: {
        correct: q.explanation || 'Correct!',
        wrong: q.explanation || 'Not quite right.',
      },
    };
  });
};

// Step indicator component
interface StepIndicatorProps {
  currentStep: "learn" | "quiz" | "complete";
}

const StepIndicator = ({ currentStep }: StepIndicatorProps) => {
  const steps = [
    { id: "learn", label: "Learn" },
    { id: "quiz", label: "Quiz" },
    { id: "complete", label: "Complete" },
  ];

  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isPast = steps.findIndex((s) => s.id === currentStep) > index;

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-inter font-semibold transition-all ${
                  isActive
                    ? "gradient-coral text-white shadow-warm"
                    : isPast
                    ? "bg-mint text-white"
                    : "bg-charcoal/10 text-charcoal/40"
                }`}
              >
                {isPast ? "✓" : index + 1}
              </div>
              <span
                className={`text-xs mt-1 font-inter ${
                  isActive
                    ? "text-coral font-semibold"
                    : isPast
                    ? "text-mint font-medium"
                    : "text-charcoal/40"
                }`}
              >
                {step.label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div
                className={`w-8 md:w-12 h-0.5 mx-1 mt-[-16px] ${
                  isPast ? "bg-mint" : "bg-charcoal/10"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

// Company comparison card component
interface CompanyCardProps {
  company: CompanyComparisonOption;
  isSelected: boolean;
  onClick: () => void;
  showRatioOnly?: boolean;
}

const CompanyCard = ({ company, isSelected, onClick, showRatioOnly = false }: CompanyCardProps) => (
  <button
    onClick={onClick}
    className={`flex-1 p-4 md:p-5 rounded-[16px] border-2 transition-all text-left ${
      isSelected
        ? "border-teal bg-teal/5 shadow-warm-lg"
        : "border-charcoal/10 bg-white hover:border-charcoal/20 hover:shadow-warm"
    }`}
  >
    <h4 className="font-nunito font-bold text-charcoal text-base md:text-lg mb-3">
      {company.name}
    </h4>
    {!showRatioOnly && (
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="font-inter text-charcoal/60">Current Assets:</span>
          <span className="font-inter font-semibold text-mint">{company.currentAssets}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="font-inter text-charcoal/60">Current Liab:</span>
          <span className="font-inter font-semibold text-orange">{company.currentLiabilities}</span>
        </div>
      </div>
    )}
    <div className="flex items-center justify-between pt-3 border-t border-charcoal/10">
      <span className="font-inter text-sm text-charcoal/60">Current Ratio:</span>
      <span className="font-nunito font-extrabold text-xl text-charcoal">{company.ratio}</span>
    </div>
    <div
      className={`mt-4 py-2 rounded-[8px] text-center font-inter font-semibold text-sm transition-all ${
        isSelected
          ? "gradient-coral text-white"
          : "bg-charcoal/5 text-charcoal/60"
      }`}
    >
      {isSelected ? "SELECTED ✓" : "SELECT"}
    </div>
  </button>
);

// Simple option card component
interface OptionCardProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

const OptionCard = ({ label, isSelected, onClick }: OptionCardProps) => (
  <button
    onClick={onClick}
    className={`flex-1 p-5 md:p-6 rounded-[16px] border-2 transition-all ${
      isSelected
        ? "border-teal bg-teal/5 shadow-warm-lg"
        : "border-charcoal/10 bg-white hover:border-charcoal/20 hover:shadow-warm"
    }`}
  >
    <span className="font-nunito font-bold text-xl md:text-2xl text-charcoal">{label}</span>
    <div
      className={`mt-4 py-2 rounded-[8px] text-center font-inter font-semibold text-sm transition-all ${
        isSelected ? "gradient-coral text-white" : "bg-charcoal/5 text-charcoal/60"
      }`}
    >
      {isSelected ? "SELECTED ✓" : "SELECT"}
    </div>
  </button>
);

// Multiple choice card component
interface MultipleChoiceCardProps {
  label: string;
  index: number;
  isSelected: boolean;
  onClick: () => void;
}

const MultipleChoiceCard = ({ label, index, isSelected, onClick }: MultipleChoiceCardProps) => {
  const letters = ["A", "B", "C", "D"];
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-[12px] border-2 transition-all text-left flex items-center gap-3 ${
        isSelected
          ? "border-teal bg-teal/5 shadow-warm"
          : "border-charcoal/10 bg-white hover:border-charcoal/20 hover:shadow-warm"
      }`}
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-nunito font-bold text-lg flex-shrink-0 ${
          isSelected ? "gradient-coral text-white" : "bg-charcoal/10 text-charcoal"
        }`}
      >
        {letters[index]}
      </div>
      <span className="font-inter font-medium text-charcoal text-sm md:text-base">{label}</span>
    </button>
  );
};

// Feedback modal component
interface FeedbackModalProps {
  isCorrect: boolean;
  explanation: { correct: string; wrong: string };
  selectedAnswer: string;
  correctAnswer: string;
  onContinue: () => void;
  xpEarned: number;
}

const FeedbackModal = ({
  isCorrect,
  explanation,
  selectedAnswer,
  correctAnswer,
  onContinue,
  xpEarned,
}: FeedbackModalProps) => (
  <div className="fixed inset-0 bg-charcoal/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-cream rounded-[20px] p-6 md:p-8 max-w-lg w-full shadow-warm-lg animate-fade-in-up max-h-[90vh] overflow-y-auto">
      {/* Header with icon */}
      <div className="text-center mb-6">
        <div
          className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl mb-3 ${
            isCorrect ? "bg-mint/20" : "bg-rose/20"
          }`}
        >
          {isCorrect ? "✅" : "❌"}
        </div>
        <h3 className="font-nunito font-extrabold text-2xl text-charcoal">
          {isCorrect ? "Correct!" : "Not quite!"}
        </h3>
        {isCorrect && (
          <p className="font-inter font-bold text-mint text-lg mt-1">+{xpEarned} XP</p>
        )}
      </div>

      {/* Praxy Avatar with message */}
      <div className="flex items-start gap-3 mb-6">
        <div className="flex-shrink-0">
          <PraxyMascot
            size={48}
            waving={false}
            expression={isCorrect ? "celebrating" : "sympathetic"}
          />
        </div>
        <div className="relative flex-1">
          <div
            className={`rounded-[12px] p-4 ${
              isCorrect ? "bg-mint/10 border border-mint/20" : "bg-rose/10 border border-rose/20"
            }`}
          >
            <p className="font-inter text-sm text-charcoal leading-relaxed">
              {isCorrect
                ? explanation.correct
                : "Easy mistake! Let me explain..."}
            </p>
          </div>
        </div>
      </div>

      {/* Wrong answer explanation cards */}
      {!isCorrect && (
        <div className="space-y-3 mb-6">
          <div className="p-4 rounded-[12px] border-2 border-rose/30 bg-rose/5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">❌</span>
              <span className="font-inter font-semibold text-rose text-sm uppercase tracking-wide">
                Your Answer
              </span>
            </div>
            <p className="font-inter text-sm text-charcoal">{selectedAnswer}</p>
            <p className="font-inter text-sm text-charcoal/70 mt-2">{explanation.wrong}</p>
          </div>

          <div className="p-4 rounded-[12px] border-2 border-mint/30 bg-mint/5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">✅</span>
              <span className="font-inter font-semibold text-mint text-sm uppercase tracking-wide">
                Correct Answer
              </span>
            </div>
            <p className="font-inter text-sm text-charcoal">{correctAnswer}</p>
            <p className="font-inter text-sm text-charcoal/70 mt-2">{explanation.correct}</p>
          </div>
        </div>
      )}

      {/* Continue button */}
      <button
        onClick={onContinue}
        className="w-full py-4 rounded-[12px] gradient-coral text-white font-nunito font-bold text-lg hover:opacity-90 transition-opacity shadow-warm"
      >
        {isCorrect ? "Next Question →" : "Got it, Continue →"}
      </button>
    </div>
  </div>
);

// Main Quiz Page Component
const BalanceSheetLevel1Quiz = () => {
  const [, setLocation] = useLocation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [saving, setSaving] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(fallbackQuizQuestions);
  const [loading, setLoading] = useState(true);
  
  // Track quiz start time
  const startTimeRef = useRef<number>(Date.now());

  // Load questions from DB
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const dbQuestions = await getQuestionsByLevel('balance-sheet', 1);
        if (dbQuestions && dbQuestions.length > 0) {
          const convertedQuestions = convertDbQuestionsToQuizFormat(dbQuestions);
          setQuizQuestions(convertedQuestions);
        }
      } catch (error) {
        console.error('Failed to load questions from DB:', error);
        // Keep using fallback questions
      }
      setLoading(false);
    };
    loadQuestions();
  }, []);

  const question = quizQuestions[currentQuestion];
  const progressPercent = ((currentQuestion + 1) / quizQuestions.length) * 100;
  const xpPerQuestion = 30;

  // Show loading state
  if (loading || !question) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-coral border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="font-inter text-charcoal/60">Loading quiz...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === question.correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
    }
    setShowFeedback(true);
  };

  const handleContinue = async () => {
    setShowFeedback(false);
    setSelectedAnswer(null);
    setShowHint(false);

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Quiz complete - calculate final results
      // Note: score state already includes the last answer (incremented in handleSubmit)
      // so we just use score directly - no need to add 1 again
      setSaving(true);
      const finalScore = score;
      const totalXP = finalScore * xpPerQuestion;
      const timeSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
      
      // Navigate to complete page (saving happens there)
      setLocation(`/balance-sheet/level/1/complete?score=${finalScore}&total=${quizQuestions.length}&xp=${totalXP}&time=${timeSeconds}`);
    }
  };

  const getSelectedAnswerLabel = () => {
    if (selectedAnswer === null) return "";
    if (question.type === "company-comparison" || question.type === "ratio-comparison") {
      return (question.options[selectedAnswer] as CompanyComparisonOption).name;
    }
    return question.options[selectedAnswer] as string;
  };

  const getCorrectAnswerLabel = () => {
    if (question.type === "company-comparison" || question.type === "ratio-comparison") {
      return (question.options[question.correctAnswer] as CompanyComparisonOption).name;
    }
    return question.options[question.correctAnswer] as string;
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Background decorative elements */}
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
              <Link href="/balance-sheet/level/1">
                <button className="w-10 h-10 rounded-full bg-white shadow-warm hover:shadow-warm-lg transition-all flex items-center justify-center hover:-translate-x-0.5">
                  <svg
                    className="w-5 h-5 text-charcoal"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
              </Link>
              <h1 className="font-nunito font-bold text-base md:text-lg text-charcoal">
                Level 1 Quiz
              </h1>
            </div>
            <span className="font-inter font-semibold text-sm text-charcoal/60">
              Question {currentQuestion + 1} of {quizQuestions.length}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-charcoal/10 rounded-full overflow-hidden mb-4">
            <div
              className="h-full gradient-coral transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Step indicator */}
          <StepIndicator currentStep="quiz" />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative py-8 md:py-10 px-4 md:px-12 lg:px-20">
        <div className="max-w-3xl mx-auto">
          {/* Praxy Question Card */}
          <div className="mb-8 animate-fade-in-up">
            <div className="flex items-start gap-4 md:gap-5">
              <div className="flex-shrink-0 pt-1">
                <PraxyMascot size={60} waving={false} expression="thinking" />
              </div>
              <div className="relative flex-1">
                <div className="gradient-coral rounded-[16px] p-4 md:p-5 shadow-warm">
                  <p className="font-inter font-medium text-white text-sm md:text-base leading-relaxed">
                    {question.praxyMessage}
                  </p>
                </div>
                <div
                  className="absolute left-0 top-6 -translate-x-2 w-0 h-0"
                  style={{
                    borderTop: "8px solid transparent",
                    borderBottom: "8px solid transparent",
                    borderRight: "10px solid #FF6B6B",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="bg-white rounded-[16px] p-5 md:p-8 shadow-warm mb-6 animate-fade-in-up delay-100">
            {/* Company Comparison */}
            {question.type === "company-comparison" && (
              <div className="flex flex-col md:flex-row gap-4">
                {(question.options as CompanyComparisonOption[]).map((company, index) => (
                  <CompanyCard
                    key={company.name}
                    company={company}
                    isSelected={selectedAnswer === index}
                    onClick={() => setSelectedAnswer(index)}
                  />
                ))}
              </div>
            )}

            {/* Ratio Comparison */}
            {question.type === "ratio-comparison" && (
              <div className="flex flex-col md:flex-row gap-4">
                {(question.options as CompanyComparisonOption[]).map((company, index) => (
                  <CompanyCard
                    key={company.name}
                    company={company}
                    isSelected={selectedAnswer === index}
                    onClick={() => setSelectedAnswer(index)}
                    showRatioOnly
                  />
                ))}
              </div>
            )}

            {/* Yes/No */}
            {question.type === "yes-no" && (
              <div className="flex gap-4">
                {(question.options as string[]).map((option, index) => (
                  <OptionCard
                    key={option}
                    label={option}
                    isSelected={selectedAnswer === index}
                    onClick={() => setSelectedAnswer(index)}
                  />
                ))}
              </div>
            )}

            {/* Multiple Choice */}
            {question.type === "multiple-choice" && (
              <div className="space-y-3">
                {(question.options as string[]).map((option, index) => (
                  <MultipleChoiceCard
                    key={option}
                    label={option}
                    index={index}
                    isSelected={selectedAnswer === index}
                    onClick={() => setSelectedAnswer(index)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Hint Section */}
          {question.hint && (
            <div className="mb-6 animate-fade-in-up delay-200">
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-2 text-teal font-inter font-semibold text-sm hover:opacity-80 transition-opacity"
              >
                <span className="text-lg">💡</span>
                <span>Need a hint?</span>
                <svg
                  className={`w-4 h-4 transition-transform ${showHint ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {showHint && (
                <div className="mt-3 p-4 bg-teal/10 border border-teal/20 rounded-[12px] animate-fade-in-up">
                  <p className="font-inter text-sm text-teal">{question.hint}</p>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="animate-fade-in-up delay-300">
            <button
              onClick={handleSubmit}
              disabled={selectedAnswer === null}
              className={`w-full py-4 rounded-[12px] font-nunito font-bold text-lg transition-all shadow-warm ${
                selectedAnswer !== null
                  ? "gradient-coral text-white hover:opacity-90 cursor-pointer"
                  : "bg-charcoal/10 text-charcoal/40 cursor-not-allowed"
              }`}
            >
              Check Answer
            </button>
          </div>
        </div>
      </main>

      {/* Feedback Modal */}
      {showFeedback && (
        <FeedbackModal
          isCorrect={selectedAnswer === question.correctAnswer}
          explanation={question.explanations}
          selectedAnswer={getSelectedAnswerLabel()}
          correctAnswer={getCorrectAnswerLabel()}
          onContinue={handleContinue}
          xpEarned={xpPerQuestion}
        />
      )}
    </div>
  );
};

export default BalanceSheetLevel1Quiz;
