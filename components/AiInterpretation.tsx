
import React from 'react';

interface AiInterpretationProps {
  aiInterpretation: string;
}

const AiInterpretation: React.FC<AiInterpretationProps> = ({ aiInterpretation }) => {
  return (
    <section aria-labelledby="ai-interpretation-heading" className="bg-gray-700/50 p-6 rounded-xl shadow-lg">
      <h2 id="ai-interpretation-heading" className="text-2xl font-semibold mb-4 text-cyan-300 flex items-center gap-3" dir="rtl">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M12 21v-1m0-16a7 7 0 110 14 7 7 0 010-14z" />
        </svg>
        تحلیل هوش مصنوعی
      </h2>
      <p className="text-gray-300 leading-relaxed text-right whitespace-pre-line" dir="rtl">
        {aiInterpretation}
      </p>
    </section>
  );
};

export default AiInterpretation;
