import type {
  Breakpoint,
  BreakpointConfig,
  LayoutComponentRegistration,
  LayoutService,
  LayoutSystemConfig,
  LayoutSystemEvent,
  ResponsiveEvent,
  ResponsiveState,
  ResponsiveValue,
} from '../types/layout';

// 默認斷點配置
const DEFAULT_BREAKPOINTS: BreakpointConfig = {
  xs: 575, // 0-575px
  sm: 767, // 576-767px
  md: 991, // 768-991px
  lg: 1199, // 992-1199px
  xl: 1399, // 1200-1399px
  xxl: 1400, // 1400px+
};

// 默認佈局系統配置
const DEFAULT_LAYOUT_CONFIG: LayoutSystemConfig = {
  breakpoints: DEFAULT_BREAKPOINTS,
  defaultBreakpoint: 'md',
  enableResponsive: true,
  enableAccessibility: true,
  enableAnimations: true,
  containerMaxWidths: {
    xs: '100%',
    sm: '540px',
    md: '720px',
    lg: '960px',
    xl: '1140px',
    xxl: '1320px',
  },
  gridColumns: 12,
  defaultSpacing: '1rem',
  defaultGap: '1rem',
};

// 佈局系統服務類
export class LayoutServiceClass implements LayoutService {
  private static instance: LayoutServiceClass;
  private config: LayoutSystemConfig;
  private responsiveState: ResponsiveState;
  private readonly components: Map<string, LayoutComponentRegistration> =
    new Map();
  private readonly eventListeners: Map<
    string,
    Set<(event: ResponsiveEvent) => void>
  > = new Map();
  private readonly resizeObserver: ResizeObserver | null = null;
  private isInitialized = false;

  private constructor() {
    this.config = { ...DEFAULT_LAYOUT_CONFIG };
    this.responsiveState = this.createInitialResponsiveState();
  }

  // 單例模式
  public static getInstance(): LayoutServiceClass {
    if (!LayoutServiceClass.instance) {
      LayoutServiceClass.instance = new LayoutServiceClass();
    }
    return LayoutServiceClass.instance;
  }

  // 初始化服務
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // 初始化響應式狀態
      this.updateResponsiveState();

      // 設置事件監聽器
      this.setupEventListeners();

      // 註冊默認組件
      this.registerDefaultComponents();

      this.isInitialized = true;
      console.log('佈局系統服務初始化完成');
    } catch (error) {
      console.error('佈局系統服務初始化失敗:', error);
      throw error;
    }
  }

  // 獲取當前斷點
  public getCurrentBreakpoint(): Breakpoint {
    return this.responsiveState.currentBreakpoint;
  }

  // 獲取響應式值
  public getResponsiveValue<T>(value: ResponsiveValue<T>): T {
    if (typeof value !== 'object' || value === null) {
      return value;
    }

    const currentBreakpoint = this.getCurrentBreakpoint();
    const breakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
    const currentIndex = breakpoints.indexOf(currentBreakpoint);

    // 從當前斷點開始，向上查找匹配的值
    for (let i = currentIndex; i >= 0; i--) {
      const breakpoint = breakpoints[i];
      if (breakpoint in value) {
        return (value as any)[breakpoint];
      }
    }

    // 如果沒有找到響應式值，返回第一個可用的值
    const firstValue = Object.values(value)[0];
    return firstValue !== undefined ? firstValue : (value as T);
  }

  // 檢查是否為指定斷點
  public isBreakpoint(breakpoint: Breakpoint): boolean {
    return this.getCurrentBreakpoint() === breakpoint;
  }

  // 檢查是否高於指定斷點
  public isAboveBreakpoint(breakpoint: Breakpoint): boolean {
    const breakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
    const currentIndex = breakpoints.indexOf(this.getCurrentBreakpoint());
    const targetIndex = breakpoints.indexOf(breakpoint);
    return currentIndex > targetIndex;
  }

  // 檢查是否低於指定斷點
  public isBelowBreakpoint(breakpoint: Breakpoint): boolean {
    const breakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
    const currentIndex = breakpoints.indexOf(this.getCurrentBreakpoint());
    const targetIndex = breakpoints.indexOf(breakpoint);
    return currentIndex < targetIndex;
  }

  // 斷點變化事件監聽
  public onBreakpointChange(
    callback: (event: ResponsiveEvent) => void
  ): () => void {
    return this.addEventListener('breakpointChange', callback);
  }

  // 窗口大小變化事件監聽
  public onResize(callback: (event: ResponsiveEvent) => void): () => void {
    return this.addEventListener('resize', callback);
  }

  // 獲取斷點配置
  public getBreakpointConfig(): BreakpointConfig {
    return { ...this.config.breakpoints };
  }

  // 獲取響應式狀態
  public getResponsiveState(): ResponsiveState {
    return { ...this.responsiveState };
  }

  // 註冊佈局組件
  public registerComponent(component: LayoutComponentRegistration): void {
    this.components.set(component.name, component);
    this.emitEvent({
      type: 'componentRegister',
      componentName: component.name,
      timestamp: Date.now(),
    });
  }

  // 獲取組件
  public getComponent(name: string): LayoutComponentRegistration | undefined {
    return this.components.get(name);
  }

  // 獲取所有組件
  public getAllComponents(): LayoutComponentRegistration[] {
    return Array.from(this.components.values());
  }

  // 更新配置
  public updateConfig(updates: Partial<LayoutSystemConfig>): void {
    this.config = { ...this.config, ...updates };
    this.emitEvent({
      type: 'configUpdate',
      config: updates,
      timestamp: Date.now(),
    });
  }

  // 獲取配置
  public getConfig(): LayoutSystemConfig {
    return { ...this.config };
  }

  // 私有方法

  private createInitialResponsiveState(): ResponsiveState {
    const windowWidth =
      typeof window !== 'undefined' ? window.innerWidth : 1024;
    const windowHeight =
      typeof window !== 'undefined' ? window.innerHeight : 768;
    const currentBreakpoint = this.getBreakpointFromWidth(windowWidth);

    return {
      currentBreakpoint,
      breakpoints: this.config.breakpoints,
      isMobile: currentBreakpoint === 'xs' || currentBreakpoint === 'sm',
      isTablet: currentBreakpoint === 'md',
      isDesktop: currentBreakpoint === 'lg' || currentBreakpoint === 'xl',
      isLargeScreen: currentBreakpoint === 'xxl',
      windowWidth,
      windowHeight,
    };
  }

  private getBreakpointFromWidth(width: number): Breakpoint {
    const { breakpoints } = this.config;

    // 正確的斷點計算邏輯
    // 根據斷點配置計算對應的斷點
    if (width <= breakpoints.xs) return 'xs';
    if (width <= breakpoints.sm) return 'sm';
    if (width <= breakpoints.md) return 'md';
    if (width <= breakpoints.lg) return 'lg';
    if (width <= breakpoints.xl) return 'xl';
    return 'xxl';
  }

  private updateResponsiveState(): void {
    if (typeof window === 'undefined') return;

    const previousBreakpoint = this.responsiveState.currentBreakpoint;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const currentBreakpoint = this.getBreakpointFromWidth(windowWidth);

    this.responsiveState = {
      currentBreakpoint,
      breakpoints: this.config.breakpoints,
      isMobile: currentBreakpoint === 'xs' || currentBreakpoint === 'sm',
      isTablet: currentBreakpoint === 'md',
      isDesktop: currentBreakpoint === 'lg' || currentBreakpoint === 'xl',
      isLargeScreen: currentBreakpoint === 'xxl',
      windowWidth,
      windowHeight,
    };

    // 如果斷點發生變化，發射事件
    if (previousBreakpoint !== currentBreakpoint) {
      this.emitEvent({
        type: 'breakpointChange' as any,
        breakpoint: currentBreakpoint,
        previousBreakpoint: previousBreakpoint as any,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        timestamp: Date.now(),
      } as any);
    }
  }

  private setupEventListeners(): void {
    if (typeof window === 'undefined') return;

    // 窗口大小變化監聽
    const handleResize = () => {
      this.updateResponsiveState();
      this.emitEvent({
        type: 'resize' as any,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        breakpoint: this.getCurrentBreakpoint(),
      } as any);
    };

    window.addEventListener('resize', handleResize);

    // 方向變化監聽
    const handleOrientationChange = () => {
      setTimeout(() => {
        this.updateResponsiveState();
        this.emitEvent({
          type: 'orientationChange' as any,
          breakpoint: this.getCurrentBreakpoint(),
          windowWidth: window.innerWidth,
          windowHeight: window.innerHeight,
          timestamp: Date.now(),
        } as any);
      }, 100);
    };

    window.addEventListener('orientationchange', handleOrientationChange);
  }

  private registerDefaultComponents(): void {
    const defaultComponents: LayoutComponentRegistration[] = [
      {
        name: 'Container',
        category: 'container',
        props: {},
        defaultProps: { maxWidth: 'lg', centered: true },
        variants: ['fluid', 'centered'],
        responsive: true,
        accessible: true,
      },
      {
        name: 'Grid',
        category: 'grid',
        props: {},
        defaultProps: { columns: 12, gap: '1rem' },
        variants: ['auto-fit', 'auto-fill'],
        responsive: true,
        accessible: true,
      },
      {
        name: 'Flex',
        category: 'flex',
        props: {},
        defaultProps: { direction: 'row', alignItems: 'center' },
        variants: ['row', 'column', 'wrap'],
        responsive: true,
        accessible: true,
      },
      {
        name: 'Stack',
        category: 'stack',
        props: {},
        defaultProps: { direction: 'vertical', spacing: '1rem' },
        variants: ['vertical', 'horizontal'],
        responsive: true,
        accessible: true,
      },
    ];

    defaultComponents.forEach(component => {
      this.registerComponent(component);
    });
  }

  private addEventListener(
    type: string,
    callback: (event: ResponsiveEvent) => void
  ): () => void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, new Set());
    }

    this.eventListeners.get(type).add(callback);

    // 返回取消監聽的函數
    return () => {
      this.eventListeners.get(type)?.delete(callback);
    };
  }

  private emitEvent(event: LayoutSystemEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(event as ResponsiveEvent);
        } catch (error) {
          console.error('事件監聽器執行錯誤:', error);
        }
      });
    }
  }

  // 銷毀服務
  public destroy(): void {
    this.eventListeners.clear();
    this.components.clear();
    this.isInitialized = false;
  }
}

// 導出單例實例
export const layoutService = LayoutServiceClass.getInstance();
