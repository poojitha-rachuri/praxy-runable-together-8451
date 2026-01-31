import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Link } from 'wouter';
import { FiArrowLeft, FiCheck, FiX, FiTrendingUp, FiAward } from 'react-icons/fi';
import PraxyMascot from '../components/praxy-mascot';
import { getRCASession, getCaseById, type RCASession, type RCACase } from '../lib/rca';

const RCAFeedback = () => {
  const [, params] = useRoute('/rca/:caseId/feedback');
  const [, setLocation] = useLocation();
  const caseId = params?.caseId;

  // Get sessionId from query string
  const searchParams = new URLSearchParams(window.location.search);
  const sessionId = searchParams.get('sessionId');

  const [session, setSession] = useState<RCASession | null>(null);
  const [rcaCase, setRcaCase] = useState<RCACase | null>(null);
  const [loading, setLoading] = useState(true);
  const [scoreAnimated, setScoreAnimated] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!sessionId || !caseId) return;

      setLoading(true);
      
      const [sessionData, caseData] = await Promise.all([
        getRCASession(sessionId),
        getCaseById(caseId),
      ]);

      setSession(sessionData);
      setRcaCase(caseData);
      setLoading(false);

      // Trigger score animation after a delay
      setTimeout(() => setScoreAnimated(true), 500);
    };

    loadData();
  }, [sessionId, caseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <PraxyMascot size={80} expression="thinking" waving={false} />
          <p className="font-inter text-charcoal/60 mt-4">Analyzing your investigation...</p>
        </div>
      </div>
    );
  }

  if (!session || !rcaCase) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <p className="font-inter text-charcoal/60">Results not found</p>
          <Link href="/rca">
            <button className="mt-4 px-4 py-2 bg-coral text-white rounded-lg font-inter font-600">
              Back to Cases
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const score = session.score;
  const isPassed = score.is_correct || score.total_score >= 70;
  const scoreColor = score.total_score >= 80 ? 'teal' : score.total_score >= 60 ? 'yellow-600' : 'coral';

  const getPraxyExpression = (): "default" | "thinking" | "celebrating" | "sympathetic" | "happy" => {
    if (score.total_score >= 80) return 'celebrating';
    if (score.total_score >= 60) return 'happy';
    return 'thinking';
  };

  const getPraxyMessage = () => {
    if (score.total_score >= 90) return "Outstanding! You nailed the root cause analysis! 🎉";
    if (score.total_score >= 80) return "Great work! You've got strong analytical skills!";
    if (score.total_score >= 70) return "Good job! You're on the right track!";
    if (score.total_score >= 60) return "Not bad! Keep practicing and you'll improve!";
    return "Keep going! Root cause analysis takes practice.";
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="py-4 px-6 md:px-12 bg-cream/80 backdrop-blur-sm border-b border-charcoal/5">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Link href="/rca">
            <button className="p-2 hover:bg-charcoal/5 rounded-lg transition-colors flex items-center gap-2">
              <FiArrowLeft className="w-5 h-5 text-charcoal" />
              <span className="font-inter text-sm text-charcoal">Back to Cases</span>
            </button>
          </Link>
          <div>
            <h1 className="font-nunito font-700 text-xl text-charcoal">Analysis Results</h1>
            <p className="font-inter text-sm text-charcoal/60">{rcaCase.title}</p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="py-8 px-6 md:px-12">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Score card with Praxy */}
          <div className="bg-white rounded-[16px] p-8 shadow-warm">
            <div className="flex items-start gap-6 mb-6">
              <PraxyMascot size={80} expression={getPraxyExpression()} waving={false} />
              <div className="flex-1">
                <h2 className="font-nunito font-700 text-2xl text-charcoal mb-2">
                  {getPraxyMessage()}
                </h2>
                <p className="font-inter text-charcoal/70">
                  {score.feedback}
                </p>
              </div>
            </div>

            {/* Score breakdown */}
            <div className="grid md:grid-cols-4 gap-4">
              {/* Total score */}
              <div className="md:col-span-1 bg-cream/50 rounded-lg p-6 text-center">
                <div className={`text-5xl font-nunito font-700 mb-2 transition-all duration-1000 ${
                  scoreAnimated ? `text-${scoreColor}` : 'text-charcoal/20'
                }`}>
                  {scoreAnimated ? score.total_score : 0}
                </div>
                <p className="font-inter text-sm text-charcoal/60">Total Score</p>
                {isPassed && (
                  <div className="mt-2 flex items-center justify-center gap-1 text-teal">
                    <FiCheck className="w-4 h-4" />
                    <span className="font-inter text-xs font-600">Passed</span>
                  </div>
                )}
              </div>

              {/* Component scores */}
              <div className="md:col-span-3 grid grid-cols-3 gap-4">
                <div className="bg-cream/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FiTrendingUp className="w-4 h-4 text-coral" />
                    <p className="font-inter text-xs text-charcoal/60">Root Cause</p>
                  </div>
                  <p className="font-nunito font-700 text-2xl text-charcoal">
                    {score.root_cause_score}<span className="text-lg text-charcoal/40">/50</span>
                  </p>
                </div>

                <div className="bg-cream/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FiAward className="w-4 h-4 text-teal" />
                    <p className="font-inter text-xs text-charcoal/60">Fix Quality</p>
                  </div>
                  <p className="font-nunito font-700 text-2xl text-charcoal">
                    {score.fix_score}<span className="text-lg text-charcoal/40">/30</span>
                  </p>
                </div>

                <div className="bg-cream/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FiCheck className="w-4 h-4 text-yellow-600" />
                    <p className="font-inter text-xs text-charcoal/60">Efficiency</p>
                  </div>
                  <p className="font-nunito font-700 text-2xl text-charcoal">
                    {score.efficiency_score}<span className="text-lg text-charcoal/40">/20</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Side-by-side comparison */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Your analysis */}
            <div className="bg-white rounded-[16px] p-6 shadow-warm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-charcoal/10 flex items-center justify-center">
                  <span className="font-nunito font-700 text-sm text-charcoal">You</span>
                </div>
                <h3 className="font-nunito font-700 text-lg text-charcoal">Your Analysis</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="font-inter text-xs text-charcoal/50 mb-2">Root Cause</p>
                  <p className="font-inter text-sm text-charcoal/80 bg-cream/50 rounded-lg p-3">
                    {session.investigation_state.hypothesis?.rootCause || 'No answer provided'}
                  </p>
                </div>

                <div>
                  <p className="font-inter text-xs text-charcoal/50 mb-2">Recommended Fix</p>
                  <p className="font-inter text-sm text-charcoal/80 bg-cream/50 rounded-lg p-3">
                    {session.investigation_state.hypothesis?.fix || 'No fix provided'}
                  </p>
                </div>
              </div>
            </div>

            {/* Correct answer */}
            <div className="bg-white rounded-[16px] p-6 shadow-warm border-2 border-teal/20">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-teal/10 flex items-center justify-center">
                  <FiCheck className="w-4 h-4 text-teal" />
                </div>
                <h3 className="font-nunito font-700 text-lg text-charcoal">Correct Answer</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="font-inter text-xs text-charcoal/50 mb-2">Root Cause</p>
                  <p className="font-inter text-sm text-charcoal/80 bg-teal/5 rounded-lg p-3 border border-teal/10">
                    {rcaCase.root_cause}
                  </p>
                </div>

                <div>
                  <p className="font-inter text-xs text-charcoal/50 mb-2">Recommended Fix</p>
                  <p className="font-inter text-sm text-charcoal/80 bg-teal/5 rounded-lg p-3 border border-teal/10">
                    {rcaCase.correct_fix}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Investigation path */}
          <div className="bg-white rounded-[16px] p-6 shadow-warm">
            <h3 className="font-nunito font-700 text-lg text-charcoal mb-4">
              Your Investigation Path
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-cream/30 rounded-lg">
                <span className="font-inter text-sm text-charcoal/70">Data sources viewed</span>
                <span className="font-nunito font-700 text-charcoal">
                  {session.investigation_state.dataRequested.length} / {rcaCase.available_data.length}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-cream/30 rounded-lg">
                <span className="font-inter text-sm text-charcoal/70">5 Whys completed</span>
                <span className="font-nunito font-700 text-charcoal">
                  {session.investigation_state.fiveWhys.filter(w => w.trim().length > 0).length} / 5
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-cream/30 rounded-lg">
                <span className="font-inter text-sm text-charcoal/70">Time spent</span>
                <span className="font-nunito font-700 text-charcoal">
                  {Math.floor(session.investigation_state.timeSpent / 60)}m {session.investigation_state.timeSpent % 60}s
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4">
            <Link href="/rca" className="flex-1">
              <button className="w-full py-4 rounded-lg bg-teal text-white font-nunito font-700 hover:bg-teal/90 transition-colors shadow-warm">
                Try Another Case
              </button>
            </Link>
            <button
              onClick={() => setLocation(`/rca/${caseId}`)}
              className="flex-1 py-4 rounded-lg bg-charcoal/10 text-charcoal font-nunito font-700 hover:bg-charcoal/20 transition-colors"
            >
              Retry This Case
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RCAFeedback;
