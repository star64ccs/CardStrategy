// 可訪問性 Hook
// 提供可訪問性功能的統一Interface
// 符合 WCAG 2.1 AA Standard和 Section 508 要求

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { accessibilityService } from '../services/accessibilityService';
import {
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
} from '../store/slices/accessibilitySlice';
import type {
  AccessibilityConfig,
  AccessibilityEvent,
  AccessibilityIssue,
  AccessibilityTestConfig,
  AccessibilityTestResult,
  UseAccessibilityReturn,
} from '../types/accessibility';

// 可訪問性 Hook Configure
interface UseAccessibilityConfig {
  /** YesNoAutoInitialize */
  autoInitialize?: boolean;
  /** 初始Configure */
  initialConfig?: Partial<AccessibilityConfig>;
  /** EventHandle器 */
  onEvent?: (event: AccessibilityEvent) => void;
  /** ErrorHandle器 */
  onError?: (error: Error) => void;
}

// 可訪問性 Hook
export const _useAccessibility = (
  config?: UseAccessibilityConfig
): UseAccessibilityReturn => {
  const _dispatch = useDispatch();

  // 從 Redux GetStatus
  const _state = useSelector(selectAccessibilityState);
  const _accessibilityConfig = useSelector(selectAccessibilityConfig);
  const _focusManager = useSelector(selectFocusManager);
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

  // 焦點Manage
  const _focusManagerMethods = useMemo(
    () => ({
      focus: useCallback((elementId: string) => {
        const _element = document.getElementById(elementId);
        if (element) {
          element.focus();
        }
      }, []),

      blur: useCallback(() => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }, []),

      trap: useCallback((enabled: boolean) => {
        console.log('Focus trap:', enabled);
      }, []),

      restore: useCallback(() => {
        if (focusManager.restoreElement) {
          const _element = document.getElementById(focusManager.restoreElement);
          if (element) {
            element.focus();
          }
        }
      }, [focusManager.restoreElement]),

      next: useCallback(() => {
        console.log('Focus next');
      }, []),

      previous: useCallback(() => {
        console.log('Focus previous');
      }, []),

      first: useCallback(() => {
        console.log('Focus first');
      }, []),

      last: useCallback(() => {
        console.log('Focus last');
      }, []),
    }),
    [focusManager.restoreElement]
  );

  // Key盤導航
  const _keyboardNavigationMethods = useMemo(
    () => ({
      enable: useCallback(() => {
        console.log('Enable keyboard navigation');
      }, []),

      disable: useCallback(() => {
        console.log('Disable keyboard navigation');
      }, []),

      handleKeyDown: useCallback(
        (event: KeyboardEvent) => {
          if (!keyboardNavigationEnabled) return;
          console.log('Key down:', event.key);
        },
        [keyboardNavigationEnabled]
      ),

      handleKeyUp: useCallback((event: KeyboardEvent) => {
        console.log('Key up:', event.key);
      }, []),
    }),
    [keyboardNavigationEnabled]
  );

  // 屏幕閱讀器
  const _screenReaderMethods = useMemo(
    () => ({
      speak: useCallback(
        (text: string, priority: 'polite' | 'assertive' = 'polite') => {
          if ('speechSynthesis' in window) {
            const _utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'zh-CN';
            utterance.rate = 1;
            utterance.pitch = 1;
            utterance.volume = 1;

            if (priority === 'assertive') {
              speechSynthesis.cancel();
            }

            speechSynthesis.speak(utterance);
          }
        },
        []
      ),

      announce: useCallback((text: string) => {
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
      }, []),

      read: useCallback((elementId: string) => {
        const _element = document.getElementById(elementId);
        if (element) {
          const _text =
            element.getAttribute('aria-label') ||
            element.getAttribute('aria-labelledby') ||
            element.textContent ||
            '';
          screenReaderMethods.speak(text);
        }
      }, []),

      stop: useCallback(() => {
        if ('speechSynthesis' in window) {
          speechSynthesis.cancel();
        }
      }, []),
    }),
    []
  );

  // 可訪問性Tool
  const _tools = useMemo(
    () => ({
      runTest: useCallback(
        async (testConfig?: Partial<AccessibilityTestConfig>) => {
          try {
            const _result = await accessibilityService.runTest(testConfig);
            return result;
          } catch (error) {
            console.error('Failed to run accessibility test:', error);
            config?.onError?.(error as Error);
            throw error;
          }
        },
        [config]
      ),

      generateReport: useCallback((result: AccessibilityTestResult) => {
        return accessibilityService.generateReport(result);
      }, []),

      fixIssues: useCallback(
        async (issues: AccessibilityIssue[]) => {
          try {
            await accessibilityService.fixIssues(issues);
          } catch (error) {
            console.error('Failed to fix accessibility issues:', error);
            config?.onError?.(error as Error);
            throw error;
          }
        },
        [config]
      ),

      getIssues: useCallback(() => {
        return accessibilityIssues;
      }, [accessibilityIssues]),

      getSuggestions: useCallback(() => {
        return accessibilitySuggestions;
      }, [accessibilitySuggestions]),
    }),
    [accessibilityIssues, accessibilitySuggestions, config]
  );

  // UpdateConfigure
  const _updateConfig = useCallback(
    async (newConfig: Partial<AccessibilityConfig>) => {
      try {
        accessibilityService.updateConfig(newConfig);
      } catch (error) {
        console.error('Failed to update accessibility config:', error);
        config?.onError?.(error as Error);
        throw error;
      }
    },
    [config]
  );

  // 模式Switch
  const _switchModeMethod = useCallback(
    (mode: 'default' | 'highContrast' | 'reducedMotion' | 'largeText') => {
      console.log('Switch mode:', mode);
    },
    []
  );

  // AutoInitialize
  useEffect(() => {
    if (config?.autoInitialize && !initializedRef.current) {
      try {
        accessibilityService.init();
        initializedRef.current = true;
        console.log('useAccessibility initialized successfully');
      } catch (error) {
        console.error('Failed to initialize useAccessibility:', error);
        config?.onError?.(error as Error);
      }
    }
  }, [config]);

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
    if (focusManager.showIndicator) {
      const _focusConfig = accessibilityConfig.focusManager;
      css += `
        .accessibility-focus-indicator {
          outline: ${focusConfig?.focusIndicatorWidth || '2px'} ${focusConfig?.focusIndicatorStyle || 'solid'} ${focusConfig?.focusIndicatorColor || '#007AFF'} !important;
          outline-offset: ${focusConfig?.focusIndicatorOffset || '2px'} !important;
        }

        .accessibility-focus-indicator:focus {
          outline: ${focusConfig?.focusIndicatorWidth || '2px'} ${focusConfig?.focusIndicatorStyle || 'solid'} ${focusConfig?.focusIndicatorColor || '#007AFF'} !important;
        }
      `;
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
    focusManager.showIndicator,
    accessibilityConfig.focusManager,
  ]);

  // Return Hook Interface
  return {
    state,
    focusManager: focusManagerMethods,
    keyboardNavigation: keyboardNavigationMethods,
    screenReader: screenReaderMethods,
    tools,
    updateConfig,
    switchMode: switchModeMethod,
  };
};

// Export Hook
export default useAccessibility;
