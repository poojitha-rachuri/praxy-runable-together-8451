import type { Question, QuestionOption } from '../../types/quiz';

interface QuestionCardProps {
  question: Question;
  selectedAnswer: string | null;
  answerState: 'selecting' | 'correct' | 'incorrect' | null;
  onSelect: (value: string) => void;
}

// Visual comparison: two side-by-side cards with data
const VisualComparisonCard = ({
  options,
  selectedAnswer,
  answerState,
  correctAnswer,
  onSelect,
}: {
  options: QuestionOption[];
  selectedAnswer: string | null;
  answerState: QuestionCardProps['answerState'];
  correctAnswer: string;
  onSelect: (value: string) => void;
}) => {
  const getCardStyle = (value: string) => {
    const isSelected = selectedAnswer === value;
    const isCorrect = value === correctAnswer;

    if (answerState === 'correct' && isSelected) {
      return 'border-mint bg-mint/5 shadow-warm-lg ring-2 ring-mint/30';
    }
    if (answerState === 'incorrect' && isSelected) {
      return 'border-rose bg-rose/5 shadow-warm-lg ring-2 ring-rose/30';
    }
    if (answerState === 'incorrect' && isCorrect) {
      return 'border-mint bg-mint/5 shadow-warm';
    }
    if (isSelected) {
      return 'border-teal bg-teal/5 shadow-warm-lg';
    }
    return 'border-charcoal/10 bg-white hover:border-charcoal/20 hover:shadow-warm';
  };

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {options.map((option) => {
        const data = option.data ? JSON.parse(option.data) : null;
        return (
          <button
            key={option.value}
            onClick={() => !answerState && onSelect(option.value)}
            disabled={!!answerState}
            className={`flex-1 p-4 md:p-5 rounded-[16px] border-2 transition-all text-left ${getCardStyle(option.value)}`}
          >
            <h4 className="font-nunito font-bold text-charcoal text-base md:text-lg mb-3">
              {option.label}
            </h4>
            {data && (
              <div className="space-y-2 mb-4">
                {data.currentAssets && (
                  <div className="flex justify-between text-sm">
                    <span className="font-inter text-charcoal/60">Current Assets:</span>
                    <span className="font-inter font-semibold text-mint">{data.currentAssets}</span>
                  </div>
                )}
                {data.currentLiabilities && (
                  <div className="flex justify-between text-sm">
                    <span className="font-inter text-charcoal/60">Current Liab:</span>
                    <span className="font-inter font-semibold text-orange">{data.currentLiabilities}</span>
                  </div>
                )}
                {data.ratio && (
                  <div className="flex items-center justify-between pt-3 border-t border-charcoal/10">
                    <span className="font-inter text-sm text-charcoal/60">Current Ratio:</span>
                    <span className="font-nunito font-extrabold text-xl text-charcoal">{data.ratio}</span>
                  </div>
                )}
              </div>
            )}
            <div
              className={`py-2 rounded-[8px] text-center font-inter font-semibold text-sm transition-all ${
                selectedAnswer === option.value
                  ? answerState === 'correct'
                    ? 'bg-mint text-white'
                    : answerState === 'incorrect'
                    ? 'bg-rose text-white'
                    : 'gradient-coral text-white'
                  : 'bg-charcoal/5 text-charcoal/60'
              }`}
            >
              {selectedAnswer === option.value ? 'SELECTED ✓' : 'SELECT'}
            </div>
          </button>
        );
      })}
    </div>
  );
};

// Yes/No: two large buttons
const YesNoCard = ({
  options,
  selectedAnswer,
  answerState,
  correctAnswer,
  onSelect,
}: {
  options: QuestionOption[];
  selectedAnswer: string | null;
  answerState: QuestionCardProps['answerState'];
  correctAnswer: string;
  onSelect: (value: string) => void;
}) => {
  const getButtonStyle = (value: string) => {
    const isSelected = selectedAnswer === value;
    const isCorrect = value === correctAnswer;

    if (answerState === 'correct' && isSelected) {
      return 'border-mint bg-mint/5 shadow-warm-lg ring-2 ring-mint/30';
    }
    if (answerState === 'incorrect' && isSelected) {
      return 'border-rose bg-rose/5 shadow-warm-lg ring-2 ring-rose/30';
    }
    if (answerState === 'incorrect' && isCorrect) {
      return 'border-mint bg-mint/5 shadow-warm';
    }
    if (isSelected) {
      return 'border-teal bg-teal/5 shadow-warm-lg';
    }
    return 'border-charcoal/10 bg-white hover:border-charcoal/20 hover:shadow-warm';
  };

  return (
    <div className="flex gap-4">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => !answerState && onSelect(option.value)}
          disabled={!!answerState}
          className={`flex-1 p-5 md:p-6 rounded-[16px] border-2 transition-all ${getButtonStyle(option.value)}`}
        >
          <span className="font-nunito font-bold text-xl md:text-2xl text-charcoal">
            {option.label}
          </span>
          <div
            className={`mt-4 py-2 rounded-[8px] text-center font-inter font-semibold text-sm transition-all ${
              selectedAnswer === option.value
                ? answerState === 'correct'
                  ? 'bg-mint text-white'
                  : answerState === 'incorrect'
                  ? 'bg-rose text-white'
                  : 'gradient-coral text-white'
                : 'bg-charcoal/5 text-charcoal/60'
            }`}
          >
            {selectedAnswer === option.value ? 'SELECTED ✓' : 'SELECT'}
          </div>
        </button>
      ))}
    </div>
  );
};

// Multiple choice: vertical list of options
const MultipleChoiceCard = ({
  options,
  selectedAnswer,
  answerState,
  correctAnswer,
  onSelect,
}: {
  options: QuestionOption[];
  selectedAnswer: string | null;
  answerState: QuestionCardProps['answerState'];
  correctAnswer: string;
  onSelect: (value: string) => void;
}) => {
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

  const getItemStyle = (value: string) => {
    const isSelected = selectedAnswer === value;
    const isCorrect = value === correctAnswer;

    if (answerState === 'correct' && isSelected) {
      return 'border-mint bg-mint/5 shadow-warm';
    }
    if (answerState === 'incorrect' && isSelected) {
      return 'border-rose bg-rose/5 shadow-warm';
    }
    if (answerState === 'incorrect' && isCorrect) {
      return 'border-mint bg-mint/5 shadow-warm';
    }
    if (isSelected) {
      return 'border-teal bg-teal/5 shadow-warm';
    }
    return 'border-charcoal/10 bg-white hover:border-charcoal/20 hover:shadow-warm';
  };

  const getBadgeStyle = (value: string) => {
    const isSelected = selectedAnswer === value;
    const isCorrect = value === correctAnswer;

    if (answerState === 'correct' && isSelected) return 'bg-mint text-white';
    if (answerState === 'incorrect' && isSelected) return 'bg-rose text-white';
    if (answerState === 'incorrect' && isCorrect) return 'bg-mint text-white';
    if (isSelected) return 'gradient-coral text-white';
    return 'bg-charcoal/10 text-charcoal';
  };

  return (
    <div className="space-y-3">
      {options.map((option, index) => (
        <button
          key={option.value}
          onClick={() => !answerState && onSelect(option.value)}
          disabled={!!answerState}
          className={`w-full p-4 rounded-[12px] border-2 transition-all text-left flex items-center gap-3 ${getItemStyle(option.value)}`}
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-nunito font-bold text-lg flex-shrink-0 ${getBadgeStyle(option.value)}`}
          >
            {letters[index]}
          </div>
          <span className="font-inter font-medium text-charcoal text-sm md:text-base">
            {option.label}
          </span>
        </button>
      ))}
    </div>
  );
};

const QuestionCard = ({ question, selectedAnswer, answerState, onSelect }: QuestionCardProps) => {
  return (
    <div className="bg-white rounded-[16px] p-5 md:p-8 shadow-warm animate-fade-in-up delay-100">
      {question.type === 'visual-comparison' && (
        <VisualComparisonCard
          options={question.options}
          selectedAnswer={selectedAnswer}
          answerState={answerState}
          correctAnswer={question.correct_answer}
          onSelect={onSelect}
        />
      )}

      {question.type === 'yes-no' && (
        <YesNoCard
          options={question.options}
          selectedAnswer={selectedAnswer}
          answerState={answerState}
          correctAnswer={question.correct_answer}
          onSelect={onSelect}
        />
      )}

      {question.type === 'multiple-choice' && (
        <MultipleChoiceCard
          options={question.options}
          selectedAnswer={selectedAnswer}
          answerState={answerState}
          correctAnswer={question.correct_answer}
          onSelect={onSelect}
        />
      )}
    </div>
  );
};

export default QuestionCard;
