import { Link } from "wouter";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import PraxyMascot from "../components/praxy-mascot";
import { getProgress, getStats, setClerkId, getClerkId, getLevels, LevelData } from "../lib/api";

interface LevelCardProps {
  levelNumber: number;
  title: string;
  concept?: string;
  question: string;
  isLocked: boolean;
  isCurrent: boolean;
  isCompleted?: boolean;
}

const LevelCard = ({ levelNumber, title, concept, question, isLocked, isCurrent, isCompleted }: LevelCardProps) => {
  if (isLocked) {
    return (
      <div className="bg-charcoal/5 rounded-[16px] p-5 md:p-6 border border-charcoal/10 opacity-60">
        <div className="flex items-start gap-4">
          {/* Level badge */}
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-charcoal/10 flex items-center justify-center">
            <span className="text-xl">🔒</span>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-nunito font-700 text-base md:text-lg text-charcoal/50">
                Level {levelNumber}: {title}
              </span>
            </div>
            <p className="font-inter font-400 text-sm text-charcoal/40">{question}</p>
            <p className="font-inter font-400 text-xs text-charcoal/30 mt-2 italic">
              Complete previous level to unlock
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Completed level card
  if (isCompleted) {
    return (
      <div className="bg-white rounded-[16px] p-5 md:p-6 shadow-warm border border-mint/30">
        <div className="flex items-start gap-4">
          {/* Level badge with checkmark */}
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-mint flex items-center justify-center shadow-md">
            <span className="text-xl">✅</span>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-nunito font-700 text-lg md:text-xl text-charcoal">
                Level {levelNumber}: {title}
              </span>
              <span className="px-2 py-0.5 bg-mint/20 text-mint text-xs font-inter font-600 rounded-full">
                Completed
              </span>
            </div>
            
            {concept && (
              <div className="mb-2">
                <span className="inline-block px-3 py-1 bg-teal/10 text-teal text-xs font-inter font-600 rounded-full">
                  Concept: {concept}
                </span>
              </div>
            )}
            
            <p className="font-inter font-400 text-sm md:text-base text-charcoal/70 mb-3">{question}</p>
            
            <Link href="/balance-sheet/level/1">
              <button className="bg-mint/10 text-mint font-inter font-600 text-sm px-5 py-2.5 rounded-[8px] hover:bg-mint/20 transition-all duration-300">
                Review Level →
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Current/unlocked level card
  return (
    <div className={`bg-white rounded-[16px] p-5 md:p-6 shadow-warm hover:shadow-warm-lg transition-all duration-300 ${isCurrent ? 'ring-2 ring-coral ring-offset-2 ring-offset-cream' : ''}`}>
      <div className="flex items-start gap-4">
        {/* Level badge */}
        <div className="flex-shrink-0 w-12 h-12 rounded-full gradient-coral flex items-center justify-center shadow-md">
          <span className="font-nunito font-800 text-lg text-white">{levelNumber}</span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-nunito font-700 text-lg md:text-xl text-charcoal">
              Level {levelNumber}: {title}
            </span>
          </div>
          
          {concept && (
            <div className="mb-2">
              <span className="inline-block px-3 py-1 bg-teal/10 text-teal text-xs font-inter font-600 rounded-full">
                Concept: {concept}
              </span>
            </div>
          )}
          
          <p className="font-inter font-400 text-sm md:text-base text-charcoal/70 mb-3">{question}</p>
          
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🔓</span>
            <span className="font-inter font-500 text-sm text-mint">Ready to start</span>
          </div>
          
          <Link href={`/balance-sheet/level/${levelNumber}`}>
            <button className="gradient-coral text-white font-inter font-600 text-sm md:text-base px-6 py-3 rounded-[8px] shadow-warm hover:shadow-warm-lg transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98]">
              Start Level {levelNumber} →
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

interface CompanyCardProps {
  name: string;
  category: string;
}

const CompanyCard = ({ name, category }: CompanyCardProps) => (
  <div className="bg-white rounded-[12px] p-4 shadow-warm text-center border border-charcoal/5">
    <h4 className="font-nunito font-700 text-base text-charcoal mb-1">{name}</h4>
    <span className="font-inter font-400 text-xs text-charcoal/60">{category}</span>
  </div>
);

// Fallback data in case DB fetch fails
const fallbackLevelsData = [
  { title: "The Liquidity Check", concept: "Current Ratio", question: "Is this company alive?" },
  { title: "The Debt Detective", concept: "Debt-to-Equity", question: "Who owns this company?" },
  { title: "Cash is King", concept: "Cash Ratio", question: "Where's the money?" },
  { title: "Asset Inspector", concept: "Asset Composition", question: "What do they actually own?" },
  { title: "Profit Reality Check", concept: "Working Capital", question: "Does profit = cash?" },
  { title: "Efficiency Expert", concept: "Asset Turnover", question: "How fast does money move?" },
  { title: "Growth Analyzer", concept: "Equity Growth Rate", question: "Is this growth healthy?" },
  { title: "Return Master", concept: "Return on Equity (ROE)", question: "Is this investment worth it?" },
  { title: "Red Flag Spotter", concept: "Financial Red Flags", question: "What's hidden?" },
  { title: "Full Analysis", concept: "Comprehensive Analysis", question: "Put it all together" },
];

// Skeleton for loading state
const LevelCardSkeleton = () => (
  <div className="bg-white/50 rounded-[16px] p-5 md:p-6 animate-pulse">
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-full bg-charcoal/10" />
      <div className="flex-1">
        <div className="h-6 w-3/4 bg-charcoal/10 rounded mb-2" />
        <div className="h-4 w-1/2 bg-charcoal/10 rounded mb-2" />
        <div className="h-4 w-full bg-charcoal/10 rounded" />
      </div>
    </div>
  </div>
);

interface Progress {
  currentLevel: number;
  completedLevels: number[];
  badges: string[];
}

const BalanceSheet = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [totalXP, setTotalXP] = useState(0);
  const [loading, setLoading] = useState(true);
  const [levelsData, setLevelsData] = useState<Array<{ title: string; concept?: string; question: string }>>([]);
  
  useEffect(() => {
    const loadData = async () => {
      if (!isLoaded) return;
      
      setLoading(true);
      
      // Set clerk ID if signed in
      if (isSignedIn && user) {
        setClerkId(user.id);
      }
      
      try {
        // Fetch levels from database (doesn't require auth)
        const dbLevels = await getLevels('balance-sheet');
        if (dbLevels && dbLevels.length > 0) {
          setLevelsData(dbLevels.map(level => ({
            title: level.title,
            concept: level.concept || undefined,
            question: level.subtitle || '',
          })));
        } else {
          // Use fallback data
          setLevelsData(fallbackLevelsData);
        }
        
        // Only fetch progress if we have a clerk ID
        const clerkId = getClerkId();
        if (clerkId) {
          const [progressData, statsData] = await Promise.all([
            getProgress(),
            getStats()
          ]);
          if (progressData) setProgress(progressData);
          if (statsData) setTotalXP(statsData.totalXp);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        // Use fallback data on error
        setLevelsData(fallbackLevelsData);
      }
      setLoading(false);
    };
    loadData();
  }, [isLoaded, isSignedIn, user]);
  
  const currentLevel = progress?.currentLevel || 1;
  const completedLevels = progress?.completedLevels || [];

  return (
    <div className="min-h-screen bg-cream">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-coral/5 rounded-full blur-3xl" />
        <div className="absolute top-60 right-10 w-80 h-80 bg-yellow/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-1/3 w-72 h-72 bg-teal/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative py-4 px-6 md:px-12 border-b border-charcoal/10 bg-cream/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Back button and title */}
          <div className="flex items-center gap-3 md:gap-4">
            <Link href="/dashboard">
              <button className="w-10 h-10 rounded-full bg-white shadow-warm hover:shadow-warm-lg transition-all flex items-center justify-center hover:-translate-x-0.5">
                <svg 
                  className="w-5 h-5 text-charcoal" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </Link>
            <div>
              <h1 className="font-nunito font-700 text-lg md:text-xl text-charcoal">
                SheetSmart
              </h1>
            </div>
          </div>

          {/* Progress text */}
          <div className="flex items-center gap-2 bg-white/70 px-4 py-2 rounded-full shadow-warm">
            <span className="text-base">📊</span>
            <span className="font-inter font-600 text-charcoal text-sm">
              Level {currentLevel} of 10
            </span>
            {totalXP > 0 && (
              <span className="text-sm text-yellow font-semibold ml-2">⭐ {totalXP} XP</span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative py-8 md:py-12 px-6 md:px-12 lg:px-20">
        <div className="max-w-3xl mx-auto">
          
          {/* Praxy Introduction Card */}
          <div className="mb-10 opacity-0 animate-fade-in-up">
            <div className="flex items-start gap-4 md:gap-6">
              {/* Mascot Avatar */}
              <div className="flex-shrink-0 pt-1">
                <PraxyMascot size={48} waving={false} />
              </div>
              
              {/* Speech Bubble */}
              <div className="relative flex-1">
                <div className="gradient-coral rounded-[16px] p-4 md:p-5 shadow-warm">
                  <p className="font-inter font-500 text-white text-sm md:text-base leading-relaxed">
                    {completedLevels.includes(1) 
                      ? "Great progress! You've mastered the Current Ratio. Ready to discover who really owns a company?"
                      : "Let's learn to read balance sheets! We'll start simple — can this company pay its bills? By Level 10, you'll analyze any company like a pro."}
                  </p>
                </div>
                {/* Speech bubble arrow */}
                <div 
                  className="absolute left-0 top-5 -translate-x-2 w-0 h-0"
                  style={{
                    borderTop: '8px solid transparent',
                    borderBottom: '8px solid transparent',
                    borderRight: '10px solid #FF6B6B',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Progress Overview (if any progress) */}
          {completedLevels.length > 0 && (
            <div className="mb-8 opacity-0 animate-fade-in-up delay-50">
              <div className="bg-white rounded-[16px] p-5 shadow-warm">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-nunito font-700 text-charcoal">Your Progress</span>
                  <span className="font-inter text-sm text-charcoal/60">{completedLevels.length}/10 Levels Complete</span>
                </div>
                <div className="h-3 bg-charcoal/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full gradient-coral rounded-full transition-all duration-700"
                    style={{ width: `${(completedLevels.length / 10) * 100}%` }}
                  />
                </div>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <span className="text-mint font-inter font-500">✅ {completedLevels.length} Completed</span>
                  <span className="text-coral font-inter font-500">⭐ {totalXP} XP Total</span>
                </div>
              </div>
            </div>
          )}

          {/* Level Roadmap */}
          <div className="mb-12">
            <h2 className="font-nunito font-700 text-xl md:text-2xl text-charcoal mb-6 opacity-0 animate-fade-in-up delay-100">
              Your Learning Journey
            </h2>
            
            <div className="relative">
              {/* Vertical connector line */}
              <div className="absolute left-6 top-14 bottom-14 w-0.5 bg-charcoal/10 hidden md:block" />
              
              {/* Levels */}
              <div className="space-y-4">
                {loading || levelsData.length === 0 ? (
                  // Show skeletons while loading
                  Array.from({ length: 5 }).map((_, index) => (
                    <LevelCardSkeleton key={index} />
                  ))
                ) : (
                  levelsData.map((level, index) => {
                    const levelNumber = index + 1;
                    const isCompleted = completedLevels.includes(levelNumber);
                    const isCurrent = levelNumber === currentLevel;
                    const isLocked = levelNumber > currentLevel && !isCompleted;
                    
                    return (
                      <div 
                        key={levelNumber} 
                        className={`opacity-0 animate-fade-in-up`}
                        style={{ animationDelay: `${150 + index * 50}ms` }}
                      >
                        <LevelCard
                          levelNumber={levelNumber}
                          title={level.title}
                          concept={level.concept}
                          question={level.question}
                          isLocked={isLocked}
                          isCurrent={isCurrent}
                          isCompleted={isCompleted}
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Practice Companies Section */}
          <div className="opacity-0 animate-fade-in-up delay-700">
            <h3 className="font-nunito font-700 text-lg md:text-xl text-charcoal mb-4 text-center">
              You'll practice with real companies:
            </h3>
            
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              <CompanyCard name="Tesla" category="Tech/Auto" />
              <CompanyCard name="Zomato" category="Food Delivery" />
              <CompanyCard name="FailCorp" category="Struggling Startup (Fictional)" />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default BalanceSheet;
