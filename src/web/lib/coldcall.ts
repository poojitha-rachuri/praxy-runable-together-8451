/**
 * Cold Call Hero API Client
 * Handles scenarios, sessions, and scoring for cold call practice
 */

import { getClerkId } from './api';

const API_BASE = '/api';

// ====================
// TYPES
// ====================

export interface Scenario {
  id: string;
  simulator_id: string;
  level_number: number;
  company_name: string;
  company_url: string | null;
  company_context: string | null;
  prospect_name: string;
  prospect_role: string;
  prospect_personality: string | null;
  objective: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tips: string[] | null;
  success_criteria: string[] | null;
}

export interface TranscriptMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface CallScore {
  overall: number;
  opening: number;
  value: number;
  objection: number;
  control: number;
  close: number;
  highlights: Array<{ text: string; type: 'good' | 'improve' }>;
  improvements: string[];
}

export interface ColdCallSession {
  id: string;
  clerk_id: string;
  scenario_id: string;
  transcript: TranscriptMessage[];
  duration_seconds: number;
  overall_score: number;
  opening_score: number;
  value_score: number;
  objection_score: number;
  control_score: number;
  close_score: number;
  highlights: Array<{ text: string; type: 'good' | 'improve' }>;
  improvements: string[];
  completed_at: string;
}

// Fetch wrapper
const apiFetch = async <T>(endpoint: string, options?: RequestInit): Promise<T | null> => {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    if (!response.ok) {
      console.error(`API error: ${response.status}`);
      return null;
    }
    
    return response.json();
  } catch (error) {
    console.error('API fetch failed:', error);
    return null;
  }
};

// ====================
// SCENARIOS API
// ====================

export const getScenarios = async (): Promise<Scenario[]> => {
  const result = await apiFetch<{ success: boolean; scenarios: Scenario[] }>('/scenarios');
  return result?.scenarios || [];
};

export const getScenarioById = async (id: string): Promise<Scenario | null> => {
  const result = await apiFetch<{ success: boolean; scenario: Scenario }>(`/scenarios/${id}`);
  return result?.success ? result.scenario : null;
};

// ====================
// COLD CALL SESSIONS API
// ====================

export const saveCallSession = async (
  scenarioId: string,
  transcript: TranscriptMessage[],
  durationSeconds: number,
  score: CallScore
): Promise<{ success: boolean; sessionId?: string }> => {
  const clerkId = getClerkId();
  if (!clerkId) {
    console.warn('No clerkId available for saveCallSession');
    return { success: false };
  }

  const result = await apiFetch<{ success: boolean; session?: { id: string } }>(
    '/cold-call/sessions',
    {
      method: 'POST',
      body: JSON.stringify({
        clerkId,
        scenarioId,
        transcript,
        durationSeconds,
        overallScore: score.overall,
        openingScore: score.opening,
        valueScore: score.value,
        objectionScore: score.objection,
        controlScore: score.control,
        closeScore: score.close,
        highlights: score.highlights,
        improvements: score.improvements,
      }),
    }
  );

  return {
    success: result?.success || false,
    sessionId: result?.session?.id,
  };
};

export const getCallSession = async (sessionId: string): Promise<ColdCallSession | null> => {
  const result = await apiFetch<{ success: boolean; session: ColdCallSession }>(
    `/cold-call/sessions/${sessionId}`
  );
  return result?.success ? result.session : null;
};

export const getColdCallProgress = async (): Promise<{ completedScenarios: string[] }> => {
  const clerkId = getClerkId();
  if (!clerkId) return { completedScenarios: [] };

  const result = await apiFetch<{ success: boolean; completedScenarios: string[] }>(
    `/cold-call/progress?clerkId=${clerkId}`
  );
  return { completedScenarios: result?.completedScenarios || [] };
};

// ====================
// SCORING API (uses Claude)
// ====================

export const scoreCall = async (
  transcript: TranscriptMessage[],
  scenario: Scenario
): Promise<CallScore | null> => {
  const result = await apiFetch<{ success: boolean; score: CallScore }>(
    '/cold-call/score',
    {
      method: 'POST',
      body: JSON.stringify({ transcript, scenario }),
    }
  );

  return result?.success ? result.score : null;
};
