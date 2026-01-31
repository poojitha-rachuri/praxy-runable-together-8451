/**
 * TypeScript types for Cold Call API
 * Use these types in your frontend components
 */

export interface ColdCallScenario {
  id: string;
  level: number;
  title: string;
  company: string;
  prospect: {
    name: string;
    role: string;
  };
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  agent_id: string;
  objective: string;
  tips: string[];
}

export interface StartCallRequest {
  clerk_id: string;
  scenario_id: string;
}

export interface StartCallResponse {
  success: boolean;
  session_id: string;
  signed_url: string;
  agent_id: string;
  scenario: ColdCallScenario;
  message: string;
}

export interface TranscriptMessage {
  role: 'user' | 'agent';
  content: string;
  timestamp?: number;
}

export interface EndCallRequest {
  session_id: string;
  clerk_id: string;
  scenario_id: string;
  transcript: TranscriptMessage[];
  duration_seconds: number;
  outcome: 'success' | 'partial' | 'failure';
}

export interface CallFeedback {
  opening: {
    score: number;
    comment: string;
  };
  value_proposition: {
    score: number;
    comment: string;
  };
  objection_handling: {
    score: number;
    comment: string;
  };
  professionalism: {
    score: number;
    comment: string;
  };
  outcome: {
    score: number;
    comment: string;
  };
  overall: string;
  praxy_message: string;
  top_tip: string;
}

export interface EndCallResponse {
  success: boolean;
  score: number;
  xp_earned: number;
  feedback: CallFeedback;
}

export interface CallSession {
  id: string;
  level: number;
  score: number;
  time_seconds: number;
  completed_at: string;
}

export interface CallProgress {
  total_sessions: number;
  best_score: number;
}

export interface ProgressResponse {
  success: boolean;
  progress: CallProgress;
  recent_sessions: CallSession[];
}

export interface ScenariosResponse {
  success: boolean;
  scenarios: ColdCallScenario[];
}

export interface ApiError {
  success: false;
  error: string;
}
