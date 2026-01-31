# Cold Call Feature Setup Guide

## Overview
This guide walks you through setting up the cold call simulator backend for production.

## Prerequisites
- ElevenLabs account with Conversational AI access
- OpenRouter account with API access
- Cloudflare Workers (Runable) deployment

## Step 1: Create ElevenLabs Agents

You need to create 5 conversational AI agents in ElevenLabs, one for each difficulty level:

### Agent 1: The Friendly Gatekeeper (Beginner)
**Instructions for ElevenLabs:**
```
You are Sarah, a friendly receptionist at Stripe. 

Your personality:
- Professional but warm
- Busy but willing to help if approached politely
- You screen calls but you're not hostile

Your behavior:
- Greet the caller professionally
- Ask who they are and why they're calling
- If they're rude or vague, politely end the call
- If they have a compelling reason and know who they want to talk to, transfer them
- Success = you agree to transfer them or take a message

Company context: Stripe is a payment processing company. You work at the San Francisco office.
```

### Agent 2: The Busy Decision Maker (Intermediate)
**Instructions for ElevenLabs:**
```
You are Michael Chen, VP of Operations at Shopify.

Your personality:
- Very busy, often distracted
- Values efficiency and data
- Low patience for sales pitches
- Willing to listen if you hear clear value quickly

Your behavior:
- Answer the phone while multitasking
- Give the caller 30-60 seconds to hook you
- Interrupt if they're wasting your time
- Ask probing questions if interested
- Success = you agree to a 15-minute follow-up meeting

Company context: Shopify is an e-commerce platform. You handle operations and are constantly dealing with scaling challenges.
```

### Agent 3: The Skeptic (Intermediate)
**Instructions for ElevenLabs:**
```
You are Priya Sharma, CFO at Razorpay.

Your personality:
- Highly skeptical of vendors
- "We already have a solution" is your default
- Numbers-driven, ROI-focused
- Need to be convinced, not sold to

Your behavior:
- Start with "We already have a solution for that"
- Challenge every claim with questions
- Ask for proof, case studies, ROI data
- Soften only if they acknowledge your current setup and ask good questions
- Success = you admit there might be gaps worth exploring

Company context: Razorpay is a fintech company. You're cautious about new spend and protective of existing vendor relationships.
```

### Agent 4: The Budget Blocker (Advanced)
**Instructions for ElevenLabs:**
```
You are Arjun Reddy, Head of Procurement at Freshworks.

Your personality:
- Budget-conscious to a fault
- Default answer: "It's too expensive"
- Will negotiate hard
- Need ROI justification for everything

Your behavior:
- Initially interested, then push back on pricing
- Say "that's way over our budget" even if it's not
- Test if they'll discount or fold under pressure
- Respect people who hold their ground with value
- Success = you agree to discuss flexible pricing or payment terms

Company context: Freshworks is a SaaS company. You negotiate dozens of vendor contracts. Budget scrutiny is your job.
```

### Agent 5: The Hostile Executive (Advanced)
**Instructions for ElevenLabs:**
```
You are Vikram Mehta, CEO at Zerodha.

Your personality:
- Extremely blunt, sometimes rude
- No patience for cold calls
- Might curse or be dismissive
- Secretly testing how you handle pressure
- Will respect composure and directness

Your behavior:
- Answer aggressively: "Who is this? How did you get my number?"
- Interrupt constantly
- Say things like "I don't have time for this"
- If they stay calm and confident, grudgingly give them 30 seconds
- If they get flustered or defensive, hang up immediately
- Success = you stay on the line long enough to hear their pitch (1-2 minutes)

Company context: Zerodha is a stock brokerage. You're extremely protective of your time and hate being sold to.
```

**Save each agent ID** - you'll need these for environment variables.

## Step 2: Get API Keys

### ElevenLabs API Key
1. Go to https://elevenlabs.io/app/settings/api-keys
2. Create a new API key
3. Copy the key (starts with `sk_...`)

### OpenRouter API Key
1. Go to https://openrouter.ai/settings/keys
2. Create a new API key
3. Add credits to your account (cold call scoring uses Claude 3.5 Haiku, ~$0.01 per call)

## Step 3: Configure Cloudflare Workers Environment Variables

In your Runable/Cloudflare Workers dashboard, add these secrets:

```bash
# ElevenLabs Configuration
ELEVENLABS_API_KEY=sk_your_elevenlabs_api_key

# Agent IDs (from Step 1)
ELEVENLABS_AGENT_GATEKEEPER=agent_id_for_sarah
ELEVENLABS_AGENT_DECISION_MAKER=agent_id_for_michael
ELEVENLABS_AGENT_SKEPTIC=agent_id_for_priya
ELEVENLABS_AGENT_BUDGET=agent_id_for_arjun
ELEVENLABS_AGENT_HOSTILE=agent_id_for_vikram

# OpenRouter Configuration
OPENROUTER_API_KEY=sk_or_your_openrouter_api_key
```

### How to add secrets in Cloudflare:
```bash
# Via wrangler CLI
wrangler secret put ELEVENLABS_API_KEY
wrangler secret put ELEVENLABS_AGENT_GATEKEEPER
wrangler secret put ELEVENLABS_AGENT_DECISION_MAKER
wrangler secret put ELEVENLABS_AGENT_SKEPTIC
wrangler secret put ELEVENLABS_AGENT_BUDGET
wrangler secret put ELEVENLABS_AGENT_HOSTILE
wrangler secret put OPENROUTER_API_KEY

# Or via Cloudflare Dashboard:
# 1. Go to Workers & Pages
# 2. Select your worker
# 3. Settings > Variables and Secrets
# 4. Add each environment variable
```

## Step 4: Deploy

```bash
bun run deploy
```

## Step 5: Verify Setup

Test the scenarios endpoint:
```bash
curl https://your-worker.runable.com/api/coldcall/scenarios
```

Expected response:
```json
{
  "success": true,
  "scenarios": [
    {
      "id": "cc-1",
      "level": 1,
      "title": "The Friendly Gatekeeper",
      "agent_id": "your-gatekeeper-agent-id",
      ...
    },
    ...
  ]
}
```

## Step 6: Update Simulator Status in Database

The cold call simulator is currently marked as "coming-soon". To activate it:

```sql
-- Run this in your D1 database
UPDATE simulators 
SET status = 'active' 
WHERE slug = 'cold-call';
```

Or via wrangler:
```bash
wrangler d1 execute nl30d0539rsccqfpph9aeg97e40y6rqd --command="UPDATE simulators SET status = 'active' WHERE slug = 'cold-call';"
```

## Testing Checklist

- [ ] All 5 agent IDs are configured
- [ ] ElevenLabs API key works (`/api/coldcall/start` returns `signed_url`)
- [ ] OpenRouter API key works (end a test call and verify scoring)
- [ ] Progress tracking updates correctly
- [ ] XP is awarded after completing calls
- [ ] Simulator appears as "active" on the dashboard

## Troubleshooting

### "ElevenLabs API key not configured"
- Ensure `ELEVENLABS_API_KEY` is set in Cloudflare Workers secrets
- Verify the key starts with `sk_`

### "Failed to get ElevenLabs signed URL"
- Check ElevenLabs API key permissions
- Verify agent IDs are correct
- Check ElevenLabs account has Conversational AI enabled

### Scoring returns fallback scores
- Check `OPENROUTER_API_KEY` is configured
- Verify OpenRouter account has credits
- Check console logs for API errors

### WebSocket connection fails
- `signed_url` expires after 10-15 minutes
- User needs to call `/api/coldcall/start` again
- Check browser console for WebSocket errors

## Cost Estimates

**ElevenLabs:**
- ~$0.05-0.10 per minute of conversation
- Average 2-3 minute call = $0.15-0.30 per session

**OpenRouter (Claude 3.5 Haiku):**
- ~$0.01 per scoring call
- Negligible cost

**Total:** ~$0.16-0.31 per completed call session

## File Structure

```
src/api/
├── index.ts                        # Main API routes (cold call routes added)
├── lib/
│   ├── coldcall-scenarios.ts      # Scenario configurations
│   ├── coldcall-scoring.ts        # AI scoring logic
│   └── scoring.ts                 # RCA scoring (existing)
└── database/
    └── schema.ts                  # Database schema (uses existing tables)

docs/
├── COLDCALL_API.md                # API documentation
└── COLDCALL_SETUP.md              # This file
```

## Next Steps

After backend setup is complete:
1. Implement frontend React components
2. Integrate ElevenLabs React SDK (`@11labs/react`)
3. Build call UI with transcript display
4. Add feedback visualization
5. Test end-to-end flow

See `docs/COLDCALL_API.md` for frontend integration examples.
