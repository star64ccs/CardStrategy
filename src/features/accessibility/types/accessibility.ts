// 無障礙功能Class型定義
export interface AccessibilityConfig {
  // 視覺輔助
  highContrast: boolean;
  largeText: boolean;
  boldText: boolean;
  reduceMotion: boolean;
  reduceTransparency: boolean;

  // 聽覺輔助
  closedCaptions: boolean;
  audioDescriptions: boolean;
  monoAudio: boolean;

  // 語音輔助
  screenReader: boolean;
  voiceOver: boolean;
  talkBack: boolean;

  // 交互輔助
  switchControl: boolean;
  assistiveTouch: boolean;
  guidedAccess: boolean;

  // 認知輔助
  simplifiedInterface: boolean;
  focusIndicators: boolean;
  errorPrevention: boolean;

  // 運動輔助
  touchAccommodations: boolean;
  shakeToUndo: boolean;
  homeClickSpeed: 'slow' | 'normal' | 'fast';
}

export interface AccessibilityState {
  config: AccessibilityConfig;
  isEnabled: boolean;
  currentProfile: string;
  availableProfiles: AccessibilityProfile[];
  isLoading: boolean;
  error: string | null;
}

export interface AccessibilityProfile {
  id: string;
  name: string;
  description: string;
  config: AccessibilityConfig;
  isDefault: boolean;
}

export interface AccessibilityEvent {
  type:
    | 'config_changed'
    | 'profile_changed'
    | 'feature_toggled'
    | 'error_occurred';
  feature?: keyof AccessibilityConfig;
  value?: boolean;
  profileId?: string;
  timestamp: number;
  data?: unknown;
}

export interface AccessibilityManager {
  // ConfigureManage
  getConfig(): AccessibilityConfig;
  updateConfig(config: Partial<AccessibilityConfig>): Promise<void>;
  resetConfig(): Promise<void>;

  // ConfigureFileManage
  getCurrentProfile(): AccessibilityProfile;
  getAvailableProfiles(): AccessibilityProfile[];
  switchProfile(profileId: string): Promise<void>;
  createProfile(profile: Omit<AccessibilityProfile, 'id'>): Promise<void>;
  deleteProfile(profileId: string): Promise<void>;

  // 功能Check
  isFeatureEnabled(feature: keyof AccessibilityConfig): boolean;
  toggleFeature(feature: keyof AccessibilityConfig): Promise<void>;

  // 系統集成
  checkSystemAccessibility(): Promise<Partial<AccessibilityConfig>>;
  applySystemSettings(): Promise<void>;

  // EventManage
  addEventListener(listener: (event: AccessibilityEvent) => void): void;
  removeEventListener(listener: (event: AccessibilityEvent) => void): void;
}

// 無障礙功能ToolClass型
export interface AccessibilityTools {
  // 語音合成
  speak(text: string, options?: SpeechOptions): Promise<void>;
  stopSpeaking(): void;
  isSpeaking(): boolean;

  // 振動反饋
  vibrate(pattern?: number | number[]): void;
  hapticFeedback(
    type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'
  ): void;

  // 焦點Manage
  setFocus(elementId: string): Promise<boolean>;
  getFocusedElement(): string | null;
  moveFocus(
    direction: 'next' | 'previous' | 'up' | 'down' | 'left' | 'right'
  ): Promise<boolean>;

  // 顏色對比度
  calculateContrastRatio(color1: string, color2: string): number;
  isHighContrast(color1: string, color2: string): boolean;
  suggestContrastColor(baseColor: string, targetRatio: number): string;
}

export interface SpeechOptions {
  rate?: number; // 語音速度 (0.1 - 2.0)
  pitch?: number; // 音調 (0.5 - 2.0)
  volume?: number; // 音量 (0.0 - 1.0)
  language?: string; // Language代碼
  voice?: string; // 語音名稱
  priority?: 'high' | 'normal' | 'low';
  interrupt?: boolean; // YesNo中斷當前語音
}

// 無障礙ComponentProperty
export interface AccessibilityProps {
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityComponentState;
  accessibilityActions?: AccessibilityAction[];
  accessibilityViewIsModal?: boolean;
  accessibilityElementsHidden?: boolean;
  accessibilityIgnoresInvertColors?: boolean;
  accessibilityLiveRegion?: 'none' | 'polite' | 'assertive';
  accessibilityTraits?: AccessibilityTrait[];
  onAccessibilityAction?: (event: AccessibilityActionEvent) => void;
  onAccessibilityTap?: () => void;
  onMagicTap?: () => void;
}

export type AccessibilityRole =
  | 'none'
  | 'button'
  | 'link'
  | 'search'
  | 'image'
  | 'keyboardkey'
  | 'text'
  | 'adjustable'
  | 'allowsDirectInteraction'
  | 'frequentUpdates'
  | 'imageButton'
  | 'listItem'
  | 'progressbar'
  | 'radio'
  | 'selected'
  | 'startsMediaSession'
  | 'summary'
  | 'switch'
  | 'tab'
  | 'tabBar'
  | 'toolbar'
  | 'webView'
  | 'header'
  | 'menu'
  | 'menubar'
  | 'menuitem'
  | 'scrollbar'
  | 'searchbox'
  | 'spinbutton'
  | 'tablist'
  | 'timer'
  | 'tooltip'
  | 'tree'
  | 'treeitem'
  | 'grid'
  | 'row'
  | 'columnheader'
  | 'rowheader'
  | 'cell'
  | 'article'
  | 'banner'
  | 'complementary'
  | 'contentinfo'
  | 'form'
  | 'main'
  | 'navigation'
  | 'region'
  | 'section'
  | 'sectionhead'
  | 'separator'
  | 'status'
  | 'application'
  | 'document'
  | 'group'
  | 'list'
  | 'listbox'
  | 'log'
  | 'marquee'
  | 'math'
  | 'note'
  | 'presentation'
  | 'radiogroup'
  | 'slider'
  | 'textbox'
  | 'treegrid'
  | 'combobox'
  | 'gridcell'
  | 'rowgroup'
  | 'menuitemcheckbox'
  | 'menuitemradio'
  | 'option'
  | 'tabpanel';

export interface AccessibilityComponentState {
  disabled?: boolean;
  selected?: boolean;
  checked?: boolean | 'mixed';
  busy?: boolean;
  expanded?: boolean;
  [key: string]: boolean | string | number | undefined;
}

export interface AccessibilityAction {
  name: string;
  label?: string;
}

export interface AccessibilityActionEvent {
  nativeEvent: {
    actionName: string;
  };
}

export type AccessibilityTrait =
  | 'none'
  | 'button'
  | 'link'
  | 'header'
  | 'search'
  | 'image'
  | 'selected'
  | 'plays'
  | 'key'
  | 'text'
  | 'summary'
  | 'disabled'
  | 'frequentUpdates'
  | 'startsMediaSession'
  | 'adjustable'
  | 'allowsDirectInteraction'
  | 'pageTurn'
  | 'tabBar'
  | 'list'
  | 'menu'
  | 'menubar'
  | 'menuitem'
  | 'progressbar'
  | 'scrollbar'
  | 'searchbox'
  | 'spinbutton'
  | 'tablist'
  | 'timer'
  | 'toolbar'
  | 'tooltip'
  | 'tree'
  | 'treeitem'
  | 'grid'
  | 'row'
  | 'columnheader'
  | 'rowheader'
  | 'cell'
  | 'article'
  | 'banner'
  | 'complementary'
  | 'contentinfo'
  | 'form'
  | 'main'
  | 'navigation'
  | 'region'
  | 'section'
  | 'sectionhead'
  | 'separator'
  | 'status'
  | 'application'
  | 'document'
  | 'group'
  | 'listbox'
  | 'log'
  | 'marquee'
  | 'math'
  | 'note'
  | 'presentation'
  | 'radiogroup'
  | 'slider'
  | 'textbox'
  | 'treegrid'
  | 'combobox'
  | 'gridcell'
  | 'rowgroup'
  | 'menuitemcheckbox'
  | 'menuitemradio'
  | 'option'
  | 'switch'
  | 'tab'
  | 'tabpanel';

// 無障礙Check結果
export interface AccessibilityCheckResult {
  elementId: string;
  elementType: string;
  issues: AccessibilityIssue[];
  score: number; // 0-100
  passed: boolean;
}

export interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  suggestion?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// 無障礙Statistics
export interface AccessibilityStats {
  totalElements: number;
  accessibleElements: number;
  issuesFound: number;
  errors: number;
  warnings: number;
  info: number;
  overallScore: number;
  lastCheckTime: number;
}
