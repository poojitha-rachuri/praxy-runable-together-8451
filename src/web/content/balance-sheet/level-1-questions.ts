// Level 1: The Liquidity Check - Current Ratio questions

export interface ComparisonOption {
  id: string;
  label: string;
  currentAssets?: number;
  currentLiabilities?: number;
  ratio: number;
  isCorrect: boolean;
}

export interface VisualComparisonQuestion {
  id: string;
  type: 'visual-comparison';
  prompt: string;
  options: ComparisonOption[];
  explanation: {
    correct: string;
    incorrect: string;
  };
  hint?: string;
}

export interface YesNoQuestion {
  id: string;
  type: 'yes-no';
  prompt: string;
  correctAnswer: 'yes' | 'no';
  explanation: string;
}

export interface MultipleChoiceOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface MultipleChoiceQuestion {
  id: string;
  type: 'multiple-choice';
  prompt: string;
  options: MultipleChoiceOption[];
  explanation: string;
}

export type Question = VisualComparisonQuestion | YesNoQuestion | MultipleChoiceQuestion;

export const LEVEL_1_QUESTIONS: Question[] = [
  {
    id: 'l1-q1',
    type: 'visual-comparison',
    prompt: 'Which company can pay its short-term bills?',
    options: [
      { 
        id: 'a', 
        label: 'Company A', 
        currentAssets: 500000, 
        currentLiabilities: 300000, 
        ratio: 1.67, 
        isCorrect: true 
      },
      { 
        id: 'b', 
        label: 'Company B', 
        currentAssets: 300000, 
        currentLiabilities: 450000, 
        ratio: 0.67, 
        isCorrect: false 
      }
    ],
    explanation: {
      correct: 'Nailed it! Company A has $1.67 for every $1 owed. They\'re in great shape.',
      incorrect: 'Easy mistake! Company B owes more than it has — a ratio below 1.0 means danger.'
    },
    hint: 'Remember: Above 1.5 = healthy, Below 1.0 = danger zone'
  },
  {
    id: 'l1-q2',
    type: 'yes-no',
    prompt: 'Company X has a Current Ratio of 0.8. Can they comfortably pay their short-term debts?',
    correctAnswer: 'no',
    explanation: 'A ratio below 1.0 means they owe more than they have in liquid assets. They\'d struggle to pay all their bills if they came due today.'
  },
  {
    id: 'l1-q3',
    type: 'multiple-choice',
    prompt: 'A company\'s Current Ratio improved from 0.9 to 1.3. What happened?',
    options: [
      { id: 'a', text: 'They\'re now in the danger zone', isCorrect: false },
      { id: 'b', text: 'They moved from danger to acceptable range', isCorrect: true },
      { id: 'c', text: 'No significant change', isCorrect: false },
      { id: 'd', text: 'They have too much cash', isCorrect: false }
    ],
    explanation: 'They moved from below 1.0 (danger zone) to above 1.0 (acceptable range). That\'s real progress!'
  },
  {
    id: 'l1-q4',
    type: 'visual-comparison',
    prompt: 'Which company has better liquidity?',
    options: [
      { id: 'a', label: 'Company A', ratio: 2.1, isCorrect: true },
      { id: 'b', label: 'Company B', ratio: 0.95, isCorrect: false }
    ],
    explanation: {
      correct: 'Right! 2.1 is well above the 1.5 healthy threshold. Strong liquidity position.',
      incorrect: '0.95 is below 1.0 — they owe more than they have. Not a great position.'
    }
  },
  {
    id: 'l1-q5',
    type: 'yes-no',
    prompt: 'Tesla\'s Current Ratio is 1.67. Is this considered healthy?',
    correctAnswer: 'yes',
    explanation: 'Above 1.5 is healthy. Tesla has $1.67 for every $1 of short-term debt — a comfortable buffer.'
  }
];

// XP rewards
export const XP_PER_CORRECT = 30;
export const PASS_THRESHOLD = 0.6; // 60% to pass (3 out of 5)
export const LEVEL_1_BADGE_ID = 'survivor';
