-- Migration: Add Clerk authentication support
-- Drop existing tables and recreate with Clerk IDs

DROP TABLE IF EXISTS badges;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS progress;
DROP TABLE IF EXISTS users;

-- Users table - stores user profile data synced from Clerk
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  total_xp INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_active_date TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Progress table - tracks user progress per simulator
CREATE TABLE progress (
  id TEXT PRIMARY KEY,
  clerk_id TEXT NOT NULL,
  simulator TEXT NOT NULL,
  current_level INTEGER DEFAULT 1,
  completed_levels TEXT DEFAULT '[]',
  badges TEXT DEFAULT '[]',
  best_score INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(clerk_id, simulator)
);

-- Sessions table - logs each practice session
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  clerk_id TEXT NOT NULL,
  simulator TEXT NOT NULL,
  level INTEGER NOT NULL,
  score INTEGER,
  total_questions INTEGER,
  time_seconds INTEGER,
  answers TEXT,
  completed_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Badges table - tracks earned badges
CREATE TABLE badges (
  id TEXT PRIMARY KEY,
  clerk_id TEXT NOT NULL,
  badge_id TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  simulator TEXT NOT NULL,
  earned_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(clerk_id, badge_id)
);

-- Indexes for common queries
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_progress_clerk_id ON progress(clerk_id);
CREATE INDEX idx_sessions_clerk_id ON sessions(clerk_id);
CREATE INDEX idx_badges_clerk_id ON badges(clerk_id);
