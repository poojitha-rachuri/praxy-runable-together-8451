import { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'wouter';
import { FiArrowLeft, FiPhone, FiTarget, FiUser, FiBriefcase, FiZap } from 'react-icons/fi';
import PraxyAvatar from '../components/ui/PraxyAvatar';
import SpeechBubble from '../components/ui/SpeechBubble';
import { getScenarioById, type Scenario } from '../lib/coldcall';

// Hardcoded scenarios for fallback
const hardcodedScenarios: Record<string, Scenario> = {
  'sc-stripe-1': {
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
  'sc-shopify-2': {
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
  'sc-zomato-3': {
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
};

const ColdCallBriefing = () => {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const [, navigate] = useLocation();
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadScenario = async () => {
      if (!scenarioId) return;
      
      setLoading(true);
      
      // Try API first
      const data = await getScenarioById(scenarioId);
      
      if (data) {
        // Map backend scenario to frontend format
        setScenario({
          id: data.id,
          simulator_id: 'sim-cc',
          level_number: (data as any).level || 1,
          company_name: (data as any).company || 'Unknown',
          company_url: data.company_url,
          company_context: (data as any).company_context || `Learn about ${(data as any).company}`,
          prospect_name: (data as any).prospect?.name || data.prospect_name,
          prospect_role: (data as any).prospect?.role || data.prospect_role,
          prospect_personality: data.prospect_personality || 'Professional',
          objective: data.objective,
          difficulty: data.difficulty,
          tips: (data as any).tips || data.tips || [],
          success_criteria: data.success_criteria || [],
        });
      } else {
        // Fallback to hardcoded
        setScenario(hardcodedScenarios[scenarioId] || null);
      }
      
      setLoading(false);
    };

    loadScenario();
  }, [scenarioId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-coral/20 rounded-full" />
          <div className="h-4 w-32 bg-charcoal/10 rounded" />
        </div>
      </div>
    );
  }

  if (!scenario) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <p className="font-inter text-charcoal/60 mb-4">Scenario not found</p>
          <Link href="/cold-call">
            <button className="text-coral font-inter font-600 hover:underline">
              Back to scenarios
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const tips = scenario.tips || [];

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="py-4 px-6 md:px-12 bg-cream/80 backdrop-blur-sm border-b border-charcoal/5">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/cold-call">
            <button className="p-2 hover:bg-charcoal/5 rounded-lg transition-colors">
              <FiArrowLeft className="w-5 h-5 text-charcoal" />
            </button>
          </Link>
          <div>
            <h1 className="font-nunito font-700 text-xl text-charcoal">Call Briefing</h1>
            <p className="font-inter text-sm text-charcoal/60">Level {scenario.level_number}</p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="py-8 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          {/* Praxy encouragement */}
          <div className="flex items-start gap-4 mb-8">
            <PraxyAvatar size={70} expression="encouraging" animate />
            <SpeechBubble size="md" className="flex-1 max-w-md">
              <p className="font-inter text-charcoal">
                You've got this! Remember, it's just practice. Take a deep breath and focus on building rapport. 💪
              </p>
            </SpeechBubble>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Company card */}
            <div className="bg-white rounded-[16px] p-6 shadow-warm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center">
                  <FiBriefcase className="w-5 h-5 text-teal" />
                </div>
                <h2 className="font-nunito font-700 text-lg text-charcoal">The Company</h2>
              </div>
              
              <h3 className="font-nunito font-700 text-2xl text-charcoal mb-2">
                {scenario.company_name}
              </h3>
              
              {scenario.company_url && (
                <a 
                  href={scenario.company_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-inter text-sm text-teal hover:underline mb-3 block"
                >
                  {scenario.company_url}
                </a>
              )}
              
              <p className="font-inter text-charcoal/70 leading-relaxed">
                {scenario.company_context}
              </p>
            </div>

            {/* Prospect card */}
            <div className="bg-white rounded-[16px] p-6 shadow-warm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-coral/10 flex items-center justify-center">
                  <FiUser className="w-5 h-5 text-coral" />
                </div>
                <h2 className="font-nunito font-700 text-lg text-charcoal">The Prospect</h2>
              </div>
              
              <h3 className="font-nunito font-700 text-2xl text-charcoal mb-1">
                {scenario.prospect_name}
              </h3>
              
              <p className="font-inter text-sm text-charcoal/60 mb-3">
                {scenario.prospect_role}
              </p>
              
              <div className="bg-yellow/10 rounded-lg p-3">
                <p className="font-inter text-sm text-charcoal/80">
                  <span className="font-600">Personality hint:</span> {scenario.prospect_personality}
                </p>
              </div>
            </div>
          </div>

          {/* Mission card */}
          <div className="bg-gradient-to-r from-coral to-coral/80 rounded-[16px] p-6 shadow-warm mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <FiTarget className="w-5 h-5 text-white" />
              </div>
              <h2 className="font-nunito font-700 text-lg text-white">Your Mission</h2>
            </div>
            
            <p className="font-nunito font-700 text-2xl text-white">
              {scenario.objective}
            </p>
          </div>

          {/* Tips from Praxy */}
          {tips.length > 0 && (
            <div className="bg-white rounded-[16px] p-6 shadow-warm mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-yellow/20 flex items-center justify-center">
                  <FiZap className="w-5 h-5 text-yellow-600" />
                </div>
                <h2 className="font-nunito font-700 text-lg text-charcoal">Tips from Praxy</h2>
              </div>
              
              <ul className="space-y-3">
                {tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-teal/10 text-teal text-sm font-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="font-inter text-charcoal/80">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Start call button */}
          <div className="flex justify-center">
            <button
              onClick={() => navigate(`/cold-call/${scenarioId}/call`)}
              className="gradient-coral text-white font-inter font-600 text-lg px-10 py-4 rounded-[8px] shadow-warm hover:shadow-warm-lg transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-3"
            >
              <FiPhone className="w-5 h-5" />
              Start Call
            </button>
          </div>

          {/* Disclaimer */}
          <p className="text-center font-inter text-xs text-charcoal/40 mt-6">
            Your microphone will be used during the call. Make sure you're in a quiet environment.
          </p>
        </div>
      </main>
    </div>
  );
};

export default ColdCallBriefing;
