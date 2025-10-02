// 焦點ManageComponent
// 提供焦點陷阱、焦點Restore、焦點指示器等功能
// 符合 WCAG 2.1 AA Standard和 Section 508 要求

import React, { forwardRef, useCallback, useEffect, useRef } from 'react';

import type { FocusManagerProps } from '../../types/accessibility';
import { useAccessibility } from '../providers/AccessibilityProvider';

// 焦點ManageComponent
export const _FocusManager = forwardRef<HTMLDivElement, FocusManagerProps>(
  (
    {
      children,
      trapFocus = false,
      restoreFocus = true,
      focusOrder = [],
      focusIndicator = 'outline',
      focusIndicatorColor = '#007AFF',
      focusIndicatorWidth = '2px',
      focusIndicatorStyle = 'solid',
      focusIndicatorOffset = '2px',
      focusIndicatorAnimation = true,
      focusIndicatorDuration = 200,
      focusIndicatorEasing = 'ease-in-out',
      onFocus,
      onBlur,
      onFocusChange,
      accessibility,
      focusManager,
      keyboardNavigation,
      screenReader,
      className,
      style,
      testId,
      ...props
    },
    ref
  ) => {
    const _containerRef = useRef<HTMLDivElement>(null);
    const _focusableElementsRef = useRef<HTMLElement[]>([]);
    const _previousFocusRef = useRef<HTMLElement | null>(null);
    const _focusHistoryRef = useRef<string[]>([]);
    const _isInitializedRef = useRef(false);

    const { focusManager: accessibilityFocusManager } = useAccessibility();

    // Get可聚焦Element
    const _getFocusableElements = useCallback((): HTMLElement[] => {
      if (!containerRef.current) return [];

      const _selector = [
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        'a[href]',
        '[tabindex]:not([tabindex="-1"])',
        '[contenteditable="true"]',
        '[role="button"]',
        '[role="link"]',
        '[role="menuitem"]',
        '[role="tab"]',
        '[role="option"]',
      ].join(', ');

      const _elements = Array.from(
        containerRef.current.querySelectorAll(selector)
      );

      // Filter掉Hide的Element
      return elements.filter(element => {
        const _style = window.getComputedStyle(element);
        return (
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          style.opacity !== '0' &&
          !element.hasAttribute('aria-hidden')
        );
      }) as HTMLElement[];
    }, []);

    // Update焦點順序
    const _updateFocusOrder = useCallback(() => {
      const _elements = getFocusableElements();
      focusableElementsRef.current = elements;

      // 如果提供了Custom焦點順序，按順序排Column
      if (focusOrder.length > 0) {
        const orderedElements: HTMLElement[] = [];
        focusOrder.forEach(id => {
          const _element = elements.find(el => el.id === id);
          if (element) {
            orderedElements.push(element);
          }
        });
        // Add未在順序中的Element
        elements.forEach(element => {
          if (!orderedElements.includes(element)) {
            orderedElements.push(element);
          }
        });
        focusableElementsRef.current = orderedElements;
      }

      // Update可訪問性Service的焦點順序
      const _elementIds = focusableElementsRef.current.map(
        el => el.id || el.getAttribute('data-testid') || ''
      );
      accessibilityFocusManager.focus = (elementId: string) => {
        const _element = focusableElementsRef.current.find(
          el =>
            el.id === elementId || el.getAttribute('data-testid') === elementId
        );
        if (element) {
          element.focus();
        }
      };
    }, [focusOrder, getFocusableElements, accessibilityFocusManager]);

    // 焦點到下一個Element
    const _focusNext = useCallback(() => {
      const _elements = focusableElementsRef.current;
      if (elements.length === 0) return;

      const _currentIndex = elements.findIndex(
        el => el === document.activeElement
      );
      const _nextIndex =
        currentIndex < elements.length - 1 ? currentIndex + 1 : 0;
      elements[nextIndex].focus();
    }, []);

    // 焦點到上一個Element
    const _focusPrevious = useCallback(() => {
      const _elements = focusableElementsRef.current;
      if (elements.length === 0) return;

      const _currentIndex = elements.findIndex(
        el => el === document.activeElement
      );
      const _prevIndex =
        currentIndex > 0 ? currentIndex - 1 : elements.length - 1;
      elements[prevIndex].focus();
    }, []);

    // 焦點到第一個Element
    const _focusFirst = useCallback(() => {
      const _elements = focusableElementsRef.current;
      if (elements.length > 0) {
        elements[0].focus();
      }
    }, []);

    // 焦點到最後一個Element
    const _focusLast = useCallback(() => {
      const _elements = focusableElementsRef.current;
      if (elements.length > 0) {
        elements[elements.length - 1].focus();
      }
    }, []);

    // HandleKey盤Event
    const _handleKeyDown = useCallback(
      (event: KeyboardEvent) => {
        const { key, shiftKey } = event;

        // Handle Tab Key導航
        if (key === 'Tab') {
          if (trapFocus) {
            event.preventDefault();
            if (shiftKey) {
              focusPrevious();
            } else {
              focusNext();
            }
          }
        }

        // Handle方向Key導航
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
          event.preventDefault();
          switch (key) {
            case 'ArrowUp':
            case 'ArrowLeft':
              focusPrevious();
              break;
            case 'ArrowDown':
            case 'ArrowRight':
              focusNext();
              break;
          }
        }

        // Handle Home 和 End Key
        if (key === 'Home') {
          event.preventDefault();
          focusFirst();
        }
        if (key === 'End') {
          event.preventDefault();
          focusLast();
        }
      },
      [trapFocus, focusNext, focusPrevious, focusFirst, focusLast]
    );

    // Handle焦點Event
    const _handleFocusIn = useCallback(
      (event: FocusEvent) => {
        const _target = event.target as HTMLElement;
        const _elementId =
          target.id || target.getAttribute('data-testid') || 'unknown';

        // Record焦點歷史
        if (!focusHistoryRef.current.includes(elementId)) {
          focusHistoryRef.current.push(elementId);
          // Limit歷史Record長度
          if (focusHistoryRef.current.length > 50) {
            focusHistoryRef.current.shift();
          }
        }

        // 調用CallbackFunction
        onFocus?.(elementId);
        onFocusChange?.(previousFocusRef.current?.id || '', elementId);

        // Update可訪問性Status
        accessibilityFocusManager.focus(elementId);
      },
      [onFocus, onFocusChange, accessibilityFocusManager]
    );

    // Handle失焦Event
    const _handleFocusOut = useCallback(
      (event: FocusEvent) => {
        const _target = event.target as HTMLElement;
        const _elementId =
          target.id || target.getAttribute('data-testid') || 'unknown';

        previousFocusRef.current = target;

        // 調用CallbackFunction
        onBlur?.(elementId);
      },
      [onBlur]
    );

    // Settings焦點指示器樣式
    const _setupFocusIndicator = useCallback(() => {
      const _styleId = 'focus-manager-styles';
      let styleElement = document.getElementById(styleId) as HTMLStyleElement;

      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }

      const _containerSelector = `[data-testid="${testId || 'focus-manager'}"]`;

      let css = `
      ${containerSelector} {
        position: relative;
      }

      ${containerSelector} *:focus {
        outline: ${focusIndicatorWidth} ${focusIndicatorStyle} ${focusIndicatorColor} !important;
        outline-offset: ${focusIndicatorOffset} !important;
      }
    `;

      if (focusIndicatorAnimation) {
        css += `
        ${containerSelector} *:focus {
          transition: outline ${focusIndicatorDuration}ms ${focusIndicatorEasing} !important;
        }
      `;
      }

      // Custom焦點指示器
      if (focusIndicator === 'custom') {
        css += `
        ${containerSelector} *:focus {
          outline: none !important;
          box-shadow: 0 0 0 ${focusIndicatorWidth} ${focusIndicatorColor} !important;
        }
      `;
      }

      styleElement.textContent = css;
    }, [
      testId,
      focusIndicator,
      focusIndicatorColor,
      focusIndicatorWidth,
      focusIndicatorStyle,
      focusIndicatorOffset,
      focusIndicatorAnimation,
      focusIndicatorDuration,
      focusIndicatorEasing,
    ]);

    // Initialize
    useEffect(() => {
      if (!isInitializedRef.current) {
        // Save當前焦點
        if (restoreFocus && document.activeElement instanceof HTMLElement) {
          previousFocusRef.current = document.activeElement;
        }

        // Settings焦點指示器
        setupFocusIndicator();

        // Update焦點順序
        updateFocusOrder();

        // AddEvent監聽器
        const _container = containerRef.current;
        if (container) {
          container.addEventListener('focusin', handleFocusIn);
          container.addEventListener('focusout', handleFocusOut);
          container.addEventListener('keydown', handleKeyDown);
        }

        isInitializedRef.current = true;
      }

      return () => {
        // 清理Event監聽器
        const _container = containerRef.current;
        if (container) {
          container.removeEventListener('focusin', handleFocusIn);
          container.removeEventListener('focusout', handleFocusOut);
          container.removeEventListener('keydown', handleKeyDown);
        }

        // Restore焦點
        if (restoreFocus && previousFocusRef.current) {
          previousFocusRef.current.focus();
        }
      };
    }, [
      restoreFocus,
      setupFocusIndicator,
      updateFocusOrder,
      handleFocusIn,
      handleFocusOut,
      handleKeyDown,
    ]);

    // 監聽焦點順序變化
    useEffect(() => {
      updateFocusOrder();
    }, [focusOrder, updateFocusOrder]);

    // 監聽焦點陷阱變化
    useEffect(() => {
      if (trapFocus) {
        accessibilityFocusManager.trap(true);
      } else {
        accessibilityFocusManager.trap(false);
      }
    }, [trapFocus, accessibilityFocusManager]);

    // 監聽焦點指示器Configure變化
    useEffect(() => {
      setupFocusIndicator();
    }, [
      focusIndicator,
      focusIndicatorColor,
      focusIndicatorWidth,
      focusIndicatorStyle,
      focusIndicatorOffset,
      focusIndicatorAnimation,
      focusIndicatorDuration,
      focusIndicatorEasing,
      setupFocusIndicator,
    ]);

    // Merge ref
    const _mergedRef = useCallback(
      (node: HTMLDivElement | null) => {
        containerRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    return (
      <div
        ref={mergedRef}
        className={`focus-manager ${className || ''}`}
        style={style}
        data-testid={testId || 'focus-manager'}
        role='group'
        aria-label='焦點管理區域'
        tabIndex={-1}
        {...props}
      >
        {children}
      </div>
    );
  }
);

// SettingsShow名稱
FocusManager.displayName = 'FocusManager';

// ExportComponent
export default FocusManager;
