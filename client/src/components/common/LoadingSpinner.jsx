// src/components/common/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({ size = 'default', color = 'blue' }) => {
  const sizeClasses = {
    small: 'w-5 h-5',
    default: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const colorClasses = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    amber: 'text-amber-500',
    red: 'text-red-500',
    gray: 'text-gray-500'
  };

  const selectedSize = sizeClasses[size] || sizeClasses.default;
  const selectedColor = colorClasses[color] || colorClasses.blue;

  return (
    <div className="flex justify-center items-center">
      <svg
        className={`animate-spin ${selectedSize} ${selectedColor}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
  );
};

export default LoadingSpinner;