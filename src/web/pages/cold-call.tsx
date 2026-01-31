import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useUser } from '@clerk/clerk-react';
import { FiPhone, FiLock, FiCheck, FiArrowLeft } from 'react-icons/fi';
import PraxyAvatar from '../components/ui/PraxyAvatar';
import { getScenarios, getColdCallProgress, type Scenario } from '../lib/coldcall';

// Difficulty badge colors
const difficultyConfig = {
  beginner: { bg: 'bg-teal/10', text: 'text-teal', label: 'Beginner' },
  intermediate: { bg: 'bg-yellow/20', text: 'text-yellow-700', label: 'Intermediate' },
  advanced: { bg: 'bg-coral/10', text: 'text-coral', label: 'Advanced' },
};

// Company logos (fallback to initials)
const getCompanyLogo = (companyName: string) => {
  const logos: Record<string, string> = {
    'Stripe': 'https://logo.clearbit.com/stripe.com',
    'Shopify': 'https://logo.clearbit.com/shopify.com',
    'Zomato': 'https://logo.clearbit.com/zomato.com',
  };
  return logos[companyName] || null;
};

interface ScenarioCardProps {
  scenario: Scenario;
  isLocked: boolean;
  isCompleted: boolean;
}

const ScenarioCard = ({ scenario, isLocked, isCompleted }: ScenarioCardProps) => {
  const difficulty = difficultyConfig[scenario.difficulty] || difficultyConfig.beginner;
  const logo = getCompanyLogo(scenario.company_name);

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

      {/* Header: Company logo + Level */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-cream flex items-center justify-center overflow-hidden">
          {logo ? (
            <img src={logo} alt={scenario.company_name} className="w-8 h-8 object-contain" />
          ) : (
            <span className="font-nunito font-700 text-lg text-coral">
              {scenario.company_name.charAt(0)}
            </span>
          )}
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

const ColdCall = () => {
  const { user } = useUser();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [completedScenarios, setCompletedScenarios] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // Load scenarios
      const scenarioData = await getScenarios();
      
      // If no scenarios from API, use hardcoded data
      if (scenarioData.length === 0) {
        setScenarios([
          {
            id: 'sc-stripe-1',
            simulator_id: 'sim-cc',
            level_number: 1,
            company_name: 'Stripe',
            company_url: 'https://stripe.com',
            company_context: 'Stripe is a payments infrastructure company. You are selling a developer productivity tool.',
            prospect_name: 'Alex Chen',
            prospect_role: 'Engineering Manager',
            prospect_personality: 'Friendly but busy. Values efficiency. Will give you 2 minutes if you hook them.',
            objective: 'Book a 15-minute demo call',
            difficulty: 'beginner',
            tips: ['Lead with value, not features', 'Mention developer pain points', 'Ask about their current stack'],
            success_criteria: ['Demo booked', 'Follow-up agreed', 'Contact info exchanged'],
          },
          {
            id: 'sc-shopify-2',
            simulator_id: 'sim-cc',
            level_number: 2,
            company_name: 'Shopify',
            company_url: 'https://shopify.com',
            company_context: 'Shopify is an e-commerce platform. You are selling an inventory management solution.',
            prospect_name: 'Priya Sharma',
            prospect_role: 'Operations Lead',
            prospect_personality: 'Skeptical. Has seen many pitches. Needs proof and numbers.',
            objective: 'Get agreement for a pilot program',
            difficulty: 'intermediate',
            tips: ['Come with specific ROI numbers', 'Reference similar companies', 'Acknowledge their skepticism'],
            success_criteria: ['Pilot agreed', 'Decision timeline shared', 'Stakeholders identified'],
          },
          {
            id: 'sc-zomato-3',
            simulator_id: 'sim-cc',
            level_number: 3,
            company_name: 'Zomato',
            company_url: 'https://zomato.com',
            company_context: 'Zomato is a food delivery platform. You are selling a customer analytics tool.',
            prospect_name: 'Rahul Verma',
            prospect_role: 'Head of Growth',
            prospect_personality: 'Aggressive, interrupts often. Wants bottom-line impact only.',
            objective: 'Secure a meeting with the CTO',
            difficulty: 'advanced',
            tips: ['Get to the point fast', 'Handle interruptions gracefully', 'Pivot to CTO meeting if stuck'],
            success_criteria: ['CTO meeting confirmed', 'Business case understood', 'Budget discussion initiated'],
          },
        ]);
      } else {
        setScenarios(scenarioData);
      }

      // Load progress
      if (user?.id) {
        const progress = await getColdCallProgress();
        setCompletedScenarios(progress.completedScenarios);
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
              <h1 className="font-nunito font-700 text-xl text-charcoal">Cold Call Hero</h1>
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
            <PraxyAvatar size={80} expression="encouraging" animate />
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
