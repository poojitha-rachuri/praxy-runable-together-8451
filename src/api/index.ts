import { Hono } from 'hono';
import { cors } from "hono/cors";
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, desc } from 'drizzle-orm';
import { users, progress, sessions, badges, simulators, levels, questions, companyData } from './database/schema';

const app = new Hono<{ Bindings: Env }>()
  .basePath('api');

app.use(cors({
  origin: "*"
}));

app.get('/ping', (c) => c.json({ message: `Pong! ${Date.now()}` }));

// ====================
// DATABASE INIT - Creates tables if they don't exist
// ====================
app.get('/init-db', async (c) => {
  try {
    const db = c.env.DB;
    
    // Create users table
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS users (
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
      )
    `).run();
    
    // Create progress table
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS progress (
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
      )
    `).run();
    
    // Create sessions table
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        clerk_id TEXT NOT NULL,
        simulator TEXT NOT NULL,
        level INTEGER NOT NULL,
        score INTEGER,
        total_questions INTEGER,
        time_seconds INTEGER,
        answers TEXT,
        completed_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
    
    // Create badges table
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS badges (
        id TEXT PRIMARY KEY,
        clerk_id TEXT NOT NULL,
        badge_id TEXT NOT NULL,
        badge_name TEXT NOT NULL,
        simulator TEXT NOT NULL,
        earned_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(clerk_id, badge_id)
      )
    `).run();
    
    // Create simulators table
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS simulators (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        icon TEXT,
        status TEXT DEFAULT 'coming-soon',
        total_levels INTEGER DEFAULT 10,
        order_index INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
    
    // Create levels table
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS levels (
        id TEXT PRIMARY KEY,
        simulator_id TEXT NOT NULL,
        level_number INTEGER NOT NULL,
        title TEXT NOT NULL,
        subtitle TEXT,
        concept TEXT,
        formula TEXT,
        explanation TEXT,
        company_name TEXT,
        company_data TEXT,
        insight TEXT,
        status TEXT DEFAULT 'locked',
        xp_reward INTEGER DEFAULT 100,
        badge_id TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(simulator_id, level_number)
      )
    `).run();
    
    // Create questions table
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS questions (
        id TEXT PRIMARY KEY,
        level_id TEXT NOT NULL,
        question_number INTEGER NOT NULL,
        type TEXT NOT NULL,
        prompt TEXT NOT NULL,
        context TEXT,
        options TEXT NOT NULL,
        correct_answer TEXT NOT NULL,
        explanation TEXT,
        hint TEXT,
        xp_value INTEGER DEFAULT 30,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
    
    // Create company_data table
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS company_data (
        id TEXT PRIMARY KEY,
        company_name TEXT NOT NULL,
        ticker TEXT,
        year INTEGER,
        data_type TEXT DEFAULT 'balance-sheet',
        raw_data TEXT NOT NULL,
        source TEXT,
        is_preloaded INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
    
    // Create indexes (ignore errors if they exist)
    try { await db.prepare(`CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id)`).run(); } catch {}
    try { await db.prepare(`CREATE INDEX IF NOT EXISTS idx_progress_clerk_id ON progress(clerk_id)`).run(); } catch {}
    try { await db.prepare(`CREATE INDEX IF NOT EXISTS idx_sessions_clerk_id ON sessions(clerk_id)`).run(); } catch {}
    try { await db.prepare(`CREATE INDEX IF NOT EXISTS idx_badges_clerk_id ON badges(clerk_id)`).run(); } catch {}
    try { await db.prepare(`CREATE INDEX IF NOT EXISTS idx_levels_simulator ON levels(simulator_id)`).run(); } catch {}
    try { await db.prepare(`CREATE INDEX IF NOT EXISTS idx_questions_level ON questions(level_id)`).run(); } catch {}
    
    // ====================
    // SEED DATA - Insert default content
    // ====================
    
    // Seed simulators
    await db.prepare(`
      INSERT OR IGNORE INTO simulators (id, name, slug, description, icon, status, total_levels, order_index)
      VALUES ('sim-bs', 'Balance Sheet Mastery', 'balance-sheet', 'Master financial statement analysis with real company data', '📊', 'active', 10, 1)
    `).run();
    await db.prepare(`
      INSERT OR IGNORE INTO simulators (id, name, slug, description, icon, status, total_levels, order_index)
      VALUES ('sim-cc', 'Cold Call Hero', 'cold-call', 'Practice sales conversations with AI-powered roleplay', '📞', 'coming-soon', 5, 2)
    `).run();
    await db.prepare(`
      INSERT OR IGNORE INTO simulators (id, name, slug, description, icon, status, total_levels, order_index)
      VALUES ('sim-rca', 'RCA Detective', 'rca', 'Solve business problems using root cause analysis', '🔍', 'coming-soon', 5, 3)
    `).run();
    
    // Seed levels for Balance Sheet Mastery
    await db.prepare(`
      INSERT OR IGNORE INTO levels (id, simulator_id, level_number, title, subtitle, concept, formula, explanation, company_name, company_data, insight, status, xp_reward, badge_id)
      VALUES ('lvl-bs-1', 'sim-bs', 1, 'The Liquidity Check', 'Can the company pay its bills?', 'Current Ratio', 'Current Assets ÷ Current Liabilities', 'The current ratio measures a company''s ability to pay short-term obligations. A ratio above 1.0 means the company has more current assets than current liabilities.', 'Tesla', '{"current_assets": {"cash": 16.4, "receivables": 3.0, "inventory": 14.7, "other": 1.8, "total": 35.9}, "current_liabilities": {"payables": 14.4, "accrued": 5.3, "deferred": 1.8, "total": 21.5}, "ratio": 1.67}', 'Tesla has $1.67 for every $1 it owes in the short term. That''s healthy!', 'unlocked', 150, 'survivor')
    `).run();
    await db.prepare(`
      INSERT OR IGNORE INTO levels (id, simulator_id, level_number, title, subtitle, concept, formula, explanation, company_name, company_data, insight, status, xp_reward, badge_id)
      VALUES ('lvl-bs-2', 'sim-bs', 2, 'The Debt Detective', 'How leveraged is the company?', 'Debt-to-Equity Ratio', 'Total Debt ÷ Total Equity', 'The debt-to-equity ratio shows how much debt a company uses to finance its assets relative to shareholder equity. Higher ratios mean more risk.', 'Zomato', '{"total_debt": 2.1, "total_equity": 8.4, "ratio": 0.25}', 'Zomato has low leverage at 0.25 - they''re mostly funded by equity, not debt.', 'locked', 200, 'debt-detective')
    `).run();
    await db.prepare(`
      INSERT OR IGNORE INTO levels (id, simulator_id, level_number, title, subtitle, concept, formula, explanation, company_name, company_data, insight, status, xp_reward, badge_id)
      VALUES ('lvl-bs-3', 'sim-bs', 3, 'Cash is King', 'Does the company have enough cash?', 'Cash Ratio', 'Cash & Equivalents ÷ Current Liabilities', 'The cash ratio is the most conservative liquidity measure. It shows if a company can pay off current liabilities with just cash on hand.', 'Apple', '{"cash": 29.9, "current_liabilities": 145.3, "ratio": 0.21}', 'Apple''s cash ratio is 0.21 - they rely on receivables and inventory too, not just cash.', 'locked', 250, 'cash-king')
    `).run();
    await db.prepare(`
      INSERT OR IGNORE INTO levels (id, simulator_id, level_number, title, subtitle, concept, formula, explanation, company_name, company_data, insight, status, xp_reward, badge_id)
      VALUES ('lvl-bs-4', 'sim-bs', 4, 'Asset Inspector', 'What do they actually own?', 'Asset Composition', 'Fixed Assets vs Current Assets', 'Understanding how a company''s assets are distributed between current (liquid) and non-current (fixed) assets tells you about their operational model.', 'Amazon', '{"current_assets": 146.8, "fixed_assets": 276.5, "total_assets": 527.9, "current_ratio": 0.94}', 'Amazon is asset-heavy with warehouses and infrastructure. Low liquidity but huge operational capacity.', 'locked', 250, 'asset-inspector')
    `).run();
    await db.prepare(`
      INSERT OR IGNORE INTO levels (id, simulator_id, level_number, title, subtitle, concept, formula, explanation, company_name, company_data, insight, status, xp_reward, badge_id)
      VALUES ('lvl-bs-5', 'sim-bs', 5, 'Profit Reality Check', 'Does profit equal cash?', 'Working Capital', 'Current Assets - Current Liabilities', 'Profitable companies can still run out of cash. Working capital shows if there''s enough liquidity to operate day-to-day.', 'Netflix', '{"revenue": 33.7, "net_income": 5.4, "working_capital": -2.1, "cash": 6.1}', 'Netflix is profitable but has negative working capital. They rely on subscription cash flow.', 'locked', 300, 'profit-checker')
    `).run();
    await db.prepare(`
      INSERT OR IGNORE INTO levels (id, simulator_id, level_number, title, subtitle, concept, formula, explanation, company_name, company_data, insight, status, xp_reward, badge_id)
      VALUES ('lvl-bs-6', 'sim-bs', 6, 'Efficiency Expert', 'How fast does money move?', 'Asset Turnover', 'Revenue ÷ Total Assets', 'Asset turnover measures how efficiently a company uses its assets to generate revenue. Higher is usually better.', 'Walmart', '{"revenue": 648.1, "total_assets": 252.5, "asset_turnover": 2.57}', 'Walmart turns over its assets 2.57x per year - extremely efficient retail operations.', 'locked', 300, 'efficiency-expert')
    `).run();
    await db.prepare(`
      INSERT OR IGNORE INTO levels (id, simulator_id, level_number, title, subtitle, concept, formula, explanation, company_name, company_data, insight, status, xp_reward, badge_id)
      VALUES ('lvl-bs-7', 'sim-bs', 7, 'Growth Analyzer', 'Is this growth healthy?', 'Equity Growth Rate', 'Year-over-Year Equity Change', 'Sustainable growth comes from retained earnings, not just new investment. Healthy companies grow equity through profits.', 'Microsoft', '{"equity_2023": 206.2, "equity_2024": 268.5, "growth_rate": 0.30}', 'Microsoft grew equity 30% YoY - impressive sustainable growth from profits.', 'locked', 350, 'growth-analyzer')
    `).run();
    await db.prepare(`
      INSERT OR IGNORE INTO levels (id, simulator_id, level_number, title, subtitle, concept, formula, explanation, company_name, company_data, insight, status, xp_reward, badge_id)
      VALUES ('lvl-bs-8', 'sim-bs', 8, 'Return Master', 'Is this investment worth it?', 'Return on Equity (ROE)', 'Net Income ÷ Shareholders Equity', 'ROE measures how effectively a company uses shareholder investment to generate profits. Higher ROE = better returns.', 'Google', '{"net_income": 73.8, "shareholders_equity": 283.4, "roe": 0.26}', 'Google delivers 26% ROE - excellent returns for shareholders.', 'locked', 350, 'return-master')
    `).run();
    await db.prepare(`
      INSERT OR IGNORE INTO levels (id, simulator_id, level_number, title, subtitle, concept, formula, explanation, company_name, company_data, insight, status, xp_reward, badge_id)
      VALUES ('lvl-bs-9', 'sim-bs', 9, 'Red Flag Spotter', 'What''s hidden in the numbers?', 'Financial Red Flags', 'Unusual Patterns Analysis', 'Learn to spot warning signs: declining equity, increasing debt, shrinking margins, or irregular asset changes.', 'WeWork', '{"debt_2021": 9.5, "debt_2022": 17.8, "equity_2021": 2.1, "equity_2022": -1.8, "red_flags": ["negative_equity", "debt_spike"]}', 'WeWork showed classic red flags: exploding debt and negative equity before collapse.', 'locked', 400, 'red-flag-spotter')
    `).run();
    await db.prepare(`
      INSERT OR IGNORE INTO levels (id, simulator_id, level_number, title, subtitle, concept, formula, explanation, company_name, company_data, insight, status, xp_reward, badge_id)
      VALUES ('lvl-bs-10', 'sim-bs', 10, 'Full Analysis', 'Put it all together', 'Comprehensive Analysis', 'All Ratios Combined', 'Now you''ll analyze a complete balance sheet using every metric you''ve learned. This is the final boss!', 'Mystery Corp', '{"to_be_revealed": true}', 'Can you identify whether Mystery Corp is a buy, hold, or avoid?', 'locked', 500, 'balance-sheet-master')
    `).run();
    
    // Seed questions for Level 1
    await db.prepare(`
      INSERT OR IGNORE INTO questions (id, level_id, question_number, type, prompt, context, options, correct_answer, explanation, hint, xp_value)
      VALUES ('q-bs1-1', 'lvl-bs-1', 1, 'visual-comparison', 'Which company is better positioned to pay its short-term bills?', NULL, '[{"label": "Company A", "value": "A", "data": {"currentAssets": 500000, "currentLiabilities": 300000, "ratio": 1.67}}, {"label": "Company B", "value": "B", "data": {"currentAssets": 300000, "currentLiabilities": 450000, "ratio": 0.67}}]', 'A', 'Company A has $1.67 for every $1 of short-term debt, while Company B only has $0.67. Company A can comfortably pay its bills.', 'Higher current ratio = better short-term liquidity', 30)
    `).run();
    await db.prepare(`
      INSERT OR IGNORE INTO questions (id, level_id, question_number, type, prompt, context, options, correct_answer, explanation, hint, xp_value)
      VALUES ('q-bs1-2', 'lvl-bs-1', 2, 'yes-no', 'A company has a Current Ratio of 0.8. Can it comfortably pay its short-term debts?', 'Current Ratio = 0.8 means for every $1 owed, they have $0.80', '[{"label": "Yes", "value": "yes"}, {"label": "No", "value": "no"}]', 'no', 'With a ratio below 1.0, the company doesn''t have enough current assets to cover its current liabilities. This is a liquidity risk.', 'Think about what happens when ratio is below 1.0', 30)
    `).run();
    await db.prepare(`
      INSERT OR IGNORE INTO questions (id, level_id, question_number, type, prompt, context, options, correct_answer, explanation, hint, xp_value)
      VALUES ('q-bs1-3', 'lvl-bs-1', 3, 'multiple-choice', 'A company''s Current Ratio improved from 0.9 to 1.3 over the year. What does this indicate?', NULL, '[{"label": "Worsening liquidity", "value": "A"}, {"label": "Improving liquidity", "value": "B"}, {"label": "No change in financial health", "value": "C"}]', 'B', 'Moving from 0.9 (below 1.0, risky) to 1.3 (above 1.0, healthy) shows the company improved its ability to pay short-term obligations.', 'Compare both numbers to the 1.0 threshold', 30)
    `).run();
    await db.prepare(`
      INSERT OR IGNORE INTO questions (id, level_id, question_number, type, prompt, context, options, correct_answer, explanation, hint, xp_value)
      VALUES ('q-bs1-4', 'lvl-bs-1', 4, 'visual-comparison', 'Which company has better liquidity?', NULL, '[{"label": "TechCorp", "value": "A", "data": {"currentAssets": 840000, "currentLiabilities": 400000, "ratio": 2.1}}, {"label": "RetailMax", "value": "B", "data": {"currentAssets": 380000, "currentLiabilities": 400000, "ratio": 0.95}}]', 'A', 'TechCorp at 2.1 has more than double the assets needed to cover short-term debts. RetailMax at 0.95 is cutting it close.', 'Higher is generally better for current ratio', 30)
    `).run();
    await db.prepare(`
      INSERT OR IGNORE INTO questions (id, level_id, question_number, type, prompt, context, options, correct_answer, explanation, hint, xp_value)
      VALUES ('q-bs1-5', 'lvl-bs-1', 5, 'yes-no', 'Tesla''s Current Ratio is 1.67. Is this considered healthy?', 'Healthy current ratio is typically above 1.0, ideally between 1.5-2.0', '[{"label": "Yes", "value": "yes"}, {"label": "No", "value": "no"}]', 'yes', 'Tesla''s 1.67 ratio is in the healthy range. They have sufficient current assets to cover their short-term obligations.', 'Compare 1.67 to the healthy threshold of 1.0-1.5', 30)
    `).run();
    
    // Seed company_data
    await db.prepare(`
      INSERT OR IGNORE INTO company_data (id, company_name, ticker, year, data_type, raw_data, source)
      VALUES ('cd-tesla-2024', 'Tesla', 'TSLA', 2024, 'balance-sheet', '{"current_assets": {"cash_and_equivalents": 16.4, "accounts_receivable": 3.0, "inventory": 14.7, "other_current": 1.8, "total": 35.9}, "non_current_assets": {"property_plant_equipment": 31.2, "intangibles": 0.4, "other": 8.9, "total": 40.5}, "total_assets": 76.4, "current_liabilities": {"accounts_payable": 14.4, "accrued_expenses": 5.3, "deferred_revenue": 1.8, "total": 21.5}, "non_current_liabilities": {"long_term_debt": 5.7, "other": 4.2, "total": 9.9}, "total_liabilities": 31.4, "shareholders_equity": {"common_stock": 0.1, "retained_earnings": 27.9, "other": 17.0, "total": 45.0}}', 'SEC 10-K 2024')
    `).run();
    await db.prepare(`
      INSERT OR IGNORE INTO company_data (id, company_name, ticker, year, data_type, raw_data, source)
      VALUES ('cd-zomato-2024', 'Zomato', 'ZOMATO.NS', 2024, 'balance-sheet', '{"current_assets": {"cash": 12.8, "receivables": 1.2, "inventory": 0.3, "total": 14.3}, "total_assets": 18.7, "current_liabilities": {"payables": 3.8, "other": 2.1, "total": 5.9}, "total_debt": 2.1, "shareholders_equity": 8.4}', 'Annual Report 2024')
    `).run();
    
    return c.json({ success: true, message: 'Database initialized with seed data' });
  } catch (error) {
    console.error('Error initializing database:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ====================
// USER ROUTES
// ====================

// GET /api/user - Get or create user by Clerk ID
app.get('/user', async (c) => {
  try {
    const db = drizzle(c.env.DB);
    const clerkId = c.req.query('clerkId');
    const email = c.req.query('email');
    const name = c.req.query('name');
    const avatarUrl = c.req.query('avatarUrl');
    const today = new Date().toISOString().split('T')[0];
    
    if (!clerkId) {
      return c.json({ success: false, error: 'clerkId is required' }, 400);
    }
    
    // Try to get existing user
    const existingUser = await db.select().from(users).where(eq(users.clerkId, clerkId)).get();
    
    if (!existingUser) {
      // Create new user
      const newUserId = crypto.randomUUID();
      
      await db.insert(users).values({
        id: newUserId,
        clerkId,
        email: email || null,
        name: name || 'Learner',
        avatarUrl: avatarUrl || null,
        totalXp: 0,
        streakDays: 1,
        lastActiveDate: today,
      });
      
      // Also create initial progress record
      await db.insert(progress).values({
        id: crypto.randomUUID(),
        clerkId,
        simulator: 'balance-sheet',
        currentLevel: 1,
        completedLevels: '[]',
        badges: '[]',
        bestScore: 0,
        totalSessions: 0,
      });
      
      return c.json({
        success: true,
        user: {
          id: newUserId,
          clerkId,
          email,
          name: name || 'Learner',
          avatarUrl,
          totalXp: 0,
          streakDays: 1,
          lastActiveDate: today,
        },
        isNew: true,
      });
    }
    
    // Update streak if needed
    const lastActive = existingUser.lastActiveDate;
    
    if (lastActive !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      const newStreak = lastActive === yesterdayStr ? (existingUser.streakDays || 0) + 1 : 1;
      
      await db.update(users)
        .set({ 
          lastActiveDate: today, 
          streakDays: newStreak,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(users.clerkId, clerkId));
      
      return c.json({
        success: true,
        user: {
          ...existingUser,
          streakDays: newStreak,
          lastActiveDate: today,
        },
        isNew: false,
      });
    }
    
    return c.json({
      success: true,
      user: existingUser,
      isNew: false,
    });
  } catch (error) {
    console.error('Error in GET /user:', error);
    return c.json({ success: false, error: 'Failed to get/create user' }, 500);
  }
});

// ====================
// PROGRESS ROUTES
// ====================

// GET /api/progress - Get user's progress for a simulator
app.get('/progress', async (c) => {
  try {
    const db = drizzle(c.env.DB);
    const clerkId = c.req.query('clerkId');
    const simulator = c.req.query('simulator') || 'balance-sheet';
    
    if (!clerkId) {
      return c.json({ success: false, error: 'clerkId is required' }, 400);
    }
    
    const progressRecord = await db.select()
      .from(progress)
      .where(and(
        eq(progress.clerkId, clerkId),
        eq(progress.simulator, simulator)
      ))
      .get();
    
    if (!progressRecord) {
      // Create default progress
      await db.insert(progress).values({
        id: crypto.randomUUID(),
        clerkId,
        simulator,
        currentLevel: 1,
        completedLevels: '[]',
        badges: '[]',
        bestScore: 0,
        totalSessions: 0,
      });
      
      return c.json({
        success: true,
        progress: {
          currentLevel: 1,
          completedLevels: [],
          badges: [],
          bestScore: 0,
          totalSessions: 0,
        },
      });
    }
    
    return c.json({
      success: true,
      progress: {
        currentLevel: progressRecord.currentLevel || 1,
        completedLevels: JSON.parse(progressRecord.completedLevels || '[]'),
        badges: JSON.parse(progressRecord.badges || '[]'),
        bestScore: progressRecord.bestScore || 0,
        totalSessions: progressRecord.totalSessions || 0,
      },
    });
  } catch (error) {
    console.error('Error in GET /progress:', error);
    return c.json({ success: false, error: 'Failed to get progress' }, 500);
  }
});

// POST /api/progress - Update user's progress after completing a level
app.post('/progress', async (c) => {
  try {
    const db = drizzle(c.env.DB);
    const body = await c.req.json() as {
      clerkId: string;
      simulator?: string;
      level: number;
      score: number;
      passed: boolean;
      badge?: string;
    };
    
    const { clerkId, simulator = 'balance-sheet', level, score, passed, badge } = body;
    
    if (!clerkId || level === undefined) {
      return c.json({ success: false, error: 'clerkId and level are required' }, 400);
    }
    
    // Get current progress
    let progressRecord = await db.select()
      .from(progress)
      .where(and(
        eq(progress.clerkId, clerkId),
        eq(progress.simulator, simulator)
      ))
      .get();
    
    if (!progressRecord) {
      // Create progress record if it doesn't exist
      const newId = crypto.randomUUID();
      await db.insert(progress).values({
        id: newId,
        clerkId,
        simulator,
        currentLevel: 1,
        completedLevels: '[]',
        badges: '[]',
        bestScore: 0,
        totalSessions: 0,
      });
      progressRecord = {
        id: newId,
        clerkId,
        simulator,
        currentLevel: 1,
        completedLevels: '[]',
        badges: '[]',
        bestScore: 0,
        totalSessions: 0,
        updatedAt: null,
      };
    }
    
    const completedLevels: number[] = JSON.parse(progressRecord.completedLevels || '[]');
    const badgesList: string[] = JSON.parse(progressRecord.badges || '[]');
    
    if (passed && !completedLevels.includes(level)) {
      completedLevels.push(level);
    }
    
    if (badge && !badgesList.includes(badge)) {
      badgesList.push(badge);
    }
    
    // Calculate new current level
    const newCurrentLevel = passed 
      ? Math.max(progressRecord.currentLevel || 1, level + 1) 
      : (progressRecord.currentLevel || 1);
    
    // Update best score if this score is higher
    const newBestScore = Math.max(progressRecord.bestScore || 0, score || 0);
    
    await db.update(progress)
      .set({
        currentLevel: Math.min(newCurrentLevel, 10),
        completedLevels: JSON.stringify(completedLevels),
        badges: JSON.stringify(badgesList),
        bestScore: newBestScore,
        totalSessions: (progressRecord.totalSessions || 0) + 1,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(progress.id, progressRecord.id));
    
    return c.json({
      success: true,
      progress: {
        currentLevel: Math.min(newCurrentLevel, 10),
        completedLevels,
        badges: badgesList,
        bestScore: newBestScore,
        totalSessions: (progressRecord.totalSessions || 0) + 1,
      },
    });
  } catch (error) {
    console.error('Error in POST /progress:', error);
    return c.json({ success: false, error: 'Failed to update progress' }, 500);
  }
});

// ====================
// SESSIONS ROUTES
// ====================

// POST /api/sessions - Save a quiz session result
app.post('/sessions', async (c) => {
  try {
    const db = drizzle(c.env.DB);
    const body = await c.req.json() as {
      clerkId: string;
      simulator?: string;
      level: number;
      score: number;
      totalQuestions?: number;
      timeSeconds?: number;
      answers?: Record<string, any>;
    };
    
    const { clerkId, simulator = 'balance-sheet', level, score, totalQuestions = 5, timeSeconds, answers } = body;
    
    if (!clerkId || level === undefined || score === undefined) {
      return c.json({ success: false, error: 'clerkId, level, and score are required' }, 400);
    }
    
    // Calculate XP (30 per correct answer)
    const xpEarned = score * 30;
    
    // Create session record
    const sessionId = crypto.randomUUID();
    await db.insert(sessions).values({
      id: sessionId,
      clerkId,
      simulator,
      level,
      score,
      totalQuestions,
      timeSeconds: timeSeconds ?? null,
      answers: answers ? JSON.stringify(answers) : null,
    });
    
    // Update user's total XP
    const user = await db.select().from(users).where(eq(users.clerkId, clerkId)).get();
    
    if (user) {
      await db.update(users)
        .set({ 
          totalXp: (user.totalXp || 0) + xpEarned,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(users.clerkId, clerkId));
    }
    
    return c.json({
      success: true,
      session: {
        id: sessionId,
        level,
        score,
        totalQuestions,
        xpEarned,
        timeSeconds,
      },
    });
  } catch (error) {
    console.error('Error in POST /sessions:', error);
    return c.json({ success: false, error: 'Failed to save session' }, 500);
  }
});

// GET /api/sessions - Get user's session history
app.get('/sessions', async (c) => {
  try {
    const db = drizzle(c.env.DB);
    const clerkId = c.req.query('clerkId');
    
    if (!clerkId) {
      return c.json({ success: false, error: 'clerkId is required' }, 400);
    }
    
    const userSessions = await db.select()
      .from(sessions)
      .where(eq(sessions.clerkId, clerkId))
      .orderBy(desc(sessions.completedAt));
    
    return c.json({ success: true, sessions: userSessions });
  } catch (error) {
    console.error('Error in GET /sessions:', error);
    return c.json({ success: false, error: 'Failed to get sessions' }, 500);
  }
});

// ====================
// BADGES ROUTES
// ====================

// POST /api/badges - Award a badge to user
app.post('/badges', async (c) => {
  try {
    const db = drizzle(c.env.DB);
    const body = await c.req.json() as {
      clerkId: string;
      badgeId: string;
      badgeName: string;
      simulator?: string;
    };
    
    const { clerkId, badgeId, badgeName, simulator = 'balance-sheet' } = body;
    
    if (!clerkId || !badgeId || !badgeName) {
      return c.json({ success: false, error: 'clerkId, badgeId, and badgeName are required' }, 400);
    }
    
    // Check if badge already exists
    const existingBadge = await db.select()
      .from(badges)
      .where(and(
        eq(badges.clerkId, clerkId),
        eq(badges.badgeId, badgeId)
      ))
      .get();
    
    if (existingBadge) {
      return c.json({ success: true, badge: existingBadge, alreadyEarned: true });
    }
    
    // Award new badge
    const newBadgeId = crypto.randomUUID();
    await db.insert(badges).values({
      id: newBadgeId,
      clerkId,
      badgeId,
      badgeName,
      simulator,
    });
    
    return c.json({
      success: true,
      badge: {
        id: newBadgeId,
        clerkId,
        badgeId,
        badgeName,
        simulator,
        earnedAt: new Date().toISOString(),
      },
      alreadyEarned: false,
    });
  } catch (error) {
    console.error('Error in POST /badges:', error);
    return c.json({ success: false, error: 'Failed to award badge' }, 500);
  }
});

// GET /api/badges - Get user's badges
app.get('/badges', async (c) => {
  try {
    const db = drizzle(c.env.DB);
    const clerkId = c.req.query('clerkId');
    
    if (!clerkId) {
      return c.json({ success: false, error: 'clerkId is required' }, 400);
    }
    
    const userBadges = await db.select()
      .from(badges)
      .where(eq(badges.clerkId, clerkId))
      .orderBy(desc(badges.earnedAt));
    
    return c.json({ success: true, badges: userBadges });
  } catch (error) {
    console.error('Error in GET /badges:', error);
    return c.json({ success: false, error: 'Failed to get badges' }, 500);
  }
});

// ====================
// STATS ROUTE
// ====================

// GET /api/stats - Get combined stats for dashboard
app.get('/stats', async (c) => {
  try {
    const db = drizzle(c.env.DB);
    const clerkId = c.req.query('clerkId');
    
    if (!clerkId) {
      return c.json({ success: false, error: 'clerkId is required' }, 400);
    }
    
    // Get user data
    const user = await db.select().from(users).where(eq(users.clerkId, clerkId)).get();
    
    // Get progress data
    const progressRecord = await db.select()
      .from(progress)
      .where(eq(progress.clerkId, clerkId))
      .get();
    
    // Get session count
    const userSessions = await db.select()
      .from(sessions)
      .where(eq(sessions.clerkId, clerkId));
    
    // Get badges
    const userBadges = await db.select()
      .from(badges)
      .where(eq(badges.clerkId, clerkId));
    
    return c.json({
      success: true,
      stats: {
        totalXp: user?.totalXp || 0,
        streakDays: user?.streakDays || 0,
        currentLevel: progressRecord?.currentLevel || 1,
        completedLevels: progressRecord ? JSON.parse(progressRecord.completedLevels || '[]') : [],
        badges: userBadges.map(b => b.badgeId),
        sessionsCount: userSessions.length,
      },
    });
  } catch (error) {
    console.error('Error in GET /stats:', error);
    return c.json({ success: false, error: 'Failed to get stats' }, 500);
  }
});

// ====================
// CONTENT ROUTES - Simulators, Levels, Questions
// ====================

// GET /api/simulators - Get all simulators
app.get('/simulators', async (c) => {
  try {
    const db = c.env.DB;
    const result = await db.prepare(`
      SELECT * FROM simulators ORDER BY order_index ASC
    `).all();
    
    return c.json({ success: true, simulators: result.results });
  } catch (error) {
    console.error('Error in GET /simulators:', error);
    return c.json({ success: false, error: 'Failed to get simulators' }, 500);
  }
});

// GET /api/simulators/:slug - Get a specific simulator by slug
app.get('/simulators/:slug', async (c) => {
  try {
    const db = c.env.DB;
    const slug = c.req.param('slug');
    
    const simulator = await db.prepare(`
      SELECT * FROM simulators WHERE slug = ?
    `).bind(slug).first();
    
    if (!simulator) {
      return c.json({ success: false, error: 'Simulator not found' }, 404);
    }
    
    return c.json({ success: true, simulator });
  } catch (error) {
    console.error('Error in GET /simulators/:slug:', error);
    return c.json({ success: false, error: 'Failed to get simulator' }, 500);
  }
});

// GET /api/levels/:simulatorSlug - Get all levels for a simulator
app.get('/levels/:simulatorSlug', async (c) => {
  try {
    const db = c.env.DB;
    const simulatorSlug = c.req.param('simulatorSlug');
    
    // First get the simulator ID
    const simulator = await db.prepare(`
      SELECT id FROM simulators WHERE slug = ?
    `).bind(simulatorSlug).first() as { id: string } | null;
    
    if (!simulator) {
      return c.json({ success: false, error: 'Simulator not found' }, 404);
    }
    
    const result = await db.prepare(`
      SELECT * FROM levels WHERE simulator_id = ? ORDER BY level_number ASC
    `).bind(simulator.id).all();
    
    // Parse company_data JSON for each level
    const levels = result.results.map((level: any) => ({
      ...level,
      company_data: level.company_data ? JSON.parse(level.company_data) : null
    }));
    
    return c.json({ success: true, levels });
  } catch (error) {
    console.error('Error in GET /levels/:simulatorSlug:', error);
    return c.json({ success: false, error: 'Failed to get levels' }, 500);
  }
});

// GET /api/levels/:simulatorSlug/:levelNumber - Get a specific level
app.get('/levels/:simulatorSlug/:levelNumber', async (c) => {
  try {
    const db = c.env.DB;
    const simulatorSlug = c.req.param('simulatorSlug');
    const levelNumber = parseInt(c.req.param('levelNumber'), 10);
    
    // First get the simulator ID
    const simulator = await db.prepare(`
      SELECT id FROM simulators WHERE slug = ?
    `).bind(simulatorSlug).first() as { id: string } | null;
    
    if (!simulator) {
      return c.json({ success: false, error: 'Simulator not found' }, 404);
    }
    
    const level = await db.prepare(`
      SELECT * FROM levels WHERE simulator_id = ? AND level_number = ?
    `).bind(simulator.id, levelNumber).first() as any;
    
    if (!level) {
      return c.json({ success: false, error: 'Level not found' }, 404);
    }
    
    // Parse company_data JSON
    const parsedLevel = {
      ...level,
      company_data: level.company_data ? JSON.parse(level.company_data) : null
    };
    
    return c.json({ success: true, level: parsedLevel });
  } catch (error) {
    console.error('Error in GET /levels/:simulatorSlug/:levelNumber:', error);
    return c.json({ success: false, error: 'Failed to get level' }, 500);
  }
});

// GET /api/questions/:levelId - Get all questions for a level
app.get('/questions/:levelId', async (c) => {
  try {
    const db = c.env.DB;
    const levelId = c.req.param('levelId');
    
    const result = await db.prepare(`
      SELECT * FROM questions WHERE level_id = ? ORDER BY question_number ASC
    `).bind(levelId).all();
    
    // Parse options JSON for each question
    const questions = result.results.map((q: any) => ({
      ...q,
      options: q.options ? JSON.parse(q.options) : []
    }));
    
    return c.json({ success: true, questions });
  } catch (error) {
    console.error('Error in GET /questions/:levelId:', error);
    return c.json({ success: false, error: 'Failed to get questions' }, 500);
  }
});

// GET /api/questions/by-level/:simulatorSlug/:levelNumber - Get questions by simulator and level number
app.get('/questions/by-level/:simulatorSlug/:levelNumber', async (c) => {
  try {
    const db = c.env.DB;
    const simulatorSlug = c.req.param('simulatorSlug');
    const levelNumber = parseInt(c.req.param('levelNumber'), 10);
    
    // First get the simulator ID
    const simulator = await db.prepare(`
      SELECT id FROM simulators WHERE slug = ?
    `).bind(simulatorSlug).first() as { id: string } | null;
    
    if (!simulator) {
      return c.json({ success: false, error: 'Simulator not found' }, 404);
    }
    
    // Get the level ID
    const level = await db.prepare(`
      SELECT id FROM levels WHERE simulator_id = ? AND level_number = ?
    `).bind(simulator.id, levelNumber).first() as { id: string } | null;
    
    if (!level) {
      return c.json({ success: false, error: 'Level not found' }, 404);
    }
    
    const result = await db.prepare(`
      SELECT * FROM questions WHERE level_id = ? ORDER BY question_number ASC
    `).bind(level.id).all();
    
    // Parse options JSON for each question
    const questions = result.results.map((q: any) => ({
      ...q,
      options: q.options ? JSON.parse(q.options) : []
    }));
    
    return c.json({ success: true, questions });
  } catch (error) {
    console.error('Error in GET /questions/by-level:', error);
    return c.json({ success: false, error: 'Failed to get questions' }, 500);
  }
});

// GET /api/company-data - Get all preloaded company data
app.get('/company-data', async (c) => {
  try {
    const db = c.env.DB;
    const result = await db.prepare(`
      SELECT * FROM company_data WHERE is_preloaded = 1 ORDER BY company_name ASC
    `).all();
    
    // Parse raw_data JSON for each company
    const companies = result.results.map((company: any) => ({
      ...company,
      raw_data: company.raw_data ? JSON.parse(company.raw_data) : null
    }));
    
    return c.json({ success: true, companies });
  } catch (error) {
    console.error('Error in GET /company-data:', error);
    return c.json({ success: false, error: 'Failed to get company data' }, 500);
  }
});

// ====================
// SEED CONTENT - Populate initial course content
// ====================
app.get('/seed-content', async (c) => {
  try {
    const db = c.env.DB;
    
    // Seed simulators
    await db.prepare(`
      INSERT OR REPLACE INTO simulators (id, name, slug, description, icon, status, total_levels, order_index) VALUES
      ('sim-bs', 'Balance Sheet Mastery', 'balance-sheet', 'Master financial statement analysis with real company data', '📊', 'active', 10, 1),
      ('sim-cc', 'Cold Call Hero', 'cold-call', 'Practice sales conversations with AI-powered roleplay', '📞', 'coming-soon', 5, 2),
      ('sim-rca', 'RCA Detective', 'rca', 'Solve business problems using root cause analysis', '🔍', 'coming-soon', 5, 3)
    `).run();
    
    // Seed levels for Balance Sheet
    await db.prepare(`
      INSERT OR REPLACE INTO levels (id, simulator_id, level_number, title, subtitle, concept, formula, explanation, company_name, company_data, insight, status, xp_reward, badge_id) VALUES
      ('lvl-bs-1', 'sim-bs', 1, 'The Liquidity Check', 'Is this company alive?', 'Current Ratio', 'Current Assets ÷ Current Liabilities', 'The current ratio measures a company''s ability to pay short-term obligations. A ratio above 1.0 means the company has more current assets than current liabilities.', 'Tesla', '{"current_assets": {"cash": 16.4, "receivables": 3.0, "inventory": 14.7, "other": 1.8, "total": 35.9}, "current_liabilities": {"payables": 14.4, "accrued": 5.3, "deferred": 1.8, "total": 21.5}, "ratio": 1.67}', 'Tesla has $1.67 for every $1 it owes in the short term. That''s healthy!', 'unlocked', 150, 'survivor')
    `).run();
    
    await db.prepare(`
      INSERT OR REPLACE INTO levels (id, simulator_id, level_number, title, subtitle, concept, formula, explanation, company_name, company_data, insight, status, xp_reward, badge_id) VALUES
      ('lvl-bs-2', 'sim-bs', 2, 'The Debt Detective', 'Who owns this company?', 'Debt-to-Equity Ratio', 'Total Debt ÷ Total Equity', 'The debt-to-equity ratio shows how much debt a company uses to finance its assets relative to shareholder equity. Higher ratios mean more risk.', 'Zomato', '{"total_debt": 2.1, "total_equity": 8.4, "ratio": 0.25}', 'Zomato has low leverage at 0.25 - they''re mostly funded by equity, not debt.', 'locked', 200, 'debt-detective')
    `).run();
    
    await db.prepare(`
      INSERT OR REPLACE INTO levels (id, simulator_id, level_number, title, subtitle, concept, formula, explanation, company_name, company_data, insight, status, xp_reward, badge_id) VALUES
      ('lvl-bs-3', 'sim-bs', 3, 'Cash is King', 'Where''s the money?', 'Cash Ratio', 'Cash & Equivalents ÷ Current Liabilities', 'The cash ratio is the most conservative liquidity measure. It shows if a company can pay off current liabilities with just cash on hand.', 'Apple', '{"cash": 29.9, "current_liabilities": 145.3, "ratio": 0.21}', 'Apple''s cash ratio is 0.21 - they rely on receivables and inventory too, not just cash.', 'locked', 250, 'cash-king')
    `).run();
    
    // Add remaining levels (4-10) as locked placeholders
    const remainingLevels = [
      { num: 4, title: 'Asset Inspector', subtitle: 'What do they actually own?', badge: 'asset-inspector' },
      { num: 5, title: 'Profit Reality Check', subtitle: 'Does profit = cash?', badge: 'profit-checker' },
      { num: 6, title: 'Efficiency Expert', subtitle: 'How fast does money move?', badge: 'efficiency-expert' },
      { num: 7, title: 'Growth Analyzer', subtitle: 'Is this growth healthy?', badge: 'growth-analyzer' },
      { num: 8, title: 'Return Master', subtitle: 'Is this investment worth it?', badge: 'return-master' },
      { num: 9, title: 'Red Flag Spotter', subtitle: "What's hidden?", badge: 'red-flag-spotter' },
      { num: 10, title: 'Full Analysis', subtitle: 'Put it all together', badge: 'balance-master' },
    ];
    
    for (const lvl of remainingLevels) {
      await db.prepare(`
        INSERT OR REPLACE INTO levels (id, simulator_id, level_number, title, subtitle, status, xp_reward, badge_id) VALUES
        (?, 'sim-bs', ?, ?, ?, 'locked', ?, ?)
      `).bind(`lvl-bs-${lvl.num}`, lvl.num, lvl.title, lvl.subtitle, 100 + (lvl.num * 50), lvl.badge).run();
    }
    
    // Seed questions for Level 1
    await db.prepare(`
      INSERT OR REPLACE INTO questions (id, level_id, question_number, type, prompt, context, options, correct_answer, explanation, hint, xp_value) VALUES
      ('q-bs1-1', 'lvl-bs-1', 1, 'visual-comparison', 'Which company can pay its short-term bills?', NULL, '[{"label": "Company A", "value": "A", "data": {"currentAssets": 500000, "currentLiabilities": 300000, "ratio": 1.67}}, {"label": "Company B", "value": "B", "data": {"currentAssets": 300000, "currentLiabilities": 450000, "ratio": 0.67}}]', 'A', 'Company A has $1.67 for every $1 of short-term debt, while Company B only has $0.67. Company A can comfortably pay its bills.', 'Higher current ratio = better short-term liquidity', 30)
    `).run();
    
    await db.prepare(`
      INSERT OR REPLACE INTO questions (id, level_id, question_number, type, prompt, context, options, correct_answer, explanation, hint, xp_value) VALUES
      ('q-bs1-2', 'lvl-bs-1', 2, 'yes-no', 'A company has a Current Ratio of 0.8. Can it comfortably pay its short-term debts?', 'Current Ratio = 0.8 means for every $1 owed, they have $0.80', '[{"label": "Yes", "value": "yes"}, {"label": "No", "value": "no"}]', 'no', 'With a ratio below 1.0, the company doesn''t have enough current assets to cover its current liabilities. This is a liquidity risk.', 'Think about what happens when ratio is below 1.0', 30)
    `).run();
    
    await db.prepare(`
      INSERT OR REPLACE INTO questions (id, level_id, question_number, type, prompt, context, options, correct_answer, explanation, hint, xp_value) VALUES
      ('q-bs1-3', 'lvl-bs-1', 3, 'multiple-choice', 'A company''s Current Ratio improved from 0.9 to 1.3 over the year. What does this indicate?', NULL, '[{"label": "They''re now in the danger zone", "value": "A"}, {"label": "They moved from danger to acceptable range", "value": "B"}, {"label": "No significant change", "value": "C"}, {"label": "They have too much cash", "value": "D"}]', 'B', 'Moving from 0.9 (below 1.0, risky) to 1.3 (above 1.0, healthy) shows the company improved its ability to pay short-term obligations.', 'Compare both numbers to the 1.0 threshold', 30)
    `).run();
    
    await db.prepare(`
      INSERT OR REPLACE INTO questions (id, level_id, question_number, type, prompt, context, options, correct_answer, explanation, hint, xp_value) VALUES
      ('q-bs1-4', 'lvl-bs-1', 4, 'visual-comparison', 'Which company has better liquidity?', NULL, '[{"label": "TechCorp", "value": "A", "data": {"ratio": 2.1}}, {"label": "RetailMax", "value": "B", "data": {"ratio": 0.95}}]', 'A', 'TechCorp at 2.1 has more than double the assets needed to cover short-term debts. RetailMax at 0.95 is cutting it close.', 'Higher is generally better for current ratio', 30)
    `).run();
    
    await db.prepare(`
      INSERT OR REPLACE INTO questions (id, level_id, question_number, type, prompt, context, options, correct_answer, explanation, hint, xp_value) VALUES
      ('q-bs1-5', 'lvl-bs-1', 5, 'yes-no', 'Tesla''s Current Ratio is 1.67. Is this considered healthy?', 'Healthy current ratio is typically above 1.0, ideally between 1.5-2.0', '[{"label": "Yes", "value": "yes"}, {"label": "No", "value": "no"}]', 'yes', 'Tesla''s 1.67 ratio is in the healthy range. They have sufficient current assets to cover their short-term obligations.', 'Compare 1.67 to the healthy threshold of 1.0-1.5', 30)
    `).run();
    
    // Seed company data
    await db.prepare(`
      INSERT OR REPLACE INTO company_data (id, company_name, ticker, year, data_type, raw_data, source) VALUES
      ('cd-tesla-2024', 'Tesla', 'TSLA', 2024, 'balance-sheet', '{"current_assets": {"cash_and_equivalents": 16.4, "accounts_receivable": 3.0, "inventory": 14.7, "other_current": 1.8, "total": 35.9}, "non_current_assets": {"property_plant_equipment": 31.2, "intangibles": 0.4, "other": 8.9, "total": 40.5}, "total_assets": 76.4, "current_liabilities": {"accounts_payable": 14.4, "accrued_expenses": 5.3, "deferred_revenue": 1.8, "total": 21.5}, "non_current_liabilities": {"long_term_debt": 5.7, "other": 4.2, "total": 9.9}, "total_liabilities": 31.4, "shareholders_equity": {"common_stock": 0.1, "retained_earnings": 27.9, "other": 17.0, "total": 45.0}}', 'SEC 10-K 2024')
    `).run();
    
    await db.prepare(`
      INSERT OR REPLACE INTO company_data (id, company_name, ticker, year, data_type, raw_data, source) VALUES
      ('cd-zomato-2024', 'Zomato', 'ZOMATO.NS', 2024, 'balance-sheet', '{"current_assets": {"cash": 12.8, "receivables": 1.2, "inventory": 0.3, "total": 14.3}, "total_assets": 18.7, "current_liabilities": {"payables": 3.8, "other": 2.1, "total": 5.9}, "total_debt": 2.1, "shareholders_equity": 8.4}', 'Annual Report 2024')
    `).run();
    
    return c.json({ success: true, message: 'Content seeded successfully' });
  } catch (error) {
    console.error('Error seeding content:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

export default app;
