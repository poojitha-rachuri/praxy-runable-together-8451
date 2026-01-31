# RCA Detective - Setup Instructions

## 🎉 Fixed Issues

1. ✅ API now returns complete case data (title, problem, metrics)
2. ✅ Cases are properly sorted by difficulty (Beginner → Intermediate → Advanced)
3. ✅ Added database seed endpoint for RCA cases
4. ✅ 3 cases ready to solve

## 📋 RCA Cases

### 1. The DAU Mystery (Beginner)
- **Problem**: Daily Active Users dropped 40% overnight
- **Metric**: DAU -40%
- **Difficulty**: Beginner
- **XP Reward**: 200 XP

### 2. Revenue Riddle (Intermediate)
- **Problem**: Revenue dropped 15% despite more purchases
- **Metric**: Revenue -15%
- **Difficulty**: Intermediate
- **XP Reward**: 250 XP

### 3. Churn Challenge (Advanced)
- **Problem**: Customer churn spiked 300% in January
- **Metric**: Churn Rate +300%
- **Difficulty**: Advanced
- **XP Reward**: 300 XP

## 🚀 How to Initialize RCA Data

### Option 1: Via Browser (Easiest)
After deploying, visit:
```
https://your-worker.runable.com/api/seed-rca
```

This will create the tables and seed all 3 cases.

### Option 2: Via cURL
```bash
curl https://your-worker.runable.com/api/seed-rca
```

### Option 3: Via Wrangler (Local Dev)
```bash
bun dev
# Then visit http://localhost:5173/api/seed-rca
```

## ✅ Verify It Worked

Visit your RCA page:
```
https://your-app.com/rca
```

You should now see 3 case cards displayed in order:
1. The DAU Mystery (Beginner)
2. Revenue Riddle (Intermediate)
3. Churn Challenge (Advanced)

## 🎮 How It Works

### User Flow
1. **Select a Case** → Click on any unlocked case
2. **Investigation** → Request data from multiple sources
3. **Build 5 Whys** → Dig deeper into the problem
4. **Submit Hypothesis** → Identify root cause and fix
5. **Get Scored** → AI (Claude) scores your analysis
6. **Earn XP** → Get XP based on your score

### Unlocking System
- Level 1 (Beginner) is always unlocked
- Complete a case with score ≥ 60% to unlock the next level
- Cases are displayed with lock icons if not yet unlocked

## 📊 Database Schema

### `rca_cases` table
- `id`: Case ID (e.g., 'dau-drop-001')
- `title`: Case name
- `difficulty`: 'beginner' | 'intermediate' | 'advanced'
- `initial_problem`: Problem description
- `metric_name`: What metric changed
- `metric_drop`: Percentage change (e.g., '-40%')
- `time_period`: When it happened
- `available_data`: JSON array of data sources
- `root_cause`: Correct answer (not shown to user)
- `correct_fix`: Correct solution (not shown to user)
- `xp_reward`: XP for completing

### `rca_sessions` table
- `id`: Session UUID
- `clerk_id`: User ID
- `case_id`: Which case they're solving
- `status`: 'in_progress' | 'completed'
- `data_requests_made`: JSON array of requested data
- `five_whys`: JSON array of why questions
- `fishbone`: JSON object of causes
- `submitted_root_cause`: User's answer
- `submitted_reasoning`: User's explanation
- `score`: 0-100
- `feedback`: JSON with detailed feedback
- `time_seconds`: How long they took

## 🔧 API Endpoints

### GET /api/rca/cases
Returns all cases (without solutions).

**Response:**
```json
{
  "success": true,
  "cases": [
    {
      "id": "dau-drop-001",
      "level_number": 1,
      "title": "The DAU Mystery",
      "difficulty": "beginner",
      "initial_problem": "Daily Active Users dropped 40% overnight",
      "metric_name": "Daily Active Users",
      "metric_drop": "-40%",
      "time_period": "Jan 15-16, 2024",
      "xp_reward": 200
    }
  ]
}
```

### GET /api/rca/cases/:id
Returns full case details including available data sources.

### POST /api/rca/submit
Submits analysis and gets AI scoring.

### GET /api/rca/progress?clerkId=xxx
Returns completed cases for a user.

## 🎯 Scoring Logic

AI scores submissions on:
1. **Root Cause Accuracy (40 pts)**: Did they identify the real root cause?
2. **Reasoning Quality (30 pts)**: Is their logic sound?
3. **Methodology (20 pts)**: Did they use 5 Whys and Fishbone effectively?
4. **Clarity (10 pts)**: Is the explanation clear?

**Total: 100 points**

Efficiency bonus/penalty based on how much data they requested.

## 💡 Tips for Users

Include these on your RCA page:
- Look at the data methodically — don't jump to conclusions
- Use the "5 Whys" to dig deeper than surface-level symptoms
- The best root causes are specific, actionable, and fixable

## 🐛 Troubleshooting

**Cases not showing?**
- Make sure you've run `/api/seed-rca`
- Check browser console for API errors
- Verify database tables were created

**Can't click on cases?**
- Only Level 1 is unlocked initially
- Complete a case with score ≥ 60 to unlock next level

**Scoring not working?**
- Requires `OPENROUTER_API_KEY` environment variable
- Falls back to simple scoring if API unavailable

## 📝 Next Steps

1. Run the seed endpoint: `/api/seed-rca`
2. Visit `/rca` page in your app
3. Start solving cases!
4. (Optional) Update simulator status in DB:
   ```sql
   UPDATE simulators SET status = 'active' WHERE slug = 'rca';
   ```

## 🎨 Case Display Order

Cases are now properly sorted:
1. All **Beginner** cases first
2. Then **Intermediate** cases
3. Finally **Advanced** cases

Within each difficulty level, cases are sorted by ID.
