// 焦點管理組件
// 提供焦點陷阱、焦點恢復、焦點指示器等功能
// 符合 WCAG 2.1 AA 標準和 Section 508 要求

import React, { forwardRef, useCallback, useEffect, useRef } from 'react';

import type { FocusManagerProps } from '../../types/accessibility';
import { useAccessibility } from '../providers/AccessibilityProvider';

// 焦點管理組件
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

    // 獲取可聚焦元素
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

      // 過濾掉隱藏的元素
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

    // 更新焦點順序
    const _updateFocusOrder = useCallback(() => {
      const _elements = getFocusableElements();
      focusableElementsRef.current = elements;

      // 如果提供了自定義焦點順序，按順序排列
      if (focusOrder.length > 0) {
        const orderedElements: HTMLElement[] = [];
        focusOrder.forEach(id => {
          const _element = elements.find(el => el.id === id);
          if (element) {
            orderedElements.push(element);
          }
        });
        // 添加未在順序中的元素
        elements.forEach(element => {
          if (!orderedElements.includes(element)) {
            orderedElements.push(element);
          }
        });
        focusableElementsRef.current = orderedElements;
      }

      // 更新可訪問性服務的焦點順序
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

    // 焦點到下一個元素
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

    // 焦點到上一個元素
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

    // 焦點到第一個元素
    const _focusFirst = useCallback(() => {
      const _elements = focusableElementsRef.current;
      if (elements.length > 0) {
        elements[0].focus();
      }
    }, []);

    // 焦點到最後一個元素
    const _focusLast = useCallback(() => {
      const _elements = focusableElementsRef.current;
      if (elements.length > 0) {
        elements[elements.length - 1].focus();
      }
    }, []);

    // 處理鍵盤事件
    const _handleKeyDown = useCallback(
      (event: KeyboardEvent) => {
        const { key, shiftKey } = event;

        // 處理 Tab 鍵導航
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

        // 處理方向鍵導航
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

        // 處理 Home 和 End 鍵
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

    // 處理焦點事件
    const _handleFocusIn = useCallback(
      (event: FocusEvent) => {
        const _target = event.target as HTMLElement;
        const _elementId =
          target.id || target.getAttribute('data-testid') || 'unknown';

        // 記錄焦點歷史
        if (!focusHistoryRef.current.includes(elementId)) {
          focusHistoryRef.current.push(elementId);
          // 限制歷史記錄長度
          if (focusHistoryRef.current.length > 50) {
            focusHistoryRef.current.shift();
          }
        }

        // 調用回調函數
        onFocus?.(elementId);
        onFocusChange?.(previousFocusRef.current?.id || '', elementId);

        // 更新可訪問性狀態
        accessibilityFocusManager.focus(elementId);
      },
      [onFocus, onFocusChange, accessibilityFocusManager]
    );

    // 處理失焦事件
    const _handleFocusOut = useCallback(
      (event: FocusEvent) => {
        const _target = event.target as HTMLElement;
        const _elementId =
          target.id || target.getAttribute('data-testid') || 'unknown';

        previousFocusRef.current = target;

        // 調用回調函數
        onBlur?.(elementId);
      },
      [onBlur]
    );

    // 設置焦點指示器樣式
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

      // 自定義焦點指示器
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

    // 初始化
    useEffect(() => {
      if (!isInitializedRef.current) {
        // 保存當前焦點
        if (restoreFocus && document.activeElement instanceof HTMLElement) {
          previousFocusRef.current = document.activeElement;
        }

        // 設置焦點指示器
        setupFocusIndicator();

        // 更新焦點順序
        updateFocusOrder();

        // 添加事件監聽器
        const _container = containerRef.current;
        if (container) {
          container.addEventListener('focusin', handleFocusIn);
          container.addEventListener('focusout', handleFocusOut);
          container.addEventListener('keydown', handleKeyDown);
        }

        isInitializedRef.current = true;
      }

      return () => {
        // 清理事件監聽器
        const _container = containerRef.current;
        if (container) {
          container.removeEventListener('focusin', handleFocusIn);
          container.removeEventListener('focusout', handleFocusOut);
          container.removeEventListener('keydown', handleKeyDown);
        }

        // 恢復焦點
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

    // 監聽焦點指示器配置變化
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

    // 合併 ref
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

// 設置顯示名稱
FocusManager.displayName = 'FocusManager';

// 導出組件
export default FocusManager;
