import React, { useState, useCallback } from 'react';

const OptimizedImage = ({ 
  src, 
  alt, 
  width, 
  height, 
  quality = 85,
  format = 'webp',
  className,
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  // 生成優化後的圖片URL
  const getOptimizedSrc = () => {
    if (!src) return '';
    
    // 如果已經是優化過的URL，直接返回
    if (src.includes('?')) return src;
    
    const params = new URLSearchParams();
    if (width) params.append('w', width);
    if (height) params.append('h', height);
    if (quality) params.append('q', quality);
    if (format) params.append('f', format);
    
    return `${src}?${params.toString()}`;
  };

  if (hasError) {
    return (
      <div 
        className={`image-error ${className || ''}`}
        style={{ width, height, backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        {...props}
      >
        <span style={{ color: '#999', fontSize: '12px' }}>圖片加載失敗</span>
      </div>
    );
  }

  return (
    <div className={`optimized-image-container ${className || ''}`} {...props}>
      {isLoading && (
        <div 
          style={{
            width,
            height,
            backgroundColor: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            top: 0,
            left: 0
          }}
        >
          <div className="loading-spinner" />
        </div>
      )}
      <img
        src={getOptimizedSrc()}
        alt={alt}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out'
        }}
      />
    </div>
  );
};

export default OptimizedImage;