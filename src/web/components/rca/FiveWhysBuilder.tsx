import { FiChevronDown } from 'react-icons/fi';
import PraxyAvatar from '../ui/PraxyAvatar';

interface FiveWhysBuilderProps {
  whys: string[];
  onChange: (whys: string[]) => void;
}

const FiveWhysBuilder = ({ whys, onChange }: FiveWhysBuilderProps) => {
  const handleWhyChange = (index: number, value: string) => {
    const newWhys = [...whys];
    newWhys[index] = value;
    onChange(newWhys);
  };

  const getPraxyPrompt = (index: number) => {
    const prompts = [
      "Start with the symptom. What exactly happened?",
      "Good! Now dig deeper. Why did that happen?",
      "You're getting closer. What caused that?",
      "Almost there! Keep digging into the root cause.",
      "One more level! What's the fundamental reason?",
    ];
    return prompts[index] || "Great work!";
  };

  const getPlaceholder = (index: number) => {
    const placeholders = [
      "e.g., Web traffic dropped 35%",
      "e.g., Users couldn't log in",
      "e.g., Authentication error in web app",
      "e.g., Recent deployment broke auth.js",
      "e.g., Missing error handling in auth flow",
    ];
    return placeholders[index] || "Type your answer...";
  };

  // Count filled whys
  const filledWhys = whys.filter(why => why.trim().length > 0).length;
  const isMinimumMet = filledWhys >= 3;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-nunito font-700 text-lg text-charcoal">
          Build Your 5 Whys Chain
        </h3>
      </div>

      <p className="font-inter text-sm text-charcoal/60 mb-6">
        Use the "5 Whys" technique to dig into the root cause. Ask "why" repeatedly to uncover deeper issues.
      </p>

      {/* Why chain */}
      <div className="space-y-4">
        {[0, 1, 2, 3, 4].map((index) => {
          const isFilled = whys[index] && whys[index].trim().length > 0;
          const isActive = index === 0 || (whys[index - 1] && whys[index - 1].trim().length > 0);

          return (
            <div key={index} className={`transition-opacity ${isActive ? 'opacity-100' : 'opacity-40'}`}>
              {/* Why number + connecting line */}
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-nunito font-700 text-sm ${
                    isFilled ? 'bg-teal text-white' : 'bg-charcoal/10 text-charcoal/50'
                  }`}>
                    {index + 1}
                  </div>
                  {index < 4 && (
                    <FiChevronDown className="w-5 h-5 text-charcoal/20 my-2" />
                  )}
                </div>

                <div className="flex-1">
                  {/* Praxy prompt */}
                  {isActive && (
                    <div className="flex items-start gap-2 mb-2">
                      <PraxyAvatar size={32} expression="encouraging" />
                      <p className="font-inter text-sm text-charcoal/70 italic pt-1">
                        "{getPraxyPrompt(index)}"
                      </p>
                    </div>
                  )}

                  {/* Input */}
                  <textarea
                    value={whys[index] || ''}
                    onChange={(e) => handleWhyChange(index, e.target.value)}
                    disabled={!isActive}
                    placeholder={isActive ? getPlaceholder(index) : 'Complete previous why first'}
                    className={`w-full p-3 rounded-lg border-2 font-inter text-sm resize-none transition-all ${
                      isFilled
                        ? 'border-teal/30 bg-white text-charcoal'
                        : isActive
                        ? 'border-charcoal/20 bg-white text-charcoal placeholder:text-charcoal/40 focus:border-teal focus:outline-none'
                        : 'border-charcoal/10 bg-charcoal/5 text-charcoal/30 cursor-not-allowed'
                    }`}
                    rows={2}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress indicator */}
      <div className="mt-6 p-4 bg-cream/50 rounded-lg border border-charcoal/10">
        <div className="flex items-center justify-between mb-2">
          <p className="font-inter text-sm text-charcoal/70">
            Progress: {filledWhys} / 5 whys completed
          </p>
          {isMinimumMet && (
            <span className="px-3 py-1 rounded-full text-xs font-inter font-600 bg-teal/10 text-teal">
              ✓ Minimum met (3+ whys)
            </span>
          )}
        </div>
        <div className="w-full h-2 bg-charcoal/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-teal transition-all duration-300"
            style={{ width: `${(filledWhys / 5) * 100}%` }}
          />
        </div>
      </div>

      {!isMinimumMet && (
        <p className="font-inter text-xs text-charcoal/50 text-center">
          Complete at least 3 "whys" before moving to the hypothesis
        </p>
      )}
    </div>
  );
};

export default FiveWhysBuilder;
