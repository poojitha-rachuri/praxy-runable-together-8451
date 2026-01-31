/**
 * ElevenLabs Conversational AI Integration
 * Handles voice AI for cold call practice sessions
 */

import type { Scenario, TranscriptMessage } from './coldcall';

// ElevenLabs Agent ID - set via environment or will be provided
const ELEVENLABS_AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID || '';

export interface ElevenLabsConfig {
  agentId: string;
  systemPrompt: string;
}

/**
 * Creates the system prompt for the cold call agent based on scenario
 */
export const createColdCallAgent = (scenario: Scenario): ElevenLabsConfig => {
  const systemPrompt = `You are ${scenario.prospect_name}, ${scenario.prospect_role} at ${scenario.company_name}.

Personality: ${scenario.prospect_personality || 'Professional but busy'}

Company Context: ${scenario.company_context || `${scenario.company_name} is a successful company.`}

You are receiving a cold call from a salesperson. Respond naturally based on your personality.

Guidelines:
- If they have a weak opening, be dismissive and ready to hang up
- If they show value quickly, engage more and ask questions
- Ask tough questions about pricing, competitors, and proof points
- If impressed by their pitch, offer to book a follow-up meeting
- Handle objections realistically based on your personality
- Never break character
- Keep responses conversational and under 30 seconds of speech
- Use filler words occasionally like "um", "well", "look" for realism

Current Objective for Caller: ${scenario.objective}

Remember: You are the prospect, not the salesperson. Wait for them to pitch to you.`;

  return {
    agentId: ELEVENLABS_AGENT_ID,
    systemPrompt,
  };
};

/**
 * ElevenLabs Conversation Manager
 * Handles WebSocket connection and audio streaming
 */
export class ElevenLabsConversation {
  private ws: WebSocket | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private isConnected = false;
  
  public transcript: TranscriptMessage[] = [];
  public onTranscriptUpdate: ((messages: TranscriptMessage[]) => void) | null = null;
  public onConnectionChange: ((connected: boolean) => void) | null = null;
  public onError: ((error: string) => void) | null = null;

  constructor(private config: ElevenLabsConfig) {}

  /**
   * Start the conversation
   */
  async start(): Promise<boolean> {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Initialize audio context
      this.audioContext = new AudioContext();
      
      // For now, we'll simulate the connection since ElevenLabs requires API key
      // In production, this would connect to ElevenLabs WebSocket
      console.log('ElevenLabs conversation starting with config:', this.config);
      
      this.isConnected = true;
      this.onConnectionChange?.(true);
      
      // Set up media recorder for audio capture
      this.mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          // In production, send audio to ElevenLabs
          console.log('Audio chunk available:', event.data.size, 'bytes');
        }
      };
      
      this.mediaRecorder.start(250); // Capture in 250ms chunks
      
      return true;
    } catch (error) {
      console.error('Failed to start conversation:', error);
      this.onError?.('Failed to access microphone');
      return false;
    }
  }

  /**
   * Add a message to the transcript
   */
  addMessage(role: 'user' | 'assistant', content: string): void {
    const message: TranscriptMessage = {
      role,
      content,
      timestamp: Date.now(),
    };
    this.transcript.push(message);
    this.onTranscriptUpdate?.(this.transcript);
  }

  /**
   * Simulate a response (for demo purposes)
   * In production, this would be replaced by ElevenLabs responses
   */
  simulateResponse(userMessage: string): void {
    // Add user message
    this.addMessage('user', userMessage);
    
    // Simulate prospect response after a delay
    setTimeout(() => {
      const responses = [
        "I'm pretty busy right now. What's this about?",
        "We already have a solution for that.",
        "How is this different from what we're using?",
        "What kind of results have you seen with similar companies?",
        "I might have 5 minutes. Go ahead.",
        "Send me an email and I'll take a look.",
        "That's interesting. Tell me more about the ROI.",
      ];
      const response = responses[Math.floor(Math.random() * responses.length)];
      this.addMessage('assistant', response);
    }, 1500);
  }

  /**
   * Stop the conversation
   */
  stop(): TranscriptMessage[] {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.isConnected = false;
    this.onConnectionChange?.(false);
    
    return this.transcript;
  }

  /**
   * Check if currently connected
   */
  get connected(): boolean {
    return this.isConnected;
  }
}

/**
 * Play audio from ElevenLabs response
 * In production, this would stream and play the AI voice response
 */
export const playAudioResponse = async (audioData: ArrayBuffer): Promise<void> => {
  const audioContext = new AudioContext();
  const audioBuffer = await audioContext.decodeAudioData(audioData);
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);
  source.start();
};
