import React, { useState, useEffect, useRef } from 'react';

const FadeIn = ({ children, delay = 0, duration = 300, className, style }) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      ref={elementRef}
      className={`fade-in ${className || ''}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
        ...style
      }}
    >
      {children}
    </div>
  );
};

const SlideIn = ({ children, direction = 'left', delay = 0, duration = 300, className, style }) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const getTransform = () => {
    if (!isVisible) {
      switch (direction) {
        case 'left': return 'translateX(-100%)';
        case 'right': return 'translateX(100%)';
        case 'up': return 'translateY(-100%)';
        case 'down': return 'translateY(100%)';
        default: return 'translateX(-100%)';
      }
    }
    return 'translateX(0) translateY(0)';
  };

  return (
    <div
      ref={elementRef}
      className={`slide-in ${className || ''}`}
      style={{
        transform: getTransform(),
        transition: `transform ${duration}ms ease-out`,
        ...style
      }}
    >
      {children}
    </div>
  );
};

const ScaleIn = ({ children, delay = 0, duration = 300, className, style }) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      ref={elementRef}
      className={`scale-in ${className || ''}`}
      style={{
        transform: isVisible ? 'scale(1)' : 'scale(0.8)',
        opacity: isVisible ? 1 : 0,
        transition: `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`,
        ...style
      }}
    >
      {children}
    </div>
  );
};

const StaggeredList = ({ children, staggerDelay = 100, className, style }) => {
  return (
    <div className={`staggered-list ${className || ''}`} style={style}>
      {React.Children.map(children, (child, index) => (
        <FadeIn delay={index * staggerDelay}>
          {child}
        </FadeIn>
      ))}
    </div>
  );
};

export { FadeIn, SlideIn, ScaleIn, StaggeredList };