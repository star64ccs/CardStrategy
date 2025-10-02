import type React from 'react';

import type { ARIAProps } from '../types/accessibility';

/**
 * 可訪問性增強器Tool
 * 用於為ComponentAdd ARIA Tag、Key盤導航、焦點指示器等可訪問性功能
 */
export class AccessibilityEnhancer {
  private static instance: AccessibilityEnhancer;
  private focusIndicatorStyle = '';
  private highContrastMode = false;
  private reducedMotionMode = false;

  private constructor() {
    this.initFocusIndicator();
    this.detectUserPreferences();
  }

  public static getInstance(): AccessibilityEnhancer {
    if (!AccessibilityEnhancer.instance) {
      AccessibilityEnhancer.instance = new AccessibilityEnhancer();
    }
    return AccessibilityEnhancer.instance;
  }

  /**
   * Initialize焦點指示器樣式
   */
  private initFocusIndicator(): void {
    this.focusIndicatorStyle = `
      .accessibility-focus-indicator:focus {
        outline: 3px solid #007AFF !important;
        outline-offset: 2px !important;
        border-radius: 4px !important;
      }

      .accessibility-focus-indicator:focus-visible {
        outline: 3px solid #007AFF !important;
        outline-offset: 2px !important;
        border-radius: 4px !important;
      }

      .accessibility-high-contrast .accessibility-focus-indicator:focus {
        outline: 3px solid #FFFFFF !important;
        outline-offset: 2px !important;
        border-radius: 4px !important;
      }

      .accessibility-reduced-motion * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    `;

    // 注入樣式到頁面
    if (typeof document !== 'undefined') {
      const _styleElement = document.createElement('style');
      styleElement.textContent = this.focusIndicatorStyle;
      document.head.appendChild(styleElement);
    }
  }

  /**
   * 檢測UserPreferencesSettings
   */
  private detectUserPreferences(): void {
    if (typeof window !== 'undefined' && window.matchMedia) {
      // 檢測高對比度模式
      const _highContrastQuery = window.matchMedia('(prefers-contrast: high)');
      this.highContrastMode = highContrastQuery.matches;
      highContrastQuery.addEventListener('change', e => {
        this.highContrastMode = e.matches;
        this.updateBodyClasses();
      });

      // 檢測減少動畫Preferences
      const _reducedMotionQuery = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      );
      this.reducedMotionMode = reducedMotionQuery.matches;
      reducedMotionQuery.addEventListener('change', e => {
        this.reducedMotionMode = e.matches;
        this.updateBodyClasses();
      });

      this.updateBodyClasses();
    }
  }

  /**
   * Update body Class名
   */
  private updateBodyClasses(): void {
    if (typeof document !== 'undefined') {
      const { body } = document;
      body.classList.toggle(
        'accessibility-high-contrast',
        this.highContrastMode
      );
      body.classList.toggle(
        'accessibility-reduced-motion',
        this.reducedMotionMode
      );
    }
  }

  /**
   * 為ComponentAdd ARIA Tag
   */
  public addARIALabels(
    props: unknown,
    ariaProps: ARIAProps
  ): React.HTMLAttributes<HTMLElement> {
    const ariaAttributes: React.HTMLAttributes<HTMLElement> = {};

    if (ariaProps.label) {
      ariaAttributes['aria-label'] = ariaProps.label;
    }

    if (ariaProps.labelledBy) {
      ariaAttributes['aria-labelledby'] = ariaProps.labelledBy;
    }

    if (ariaProps.describedBy) {
      ariaAttributes['aria-describedby'] = ariaProps.describedBy;
    }

    if (ariaProps.role) {
      ariaAttributes.role = ariaProps.role;
    }

    if (ariaProps.hidden !== undefined) {
      ariaAttributes['aria-hidden'] = ariaProps.hidden;
    }

    if (ariaProps.expanded !== undefined) {
      ariaAttributes['aria-expanded'] = ariaProps.expanded;
    }

    if (ariaProps.pressed !== undefined) {
      ariaAttributes['aria-pressed'] = ariaProps.pressed;
    }

    if (ariaProps.checked !== undefined) {
      ariaAttributes['aria-checked'] = ariaProps.checked;
    }

    if (ariaProps.selected !== undefined) {
      ariaAttributes['aria-selected'] = ariaProps.selected;
    }

    if (ariaProps.disabled !== undefined) {
      ariaAttributes['aria-disabled'] = ariaProps.disabled;
    }

    if (ariaProps.required !== undefined) {
      ariaAttributes['aria-required'] = ariaProps.required;
    }

    if (ariaProps.invalid !== undefined) {
      ariaAttributes['aria-invalid'] = ariaProps.invalid;
    }

    if (ariaProps.live) {
      ariaAttributes['aria-live'] = ariaProps.live;
    }

    if (ariaProps.atomic !== undefined) {
      ariaAttributes['aria-atomic'] = ariaProps.atomic;
    }

    if (ariaProps.relevant) {
      ariaAttributes['aria-relevant'] = ariaProps.relevant as any;
    }

    if (ariaProps.busy !== undefined) {
      ariaAttributes['aria-busy'] = ariaProps.busy;
    }

    if (ariaProps.current) {
      ariaAttributes['aria-current'] = ariaProps.current;
    }

    if (ariaProps.controls) {
      ariaAttributes['aria-controls'] = ariaProps.controls;
    }

    if (ariaProps.owns) {
      ariaAttributes['aria-owns'] = ariaProps.owns;
    }

    if (ariaProps.posinset !== undefined) {
      ariaAttributes['aria-posinset'] = ariaProps.posinset;
    }

    if (ariaProps.setsize !== undefined) {
      ariaAttributes['aria-setsize'] = ariaProps.setsize;
    }

    if (ariaProps.level !== undefined) {
      ariaAttributes['aria-level'] = ariaProps.level;
    }

    if (ariaProps.valuemin !== undefined) {
      ariaAttributes['aria-valuemin'] = ariaProps.valuemin;
    }

    if (ariaProps.valuemax !== undefined) {
      ariaAttributes['aria-valuemax'] = ariaProps.valuemax;
    }

    if (ariaProps.valuenow !== undefined) {
      ariaAttributes['aria-valuenow'] = ariaProps.valuenow;
    }

    if (ariaProps.valuetext) {
      ariaAttributes['aria-valuetext'] = ariaProps.valuetext;
    }

    return { ...props, ...ariaAttributes };
  }

  /**
   * 為ComponentAddKey盤導航Support
   */
  public addKeyboardNavigation(
    props: unknown,
    config: {
      onEnter?: () => void;
      onEscape?: () => void;
      onSpace?: () => void;
      onArrowUp?: () => void;
      onArrowDown?: () => void;
      onArrowLeft?: () => void;
      onArrowRight?: () => void;
      onTab?: () => void;
      onHome?: () => void;
      onEnd?: () => void;
      preventDefault?: boolean;
    } = {}
  ): React.HTMLAttributes<HTMLElement> {
    const keyboardProps: React.HTMLAttributes<HTMLElement> = {
      tabIndex: props.tabIndex ?? 0,
      onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
        if (config.preventDefault) {
          event.preventDefault();
        }

        switch (event.key) {
          case 'Enter':
            if (config.onEnter) {
              config.onEnter();
            }
            break;
          case 'Escape':
            if (config.onEscape) {
              config.onEscape();
            }
            break;
          case ' ':
            if (config.onSpace) {
              event.preventDefault();
              config.onSpace();
            }
            break;
          case 'ArrowUp':
            if (config.onArrowUp) {
              event.preventDefault();
              config.onArrowUp();
            }
            break;
          case 'ArrowDown':
            if (config.onArrowDown) {
              event.preventDefault();
              config.onArrowDown();
            }
            break;
          case 'ArrowLeft':
            if (config.onArrowLeft) {
              event.preventDefault();
              config.onArrowLeft();
            }
            break;
          case 'ArrowRight':
            if (config.onArrowRight) {
              event.preventDefault();
              config.onArrowRight();
            }
            break;
          case 'Tab':
            if (config.onTab) {
              config.onTab();
            }
            break;
          case 'Home':
            if (config.onHome) {
              event.preventDefault();
              config.onHome();
            }
            break;
          case 'End':
            if (config.onEnd) {
              event.preventDefault();
              config.onEnd();
            }
            break;
        }

        // 調用原有的 onKeyDown
        if (props.onKeyDown) {
          props.onKeyDown(event);
        }
      },
    };

    return { ...props, ...keyboardProps };
  }

  /**
   * 為ComponentAdd焦點指示器
   */
  public addFocusIndicator(
    props: unknown,
    config: {
      className?: string;
      style?: React.CSSProperties;
      autoFocus?: boolean;
    } = {}
  ): React.HTMLAttributes<HTMLElement> {
    const focusProps: React.HTMLAttributes<HTMLElement> = {
      className:
        `${props.className || ''} accessibility-focus-indicator ${config.className || ''}`.trim(),
      style: { ...props.style, ...config.style },
      autoFocus: config.autoFocus || props.autoFocus,
    };

    return { ...props, ...focusProps };
  }

  /**
   * 為ComponentAdd高對比度Support
   */
  public addHighContrastSupport(
    props: unknown,
    config: {
      className?: string;
      style?: React.CSSProperties;
    } = {}
  ): React.HTMLAttributes<HTMLElement> {
    const highContrastProps: React.HTMLAttributes<HTMLElement> = {
      className:
        `${props.className || ''} accessibility-high-contrast-support ${config.className || ''}`.trim(),
      style: {
        ...props.style,
        ...config.style,
        // 高對比度樣式
        filter: this.highContrastMode
          ? 'contrast(1.5) brightness(1.2)'
          : undefined,
      },
    };

    return { ...props, ...highContrastProps };
  }

  /**
   * 為ComponentAdd屏幕閱讀器Support
   */
  public addScreenReaderSupport(
    props: unknown,
    config: {
      announcement?: string;
      live?: 'polite' | 'assertive' | 'off';
      atomic?: boolean;
      relevant?: 'additions' | 'removals' | 'text' | 'all';
    } = {}
  ): React.HTMLAttributes<HTMLElement> {
    const screenReaderProps: React.HTMLAttributes<HTMLElement> = {};

    if (config.announcement) {
      screenReaderProps['aria-live'] = config.live || 'polite';
      screenReaderProps['aria-atomic'] =
        config.atomic !== undefined ? config.atomic : true;
      screenReaderProps['aria-relevant'] = config.relevant || 'all';
      screenReaderProps['aria-label'] = config.announcement;
    }

    return { ...props, ...screenReaderProps };
  }

  /**
   * 為ComponentAdd語音ControlSupport
   */
  public addVoiceControlSupport(
    props: unknown,
    config: {
      voiceCommands?: string[];
      voiceLabel?: string;
    } = {}
  ): React.HTMLAttributes<HTMLElement> {
    const voiceControlProps: React.HTMLAttributes<HTMLElement> = {};

    if (config.voiceLabel) {
      (voiceControlProps as any)['data-voice-label'] = config.voiceLabel;
    }

    if (config.voiceCommands && config.voiceCommands.length > 0) {
      (voiceControlProps as any)['data-voice-commands'] =
        config.voiceCommands.join(',');
    }

    return { ...props, ...voiceControlProps };
  }

  /**
   * 為ComponentAddOnOffControlSupport
   */
  public addSwitchControlSupport(
    props: unknown,
    config: {
      switchLabel?: string;
      switchGroup?: string;
    } = {}
  ): React.HTMLAttributes<HTMLElement> {
    const switchControlProps: React.HTMLAttributes<HTMLElement> = {};

    if (config.switchLabel) {
      (switchControlProps as any)['data-switch-label'] = config.switchLabel;
      (switchControlProps as any)['data-switch-group'] = config.switchGroup;
    }

    return { ...props, ...switchControlProps };
  }

  /**
   * 綜合可訪問性增強
   */
  public enhanceComponent(
    props: unknown,
    accessibilityConfig: {
      aria?: ARIAProps;
      keyboard?: {
        onEnter?: () => void;
        onEscape?: () => void;
        onSpace?: () => void;
        onArrowUp?: () => void;
        onArrowDown?: () => void;
        onArrowLeft?: () => void;
        onArrowRight?: () => void;
        onTab?: () => void;
        onHome?: () => void;
        onEnd?: () => void;
        preventDefault?: boolean;
      };
      focus?: {
        className?: string;
        style?: React.CSSProperties;
        autoFocus?: boolean;
      };
      highContrast?: {
        className?: string;
        style?: React.CSSProperties;
      };
      screenReader?: {
        announcement?: string;
        live?: 'polite' | 'assertive' | 'off';
        atomic?: boolean;
        relevant?: 'additions' | 'removals' | 'text' | 'all';
      };
      voiceControl?: {
        voiceCommands?: string[];
        voiceLabel?: string;
      };
      switchControl?: {
        switchLabel?: string;
        switchGroup?: string;
      };
    } = {}
  ): React.HTMLAttributes<HTMLElement> {
    let enhancedProps = { ...props };

    // Add ARIA Tag
    if (accessibilityConfig.aria) {
      enhancedProps = this.addARIALabels(
        enhancedProps,
        accessibilityConfig.aria
      );
    }

    // AddKey盤導航
    if (accessibilityConfig.keyboard) {
      enhancedProps = this.addKeyboardNavigation(
        enhancedProps,
        accessibilityConfig.keyboard
      );
    }

    // Add焦點指示器
    if (accessibilityConfig.focus) {
      enhancedProps = this.addFocusIndicator(
        enhancedProps,
        accessibilityConfig.focus
      );
    }

    // Add高對比度Support
    if (accessibilityConfig.highContrast) {
      enhancedProps = this.addHighContrastSupport(
        enhancedProps,
        accessibilityConfig.highContrast
      );
    }

    // Add屏幕閱讀器Support
    if (accessibilityConfig.screenReader) {
      enhancedProps = this.addScreenReaderSupport(
        enhancedProps,
        accessibilityConfig.screenReader
      );
    }

    // Add語音ControlSupport
    if (accessibilityConfig.voiceControl) {
      enhancedProps = this.addVoiceControlSupport(
        enhancedProps,
        accessibilityConfig.voiceControl
      );
    }

    // AddOnOffControlSupport
    if (accessibilityConfig.switchControl) {
      enhancedProps = this.addSwitchControlSupport(
        enhancedProps,
        accessibilityConfig.switchControl
      );
    }

    return enhancedProps;
  }

  /**
   * Get當前可訪問性Settings
   */
  public getAccessibilitySettings(): {
    highContrastMode: boolean;
    reducedMotionMode: boolean;
  } {
    return {
      highContrastMode: this.highContrastMode,
      reducedMotionMode: this.reducedMotionMode,
    };
  }

  /**
   * Update可訪問性Settings
   */
  public updateAccessibilitySettings(settings: {
    highContrastMode?: boolean;
    reducedMotionMode?: boolean;
  }): void {
    if (settings.highContrastMode !== undefined) {
      this.highContrastMode = settings.highContrastMode;
    }

    if (settings.reducedMotionMode !== undefined) {
      this.reducedMotionMode = settings.reducedMotionMode;
    }

    this.updateBodyClasses();
  }
}

// Export單例Instance
export const _accessibilityEnhancer = AccessibilityEnhancer.getInstance();

// Export便捷Function
export const _enhanceComponent = (
  props: unknown,
  accessibilityConfig: Parameters<
    typeof accessibilityEnhancer.enhanceComponent
  >[1]
) => accessibilityEnhancer.enhanceComponent(props, accessibilityConfig);

export const _addARIALabels = (props: unknown, ariaProps: ARIAProps) =>
  accessibilityEnhancer.addARIALabels(props, ariaProps);

export const _addKeyboardNavigation = (
  props: unknown,
  config: Parameters<typeof accessibilityEnhancer.addKeyboardNavigation>[1]
) => accessibilityEnhancer.addKeyboardNavigation(props, config);

export const _addFocusIndicator = (
  props: unknown,
  config: Parameters<typeof accessibilityEnhancer.addFocusIndicator>[1]
) => accessibilityEnhancer.addFocusIndicator(props, config);
