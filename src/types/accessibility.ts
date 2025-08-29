// 可訪問性基礎設施類型定義
// 符合 WCAG 2.1 AA 標準和 Section 508 要求

// 基礎可訪問性屬性
export interface AccessibilityProps {
  /** 元素的 ARIA 標籤 */
  'aria-label'?: string;
  /** 元素的 ARIA 描述 */
  'aria-describedby'?: string;
  /** 元素的 ARIA 標題 */
  'aria-labelledby'?: string;
  /** 元素的 ARIA 角色 */
  'aria-role'?: string;
  /** 元素是否隱藏 */
  'aria-hidden'?: boolean;
  /** 元素是否展開 */
  'aria-expanded'?: boolean;
  /** 元素是否選中 */
  'aria-selected'?: boolean;
  /** 元素是否按下 */
  'aria-pressed'?: boolean;
  /** 元素是否必填 */
  'aria-required'?: boolean;
  /** 元素是否無效 */
  'aria-invalid'?: boolean;
  /** 元素的當前值 */
  'aria-valuenow'?: number;
  /** 元素的最小值 */
  'aria-valuemin'?: number;
  /** 元素的最大值 */
  'aria-valuemax'?: number;
  /** 元素的當前值文本 */
  'aria-valuetext'?: string;
  /** 元素的活躍描述 */
  'aria-live'?: 'off' | 'polite' | 'assertive';
  /** 元素的原子性 */
  'aria-atomic'?: boolean;
  /** 元素的相關性 */
  'aria-relevant'?:
    | 'additions'
    | 'additions removals'
    | 'additions text'
    | 'all'
    | 'removals'
    | 'removals additions'
    | 'removals text'
    | 'text'
    | 'text additions'
    | 'text removals';
  /** 元素的忙狀態 */
  'aria-busy'?: boolean;
  /** 元素的控件 */
  'aria-controls'?: string;
  /** 元素的擁有者 */
  'aria-owns'?: string;
  /** 元素的流程 */
  'aria-flowto'?: string;
  /** 元素的目標 */
  'aria-target'?: string;
  /** 元素的激活鍵 */
  'aria-keyshortcuts'?: string;
  /** 元素的激活鍵描述 */
  'aria-keyshortcuts-description'?: string;
}

// ARIA 屬性擴展
export interface ARIAProps {
  // 標籤和描述
  label?: string;
  labelledBy?: string;
  describedBy?: string;

  // 角色和狀態
  role?: string;
  hidden?: boolean;
  expanded?: boolean;
  pressed?: boolean;
  checked?: boolean;
  selected?: boolean;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;

  // 實時區域
  live?: 'off' | 'polite' | 'assertive';
  atomic?: boolean;
  relevant?: string;
  busy?: boolean;

  // 導航和關係
  current?: boolean | 'page' | 'step' | 'location' | 'date' | 'time';
  controls?: string;
  owns?: string;

  // 列表和進度
  posinset?: number;
  setsize?: number;
  level?: number;

  // 數值
  valuemin?: number;
  valuemax?: number;
  valuenow?: number;
  valuetext?: string;
}

// 焦點管理配置
export interface FocusManagerConfig {
  /** 焦點陷阱是否啟用 */
  trapFocus?: boolean;
  /** 焦點恢復元素 */
  restoreFocus?: boolean;
  /** 焦點順序 */
  focusOrder?: string[];
  /** 焦點指示器樣式 */
  focusIndicator?: 'outline' | 'background' | 'border' | 'custom';
  /** 焦點指示器顏色 */
  focusIndicatorColor?: string;
  /** 焦點指示器寬度 */
  focusIndicatorWidth?: string;
  /** 焦點指示器樣式 */
  focusIndicatorStyle?: 'solid' | 'dashed' | 'dotted';
  /** 焦點指示器偏移 */
  focusIndicatorOffset?: string;
  /** 焦點指示器動畫 */
  focusIndicatorAnimation?: boolean;
  /** 焦點指示器持續時間 */
  focusIndicatorDuration?: number;
  /** 焦點指示器緩動函數 */
  focusIndicatorEasing?: string;
}

// 焦點管理狀態
export interface FocusManagerState {
  /** 當前焦點元素 */
  currentFocus: string | null;
  /** 焦點歷史 */
  focusHistory: string[];
  /** 焦點陷阱狀態 */
  isTrapped: boolean;
  /** 焦點指示器狀態 */
  showIndicator: boolean;
  /** 焦點順序 */
  focusOrder: string[];
  /** 焦點恢復元素 */
  restoreElement: string | null;
}

// 鍵盤導航配置
export interface KeyboardNavigationConfig {
  /** 是否啟用鍵盤導航 */
  enabled?: boolean;
  /** 導航模式 */
  mode?: 'linear' | 'grid' | 'tree' | 'custom';
  /** 方向鍵支持 */
  arrowKeys?: boolean;
  /** Tab 鍵支持 */
  tabKey?: boolean;
  /** Enter 鍵支持 */
  enterKey?: boolean;
  /** Escape 鍵支持 */
  escapeKey?: boolean;
  /** 空格鍵支持 */
  spaceKey?: boolean;
  /** 自定義快捷鍵 */
  shortcuts?: Record<string, string>;
  /** 鍵盤事件處理器 */
  handlers?: Record<string, (event: KeyboardEvent) => void>;
}

// 屏幕閱讀器配置
export interface ScreenReaderConfig {
  /** 是否啟用屏幕閱讀器支持 */
  enabled?: boolean;
  /** 語音設置 */
  voice?: {
    rate?: number;
    pitch?: number;
    volume?: number;
    language?: string;
  };
  /** 朗讀設置 */
  reading?: {
    autoRead?: boolean;
    readOnFocus?: boolean;
    readOnChange?: boolean;
    readOnError?: boolean;
    readOnSuccess?: boolean;
  };
  /** 語音反饋 */
  feedback?: {
    onFocus?: string;
    onBlur?: string;
    onChange?: string;
    onError?: string;
    onSuccess?: string;
    onComplete?: string;
  };
}

// 可訪問性配置
export interface AccessibilityConfig {
  /** 焦點管理配置 */
  focusManager?: FocusManagerConfig;
  /** 鍵盤導航配置 */
  keyboardNavigation?: KeyboardNavigationConfig;
  /** 屏幕閱讀器配置 */
  screenReader?: ScreenReaderConfig;
  /** 高對比度支持 */
  highContrast?: boolean;
  /** 減少動畫支持 */
  reducedMotion?: boolean;
  /** 大字體支持 */
  largeText?: boolean;
  /** 語音控制支持 */
  voiceControl?: boolean;
  /** 開關控制支持 */
  switchControl?: boolean;
  /** 輔助技術支持 */
  assistiveTechnology?: {
    screenReader?: boolean;
    voiceControl?: boolean;
    switchControl?: boolean;
    keyboardOnly?: boolean;
    mouseOnly?: boolean;
  };
}

// 可訪問性狀態
export interface AccessibilityState {
  /** 配置 */
  config: AccessibilityConfig;
  /** 焦點管理狀態 */
  focusManager: FocusManagerState;
  /** 當前可訪問性模式 */
  mode: 'default' | 'highContrast' | 'reducedMotion' | 'largeText';
  /** 輔助技術檢測 */
  assistiveTechnology: {
    screenReader: boolean;
    voiceControl: boolean;
    switchControl: boolean;
    keyboardOnly: boolean;
    mouseOnly: boolean;
  };
  /** 可訪問性分數 */
  score: number;
  /** 可訪問性問題 */
  issues: AccessibilityIssue[];
  /** 可訪問性建議 */
  suggestions: AccessibilitySuggestion[];
}

// 可訪問性問題
export interface AccessibilityIssue {
  /** 問題 ID */
  id: string;
  /** 問題類型 */
  type: 'error' | 'warning' | 'info';
  /** 問題描述 */
  description: string;
  /** 問題位置 */
  location: string;
  /** 問題嚴重程度 */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** 修復建議 */
  fix: string;
  /** WCAG 標準 */
  wcagCriteria: string[];
  /** 是否已修復 */
  fixed: boolean;
}

// 可訪問性建議
export interface AccessibilitySuggestion {
  /** 建議 ID */
  id: string;
  /** 建議類型 */
  type: 'improvement' | 'enhancement' | 'optimization';
  /** 建議描述 */
  description: string;
  /** 建議位置 */
  location: string;
  /** 建議優先級 */
  priority: 'low' | 'medium' | 'high';
  /** 實施建議 */
  implementation: string;
  /** 預期效果 */
  impact: string;
  /** 是否已實施 */
  implemented: boolean;
}

// 可訪問性測試配置
export interface AccessibilityTestConfig {
  /** 測試類型 */
  type: 'automated' | 'manual' | 'assistive';
  /** 測試標準 */
  standards: ('WCAG2.1AA' | 'WCAG2.1AAA' | 'Section508' | 'EN301549')[];
  /** 測試工具 */
  tools: string[];
  /** 測試環境 */
  environment: {
    browser?: string;
    screenReader?: string;
    assistiveTechnology?: string;
  };
  /** 測試範圍 */
  scope: 'component' | 'page' | 'application';
  /** 測試深度 */
  depth: 'basic' | 'comprehensive' | 'expert';
}

// 可訪問性測試結果
export interface AccessibilityTestResult {
  /** 測試 ID */
  id: string;
  /** 測試配置 */
  config: AccessibilityTestConfig;
  /** 測試時間 */
  timestamp: Date;
  /** 測試結果 */
  result: {
    passed: number;
    failed: number;
    warnings: number;
    total: number;
  };
  /** 詳細結果 */
  details: {
    issues: AccessibilityIssue[];
    suggestions: AccessibilitySuggestion[];
    score: number;
  };
  /** 測試報告 */
  report: string;
  /** 是否通過 */
  passed: boolean;
}

// 可訪問性事件
export interface AccessibilityEvent {
  /** 事件類型 */
  type:
    | 'focus'
    | 'blur'
    | 'change'
    | 'error'
    | 'success'
    | 'complete'
    | 'issue'
    | 'suggestion';
  /** 事件目標 */
  target: string;
  /** 事件數據 */
  data: unknown;
  /** 事件時間 */
  timestamp: Date;
  /** 事件上下文 */
  context: Record<string, any>;
}

// 可訪問性服務配置
export interface AccessibilityServiceConfig {
  /** 服務名稱 */
  name: string;
  /** 服務版本 */
  version: string;
  /** 默認配置 */
  defaultConfig: AccessibilityConfig;
  /** 測試配置 */
  testConfig: AccessibilityTestConfig;
  /** 事件處理器 */
  eventHandlers: Record<string, (event: AccessibilityEvent) => void>;
  /** 日誌設置 */
  logging: {
    enabled: boolean;
    level: 'debug' | 'info' | 'warn' | 'error';
    output: 'console' | 'file' | 'remote';
  };
}

// 可訪問性服務事件
export interface AccessibilityServiceEvent {
  /** 事件類型 */
  type: string;
  /** 事件數據 */
  data: unknown;
  /** 事件時間 */
  timestamp: Date;
  /** 事件來源 */
  source: string;
}

// 可訪問性服務接口
export interface AccessibilityService {
  /** 初始化服務 */
  init(config?: Partial<AccessibilityServiceConfig>): void;
  /** 更新配置 */
  updateConfig(config: Partial<AccessibilityConfig>): void;
  /** 獲取當前狀態 */
  getState(): AccessibilityState;
  /** 運行可訪問性測試 */
  runTest(
    config?: Partial<AccessibilityTestConfig>
  ): Promise<AccessibilityTestResult>;
  /** 生成測試報告 */
  generateReport(result: AccessibilityTestResult): string;
  /** 修復可訪問性問題 */
  fixIssues(issues: AccessibilityIssue[]): Promise<void>;
  /** 監聽事件 */
  onEvent(
    type: string,
    handler: (event: AccessibilityServiceEvent) => void
  ): void;
  /** 發送事件 */
  emitEvent(event: AccessibilityServiceEvent): void;
  /** 銷毀服務 */
  destroy(): void;
}

// 可訪問性 Hook 返回值
export interface UseAccessibilityReturn {
  /** 可訪問性狀態 */
  state: AccessibilityState;
  /** 焦點管理 */
  focusManager: {
    focus: (elementId: string) => void;
    blur: () => void;
    trap: (enabled: boolean) => void;
    restore: () => void;
    next: () => void;
    previous: () => void;
    first: () => void;
    last: () => void;
  };
  /** 鍵盤導航 */
  keyboardNavigation: {
    enable: () => void;
    disable: () => void;
    handleKeyDown: (event: KeyboardEvent) => void;
    handleKeyUp: (event: KeyboardEvent) => void;
  };
  /** 屏幕閱讀器 */
  screenReader: {
    speak: (text: string, priority?: 'polite' | 'assertive') => void;
    announce: (text: string) => void;
    read: (elementId: string) => void;
    stop: () => void;
  };
  /** 可訪問性工具 */
  tools: {
    runTest: (
      config?: Partial<AccessibilityTestConfig>
    ) => Promise<AccessibilityTestResult>;
    generateReport: (result: AccessibilityTestResult) => string;
    fixIssues: (issues: AccessibilityIssue[]) => Promise<void>;
    getIssues: () => AccessibilityIssue[];
    getSuggestions: () => AccessibilitySuggestion[];
  };
  /** 配置更新 */
  updateConfig: (config: Partial<AccessibilityConfig>) => void;
  /** 模式切換 */
  switchMode: (mode: AccessibilityState['mode']) => void;
}

// 可訪問性組件屬性
export interface AccessibilityComponentProps {
  /** 可訪問性配置 */
  accessibility?: Partial<AccessibilityConfig>;
  /** 焦點管理配置 */
  focusManager?: Partial<FocusManagerConfig>;
  /** 鍵盤導航配置 */
  keyboardNavigation?: Partial<KeyboardNavigationConfig>;
  /** 屏幕閱讀器配置 */
  screenReader?: Partial<ScreenReaderConfig>;
  /** 子組件 */
  children?: React.ReactNode;
  /** 樣式類名 */
  className?: string;
  /** 內聯樣式 */
  style?: React.CSSProperties;
  /** 測試 ID */
  testId?: string;
}

// 焦點管理組件屬性
export interface FocusManagerProps extends AccessibilityComponentProps {
  /** 焦點陷阱 */
  trapFocus?: boolean;
  /** 焦點恢復 */
  restoreFocus?: boolean;
  /** 焦點順序 */
  focusOrder?: string[];
  /** 焦點指示器 */
  focusIndicator?: FocusManagerConfig['focusIndicator'];
  /** 焦點指示器顏色 */
  focusIndicatorColor?: string;
  /** 焦點指示器寬度 */
  focusIndicatorWidth?: string;
  /** 焦點指示器樣式 */
  focusIndicatorStyle?: FocusManagerConfig['focusIndicatorStyle'];
  /** 焦點指示器偏移 */
  focusIndicatorOffset?: string;
  /** 焦點指示器動畫 */
  focusIndicatorAnimation?: boolean;
  /** 焦點指示器持續時間 */
  focusIndicatorDuration?: number;
  /** 焦點指示器緩動函數 */
  focusIndicatorEasing?: string;
  /** 焦點事件處理器 */
  onFocus?: (elementId: string) => void;
  /** 失焦事件處理器 */
  onBlur?: (elementId: string) => void;
  /** 焦點變化事件處理器 */
  onFocusChange?: (from: string, to: string) => void;
}

// 屏幕閱讀器組件屬性
export interface ScreenReaderProps extends AccessibilityComponentProps {
  /** 自動朗讀 */
  autoRead?: boolean;
  /** 焦點朗讀 */
  readOnFocus?: boolean;
  /** 變化朗讀 */
  readOnChange?: boolean;
  /** 錯誤朗讀 */
  readOnError?: boolean;
  /** 成功朗讀 */
  readOnSuccess?: boolean;
  /** 語音設置 */
  voice?: ScreenReaderConfig['voice'];
  /** 語音反饋 */
  feedback?: ScreenReaderConfig['feedback'];
  /** 朗讀事件處理器 */
  onSpeak?: (text: string, priority: string) => void;
  /** 停止朗讀事件處理器 */
  onStop?: () => void;
}

// 可訪問性測試工具屬性
export interface AccessibilityTestToolProps
  extends AccessibilityComponentProps {
  /** 測試配置 */
  testConfig?: Partial<AccessibilityTestConfig>;
  /** 測試結果 */
  testResult?: AccessibilityTestResult;
  /** 是否顯示測試工具 */
  showTool?: boolean;
  /** 測試工具位置 */
  toolPosition?: 'top' | 'bottom' | 'left' | 'right';
  /** 測試工具樣式 */
  toolStyle?: 'floating' | 'sidebar' | 'modal';
  /** 測試事件處理器 */
  onTestStart?: (config: AccessibilityTestConfig) => void;
  /** 測試完成事件處理器 */
  onTestComplete?: (result: AccessibilityTestResult) => void;
  /** 測試錯誤事件處理器 */
  onTestError?: (error: Error) => void;
}
