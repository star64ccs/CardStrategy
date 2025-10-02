import React from 'react';

interface ListSkeletonProps {
  items?: number;
  className?: string;
}

const ListSkeleton: React.FC<ListSkeletonProps> = ({ items = 5, className }) => {
  return (
    <div className={`space-y-3 ${className || ''}`}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  );
};

export default ListSkeleton;
