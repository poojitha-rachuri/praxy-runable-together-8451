import { useState, useEffect } from 'react';
import { Link, useParams } from 'wouter';
import { FiArrowLeft, FiRefreshCw, FiArrowRight, FiAward, FiTrendingUp } from 'react-icons/fi';
import PraxyAvatar from '../components/ui/PraxyAvatar';
import SpeechBubble from '../components/ui/SpeechBubble';
import { type CallScore, type TranscriptMessage, type Scenario, getScenarioById } from '../lib/coldcall';

// Hardcoded scenarios for fallback
const hardcodedScenarios: Record<string, Scenario> = {
  'sc-stripe-1': {
    id: 'sc-stripe-1',
    simulator_id: 'sim-cc',
    level_number: 1,
    company_name: 'Stripe',
    company_url: 'https://stripe.com',
    company_context: 'Stripe is a payments infrastructure company.',
    prospect_name: 'Alex Chen',
    prospect_role: 'Engineering Manager',
    prospect_personality: 'Friendly but busy.',
    objective: 'Book a 15-minute demo call',
    difficulty: 'beginner',
    tips: [],
    success_criteria: [],
  },
  'sc-shopify-2': {
    id: 'sc-shopify-2',
    simulator_id: 'sim-cc',
    level_number: 2,
    company_name: 'Shopify',
    company_url: 'https://shopify.com',
    company_context: 'Shopify is an e-commerce platform.',
    prospect_name: 'Priya Sharma',
    prospect_role: 'Operations Lead',
    prospect_personality: 'Skeptical.',
    objective: 'Get agreement for a pilot program',
    difficulty: 'intermediate',
    tips: [],
    success_criteria: [],
  },
  'sc-zomato-3': {
    id: 'sc-zomato-3',
    simulator_id: 'sim-cc',
    level_number: 3,
    company_name: 'Zomato',
    company_url: 'https://zomato.com',
    company_context: 'Zomato is a food delivery platform.',
    prospect_name: 'Rahul Verma',
    prospect_role: 'Head of Growth',
    prospect_personality: 'Aggressive.',
    objective: 'Secure a meeting with the CTO',
    difficulty: 'advanced',
    tips: [],
    success_criteria: [],
  },
};

interface CallResult {
  scenarioId: string;
  transcript: TranscriptMessage[];
  duration: number;
  score: CallScore;
}

// Score dimension labels
const scoreDimensions = [
  { key: 'opening', label: 'Opening Hook', icon: '🎯' },
  { key: 'value', label: 'Value Proposition', icon: '💎' },
  { key: 'objection', label: 'Objection Handling', icon: '🛡️' },
  { key: 'control', label: 'Call Control', icon: '🎮' },
  { key: 'close', label: 'Close Attempt', icon: '🤝' },
] as const;

// Get score color
const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-teal';
  if (score >= 60) return 'text-yellow-600';
  return 'text-coral';
};

const getScoreBg = (score: number): string => {
  if (score >= 80) return 'bg-teal/10';
  if (score >= 60) return 'bg-yellow/10';
  return 'bg-coral/10';
};

// Get Praxy message based on score
const getPraxyMessage = (score: number): { expression: 'celebrating' | 'encouraging' | 'thinking'; message: string } => {
  if (score >= 80) {
    return {
      expression: 'celebrating',
      message: "Incredible work! 🎉 You crushed that call! Your pitch was clear, confident, and you nailed the close. Ready to take on the next challenge?",
    };
  }
  if (score >= 60) {
    return {
      expression: 'encouraging',
      message: "Nice effort! 💪 You're getting the hang of this. A few tweaks to your value proposition and close could make a big difference. Want to try again?",
    };
  }
  return {
    expression: 'thinking',
    message: "That was tough! 🤔 Cold calling is hard, but you showed up and that's what matters. Let's review what happened and try again with fresh energy!",
  };
};

// Format duration
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

const ColdCallFeedback = () => {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const [result, setResult] = useState<CallResult | null>(null);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      // Get result from sessionStorage
      const storedResult = sessionStorage.getItem('coldcall_result');
      if (storedResult) {
        setResult(JSON.parse(storedResult));
      } else {
        // Demo fallback data
        setResult({
          scenarioId: scenarioId || 'sc-stripe-1',
          transcript: [
            { role: 'assistant', content: "Hello, this is Alex Chen. Who's calling?", timestamp: Date.now() - 120000 },
            { role: 'user', content: "Hi Alex, this is John from DevTools Inc. I noticed your team at Stripe ships code really fast, and I wanted to share how we've helped other engineering teams cut their deployment time by 40%.", timestamp: Date.now() - 110000 },
            { role: 'assistant', content: "Hmm, 40%? That's interesting. We do ship pretty fast already though. What makes you different?", timestamp: Date.now() - 100000 },
            { role: 'user', content: "Great question! Unlike traditional CI/CD tools, we integrate directly into your IDE. Your devs at Stripe wouldn't have to change their workflow at all.", timestamp: Date.now() - 90000 },
            { role: 'assistant', content: "I might have 5 minutes. Go ahead.", timestamp: Date.now() - 80000 },
          ],
          duration: 127,
          score: {
            overall: 72,
            opening: 85,
            value: 70,
            objection: 68,
            control: 75,
            close: 62,
            highlights: [
              { text: 'Strong opening with specific metric (40%)', type: 'good' },
              { text: 'Good personalization mentioning Stripe', type: 'good' },
              { text: 'Missed opportunity to ask qualifying questions', type: 'improve' },
            ],
            improvements: [
              'Ask about their current pain points before pitching',
              'Close with a specific ask (demo time/date)',
              'Handle the "we ship fast already" objection more directly',
            ],
          },
        });
      }

      // Load scenario
      if (scenarioId) {
        const data = await getScenarioById(scenarioId);
        setScenario(data || hardcodedScenarios[scenarioId] || null);
      }

      setLoading(false);
    };

    loadData();
  }, [scenarioId]);

  if (loading || !result) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-coral/20 rounded-full" />
          <div className="h-4 w-32 bg-charcoal/10 rounded" />
        </div>
      </div>
    );
  }

  const { score, transcript, duration } = result;
  const praxyFeedback = getPraxyMessage(score.overall);
  const xpEarned = Math.round(score.overall * 1.5);

  // Find next scenario
  const currentLevel = scenario?.level_number || 1;
  const nextScenarioId = currentLevel < 3 ? `sc-${['stripe', 'shopify', 'zomato'][currentLevel]}-${currentLevel + 1}` : null;

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
            <h1 className="font-nunito font-700 text-xl text-charcoal">Call Feedback</h1>
            <p className="font-inter text-sm text-charcoal/60">
              {scenario?.company_name || 'Unknown'} • {formatDuration(duration)}
            </p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="py-8 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          {/* Praxy feedback */}
          <div className="flex items-start gap-4 mb-8">
            <PraxyAvatar size={80} expression={praxyFeedback.expression} animate />
            <SpeechBubble size="lg" className="flex-1">
              <p className="font-inter text-charcoal leading-relaxed">
                {praxyFeedback.message}
              </p>
            </SpeechBubble>
          </div>

          {/* Overall score card */}
          <div className="bg-white rounded-[16px] p-6 shadow-warm mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-nunito font-700 text-lg text-charcoal">Overall Score</h2>
                <p className="font-inter text-sm text-charcoal/60">Based on 5 dimensions</p>
              </div>
              <div className="text-right">
                <div className={`font-nunito font-800 text-5xl ${getScoreColor(score.overall)}`}>
                  {score.overall}
                </div>
                <p className="font-inter text-xs text-charcoal/40">out of 100</p>
              </div>
            </div>

            {/* Score bars */}
            <div className="space-y-4">
              {scoreDimensions.map(({ key, label, icon }) => {
                const dimensionScore = score[key as keyof typeof score] as number;
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-inter text-sm text-charcoal/80 flex items-center gap-2">
                        <span>{icon}</span> {label}
                      </span>
                      <span className={`font-inter font-600 text-sm ${getScoreColor(dimensionScore)}`}>
                        {dimensionScore}
                      </span>
                    </div>
                    <div className="h-2 bg-charcoal/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          dimensionScore >= 80 ? 'bg-teal' : dimensionScore >= 60 ? 'bg-yellow' : 'bg-coral'
                        }`}
                        style={{ width: `${dimensionScore}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* XP and Badge row */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {/* XP Earned */}
            <div className="bg-gradient-to-r from-teal to-teal/80 rounded-[16px] p-5 text-white">
              <div className="flex items-center gap-3 mb-2">
                <FiTrendingUp className="w-5 h-5" />
                <span className="font-inter font-500">XP Earned</span>
              </div>
              <p className="font-nunito font-800 text-3xl">+{xpEarned} XP</p>
            </div>

            {/* Badge (if first completion) */}
            {score.overall >= 70 && (
              <div className="bg-gradient-to-r from-yellow to-yellow/80 rounded-[16px] p-5 text-charcoal">
                <div className="flex items-center gap-3 mb-2">
                  <FiAward className="w-5 h-5" />
                  <span className="font-inter font-500">Badge Unlocked!</span>
                </div>
                <p className="font-nunito font-700 text-lg">Cold Caller</p>
              </div>
            )}
          </div>

          {/* Highlights */}
          {score.highlights && score.highlights.length > 0 && (
            <div className="bg-white rounded-[16px] p-6 shadow-warm mb-6">
              <h3 className="font-nunito font-700 text-lg text-charcoal mb-4">Key Moments</h3>
              <div className="space-y-3">
                {score.highlights.map((highlight, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 p-3 rounded-lg ${
                      highlight.type === 'good' ? 'bg-teal/10' : 'bg-yellow/10'
                    }`}
                  >
                    <span className="text-lg">{highlight.type === 'good' ? '✅' : '💡'}</span>
                    <span className="font-inter text-sm text-charcoal/80">{highlight.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Improvements */}
          {score.improvements && score.improvements.length > 0 && (
            <div className="bg-white rounded-[16px] p-6 shadow-warm mb-6">
              <h3 className="font-nunito font-700 text-lg text-charcoal mb-4">Areas to Improve</h3>
              <ul className="space-y-3">
                {score.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-coral/10 text-coral text-sm font-600 flex items-center justify-center flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="font-inter text-charcoal/80">{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Transcript */}
          <div className="bg-white rounded-[16px] p-6 shadow-warm mb-8">
            <h3 className="font-nunito font-700 text-lg text-charcoal mb-4">Call Transcript</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {transcript.map((message, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    message.role === 'user' ? 'bg-coral/5 ml-8' : 'bg-charcoal/5 mr-8'
                  }`}
                >
                  <p className="font-inter text-xs text-charcoal/50 mb-1">
                    {message.role === 'user' ? 'You' : scenario?.prospect_name || 'Prospect'}
                  </p>
                  <p className="font-inter text-sm text-charcoal/80">{message.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/cold-call/${scenarioId}/briefing`}>
              <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-charcoal/20 text-charcoal font-inter font-600 rounded-[8px] hover:bg-charcoal/5 transition-colors w-full sm:w-auto">
                <FiRefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </Link>
            
            {nextScenarioId && score.overall >= 60 ? (
              <Link href={`/cold-call/${nextScenarioId}/briefing`}>
                <button className="flex items-center justify-center gap-2 px-6 py-3 gradient-coral text-white font-inter font-600 rounded-[8px] shadow-warm hover:shadow-warm-lg transition-all w-full sm:w-auto">
                  Next Scenario
                  <FiArrowRight className="w-4 h-4" />
                </button>
              </Link>
            ) : (
              <Link href="/cold-call">
                <button className="flex items-center justify-center gap-2 px-6 py-3 gradient-coral text-white font-inter font-600 rounded-[8px] shadow-warm hover:shadow-warm-lg transition-all w-full sm:w-auto">
                  Back to Scenarios
                  <FiArrowRight className="w-4 h-4" />
                </button>
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ColdCallFeedback;
