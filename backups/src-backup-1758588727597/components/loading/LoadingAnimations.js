import React from 'react';

const LoadingSpinner = ({ size = 40, color = '#007bff', className }) => (
  <div 
    className={`loading-spinner ${className || ''}`}
    style={{
      width: size,
      height: size,
      border: `3px solid ${color}20`,
      borderTop: `3px solid ${color}`,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}
  />
);

const LoadingDots = ({ size = 8, color = '#007bff', className }) => (
  <div className={`loading-dots ${className || ''}`}>
    {[0, 1, 2].map((index) => (
      <div
        key={index}
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: '50%',
          animation: `loading-dots 1.4s infinite ease-in-out ${index * 0.16}s`
        }}
      />
    ))}
  </div>
);

const LoadingProgress = ({ progress = 0, size = 120, strokeWidth = 8, color = '#007bff', className }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`loading-progress ${className || ''}`} style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e0e0e0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: 'stroke-dashoffset 0.3s ease-in-out'
          }}
        />
      </svg>
      <div 
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '16px',
          fontWeight: 'bold',
          color: color
        }}
      >
        {Math.round(progress)}%
      </div>
    </div>
  );
};

// CSS動畫
const loadingStyles = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes loading-dots {
  0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

.loading-dots {
  display: flex;
  gap: 4px;
  justify-content: center;
  align-items: center;
}
`;

export { LoadingSpinner, LoadingDots, LoadingProgress, loadingStyles };