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

// Default斷點Configure
const DEFAULT_BREAKPOINTS: BreakpointConfig = {
  xs: 575, // 0-575px
  sm: 767, // 576-767px
  md: 991, // 768-991px
  lg: 1199, // 992-1199px
  xl: 1399, // 1200-1399px
  xxl: 1400, // 1400px+
};

// Default佈局系統Configure
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

// 佈局系統ServiceClass
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

  // InitializeService
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // InitializeResponse式Status
      this.updateResponsiveState();

      // SettingsEvent監聽器
      this.setupEventListeners();

      // RegisterDefaultComponent
      this.registerDefaultComponents();

      this.isInitialized = true;
      console.log('佈局系統ServiceInitialize完成');
    } catch (error) {
      console.error('佈局系統ServiceInitializeFailed:', error);
      throw error;
    }
  }

  // Get當前斷點
  public getCurrentBreakpoint(): Breakpoint {
    return this.responsiveState.currentBreakpoint;
  }

  // GetResponse式Value
  public getResponsiveValue<T>(value: ResponsiveValue<T>): T {
    if (typeof value !== 'object' || value === null) {
      return value;
    }

    const _currentBreakpoint = this.getCurrentBreakpoint();
    const breakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
    const _currentIndex = breakpoints.indexOf(currentBreakpoint);

    // 從當前斷點Begin，向上Find匹配的Value
    for (let i = currentIndex; i >= 0; i--) {
      const _breakpoint = breakpoints[i];
      if (breakpoint in value) {
        return (value as any)[breakpoint];
      }
    }

    // 如果沒有找到Response式Value，Return第一個可用的Value
    const _firstValue = Object.values(value)[0];
    return firstValue !== undefined ? firstValue : (value as T);
  }

  // CheckYesNo為指定斷點
  public isBreakpoint(breakpoint: Breakpoint): boolean {
    return this.getCurrentBreakpoint() === breakpoint;
  }

  // CheckYesNo高於指定斷點
  public isAboveBreakpoint(breakpoint: Breakpoint): boolean {
    const breakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
    const _currentIndex = breakpoints.indexOf(this.getCurrentBreakpoint());
    const _targetIndex = breakpoints.indexOf(breakpoint);
    return currentIndex > targetIndex;
  }

  // CheckYesNo低於指定斷點
  public isBelowBreakpoint(breakpoint: Breakpoint): boolean {
    const breakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
    const _currentIndex = breakpoints.indexOf(this.getCurrentBreakpoint());
    const _targetIndex = breakpoints.indexOf(breakpoint);
    return currentIndex < targetIndex;
  }

  // 斷點變化Event監聽
  public onBreakpointChange(
    callback: (event: ResponsiveEvent) => void
  ): () => void {
    return this.addEventListener('breakpointChange', callback);
  }

  // 窗口大小變化Event監聽
  public onResize(callback: (event: ResponsiveEvent) => void): () => void {
    return this.addEventListener('resize', callback);
  }

  // Get斷點Configure
  public getBreakpointConfig(): BreakpointConfig {
    return { ...this.config.breakpoints };
  }

  // GetResponse式Status
  public getResponsiveState(): ResponsiveState {
    return { ...this.responsiveState };
  }

  // Register佈局Component
  public registerComponent(component: LayoutComponentRegistration): void {
    this.components.set(component.name, component);
    this.emitEvent({
      type: 'componentRegister',
      componentName: component.name,
      timestamp: Date.now(),
    });
  }

  // GetComponent
  public getComponent(name: string): LayoutComponentRegistration | undefined {
    return this.components.get(name);
  }

  // Get所有Component
  public getAllComponents(): LayoutComponentRegistration[] {
    return Array.from(this.components.values());
  }

  // UpdateConfigure
  public updateConfig(updates: Partial<LayoutSystemConfig>): void {
    this.config = { ...this.config, ...updates };
    this.emitEvent({
      type: 'configUpdate',
      config: updates,
      timestamp: Date.now(),
    });
  }

  // GetConfigure
  public getConfig(): LayoutSystemConfig {
    return { ...this.config };
  }

  // PrivateMethod

  private createInitialResponsiveState(): ResponsiveState {
    const _windowWidth =
      typeof window !== 'undefined' ? window.innerWidth : 1024;
    const _windowHeight =
      typeof window !== 'undefined' ? window.innerHeight : 768;
    const _currentBreakpoint = this.getBreakpointFromWidth(windowWidth);

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
    // Root據斷點Configure計算對應的斷點
    if (width <= breakpoints.xs) return 'xs';
    if (width <= breakpoints.sm) return 'sm';
    if (width <= breakpoints.md) return 'md';
    if (width <= breakpoints.lg) return 'lg';
    if (width <= breakpoints.xl) return 'xl';
    return 'xxl';
  }

  private updateResponsiveState(): void {
    if (typeof window === 'undefined') return;

    const _previousBreakpoint = this.responsiveState.currentBreakpoint;
    const _windowWidth = window.innerWidth;
    const _windowHeight = window.innerHeight;
    const _currentBreakpoint = this.getBreakpointFromWidth(windowWidth);

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

    // 如果斷點發生變化，發射Event
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
    const _handleResize = () => {
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
    const _handleOrientationChange = () => {
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

    // ReturnCancel監聽的Function
    return () => {
      this.eventListeners.get(type)?.delete(callback);
    };
  }

  private emitEvent(event: LayoutSystemEvent): void {
    const _listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(event as ResponsiveEvent);
        } catch (error) {
          console.error('事件監聽器執行Error:', error);
        }
      });
    }
  }

  // 銷毀Service
  public destroy(): void {
    this.eventListeners.clear();
    this.components.clear();
    this.isInitialized = false;
  }
}

// Export單例Instance
export const _layoutService = LayoutServiceClass.getInstance();
