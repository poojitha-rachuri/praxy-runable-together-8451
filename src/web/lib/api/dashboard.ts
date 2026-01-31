/**
 * Dashboard API client
 * Fetches user stats, simulator progress, and recent sessions for the dashboard.
 */

const API_BASE = '/api';

export interface UserStats {
  total_xp: number;
  streak_days: number;
  badges_count: number;
  sessions_count: number;
}

export interface SimulatorProgressItem {
  simulator: string;
  current_level: number;
  total_levels: number;
  progress_percent: number;
  completed_levels: number[];
}

export interface RecentSession {
  id: string;
  clerkId: string;
  simulator: string;
  level: number;
  score: number | null;
  totalQuestions: number | null;
  timeSeconds: number | null;
  completedAt: string;
}

const apiFetch = async <T>(endpoint: string): Promise<T | null> => {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      console.error(`Dashboard API error: ${response.status}`);
      return null;
    }
    return response.json();
  } catch (error) {
    console.error('Dashboard API fetch failed:', error);
    return null;
  }
};

/**
 * Get user stats for the dashboard: total XP, streak days, badges count, sessions count.
 */
export async function getUserStats(clerkId: string): Promise<UserStats | null> {
  const result = await apiFetch<{
    success: boolean;
    stats: {
      totalXp: number;
      streakDays: number;
      badges: string[];
      sessionsCount: number;
    };
  }>(`/stats?clerkId=${encodeURIComponent(clerkId)}`);

  if (!result?.success || result.stats == null) return null;

  return {
    total_xp: result.stats.totalXp ?? 0,
    streak_days: result.stats.streakDays ?? 0,
    badges_count: Array.isArray(result.stats.badges) ? result.stats.badges.length : 0,
    sessions_count: result.stats.sessionsCount ?? 0,
  };
}

/** Default total levels per simulator (when not from DB). */
const DEFAULT_TOTAL_LEVELS: Record<string, number> = {
  'balance-sheet': 10,
  'cold-call': 10,
  rca: 10,
};

/**
 * Get progress for all simulators: current level, total levels, progress percent.
 */
export async function getSimulatorProgress(
  clerkId: string
): Promise<SimulatorProgressItem[]> {
  const result = await apiFetch<{
    success: boolean;
    progress: Array<{
      simulator: string;
      currentLevel: number;
      completedLevels: number[];
    }>;
  }>(`/dashboard/progress?clerkId=${encodeURIComponent(clerkId)}`);

  if (!result?.success || !Array.isArray(result.progress)) return [];

  return result.progress.map((p) => {
    const total_levels = DEFAULT_TOTAL_LEVELS[p.simulator] ?? 10;
    const completed = p.completedLevels?.length ?? 0;
    const progress_percent =
      total_levels > 0 ? Math.round((completed / total_levels) * 100) : 0;

    return {
      simulator: p.simulator,
      current_level: p.currentLevel ?? 1,
      total_levels,
      progress_percent,
      completed_levels: p.completedLevels ?? [],
    };
  });
}

/**
 * Get recent practice sessions for the user.
 */
export async function getRecentSessions(
  clerkId: string,
  limit = 10
): Promise<RecentSession[]> {
  const result = await apiFetch<{
    success: boolean;
    sessions: Array<{
      id: string;
      clerkId: string;
      simulator: string;
      level: number;
      score: number | null;
      totalQuestions: number | null;
      timeSeconds: number | null;
      completedAt: string;
    }>;
  }>(`/sessions?clerkId=${encodeURIComponent(clerkId)}&limit=${limit}`);

  if (!result?.success || !Array.isArray(result.sessions)) return [];

  return result.sessions.map((s) => ({
    id: s.id,
    clerkId: s.clerkId,
    simulator: s.simulator,
    level: s.level,
    score: s.score,
    totalQuestions: s.totalQuestions,
    timeSeconds: s.timeSeconds,
    completedAt: s.completedAt,
  }));
}
