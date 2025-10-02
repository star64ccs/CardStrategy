import React, { useState, useCallback } from 'react';

const TouchableOpacity = ({ 
  children, 
  onPress, 
  disabled = false,
  activeOpacity = 0.7,
  className,
  style,
  ...props 
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = useCallback(() => {
    if (!disabled && onPress) {
      onPress();
    }
  }, [disabled, onPress]);

  const handleMouseDown = useCallback(() => {
    if (!disabled) {
      setIsPressed(true);
    }
  }, [disabled]);

  const handleMouseUp = useCallback(() => {
    setIsPressed(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPressed(false);
  }, []);

  return (
    <div
      className={`touchable-opacity ${className || ''}`}
      style={{
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : (isPressed ? activeOpacity : 1),
        transition: 'opacity 0.1s ease',
        userSelect: 'none',
        ...style
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onClick={handlePress}
      {...props}
    >
      {children}
    </div>
  );
};

const TouchableHighlight = ({ 
  children, 
  onPress, 
  disabled = false,
  activeColor = '#f0f0f0',
  className,
  style,
  ...props 
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = useCallback(() => {
    if (!disabled && onPress) {
      onPress();
    }
  }, [disabled, onPress]);

  const handleMouseDown = useCallback(() => {
    if (!disabled) {
      setIsPressed(true);
    }
  }, [disabled]);

  const handleMouseUp = useCallback(() => {
    setIsPressed(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPressed(false);
  }, []);

  return (
    <div
      className={`touchable-highlight ${className || ''}`}
      style={{
        cursor: disabled ? 'not-allowed' : 'pointer',
        backgroundColor: disabled ? 'transparent' : (isPressed ? activeColor : 'transparent'),
        transition: 'background-color 0.1s ease',
        userSelect: 'none',
        ...style
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onClick={handlePress}
      {...props}
    >
      {children}
    </div>
  );
};

export { TouchableOpacity, TouchableHighlight };