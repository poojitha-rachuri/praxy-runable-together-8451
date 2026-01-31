import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation } from 'wouter';
import { FiPhoneOff, FiMic, FiMicOff, FiSend } from 'react-icons/fi';
import { getScenarioById, type Scenario, type TranscriptMessage, saveCallSession, scoreCall } from '../lib/coldcall';
import { createColdCallAgent, ElevenLabsConversation } from '../lib/elevenlabs';

// Hardcoded scenarios for fallback
const hardcodedScenarios: Record<string, Scenario> = {
  'sc-stripe-1': {
    id: 'sc-stripe-1',
    simulator_id: 'sim-cc',
    level_number: 1,
    company_name: 'Stripe',
    company_url: 'https://stripe.com',
    company_context: 'Stripe is a payments infrastructure company. You are selling a developer productivity tool.',
    prospect_name: 'Alex Chen',
    prospect_role: 'Engineering Manager',
    prospect_personality: 'Friendly but busy. Values efficiency. Will give you 2 minutes if you hook them.',
    objective: 'Book a 15-minute demo call',
    difficulty: 'beginner',
    tips: ['Lead with value, not features', 'Mention developer pain points', 'Ask about their current stack'],
    success_criteria: ['Demo booked', 'Follow-up agreed', 'Contact info exchanged'],
  },
  'sc-shopify-2': {
    id: 'sc-shopify-2',
    simulator_id: 'sim-cc',
    level_number: 2,
    company_name: 'Shopify',
    company_url: 'https://shopify.com',
    company_context: 'Shopify is an e-commerce platform. You are selling an inventory management solution.',
    prospect_name: 'Priya Sharma',
    prospect_role: 'Operations Lead',
    prospect_personality: 'Skeptical. Has seen many pitches. Needs proof and numbers.',
    objective: 'Get agreement for a pilot program',
    difficulty: 'intermediate',
    tips: ['Come with specific ROI numbers', 'Reference similar companies', 'Acknowledge their skepticism'],
    success_criteria: ['Pilot agreed', 'Decision timeline shared', 'Stakeholders identified'],
  },
  'sc-zomato-3': {
    id: 'sc-zomato-3',
    simulator_id: 'sim-cc',
    level_number: 3,
    company_name: 'Zomato',
    company_url: 'https://zomato.com',
    company_context: 'Zomato is a food delivery platform. You are selling a customer analytics tool.',
    prospect_name: 'Rahul Verma',
    prospect_role: 'Head of Growth',
    prospect_personality: 'Aggressive, interrupts often. Wants bottom-line impact only.',
    objective: 'Secure a meeting with the CTO',
    difficulty: 'advanced',
    tips: ['Get to the point fast', 'Handle interruptions gracefully', 'Pivot to CTO meeting if stuck'],
    success_criteria: ['CTO meeting confirmed', 'Business case understood', 'Budget discussion initiated'],
  },
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const ColdCallSession = () => {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const [, navigate] = useLocation();
  
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(true);
  const [callActive, setCallActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  
  const conversationRef = useRef<ElevenLabsConversation | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load scenario
  useEffect(() => {
    const loadScenario = async () => {
      if (!scenarioId) return;
      
      setLoading(true);
      const data = await getScenarioById(scenarioId);
      setScenario(data || hardcodedScenarios[scenarioId] || null);
      setLoading(false);
    };

    loadScenario();
  }, [scenarioId]);

  // Start call when scenario loads
  useEffect(() => {
    if (scenario && !callActive && !loading) {
      startCall();
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (conversationRef.current) {
        conversationRef.current.stop();
      }
    };
  }, [scenario, loading]);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  const startCall = useCallback(async () => {
    if (!scenario) return;

    // Initialize ElevenLabs conversation
    const config = createColdCallAgent(scenario);
    const conversation = new ElevenLabsConversation(config);
    
    conversation.onTranscriptUpdate = (messages) => {
      setTranscript([...messages]);
    };
    
    conversation.onError = (error) => {
      console.error('Conversation error:', error);
    };

    conversationRef.current = conversation;
    
    // Start the conversation
    const started = await conversation.start();
    
    if (started) {
      setCallActive(true);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);

      // Add initial prospect greeting after a short delay
      setTimeout(() => {
        conversation.addMessage('assistant', `Hello, this is ${scenario.prospect_name}. Who's calling?`);
      }, 1500);
    }
  }, [scenario]);

  const handleSendMessage = () => {
    if (!inputText.trim() || !conversationRef.current || isProcessing) return;
    
    setIsProcessing(true);
    conversationRef.current.simulateResponse(inputText.trim());
    setInputText('');
    
    setTimeout(() => setIsProcessing(false), 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const endCall = async () => {
    if (!scenario || isEnding) return;
    
    setIsEnding(true);
    
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Stop conversation and get final transcript
    const finalTranscript = conversationRef.current?.stop() || transcript;
    
    // Score the call
    const score = await scoreCall(finalTranscript, scenario);
    
    if (score) {
      // Save session
      await saveCallSession(scenario.id, finalTranscript, elapsedTime, score);
    }
    
    // Navigate to feedback page with data in state
    // Store in sessionStorage for the feedback page
    sessionStorage.setItem('coldcall_result', JSON.stringify({
      scenarioId: scenario.id,
      transcript: finalTranscript,
      duration: elapsedTime,
      score: score || {
        overall: 65,
        opening: 70,
        value: 60,
        objection: 65,
        control: 70,
        close: 55,
        highlights: [
          { text: 'Good opening hook', type: 'good' },
          { text: 'Mentioned specific pain points', type: 'good' },
          { text: 'Could have asked for the meeting sooner', type: 'improve' },
        ],
        improvements: [
          'Try to close earlier in the conversation',
          'Use more specific numbers and data',
          'Handle objections with more confidence',
        ],
      },
    }));
    
    navigate(`/cold-call/${scenarioId}/feedback`);
  };

  if (loading || !scenario) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-coral/20 rounded-full" />
          <div className="h-4 w-32 bg-white/10 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal flex flex-col">
      {/* Header */}
      <header className="py-4 px-6 border-b border-white/10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Live indicator */}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-coral rounded-full animate-pulse" />
              <span className="font-inter text-sm text-white/80">LIVE</span>
            </div>
            
            {/* Company name */}
            <div className="pl-4 border-l border-white/20">
              <p className="font-nunito font-700 text-white">{scenario.company_name}</p>
              <p className="font-inter text-xs text-white/60">{scenario.prospect_name}</p>
            </div>
          </div>
          
          {/* Timer */}
          <div className="font-mono text-2xl text-white/90">
            {formatTime(elapsedTime)}
          </div>
        </div>
      </header>

      {/* Transcript area */}
      <main className="flex-1 overflow-hidden px-6 py-4">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 pb-4">
            {transcript.length === 0 && (
              <div className="text-center py-12">
                <p className="font-inter text-white/40">Call connecting...</p>
              </div>
            )}
            
            {transcript.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-coral text-white rounded-br-sm'
                      : 'bg-white/10 text-white/90 rounded-bl-sm'
                  }`}
                >
                  <p className="font-inter text-sm leading-relaxed">{message.content}</p>
                  <p className="font-inter text-xs mt-1 opacity-50">
                    {new Date(message.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
            
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={transcriptEndRef} />
          </div>
        </div>
      </main>

      {/* Input area */}
      <div className="border-t border-white/10 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          {/* Text input for demo mode */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your pitch... (Demo mode - type to simulate speech)"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 font-inter focus:outline-none focus:ring-2 focus:ring-coral/50"
                disabled={isProcessing || isEnding}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isProcessing || isEnding}
              className="w-12 h-12 rounded-xl bg-coral text-white flex items-center justify-center hover:bg-coral/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSend className="w-5 h-5" />
            </button>
          </div>
          
          {/* Control buttons */}
          <div className="flex items-center justify-center gap-4">
            {/* Mute button */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                isMuted 
                  ? 'bg-coral/20 text-coral' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {isMuted ? <FiMicOff className="w-6 h-6" /> : <FiMic className="w-6 h-6" />}
            </button>
            
            {/* End call button */}
            <button
              onClick={endCall}
              disabled={isEnding}
              className="w-16 h-16 rounded-full bg-coral text-white flex items-center justify-center hover:bg-coral/90 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <FiPhoneOff className="w-7 h-7" />
            </button>
          </div>
          
          {/* Objective reminder */}
          <p className="text-center font-inter text-xs text-white/40 mt-4">
            Objective: {scenario.objective}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ColdCallSession;
