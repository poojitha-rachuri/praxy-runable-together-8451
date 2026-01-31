import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import PraxyMascot from '../praxy-mascot';

interface QuizCompleteProps {
  score: number;
  total: number;
  xpEarned: number;
  timeSeconds: number;
  levelId: string;
  onRetry: () => void;
  onNextLevel?: () => void;
}

// Confetti piece
const ConfettiPiece = ({ delay, duration, left, color, size }: { delay: number; duration: number; left: number; color: string; size: number }) => (
  <div
    className="absolute animate-confetti-fall"
    style={{
      left: `${left}%`,
      top: '-20px',
      width: size,
      height: size * (Math.random() > 0.5 ? 2 : 1),
      backgroundColor: color,
      borderRadius: Math.random() > 0.5 ? '50%' : '2px',
      animationDelay: `${delay}ms`,
      animationDuration: `${duration}ms`,
      transform: `rotate(${Math.random() * 360}deg)`,
    }}
  />
);

const generateConfetti = (count: number) => {
  const colors = ['#FF6B6B', '#FFD166', '#06D6A0', '#2A9D8F', '#F4A261', '#E76F51'];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    delay: Math.random() * 3000,
    duration: 2500 + Math.random() * 2000,
    left: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 6 + Math.random() * 8,
  }));
};

// Animated counter hook
const useAnimatedCounter = (end: number, duration = 1500, shouldStart = true) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!shouldStart) return;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration, shouldStart]);

  return count;
};

const QuizComplete = ({ score, total, xpEarned, timeSeconds, onRetry, onNextLevel }: QuizCompleteProps) => {
  // Cap score at total to prevent display issues like 120% accuracy
  const cappedScore = Math.min(score, total);
  const percentage = Math.round((cappedScore / total) * 100);
  const isPassing = percentage >= 60;

  const [showConfetti, setShowConfetti] = useState(true);
  const [confettiPieces] = useState(() => generateConfetti(50));
  const [animationStarted, setAnimationStarted] = useState(false);

  const animatedScore = useAnimatedCounter(cappedScore, 1200, animationStarted);
  const animatedXP = useAnimatedCounter(xpEarned, 1500, animationStarted);
  const animatedPercentage = useAnimatedCounter(percentage, 1200, animationStarted);

  useEffect(() => {
    const timer = setTimeout(() => setAnimationStarted(true), 500);
    const confettiTimer = setTimeout(() => setShowConfetti(false), 6000);
    return () => {
      clearTimeout(timer);
      clearTimeout(confettiTimer);
    };
  }, []);

  const getMessage = () => {
    if (percentage === 100) return "Perfect score! You've completely mastered this concept. You're a natural!";
    if (percentage >= 80) return 'Amazing work! You really know your stuff. Ready for the next challenge?';
    if (percentage >= 60) return "Good job! You've got the basics down. Let's keep going!";
    return "Nice try! Practice makes perfect. Let's review and try again!";
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="min-h-screen bg-cream overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-coral/5 rounded-full blur-3xl" />
        <div className="absolute top-60 right-10 w-80 h-80 bg-yellow/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-1/3 w-72 h-72 bg-mint/8 rounded-full blur-3xl" />
      </div>

      {/* Confetti */}
      {showConfetti && isPassing && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
          {confettiPieces.map((piece) => (
            <ConfettiPiece key={piece.id} {...piece} />
          ))}
        </div>
      )}

      <main className="relative py-8 md:py-12 px-4 md:px-12 lg:px-20 min-h-screen flex items-center">
        <div className="max-w-2xl mx-auto w-full">
          {/* Celebration Header */}
          <div className="text-center mb-8 opacity-0 animate-fade-in-up">
            <div className="flex justify-center mb-4">
              <PraxyMascot
                size={100}
                waving={isPassing}
                expression={isPassing ? 'celebrating' : 'sympathetic'}
              />
            </div>
            <div className="inline-block">
              <div className={`rounded-[20px] px-6 py-4 ${isPassing ? 'gradient-coral' : 'bg-orange'} shadow-warm`}>
                <p className="font-inter font-medium text-white text-lg md:text-xl">
                  {isPassing ? 'Level Complete! 🎉' : "Let's try again! 💪"}
                </p>
              </div>
            </div>
          </div>

          {/* Score Card */}
          <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-warm-lg text-center mb-6 opacity-0 animate-fade-in-up delay-200">
            <div className="relative w-44 h-44 mx-auto mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="88" cy="88" r="78" fill="none" stroke="#E5E5E5" strokeWidth="14" />
                <circle
                  cx="88"
                  cy="88"
                  r="78"
                  fill="none"
                  stroke={isPassing ? '#06D6A0' : '#F4A261'}
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray={`${((animationStarted ? percentage : 0) / 100) * 490} 490`}
                  className="transition-all duration-1000 ease-out"
                  style={{ filter: isPassing ? 'drop-shadow(0 0 8px rgba(6, 214, 160, 0.4))' : 'none' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-nunito font-extrabold text-5xl text-charcoal">
                  {animatedScore}/{total}
                </span>
                <span className="font-inter text-base text-charcoal/60 mt-1">Your Score</span>
              </div>
            </div>

            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                isPassing ? 'bg-mint/15 text-mint' : 'bg-orange/15 text-orange'
              }`}
            >
              <span className="font-inter font-semibold text-sm">
                {isPassing ? '✅ Pass Threshold: 60%' : '❌ Need 60% to pass'}
              </span>
            </div>

            {/* Score dots */}
            <div className="flex items-center justify-center gap-2 mt-3">
              {Array.from({ length: total }, (_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all duration-500 ${
                    i < cappedScore ? 'bg-mint scale-100' : 'bg-rose/50 scale-90'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* XP Earned */}
          {isPassing && (
            <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-warm-lg mb-6 opacity-0 animate-fade-in-up delay-300">
              <div className="text-center">
                <div className="inline-flex items-center gap-3 px-8 py-4 bg-yellow/20 rounded-[16px] animate-pulse-glow">
                  <span className="text-4xl">⭐</span>
                  <span className="font-nunito font-extrabold text-3xl text-charcoal">
                    +{animatedXP} XP
                  </span>
                </div>
                <p className="font-inter text-charcoal/50 text-sm mt-2">Earned this level</p>
              </div>
            </div>
          )}

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mb-6 opacity-0 animate-fade-in-up delay-400">
            <div className="bg-white rounded-[16px] p-4 shadow-warm text-center">
              <div className="text-2xl mb-2">⏱️</div>
              <div className="font-nunito font-bold text-xl text-charcoal">{formatTime(timeSeconds)}</div>
              <div className="font-inter text-xs text-charcoal/60">Time taken</div>
            </div>
            <div className="bg-white rounded-[16px] p-4 shadow-warm text-center">
              <div className="text-2xl mb-2">🎯</div>
              <div className="font-nunito font-bold text-xl text-charcoal">{animatedPercentage}%</div>
              <div className="font-inter text-xs text-charcoal/60">Accuracy</div>
            </div>
            <div className="bg-white rounded-[16px] p-4 shadow-warm text-center">
              <div className="text-2xl mb-2">⭐</div>
              <div className="font-nunito font-bold text-xl text-charcoal">+{animatedXP}</div>
              <div className="font-inter text-xs text-charcoal/60">XP</div>
            </div>
          </div>

          {/* Praxy Message */}
          <div className="flex items-start gap-4 mb-6 opacity-0 animate-fade-in-up delay-500">
            <div className="flex-shrink-0">
              <PraxyMascot size={56} waving={false} expression={isPassing ? 'celebrating' : 'sympathetic'} />
            </div>
            <div className="relative flex-1">
              <div
                className={`rounded-[16px] p-4 ${
                  isPassing ? 'bg-mint/10 border border-mint/20' : 'bg-orange/10 border border-orange/20'
                }`}
              >
                <p className="font-inter text-sm md:text-base text-charcoal leading-relaxed">
                  {getMessage()}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 opacity-0 animate-fade-in-up delay-700">
            {isPassing ? (
              <>
                {onNextLevel ? (
                  <button
                    onClick={onNextLevel}
                    className="w-full py-4 rounded-[12px] gradient-coral text-white font-nunito font-bold text-lg hover:opacity-90 transition-all duration-300 shadow-warm hover:shadow-warm-lg hover:-translate-y-0.5"
                  >
                    Continue to Next Level →
                  </button>
                ) : (
                  <Link href="/balance-sheet">
                    <button className="w-full py-4 rounded-[12px] gradient-coral text-white font-nunito font-bold text-lg hover:opacity-90 transition-all duration-300 shadow-warm hover:shadow-warm-lg hover:-translate-y-0.5">
                      Back to Level Hub →
                    </button>
                  </Link>
                )}
                <button
                  onClick={onRetry}
                  className="w-full py-4 rounded-[12px] border-2 border-charcoal/20 bg-white text-charcoal font-nunito font-semibold text-base hover:bg-charcoal/5 transition-all duration-300"
                >
                  Play Again
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onRetry}
                  className="w-full py-4 rounded-[12px] gradient-coral text-white font-nunito font-bold text-lg hover:opacity-90 transition-opacity shadow-warm"
                >
                  Review & Try Again
                </button>
                <Link href="/balance-sheet">
                  <button className="w-full py-4 rounded-[12px] bg-charcoal/5 text-charcoal font-nunito font-semibold text-base hover:bg-charcoal/10 transition-colors">
                    Back to Level Hub
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuizComplete;
