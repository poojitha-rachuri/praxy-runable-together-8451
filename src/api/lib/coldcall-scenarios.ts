/**
 * Cold Call Scenario Configurations
 * Maps levels to ElevenLabs agents and defines scenario details
 */

interface ColdCallScenario {
  id: string;
  level: number;
  title: string;
  company: string;
  prospect: {
    name: string;
    role: string;
  };
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  objective: string;
  tips: string[];
}

export function getScenarios(env: any): ColdCallScenario[] {
  return [
    {
      id: 'cc-1',
      level: 1,
      title: 'The Friendly Gatekeeper',
      company: 'Stripe',
      prospect: { name: 'Sarah', role: 'Receptionist' },
      difficulty: 'beginner',
      objective: 'Get transferred to the decision maker',
      tips: [
        'Be polite and professional',
        'Have a clear reason for calling',
        'Ask for the person by name if possible'
      ]
    },
    {
      id: 'cc-2',
      level: 2,
      title: 'The Busy Decision Maker',
      company: 'Shopify',
      prospect: { name: 'Michael Chen', role: 'VP of Operations' },
      difficulty: 'intermediate',
      objective: 'Earn a 15-minute meeting',
      tips: [
        'Lead with value, not features',
        'Mention a relevant pain point',
        'Respect their time'
      ]
    },
    {
      id: 'cc-3',
      level: 3,
      title: 'The Skeptic',
      company: 'Razorpay',
      prospect: { name: 'Priya Sharma', role: 'CFO' },
      difficulty: 'intermediate',
      objective: 'Overcome the "we already have a solution" objection',
      tips: [
        'Acknowledge their current solution',
        'Ask about gaps or pain points',
        'Offer a comparison, not replacement'
      ]
    },
    {
      id: 'cc-4',
      level: 4,
      title: 'The Budget Blocker',
      company: 'Freshworks',
      prospect: { name: 'Arjun Reddy', role: 'Head of Procurement' },
      difficulty: 'advanced',
      objective: 'Navigate past "it\'s too expensive"',
      tips: [
        'Reframe price as investment',
        'Uncover the real concern',
        'Offer flexible options'
      ]
    },
    {
      id: 'cc-5',
      level: 5,
      title: 'The Hostile Executive',
      company: 'Zerodha',
      prospect: { name: 'Vikram Mehta', role: 'CEO' },
      difficulty: 'advanced',
      objective: 'Stay professional and find an opening',
      tips: [
        'Stay calm no matter what',
        'Acknowledge their frustration',
        'Know when to gracefully exit'
      ]
    }
  ];
}

export function getAgentIdForLevel(env: any, level: number): string {
  const agentMap: Record<number, string> = {
    1: env.ELEVENLABS_AGENT_GATEKEEPER,
    2: env.ELEVENLABS_AGENT_DECISION_MAKER,
    3: env.ELEVENLABS_AGENT_SKEPTIC,
    4: env.ELEVENLABS_AGENT_BUDGET,
    5: env.ELEVENLABS_AGENT_HOSTILE
  };

  return agentMap[level] || env.ELEVENLABS_AGENT_GATEKEEPER;
}

export function getScenarioById(env: any, scenarioId: string) {
  const scenarios = getScenarios(env);
  return scenarios.find(s => s.id === scenarioId);
}
