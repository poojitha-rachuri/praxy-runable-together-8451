/**
 * Praxy API Client
 * Handles communication with the backend using Clerk authentication
 */

const API_BASE = '/api';

// Store for the current Clerk user ID (set by components using useUser hook)
let currentClerkId: string | null = null;

export const setClerkId = (clerkId: string | null) => {
  currentClerkId = clerkId;
  if (clerkId) {
    localStorage.setItem('praxy_clerk_id', clerkId);
  }
};

export const getClerkId = (): string | null => {
  return currentClerkId || localStorage.getItem('praxy_clerk_id');
};

interface User {
  id: string;
  clerkId: string;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
  totalXp: number;
  streakDays: number;
  lastActiveDate?: string;
}

interface Progress {
  currentLevel: number;
  completedLevels: number[];
  badges: string[];
  bestScore: number;
  totalSessions: number;
}

interface Stats {
  totalXp: number;
  streakDays: number;
  currentLevel: number;
  completedLevels: number[];
  badges: string[];
  sessionsCount: number;
}

// Fetch wrapper with error handling
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
      const errorText = await response.text();
      console.error(`API error: ${response.status}`, errorText);
      return null;
    }
    
    return response.json();
  } catch (error) {
    console.error('API fetch failed:', error);
    return null;
  }
};

// ====================
// USER API
// ====================

export const getOrCreateUser = async (
  clerkId: string,
  email?: string | null,
  name?: string | null,
  avatarUrl?: string | null
): Promise<{ user: User; isNew: boolean } | null> => {
  const params = new URLSearchParams({ clerkId });
  if (email) params.append('email', email);
  if (name) params.append('name', name);
  if (avatarUrl) params.append('avatarUrl', avatarUrl);
  
  const result = await apiFetch<{ success: boolean; user: User; isNew: boolean }>(
    `/user?${params.toString()}`
  );
  
  if (result?.success && result.user) {
    setClerkId(clerkId);
    return { user: result.user, isNew: result.isNew };
  }
  
  return null;
};

// ====================
// PROGRESS API
// ====================

export const getProgress = async (simulator = 'balance-sheet'): Promise<Progress | null> => {
  const clerkId = getClerkId();
  if (!clerkId) {
    console.warn('No clerkId available for getProgress');
    return null;
  }
  
  const result = await apiFetch<{ success: boolean; progress: Progress }>(
    `/progress?clerkId=${clerkId}&simulator=${simulator}`
  );
  
  if (result?.success && result.progress) {
    return result.progress;
  }
  
  return null;
};

export const updateProgress = async (
  level: number,
  score: number,
  passed: boolean,
  badge?: string,
  simulator = 'balance-sheet'
): Promise<{ success: boolean; progress?: Progress }> => {
  const clerkId = getClerkId();
  if (!clerkId) {
    console.warn('No clerkId available for updateProgress');
    return { success: false };
  }
  
  const result = await apiFetch<{ success: boolean; progress?: Progress }>(
    '/progress',
    {
      method: 'POST',
      body: JSON.stringify({ 
        clerkId, 
        simulator, 
        level, 
        score,
        passed,
        badge 
      }),
    }
  );
  
  return result || { success: false };
};

// ====================
// SESSIONS API
// ====================

export const saveSession = async (
  level: number,
  score: number,
  totalQuestions: number,
  timeSeconds?: number,
  answers?: Record<string, any>,
  simulator = 'balance-sheet'
): Promise<{ success: boolean; xpEarned?: number }> => {
  const clerkId = getClerkId();
  if (!clerkId) {
    console.warn('No clerkId available for saveSession');
    return { success: false };
  }
  
  const result = await apiFetch<{ success: boolean; session?: { xpEarned: number } }>(
    '/sessions',
    {
      method: 'POST',
      body: JSON.stringify({ 
        clerkId, 
        simulator, 
        level, 
        score, 
        totalQuestions,
        timeSeconds,
        answers,
      }),
    }
  );
  
  return { 
    success: result?.success || false,
    xpEarned: result?.session?.xpEarned,
  };
};

// ====================
// BADGES API
// ====================

export const awardBadge = async (
  badgeId: string,
  badgeName: string,
  simulator = 'balance-sheet'
): Promise<boolean> => {
  const clerkId = getClerkId();
  if (!clerkId) {
    console.warn('No clerkId available for awardBadge');
    return false;
  }
  
  const result = await apiFetch<{ success: boolean }>(
    '/badges',
    {
      method: 'POST',
      body: JSON.stringify({ clerkId, badgeId, badgeName, simulator }),
    }
  );
  
  return result?.success || false;
};

export const getBadges = async (): Promise<Array<{ badgeId: string; badgeName: string; earnedAt: string }>> => {
  const clerkId = getClerkId();
  if (!clerkId) return [];
  
  const result = await apiFetch<{ success: boolean; badges: Array<{ badgeId: string; badgeName: string; earnedAt: string }> }>(
    `/badges?clerkId=${clerkId}`
  );
  
  return result?.badges || [];
};

// ====================
// STATS API (for Dashboard)
// ====================

export const getStats = async (): Promise<Stats | null> => {
  const clerkId = getClerkId();
  if (!clerkId) {
    console.warn('No clerkId available for getStats');
    return null;
  }
  
  const result = await apiFetch<{ success: boolean; stats: Stats }>(
    `/stats?clerkId=${clerkId}`
  );
  
  if (result?.success && result.stats) {
    return result.stats;
  }
  
  return null;
};

// ====================
// DATABASE INIT
// ====================

export const initDatabase = async (): Promise<boolean> => {
  const result = await apiFetch<{ success: boolean }>('/init-db');
  return result?.success || false;
};
