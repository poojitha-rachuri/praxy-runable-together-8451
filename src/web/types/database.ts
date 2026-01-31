// Database types for Praxy frontend

export type Simulator = 'balance-sheet' | 'cold-call' | 'rca';

export interface User {
  id: string;
  clerkId: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  totalXp: number;
  streakDays: number;
  lastActiveDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Progress {
  id: string;
  clerkId: string;
  simulator: Simulator;
  currentLevel: number;
  completedLevels: number[];
  badges: string[];
  bestScore: number;
  totalSessions: number;
  updatedAt: string;
}

export interface Session {
  id: string;
  clerkId: string;
  simulator: Simulator;
  level: number;
  score: number | null;
  totalQuestions: number | null;
  timeSeconds: number | null;
  answers: Record<string, any> | null;
  completedAt: string;
}

export interface Badge {
  id: string;
  clerkId: string;
  badgeId: string;
  badgeName: string;
  simulator: Simulator;
  earnedAt: string;
}

// API response types
export interface UserStats {
  totalXp: number;
  streakDays: number;
  currentLevel: number;
  completedLevels: number[];
  badges: string[];
  totalSessions: number;
}
