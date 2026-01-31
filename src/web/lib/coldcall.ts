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
  const result = await apiFetch<{ success: boolean; scenarios: Scenario[] }>('/coldcall/scenarios');
  return result?.scenarios || [];
};

export const getScenarioById = async (id: string): Promise<Scenario | null> => {
  const scenarios = await getScenarios();
  return scenarios.find(s => s.id === id) || null;
};

// ====================
// COLD CALL SESSIONS API
// ====================

/**
 * Start a call session and get ElevenLabs signed URL
 */
export const startCallSession = async (
  scenarioId: string
): Promise<{ success: boolean; sessionId?: string; signedUrl?: string; agentId?: string } | null> => {
  const clerkId = getClerkId();
  if (!clerkId) {
    console.warn('No clerkId available for startCallSession');
    return null;
  }

  const result = await apiFetch<{
    success: boolean;
    session_id: string;
    signed_url: string;
    agent_id: string;
  }>('/coldcall/start', {
    method: 'POST',
    body: JSON.stringify({
      clerk_id: clerkId,
      scenario_id: scenarioId,
    }),
  });

  if (!result?.success) return null;

  return {
    success: true,
    sessionId: result.session_id,
    signedUrl: result.signed_url,
    agentId: result.agent_id,
  };
};

/**
 * End a call session and get feedback
 */
export const endCallSession = async (
  sessionId: string,
  scenarioId: string,
  transcript: TranscriptMessage[],
  durationSeconds: number,
  outcome: 'success' | 'partial' | 'failure'
): Promise<{
  success: boolean;
  score?: number;
  xpEarned?: number;
  feedback?: any;
} | null> => {
  const clerkId = getClerkId();
  if (!clerkId) {
    console.warn('No clerkId available for endCallSession');
    return null;
  }

  const result = await apiFetch<{
    success: boolean;
    score: number;
    xp_earned: number;
    feedback: any;
  }>('/coldcall/end', {
    method: 'POST',
    body: JSON.stringify({
      session_id: sessionId,
      clerk_id: clerkId,
      scenario_id: scenarioId,
      transcript,
      duration_seconds: durationSeconds,
      outcome,
    }),
  });

  if (!result?.success) return null;

  return {
    success: true,
    score: result.score,
    xpEarned: result.xp_earned,
    feedback: result.feedback,
  };
};

/**
 * Save call session (deprecated - use endCallSession)
 */
export const saveCallSession = async (
  scenarioId: string,
  transcript: TranscriptMessage[],
  durationSeconds: number,
  score: CallScore
): Promise<{ success: boolean; sessionId?: string }> => {
  console.warn('saveCallSession is deprecated, use endCallSession instead');
  return { success: false };
};

export const getCallSession = async (sessionId: string): Promise<ColdCallSession | null> => {
  console.warn('getCallSession not yet implemented');
  return null;
};

export const getColdCallProgress = async (): Promise<{ completedScenarios: string[] }> => {
  const clerkId = getClerkId();
  if (!clerkId) return { completedScenarios: [] };

  const result = await apiFetch<{
    success: boolean;
    progress: any;
    recent_sessions: any[];
  }>(`/coldcall/progress?clerkId=${clerkId}`);

  // Convert progress to completed scenarios (score >= 60)
  const completedScenarios = result?.recent_sessions
    ?.filter((s: any) => s.score >= 60)
    ?.map((s: any) => `cc-${s.level}`) || [];

  return { completedScenarios: Array.from(new Set(completedScenarios)) };
};

// Get all cold call sessions for the user (call history)
export const getColdCallSessions = async (): Promise<ColdCallSession[]> => {
  const clerkId = getClerkId();
  if (!clerkId) return [];

  const result = await apiFetch<{
    success: boolean;
    progress: any;
    recent_sessions: any[];
  }>(`/coldcall/progress?clerkId=${clerkId}`);

  // Map backend sessions to ColdCallSession format
  return (result?.recent_sessions || []).map((s: any) => ({
    id: s.id,
    clerk_id: clerkId,
    scenario_id: `cc-${s.level}`,
    transcript: [],
    duration_seconds: s.duration_seconds || 0,
    overall_score: s.score || 0,
    opening_score: 0,
    value_score: 0,
    objection_score: 0,
    control_score: 0,
    close_score: 0,
    highlights: [],
    improvements: [],
    completed_at: s.completed_at || new Date().toISOString(),
  }));
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
