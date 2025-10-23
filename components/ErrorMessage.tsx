import React from 'react';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative text-right" role="alert" dir="rtl">
      <strong className="font-bold">خطا: </strong>
      <span className="block sm:inline">{message}</span>
    </div>
  );
};

export default ErrorMessage;