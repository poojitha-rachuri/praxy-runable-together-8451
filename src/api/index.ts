import { Hono } from 'hono';
import { cors } from "hono/cors";
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, desc } from 'drizzle-orm';
import { users, progress, sessions, badges } from './database/schema';

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
    
    // Create indexes (ignore errors if they exist)
    try { await db.prepare(`CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id)`).run(); } catch {}
    try { await db.prepare(`CREATE INDEX IF NOT EXISTS idx_progress_clerk_id ON progress(clerk_id)`).run(); } catch {}
    try { await db.prepare(`CREATE INDEX IF NOT EXISTS idx_sessions_clerk_id ON sessions(clerk_id)`).run(); } catch {}
    try { await db.prepare(`CREATE INDEX IF NOT EXISTS idx_badges_clerk_id ON badges(clerk_id)`).run(); } catch {}
    
    return c.json({ success: true, message: 'Database initialized successfully' });
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

export default app;
