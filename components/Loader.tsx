import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center p-10 text-center">
      <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-lg text-gray-300">در حال دریافت و تحلیل داده‌های آب و هوا...</p>
      <p className="text-sm text-gray-500">این فرآیند ممکن است چند لحظه طول بکشد.</p>
    </div>
  );
};

export default Loader;