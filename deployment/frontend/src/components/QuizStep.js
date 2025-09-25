import React, { useEffect, useRef } from "react";
// GSAP removed for minimal transitions

const QuizStep = ({
  step,
  value,
  onResponse,
  onNext,
  onPrevious,
  canProceed,
  isFirst,
  isLast,
  loading,
}) => {
  const stepRef = useRef(null);
  const optionsRef = useRef([]);

  useEffect(() => {}, [step]);

  const handleOptionClick = (optionValue) => {
    if (step.type === "single") {
      onResponse(step.id, optionValue);
    } else if (step.type === "multiple") {
      const currentValues = value || [];
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter((v) => v !== optionValue)
        : [...currentValues, optionValue];
      onResponse(step.id, newValues);
    }
  };

  const isSelected = (optionValue) => {
    if (step.type === "single") {
      return value === optionValue;
    } else if (step.type === "multiple") {
      return value && value.includes(optionValue);
    }
    return false;
  };

  const getSelectedCount = () => {
    if (step.type === "multiple" && value) {
      return value.length;
    }
    return 0;
  };

  return (
    <div ref={stepRef} className="max-w-4xl mx-auto">
      {/* Step Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-pink-600 mb-4">
          {step.title}
        </h2>
        <p className="text-lg text-pink-500 mb-2">{step.subtitle}</p>
        {step.type === "multiple" && getSelectedCount() > 0 && (
          <p className="text-sm text-pink-400">
            {getSelectedCount()} selected
          </p>
        )}
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {step.options.map((option, index) => (
          <div
            key={option.value}
            ref={(el) => (optionsRef.current[index] = el)}
            onClick={() => handleOptionClick(option.value)}
            className={`relative cursor-pointer p-6 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] ${
              isSelected(option.value)
                ? "border-pink-500 bg-pink-100 shadow-md"
                : "border-pink-200 bg-white hover:border-pink-400 hover:bg-pink-50"
            }`}
          >
            {/* Selection Indicator */}
            <div className="absolute top-4 right-4">
              {isSelected(option.value) ? (
                <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
              ) : (
                <div className="w-6 h-6 border-2 border-pink-300 rounded-full" />
              )}
            </div>

            {/* Option Content */}
            <div className="pr-8">
              {option.icon && (
                <div className="text-3xl mb-3">{option.icon}</div>
              )}
              <h3 className="text-lg font-semibold text-pink-700 mb-2">
                {option.label}
              </h3>
              {option.description && (
                <p className="text-sm text-pink-500 leading-relaxed">
                  {option.description}
                </p>
              )}
            </div>

          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={onPrevious}
          disabled={isFirst || loading}
          className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
            isFirst || loading
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-white text-pink-600 border-2 border-pink-300 hover:bg-pink-50 hover:border-pink-400"
          }`}
        >
          ← Previous
        </button>

        <div className="text-center">
          <p className="text-sm text-pink-500 mb-2">
            {step.type === "multiple" ? "Select all that apply" : "Choose one option"}
          </p>
        </div>

        <button
          onClick={onNext}
          disabled={!canProceed || loading}
          className={`px-8 py-3 rounded-full font-semibold transition-all duration-200 ${
            !canProceed || loading
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-pink-500 text-white hover:bg-pink-600 shadow-md hover:shadow-lg"
          }`}
        >
          {isLast ? "Get My Results" : "Next →"}
        </button>
      </div>

      {/* Step Instructions */}
      <div className="mt-8 text-center">
        <p className="text-sm text-pink-400">
          {step.type === "multiple" ? (
            <>
              💡 <strong>Tip:</strong> You can select multiple options that apply to you
            </>
          ) : (
            <>
              💡 <strong>Tip:</strong> Choose the option that best describes you
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default QuizStep;
