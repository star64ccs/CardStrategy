// 鍵盤導航 Hook
import { useState, useEffect, useCallback } from 'react';

export const useKeyboardNavigation = (items, options = {}) => {
  const {
    loop = true,
    orientation = 'vertical',
    initialIndex = 0
  } = options;

  const [focusedIndex, setFocusedIndex] = useState(initialIndex);

  const handleKeyDown = useCallback((event) => {
    const { key } = event;
    let newIndex = focusedIndex;

    switch (key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        newIndex = loop 
          ? (focusedIndex + 1) % items.length
          : Math.min(focusedIndex + 1, items.length - 1);
        break;

      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        newIndex = loop
          ? (focusedIndex - 1 + items.length) % items.length
          : Math.max(focusedIndex - 1, 0);
        break;

      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;

      case 'End':
        event.preventDefault();
        newIndex = items.length - 1;
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        if (items[focusedIndex]?.onSelect) {
          items[focusedIndex].onSelect();
        }
        break;

      case 'Escape':
        event.preventDefault();
        if (options.onEscape) {
          options.onEscape();
        }
        break;

      default:
        return;
    }

    setFocusedIndex(newIndex);
  }, [focusedIndex, items, loop, options]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    focusedIndex,
    setFocusedIndex,
    handleKeyDown
  };
};

export const useFocusManagement = () => {
  const [focusHistory, setFocusHistory] = useState([]);

  const saveFocus = useCallback(() => {
    const activeElement = document.activeElement;
    if (activeElement) {
      setFocusHistory(prev => [...prev, activeElement]);
    }
  }, []);

  const restoreFocus = useCallback(() => {
    const lastFocused = focusHistory.pop();
    if (lastFocused && lastFocused.focus) {
      lastFocused.focus();
      setFocusHistory([...focusHistory]);
    }
  }, [focusHistory]);

  const clearFocusHistory = useCallback(() => {
    setFocusHistory([]);
  }, []);

  return {
    saveFocus,
    restoreFocus,
    clearFocusHistory
  };
};
