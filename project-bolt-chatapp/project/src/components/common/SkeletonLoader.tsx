import React from 'react';

interface SkeletonProps {
  count?: number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({ 
  count = 1, 
  className = "w-full h-20" 
}) => {
  return (
    <>
      {Array(count)
        .fill(0)
        .map((_, index) => (
          <div
            key={index}
            className={`animate-pulse bg-gray-700/50 rounded-lg ${className} mb-4`}
          />
        ))}
    </>
  );
};