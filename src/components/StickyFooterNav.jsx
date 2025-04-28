import React from "react";

export default function StickyFooterNav({ step, totalSteps, onNext, onBack, isLoading, discountedTotal }) {
  return (
    <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow z-50">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between w-full">
        {/* Progress Bar */}
        <div className="flex-1 mr-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#124CA0] h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-1">Step {step} of {totalSteps}</p>f
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          {step > 1 && (
            <button
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded font-medium"
              onClick={onBack}
            >
              Back
            </button>
          )}
          <button
            className="bg-[#124CA0] text-white px-6 py-2 rounded font-bold flex items-center justify-center min-w-[100px]"
            onClick={onNext}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2 justify-center">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Loading...
              </span>
            ) : step === 4 ? (
              `Reserve Now: $${Math.round(discountedTotal)}`
            ) : step === 3 ? (
              "Reserve Now"
            ) : step === 1 ? (
              "Get Pricing"
            ) : (
              "Next"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
