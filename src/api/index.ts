import { Hono } from 'hono';
import { cors } from "hono/cors";
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, desc } from 'drizzle-orm';
import { users, progress, sessions } from './database/schema';

const app = new Hono<{ Bindings: Env }>()
  .basePath('api');

app.use(cors({
  origin: "*"
}));

app.get('/ping', (c) => c.json({ message: `Pong! ${Date.now()}` }));

// ====================
// USER ROUTES
// ====================

// GET /api/user - Get or create user by userId
app.get('/user', async (c) => {
  try {
    const db = drizzle(c.env.DB);
    const userId = c.req.query('userId');
    const today = new Date().toISOString().split('T')[0];
    
    if (!userId) {
      // Create new user
      const newUserId = crypto.randomUUID();
      
      await db.insert(users).values({
        id: newUserId,
        name: 'Learner',
        totalXp: 0,
        streakDays: 1,
        lastActiveDate: today,
      });
      
      // Also create initial progress record
      await db.insert(progress).values({
        id: crypto.randomUUID(),
        userId: newUserId,
        simulatorType: 'balance-sheet',
        currentLevel: 1,
        completedLevels: '[]',
        badges: '[]',
      });
      
      return c.json({
        success: true,
        user: {
          id: newUserId,
          name: 'Learner',
          totalXp: 0,
          streakDays: 1,
          lastActiveDate: today,
        },
        isNew: true,
      });
    }
    
    // Get existing user
    const user = await db.select().from(users).where(eq(users.id, userId)).get();
    
    if (!user) {
      // User doesn't exist, create new one with the given ID
      await db.insert(users).values({
        id: userId,
        name: 'Learner',
        totalXp: 0,
        streakDays: 1,
        lastActiveDate: today,
      });
      
      await db.insert(progress).values({
        id: crypto.randomUUID(),
        userId: userId,
        simulatorType: 'balance-sheet',
        currentLevel: 1,
        completedLevels: '[]',
        badges: '[]',
      });
      
      return c.json({
        success: true,
        user: {
          id: userId,
          name: 'Learner',
          totalXp: 0,
          streakDays: 1,
          lastActiveDate: today,
        },
        isNew: true,
      });
    }
    
    // Update streak if needed
    const lastActive = user.lastActiveDate;
    
    if (lastActive !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      const newStreak = lastActive === yesterdayStr ? (user.streakDays || 0) + 1 : 1;
      
      await db.update(users)
        .set({ lastActiveDate: today, streakDays: newStreak })
        .where(eq(users.id, userId));
      
      return c.json({
        success: true,
        user: {
          id: user.id,
          name: user.name || 'Learner',
          totalXp: user.totalXp || 0,
          streakDays: newStreak,
          lastActiveDate: today,
        },
        isNew: false,
      });
    }
    
    return c.json({
      success: true,
      user: {
        id: user.id,
        name: user.name || 'Learner',
        totalXp: user.totalXp || 0,
        streakDays: user.streakDays || 0,
        lastActiveDate: user.lastActiveDate,
      },
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
    const userId = c.req.query('userId');
    
    if (!userId) {
      return c.json({ success: false, error: 'userId is required' }, 400);
    }
    
    const progressRecord = await db.select()
      .from(progress)
      .where(and(
        eq(progress.userId, userId),
        eq(progress.simulatorType, 'balance-sheet')
      ))
      .get();
    
    if (!progressRecord) {
      // Create default progress
      await db.insert(progress).values({
        id: crypto.randomUUID(),
        userId: userId,
        simulatorType: 'balance-sheet',
        currentLevel: 1,
        completedLevels: '[]',
        badges: '[]',
      });
      
      return c.json({
        success: true,
        progress: {
          currentLevel: 1,
          completedLevels: [],
          badges: [],
        },
      });
    }
    
    return c.json({
      success: true,
      progress: {
        currentLevel: progressRecord.currentLevel || 1,
        completedLevels: JSON.parse(progressRecord.completedLevels || '[]'),
        badges: JSON.parse(progressRecord.badges || '[]'),
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
      userId: string;
      level: number;
      passed: boolean;
      badge?: string;
    };
    
    const { userId, level, passed, badge } = body;
    
    if (!userId || level === undefined) {
      return c.json({ success: false, error: 'userId and level are required' }, 400);
    }
    
    // Get current progress
    let progressRecord = await db.select()
      .from(progress)
      .where(and(
        eq(progress.userId, userId),
        eq(progress.simulatorType, 'balance-sheet')
      ))
      .get();
    
    if (!progressRecord) {
      // Create progress record if it doesn't exist
      const newId = crypto.randomUUID();
      await db.insert(progress).values({
        id: newId,
        userId: userId,
        simulatorType: 'balance-sheet',
        currentLevel: 1,
        completedLevels: '[]',
        badges: '[]',
      });
      progressRecord = {
        id: newId,
        userId: userId,
        simulatorType: 'balance-sheet',
        currentLevel: 1,
        completedLevels: '[]',
        badges: '[]',
        updatedAt: null,
      };
    }
    
    const completedLevels: number[] = JSON.parse(progressRecord.completedLevels || '[]');
    const badges: string[] = JSON.parse(progressRecord.badges || '[]');
    
    if (passed && !completedLevels.includes(level)) {
      completedLevels.push(level);
    }
    
    if (badge && !badges.includes(badge)) {
      badges.push(badge);
    }
    
    // Calculate new current level
    const newCurrentLevel = passed 
      ? Math.max(progressRecord.currentLevel || 1, level + 1) 
      : (progressRecord.currentLevel || 1);
    
    await db.update(progress)
      .set({
        currentLevel: Math.min(newCurrentLevel, 10),
        completedLevels: JSON.stringify(completedLevels),
        badges: JSON.stringify(badges),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(progress.id, progressRecord.id));
    
    return c.json({
      success: true,
      progress: {
        currentLevel: Math.min(newCurrentLevel, 10),
        completedLevels,
        badges,
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
      userId: string;
      level: number;
      score: number;
      totalQuestions?: number;
      xpEarned: number;
      timeSeconds?: number;
    };
    
    const { userId, level, score, totalQuestions = 5, xpEarned, timeSeconds } = body;
    
    if (!userId || level === undefined || score === undefined || xpEarned === undefined) {
      return c.json({ success: false, error: 'userId, level, score, and xpEarned are required' }, 400);
    }
    
    // Create session record
    const sessionId = crypto.randomUUID();
    await db.insert(sessions).values({
      id: sessionId,
      userId,
      simulatorType: 'balance-sheet',
      level,
      score,
      totalQuestions,
      xpEarned,
      timeSeconds: timeSeconds ?? null,
    });
    
    // Update user's total XP
    const user = await db.select().from(users).where(eq(users.id, userId)).get();
    
    if (user) {
      await db.update(users)
        .set({ totalXp: (user.totalXp || 0) + xpEarned })
        .where(eq(users.id, userId));
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
    const userId = c.req.query('userId');
    
    if (!userId) {
      return c.json({ success: false, error: 'userId is required' }, 400);
    }
    
    const userSessions = await db.select()
      .from(sessions)
      .where(eq(sessions.userId, userId))
      .orderBy(desc(sessions.completedAt));
    
    return c.json({ success: true, sessions: userSessions });
  } catch (error) {
    console.error('Error in GET /sessions:', error);
    return c.json({ success: false, error: 'Failed to get sessions' }, 500);
  }
});

// ====================
// STATS ROUTE
// ====================

// GET /api/stats - Get combined stats for dashboard
app.get('/stats', async (c) => {
  try {
    const db = drizzle(c.env.DB);
    const userId = c.req.query('userId');
    
    if (!userId) {
      return c.json({ success: false, error: 'userId is required' }, 400);
    }
    
    // Get user data
    const user = await db.select().from(users).where(eq(users.id, userId)).get();
    
    // Get progress data
    const progressRecord = await db.select()
      .from(progress)
      .where(eq(progress.userId, userId))
      .get();
    
    // Get session count
    const userSessions = await db.select()
      .from(sessions)
      .where(eq(sessions.userId, userId));
    
    const badges = progressRecord ? JSON.parse(progressRecord.badges || '[]') : [];
    
    return c.json({
      success: true,
      stats: {
        totalXp: user?.totalXp || 0,
        streakDays: user?.streakDays || 0,
        currentLevel: progressRecord?.currentLevel || 1,
        completedLevels: progressRecord ? JSON.parse(progressRecord.completedLevels || '[]') : [],
        badgeCount: badges.length,
        sessionCount: userSessions.length,
      },
    });
  } catch (error) {
    console.error('Error in GET /stats:', error);
    return c.json({ success: false, error: 'Failed to get stats' }, 500);
  }
});

export default app;
