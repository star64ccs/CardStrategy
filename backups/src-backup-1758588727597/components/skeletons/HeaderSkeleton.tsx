import React from 'react';

interface HeaderSkeletonProps {
  className?: string;
}

const HeaderSkeleton: React.FC<HeaderSkeletonProps> = ({ className }) => {
  return (
    <div className={`animate-pulse ${className || ''}`}>
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  );
};

export default HeaderSkeleton;
