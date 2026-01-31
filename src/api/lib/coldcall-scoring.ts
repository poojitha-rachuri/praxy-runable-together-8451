/**
 * AI-powered cold call scoring
 * Uses OpenRouter API with Claude 3.5 Haiku (with fallback scoring)
 */

interface CallScoringInput {
  scenario_id: string;
  transcript: any[];
  outcome: 'success' | 'partial' | 'failure';
  duration_seconds: number;
}

interface CallScoringResult {
  score: number;
  feedback: {
    opening: { score: number; comment: string };
    value_proposition: { score: number; comment: string };
    objection_handling: { score: number; comment: string };
    professionalism: { score: number; comment: string };
    outcome: { score: number; comment: string };
    overall: string;
    praxy_message: string;
    top_tip: string;
  };
}

export async function scoreCallWithAI(env: any, data: CallScoringInput): Promise<CallScoringResult> {
  const prompt = `You are Praxy, scoring a cold call simulation for sales training.

SCENARIO: ${data.scenario_id}
OUTCOME: ${data.outcome} (success/partial/failure)
DURATION: ${data.duration_seconds} seconds

TRANSCRIPT:
${JSON.stringify(data.transcript, null, 2)}

Score this call from 0-100 based on:
1. Opening (20 pts): Was the introduction clear and professional?
2. Value Proposition (25 pts): Did they lead with value, not features?
3. Objection Handling (25 pts): How well did they handle resistance?
4. Professionalism (15 pts): Tone, pacing, respect for prospect's time
5. Outcome Achievement (15 pts): Did they achieve the objective?

Respond ONLY with valid JSON (no markdown code blocks):
{
  "score": <0-100>,
  "feedback": {
    "opening": { "score": <0-20>, "comment": "<feedback>" },
    "value_proposition": { "score": <0-25>, "comment": "<feedback>" },
    "objection_handling": { "score": <0-25>, "comment": "<feedback>" },
    "professionalism": { "score": <0-15>, "comment": "<feedback>" },
    "outcome": { "score": <0-15>, "comment": "<feedback>" },
    "overall": "<2-3 sentence summary>",
    "praxy_message": "<warm, encouraging message>",
    "top_tip": "<one specific thing to improve next time>"
  }
}`;

  // Try OpenRouter API
  if (env.OPENROUTER_API_KEY) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://praxy.runable.com',
          'X-Title': 'Praxy Cold Call Scorer'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-haiku',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1024,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        console.error('OpenRouter API error:', response.status);
        return fallbackScoring(data);
      }

      const result = await response.json();
      const content = result.choices[0].message.content;

      // Clean the response (remove markdown if present)
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      return JSON.parse(cleanContent);
    } catch (error) {
      console.error('OpenRouter scoring failed:', error);
      return fallbackScoring(data);
    }
  }

  return fallbackScoring(data);
}

function fallbackScoring(data: CallScoringInput): CallScoringResult {
  // Simple fallback scoring based on outcome and duration
  const baseScore = data.outcome === 'success' ? 75 : data.outcome === 'partial' ? 50 : 30;
  
  // Adjust for call duration (optimal: 2-5 minutes)
  const durationMinutes = data.duration_seconds / 60;
  const durationScore = durationMinutes >= 2 && durationMinutes <= 5 ? 10 : 0;
  
  const totalScore = Math.min(100, baseScore + durationScore);

  // Calculate individual scores
  const openingScore = Math.round(totalScore * 0.2);
  const valueScore = Math.round(totalScore * 0.25);
  const objectionScore = Math.round(totalScore * 0.25);
  const professionalismScore = Math.round(totalScore * 0.15);
  const outcomeScore = Math.round(totalScore * 0.15);

  return {
    score: totalScore,
    feedback: {
      opening: {
        score: openingScore,
        comment: data.outcome === 'success' 
          ? 'Good opening - you got their attention'
          : 'Your opening could be stronger - try leading with value'
      },
      value_proposition: {
        score: valueScore,
        comment: data.outcome === 'success'
          ? 'You communicated value effectively'
          : 'Focus more on specific benefits and outcomes'
      },
      objection_handling: {
        score: objectionScore,
        comment: data.outcome === 'failure'
          ? 'Practice handling objections with empathy and questions'
          : 'You handled pushback reasonably well'
      },
      professionalism: {
        score: professionalismScore,
        comment: 'Your tone was professional throughout'
      },
      outcome: {
        score: outcomeScore,
        comment: data.outcome === 'success'
          ? 'You achieved the objective!'
          : 'You didn\'t fully achieve the objective, but that\'s part of learning'
      },
      overall: data.outcome === 'success'
        ? `Good work! You scored ${totalScore}/100. You're developing solid cold calling skills.`
        : `You scored ${totalScore}/100. Cold calling is tough - the key is to keep practicing and learning from each call.`,
      praxy_message: data.outcome === 'success'
        ? 'Nice job! Every successful call builds your confidence. Ready to level up?'
        : 'Hey, even experienced reps get hung up on. What matters is learning from it. Let\'s review what happened and try again!',
      top_tip: data.outcome === 'failure'
        ? 'Try to identify the prospect\'s pain point earlier in the call'
        : 'Great call! Next time, try to uncover even more about their specific challenges'
    }
  };
}
