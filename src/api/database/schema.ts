import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

/**
 * Praxy Database Schema
 * Using Clerk user IDs for authentication
 */

// Users table - stores user profile data synced from Clerk
export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  clerkId: text("clerk_id").unique().notNull(),
  email: text("email"),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  totalXp: integer("total_xp").default(0),
  streakDays: integer("streak_days").default(0),
  lastActiveDate: text("last_active_date"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Progress table - tracks user progress per simulator
export const progress = sqliteTable("progress", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  clerkId: text("clerk_id").notNull(),
  simulator: text("simulator").notNull(), // 'balance-sheet', 'cold-call', 'rca'
  currentLevel: integer("current_level").default(1),
  completedLevels: text("completed_levels").default("[]"), // JSON array of level numbers
  badges: text("badges").default("[]"), // JSON array of badge IDs
  bestScore: integer("best_score").default(0),
  totalSessions: integer("total_sessions").default(0),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Sessions table - logs each practice session
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  clerkId: text("clerk_id").notNull(),
  simulator: text("simulator").notNull(),
  level: integer("level").notNull(),
  score: integer("score"),
  totalQuestions: integer("total_questions"),
  timeSeconds: integer("time_seconds"),
  answers: text("answers"), // JSON of answer details
  completedAt: text("completed_at").default(sql`CURRENT_TIMESTAMP`),
});

// Badges table - tracks earned badges
export const badges = sqliteTable("badges", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  clerkId: text("clerk_id").notNull(),
  badgeId: text("badge_id").notNull(),
  badgeName: text("badge_name").notNull(),
  simulator: text("simulator").notNull(),
  earnedAt: text("earned_at").default(sql`CURRENT_TIMESTAMP`),
});

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Progress = typeof progress.$inferSelect;
export type NewProgress = typeof progress.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Badge = typeof badges.$inferSelect;
export type NewBadge = typeof badges.$inferInsert;
