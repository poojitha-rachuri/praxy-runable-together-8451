export interface QuestionOption {
  label: string;
  value: string;
  data?: string;
}

export interface Question {
  id: string;
  level_id: string;
  question_number: number;
  type: 'visual-comparison' | 'yes-no' | 'multiple-choice';
  prompt: string;
  context?: string;
  options: QuestionOption[];
  correct_answer: string;
  explanation: string;
  hint?: string;
  xp_value: number;
}

export interface AnswerResult {
  correct: boolean;
  explanation: string;
  xp_earned: number;
}

export interface QuizState {
  questions: Question[];
  currentIndex: number;
  score: number;
  xpEarned: number;
  answers: Record<string, string>;
  startTime: number;
}
