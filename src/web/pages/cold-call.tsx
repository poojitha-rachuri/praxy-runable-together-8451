import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useUser } from '@clerk/clerk-react';
import { FiPhone, FiLock, FiCheck, FiArrowLeft, FiClock, FiTrendingUp } from 'react-icons/fi';
import PraxyMascot from '../components/praxy-mascot';
import { getScenarios, getColdCallProgress, getColdCallSessions, type Scenario, type ColdCallSession } from '../lib/coldcall';

// Difficulty badge colors
const difficultyConfig = {
  beginner: { bg: 'bg-teal/10', text: 'text-teal', label: 'Beginner' },
  intermediate: { bg: 'bg-yellow/20', text: 'text-yellow-700', label: 'Intermediate' },
  advanced: { bg: 'bg-coral/10', text: 'text-coral', label: 'Advanced' },
};

// Company icons (using emoji for reliability)
const companyIcons: Record<string, { emoji: string; bg: string }> = {
  'Stripe': { emoji: '💳', bg: 'bg-purple-100' },
  'Shopify': { emoji: '🛒', bg: 'bg-green-100' },
  'Razorpay': { emoji: '💰', bg: 'bg-blue-100' },
  'Freshworks': { emoji: '🌱', bg: 'bg-orange-100' },
  'Zerodha': { emoji: '📈', bg: 'bg-indigo-100' },
  'Zomato': { emoji: '🍔', bg: 'bg-red-100' },
};

const getCompanyIcon = (companyName: string) => {
  return companyIcons[companyName] || { emoji: companyName.charAt(0), bg: 'bg-coral/10' };
};

interface ScenarioCardProps {
  scenario: Scenario;
  isLocked: boolean;
  isCompleted: boolean;
}

const ScenarioCard = ({ scenario, isLocked, isCompleted }: ScenarioCardProps) => {
  const difficulty = difficultyConfig[scenario.difficulty] || difficultyConfig.beginner;
  const companyIcon = getCompanyIcon(scenario.company_name);

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

      {/* Header: Company icon + Level */}
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${companyIcon.bg} flex items-center justify-center`}>
          <span className="text-2xl">{companyIcon.emoji}</span>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-inter font-600 ${difficulty.bg} ${difficulty.text}`}>
          {difficulty.label}
        </span>
      </div>

      {/* Company name */}
      <h3 className="font-nunito font-700 text-xl text-charcoal mb-1">
        {scenario.company_name}
      </h3>

      {/* Prospect info */}
      <p className="font-inter text-sm text-charcoal/60 mb-3">
        {scenario.prospect_name} • {scenario.prospect_role}
      </p>

      {/* Objective */}
      <div className="bg-cream/50 rounded-lg p-3 mb-4">
        <p className="font-inter text-sm text-charcoal/80">
          <span className="font-600 text-coral">Objective:</span> {scenario.objective}
        </p>
      </div>

      {/* Level indicator */}
      <div className="flex items-center justify-between">
        <span className="font-inter text-xs text-charcoal/40">
          Level {scenario.level_number}
        </span>
        {!isLocked && (
          <span className="font-inter text-sm font-600 text-coral flex items-center gap-1">
            <FiPhone className="w-4 h-4" />
            Start Call
          </span>
        )}
      </div>
    </div>
  );

  if (isLocked) {
    return cardContent;
  }

  return (
    <Link href={`/cold-call/${scenario.id}/briefing`}>
      {cardContent}
    </Link>
  );
};

// Format duration helper
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

const ColdCall = () => {
  const { user } = useUser();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [completedScenarios, setCompletedScenarios] = useState<string[]>([]);
  const [callHistory, setCallHistory] = useState<ColdCallSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // Load scenarios
      const scenarioData = await getScenarios();
      
      // Map backend scenarios to frontend format
      const mappedScenarios = scenarioData.map((s: any) => ({
        id: s.id,
        simulator_id: s.simulator_id || 'sim-cc',
        level_number: s.level,
        company_name: s.company,
        company_url: null,
        company_context: null,
        prospect_name: s.prospect.name,
        prospect_role: s.prospect.role,
        prospect_personality: null,
        objective: s.objective,
        difficulty: s.difficulty,
        tips: s.tips || [],
        success_criteria: [],
      }));
      
      setScenarios(mappedScenarios);

      // Load progress and history
      if (user?.id) {
        const progress = await getColdCallProgress();
        setCompletedScenarios(progress.completedScenarios);
        
        // Load call history
        const history = await getColdCallSessions();
        setCallHistory(history);
      }

      setLoading(false);
    };

    loadData();
  }, [user?.id]);

  // Determine which scenarios are locked (only level 1 is unlocked initially)
  const isScenarioLocked = (scenario: Scenario): boolean => {
    if (scenario.level_number === 1) return false;
    
    // Unlock if previous level is completed
    const previousLevel = scenario.level_number - 1;
    const previousScenario = scenarios.find(s => s.level_number === previousLevel);
    return previousScenario ? !completedScenarios.includes(previousScenario.id) : true;
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
              <FiPhone className="w-5 h-5 text-coral" />
            </div>
            <div>
              <h1 className="font-nunito font-700 text-xl text-charcoal">I Will Find You</h1>
              <p className="font-inter text-sm text-charcoal/60">Practice makes perfect</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="py-8 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          {/* Intro section with Praxy */}
          <div className="flex items-start gap-6 mb-10 bg-white rounded-[16px] p-6 shadow-warm">
            <PraxyMascot size={80} expression="happy" waving={false} />
            <div className="flex-1">
              <h2 className="font-nunito font-700 text-2xl text-charcoal mb-2">
                Ready to make some calls? 📞
              </h2>
              <p className="font-inter text-charcoal/70 leading-relaxed">
                Practice cold calling real companies with AI-powered prospects. 
                Each scenario gets harder — start with a friendly engineering manager 
                and work your way up to the tough Head of Growth.
              </p>
            </div>
          </div>

          {/* Scenarios grid */}
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
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {scenarios
                .sort((a, b) => a.level_number - b.level_number)
                .map((scenario) => (
                  <ScenarioCard
                    key={scenario.id}
                    scenario={scenario}
                    isLocked={isScenarioLocked(scenario)}
                    isCompleted={completedScenarios.includes(scenario.id)}
                  />
                ))}
            </div>
          )}

          {/* Call History Section */}
          {callHistory.length > 0 && (
            <div className="mt-10">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 font-nunito font-700 text-lg text-charcoal mb-4 hover:text-coral transition-colors"
              >
                <FiClock className="w-5 h-5" />
                Call History ({callHistory.length})
                <span className="text-charcoal/40 text-sm font-normal ml-2">
                  {showHistory ? 'Hide' : 'Show'}
                </span>
              </button>
              
              {showHistory && (
                <div className="space-y-3">
                  {callHistory.slice(0, 10).map((session) => {
                    const scenario = scenarios.find(s => s.id === session.scenario_id);
                    const scoreColor = session.overall_score >= 70 ? 'text-teal' : session.overall_score >= 50 ? 'text-yellow-600' : 'text-coral';
                    
                    return (
                      <Link key={session.id} href={`/cold-call/${session.scenario_id}/feedback`}>
                        <div className="bg-white rounded-[12px] p-4 shadow-sm hover:shadow-warm transition-all cursor-pointer flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-charcoal/5 flex items-center justify-center">
                              <FiPhone className="w-5 h-5 text-charcoal/40" />
                            </div>
                            <div>
                              <p className="font-inter font-600 text-charcoal">
                                {scenario?.company_name || 'Unknown'}
                              </p>
                              <p className="font-inter text-xs text-charcoal/50">
                                {new Date(session.completed_at).toLocaleDateString()} • {formatDuration(session.duration_seconds)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className={`font-nunito font-700 text-xl ${scoreColor}`}>
                                {session.overall_score}
                              </p>
                              <p className="font-inter text-xs text-charcoal/40">score</p>
                            </div>
                            <FiTrendingUp className={`w-5 h-5 ${scoreColor}`} />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tips section */}
          <div className="mt-10 bg-teal/5 rounded-[16px] p-6 border border-teal/10">
            <h3 className="font-nunito font-700 text-lg text-charcoal mb-3">
              💡 Pro Tips for Cold Calling
            </h3>
            <ul className="space-y-2 font-inter text-sm text-charcoal/70">
              <li className="flex items-start gap-2">
                <span className="text-teal">•</span>
                <span>Hook them in the first 10 seconds — lead with value, not your name</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal">•</span>
                <span>Ask questions to understand their pain points before pitching</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal">•</span>
                <span>Always end with a clear call-to-action (meeting, demo, follow-up)</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ColdCall;
