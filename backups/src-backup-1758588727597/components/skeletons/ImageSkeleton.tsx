import React from 'react';

interface ImageSkeletonProps {
  width?: number;
  height?: number;
  className?: string;
}

const ImageSkeleton: React.FC<ImageSkeletonProps> = ({ 
  width = 300, 
  height = 200, 
  className 
}) => {
  return (
    <div 
      className={`bg-gray-200 animate-pulse rounded ${className || ''}`}
      style={{ width, height }}
    />
  );
};

export default ImageSkeleton;
