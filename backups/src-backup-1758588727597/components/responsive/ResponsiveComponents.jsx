// 響應式容器組件
import React from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';

export const ResponsiveContainer = ({ 
  children, 
  breakpoints = {},
  className = '',
  ...props 
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');

  const getResponsiveClass = () => {
    if (isMobile) return 'mobile';
    if (isTablet) return 'tablet';
    if (isDesktop) return 'desktop';
    return '';
  };

  return (
    <div
      className={`responsive-container ${getResponsiveClass()} ${className}`}
      data-breakpoint={getResponsiveClass()}
      {...props}
    >
      {children}
    </div>
  );
};

export const ResponsiveGrid = ({ 
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = '1rem',
  children,
  ...props 
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');

  const getColumnCount = () => {
    if (isMobile) return columns.mobile;
    if (isTablet) return columns.tablet;
    if (isDesktop) return columns.desktop;
    return columns.mobile;
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${getColumnCount()}, 1fr)`,
    gap: gap,
    width: '100%'
  };

  return (
    <div style={gridStyle} {...props}>
      {children}
    </div>
  );
};

export const ResponsiveImage = ({ 
  src, 
  alt, 
  sizes = '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw',
  ...props 
}) => {
  return (
    <img
      src={src}
      alt={alt}
      sizes={sizes}
      loading="lazy"
      style={{
        width: '100%',
        height: 'auto',
        maxWidth: '100%'
      }}
      {...props}
    />
  );
};

export const ResponsiveText = ({ 
  children, 
  mobileSize = '14px',
  tabletSize = '16px', 
  desktopSize = '18px',
  ...props 
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');

  const getFontSize = () => {
    if (isMobile) return mobileSize;
    if (isTablet) return tabletSize;
    return desktopSize;
  };

  return (
    <span
      style={{ fontSize: getFontSize() }}
      {...props}
    >
      {children}
    </span>
  );
};
