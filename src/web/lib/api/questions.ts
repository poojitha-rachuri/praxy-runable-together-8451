import { getClerkId } from '../api';
import type { Question, AnswerResult } from '../../types/quiz';

const API_BASE = '/api';

export const getQuestionsByLevel = async (levelId: string): Promise<Question[]> => {
  try {
    const response = await fetch(`${API_BASE}/questions/${levelId}`, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      console.error('Failed to fetch questions:', response.status);
      return [];
    }

    const data = await response.json() as { success: boolean; questions: Question[] };
    if (data.success && data.questions) {
      return data.questions;
    }
    return [];
  } catch (error) {
    console.error('Error fetching questions:', error);
    return [];
  }
};

export const submitAnswer = async (
  questionId: string,
  answer: string,
  clerkId?: string
): Promise<AnswerResult> => {
  const userId = clerkId || getClerkId();

  try {
    const response = await fetch(`${API_BASE}/questions/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionId,
        answer,
        clerkId: userId,
      }),
    });

    if (!response.ok) {
      console.error('Failed to submit answer:', response.status);
      return { correct: false, explanation: 'Failed to check answer.', xp_earned: 0 };
    }

    const data = await response.json() as { success: boolean; result: AnswerResult };
    if (data.success && data.result) {
      return data.result;
    }
    return { correct: false, explanation: 'Unexpected response.', xp_earned: 0 };
  } catch (error) {
    console.error('Error submitting answer:', error);
    return { correct: false, explanation: 'Network error.', xp_earned: 0 };
  }
};
