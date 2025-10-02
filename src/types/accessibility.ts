// 可訪問性基礎設施Class型定義
// 符合 WCAG 2.1 AA Standard和 Section 508 要求

// 基礎可訪問性Property
export interface AccessibilityProps {
  /** Element的 ARIA Tag */
  'aria-label'?: string;
  /** Element的 ARIA Description */
  'aria-describedby'?: string;
  /** Element的 ARIA 標題 */
  'aria-labelledby'?: string;
  /** Element的 ARIA 角色 */
  'aria-role'?: string;
  /** ElementYesNoHide */
  'aria-hidden'?: boolean;
  /** ElementYesNo展On */
  'aria-expanded'?: boolean;
  /** ElementYesNo選中 */
  'aria-selected'?: boolean;
  /** ElementYesNo按下 */
  'aria-pressed'?: boolean;
  /** ElementYesNo必填 */
  'aria-required'?: boolean;
  /** ElementYesNo無效 */
  'aria-invalid'?: boolean;
  /** Element的當前Value */
  'aria-valuenow'?: number;
  /** Element的最小Value */
  'aria-valuemin'?: number;
  /** Element的最大Value */
  'aria-valuemax'?: number;
  /** Element的當前Value文本 */
  'aria-valuetext'?: string;
  /** Element的活躍Description */
  'aria-live'?: 'off' | 'polite' | 'assertive';
  /** Element的原子性 */
  'aria-atomic'?: boolean;
  /** Element的相Off性 */
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
  /** Element的忙Status */
  'aria-busy'?: boolean;
  /** Element的控件 */
  'aria-controls'?: string;
  /** Element的擁有者 */
  'aria-owns'?: string;
  /** Element的流程 */
  'aria-flowto'?: string;
  /** Element的目標 */
  'aria-target'?: string;
  /** Element的ActivateKey */
  'aria-keyshortcuts'?: string;
  /** Element的ActivateKeyDescription */
  'aria-keyshortcuts-description'?: string;
}

// ARIA PropertyExtension
export interface ARIAProps {
  // Tag和Description
  label?: string;
  labelledBy?: string;
  describedBy?: string;

  // 角色和Status
  role?: string;
  hidden?: boolean;
  expanded?: boolean;
  pressed?: boolean;
  checked?: boolean;
  selected?: boolean;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;

  // 實Timezone域
  live?: 'off' | 'polite' | 'assertive';
  atomic?: boolean;
  relevant?: string;
  busy?: boolean;

  // 導航和Off係
  current?: boolean | 'page' | 'step' | 'location' | 'date' | 'time';
  controls?: string;
  owns?: string;

  // List和進度
  posinset?: number;
  setsize?: number;
  level?: number;

  // 數Value
  valuemin?: number;
  valuemax?: number;
  valuenow?: number;
  valuetext?: string;
}

// 焦點ManageConfigure
export interface FocusManagerConfig {
  /** 焦點陷阱YesNoEnable */
  trapFocus?: boolean;
  /** 焦點RestoreElement */
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
  /** 焦點指示器Offset */
  focusIndicatorOffset?: string;
  /** 焦點指示器動畫 */
  focusIndicatorAnimation?: boolean;
  /** 焦點指示器持續Time */
  focusIndicatorDuration?: number;
  /** 焦點指示器緩動Function */
  focusIndicatorEasing?: string;
}

// 焦點ManageStatus
export interface FocusManagerState {
  /** 當前焦點Element */
  currentFocus: string | null;
  /** 焦點歷史 */
  focusHistory: string[];
  /** 焦點陷阱Status */
  isTrapped: boolean;
  /** 焦點指示器Status */
  showIndicator: boolean;
  /** 焦點順序 */
  focusOrder: string[];
  /** 焦點RestoreElement */
  restoreElement: string | null;
}

// Key盤導航Configure
export interface KeyboardNavigationConfig {
  /** YesNoEnableKey盤導航 */
  enabled?: boolean;
  /** 導航模式 */
  mode?: 'linear' | 'grid' | 'tree' | 'custom';
  /** 方向KeySupport */
  arrowKeys?: boolean;
  /** Tab KeySupport */
  tabKey?: boolean;
  /** Enter KeySupport */
  enterKey?: boolean;
  /** Escape KeySupport */
  escapeKey?: boolean;
  /** Empty格KeySupport */
  spaceKey?: boolean;
  /** Custom快捷Key */
  shortcuts?: Record<string, string>;
  /** Key盤EventHandle器 */
  handlers?: Record<string, (event: KeyboardEvent) => void>;
}

// 屏幕閱讀器Configure
export interface ScreenReaderConfig {
  /** YesNoEnable屏幕閱讀器Support */
  enabled?: boolean;
  /** 語音Settings */
  voice?: {
    rate?: number;
    pitch?: number;
    volume?: number;
    language?: string;
  };
  /** 朗讀Settings */
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

// 可訪問性Configure
export interface AccessibilityConfig {
  /** 焦點ManageConfigure */
  focusManager?: FocusManagerConfig;
  /** Key盤導航Configure */
  keyboardNavigation?: KeyboardNavigationConfig;
  /** 屏幕閱讀器Configure */
  screenReader?: ScreenReaderConfig;
  /** 高對比度Support */
  highContrast?: boolean;
  /** 減少動畫Support */
  reducedMotion?: boolean;
  /** 大字體Support */
  largeText?: boolean;
  /** 語音ControlSupport */
  voiceControl?: boolean;
  /** OnOffControlSupport */
  switchControl?: boolean;
  /** 輔助技術Support */
  assistiveTechnology?: {
    screenReader?: boolean;
    voiceControl?: boolean;
    switchControl?: boolean;
    keyboardOnly?: boolean;
    mouseOnly?: boolean;
  };
}

// 可訪問性Status
export interface AccessibilityState {
  /** Configure */
  config: AccessibilityConfig;
  /** 焦點ManageStatus */
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
  /** 問題Class型 */
  type: 'error' | 'warning' | 'info';
  /** 問題Description */
  description: string;
  /** 問題位置 */
  location: string;
  /** 問題嚴重程度 */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** 修復建議 */
  fix: string;
  /** WCAG Standard */
  wcagCriteria: string[];
  /** YesNo已修復 */
  fixed: boolean;
}

// 可訪問性建議
export interface AccessibilitySuggestion {
  /** 建議 ID */
  id: string;
  /** 建議Class型 */
  type: 'improvement' | 'enhancement' | 'optimization';
  /** 建議Description */
  description: string;
  /** 建議位置 */
  location: string;
  /** 建議優先級 */
  priority: 'low' | 'medium' | 'high';
  /** 實施建議 */
  implementation: string;
  /** 預期效果 */
  impact: string;
  /** YesNo已實施 */
  implemented: boolean;
}

// 可訪問性TestConfigure
export interface AccessibilityTestConfig {
  /** TestClass型 */
  type: 'automated' | 'manual' | 'assistive';
  /** TestStandard */
  standards: ('WCAG2.1AA' | 'WCAG2.1AAA' | 'Section508' | 'EN301549')[];
  /** TestTool */
  tools: string[];
  /** Test環境 */
  environment: {
    browser?: string;
    screenReader?: string;
    assistiveTechnology?: string;
  };
  /** Test範圍 */
  scope: 'component' | 'page' | 'application';
  /** Test深度 */
  depth: 'basic' | 'comprehensive' | 'expert';
}

// 可訪問性Test結果
export interface AccessibilityTestResult {
  /** Test ID */
  id: string;
  /** TestConfigure */
  config: AccessibilityTestConfig;
  /** TestTime */
  timestamp: Date;
  /** Test結果 */
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
  /** TestReport */
  report: string;
  /** YesNo通過 */
  passed: boolean;
}

// 可訪問性Event
export interface AccessibilityEvent {
  /** EventClass型 */
  type:
    | 'focus'
    | 'blur'
    | 'change'
    | 'error'
    | 'success'
    | 'complete'
    | 'issue'
    | 'suggestion';
  /** Event目標 */
  target: string;
  /** EventData */
  data: unknown;
  /** EventTime */
  timestamp: Date;
  /** Event上下文 */
  context: Record<string, any>;
}

// 可訪問性ServiceConfigure
export interface AccessibilityServiceConfig {
  /** Service名稱 */
  name: string;
  /** ServiceVersion */
  version: string;
  /** DefaultConfigure */
  defaultConfig: AccessibilityConfig;
  /** TestConfigure */
  testConfig: AccessibilityTestConfig;
  /** EventHandle器 */
  eventHandlers: Record<string, (event: AccessibilityEvent) => void>;
  /** LogSettings */
  logging: {
    enabled: boolean;
    level: 'debug' | 'info' | 'warn' | 'error';
    output: 'console' | 'file' | 'remote';
  };
}

// 可訪問性ServiceEvent
export interface AccessibilityServiceEvent {
  /** EventClass型 */
  type: string;
  /** EventData */
  data: unknown;
  /** EventTime */
  timestamp: Date;
  /** Event來源 */
  source: string;
}

// 可訪問性ServiceInterface
export interface AccessibilityService {
  /** InitializeService */
  init(config?: Partial<AccessibilityServiceConfig>): void;
  /** UpdateConfigure */
  updateConfig(config: Partial<AccessibilityConfig>): void;
  /** Get當前Status */
  getState(): AccessibilityState;
  /** 運Row可訪問性Test */
  runTest(
    config?: Partial<AccessibilityTestConfig>
  ): Promise<AccessibilityTestResult>;
  /** 生成TestReport */
  generateReport(result: AccessibilityTestResult): string;
  /** 修復可訪問性問題 */
  fixIssues(issues: AccessibilityIssue[]): Promise<void>;
  /** 監聽Event */
  onEvent(
    type: string,
    handler: (event: AccessibilityServiceEvent) => void
  ): void;
  /** SendEvent */
  emitEvent(event: AccessibilityServiceEvent): void;
  /** 銷毀Service */
  destroy(): void;
}

// 可訪問性 Hook ReturnValue
export interface UseAccessibilityReturn {
  /** 可訪問性Status */
  state: AccessibilityState;
  /** 焦點Manage */
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
  /** Key盤導航 */
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
  /** 可訪問性Tool */
  tools: {
    runTest: (
      config?: Partial<AccessibilityTestConfig>
    ) => Promise<AccessibilityTestResult>;
    generateReport: (result: AccessibilityTestResult) => string;
    fixIssues: (issues: AccessibilityIssue[]) => Promise<void>;
    getIssues: () => AccessibilityIssue[];
    getSuggestions: () => AccessibilitySuggestion[];
  };
  /** ConfigureUpdate */
  updateConfig: (config: Partial<AccessibilityConfig>) => void;
  /** 模式Switch */
  switchMode: (mode: AccessibilityState['mode']) => void;
}

// 可訪問性ComponentProperty
export interface AccessibilityComponentProps {
  /** 可訪問性Configure */
  accessibility?: Partial<AccessibilityConfig>;
  /** 焦點ManageConfigure */
  focusManager?: Partial<FocusManagerConfig>;
  /** Key盤導航Configure */
  keyboardNavigation?: Partial<KeyboardNavigationConfig>;
  /** 屏幕閱讀器Configure */
  screenReader?: Partial<ScreenReaderConfig>;
  /** 子Component */
  children?: React.ReactNode;
  /** 樣式Class名 */
  className?: string;
  /** 內聯樣式 */
  style?: React.CSSProperties;
  /** Test ID */
  testId?: string;
}

// 焦點ManageComponentProperty
export interface FocusManagerProps extends AccessibilityComponentProps {
  /** 焦點陷阱 */
  trapFocus?: boolean;
  /** 焦點Restore */
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
  /** 焦點指示器Offset */
  focusIndicatorOffset?: string;
  /** 焦點指示器動畫 */
  focusIndicatorAnimation?: boolean;
  /** 焦點指示器持續Time */
  focusIndicatorDuration?: number;
  /** 焦點指示器緩動Function */
  focusIndicatorEasing?: string;
  /** 焦點EventHandle器 */
  onFocus?: (elementId: string) => void;
  /** 失焦EventHandle器 */
  onBlur?: (elementId: string) => void;
  /** 焦點變化EventHandle器 */
  onFocusChange?: (from: string, to: string) => void;
}

// 屏幕閱讀器ComponentProperty
export interface ScreenReaderProps extends AccessibilityComponentProps {
  /** Auto朗讀 */
  autoRead?: boolean;
  /** 焦點朗讀 */
  readOnFocus?: boolean;
  /** 變化朗讀 */
  readOnChange?: boolean;
  /** Error朗讀 */
  readOnError?: boolean;
  /** Success朗讀 */
  readOnSuccess?: boolean;
  /** 語音Settings */
  voice?: ScreenReaderConfig['voice'];
  /** 語音反饋 */
  feedback?: ScreenReaderConfig['feedback'];
  /** 朗讀EventHandle器 */
  onSpeak?: (text: string, priority: string) => void;
  /** Stop朗讀EventHandle器 */
  onStop?: () => void;
}

// 可訪問性TestToolProperty
export interface AccessibilityTestToolProps
  extends AccessibilityComponentProps {
  /** TestConfigure */
  testConfig?: Partial<AccessibilityTestConfig>;
  /** Test結果 */
  testResult?: AccessibilityTestResult;
  /** YesNoShowTestTool */
  showTool?: boolean;
  /** TestTool位置 */
  toolPosition?: 'top' | 'bottom' | 'left' | 'right';
  /** TestTool樣式 */
  toolStyle?: 'floating' | 'sidebar' | 'modal';
  /** TestEventHandle器 */
  onTestStart?: (config: AccessibilityTestConfig) => void;
  /** TestCompleteEventHandle器 */
  onTestComplete?: (result: AccessibilityTestResult) => void;
  /** TestErrorEventHandle器 */
  onTestError?: (error: Error) => void;
}
