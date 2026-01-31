import { Link, useSearch } from "wouter";
import PraxyMascot from "../components/praxy-mascot";
import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { updateProgress, saveSession, awardBadge, getClerkId, setClerkId } from "../lib/api";

// Confetti piece component
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

// Generate confetti pieces
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
const useAnimatedCounter = (end: number, duration: number = 1500, shouldStart: boolean = true) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!shouldStart) return;
    
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [end, duration, shouldStart]);
  
  return count;
};

const BalanceSheetLevel1Complete = () => {
  const { user, isSignedIn } = useUser();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  
  const score = parseInt(params.get("score") || "4", 10);
  const total = parseInt(params.get("total") || "5", 10);
  const xp = parseInt(params.get("xp") || "150", 10);
  const timeParam = params.get("time");
  const timeSeconds = timeParam ? parseInt(timeParam, 10) : undefined;
  
  // Cap score at total to prevent display issues like 120% accuracy
  const cappedScore = Math.min(score, total);
  const percentage = Math.round((cappedScore / total) * 100);
  const isPassing = percentage >= 60;

  const [showConfetti, setShowConfetti] = useState(true);
  const [confettiPieces] = useState(() => generateConfetti(50));
  const [animationStarted, setAnimationStarted] = useState(false);
  const [dataSaved, setDataSaved] = useState(false);
  const saveAttempted = useRef(false);
  
  // Animated counters
  const animatedScore = useAnimatedCounter(cappedScore, 1200, animationStarted);
  const animatedXP = useAnimatedCounter(xp, 1500, animationStarted);
  const animatedPercentage = useAnimatedCounter(percentage, 1200, animationStarted);

  // Start animations after mount and save completion to API and localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationStarted(true);
    }, 500);

    // Save completion to API and localStorage
    const saveCompletion = async () => {
      if (saveAttempted.current) return;
      saveAttempted.current = true;

      // Ensure we have the clerk ID
      if (isSignedIn && user) {
        setClerkId(user.id);
      }
      
      const clerkId = getClerkId();
      if (!clerkId) {
        console.warn('No clerkId available, skipping API save');
        return;
      }

      // Then save to API
      try {
        // Save the quiz session (use cappedScore to prevent invalid data)
        const sessionResult = await saveSession(1, cappedScore, total, timeSeconds, undefined, 'balance-sheet');
        console.log('Session saved:', sessionResult);
        
        // Update progress if passing
        if (isPassing) {
          const progressResult = await updateProgress(1, cappedScore, true, 'survivor', 'balance-sheet');
          console.log('Progress updated:', progressResult);
          
          // Award badge
          await awardBadge('survivor', 'Survivor Badge', 'balance-sheet');
        }
        
        setDataSaved(true);
        console.log('Progress saved to API successfully');
      } catch (error) {
        console.error('Failed to save progress to API:', error);
      }
    };

    saveCompletion();

    // Stop confetti after a while
    const confettiTimer = setTimeout(() => {
      setShowConfetti(false);
    }, 6000);

    return () => {
      clearTimeout(timer);
      clearTimeout(confettiTimer);
    };
  }, [isPassing, cappedScore, total, timeSeconds, isSignedIn, user]);

  const getMessage = () => {
    if (percentage === 100) {
      return "Perfect score! You've completely mastered the Current Ratio concept. You're a natural!";
    }
    if (percentage >= 80) {
      return "You crushed Level 1! 🎉 Ready to take on the Debt Detective challenge?";
    }
    if (percentage >= 60) {
      return "Good job! You've got the basics down. Level 2 awaits!";
    }
    return "Nice try! The Current Ratio takes practice. Let's review and try again!";
  };

  // Score dots visualization
  const ScoreDots = () => (
    <div className="flex items-center justify-center gap-2 mt-3">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`w-3 h-3 rounded-full transition-all duration-500 ${
            i < cappedScore ? 'bg-mint scale-100' : 'bg-rose/50 scale-90'
          }`}
          style={{ animationDelay: `${i * 150 + 800}ms` }}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-cream overflow-hidden">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-coral/5 rounded-full blur-3xl" />
        <div className="absolute top-60 right-10 w-80 h-80 bg-yellow/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-1/3 w-72 h-72 bg-mint/8 rounded-full blur-3xl" />
      </div>

      {/* Confetti animation */}
      {showConfetti && isPassing && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
          {confettiPieces.map((piece) => (
            <ConfettiPiece key={piece.id} {...piece} />
          ))}
        </div>
      )}

      {/* Main Content */}
      <main className="relative py-8 md:py-12 px-4 md:px-12 lg:px-20 min-h-screen flex items-center">
        <div className="max-w-2xl mx-auto w-full">
          {/* Celebration Header */}
          <div className="text-center mb-8 opacity-0 animate-fade-in-up">
            {/* Large Praxy celebrating */}
            <div className="flex justify-center mb-4">
              <PraxyMascot
                size={100}
                waving={isPassing}
                expression={isPassing ? "celebrating" : "sympathetic"}
              />
            </div>
            
            {/* Speech bubble */}
            <div className="inline-block relative">
              <div className={`rounded-[20px] px-6 py-4 ${isPassing ? 'gradient-coral' : 'bg-orange'} shadow-warm`}>
                <p className="font-inter font-500 text-white text-lg md:text-xl">
                  {isPassing ? "You crushed Level 1! 🎉" : "Let's try again! 💪"}
                </p>
              </div>
            </div>
          </div>

          {/* Score Card */}
          <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-warm-lg text-center mb-6 opacity-0 animate-fade-in-up delay-200">
            {/* Circular Score Display */}
            <div className="relative w-44 h-44 mx-auto mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="88"
                  cy="88"
                  r="78"
                  fill="none"
                  stroke="#E5E5E5"
                  strokeWidth="14"
                />
                <circle
                  cx="88"
                  cy="88"
                  r="78"
                  fill="none"
                  stroke={isPassing ? "#06D6A0" : "#F4A261"}
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray={`${(animationStarted ? percentage : 0) / 100 * 490} 490`}
                  className="transition-all duration-1000 ease-out"
                  style={{
                    filter: isPassing ? 'drop-shadow(0 0 8px rgba(6, 214, 160, 0.4))' : 'none'
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-nunito font-extrabold text-5xl text-charcoal">
                  {animatedScore}/{total}
                </span>
                <span className="font-inter text-base text-charcoal/60 mt-1">Your Score</span>
              </div>
            </div>

            {/* Pass threshold */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-2 ${
              isPassing ? 'bg-mint/15 text-mint' : 'bg-orange/15 text-orange'
            }`}>
              <span className="font-inter font-600 text-sm">
                {isPassing ? '✅ Pass Threshold: 60%' : '❌ Need 60% to pass'}
              </span>
            </div>

            {/* Score dots */}
            <ScoreDots />
          </div>

          {/* Rewards Section */}
          {isPassing && (
            <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-warm-lg mb-6 opacity-0 animate-fade-in-up delay-300">
              {/* XP Earned - Animated */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-3 px-8 py-4 bg-yellow/20 rounded-[16px] animate-pulse-glow">
                  <span className="text-4xl">⭐</span>
                  <span className="font-nunito font-extrabold text-3xl text-charcoal">
                    +{animatedXP} XP
                  </span>
                </div>
                <p className="font-inter text-charcoal/50 text-sm mt-2">Earned this level</p>
              </div>

              {/* Badge Card */}
              <div className="relative bg-gradient-to-br from-yellow/10 via-yellow/5 to-transparent rounded-[16px] p-6 border border-yellow/30 overflow-hidden">
                {/* Decorative shine */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow/20 rounded-full blur-2xl" />
                
                <div className="relative flex items-center gap-5">
                  {/* Trophy/Badge Icon */}
                  <div className="relative flex-shrink-0">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow via-orange/80 to-yellow flex items-center justify-center shadow-lg">
                      <span className="text-4xl">🏆</span>
                    </div>
                    {/* Glow ring */}
                    <div className="absolute inset-0 rounded-full border-4 border-yellow/30 animate-pulse" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-nunito font-extrabold text-xl text-charcoal mb-1">
                      🎖️ Survivor Badge
                    </h3>
                    <p className="font-inter text-charcoal/70 text-sm">
                      You can spot if a company is alive!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mb-6 opacity-0 animate-fade-in-up delay-400">
            <div className="bg-white rounded-[16px] p-4 shadow-warm text-center">
              <div className="text-2xl mb-2">⏱️</div>
              <div className="font-nunito font-bold text-xl text-charcoal">
                {timeSeconds ? `${Math.floor(timeSeconds / 60)}m ${timeSeconds % 60}s` : '2m 34s'}
              </div>
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
              <PraxyMascot
                size={56}
                waving={false}
                expression={isPassing ? "celebrating" : "sympathetic"}
              />
            </div>
            <div className="relative flex-1">
              <div
                className={`rounded-[16px] p-4 ${
                  isPassing
                    ? "bg-mint/10 border border-mint/20"
                    : "bg-orange/10 border border-orange/20"
                }`}
              >
                <p className="font-inter text-sm md:text-base text-charcoal leading-relaxed">
                  {getMessage()}
                </p>
              </div>
            </div>
          </div>

          {/* Next Steps Card - Level 2 Unlocked */}
          {isPassing && (
            <div className="bg-white rounded-[20px] p-6 shadow-warm-lg mb-6 border-2 border-mint/30 opacity-0 animate-fade-in-up delay-600 relative overflow-hidden">
              {/* Pulsing glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-mint/5 via-teal/10 to-mint/5 animate-shimmer" />
              
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl animate-bounce">🔓</span>
                  <h3 className="font-nunito font-extrabold text-xl text-mint uppercase tracking-wide">
                    Level 2 Unlocked!
                  </h3>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal to-mint flex items-center justify-center shadow-md flex-shrink-0">
                    <span className="font-nunito font-extrabold text-xl text-white">2</span>
                  </div>
                  <div>
                    <h4 className="font-nunito font-bold text-lg text-charcoal mb-1">
                      Level 2: The Debt Detective
                    </h4>
                    <p className="font-inter text-charcoal/70 text-sm">
                      Who owns this company?
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Key Takeaway Card */}
          <div className="bg-teal rounded-[16px] p-5 md:p-6 shadow-warm mb-6 opacity-0 animate-fade-in-up delay-700">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <h3 className="font-nunito font-bold text-white text-lg mb-2">
                  Key Takeaway from Level 1
                </h3>
                <p className="font-inter text-white/90 text-sm leading-relaxed">
                  <strong>Current Ratio = Current Assets ÷ Current Liabilities</strong>
                  <br />
                  Above 1.5 is healthy, 1.0-1.5 is acceptable, below 1.0 is a red flag.
                  Always check if a company can pay its short-term bills first!
                </p>
              </div>
            </div>
          </div>

          {/* Sync indicator */}
          {dataSaved && (
            <div className="text-center mb-4 opacity-0 animate-fade-in-up delay-700">
              <span className="inline-flex items-center gap-2 text-sm text-mint/70">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Progress saved
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 opacity-0 animate-fade-in-up delay-700">
            {isPassing ? (
              <>
                <Link href="/balance-sheet">
                  <button className="w-full py-4 rounded-[12px] gradient-coral text-white font-nunito font-bold text-lg hover:opacity-90 transition-all duration-300 shadow-warm hover:shadow-warm-lg hover:-translate-y-0.5">
                    Continue to Level 2 →
                  </button>
                </Link>
                <Link href="/balance-sheet/level/1">
                  <button className="w-full py-4 rounded-[12px] border-2 border-charcoal/20 bg-white text-charcoal font-nunito font-semibold text-base hover:bg-charcoal/5 transition-all duration-300">
                    📖 Review Answers
                  </button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/balance-sheet/level/1">
                  <button className="w-full py-4 rounded-[12px] gradient-coral text-white font-nunito font-bold text-lg hover:opacity-90 transition-opacity shadow-warm">
                    Review & Try Again
                  </button>
                </Link>
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

export default BalanceSheetLevel1Complete;
