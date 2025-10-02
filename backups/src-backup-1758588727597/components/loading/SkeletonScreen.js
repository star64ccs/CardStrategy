import React from 'react';

const SkeletonCard = ({ width = '100%', height = 200, className }) => (
  <div 
    className={`skeleton-card ${className || ''}`}
    style={{
      width,
      height,
      backgroundColor: '#f0f0f0',
      borderRadius: '8px',
      position: 'relative',
      overflow: 'hidden'
    }}
  >
    <div 
      className="skeleton-shimmer"
      style={{
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
        animation: 'skeleton-shimmer 1.5s infinite'
      }}
    />
  </div>
);

const SkeletonText = ({ lines = 3, width = '100%', className }) => (
  <div className={`skeleton-text ${className || ''}`}>
    {Array.from({ length: lines }).map((_, index) => (
      <div
        key={index}
        className="skeleton-line"
        style={{
          height: '16px',
          backgroundColor: '#f0f0f0',
          borderRadius: '4px',
          marginBottom: '8px',
          width: index === lines - 1 ? '60%' : width,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div 
          className="skeleton-shimmer"
          style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
            animation: 'skeleton-shimmer 1.5s infinite'
          }}
        />
      </div>
    ))}
  </div>
);

const SkeletonList = ({ count = 5, itemHeight = 80, className }) => (
  <div className={`skeleton-list ${className || ''}`}>
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        className="skeleton-list-item"
        style={{
          height: itemHeight,
          display: 'flex',
          alignItems: 'center',
          padding: '16px',
          borderBottom: '1px solid #f0f0f0'
        }}
      >
        <SkeletonCard width={60} height={60} />
        <div style={{ marginLeft: '16px', flex: 1 }}>
          <SkeletonText lines={2} />
        </div>
      </div>
    ))}
  </div>
);

// CSS動畫
const skeletonStyles = `
@keyframes skeleton-shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

.skeleton-card, .skeleton-line {
  animation: skeleton-shimmer 1.5s infinite;
}
`;

export { SkeletonCard, SkeletonText, SkeletonList, skeletonStyles };