// 可訪問性提供者Component
// 為整個Apply提供可訪問性功能Support
// 符合 WCAG 2.1 AA Standard和 Section 508 要求

import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../../store';

import { accessibilityService } from '../../services/accessibilityService';
import {
  addAccessibilityEvent,
  focusFirst,
  focusLast,
  focusNext,
  focusPrevious,
  initializeAccessibility,
  selectAccessibilityConfig,
  selectAccessibilityIssues,
  selectAccessibilityMode,
  selectAccessibilityScore,
  selectAccessibilityState,
  selectAccessibilitySuggestions,
  selectAssistiveTechnology,
  selectCurrentFocus,
  selectFocusManager,
  selectHighContrastEnabled,
  selectKeyboardNavigationEnabled,
  selectLargeTextEnabled,
  selectReducedMotionEnabled,
  selectScreenReaderEnabled,
  setCurrentFocus,
  setFocusTrapped,
  switchMode,
  updateAccessibilityConfig,
} from '../../store/slices/accessibilitySlice';
import type {
  AccessibilityConfig,
  AccessibilityEvent,
  AccessibilityIssue,
  AccessibilityState,
  AccessibilityTestConfig,
  AccessibilityTestResult,
  FocusManagerConfig,
  KeyboardNavigationConfig,
  ScreenReaderConfig,
  UseAccessibilityReturn,
} from '../../types/accessibility';

// 可訪問性上下文
interface AccessibilityContextType extends UseAccessibilityReturn {
  // 額外的提供者SpecificMethod
  initialize: (config?: Partial<AccessibilityConfig>) => Promise<void>;
  updateConfig: (config: Partial<AccessibilityConfig>) => Promise<void>;
  runTest: (
    config?: Partial<AccessibilityTestConfig>
  ) => Promise<AccessibilityTestResult>;
  fixIssues: (issues: AccessibilityIssue[]) => Promise<void>;
  generateReport: (result: AccessibilityTestResult) => string;
}

const _AccessibilityContext = createContext<AccessibilityContextType | null>(
  null
);

// 可訪問性提供者Property
interface AccessibilityProviderProps {
  /** 子Component */
  children: ReactNode;
  /** 初始Configure */
  initialConfig?: Partial<AccessibilityConfig>;
  /** YesNoAutoInitialize */
  autoInitialize?: boolean;
  /** YesNoEnableKey盤導航 */
  enableKeyboardNavigation?: boolean;
  /** YesNoEnable屏幕閱讀器 */
  enableScreenReader?: boolean;
  /** YesNoEnable高對比度 */
  enableHighContrast?: boolean;
  /** YesNoEnable減少動畫 */
  enableReducedMotion?: boolean;
  /** YesNoEnable大字體 */
  enableLargeText?: boolean;
  /** 焦點ManageConfigure */
  focusManager?: Partial<FocusManagerConfig>;
  /** Key盤導航Configure */
  keyboardNavigation?: Partial<KeyboardNavigationConfig>;
  /** 屏幕閱讀器Configure */
  screenReader?: Partial<ScreenReaderConfig>;
  /** TestConfigure */
  testConfig?: Partial<AccessibilityTestConfig>;
  /** EventHandle器 */
  onEvent?: (event: AccessibilityEvent) => void;
  /** ErrorHandle器 */
  onError?: (error: Error) => void;
  /** 樣式Class名 */
  className?: string;
  /** 內聯樣式 */
  style?: React.CSSProperties;
  /** Test ID */
  testId?: string;
}

// 可訪問性提供者Component
export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({
  children,
  initialConfig,
  autoInitialize = true,
  enableKeyboardNavigation = true,
  enableScreenReader = true,
  enableHighContrast = false,
  enableReducedMotion = false,
  enableLargeText = false,
  focusManager,
  keyboardNavigation,
  screenReader,
  testConfig,
  onEvent,
  onError,
  className,
  style,
  testId,
}) => {
  const _dispatch = useDispatch<AppDispatch>();
  const _accessibilityState = useSelector(selectAccessibilityState);
  const _accessibilityConfig = useSelector(selectAccessibilityConfig);
  const _focusManagerState = useSelector(selectFocusManager);
  const _currentFocus = useSelector(selectCurrentFocus);
  const _accessibilityMode = useSelector(selectAccessibilityMode);
  const _assistiveTechnology = useSelector(selectAssistiveTechnology);
  const _accessibilityScore = useSelector(selectAccessibilityScore);
  const _accessibilityIssues = useSelector(selectAccessibilityIssues);
  const _accessibilitySuggestions = useSelector(selectAccessibilitySuggestions);
  const _keyboardNavigationEnabled = useSelector(
    selectKeyboardNavigationEnabled
  );
  const _screenReaderEnabled = useSelector(selectScreenReaderEnabled);
  const _highContrastEnabled = useSelector(selectHighContrastEnabled);
  const _reducedMotionEnabled = useSelector(selectReducedMotionEnabled);
  const _largeTextEnabled = useSelector(selectLargeTextEnabled);

  const _initializedRef = useRef(false);
  const _eventListenersRef = useRef<
    Map<string, (event: AccessibilityEvent) => void>
  >(new Map());

  // Initialize可訪問性Service
  useEffect(() => {
    if (autoInitialize && !initializedRef.current) {
      const config: Partial<AccessibilityConfig> = {
        ...initialConfig,
        keyboardNavigation: {
          enabled: enableKeyboardNavigation,
          ...keyboardNavigation,
        },
        screenReader: {
          enabled: enableScreenReader,
          ...screenReader,
        },
        highContrast: enableHighContrast,
        reducedMotion: enableReducedMotion,
        largeText: enableLargeText,
        focusManager: {
          ...focusManager,
        },
      };

      dispatch(initializeAccessibility(config))
        .then(() => {
          initializedRef.current = true;
          console.log('AccessibilityProvider initialized successfully');
        })
        .catch(error => {
          console.error('Failed to initialize AccessibilityProvider:', error);
          onError?.(error);
        });
    }

    return () => {
      // 清理Service
      accessibilityService.destroy();
    };
  }, [
    autoInitialize,
    initialConfig,
    enableKeyboardNavigation,
    enableScreenReader,
    enableHighContrast,
    enableReducedMotion,
    enableLargeText,
    focusManager,
    keyboardNavigation,
    screenReader,
    dispatch,
    onError,
  ]);

  // SettingsEvent監聽器
  useEffect(() => {
    if (onEvent) {
      const _eventHandler = (event: AccessibilityEvent) => {
        onEvent(event);
        dispatch(addAccessibilityEvent(event));
      };

      accessibilityService.onEvent('focus', eventHandler as any);
      accessibilityService.onEvent('blur', eventHandler as any);
      accessibilityService.onEvent('change', eventHandler as any);
      accessibilityService.onEvent('error', eventHandler as any);
      accessibilityService.onEvent('success', eventHandler as any);
      accessibilityService.onEvent('complete', eventHandler as any);
      accessibilityService.onEvent('issue', eventHandler as any);
      accessibilityService.onEvent('suggestion', eventHandler as any);

      eventListenersRef.current.set('custom', eventHandler);
    }

    return () => {
      // 清理Event監聽器
      eventListenersRef.current.clear();
    };
  }, [onEvent, dispatch]);

  // 監聽焦點變化
  useEffect(() => {
    const _handleFocusIn = (event: FocusEvent) => {
      const _target = event.target as HTMLElement;
      const _elementId =
        target.id || target.getAttribute('data-testid') || 'unknown';
      dispatch(setCurrentFocus(elementId));
    };

    const _handleFocusOut = (event: FocusEvent) => {
      dispatch(setCurrentFocus(null));
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, [dispatch]);

  // 監聽Key盤Event
  useEffect(() => {
    const _handleKeyDown = (event: KeyboardEvent) => {
      if (!keyboardNavigationEnabled) return;

      const { key, ctrlKey, altKey, shiftKey, metaKey } = event;

      // Handle方向Key導航
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
        event.preventDefault();
        switch (key) {
          case 'ArrowUp':
          case 'ArrowLeft':
            dispatch(focusPrevious());
            break;
          case 'ArrowDown':
          case 'ArrowRight':
            dispatch(focusNext());
            break;
        }
      }

      // Handle功能Key
      switch (key) {
        case 'Tab':
          // Tab Key導航由瀏覽器Handle
          break;
        case 'Enter':
          if (currentFocus) {
            const _element = document.getElementById(currentFocus);
            if (
              element &&
              (element.tagName === 'BUTTON' ||
                element.getAttribute('role') === 'button')
            ) {
              element.click();
            }
          }
          break;
        case 'Escape':
          if (focusManagerState.restoreElement) {
            const _element = document.getElementById(
              focusManagerState.restoreElement
            );
            if (element) {
              element.focus();
            }
          }
          break;
        case ' ':
          if (currentFocus) {
            const _element = document.getElementById(currentFocus);
            if (
              element &&
              (element.tagName === 'BUTTON' ||
                element.getAttribute('role') === 'button')
            ) {
              event.preventDefault();
              element.click();
            }
          }
          break;
      }
    };

    if (keyboardNavigationEnabled) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    keyboardNavigationEnabled,
    currentFocus,
    focusManagerState.restoreElement,
    dispatch,
  ]);

  // Apply可訪問性樣式
  useEffect(() => {
    const _styleElement = document.createElement('style');

    let css = '';

    // 高對比度模式
    if (highContrastEnabled) {
      css += `
        * {
          background-color: #000000 !important;
          color: #FFFFFF !important;
          border-color: #FFFFFF !important;
        }

        *:focus {
          outline: 3px solid #FFFFFF !important;
          outline-offset: 2px !important;
        }
      `;
    }

    // 減少動畫模式
    if (reducedMotionEnabled) {
      css += `
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      `;
    }

    // 大字體模式
    if (largeTextEnabled) {
      css += `
        * {
          font-size: 1.2em !important;
        }

        h1 { font-size: 2.4em !important; }
        h2 { font-size: 2.0em !important; }
        h3 { font-size: 1.8em !important; }
        h4 { font-size: 1.6em !important; }
        h5 { font-size: 1.4em !important; }
        h6 { font-size: 1.2em !important; }
      `;
    }

    // 焦點指示器
    if (focusManagerState.showIndicator) {
      const _config = accessibilityConfig.focusManager;
      if (config) {
        css += `
          .accessibility-focus-indicator {
            outline: ${config.focusIndicatorWidth} ${config.focusIndicatorStyle} ${config.focusIndicatorColor} !important;
            outline-offset: ${config.focusIndicatorOffset} !important;
          }

          .accessibility-focus-indicator:focus {
            outline: ${config.focusIndicatorWidth} ${config.focusIndicatorStyle} ${config.focusIndicatorColor} !important;
          }

          ${
            config.focusIndicatorAnimation
              ? `
            .accessibility-focus-indicator {
              transition: outline ${config.focusIndicatorDuration}ms ${config.focusIndicatorEasing} !important;
            }
          `
              : ''
          }
        `;
      }
    }

    styleElement.textContent = css;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, [
    highContrastEnabled,
    reducedMotionEnabled,
    largeTextEnabled,
    focusManagerState.showIndicator,
    accessibilityConfig.focusManager,
  ]);

  // 屏幕閱讀器Support
  useEffect(() => {
    if (screenReaderEnabled && 'speechSynthesis' in window) {
      const _speak = (
        text: string,
        priority: 'polite' | 'assertive' = 'polite'
      ) => {
        const _utterance = new SpeechSynthesisUtterance(text);
        if (accessibilityConfig.screenReader?.voice) {
          utterance.lang =
            accessibilityConfig.screenReader.voice.language || 'zh-TW';
          utterance.rate = accessibilityConfig.screenReader.voice.rate || 1;
          utterance.pitch = accessibilityConfig.screenReader.voice.pitch || 1;
          utterance.volume = accessibilityConfig.screenReader.voice.volume || 1;
        }

        if (priority === 'assertive') {
          speechSynthesis.cancel();
        }

        speechSynthesis.speak(utterance);
      };

      // 監聽焦點變化進Row朗讀
      if (
        accessibilityConfig.screenReader?.reading?.readOnFocus &&
        currentFocus
      ) {
        const _element = document.getElementById(currentFocus);
        if (element) {
          const _text =
            element.getAttribute('aria-label') ||
            element.getAttribute('aria-labelledby') ||
            element.textContent ||
            accessibilityConfig.screenReader?.feedback?.onFocus ||
            '';
          if (text) {
            speak(text);
          }
        }
      }
    }
  }, [screenReaderEnabled, currentFocus, accessibilityConfig.screenReader]);

  // Build上下文Value
  const contextValue: AccessibilityContextType = {
    state: accessibilityState,
    focusManager: {
      focus: (elementId: string) => {
        const _element = document.getElementById(elementId);
        if (element) {
          element.focus();
          dispatch(setCurrentFocus(elementId));
        }
      },
      blur: () => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        dispatch(setCurrentFocus(null));
      },
      trap: (enabled: boolean) => {
        dispatch(setFocusTrapped(enabled));
      },
      restore: () => {
        if (focusManagerState.restoreElement) {
          const _element = document.getElementById(
            focusManagerState.restoreElement
          );
          if (element) {
            element.focus();
          }
        }
      },
      next: () => {
        dispatch(focusNext());
      },
      previous: () => {
        dispatch(focusPrevious());
      },
      first: () => {
        dispatch(focusFirst());
      },
      last: () => {
        dispatch(focusLast());
      },
    },
    keyboardNavigation: {
      enable: () => {
        // Key盤導航已通過 Redux StatusManage
      },
      disable: () => {
        // Key盤導航已通過 Redux StatusManage
      },
      handleKeyDown: (event: KeyboardEvent) => {
        // Key盤EventHandle已在 useEffect 中實現
      },
      handleKeyUp: (event: KeyboardEvent) => {
        // Key盤釋放EventHandle
      },
    },
    screenReader: {
      speak: (text: string, priority: 'polite' | 'assertive' = 'polite') => {
        if ('speechSynthesis' in window) {
          const _utterance = new SpeechSynthesisUtterance(text);
          if (accessibilityConfig.screenReader?.voice) {
            utterance.lang =
              accessibilityConfig.screenReader.voice.language || 'zh-TW';
            utterance.rate = accessibilityConfig.screenReader.voice.rate || 1;
            utterance.pitch = accessibilityConfig.screenReader.voice.pitch || 1;
            utterance.volume =
              accessibilityConfig.screenReader.voice.volume || 1;
          }

          if (priority === 'assertive') {
            speechSynthesis.cancel();
          }

          speechSynthesis.speak(utterance);
        }
      },
      announce: (text: string) => {
        // Create aria-live District域進Row公告
        const _announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'assertive');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.style.position = 'absolute';
        announcement.style.left = '-10000px';
        announcement.style.width = '1px';
        announcement.style.height = '1px';
        announcement.style.overflow = 'hidden';
        announcement.textContent = text;

        document.body.appendChild(announcement);

        setTimeout(() => {
          document.body.removeChild(announcement);
        }, 1000);
      },
      read: (elementId: string) => {
        const _element = document.getElementById(elementId);
        if (element) {
          const _text =
            element.getAttribute('aria-label') ||
            element.getAttribute('aria-labelledby') ||
            element.textContent ||
            '';
          if (text && 'speechSynthesis' in window) {
            const _utterance = new SpeechSynthesisUtterance(text);
            speechSynthesis.speak(utterance);
          }
        }
      },
      stop: () => {
        if ('speechSynthesis' in window) {
          speechSynthesis.cancel();
        }
      },
    },
    tools: {
      runTest: async (config?: Partial<AccessibilityTestConfig>) => {
        try {
          const _result = await accessibilityService.runTest(config);
          return result;
        } catch (error) {
          console.error('Failed to run accessibility test:', error);
          throw error;
        }
      },
      generateReport: (result: AccessibilityTestResult) => {
        return accessibilityService.generateReport(result);
      },
      fixIssues: async (issues: AccessibilityIssue[]) => {
        try {
          await accessibilityService.fixIssues(issues);
        } catch (error) {
          console.error('Failed to fix accessibility issues:', error);
          throw error;
        }
      },
      getIssues: () => {
        return accessibilityIssues;
      },
      getSuggestions: () => {
        return accessibilitySuggestions;
      },
    },
    updateConfig: async (config: Partial<AccessibilityConfig>) => {
      try {
        await dispatch(updateAccessibilityConfig(config)).unwrap();
      } catch (error) {
        console.error('Failed to update accessibility config:', error);
        throw error;
      }
    },
    switchMode: (mode: AccessibilityState['mode']) => {
      dispatch(switchMode(mode));
    },
    // 提供者SpecificMethod
    initialize: async (config?: Partial<AccessibilityConfig>) => {
      try {
        await dispatch(initializeAccessibility(config)).unwrap();
        initializedRef.current = true;
      } catch (error) {
        console.error('Failed to initialize accessibility:', error);
        throw error;
      }
    },
    runTest: async (config?: Partial<AccessibilityTestConfig>) => {
      try {
        const _result = await accessibilityService.runTest(config);
        return result;
      } catch (error) {
        console.error('Failed to run accessibility test:', error);
        throw error;
      }
    },
    fixIssues: async (issues: AccessibilityIssue[]) => {
      try {
        await accessibilityService.fixIssues(issues);
      } catch (error) {
        console.error('Failed to fix accessibility issues:', error);
        throw error;
      }
    },
    generateReport: (result: AccessibilityTestResult) => {
      return accessibilityService.generateReport(result);
    },
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      <div
        className={`accessibility-provider ${className || ''}`}
        style={style}
        data-testid={testId || 'accessibility-provider'}
        role='application'
        aria-label='可訪問性提供者'
      >
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
};

// 使用可訪問性的 Hook
export const _useAccessibility = (): AccessibilityContextType => {
  const _context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error(
      'useAccessibility must be used within an AccessibilityProvider'
    );
  }
  return context;
};

// ExportComponent
export default AccessibilityProvider;
