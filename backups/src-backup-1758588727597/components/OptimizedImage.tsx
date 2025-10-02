import React, { useState, useRef, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  priority = false,
  sizes = '100vw',
  className,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    onError?.();
  };

  const generateSrcSet = (baseSrc: string) => {
    const formats = ['webp', 'avif', 'jpeg'];
    const sizes = [480, 768, 1024, 1200, 1920];
    
    return formats.map(format => 
      sizes.map(size => 
        `${baseSrc}?w=${size}&f=${format} ${size}w`
      ).join(', ')
    ).join(', ');
  };

  return (
    <div 
      ref={imgRef}
      className={`relative overflow-hidden ${className || ''}`}
      style={{ width, height }}
    >
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      
      {isInView && (
        <picture>
          <source 
            srcSet={generateSrcSet(src)}
            sizes={sizes}
            type="image/avif"
          />
          <source 
            srcSet={`${src}?f=webp`}
            sizes={sizes}
            type="image/webp"
          />
          <img
            src={`${src}?f=jpeg`}
            alt={alt}
            width={width}
            height={height}
            sizes={sizes}
            loading={priority ? 'eager' : 'lazy'}
            onLoad={handleLoad}
            onError={handleError}
            className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        </picture>
      )}
    </div>
  );
};

export default OptimizedImage;
