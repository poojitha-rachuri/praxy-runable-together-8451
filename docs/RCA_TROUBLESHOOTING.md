# RCA Detective - Troubleshooting Submission Errors

## 🎉 Fixed: Submission Error

The issue with `{"success": false, "error": "Failed to submit analysis"}` has been fixed!

### What Was Wrong
The scoring function was being dynamically imported inside the route handler using `await import()`, which doesn't work reliably in Cloudflare Workers.

### What Was Fixed
1. ✅ Added `import { scoreWithAI } from './lib/scoring'` at the top of the file
2. ✅ Removed the dynamic `await import()` call
3. ✅ Added comprehensive error logging to help debug future issues
4. ✅ Error response now includes details field with specific error message

## 🚀 Deployment Steps

After fixing, you need to redeploy:

```bash
bun run deploy
```

## 🧪 Testing the Fix

### Test 1: Submit a Simple Analysis
```bash
curl -X POST https://your-worker.runable.com/api/rca/submit \
  -H "Content-Type: application/json" \
  -d '{
    "clerkId": "user_test",
    "caseId": "dau-drop-001",
    "investigationState": {
      "dataRequested": ["user_segments", "error_logs"],
      "fiveWhys": ["Why did users drop?", "Why did they stop logging in?"],
      "fishboneCauses": [],
      "hypothesis": {
        "rootCause": "Android login broken",
        "fix": "Fix the auth issue",
        "confidence": "high"
      },
      "timeSpent": 120
    }
  }'
```

Expected response:
```json
{
  "success": true,
  "score": {
    "root_cause_score": 40,
    "fix_score": 24,
    "efficiency_score": 20,
    "total_score": 84,
    "is_correct": true,
    "feedback": "Great detective work! ..."
  },
  "session": {
    "id": "uuid-here"
  }
}
```

### Test 2: Check Logs
If you still get errors, check the Cloudflare Workers logs:

```bash
wrangler tail
```

The error logs will now show:
- What was received
- Which validation failed (if any)
- The exact error message and stack trace

## 🐛 Common Issues and Solutions

### Issue: "Missing required fields"
**Error:**
```json
{
  "success": false,
  "error": "Missing required fields"
}
```

**Cause:** The request is missing `clerkId`, `caseId`, or `investigationState.hypothesis`

**Solution:** Make sure your frontend is sending:
```typescript
{
  clerkId: string,
  caseId: string,
  investigationState: {
    dataRequested: string[],
    fiveWhys: string[],
    fishboneCauses: any[],
    hypothesis: {
      rootCause: string,
      fix: string,
      confidence: 'low' | 'medium' | 'high'
    },
    timeSpent: number
  }
}
```

### Issue: "Case not found"
**Error:**
```json
{
  "success": false,
  "error": "Case not found"
}
```

**Cause:** The `caseId` doesn't exist in the database

**Solution:** 
1. Make sure you ran `/api/seed-rca` to create the cases
2. Check that you're using valid case IDs:
   - `dau-drop-001`
   - `revenue-dip-001`
   - `churn-spike-001`

### Issue: OpenRouter API Error
**Symptom:** Scoring returns fallback scores (not very accurate)

**Cause:** `OPENROUTER_API_KEY` environment variable is missing or invalid

**Solution:**
```bash
# Add the environment variable
wrangler secret put OPENROUTER_API_KEY
# Enter your key when prompted

# Or via dashboard:
# Cloudflare Dashboard → Workers → Your Worker → Settings → Variables
```

### Issue: Database Error
**Symptom:** Error mentions SQL or database issues

**Solution:**
1. Make sure RCA tables exist:
   ```bash
   curl https://your-worker.runable.com/api/seed-rca
   ```

2. Check D1 database status:
   ```bash
   wrangler d1 list
   wrangler d1 execute your-db-name --command="SELECT * FROM rca_cases"
   ```

## 📊 What Happens When You Submit

1. **Validation:** Checks that all required fields are present
2. **Session Creation:** Creates a new session record in `rca_sessions` table
3. **Fetch Case:** Gets the correct answer from `rca_cases` table
4. **AI Scoring:** Calls OpenRouter (Claude) to score your analysis
5. **Calculate Efficiency:** Bonus/penalty based on data requests
6. **Calculate XP:** Based on score and case difficulty
7. **Update Session:** Saves all data to the session
8. **Update Progress:** Updates your overall RCA progress
9. **Award XP:** Adds XP to your user account
10. **Return Feedback:** Sends detailed scoring back to frontend

## 🔍 Debugging Tips

### Check Console Logs
The submission now logs:
- What was received
- Validation results
- Detailed error messages
- Full stack traces

### View Logs in Real-Time
```bash
# In development
bun dev

# In production
wrangler tail
```

### Test API Directly
Use the cURL commands above to test the API without the frontend.

### Check Network Tab
In browser DevTools → Network:
1. Find the `/api/rca/submit` request
2. Check the payload being sent
3. Check the response

## 📝 Frontend Integration

Your frontend should call the API like this:

```typescript
import { submitAnalysis } from '@/lib/rca';

const handleSubmit = async () => {
  try {
    const result = await submitAnalysis(caseId, investigationState);
    
    if (result.success && result.score) {
      // Navigate to feedback page
      navigate(`/rca/${caseId}/feedback`, {
        state: {
          score: result.score,
          sessionId: result.sessionId
        }
      });
    } else {
      console.error('Submission failed:', result);
    }
  } catch (error) {
    console.error('Error submitting:', error);
  }
};
```

## ✅ Verification Checklist

After deploying the fix:

- [ ] Build completes without errors
- [ ] `/api/seed-rca` has been run
- [ ] Cases display on `/rca` page
- [ ] Can click and view case details
- [ ] Can request data during investigation
- [ ] Can submit analysis without errors
- [ ] Receive feedback with scores
- [ ] XP is awarded
- [ ] Progress is tracked

## 💡 Best Practices

1. **Always validate input** before submitting
2. **Handle errors gracefully** in the UI
3. **Show loading states** during submission
4. **Test with mock data** before real submissions
5. **Check logs** if something goes wrong

## 🎯 Expected Behavior

When everything works:
1. User investigates the case
2. Submits root cause and fix
3. Gets immediate feedback (< 3 seconds)
4. Sees detailed scoring breakdown
5. Earns XP based on performance
6. Can try again or move to next case

## 📚 Additional Resources

- API Documentation: `docs/COLDCALL_API.md` (similar patterns)
- Setup Guide: `docs/RCA_SETUP.md`
- Scoring Logic: `src/api/lib/scoring.ts`
- Frontend API Client: `src/web/lib/rca.ts`
