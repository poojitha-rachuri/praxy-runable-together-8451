/**
 * Praxy API Client
 * Handles communication with the backend and localStorage fallback
 */

const API_BASE = '/api';

// Generate or retrieve userId from localStorage
const getUserId = (): string => {
  let userId = localStorage.getItem('praxy_user_id');
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem('praxy_user_id', userId);
  }
  return userId;
};

interface User {
  id: string;
  name: string;
  totalXp: number;
  streakDays: number;
  lastActiveDate?: string;
}

interface Progress {
  currentLevel: number;
  completedLevels: number[];
  badges: string[];
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
      console.warn(`API error: ${response.status}`);
      return null;
    }
    
    return response.json();
  } catch (error) {
    console.warn('API fetch failed, using localStorage fallback:', error);
    return null;
  }
};

// ====================
// USER API
// ====================

export const getOrCreateUser = async (): Promise<{ user: User; isNew: boolean }> => {
  const userId = getUserId();
  const result = await apiFetch<{ success: boolean; user: User; isNew: boolean }>(`/user?userId=${userId}`);
  
  if (result?.success && result.user) {
    return { user: result.user, isNew: result.isNew };
  }
  
  // Fallback to localStorage
  return {
    user: {
      id: userId,
      name: localStorage.getItem('praxy_user_name') || 'Learner',
      totalXp: parseInt(localStorage.getItem('praxy_total_xp') || '0', 10),
      streakDays: parseInt(localStorage.getItem('praxy_streak') || '1', 10),
    },
    isNew: false,
  };
};

// ====================
// PROGRESS API
// ====================

export const getProgress = async (simulator = 'balance-sheet'): Promise<Progress> => {
  const userId = getUserId();
  const result = await apiFetch<{ success: boolean; progress: Progress }>(
    `/progress?userId=${userId}&simulator=${simulator}`
  );
  
  if (result?.success && result.progress) {
    return result.progress;
  }
  
  // Fallback to localStorage
  const isLevel1Complete = localStorage.getItem('praxy_level1_complete') === 'true';
  return {
    currentLevel: isLevel1Complete ? 2 : 1,
    completedLevels: isLevel1Complete ? [1] : [],
    badges: isLevel1Complete ? ['Survivor Badge'] : [],
  };
};

export const updateProgress = async (
  levelCompleted: number, 
  badge?: string, 
  xpEarned?: number,
  simulator = 'balance-sheet'
): Promise<{ success: boolean; progress?: Progress }> => {
  const userId = getUserId();
  
  const result = await apiFetch<{ success: boolean; progress?: Progress }>(
    '/progress',
    {
      method: 'POST',
      body: JSON.stringify({ 
        userId, 
        simulatorType: simulator, 
        level: levelCompleted, 
        passed: true,
        badge 
      }),
    }
  );
  
  if (result?.success) {
    // Also update localStorage as backup
    localStorage.setItem(`praxy_level${levelCompleted}_complete`, 'true');
    localStorage.setItem('praxy_current_level', String(levelCompleted + 1));
    if (xpEarned) {
      const currentXp = parseInt(localStorage.getItem('praxy_total_xp') || '0', 10);
      localStorage.setItem('praxy_total_xp', String(currentXp + xpEarned));
      localStorage.setItem(`praxy_level${levelCompleted}_xp`, String(xpEarned));
    }
    return result;
  }
  
  // Fallback: update localStorage only
  localStorage.setItem(`praxy_level${levelCompleted}_complete`, 'true');
  localStorage.setItem('praxy_current_level', String(levelCompleted + 1));
  if (xpEarned) {
    const currentXp = parseInt(localStorage.getItem('praxy_total_xp') || '0', 10);
    localStorage.setItem('praxy_total_xp', String(currentXp + xpEarned));
    localStorage.setItem(`praxy_level${levelCompleted}_xp`, String(xpEarned));
  }
  
  return { 
    success: true, 
    progress: {
      currentLevel: levelCompleted + 1,
      completedLevels: [levelCompleted],
      badges: badge ? [badge] : [],
    }
  };
};

// ====================
// SESSIONS API
// ====================

export const saveSession = async (
  level: number,
  score: number,
  totalQuestions: number,
  xpEarned: number,
  timeSeconds?: number,
  simulator = 'balance-sheet'
): Promise<boolean> => {
  const userId = getUserId();
  
  const result = await apiFetch<{ success: boolean }>(
    '/sessions',
    {
      method: 'POST',
      body: JSON.stringify({ 
        userId, 
        simulatorType: simulator, 
        level, 
        score, 
        totalQuestions, 
        xpEarned,
        timeSeconds 
      }),
    }
  );
  
  return result?.success || false;
};

// ====================
// STATS API (for Dashboard)
// ====================

export const getStats = async (): Promise<Stats> => {
  const userId = getUserId();
  const result = await apiFetch<{ 
    totalXp: number; 
    streakDays: number;
    currentLevel: number;
    completedLevels: number[];
    badges: string[];
    sessionsCount: number;
  }>(`/stats?userId=${userId}`);
  
  if (result && result.totalXp !== undefined) {
    // Cache to localStorage
    localStorage.setItem('praxy_total_xp', String(result.totalXp));
    localStorage.setItem('praxy_streak', String(result.streakDays));
    localStorage.setItem('praxy_current_level', String(result.currentLevel));
    return {
      totalXp: result.totalXp,
      streakDays: result.streakDays,
      currentLevel: result.currentLevel,
      completedLevels: result.completedLevels,
      badges: result.badges || [],
      sessionsCount: result.sessionsCount,
    };
  }
  
  // Fallback to localStorage
  const isLevel1Complete = localStorage.getItem('praxy_level1_complete') === 'true';
  const xp = parseInt(localStorage.getItem('praxy_total_xp') || localStorage.getItem('praxy_level1_xp') || '0', 10);
  
  return {
    totalXp: xp,
    streakDays: parseInt(localStorage.getItem('praxy_streak') || '1', 10),
    currentLevel: isLevel1Complete ? 2 : 1,
    completedLevels: isLevel1Complete ? [1] : [],
    badges: isLevel1Complete ? ['Survivor Badge'] : [],
    sessionsCount: isLevel1Complete ? 1 : 0,
  };
};

// Export userId getter for components that need it
export { getUserId };
