/**
 * AI-powered scoring for RCA Detective submissions
 * Uses OpenRouter API with Claude 3.5 Haiku (with fallback scoring)
 */

interface ScoringInput {
  submitted_root_cause: string;
  submitted_reasoning: string;
  correct_root_cause: string;
  correct_reasoning: string;
  five_whys: string[];
  fishbone?: any;
}

interface ScoringResult {
  score: number;
  feedback: {
    root_cause_accuracy: { score: number; comment: string };
    reasoning_quality: { score: number; comment: string };
    methodology: { score: number; comment: string };
    clarity: { score: number; comment: string };
    overall: string;
    praxy_message: string;
  };
}

export async function scoreWithAI(env: any, data: ScoringInput): Promise<ScoringResult> {
  const prompt = `You are Praxy, a warm and encouraging AI scoring an RCA (Root Cause Analysis) exercise.

CORRECT ANSWER:
Root Cause: ${data.correct_root_cause}
Reasoning: ${data.correct_reasoning}

STUDENT SUBMISSION:
Root Cause: ${data.submitted_root_cause}
Reasoning: ${data.submitted_reasoning}
Five Whys Used: ${JSON.stringify(data.five_whys)}
Fishbone Categories: ${JSON.stringify(data.fishbone || {})}

Score the submission from 0-100 based on:
1. Root Cause Accuracy (40 points): Did they identify the correct root cause or something close?
2. Reasoning Quality (30 points): Is their logic sound? Did they connect the dots?
3. Methodology (20 points): Did they use 5 Whys and Fishbone effectively?
4. Clarity (10 points): Is the explanation clear and concise?

IMPORTANT: Be encouraging but honest. Even if they got it wrong, highlight what they did well.

Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "score": <0-100>,
  "feedback": {
    "root_cause_accuracy": { "score": <0-40>, "comment": "<specific feedback>" },
    "reasoning_quality": { "score": <0-30>, "comment": "<specific feedback>" },
    "methodology": { "score": <0-20>, "comment": "<specific feedback>" },
    "clarity": { "score": <0-10>, "comment": "<specific feedback>" },
    "overall": "<2-3 sentence summary of their performance>",
    "praxy_message": "<warm, encouraging message in first person, like a supportive friend>"
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
          'X-Title': 'Praxy RCA Scorer'
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
      
      // Clean the response (remove any markdown if present)
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      return JSON.parse(cleanContent);
    } catch (error) {
      console.error('OpenRouter scoring failed:', error);
      return fallbackScoring(data);
    }
  }

  return fallbackScoring(data);
}

function fallbackScoring(data: ScoringInput): ScoringResult {
  // Simple keyword matching fallback
  const submittedLower = data.submitted_root_cause.toLowerCase();
  const correctLower = data.correct_root_cause.toLowerCase();
  
  // Extract key terms from correct answer
  const keyTerms = correctLower.split(' ').filter(word => word.length > 4);
  const matchCount = keyTerms.filter(term => submittedLower.includes(term)).length;
  const matchRatio = keyTerms.length > 0 ? matchCount / keyTerms.length : 0;
  
  // Calculate scores
  const rootCauseScore = Math.round(matchRatio * 40);
  const reasoningScore = data.submitted_reasoning.length > 50 ? 20 : 10;
  const methodologyScore = (data.five_whys?.length > 2 ? 10 : 5) + (data.fishbone ? 10 : 0);
  const clarityScore = data.submitted_root_cause.length > 20 ? 8 : 5;
  
  const totalScore = rootCauseScore + reasoningScore + methodologyScore + clarityScore;
  
  const isGoodAttempt = totalScore >= 60;
  
  return {
    score: totalScore,
    feedback: {
      root_cause_accuracy: {
        score: rootCauseScore,
        comment: isGoodAttempt 
          ? "You identified key elements of the root cause!" 
          : "The root cause wasn't quite right, but you were investigating in the right direction."
      },
      reasoning_quality: {
        score: reasoningScore,
        comment: data.submitted_reasoning.length > 100 
          ? "Good detailed reasoning!" 
          : "Try to explain your thinking in more detail next time."
      },
      methodology: {
        score: methodologyScore,
        comment: data.five_whys?.length > 2 
          ? "Good use of the 5 Whys technique!" 
          : "Try to dig deeper with more 'why' questions."
      },
      clarity: {
        score: clarityScore,
        comment: "Your explanation was clear enough to understand."
      },
      overall: isGoodAttempt 
        ? `Good detective work! You scored ${totalScore}/100. You're developing solid RCA skills.`
        : `You scored ${totalScore}/100. RCA is tricky - the key is to keep asking 'why' until you hit the real root cause.`,
      praxy_message: isGoodAttempt
        ? "Nice work! You're getting the hang of this. Every case you crack makes you sharper. Ready for another one?"
        : "Hey, this stuff is hard - that's why we practice! I've seen the best analysts miss obvious things. Let's review what happened and try another case. You've got this!"
    }
  };
}
