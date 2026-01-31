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

// Simulators table - stores available learning simulators
export const simulators = sqliteTable("simulators", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  description: text("description"),
  icon: text("icon"),
  status: text("status").default("coming-soon"), // 'active', 'coming-soon', 'beta'
  totalLevels: integer("total_levels").default(10),
  orderIndex: integer("order_index").default(0),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Levels table - stores level content for each simulator
export const levels = sqliteTable("levels", {
  id: text("id").primaryKey(),
  simulatorId: text("simulator_id").notNull(),
  levelNumber: integer("level_number").notNull(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  concept: text("concept"),
  formula: text("formula"),
  explanation: text("explanation"),
  companyName: text("company_name"),
  companyData: text("company_data"), // JSON string
  insight: text("insight"),
  status: text("status").default("locked"), // 'locked', 'unlocked'
  xpReward: integer("xp_reward").default(100),
  badgeId: text("badge_id"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Questions table - stores quiz questions for each level
export const questions = sqliteTable("questions", {
  id: text("id").primaryKey(),
  levelId: text("level_id").notNull(),
  questionNumber: integer("question_number").notNull(),
  type: text("type").notNull(), // 'visual-comparison', 'yes-no', 'multiple-choice'
  prompt: text("prompt").notNull(),
  context: text("context"),
  options: text("options").notNull(), // JSON array
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation"),
  hint: text("hint"),
  xpValue: integer("xp_value").default(30),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Company data table - stores preloaded balance sheet data
export const companyData = sqliteTable("company_data", {
  id: text("id").primaryKey(),
  companyName: text("company_name").notNull(),
  ticker: text("ticker"),
  year: integer("year"),
  dataType: text("data_type").default("balance-sheet"),
  rawData: text("raw_data").notNull(), // JSON string
  source: text("source"),
  isPreloaded: integer("is_preloaded").default(1),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
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
export type Simulator = typeof simulators.$inferSelect;
export type NewSimulator = typeof simulators.$inferInsert;
export type Level = typeof levels.$inferSelect;
export type NewLevel = typeof levels.$inferInsert;
export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;
export type CompanyData = typeof companyData.$inferSelect;
export type NewCompanyData = typeof companyData.$inferInsert;
