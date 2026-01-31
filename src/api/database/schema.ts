import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

/**
 * Praxy Database Schema
 * For tracking user progress, XP, streaks, and quiz sessions
 */

// Users table - stores basic user info and aggregate stats
export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email"),
  name: text("name").default("Learner"),
  totalXp: integer("total_xp").default(0),
  streakDays: integer("streak_days").default(0),
  lastActiveDate: text("last_active_date"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Progress table - tracks progress per simulator
export const progress = sqliteTable("progress", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  simulatorType: text("simulator_type").default("balance-sheet"),
  currentLevel: integer("current_level").default(1),
  completedLevels: text("completed_levels").default("[]"), // JSON array
  badges: text("badges").default("[]"), // JSON array
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Sessions table - stores individual quiz results
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  simulatorType: text("simulator_type").default("balance-sheet"),
  level: integer("level").notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").default(5),
  xpEarned: integer("xp_earned").default(0),
  timeSeconds: integer("time_seconds"),
  completedAt: text("completed_at").default(sql`CURRENT_TIMESTAMP`),
});

// Type exports for use in API routes
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Progress = typeof progress.$inferSelect;
export type NewProgress = typeof progress.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
