/**
 * RCA Detective API Client
 * Handles cases, analysis submission, and Claude-based scoring
 */

import { getClerkId } from './api';

const API_BASE = '/api';

// ====================
// TYPES
// ====================

export interface DataSource {
  id: string;
  name: string;
  data: Record<string, any>;
}

export interface RCACase {
  id: string;
  level_number: number;
  title: string;
  initial_problem: string;
  metric_name: string;
  metric_drop: string;
  time_period: string | null;
  available_data?: DataSource[];  // Optional - only returned for single case view
  root_cause?: string;            // Optional - only returned for single case view
  correct_fix?: string;           // Optional - only returned for single case view
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  xp_reward: number;
}

export interface InvestigationState {
  dataRequested: string[];
  fiveWhys: string[];
  fishboneCauses: Array<{ category: string; causes: string[] }>;
  hypothesis: {
    rootCause: string;
    fix: string;
    confidence: 'low' | 'medium' | 'high';
  } | null;
  timeSpent: number;
}

export interface AnalysisScore {
  root_cause_score: number; // 0-50
  fix_score: number; // 0-30
  efficiency_score: number; // 0-20
  total_score: number; // 0-100
  is_correct: boolean;
  feedback: string;
}

export interface RCASession {
  id: string;
  clerk_id: string;
  case_id: string;
  investigation_state: InvestigationState;
  score: AnalysisScore;
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
// CASES API
// ====================

export const getCases = async (): Promise<RCACase[]> => {
  const result = await apiFetch<{ success: boolean; cases: RCACase[] }>('/rca/cases');
  return result?.cases || [];
};

export const getCaseById = async (id: string): Promise<RCACase | null> => {
  const result = await apiFetch<{ success: boolean; case: RCACase }>(`/rca/cases/${id}`);
  return result?.success ? result.case : null;
};

// ====================
// ANALYSIS SUBMISSION & SCORING
// ====================

export const submitAnalysis = async (
  caseId: string,
  investigationState: InvestigationState
): Promise<{ success: boolean; score?: AnalysisScore; sessionId?: string }> => {
  const clerkId = getClerkId();
  if (!clerkId) {
    console.warn('No clerkId available for submitAnalysis');
    return { success: false };
  }

  const result = await apiFetch<{ 
    success: boolean; 
    score?: AnalysisScore; 
    session?: { id: string } 
  }>(
    '/rca/submit',
    {
      method: 'POST',
      body: JSON.stringify({
        clerkId,
        caseId,
        investigationState,
      }),
    }
  );

  return {
    success: result?.success || false,
    score: result?.score,
    sessionId: result?.session?.id,
  };
};

// ====================
// PROGRESS API
// ====================

export const getRCAProgress = async (): Promise<{ completedCases: string[] }> => {
  const clerkId = getClerkId();
  if (!clerkId) return { completedCases: [] };

  const result = await apiFetch<{ success: boolean; completedCases: string[] }>(
    `/rca/progress?clerkId=${clerkId}`
  );
  return { completedCases: result?.completedCases || [] };
};

// ====================
// SESSION API
// ====================

export const getRCASession = async (sessionId: string): Promise<RCASession | null> => {
  const result = await apiFetch<{ success: boolean; session: RCASession }>(
    `/rca/sessions/${sessionId}`
  );
  return result?.success ? result.session : null;
};
