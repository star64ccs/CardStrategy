// 屏幕閱讀器組件
// 提供語音合成、ARIA 標籤、語音反饋等功能
// 符合 WCAG 2.1 AA 標準和 Section 508 要求

import React, { forwardRef, useCallback, useEffect, useRef } from 'react';

import type { ScreenReaderProps } from '../../types/accessibility';
import { useAccessibility } from '../providers/AccessibilityProvider';

// 屏幕閱讀器組件
export const _ScreenReader = forwardRef<HTMLDivElement, ScreenReaderProps>(
  (
    {
      children,
      autoRead = false,
      readOnFocus = true,
      readOnChange = true,
      readOnError = true,
      readOnSuccess = true,
      voice,
      feedback,
      onSpeak,
      onStop,
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
    const _speechQueueRef = useRef<SpeechSynthesisUtterance[]>([]);
    const _isSpeakingRef = useRef(false);
    const _lastSpokenTextRef = useRef<string>('');
    const _voiceSettingsRef = useRef({
      rate: 1,
      pitch: 1,
      volume: 1,
      language: 'zh-CN',
    });

    const { screenReader: accessibilityScreenReader } = useAccessibility();

    // 檢查語音合成支持
    const _isSpeechSynthesisSupported =
      typeof window !== 'undefined' && 'speechSynthesis' in window;

    // 更新語音設置
    const _updateVoiceSettings = useCallback(() => {
      if (voice) {
        voiceSettingsRef.current = {
          ...voiceSettingsRef.current,
          ...voice,
        };
      }
    }, [voice]);

    // 創建語音合成實例
    const _createUtterance = useCallback(
      (
        text: string,
        priority: 'polite' | 'assertive' = 'polite'
      ): SpeechSynthesisUtterance | null => {
        if (!isSpeechSynthesisSupported) {
          console.warn('Speech synthesis is not supported in this browser');
          return null;
        }

        const _utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = voiceSettingsRef.current.language;
        utterance.rate = voiceSettingsRef.current.rate;
        utterance.pitch = voiceSettingsRef.current.pitch;
        utterance.volume = voiceSettingsRef.current.volume;

        // 設置事件處理器
        utterance.onstart = () => {
          isSpeakingRef.current = true;
          onSpeak?.(text, priority);
        };

        utterance.onend = () => {
          isSpeakingRef.current = false;
          // 處理隊列中的下一個語音
          if (speechQueueRef.current.length > 0) {
            const _nextUtterance = speechQueueRef.current.shift();
            if (nextUtterance) {
              speechSynthesis.speak(nextUtterance);
            }
          }
        };

        utterance.onerror = event => {
          console.error('Speech synthesis error:', event);
          isSpeakingRef.current = false;
        };

        return utterance;
      },
      [isSpeechSynthesisSupported, onSpeak]
    );

    // 語音合成
    const _speak = useCallback(
      (text: string, priority: 'polite' | 'assertive' = 'polite') => {
        if (!text || text === lastSpokenTextRef.current) return;

        const _utterance = createUtterance(text, priority);
        if (!utterance) return;

        lastSpokenTextRef.current = text;

        if (priority === 'assertive') {
          // 中斷當前語音
          speechSynthesis.cancel();
          speechQueueRef.current = [];
          speechSynthesis.speak(utterance);
        } else {
          // 添加到隊列
          if (isSpeakingRef.current) {
            speechQueueRef.current.push(utterance);
          } else {
            speechSynthesis.speak(utterance);
          }
        }
      },
      [createUtterance]
    );

    // 停止語音
    const _stop = useCallback(() => {
      if (isSpeechSynthesisSupported) {
        speechSynthesis.cancel();
        speechQueueRef.current = [];
        isSpeakingRef.current = false;
        lastSpokenTextRef.current = '';
        onStop?.();
      }
    }, [isSpeechSynthesisSupported, onStop]);

    // 公告文本
    const _announce = useCallback(
      (text: string, priority: 'polite' | 'assertive' = 'assertive') => {
        if (!containerRef.current) return;

        // 創建 aria-live 區域
        const _announcement = document.createElement('div');
        announcement.setAttribute('aria-live', priority);
        announcement.setAttribute('aria-atomic', 'true');
        announcement.setAttribute('aria-relevant', 'additions');
        announcement.style.position = 'absolute';
        announcement.style.left = '-10000px';
        announcement.style.width = '1px';
        announcement.style.height = '1px';
        announcement.style.overflow = 'hidden';
        announcement.style.clip = 'rect(0, 0, 0, 0)';
        announcement.style.whiteSpace = 'nowrap';
        announcement.textContent = text;

        containerRef.current.appendChild(announcement);

        // 語音合成
        speak(text, priority);

        // 清理公告元素
        setTimeout(() => {
          if (
            containerRef.current &&
            containerRef.current.contains(announcement)
          ) {
            containerRef.current.removeChild(announcement);
          }
        }, 1000);
      },
      [speak]
    );

    // 朗讀元素
    const _readElement = useCallback(
      (element: HTMLElement) => {
        if (!element) return;

        // 獲取元素的文本內容
        let text = '';

        // 優先使用 ARIA 標籤
        const _ariaLabel = element.getAttribute('aria-label');
        const _ariaLabelledBy = element.getAttribute('aria-labelledby');
        const _ariaDescription = element.getAttribute('aria-describedby');

        if (ariaLabel) {
          text = ariaLabel;
        } else if (ariaLabelledBy) {
          const _labelledElement = document.getElementById(ariaLabelledBy);
          if (labelledElement) {
            text = labelledElement.textContent || '';
          }
        } else if (ariaDescription) {
          const _describedElement = document.getElementById(ariaDescription);
          if (describedElement) {
            text = describedElement.textContent || '';
          }
        } else {
          // 使用元素的文本內容
          text = element.textContent || element.title || '';
        }

        // 清理文本
        text = text.trim().replace(/\s+/g, ' ');

        if (text) {
          speak(text);
        }
      },
      [speak]
    );

    // 處理焦點事件
    const _handleFocusIn = useCallback(
      (event: FocusEvent) => {
        if (!readOnFocus) return;

        const _target = event.target as HTMLElement;
        if (target && containerRef.current?.contains(target)) {
          readElement(target);
        }
      },
      [readOnFocus, readElement]
    );

    // 處理變化事件
    const _handleChange = useCallback(
      (event: Event) => {
        if (!readOnChange) return;

        const _target = event.target as HTMLElement;
        if (target && containerRef.current?.contains(target)) {
          const _text = feedback?.onChange || '已更改';
          announce(text);
        }
      },
      [readOnChange, feedback, announce]
    );

    // 處理錯誤事件
    const _handleError = useCallback(
      (event: Event) => {
        if (!readOnError) return;

        const _target = event.target as HTMLElement;
        if (target && containerRef.current?.contains(target)) {
          const _text = feedback?.onError || '發生錯誤';
          announce(text, 'assertive');
        }
      },
      [readOnError, feedback, announce]
    );

    // 處理成功事件
    const _handleSuccess = useCallback(
      (event: Event) => {
        if (!readOnSuccess) return;

        const _target = event.target as HTMLElement;
        if (target && containerRef.current?.contains(target)) {
          const _text = feedback?.onSuccess || '操作成功';
          announce(text);
        }
      },
      [readOnSuccess, feedback, announce]
    );

    // 自動朗讀
    const _handleAutoRead = useCallback(() => {
      if (!autoRead || !containerRef.current) return;

      // 查找需要自動朗讀的元素
      const _elements =
        containerRef.current.querySelectorAll('[data-auto-read]');
      elements.forEach(element => {
        const _text = element.getAttribute('data-auto-read');
        if (text) {
          speak(text);
        }
      });
    }, [autoRead, speak]);

    // 設置 ARIA 屬性
    const _setupARIA = useCallback(() => {
      if (!containerRef.current) return;

      // 為沒有 ARIA 標籤的交互元素添加標籤
      const _interactiveElements = containerRef.current.querySelectorAll(
        'button, input, select, textarea, a'
      );
      interactiveElements.forEach((element, index) => {
        const _el = element as HTMLElement;

        // 檢查是否已有 ARIA 標籤
        if (
          !el.getAttribute('aria-label') &&
          !el.getAttribute('aria-labelledby')
        ) {
          // 為按鈕添加標籤
          if (el.tagName === 'BUTTON') {
            const _buttonText = el.textContent?.trim();
            if (buttonText) {
              el.setAttribute('aria-label', buttonText);
            } else {
              el.setAttribute('aria-label', `按鈕 ${index + 1}`);
            }
          }

          // 為輸入框添加標籤
          if (el.tagName === 'INPUT') {
            const _placeholder = el.getAttribute('placeholder');
            const _type = el.getAttribute('type');
            if (placeholder) {
              el.setAttribute('aria-label', placeholder);
            } else if (type) {
              el.setAttribute('aria-label', `${type} 輸入框`);
            }
          }

          // 為鏈接添加標籤
          if (el.tagName === 'A') {
            const _linkText = el.textContent?.trim();
            if (linkText) {
              el.setAttribute('aria-label', linkText);
            } else {
              el.setAttribute('aria-label', `鏈接 ${index + 1}`);
            }
          }
        }
      });

      // 為圖片添加 alt 屬性
      const _images = containerRef.current.querySelectorAll('img');
      images.forEach((img, index) => {
        if (!img.alt && !img.getAttribute('aria-label')) {
          img.setAttribute('aria-label', `圖片 ${index + 1}`);
        }
      });
    }, []);

    // 初始化
    useEffect(() => {
      // 更新語音設置
      updateVoiceSettings();

      // 設置 ARIA 屬性
      setupARIA();

      // 添加事件監聽器
      const _container = containerRef.current;
      if (container) {
        container.addEventListener('focusin', handleFocusIn);
        container.addEventListener('change', handleChange);
        container.addEventListener('error', handleError);
        container.addEventListener('success', handleSuccess);
      }

      // 自動朗讀
      if (autoRead) {
        // 延遲執行，確保 DOM 已完全加載
        setTimeout(handleAutoRead, 100);
      }

      return () => {
        // 清理事件監聽器
        const _container = containerRef.current;
        if (container) {
          container.removeEventListener('focusin', handleFocusIn);
          container.removeEventListener('change', handleChange);
          container.removeEventListener('error', handleError);
          container.removeEventListener('success', handleSuccess);
        }

        // 停止語音
        stop();
      };
    }, [
      updateVoiceSettings,
      setupARIA,
      handleFocusIn,
      handleChange,
      handleError,
      handleSuccess,
      handleAutoRead,
      autoRead,
      stop,
    ]);

    // 監聽語音設置變化
    useEffect(() => {
      updateVoiceSettings();
    }, [voice, updateVoiceSettings]);

    // 監聽反饋設置變化
    useEffect(() => {
      // 反饋設置變化時不需要重新初始化
    }, [feedback]);

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

    // 暴露方法給父組件
    React.useImperativeHandle(
      ref,
      () =>
        ({
          speak,
          announce,
          readElement,
          stop,
          setupARIA,
        }) as any,
      [speak, announce, readElement, stop, setupARIA]
    );

    return (
      <div
        ref={mergedRef}
        className={`screen-reader ${className || ''}`}
        style={style}
        data-testid={testId || 'screen-reader'}
        role='application'
        aria-label='屏幕閱讀器支持'
        {...props}
      >
        {children}
      </div>
    );
  }
);

// 設置顯示名稱
ScreenReader.displayName = 'ScreenReader';

// 導出組件
export default ScreenReader;
