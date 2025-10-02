import React from 'react';

interface CardSkeletonProps {
  className?: string;
}

const CardSkeleton: React.FC<CardSkeletonProps> = ({ className }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className || ''}`}>
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-32 bg-gray-200 rounded mb-4"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
  );
};

export default CardSkeleton;
