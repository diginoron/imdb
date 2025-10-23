import React from 'react';

interface AiInterpretationProps {
  aiInterpretation: string;
  isLoading: boolean;
}

const AiInterpretation: React.FC<AiInterpretationProps> = ({ aiInterpretation, isLoading }) => {
  return (
    <section aria-labelledby="ai-interpretation-heading" className="bg-gray-700/50 p-6 rounded-xl shadow-lg min-h-[150px]">
      <h2 id="ai-interpretation-heading" className="text-2xl font-semibold mb-4 text-cyan-300 flex items-center gap-3" dir="rtl">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M12 21v-1m0-16a7 7 0 110 14 7 7 0 010-14z" />
        </svg>
        تحلیل هوش مصنوعی
      </h2>
      {isLoading ? (
        <div className="flex items-center justify-center h-24 text-gray-400">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-cyan-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>در حال دریافت تحلیل هوشمند...</span>
        </div>
      ) : (
        <p className="text-gray-300 leading-relaxed text-right whitespace-pre-line" dir="rtl">
          {aiInterpretation}
        </p>
      )}
    </section>
  );
};

export default AiInterpretation;
