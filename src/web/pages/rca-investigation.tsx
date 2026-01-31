import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useUser } from '@clerk/clerk-react';
import { FiArrowLeft, FiHelpCircle } from 'react-icons/fi';
import PraxyMascot from '../components/praxy-mascot';
import DataRequestPanel from '../components/rca/DataRequestPanel';
import FiveWhysBuilder from '../components/rca/FiveWhysBuilder';
import HypothesisForm from '../components/rca/HypothesisForm';
import { getCaseById, submitAnalysis, type RCACase, type InvestigationState } from '../lib/rca';
import { setClerkId } from '../lib/api';

const RCAInvestigation = () => {
  const [, params] = useRoute('/rca/:caseId');
  const [, setLocation] = useLocation();
  const { user } = useUser();
  const caseId = params?.caseId;

  // Ensure clerkId is set for API calls
  useEffect(() => {
    if (user?.id) {
      setClerkId(user.id);
    }
  }, [user?.id]);

  const [rcaCase, setRcaCase] = useState<RCACase | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'5whys' | 'hypothesis'>('5whys');
  const [startTime] = useState(Date.now());
  const [showHint, setShowHint] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Investigation state
  const [dataRequested, setDataRequested] = useState<string[]>([]);
  const [fiveWhys, setFiveWhys] = useState<string[]>(Array(5).fill(''));
  const [hypothesis, setHypothesis] = useState({
    rootCause: '',
    fix: '',
    confidence: 'medium' as const,
  });

  useEffect(() => {
    const loadCase = async () => {
      if (!caseId) return;
      
      setLoading(true);
      const caseData = await getCaseById(caseId);
      setRcaCase(caseData);
      setLoading(false);
    };

    loadCase();
  }, [caseId]);

  const handleDataRequest = (dataId: string) => {
    setDataRequested(prev => [...prev, dataId]);
  };

  const handleSubmit = async () => {
    if (!rcaCase || !caseId) return;

    setSubmitting(true);
    
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const investigationState: InvestigationState = {
      dataRequested,
      fiveWhys,
      fishboneCauses: [],
      hypothesis: {
        rootCause: hypothesis.rootCause,
        fix: hypothesis.fix,
        confidence: hypothesis.confidence,
      },
      timeSpent,
    };

    const result = await submitAnalysis(caseId, investigationState);
    
    if (result.success && result.sessionId) {
      // Navigate to feedback page
      setLocation(`/rca/${caseId}/feedback?sessionId=${result.sessionId}`);
    } else {
      alert('Failed to submit analysis. Please try again.');
      setSubmitting(false);
    }
  };

  // Check if user can submit
  const filledWhys = fiveWhys.filter(why => why.trim().length > 0).length;
  const canSubmit = filledWhys >= 3 && 
                    hypothesis.rootCause.trim().length > 20 && 
                    hypothesis.fix.trim().length > 20;

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <PraxyMascot size={80} expression="thinking" waving={false} />
          <p className="font-inter text-charcoal/60 mt-4">Loading case...</p>
        </div>
      </div>
    );
  }

  if (!rcaCase) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <p className="font-inter text-charcoal/60">Case not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="py-4 px-6 md:px-12 bg-cream/80 backdrop-blur-sm border-b border-charcoal/5 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => setLocation('/rca')}
            className="p-2 hover:bg-charcoal/5 rounded-lg transition-colors flex items-center gap-2"
          >
            <FiArrowLeft className="w-5 h-5 text-charcoal" />
            <span className="font-inter text-sm text-charcoal">Back to Cases</span>
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-teal/10 hover:bg-teal/20 transition-colors"
            >
              <FiHelpCircle className="w-4 h-4 text-teal" />
              <span className="font-inter text-sm text-teal font-600">
                {showHint ? 'Hide Hint' : 'Need a Hint?'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="py-6 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Problem statement card */}
          <div className="bg-white rounded-[16px] p-6 shadow-warm mb-6">
            <div className="flex items-start gap-4">
              <PraxyMascot size={60} expression="happy" />
              <div className="flex-1">
                <p className="font-inter text-sm text-teal font-600 mb-1">
                  {rcaCase.company_name}
                </p>
                <h2 className="font-nunito font-700 text-2xl text-charcoal mb-2">
                  {rcaCase.title}
                </h2>
                <p className="font-inter text-lg text-coral font-600 mb-3">
                  {rcaCase.metric_name} dropped {rcaCase.metric_drop}
                  {rcaCase.time_period && ` over ${rcaCase.time_period}`}
                </p>
                <p className="font-inter text-charcoal/70">
                  Let's investigate together. What data do you want to look at first?
                </p>
              </div>
            </div>
          </div>

          {/* Hint card (conditional) */}
          {showHint && (
            <div className="bg-teal/5 border border-teal/20 rounded-[16px] p-4 mb-6 animate-fadeIn">
              <p className="font-inter text-sm text-charcoal/70">
                <span className="font-600 text-teal">💡 Hint:</span> Start by looking at how the metric breaks down by different dimensions (platform, region, time, etc.). Look for patterns that stand out.
              </p>
            </div>
          )}

          {/* Two-column layout */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Data panel (takes 1 column) */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-[16px] p-6 shadow-warm sticky top-24">
                <DataRequestPanel
                  availableData={rcaCase.available_data}
                  requestedData={dataRequested}
                  onDataRequest={handleDataRequest}
                />
              </div>
            </div>

            {/* Right: Investigation tools (takes 2 columns) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tab navigation */}
              <div className="flex gap-2 bg-white rounded-[16px] p-2 shadow-sm">
                <button
                  onClick={() => setActiveTab('5whys')}
                  className={`flex-1 py-3 px-4 rounded-lg font-inter font-600 text-sm transition-all ${
                    activeTab === '5whys'
                      ? 'bg-coral text-white shadow-sm'
                      : 'text-charcoal/60 hover:text-charcoal hover:bg-charcoal/5'
                  }`}
                >
                  1. Build 5 Whys Chain
                </button>
                <button
                  onClick={() => setActiveTab('hypothesis')}
                  className={`flex-1 py-3 px-4 rounded-lg font-inter font-600 text-sm transition-all ${
                    activeTab === 'hypothesis'
                      ? 'bg-coral text-white shadow-sm'
                      : 'text-charcoal/60 hover:text-charcoal hover:bg-charcoal/5'
                  }`}
                >
                  2. Submit Hypothesis
                </button>
              </div>

              {/* Tab content */}
              <div className="bg-white rounded-[16px] p-6 shadow-warm min-h-[600px]">
                {activeTab === '5whys' && (
                  <FiveWhysBuilder
                    whys={fiveWhys}
                    onChange={setFiveWhys}
                  />
                )}

                {activeTab === 'hypothesis' && (
                  <HypothesisForm
                    rootCause={hypothesis.rootCause}
                    fix={hypothesis.fix}
                    confidence={hypothesis.confidence}
                    onRootCauseChange={(value) => setHypothesis(prev => ({ ...prev, rootCause: value }))}
                    onFixChange={(value) => setHypothesis(prev => ({ ...prev, fix: value }))}
                    onConfidenceChange={(value) => setHypothesis(prev => ({ ...prev, confidence: value }))}
                    onSubmit={handleSubmit}
                    canSubmit={canSubmit}
                    submitting={submitting}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RCAInvestigation;
