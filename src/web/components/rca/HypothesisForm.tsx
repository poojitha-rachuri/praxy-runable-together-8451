import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

interface HypothesisFormProps {
  rootCause: string;
  fix: string;
  confidence: 'low' | 'medium' | 'high';
  onRootCauseChange: (value: string) => void;
  onFixChange: (value: string) => void;
  onConfidenceChange: (value: 'low' | 'medium' | 'high') => void;
  onSubmit: () => void;
  canSubmit: boolean;
  submitting: boolean;
}

const HypothesisForm = ({
  rootCause,
  fix,
  confidence,
  onRootCauseChange,
  onFixChange,
  onConfidenceChange,
  onSubmit,
  canSubmit,
  submitting,
}: HypothesisFormProps) => {
  const isFormValid = rootCause.trim().length > 20 && fix.trim().length > 20;

  const confidenceLevels = [
    { value: 'low' as const, label: 'Low', color: 'coral' },
    { value: 'medium' as const, label: 'Medium', color: 'yellow-600' },
    { value: 'high' as const, label: 'High', color: 'teal' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-nunito font-700 text-lg text-charcoal">
          Your Hypothesis
        </h3>
      </div>

      <p className="font-inter text-sm text-charcoal/60">
        Based on your investigation, what's your conclusion?
      </p>

      {/* Root Cause */}
      <div className="space-y-2">
        <label className="block font-inter font-600 text-sm text-charcoal">
          What is the root cause? *
        </label>
        <textarea
          value={rootCause}
          onChange={(e) => onRootCauseChange(e.target.value)}
          placeholder="Describe the fundamental reason behind the problem (min 20 characters)..."
          className="w-full p-4 rounded-lg border-2 border-charcoal/20 bg-white text-charcoal font-inter text-sm resize-none focus:border-teal focus:outline-none"
          rows={4}
        />
        <p className="font-inter text-xs text-charcoal/50">
          {rootCause.length} / 20 minimum characters
        </p>
      </div>

      {/* Recommended Fix */}
      <div className="space-y-2">
        <label className="block font-inter font-600 text-sm text-charcoal">
          What fix do you recommend? *
        </label>
        <textarea
          value={fix}
          onChange={(e) => onFixChange(e.target.value)}
          placeholder="Describe your recommended solution to fix this issue (min 20 characters)..."
          className="w-full p-4 rounded-lg border-2 border-charcoal/20 bg-white text-charcoal font-inter text-sm resize-none focus:border-teal focus:outline-none"
          rows={4}
        />
        <p className="font-inter text-xs text-charcoal/50">
          {fix.length} / 20 minimum characters
        </p>
      </div>

      {/* Confidence Level */}
      <div className="space-y-2">
        <label className="block font-inter font-600 text-sm text-charcoal">
          Confidence Level
        </label>
        <div className="flex gap-3">
          {confidenceLevels.map((level) => (
            <button
              key={level.value}
              onClick={() => onConfidenceChange(level.value)}
              className={`flex-1 py-3 px-4 rounded-lg border-2 font-inter font-600 text-sm transition-all ${
                confidence === level.value
                  ? `border-${level.color} bg-${level.color}/10 text-${level.color}`
                  : 'border-charcoal/20 bg-white text-charcoal/60 hover:border-charcoal/40'
              }`}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>

      {/* Validation messages */}
      {!canSubmit && (
        <div className="flex items-start gap-2 p-3 bg-coral/10 rounded-lg border border-coral/20">
          <FiAlertCircle className="w-5 h-5 text-coral flex-shrink-0 mt-0.5" />
          <div className="font-inter text-sm text-charcoal/80">
            <p className="font-600 mb-1">Can't submit yet</p>
            <ul className="text-xs space-y-1 text-charcoal/70">
              <li>• Complete at least 3 "whys" in the investigation</li>
              <li>• Root cause must be at least 20 characters</li>
              <li>• Recommended fix must be at least 20 characters</li>
            </ul>
          </div>
        </div>
      )}

      {canSubmit && isFormValid && (
        <div className="flex items-start gap-2 p-3 bg-teal/10 rounded-lg border border-teal/20">
          <FiCheckCircle className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
          <p className="font-inter text-sm text-teal">
            Ready to submit! Review your analysis and click below.
          </p>
        </div>
      )}

      {/* Submit button */}
      <button
        onClick={onSubmit}
        disabled={!canSubmit || !isFormValid || submitting}
        className={`w-full py-4 rounded-lg font-nunito font-700 text-lg transition-all ${
          canSubmit && isFormValid && !submitting
            ? 'bg-coral text-white hover:bg-coral/90 shadow-warm hover:shadow-warm-lg'
            : 'bg-charcoal/20 text-charcoal/40 cursor-not-allowed'
        }`}
      >
        {submitting ? 'Analyzing...' : 'Submit Analysis'}
      </button>
    </div>
  );
};

export default HypothesisForm;
