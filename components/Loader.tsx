
import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex justify-center items-center p-10">
      <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default Loader;
