// User體驗MonitorService
import type {
  ABTestAnalytics,
  ABTestAssignment,
  DeviceInfo,
  ErrorAnalytics,
  ErrorEvent,
  PerformanceAnalytics,
  PerformanceMetric,
  SatisfactionAnalytics,
  SatisfactionLevel,
  SatisfactionSurvey,
  SessionAnalytics,
  UserAction,
  UserJourneyAnalytics,
  UserSession,
  UXAnalytics,
  UXMonitoringConfig,
  UXMonitoringData,
} from '../types/uxMonitoring';
import {
  ABTestStatus,
  ErrorSeverity,
  ErrorType,
  PerformanceMetricType,
  UserActionType,
} from '../types/uxMonitoring';

class UXMonitoringService {
  private static instance: UXMonitoringService;
  private config: UXMonitoringConfig;
  private data: UXMonitoringData;
  private currentSession: UserSession | null = null;
  private isInitialized = false;
  private readonly eventListeners: Map<string, Function[]> = new Map();

  private constructor() {
    this.config = this.getDefaultConfig();
    this.data = {
      sessions: [],
      performanceMetrics: [],
      errorEvents: [],
      satisfactionSurveys: [],
      abTestAssignments: [],
      abTests: [],
    };
  }

  public static getInstance(): UXMonitoringService {
    if (!UXMonitoringService.instance) {
      UXMonitoringService.instance = new UXMonitoringService();
    }
    return UXMonitoringService.instance;
  }

  // InitializeService
  public async initialize(config?: Partial<UXMonitoringConfig>): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (config) {
      this.config = { ...this.config, ...config };
    }

    // Check隱私Settings
    if (
      this.config.privacySettings.respectDoNotTrack &&
      this.isDoNotTrackEnabled()
    ) {
      this.config.enabled = false;
    }

    await this.initializeSession();
    this.setupErrorTracking();
    this.setupUserBehaviorTracking();

    this.isInitialized = true;
    this.emit('initialized', { config: this.config });
  }

  // UserRow為Trace
  public trackAction(
    action: Omit<UserAction, 'id' | 'timestamp' | 'sessionId'>
  ): void {
    if (!this.isInitialized || !this.currentSession) {
      return;
    }

    const userAction: UserAction = {
      ...action,
      id: this.generateId(),
      timestamp: Date.now(),
      sessionId: this.currentSession.id,
    };

    this.currentSession.actions.push(userAction);
    this.emit('action-tracked', userAction);
  }

  // 性能Monitor
  public trackPerformance(
    metric: Omit<PerformanceMetric, 'id' | 'timestamp' | 'sessionId'>
  ): void {
    if (!this.isInitialized || !this.currentSession) {
      return;
    }

    const performanceMetric: PerformanceMetric = {
      ...metric,
      id: this.generateId(),
      timestamp: Date.now(),
      sessionId: this.currentSession.id,
    };

    this.data.performanceMetrics.push(performanceMetric);
    this.emit('performance-tracked', performanceMetric);
  }

  // ErrorTrace
  public trackError(error: Error, context?: unknown): void {
    if (!this.isInitialized || !this.currentSession) {
      return;
    }

    const errorEvent: ErrorEvent = {
      id: this.generateId(),
      type: ErrorType.JAVASCRIPT,
      severity: this.determineErrorSeverity(error),
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      sessionId: this.currentSession.id,
      userId: this.currentSession.userId,
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
      deviceInfo: this.currentSession.deviceInfo,
      breadcrumbs: [],
      context: {
        user: context?.user || {},
        tags: context?.tags || {},
        extra: context?.extra || {},
      },
    };

    this.data.errorEvents.push(errorEvent);
    this.emit('error-tracked', errorEvent);
  }

  // 滿意度調查
  public submitSatisfaction(
    survey: Omit<SatisfactionSurvey, 'id' | 'timestamp' | 'sessionId'>
  ): void {
    if (!this.isInitialized || !this.currentSession) {
      return;
    }

    const satisfactionSurvey: SatisfactionSurvey = {
      ...survey,
      id: this.generateId(),
      timestamp: Date.now(),
      sessionId: this.currentSession.id,
    };

    this.data.satisfactionSurveys.push(satisfactionSurvey);
    this.emit('satisfaction-submitted', satisfactionSurvey);
  }

  // A/B Test
  public getABTestVariant(testId: string): string | null {
    if (!this.isInitialized) {
      return null;
    }

    const _test = this.data.abTests.find(
      t => t.id === testId && t.status === ABTestStatus.ACTIVE
    );
    if (!test) {
      return null;
    }

    const _existingAssignment = this.data.abTestAssignments.find(
      a => a.testId === testId && a.sessionId === this.currentSession?.id
    );

    if (existingAssignment) {
      return existingAssignment.variantId;
    }

    const _variant = test.variants[0];
    if (variant) {
      const assignment: ABTestAssignment = {
        testId,
        variantId: variant.id,
        userId: this.currentSession?.userId,
        sessionId: this.currentSession?.id || '',
        timestamp: Date.now(),
        isNewUser: this.isNewUser(),
      };

      this.data.abTestAssignments.push(assignment);
      this.emit('ab-test-assigned', assignment);
      return variant.id;
    }

    return null;
  }

  // ConvertTrace
  public trackConversion(testId: string, goalId: string, value?: number): void {
    if (!this.isInitialized) {
      return;
    }

    const _assignment = this.data.abTestAssignments.find(
      a => a.testId === testId && a.sessionId === this.currentSession?.id
    );

    if (assignment) {
      this.emit('conversion-tracked', {
        testId,
        goalId,
        variantId: assignment.variantId,
        value,
        timestamp: Date.now(),
      });
    }
  }

  // GetAnalysisData
  public getAnalytics(): UXAnalytics {
    return {
      sessionAnalytics: this.calculateSessionAnalytics(),
      performanceAnalytics: this.calculatePerformanceAnalytics(),
      errorAnalytics: this.calculateErrorAnalytics(),
      satisfactionAnalytics: this.calculateSatisfactionAnalytics(),
      abTestAnalytics: this.calculateABTestAnalytics(),
      userJourneyAnalytics: this.calculateUserJourneyAnalytics(),
    };
  }

  // GetConfigure
  public getConfig(): UXMonitoringConfig {
    return { ...this.config };
  }

  // UpdateConfigure
  public updateConfig(config: Partial<UXMonitoringConfig>): void {
    this.config = { ...this.config, ...config };
    this.emit('config-updated', this.config);
  }

  // GetStatus
  public getStatus(): {
    isInitialized: boolean;
    isEnabled: boolean;
    sessionCount: number;
    actionCount: number;
    errorCount: number;
    performanceMetricCount: number;
    satisfactionSurveyCount: number;
    abTestCount: number;
    currentSession: UserSession | null;
  } {
    return {
      isInitialized: this.isInitialized,
      isEnabled: this.config.enabled,
      sessionCount: this.data.sessions.length,
      actionCount: this.data.sessions.reduce(
        (sum, session) => sum + session.actions.length,
        0
      ),
      errorCount: this.data.errorEvents.length,
      performanceMetricCount: this.data.performanceMetrics.length,
      satisfactionSurveyCount: this.data.satisfactionSurveys.length,
      abTestCount: this.data.abTests.length,
      currentSession: this.currentSession,
    };
  }

  // 清理Data
  public clearData(): void {
    this.data = {
      sessions: [],
      performanceMetrics: [],
      errorEvents: [],
      satisfactionSurveys: [],
      abTestAssignments: [],
      abTests: [],
    };
    this.emit('data-cleared');
  }

  // ExportData
  public exportData(): UXMonitoringData {
    return JSON.parse(JSON.stringify(this.data));
  }

  // Event監聽器
  public on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  public off(event: string, callback: Function): void {
    const _listeners = this.eventListeners.get(event);
    if (listeners) {
      const _index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // PrivateMethod
  private getDefaultConfig(): UXMonitoringConfig {
    return {
      enabled: true,
      samplingRate: 1.0,
      privacySettings: {
        anonymizeData: true,
        respectDoNotTrack: true,
        cookieConsent: true,
        dataRetentionDays: 90,
        allowPersonalData: false,
        complianceMode: 'gdpr',
      },
      performanceMonitoring: {
        enabled: true,
        metrics: [
          PerformanceMetricType.PAGE_LOAD,
          PerformanceMetricType.RESOURCE_LOAD,
        ],
        thresholds: {} as any,
        samplingRate: 1.0,
        batchSize: 10,
        flushInterval: 5000,
      },
      errorTracking: {
        enabled: true,
        captureUnhandledErrors: true,
        capturePromiseRejections: true,
        captureNetworkErrors: true,
        maxBreadcrumbs: 100,
        ignoreErrors: [],
        severityThreshold: ErrorSeverity.LOW,
      },
      userBehaviorTracking: {
        enabled: true,
        trackClicks: true,
        trackScrolls: true,
        trackInputs: true,
        trackNavigation: true,
        trackHovers: false,
        trackResizes: false,
        maxActionsPerSession: 1000,
        sensitiveElements: ['input[type="password"]', '.sensitive'],
      },
      satisfactionSurvey: {
        enabled: true,
        triggerType: 'time',
        triggerValue: 30000,
        questions: [],
        showFrequency: 5,
        maxSurveysPerUser: 3,
      },
      abTesting: {
        enabled: true,
        maxActiveTests: 10,
        trafficAllocationLimit: 50,
        statisticalSignificanceThreshold: 0.05,
        minimumSampleSize: 100,
        testDuration: 14,
      },
      dataRetention: {
        userActions: 30,
        performanceMetrics: 90,
        errorEvents: 90,
        satisfactionSurveys: 365,
        abTestResults: 365,
        sessions: 30,
      },
    };
  }

  private async initializeSession(): Promise<void> {
    const _sessionId = this.generateId();
    const _deviceInfo = this.getDeviceInfo();

    this.currentSession = {
      id: sessionId,
      userId: this.getUserId(),
      startTime: Date.now(),
      pageViews: 1,
      actions: [],
      deviceInfo,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      screenResolution: {
        width: screen.width,
        height: screen.height,
      },
      viewportSize: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };

    this.data.sessions.push(this.currentSession);
    this.emit('session-started', this.currentSession);
  }

  private getDeviceInfo(): DeviceInfo {
    const { userAgent } = navigator;
    const _isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent
      );
    const _isTablet = /iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)/i.test(
      userAgent
    );
    const _isDesktop = !isMobile && !isTablet;

    let platform: 'ios' | 'android' | 'web' | 'desktop' = 'web';
    let os = 'Unknown';
    let browser = 'Unknown';

    if (/iPhone|iPad|iPod/i.test(userAgent)) {
      platform = 'ios';
      os = 'iOS';
    } else if (/Android/i.test(userAgent)) {
      platform = 'android';
      os = 'Android';
    } else if (isDesktop) {
      platform = 'desktop';
      if (/Windows/i.test(userAgent)) {
        os = 'Windows';
      } else if (/Mac OS X/i.test(userAgent)) {
        os = 'macOS';
      } else if (/Linux/i.test(userAgent)) {
        os = 'Linux';
      }
    }

    if (/Chrome/i.test(userAgent)) {
      browser = 'Chrome';
    } else if (/Firefox/i.test(userAgent)) {
      browser = 'Firefox';
    } else if (/Safari/i.test(userAgent)) {
      browser = 'Safari';
    } else if (/Edge/i.test(userAgent)) {
      browser = 'Edge';
    }

    return {
      platform,
      os,
      osVersion: 'Unknown',
      browser,
      browserVersion: 'Unknown',
      deviceModel: 'Unknown',
      isMobile,
      isTablet,
      isDesktop,
      connectionType: 'unknown',
      connectionSpeed: 0,
    };
  }

  private getUserId(): string | undefined {
    return localStorage.getItem('ux_user_id') || undefined;
  }

  private isNewUser(): boolean {
    return !localStorage.getItem('ux_user_id');
  }

  private isDoNotTrackEnabled(): boolean {
    return (
      navigator.doNotTrack === '1' ||
      (navigator as any).msDoNotTrack === '1' ||
      (window as any).doNotTrack === '1'
    );
  }

  private setupErrorTracking(): void {
    if (this.config.errorTracking.captureUnhandledErrors) {
      window.addEventListener('error', event => {
        this.trackError(event.error || new Error(event.message));
      });
    }

    if (this.config.errorTracking.capturePromiseRejections) {
      window.addEventListener('unhandledrejection', event => {
        this.trackError(new Error(event.reason));
      });
    }
  }

  private setupUserBehaviorTracking(): void {
    if (this.config.userBehaviorTracking.trackClicks) {
      document.addEventListener('click', event => {
        this.handleClick(event);
      });
    }

    if (this.config.userBehaviorTracking.trackScrolls) {
      let scrollTimeout: NodeJS.Timeout;
      document.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          this.handleScroll();
        }, 100);
      });
    }
  }

  private handleClick(event: MouseEvent): void {
    const _target = event.target as HTMLElement;
    if (!target) return;

    this.trackAction({
      type: UserActionType.CLICK,
      elementId: target.id || undefined,
      elementType: target.tagName.toLowerCase(),
      pageUrl: window.location.href,
      pageTitle: document.title,
      coordinates: {
        x: event.clientX,
        y: event.clientY,
      },
    });
  }

  private handleScroll(): void {
    this.trackAction({
      type: UserActionType.SCROLL,
      pageUrl: window.location.href,
      pageTitle: document.title,
    });
  }

  private determineErrorSeverity(error: Error): ErrorSeverity {
    const _message = error.message.toLowerCase();
    if (message.includes('critical')) {
      return ErrorSeverity.CRITICAL;
    }
    if (message.includes('error')) {
      return ErrorSeverity.HIGH;
    }
    if (message.includes('warning')) {
      return ErrorSeverity.MEDIUM;
    }
    return ErrorSeverity.LOW;
  }

  private calculateSessionAnalytics(): SessionAnalytics {
    const { sessions } = this.data;
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        averageSessionDuration: 0,
        averagePageViews: 0,
        bounceRate: 0,
        sessionTrends: [],
        topPages: [],
        userRetention: [],
      };
    }

    const _totalSessions = sessions.length;
    const _averagePageViews =
      sessions.reduce((sum, s) => sum + s.pageViews, 0) / totalSessions;
    const _bounceRate =
      sessions.filter(s => s.pageViews === 1).length / totalSessions;

    return {
      totalSessions,
      averageSessionDuration: 0,
      averagePageViews,
      bounceRate,
      sessionTrends: [],
      topPages: [],
      userRetention: [],
    };
  }

  private calculatePerformanceAnalytics(): PerformanceAnalytics {
    const _metrics = this.data.performanceMetrics;
    if (metrics.length === 0) {
      return {
        averagePageLoadTime: 0,
        averageResourceLoadTime: 0,
        performanceDistribution: {} as Record<PerformanceMetricType, number[]>,
        slowPages: [],
        performanceTrends: [],
        resourceOptimization: [],
      };
    }

    const _pageLoadMetrics = metrics.filter(
      m => m.type === PerformanceMetricType.PAGE_LOAD
    );
    const _resourceMetrics = metrics.filter(
      m => m.type === PerformanceMetricType.RESOURCE_LOAD
    );

    const _averagePageLoadTime =
      pageLoadMetrics.length > 0
        ? pageLoadMetrics.reduce((sum, m) => sum + m.value, 0) /
          pageLoadMetrics.length
        : 0;

    const _averageResourceLoadTime =
      resourceMetrics.length > 0
        ? resourceMetrics.reduce((sum, m) => sum + m.value, 0) /
          resourceMetrics.length
        : 0;

    return {
      averagePageLoadTime,
      averageResourceLoadTime,
      performanceDistribution: {} as Record<PerformanceMetricType, number[]>,
      slowPages: [],
      performanceTrends: [],
      resourceOptimization: [],
    };
  }

  private calculateErrorAnalytics(): ErrorAnalytics {
    const _errors = this.data.errorEvents;
    if (errors.length === 0) {
      return {
        totalErrors: 0,
        errorRate: 0,
        errorDistribution: {} as Record<ErrorType, number>,
        errorTrends: [],
        topErrors: [],
        errorImpact: [],
      };
    }

    const _totalErrors = errors.length;
    const _totalSessions = this.data.sessions.length;
    const _errorRate = totalSessions > 0 ? totalErrors / totalSessions : 0;

    return {
      totalErrors,
      errorRate,
      errorDistribution: {} as Record<ErrorType, number>,
      errorTrends: [],
      topErrors: [],
      errorImpact: [],
    };
  }

  private calculateSatisfactionAnalytics(): SatisfactionAnalytics {
    const _surveys = this.data.satisfactionSurveys;
    if (surveys.length === 0) {
      return {
        averageSatisfaction: 0,
        satisfactionDistribution: {} as Record<SatisfactionLevel, number>,
        satisfactionTrends: [],
        topIssues: [],
        improvementSuggestions: [],
        netPromoterScore: 0,
      };
    }

    const _averageSatisfaction =
      surveys.reduce((sum, s) => sum + s.overallSatisfaction, 0) /
      surveys.length;

    return {
      averageSatisfaction,
      satisfactionDistribution: {} as Record<SatisfactionLevel, number>,
      satisfactionTrends: [],
      topIssues: [],
      improvementSuggestions: [],
      netPromoterScore: 0,
    };
  }

  private calculateABTestAnalytics(): ABTestAnalytics {
    const _tests = this.data.abTests;
    const _activeTests = tests.filter(
      t => t.status === ABTestStatus.ACTIVE
    ).length;
    const _completedTests = tests.filter(
      t => t.status === ABTestStatus.COMPLETED
    ).length;

    return {
      activeTests,
      completedTests,
      testResults: [],
      conversionImprovements: [],
      revenueImpact: [],
    };
  }

  private calculateUserJourneyAnalytics(): UserJourneyAnalytics {
    return {
      commonPaths: [],
      dropoffPoints: [],
      conversionFunnels: [],
      userSegments: [],
    };
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private emit(event: string, data?: unknown): void {
    const _listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }
}

export default UXMonitoringService;
