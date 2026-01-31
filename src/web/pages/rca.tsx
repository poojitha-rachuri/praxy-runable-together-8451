import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useUser } from '@clerk/clerk-react';
import { FiSearch, FiLock, FiCheck, FiArrowLeft, FiTrendingDown } from 'react-icons/fi';
import PraxyAvatar from '../components/ui/PraxyAvatar';
import { getCases, getRCAProgress, type RCACase } from '../lib/rca';

// Difficulty badge colors
const difficultyConfig = {
  beginner: { bg: 'bg-teal/10', text: 'text-teal', label: 'Beginner' },
  intermediate: { bg: 'bg-yellow/20', text: 'text-yellow-700', label: 'Intermediate' },
  advanced: { bg: 'bg-coral/10', text: 'text-coral', label: 'Advanced' },
};

interface CaseCardProps {
  rcaCase: RCACase;
  isLocked: boolean;
  isCompleted: boolean;
}

const CaseCard = ({ rcaCase, isLocked, isCompleted }: CaseCardProps) => {
  const difficulty = difficultyConfig[rcaCase.difficulty] || difficultyConfig.beginner;

  const cardContent = (
    <div 
      className={`relative bg-white rounded-[16px] p-6 shadow-warm transition-all duration-300 ${
        isLocked 
          ? 'opacity-60 cursor-not-allowed' 
          : 'hover:shadow-warm-lg hover:-translate-y-1 cursor-pointer'
      }`}
    >
      {/* Completed badge */}
      {isCompleted && (
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-teal rounded-full flex items-center justify-center shadow-md">
          <FiCheck className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Locked overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-charcoal/5 rounded-[16px] flex items-center justify-center z-10">
          <div className="bg-white/90 rounded-full p-3 shadow-md">
            <FiLock className="w-6 h-6 text-charcoal/40" />
          </div>
        </div>
      )}

      {/* Header: Icon + Difficulty badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-coral/10 flex items-center justify-center">
          <FiTrendingDown className="w-6 h-6 text-coral" />
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-inter font-600 ${difficulty.bg} ${difficulty.text}`}>
          {difficulty.label}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-nunito font-700 text-xl text-charcoal mb-2">
        {rcaCase.title}
      </h3>

      {/* Problem summary */}
      <p className="font-inter text-sm text-charcoal/60 mb-3">
        {rcaCase.initial_problem}
      </p>

      {/* Metric card */}
      <div className="bg-cream/50 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-inter text-xs text-charcoal/50 mb-1">Metric</p>
            <p className="font-nunito font-700 text-lg text-charcoal">
              {rcaCase.metric_name}
            </p>
          </div>
          <div className="text-right">
            <p className="font-inter text-xs text-charcoal/50 mb-1">Change</p>
            <p className="font-nunito font-700 text-lg text-coral">
              {rcaCase.metric_drop}
            </p>
          </div>
        </div>
        {rcaCase.time_period && (
          <p className="font-inter text-xs text-charcoal/50 mt-2">
            {rcaCase.time_period}
          </p>
        )}
      </div>

      {/* XP reward */}
      <div className="flex items-center justify-between">
        <span className="font-inter text-xs text-charcoal/40">
          Level {rcaCase.level_number}
        </span>
        {!isLocked && (
          <span className="font-inter text-sm font-600 text-coral flex items-center gap-1">
            <FiSearch className="w-4 h-4" />
            Investigate
          </span>
        )}
      </div>
    </div>
  );

  if (isLocked) {
    return cardContent;
  }

  return (
    <Link href={`/rca/${rcaCase.id}`}>
      {cardContent}
    </Link>
  );
};

const RCA = () => {
  const { user } = useUser();
  const [cases, setCases] = useState<RCACase[]>([]);
  const [completedCases, setCompletedCases] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // Load cases from API
      const caseData = await getCases();
      setCases(caseData);

      // Load progress
      if (user?.id) {
        const progress = await getRCAProgress();
        setCompletedCases(progress.completedCases);
      }

      setLoading(false);
    };

    loadData();
  }, [user?.id]);

  // Determine which cases are locked (only level 1 is unlocked initially)
  const isCaseLocked = (rcaCase: RCACase): boolean => {
    if (rcaCase.level_number === 1) return false;
    
    // Unlock if previous level is completed
    const previousLevel = rcaCase.level_number - 1;
    const previousCase = cases.find(c => c.level_number === previousLevel);
    return previousCase ? !completedCases.includes(previousCase.id) : true;
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="py-4 px-6 md:px-12 bg-cream/80 backdrop-blur-sm border-b border-charcoal/5">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Link href="/dashboard">
            <button className="p-2 hover:bg-charcoal/5 rounded-lg transition-colors">
              <FiArrowLeft className="w-5 h-5 text-charcoal" />
            </button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-coral/10 flex items-center justify-center">
              <FiSearch className="w-5 h-5 text-coral" />
            </div>
            <div>
              <h1 className="font-nunito font-700 text-xl text-charcoal">RCA Detective</h1>
              <p className="font-inter text-sm text-charcoal/60">Find the root cause</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="py-8 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          {/* Intro section with Praxy */}
          <div className="flex items-start gap-6 mb-10 bg-white rounded-[16px] p-6 shadow-warm">
            <PraxyAvatar size={80} expression="thinking" animate />
            <div className="flex-1">
              <h2 className="font-nunito font-700 text-2xl text-charcoal mb-2">
                Ready to solve some mysteries? 🔍
              </h2>
              <p className="font-inter text-charcoal/70 leading-relaxed">
                A business metric just dropped. Your job? Investigate the data, 
                build a 5 Whys chain, and identify the root cause. Each case 
                tests your analytical thinking and problem-solving skills.
              </p>
            </div>
          </div>

          {/* Cases grid */}
          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-[16px] p-6 shadow-warm animate-pulse">
                  <div className="w-12 h-12 bg-charcoal/10 rounded-xl mb-4" />
                  <div className="h-6 bg-charcoal/10 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-charcoal/10 rounded w-1/2 mb-4" />
                  <div className="h-20 bg-charcoal/5 rounded-lg" />
                </div>
              ))}
            </div>
          ) : cases.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-[16px] p-6 shadow-warm">
              <p className="font-inter text-charcoal/60">
                No cases available yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {cases
                .sort((a, b) => a.level_number - b.level_number)
                .map((rcaCase) => (
                  <CaseCard
                    key={rcaCase.id}
                    rcaCase={rcaCase}
                    isLocked={isCaseLocked(rcaCase)}
                    isCompleted={completedCases.includes(rcaCase.id)}
                  />
                ))}
            </div>
          )}

          {/* Tips section */}
          <div className="mt-10 bg-teal/5 rounded-[16px] p-6 border border-teal/10">
            <h3 className="font-nunito font-700 text-lg text-charcoal mb-3">
              💡 Tips for Root Cause Analysis
            </h3>
            <ul className="space-y-2 font-inter text-sm text-charcoal/70">
              <li className="flex items-start gap-2">
                <span className="text-teal">•</span>
                <span>Look at the data methodically — don't jump to conclusions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal">•</span>
                <span>Use the "5 Whys" to dig deeper than surface-level symptoms</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal">•</span>
                <span>The best root causes are specific, actionable, and fixable</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RCA;
