import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation } from 'wouter';
import { useUser } from '@clerk/clerk-react';
import { useConversation } from '@elevenlabs/react';
import { FiPhoneOff, FiMic, FiVolume2 } from 'react-icons/fi';
import { getScenarioById, saveCallSessionToBackend, type Scenario } from '../lib/coldcall';
import { setClerkId, getClerkId } from '../lib/api';

// Hardcoded scenarios for fallback
const hardcodedScenarios: Record<string, Scenario> = {
  'cc-1': {
    id: 'cc-1',
    simulator_id: 'sim-cc',
    level_number: 1,
    company_name: 'Razorpay',
    company_url: 'https://razorpay.com',
    company_context: 'Razorpay is a fintech payments company with ~2,500 employees. You are selling SecureShield Pro — an enterprise cybersecurity platform.',
    prospect_name: 'Rajesh Menon',
    prospect_role: 'CISO',
    prospect_personality: 'Technical, risk-averse, skeptical of security vendors. Needs strong proof points.',
    objective: 'Get Rajesh to agree to a technical demo with his security team',
    difficulty: 'beginner',
    tips: ['Reference the RBI audit or phishing attacks', 'Position as consolidation play vs CrowdStrike', 'Ask for a specific 30-min demo next step'],
    success_criteria: ['Demo booked', 'Technical credibility established', 'Pain points addressed'],
  },
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const ColdCallSession = () => {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const [, navigate] = useLocation();
  const { user } = useUser();
  
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isEnding, setIsEnding] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [showScenario, setShowScenario] = useState(true);
  
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ElevenLabs conversation hook
  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to ElevenLabs');
      setStartTime(Date.now());
      // Start timer
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs');
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    },
    onMessage: ({ message, source }) => {
      console.log('Message:', source, message);
      setMessages((prev) => [
        ...prev,
        {
          role: source === 'ai' ? 'assistant' : 'user',
          content: message,
          timestamp: Date.now(),
        },
      ]);
    },
    onError: (error) => {
      console.error('ElevenLabs error:', error);
    },
  });

  // Ensure clerkId is set for API calls
  useEffect(() => {
    if (user?.id) {
      setClerkId(user.id);
    }
  }, [user?.id]);

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

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (conversation.status === 'connected') {
        conversation.endSession();
      }
    };
  }, []);

  const startCall = useCallback(async () => {
    if (!scenario || hasStarted) return;

    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Get the agent ID - for now use environment variable or scenario-based lookup
      // The agent ID should be configured per scenario in ElevenLabs dashboard
      const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID;
      
      if (!agentId) {
        console.error('No ElevenLabs agent ID configured');
        alert('ElevenLabs agent not configured. Please set VITE_ELEVENLABS_AGENT_ID in your environment.');
        return;
      }

      setHasStarted(true);
      
      // Start the conversation with the agent
      await conversation.startSession({
        agentId,
      });
      
    } catch (error) {
      console.error('Error starting call:', error);
      setHasStarted(false);
      alert('Failed to start call. Please ensure microphone access is allowed.');
    }
  }, [scenario, conversation, hasStarted]);

  const endCall = async () => {
    if (!scenario || isEnding) return;
    
    setIsEnding(true);
    
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // End the ElevenLabs session
    await conversation.endSession();
    
    const duration = Math.floor((Date.now() - startTime) / 1000);
    
    // Get user messages only
    const userMessages = messages.filter(m => m.role === 'user');
    const totalUserWords = userMessages.reduce((sum, m) => sum + m.content.split(' ').length, 0);
    const hasUserSpoken = userMessages.length > 0 && totalUserWords > 10;
    
    // Analyze conversation quality
    const analyzeConversation = () => {
      if (!hasUserSpoken) {
        // User didn't really talk - give low scores
        return {
          outcome: 'failure' as const,
          opening: Math.min(20, userMessages.length * 10),
          value: 0,
          objection: 0,
          control: 0,
          close: 0,
          highlights: [] as Array<{ text: string; type: 'good' | 'improve' }>,
          improvements: [
            'You need to actually speak during the call!',
            'Introduce yourself and explain why you\'re calling',
            'Try to engage the prospect in conversation',
          ],
        };
      }
      
      const allUserContent = userMessages.map(m => m.content.toLowerCase()).join(' ');
      const lastMessages = messages.slice(-3).map(m => m.content.toLowerCase());
      
      // Check for key behaviors
      const hasIntroduction = allUserContent.includes('hi') || allUserContent.includes('hello') || allUserContent.includes('my name');
      const hasValueProp = allUserContent.includes('help') || allUserContent.includes('save') || allUserContent.includes('improve') || allUserContent.includes('%');
      const hasQuestion = allUserContent.includes('?');
      const hasClose = allUserContent.includes('meeting') || allUserContent.includes('demo') || allUserContent.includes('call') || allUserContent.includes('time');
      
      // Determine outcome
      let outcome: 'success' | 'partial' | 'failure' = 'failure';
      if (lastMessages.some(m => m.includes('meeting') || m.includes('demo') || m.includes('call you') || m.includes('transfer') || m.includes('yes'))) {
        outcome = 'success';
      } else if (lastMessages.some(m => m.includes('maybe') || m.includes('later') || m.includes('email') || m.includes('send'))) {
        outcome = 'partial';
      }
      
      // Calculate scores based on actual behavior
      const openingScore = hasIntroduction ? 70 : 30;
      const valueScore = hasValueProp ? 65 : 20;
      const objectionScore = messages.length > 4 ? 60 : 30;
      const controlScore = hasQuestion ? 70 : 40;
      const closeScore = hasClose ? (outcome === 'success' ? 80 : 50) : 20;
      
      const highlights: Array<{ text: string; type: 'good' | 'improve' }> = [];
      const improvements: string[] = [];
      
      if (hasIntroduction) highlights.push({ text: 'Good introduction', type: 'good' });
      else improvements.push('Start with a clear introduction');
      
      if (hasValueProp) highlights.push({ text: 'Mentioned value proposition', type: 'good' });
      else improvements.push('Lead with value - what can you do for them?');
      
      if (hasQuestion) highlights.push({ text: 'Asked questions', type: 'good' });
      else improvements.push('Ask questions to understand their needs');
      
      if (hasClose) highlights.push({ text: 'Attempted to close', type: 'good' });
      else improvements.push('Always end with a clear call-to-action');
      
      return {
        outcome,
        opening: openingScore,
        value: valueScore,
        objection: objectionScore,
        control: controlScore,
        close: closeScore,
        highlights,
        improvements,
      };
    };
    
    const analysis = analyzeConversation();
    const overallScore = hasUserSpoken 
      ? Math.round((analysis.opening + analysis.value + analysis.objection + analysis.control + analysis.close) / 5)
      : Math.min(15, messages.length * 5);
    
    const scoreData = {
      overall: overallScore,
      opening: analysis.opening,
      value: analysis.value,
      objection: analysis.objection,
      control: analysis.control,
      close: analysis.close,
      highlights: analysis.highlights,
      improvements: analysis.improvements,
    };
    
    // Store result for feedback page (local fallback)
    sessionStorage.setItem('coldcall_result', JSON.stringify({
      scenarioId: scenario.id,
      transcript: messages,
      duration,
      outcome: analysis.outcome,
      score: scoreData,
    }));
    
    // Save to backend database for history
    const clerkId = getClerkId();
    if (clerkId) {
      try {
        await saveCallSessionToBackend({
          clerkId,
          scenarioId: scenario.id,
          transcript: messages,
          durationSeconds: duration,
          overallScore,
          openingScore: analysis.opening,
          valueScore: analysis.value,
          objectionScore: analysis.objection,
          controlScore: analysis.control,
          closeScore: analysis.close,
          highlights: analysis.highlights,
          improvements: analysis.improvements,
        });
      } catch (error) {
        console.error('Failed to save session to backend:', error);
      }
    }
    
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

  const isConnected = conversation.status === 'connected';
  const isConnecting = conversation.status === 'connecting';

  return (
    <div className="min-h-screen bg-charcoal flex flex-col">
      {/* Header */}
      <header className="py-4 px-6 border-b border-white/10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Status indicator */}
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                isConnected ? 'bg-green-500 animate-pulse' : 
                isConnecting ? 'bg-yellow-500 animate-pulse' : 
                'bg-gray-500'
              }`} />
              <span className="font-inter text-sm text-white/80">
                {isConnected ? 'LIVE' : isConnecting ? 'CONNECTING...' : 'READY'}
              </span>
            </div>
            
            {/* Company name */}
            <div className="pl-4 border-l border-white/20">
              <p className="font-nunito font-700 text-white">{scenario.company_name}</p>
              <p className="font-inter text-xs text-white/60">{scenario.prospect_name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Toggle scenario panel */}
            {hasStarted && (
              <button
                onClick={() => setShowScenario(!showScenario)}
                className="px-3 py-1 rounded-lg bg-white/10 text-white/80 font-inter text-sm hover:bg-white/20 transition-colors"
              >
                {showScenario ? 'Hide' : 'Show'} Scenario
              </button>
            )}
            
            {/* Timer */}
            <div className="font-mono text-2xl text-white/90">
              {formatTime(elapsedTime)}
            </div>
          </div>
        </div>
      </header>

      {/* Main area with scenario panel and transcript */}
      <main className="flex-1 overflow-hidden px-6 py-4">
        <div className="max-w-6xl mx-auto h-full flex gap-4">
          {/* Scenario reference panel (collapsible) */}
          {hasStarted && showScenario && (
            <div className="w-72 flex-shrink-0 bg-white/5 rounded-xl p-4 overflow-y-auto">
              <h3 className="font-nunito font-700 text-white mb-3">📋 Scenario Reference</h3>
              
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-white/50 text-xs mb-1">COMPANY</p>
                  <p className="text-white font-600">{scenario.company_name}</p>
                  {scenario.company_context && (
                    <p className="text-white/60 text-xs mt-1">{scenario.company_context}</p>
                  )}
                </div>
                
                <div>
                  <p className="text-white/50 text-xs mb-1">PROSPECT</p>
                  <p className="text-white font-600">{scenario.prospect_name}</p>
                  <p className="text-white/60">{scenario.prospect_role}</p>
                  {scenario.prospect_personality && (
                    <p className="text-white/50 text-xs mt-1 italic">"{scenario.prospect_personality}"</p>
                  )}
                </div>
                
                <div className="bg-coral/20 rounded-lg p-3">
                  <p className="text-white/50 text-xs mb-1">🎯 OBJECTIVE</p>
                  <p className="text-coral font-600">{scenario.objective}</p>
                </div>
                
                {scenario.tips && scenario.tips.length > 0 && (
                  <div>
                    <p className="text-white/50 text-xs mb-2">💡 TIPS</p>
                    <ul className="space-y-1">
                      {scenario.tips.map((tip, i) => (
                        <li key={i} className="text-white/70 text-xs flex gap-2">
                          <span className="text-teal">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Transcript area */}
          <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 pb-4">
            {!hasStarted && (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-coral/20 flex items-center justify-center">
                  <FiMic className="w-10 h-10 text-coral" />
                </div>
                <h2 className="font-nunito font-700 text-xl text-white mb-2">Ready to start your call?</h2>
                <p className="font-inter text-white/60 mb-6 max-w-md mx-auto">
                  You'll be speaking with {scenario.prospect_name}, {scenario.prospect_role} at {scenario.company_name}.
                  <br /><br />
                  <strong className="text-coral">Objective:</strong> {scenario.objective}
                </p>
                <button
                  onClick={startCall}
                  disabled={isConnecting}
                  className="px-8 py-4 bg-coral text-white rounded-xl font-nunito font-700 text-lg hover:bg-coral/90 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {isConnecting ? 'Connecting...' : 'Start Call'}
                </button>
              </div>
            )}
            
            {hasStarted && messages.length === 0 && (
              <div className="text-center py-12">
                <div className="flex items-center justify-center gap-2 text-white/40">
                  <FiVolume2 className="w-5 h-5 animate-pulse" />
                  <span className="font-inter">Waiting for response...</span>
                </div>
              </div>
            )}
            
            {messages.map((message, index) => (
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
            
            {conversation.isSpeaking && (
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
        </div>
      </main>

      {/* Control buttons */}
      {hasStarted && (
        <div className="border-t border-white/10 px-6 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-6">
              {/* Mute indicator */}
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                isConnected ? 'bg-white/10 text-white' : 'bg-white/5 text-white/30'
              }`}>
                <FiMic className="w-6 h-6" />
              </div>
              
              {/* End call button */}
              <button
                onClick={endCall}
                disabled={isEnding || !isConnected}
                className="w-16 h-16 rounded-full bg-coral text-white flex items-center justify-center hover:bg-coral/90 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <FiPhoneOff className="w-7 h-7" />
              </button>
              
              {/* Speaking indicator */}
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                conversation.isSpeaking ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-white/30'
              }`}>
                <FiVolume2 className="w-6 h-6" />
              </div>
            </div>
            
            {/* Objective reminder */}
            <p className="text-center font-inter text-xs text-white/40 mt-4">
              Objective: {scenario.objective}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColdCallSession;
