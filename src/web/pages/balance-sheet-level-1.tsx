import { Link } from "wouter";
import PraxyMascot from "../components/praxy-mascot";

// Step indicator component
interface StepIndicatorProps {
  currentStep: "learn" | "quiz" | "complete";
}

const StepIndicator = ({ currentStep }: StepIndicatorProps) => {
  const steps = [
    { id: "learn", label: "Learn" },
    { id: "quiz", label: "Quiz" },
    { id: "complete", label: "Complete" },
  ];

  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isPast = steps.findIndex(s => s.id === currentStep) > index;
        
        return (
          <div key={step.id} className="flex items-center">
            {/* Step dot and label */}
            <div className="flex flex-col items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-inter font-600 transition-all ${
                  isActive 
                    ? "gradient-coral text-white shadow-warm" 
                    : isPast 
                      ? "bg-mint text-white" 
                      : "bg-charcoal/10 text-charcoal/40"
                }`}
              >
                {isPast ? "✓" : index + 1}
              </div>
              <span 
                className={`text-xs mt-1 font-inter ${
                  isActive 
                    ? "text-coral font-600" 
                    : isPast 
                      ? "text-mint font-500" 
                      : "text-charcoal/40 font-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div 
                className={`w-8 md:w-12 h-0.5 mx-1 mt-[-16px] ${
                  isPast ? "bg-mint" : "bg-charcoal/10"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

// Balance sheet item row
interface BalanceItemProps {
  label: string;
  value: string;
  isTotal?: boolean;
}

const BalanceItem = ({ label, value, isTotal = false }: BalanceItemProps) => (
  <div className={`flex justify-between items-center py-2 ${isTotal ? "border-t-2 border-current pt-3 mt-2" : ""}`}>
    <span className={`font-inter ${isTotal ? "font-700" : "font-400"} text-sm md:text-base`}>
      {label}
    </span>
    <span className={`font-inter ${isTotal ? "font-800 text-lg" : "font-500"}`}>
      {value}
    </span>
  </div>
);

// Threshold badge component
interface ThresholdBadgeProps {
  color: "green" | "yellow" | "red";
  range: string;
  label: string;
}

const ThresholdBadge = ({ color, range, label }: ThresholdBadgeProps) => {
  const colorClasses = {
    green: "bg-mint/15 border-mint/30 text-mint",
    yellow: "bg-yellow/20 border-yellow/40 text-orange",
    red: "bg-rose/15 border-rose/30 text-rose",
  };

  const emoji = {
    green: "🟢",
    yellow: "🟡",
    red: "🔴",
  };

  return (
    <div className={`flex-1 px-3 py-3 rounded-[12px] border ${colorClasses[color]} text-center`}>
      <div className="text-lg mb-1">{emoji[color]}</div>
      <div className="font-inter font-700 text-sm">{range}</div>
      <div className="font-inter font-400 text-xs mt-1 opacity-80">{label}</div>
    </div>
  );
};

const BalanceSheetLevel1 = () => {
  return (
    <div className="min-h-screen bg-cream">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-coral/5 rounded-full blur-3xl" />
        <div className="absolute top-60 right-10 w-80 h-80 bg-yellow/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-1/3 w-72 h-72 bg-mint/8 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative py-4 px-4 md:px-12 border-b border-charcoal/10 bg-cream/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          {/* Top row: back button and title */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link href="/balance-sheet">
                <button className="w-10 h-10 rounded-full bg-white shadow-warm hover:shadow-warm-lg transition-all flex items-center justify-center hover:-translate-x-0.5">
                  <svg 
                    className="w-5 h-5 text-charcoal" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </Link>
              <h1 className="font-nunito font-700 text-base md:text-lg text-charcoal">
                Level 1: The Liquidity Check
              </h1>
            </div>
          </div>
          
          {/* Step indicator */}
          <StepIndicator currentStep="learn" />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative py-8 md:py-10 px-4 md:px-12 lg:px-20">
        <div className="max-w-3xl mx-auto">
          
          {/* Praxy Teaching Card */}
          <div className="mb-8 opacity-0 animate-fade-in-up">
            <div className="flex items-start gap-4 md:gap-5">
              {/* Mascot Avatar */}
              <div className="flex-shrink-0 pt-1">
                <PraxyMascot size={80} waving={false} />
              </div>
              
              {/* Speech Bubble */}
              <div className="relative flex-1">
                <div className="gradient-coral rounded-[16px] p-4 md:p-5 shadow-warm">
                  <p className="font-inter font-500 text-white text-sm md:text-base leading-relaxed">
                    First things first — is this company even alive? Let's check if they can pay their bills this year.
                  </p>
                </div>
                {/* Speech bubble arrow */}
                <div 
                  className="absolute left-0 top-6 -translate-x-2 w-0 h-0"
                  style={{
                    borderTop: '8px solid transparent',
                    borderBottom: '8px solid transparent',
                    borderRight: '10px solid #FF6B6B',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Concept Card */}
          <div className="bg-white rounded-[16px] p-6 md:p-8 shadow-warm mb-8 opacity-0 animate-fade-in-up delay-100">
            <div className="text-center mb-6">
              <span className="inline-block px-4 py-1.5 bg-coral/10 text-coral text-xs font-inter font-700 uppercase tracking-wider rounded-full mb-4">
                Key Concept
              </span>
              <h2 className="font-nunito font-800 text-2xl md:text-3xl text-charcoal mb-2">
                THE CURRENT RATIO
              </h2>
            </div>
            
            {/* Formula Box */}
            <div className="bg-gradient-to-br from-charcoal to-charcoal/90 rounded-[12px] p-5 md:p-6 mb-6">
              <div className="text-center">
                <p className="font-inter font-400 text-white/60 text-xs uppercase tracking-widest mb-3">
                  Formula
                </p>
                <p className="font-nunito font-700 text-xl md:text-2xl text-white">
                  Current Ratio = <span className="text-mint">Current Assets</span> ÷ <span className="text-orange">Current Liabilities</span>
                </p>
              </div>
            </div>
            
            {/* What it tells you */}
            <div className="text-center">
              <p className="font-inter font-500 text-charcoal/70 text-base">
                <span className="text-teal font-600">What it tells you:</span> Can this company pay its short-term bills?
              </p>
            </div>
          </div>

          {/* Tesla Balance Sheet Visual */}
          <div className="bg-white rounded-[16px] p-5 md:p-8 shadow-warm mb-8 opacity-0 animate-fade-in-up delay-200">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-charcoal/5 rounded-full mb-2">
                <span className="text-xl">🚗</span>
                <span className="font-nunito font-700 text-charcoal text-sm md:text-base">TESLA</span>
              </div>
              <h3 className="font-nunito font-700 text-lg md:text-xl text-charcoal">
                Balance Sheet (2024)
              </h3>
            </div>
            
            {/* Two columns */}
            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              {/* Left column - Assets */}
              <div className="bg-mint/8 border-2 border-mint/20 rounded-[12px] p-4 md:p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-nunito font-700 text-mint text-sm md:text-base uppercase tracking-wide">
                    Current Assets
                  </h4>
                  <span className="text-lg">🟢</span>
                </div>
                <p className="font-inter font-400 text-xs text-mint/70 mb-4 uppercase tracking-wider">
                  What they HAVE
                </p>
                
                <div className="text-mint">
                  <BalanceItem label="Cash" value="$16.4B" />
                  <BalanceItem label="Receivables" value="$3.0B" />
                  <BalanceItem label="Inventory" value="$14.7B" />
                  <BalanceItem label="Other" value="$1.8B" />
                  <BalanceItem label="TOTAL" value="$35.9B" isTotal />
                </div>
              </div>
              
              {/* Right column - Liabilities */}
              <div className="bg-orange/8 border-2 border-orange/20 rounded-[12px] p-4 md:p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-nunito font-700 text-orange text-sm md:text-base uppercase tracking-wide">
                    Current Liabilities
                  </h4>
                  <span className="text-lg">🟠</span>
                </div>
                <p className="font-inter font-400 text-xs text-orange/70 mb-4 uppercase tracking-wider">
                  What they OWE this year
                </p>
                
                <div className="text-orange">
                  <BalanceItem label="Payables" value="$14.4B" />
                  <BalanceItem label="Accrued" value="$5.3B" />
                  <BalanceItem label="Deferred" value="$1.8B" />
                  <BalanceItem label="" value="" />
                  <BalanceItem label="TOTAL" value="$21.5B" isTotal />
                </div>
              </div>
            </div>
          </div>

          {/* Big Calculation Display */}
          <div className="bg-gradient-to-br from-charcoal via-charcoal/95 to-charcoal rounded-[16px] p-6 md:p-8 shadow-warm-lg mb-8 opacity-0 animate-fade-in-up delay-300">
            <div className="text-center">
              <p className="font-inter font-400 text-white/50 text-xs uppercase tracking-widest mb-4">
                The Calculation
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-6">
                <span className="font-nunito font-700 text-white text-lg md:text-xl">CURRENT RATIO</span>
                <span className="text-white/50">=</span>
                <span className="font-nunito font-700 text-mint text-lg md:text-xl">$35.9B</span>
                <span className="text-white/50">÷</span>
                <span className="font-nunito font-700 text-orange text-lg md:text-xl">$21.5B</span>
              </div>
              
              {/* Big result */}
              <div className="inline-flex items-center gap-4 px-6 md:px-8 py-4 bg-white/10 rounded-[12px] backdrop-blur-sm">
                <span className="font-nunito font-800 text-4xl md:text-5xl text-white">
                  1.67
                </span>
                <div className="flex items-center gap-2 px-4 py-2 bg-mint rounded-full shadow-lg">
                  <span className="text-xl">🟢</span>
                  <span className="font-nunito font-700 text-white text-sm md:text-base">HEALTHY</span>
                </div>
              </div>
            </div>
          </div>

          {/* Threshold Legend */}
          <div className="mb-8 opacity-0 animate-fade-in-up delay-400">
            <p className="font-inter font-600 text-charcoal/70 text-center text-sm mb-4 uppercase tracking-wider">
              How to read the ratio
            </p>
            <div className="flex gap-3">
              <ThresholdBadge 
                color="green" 
                range="Above 1.5" 
                label="Healthy — Comfortable buffer" 
              />
              <ThresholdBadge 
                color="yellow" 
                range="1.0 to 1.5" 
                label="Acceptable — Tight but okay" 
              />
              <ThresholdBadge 
                color="red" 
                range="Below 1.0" 
                label="Danger — Owes more than it has" 
              />
            </div>
          </div>

          {/* Praxy Insight Card */}
          <div className="bg-teal rounded-[16px] p-6 md:p-8 shadow-warm mb-10 opacity-0 animate-fade-in-up delay-500">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-2xl">💡</span>
              <h3 className="font-nunito font-700 text-xl text-white uppercase tracking-wide">
                The Insight
              </h3>
            </div>
            
            <div className="space-y-4">
              <p className="font-inter font-400 text-white/95 text-base leading-relaxed">
                Tesla has <span className="font-700">$1.67 for every $1</span> they owe this year. They can comfortably pay their short-term bills. That's a healthy company!
              </p>
              <div className="flex items-start gap-2 p-4 bg-white/10 rounded-[8px] backdrop-blur-sm">
                <span className="text-lg mt-0.5">📝</span>
                <p className="font-inter font-500 text-white/90 text-sm leading-relaxed">
                  <span className="font-700">Remember:</span> Current Ratio is your first health check. If it's below 1.0, that's a red flag.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center opacity-0 animate-fade-in-up delay-600">
            <Link href="/balance-sheet/level/1/quiz">
              <button className="gradient-coral text-white font-inter font-600 text-base md:text-lg px-8 md:px-10 py-4 rounded-[8px] shadow-warm hover:shadow-warm-lg transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98]">
                Got it! Take me to the Quiz →
              </button>
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
};

export default BalanceSheetLevel1;
