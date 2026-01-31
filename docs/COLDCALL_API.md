# Cold Call API Documentation

## Overview
Backend API routes for the "I Will Find You" cold call simulator using ElevenLabs Conversational AI.

## Tech Stack
- **Runtime**: Cloudflare Workers (Runable)
- **Database**: Cloudflare D1 (SQLite)
- **Voice AI**: ElevenLabs Conversational AI
- **Auth**: Clerk
- **Scoring**: OpenRouter API (Claude 3.5 Haiku)

## Environment Variables Required

Add these to your Cloudflare Workers environment:

```bash
ELEVENLABS_API_KEY=<your-elevenlabs-api-key>
ELEVENLABS_AGENT_GATEKEEPER=<agent-id-for-level-1>
ELEVENLABS_AGENT_DECISION_MAKER=<agent-id-for-level-2>
ELEVENLABS_AGENT_SKEPTIC=<agent-id-for-level-3>
ELEVENLABS_AGENT_BUDGET=<agent-id-for-level-4>
ELEVENLABS_AGENT_HOSTILE=<agent-id-for-level-5>
OPENROUTER_API_KEY=<your-openrouter-api-key>
```

## API Routes

### 1. GET /api/coldcall/scenarios
Returns all available cold call scenarios with agent mappings.

**Response:**
```json
{
  "success": true,
  "scenarios": [
    {
      "id": "cc-1",
      "level": 1,
      "title": "The Friendly Gatekeeper",
      "company": "Stripe",
      "prospect": {
        "name": "Sarah",
        "role": "Receptionist"
      },
      "difficulty": "beginner",
      "agent_id": "<elevenlabs-agent-id>",
      "objective": "Get transferred to the decision maker",
      "tips": [
        "Be polite and professional",
        "Have a clear reason for calling",
        "Ask for the person by name if possible"
      ]
    }
    // ... more scenarios
  ]
}
```

### 2. POST /api/coldcall/start
Starts a cold call session and returns ElevenLabs signed URL for WebSocket connection.

**Request:**
```json
{
  "clerk_id": "user_abc123",
  "scenario_id": "cc-1"
}
```

**Response:**
```json
{
  "success": true,
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "signed_url": "wss://api.elevenlabs.io/v1/convai/conversation?signed_url=...",
  "agent_id": "<elevenlabs-agent-id>",
  "scenario": {
    "id": "cc-1",
    "level": 1,
    "title": "The Friendly Gatekeeper",
    "company": "Stripe",
    "prospect": { "name": "Sarah", "role": "Receptionist" },
    "difficulty": "beginner",
    "objective": "Get transferred to the decision maker",
    "tips": [...]
  },
  "message": "Connect to signed_url via WebSocket to start the call"
}
```

**What happens:**
1. Creates a session record in the database
2. Fetches a signed WebSocket URL from ElevenLabs API
3. Returns the URL for the frontend to establish WebSocket connection

### 3. POST /api/coldcall/end
Ends the call, saves transcript, and scores the performance using AI.

**Request:**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "clerk_id": "user_abc123",
  "scenario_id": "cc-1",
  "transcript": [
    {
      "role": "user",
      "content": "Hi, this is John calling from TechCorp...",
      "timestamp": 1234567890
    },
    {
      "role": "agent",
      "content": "Okay, what's this regarding?",
      "timestamp": 1234567895
    }
  ],
  "duration_seconds": 120,
  "outcome": "success"
}
```

**Response:**
```json
{
  "success": true,
  "score": 78,
  "xp_earned": 78,
  "feedback": {
    "opening": {
      "score": 16,
      "comment": "Strong opening - you immediately established credibility"
    },
    "value_proposition": {
      "score": 20,
      "comment": "You clearly articulated the value without being pushy"
    },
    "objection_handling": {
      "score": 19,
      "comment": "Good job addressing their concerns with empathy"
    },
    "professionalism": {
      "score": 12,
      "comment": "Professional tone throughout"
    },
    "outcome": {
      "score": 11,
      "comment": "You achieved the objective!"
    },
    "overall": "Good work! You scored 78/100. You're developing solid cold calling skills.",
    "praxy_message": "Nice job! Every successful call builds your confidence. Ready to level up?",
    "top_tip": "Next time, try to uncover even more about their specific challenges"
  }
}
```

**What happens:**
1. Calls OpenRouter API (Claude 3.5 Haiku) to score the call
2. Calculates XP based on level and score
3. Updates the session with transcript and feedback
4. Updates user progress and total XP
5. Returns detailed feedback

### 4. GET /api/coldcall/progress?clerkId=xxx
Returns user's cold call progress.

**Response:**
```json
{
  "success": true,
  "progress": {
    "total_sessions": 5,
    "best_score": 85
  },
  "recent_sessions": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "level": 1,
      "score": 78,
      "time_seconds": 120,
      "completed_at": "2026-01-31T12:30:00Z"
    }
    // ... up to 10 recent sessions
  ]
}
```

## Frontend Integration Guide

### Step 1: Install ElevenLabs React SDK
```bash
bun add @11labs/react
```

### Step 2: Basic React Component Example
```tsx
import { useConversation } from '@11labs/react';

function ColdCallSimulator({ scenarioId, user }) {
  const [sessionId, setSessionId] = useState(null);
  
  const conversation = useConversation({
    onConnect: () => console.log('Connected to AI'),
    onDisconnect: () => handleCallEnd(),
    onMessage: (message) => console.log('AI said:', message),
    onError: (error) => console.error('Error:', error),
  });

  const startCall = async () => {
    // 1. Get signed URL from backend
    const res = await fetch('/api/coldcall/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clerk_id: user.id,
        scenario_id: scenarioId
      })
    });
    
    const { signed_url, session_id } = await res.json();
    setSessionId(session_id);

    // 2. Start ElevenLabs conversation
    await conversation.startSession({ signedUrl: signed_url });
  };

  const endCall = async () => {
    const transcript = conversation.getTranscript();
    const duration = conversation.getDuration(); // implement this
    
    await conversation.endSession();
    
    // 3. Submit for scoring
    const res = await fetch('/api/coldcall/end', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        clerk_id: user.id,
        scenario_id: scenarioId,
        transcript,
        duration_seconds: duration,
        outcome: determineOutcome(transcript) // implement logic
      })
    });
    
    const result = await res.json();
    showFeedback(result.feedback, result.score, result.xp_earned);
  };

  return (
    <div>
      <button onClick={startCall}>Start Call</button>
      <button onClick={endCall}>End Call</button>
      <div>Status: {conversation.status}</div>
    </div>
  );
}
```

### Step 3: Determine Outcome Logic
```typescript
function determineOutcome(transcript: any[]): 'success' | 'partial' | 'failure' {
  // Simple heuristic - improve based on your needs
  const lastMessage = transcript[transcript.length - 1];
  
  if (lastMessage?.content?.toLowerCase().includes('meeting')) {
    return 'success';
  }
  
  if (lastMessage?.content?.toLowerCase().includes('maybe') || 
      lastMessage?.content?.toLowerCase().includes('later')) {
    return 'partial';
  }
  
  return 'failure';
}
```

## Database Schema

The API uses the existing `sessions` and `progress` tables:

**sessions table:**
- `id`: UUID
- `clerk_id`: User's Clerk ID
- `simulator`: 'coldcall'
- `level`: 1-5
- `score`: 0-100
- `time_seconds`: Call duration
- `answers`: JSON with `{ transcript, feedback, outcome }`
- `completed_at`: Timestamp

**progress table:**
- `clerk_id`: User's Clerk ID
- `simulator`: 'coldcall'
- `total_sessions`: Count of completed calls
- `best_score`: Highest score achieved

## Scoring Logic

The AI scoring evaluates 5 dimensions:

1. **Opening (20 pts)**: Introduction clarity and professionalism
2. **Value Proposition (25 pts)**: Leading with value, not features
3. **Objection Handling (25 pts)**: Addressing resistance effectively
4. **Professionalism (15 pts)**: Tone, pacing, respect for time
5. **Outcome Achievement (15 pts)**: Meeting the scenario objective

**XP Calculation:**
```
base_xp = [100, 150, 200, 250, 300][level - 1]
xp_earned = base_xp * (score / 100)
```

Example: Level 3 call with 78% score = 200 * 0.78 = 156 XP

## Error Handling

All endpoints return standard error format:
```json
{
  "success": false,
  "error": "Error message here"
}
```

Common error codes:
- `400`: Missing required parameters
- `404`: Scenario not found
- `500`: Server error (ElevenLabs API failure, DB error, etc.)

## Testing

### Manual Testing with cURL

**1. Get scenarios:**
```bash
curl https://your-worker.runable.com/api/coldcall/scenarios
```

**2. Start a call:**
```bash
curl -X POST https://your-worker.runable.com/api/coldcall/start \
  -H "Content-Type: application/json" \
  -d '{"clerk_id":"user_123","scenario_id":"cc-1"}'
```

**3. End a call:**
```bash
curl -X POST https://your-worker.runable.com/api/coldcall/end \
  -H "Content-Type: application/json" \
  -d '{
    "session_id":"550e8400-e29b-41d4-a716-446655440000",
    "clerk_id":"user_123",
    "scenario_id":"cc-1",
    "transcript":[{"role":"user","content":"Hi"}],
    "duration_seconds":120,
    "outcome":"success"
  }'
```

**4. Get progress:**
```bash
curl "https://your-worker.runable.com/api/coldcall/progress?clerkId=user_123"
```

## Notes

- The `signed_url` from ElevenLabs is valid for a limited time (typically 10-15 minutes)
- Transcript format depends on ElevenLabs WebSocket message structure
- Fallback scoring is used if OpenRouter API fails
- Progress tracking automatically creates records if they don't exist
