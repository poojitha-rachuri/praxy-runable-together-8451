// Badge definitions for Praxy

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  emoji: string;
}

export const BADGES: Record<string, Record<string, BadgeDefinition>> = {
  'balance-sheet': {
    'survivor': { 
      id: 'survivor', 
      name: 'Survivor Badge', 
      description: 'Complete Level 1 - The Liquidity Check',
      emoji: '🏆'
    },
    'debt-detective': { 
      id: 'debt-detective', 
      name: 'Debt Detective', 
      description: 'Complete Level 2 - Who owns this company?',
      emoji: '🔍'
    },
    'cash-king': { 
      id: 'cash-king', 
      name: 'Cash King', 
      description: 'Complete Level 3 - Where\'s the money?',
      emoji: '👑'
    },
    'asset-inspector': {
      id: 'asset-inspector',
      name: 'Asset Inspector',
      description: 'Complete Level 4 - What do they actually own?',
      emoji: '🔬'
    },
    'profit-checker': {
      id: 'profit-checker',
      name: 'Profit Reality Checker',
      description: 'Complete Level 5 - Does profit = cash?',
      emoji: '💰'
    },
    'efficiency-expert': {
      id: 'efficiency-expert',
      name: 'Efficiency Expert',
      description: 'Complete Level 6 - How fast does money move?',
      emoji: '⚡'
    },
    'growth-analyzer': {
      id: 'growth-analyzer',
      name: 'Growth Analyzer',
      description: 'Complete Level 7 - Is this growth healthy?',
      emoji: '📈'
    },
    'return-master': {
      id: 'return-master',
      name: 'Return Master',
      description: 'Complete Level 8 - Is this investment worth it?',
      emoji: '🎯'
    },
    'red-flag-spotter': {
      id: 'red-flag-spotter',
      name: 'Red Flag Spotter',
      description: 'Complete Level 9 - What\'s hidden?',
      emoji: '🚩'
    },
    'balance-master': { 
      id: 'balance-master', 
      name: 'Balance Sheet Master', 
      description: 'Complete all 10 levels',
      emoji: '🏅'
    },
  },
  'cold-call': {
    'first-dial': { 
      id: 'first-dial', 
      name: 'First Dial', 
      description: 'Complete your first cold call',
      emoji: '📞'
    },
    'objection-handler': { 
      id: 'objection-handler', 
      name: 'Objection Handler', 
      description: 'Score 8+ on handling objections',
      emoji: '🛡️'
    },
    'closer': { 
      id: 'closer', 
      name: 'The Closer', 
      description: 'Book 3 meetings successfully',
      emoji: '🤝'
    },
  },
  'rca': {
    'investigator': { 
      id: 'investigator', 
      name: 'Investigator', 
      description: 'Complete your first RCA case',
      emoji: '🕵️'
    },
    'root-finder': { 
      id: 'root-finder', 
      name: 'Root Finder', 
      description: 'Find 5 root causes correctly',
      emoji: '🌳'
    },
  }
};

// Get badge by ID across all simulators
export function getBadge(badgeId: string): BadgeDefinition | null {
  for (const simulator of Object.values(BADGES)) {
    if (badgeId in simulator) {
      return simulator[badgeId];
    }
  }
  return null;
}

// Get badge for a specific level completion
export function getBadgeForLevel(simulator: string, level: number): BadgeDefinition | null {
  if (simulator === 'balance-sheet') {
    const badgeMap: Record<number, string> = {
      1: 'survivor',
      2: 'debt-detective',
      3: 'cash-king',
      4: 'asset-inspector',
      5: 'profit-checker',
      6: 'efficiency-expert',
      7: 'growth-analyzer',
      8: 'return-master',
      9: 'red-flag-spotter',
      10: 'balance-master',
    };
    const badgeId = badgeMap[level];
    return badgeId ? BADGES['balance-sheet'][badgeId] : null;
  }
  return null;
}
