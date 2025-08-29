import type {
  UserBehaviorEvent,
  UserBehaviorPattern,
  UserProfile,
  UserBehaviorStats,
  UserBehaviorConfig,
  UserBehaviorReport,
  UserBehaviorInsight,
  UserBehaviorRecommendation,
  UserBehaviorFilter,
  UserBehaviorExportOptions,
  UserBehaviorAlert,
  UserBehaviorAnalysisResponse,
  UserBehaviorMetrics,
} from '../types/userBehavior';
import { UserBehaviorEventType } from '../types/userBehavior';

export class UserBehaviorService {
  private static instance: UserBehaviorService;
  private config: UserBehaviorConfig;
  private events: UserBehaviorEvent[] = [];
  private patterns: UserBehaviorPattern[] = [];
  private profiles: UserProfile[] = [];
  private alerts: UserBehaviorAlert[] = [];
  private isInitialized = false;
  private readonly eventListeners: ((event: UserBehaviorEvent) => void)[] = [];
  private sessionStartTime = 0;
  private currentSessionId = '';

  private constructor() {
    this.config = {
      enabled: true,
      trackingInterval: 30000,
      dataRetentionDays: 90,
      privacyMode: false,
      anonymizeData: false,
      realTimeTracking: true,
      batchProcessing: false,
      eventBufferSize: 1000,
      maxEventsPerSession: 1000,
      sessionTimeout: 1800000,
      geolocationTracking: true,
      deviceTracking: true,
      customEvents: true,
    };

    this.currentSessionId = this.generateSessionId();
  }

  public static getInstance(): UserBehaviorService {
    if (!UserBehaviorService.instance) {
      UserBehaviorService.instance = new UserBehaviorService();
    }
    return UserBehaviorService.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      await this.initializeAnalytics();
      await this.initializeAlerts();
      this.startTracking();
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('用戶行為分析服務初始化失敗:', error);
      return false;
    }
  }

  private async initializeAnalytics(): Promise<void> {
    // 這個方法用於測試模擬
    await this.loadBehaviorData();
  }

  // 追蹤用戶行為事件
  trackEvent(event: Omit<UserBehaviorEvent, 'timestamp'>): void {
    if (!this.config.enabled) return;

    const fullEvent: UserBehaviorEvent = {
      ...event,
      timestamp: Date.now(),
    };

    this.events.push(fullEvent);
    this.processEvent(fullEvent);
    this.emitEvent(fullEvent);
    this.checkAlerts(fullEvent);
  }

  // 開始會話
  startSession(userId: string, platform: 'iOS' | 'Android' | 'Web'): void {
    this.sessionStartTime = Date.now();
    this.currentSessionId = this.generateSessionId();

    this.trackEvent({
      id: this.generateEventId(),
      userId,
      sessionId: this.currentSessionId,
      eventType: 'session_start',
      platform,
      userAgent: 'CardStrategy/1.0',
      deviceInfo: {
        deviceType: 'mobile',
        os: 'iOS',
        screenResolution: '375x667',
        language: 'zh-TW',
      },
    });
  }

  // 結束會話
  endSession(userId: string): void {
    const _sessionDuration = Date.now() - this.sessionStartTime;

    this.trackEvent({
      id: this.generateEventId(),
      userId,
      sessionId: this.currentSessionId,
      eventType: 'session_end',
      platform: 'iOS',
      userAgent: 'CardStrategy/1.0',
      deviceInfo: {
        deviceType: 'mobile',
        os: 'iOS',
        screenResolution: '375x667',
        language: 'zh-TW',
      },
      metadata: {
        sessionDuration,
        eventsInSession: this.events.filter(
          e => e.sessionId === this.currentSessionId
        ).length,
      },
    });
  }

  // 獲取用戶行為分析
  async getBehaviorAnalysis(
    filter?: UserBehaviorFilter
  ): Promise<UserBehaviorAnalysisResponse> {
    if (!this.isInitialized) {
      throw new Error('服務未初始化');
    }

    const _filteredEvents = this.applyFilter(this.events, filter);
    const _patterns = await this.analyzePatterns(filteredEvents);
    const _profiles = await this.generateProfiles(filteredEvents);
    const _stats = await this.calculateStats(filteredEvents);
    const _insights = await this.generateInsights(filteredEvents, stats);
    const _recommendations = await this.generateRecommendations(insights, stats);

    return {
      events: filteredEvents,
      patterns,
      profiles,
      stats,
      insights,
      recommendations,
      alerts: this.alerts,
      metadata: {
        totalEvents: filteredEvents.length,
        analysisTime: Date.now(),
        dataQuality: this.calculateDataQuality(filteredEvents),
        confidence: this.calculateConfidence(filteredEvents),
      },
    };
  }

  // 生成用戶行為報告
  async generateReport(
    title: string,
    description: string,
    period: { start: number; end: number },
    filter?: UserBehaviorFilter
  ): Promise<UserBehaviorReport> {
    const _analysis = await this.getBehaviorAnalysis(filter);

    const report: UserBehaviorReport = {
      id: `report_${Date.now()}`,
      title,
      description,
      period,
      filter,
      stats: analysis.stats,
      patterns: analysis.patterns,
      profiles: analysis.profiles,
      insights: analysis.insights,
      recommendations: analysis.recommendations,
      generatedAt: Date.now(),
      status: 'completed',
      version: '1.0.0',
    };

    return report;
  }

  // 導出用戶行為數據
  async exportData(
    analysis: UserBehaviorAnalysisResponse,
    options: UserBehaviorExportOptions
  ): Promise<string> {
    try {
      switch (options.format) {
        case 'json':
          return JSON.stringify(analysis, null, 2);
        case 'csv':
          return this.convertToCSV(analysis);
        case 'excel':
          return this.convertToCSV(analysis);
        case 'pdf':
          return this.convertToPDF(analysis);
        default:
          throw new Error(`不支持的導出格式: ${options.format}`);
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('不支持的導出格式')
      ) {
        throw error;
      }
      throw new Error('導出失敗');
    }
  }

  private convertToCSV(data: UserBehaviorAnalysisResponse): string {
    const lines: string[] = [];
    lines.push('指標,值');
    lines.push(`總用戶數,${data.stats.totalUsers}`);
    lines.push(`活躍用戶,${data.stats.activeUsers}`);
    lines.push(`新用戶,${data.stats.newUsers}`);
    lines.push(`回訪用戶,${data.stats.returningUsers}`);
    lines.push(`流失率,${data.stats.churnRate}`);
    lines.push(`總事件數,${data.stats.totalEvents}`);
    lines.push(`平均每用戶事件,${data.stats.averageEventsPerUser}`);
    lines.push(`平均會話時長,${data.stats.averageSessionDuration}`);
    lines.push(`轉換率,${data.stats.conversionRate}`);
    return lines.join('\n');
  }

  private convertToPDF(data: UserBehaviorAnalysisResponse): string {
    const lines: string[] = [];
    lines.push('用戶行為分析報告');
    lines.push('='.repeat(50));
    lines.push('');
    lines.push('統計摘要:');
    lines.push(`- 總用戶數: ${data.stats.totalUsers}`);
    lines.push(`- 活躍用戶: ${data.stats.activeUsers}`);
    lines.push(`- 新用戶: ${data.stats.newUsers}`);
    lines.push(`- 回訪用戶: ${data.stats.returningUsers}`);
    lines.push(`- 流失率: ${(data.stats.churnRate * 100).toFixed(2)}%`);
    lines.push(`- 總事件數: ${data.stats.totalEvents}`);
    lines.push(
      `- 平均每用戶事件: ${data.stats.averageEventsPerUser.toFixed(2)}`
    );
    lines.push(`- 平均會話時長: ${data.stats.averageSessionDuration} 秒`);
    lines.push(`- 轉換率: ${(data.stats.conversionRate * 100).toFixed(2)}%`);
    return lines.join('\n');
  }

  // 配置管理
  getConfig(): UserBehaviorConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<UserBehaviorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // 警報管理
  async createAlert(
    alert: Omit<UserBehaviorAlert, 'id' | 'triggerCount'>
  ): Promise<UserBehaviorAlert> {
    const newAlert: UserBehaviorAlert = {
      ...alert,
      id: `alert_${Date.now()}`,
      triggerCount: 0,
    };

    this.alerts.push(newAlert);
    return newAlert;
  }

  async updateAlert(
    alertId: string,
    updates: Partial<UserBehaviorAlert>
  ): Promise<void> {
    const _index = this.alerts.findIndex(alert => alert.id === alertId);
    if (index === -1) {
      throw new Error(`警報不存在: ${alertId}`);
    }

    this.alerts[index] = { ...this.alerts[index], ...updates };
  }

  async deleteAlert(alertId: string): Promise<void> {
    const _index = this.alerts.findIndex(alert => alert.id === alertId);
    if (index === -1) {
      throw new Error(`警報不存在: ${alertId}`);
    }

    this.alerts.splice(index, 1);
  }

  getAlerts(): UserBehaviorAlert[] {
    return [...this.alerts];
  }

  async getAlert(alertId: string): Promise<UserBehaviorAlert | null> {
    const _alert = this.alerts.find(a => a.id === alertId);
    return alert || null;
  }

  // 事件監聽
  addEventListener(
    eventType: string,
    listener: (event: UserBehaviorEvent) => void
  ): void {
    this.eventListeners.push(listener);
  }

  removeEventListener(
    eventType: string,
    listener: (event: UserBehaviorEvent) => void
  ): void {
    const _index = this.eventListeners.indexOf(listener);
    if (index > -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  // 獲取用戶畫像
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const _userEvents = this.events.filter(event => event.userId === userId);
    if (userEvents.length === 0) return null;

    const _profile = await this.generateUserProfile(userId, userEvents);
    return profile || null;
  }

  // 獲取用戶行為模式
  async getUserPatterns(userId: string): Promise<UserBehaviorPattern[]> {
    const _userEvents = this.events.filter(event => event.userId === userId);
    return this.analyzeUserPatterns(userId, userEvents);
  }

  // 獲取用戶行為指標
  async getUserMetrics(userId: string): Promise<UserBehaviorMetrics> {
    const _userEvents = this.events.filter(event => event.userId === userId);
    return this.calculateUserMetrics(userEvents);
  }

  // 私有方法
  private async loadBehaviorData(): Promise<void> {
    // 模擬數據
    this.events = [
      {
        id: 'event_1',
        userId: 'user123',
        sessionId: 'session_1',
        eventType: 'page_view',
        timestamp: Date.now() - 3600000,
        page: '/home',
        platform: 'iOS',
        userAgent: 'CardStrategy/1.0',
        deviceInfo: {
          deviceType: 'mobile',
          os: 'iOS',
          screenResolution: '375x667',
          language: 'zh-TW',
        },
      },
    ];

    this.patterns = [
      {
        id: 'pattern_1',
        userId: 'user123',
        patternType: 'search',
        frequency: 5,
        averageDuration: 120,
        preferredCategories: ['Pokemon', 'Yu-Gi-Oh'],
        preferredPriceRange: {
          min: 10,
          max: 100,
          currency: 'USD',
        },
        preferredTimeSlots: [9, 10, 11, 14, 15, 16],
        preferredDays: [1, 2, 3, 4, 5],
        lastUpdated: Date.now(),
        confidence: 0.85,
      },
    ];

    this.profiles = [
      {
        id: 'profile_1',
        userId: 'user123',
        userType: 'collector',
        experienceLevel: 'intermediate',
        interests: ['Pokemon', 'Yu-Gi-Oh', 'Magic'],
        budget: {
          min: 10,
          max: 500,
          currency: 'USD',
        },
        collectionSize: 150,
        activeSince: Date.now() - 90 * 24 * 60 * 60 * 1000,
        lastActive: Date.now(),
        engagementScore: 0.75,
        loyaltyScore: 0.8,
        behaviorScore: 0.78,
        riskTolerance: 'medium',
        preferences: {
          favoriteCategories: ['Pokemon'],
          favoriteSeries: ['Base Set', 'Jungle'],
          preferredConditions: ['Near Mint', 'Lightly Played'],
          preferredLanguages: ['English', 'Japanese'],
          notificationPreferences: {
            email: true,
            push: true,
            sms: false,
          },
        },
        behaviorMetrics: {
          totalSessions: 45,
          averageSessionDuration: 1800,
          averageSessionsPerDay: 1.2,
          mostActiveHour: 14,
          mostActiveDay: 3,
          bounceRate: 0.15,
          returnRate: 0.85,
          conversionRate: 0.12,
        },
      },
    ];
  }

  private async initializeAlerts(): Promise<void> {
    this.alerts = [
      {
        id: 'alert_user_engagement',
        name: '用戶參與度下降警報',
        description: '當用戶參與度指標下降時觸發',
        condition: {
          metric: 'engagementScore',
          timeWindow: 86400000,
          aggregation: 'avg',
        },
        threshold: 0.5,
        operator: 'lt',
        enabled: true,
        notificationChannels: ['email', 'slack'],
        triggerCount: 0,
      },
    ];
  }

  private startTracking(): void {
    if (this.config.realTimeTracking) {
      setInterval(() => {
        this.updateBehaviorData();
      }, this.config.trackingInterval);
    }
  }

  private processEvent(event: UserBehaviorEvent): void {
    // 處理事件邏輯
  }

  private async updateBehaviorData(): Promise<void> {
    // 更新行為數據
  }

  private async analyzePatterns(
    events: UserBehaviorEvent[]
  ): Promise<UserBehaviorPattern[]> {
    return this.patterns;
  }

  private async analyzeUserPatterns(
    userId: string,
    events: UserBehaviorEvent[]
  ): Promise<UserBehaviorPattern[]> {
    return this.patterns.filter(p => p.userId === userId);
  }

  private async generateProfiles(
    events: UserBehaviorEvent[]
  ): Promise<UserProfile[]> {
    return this.profiles;
  }

  private async generateUserProfile(
    userId: string,
    events: UserBehaviorEvent[]
  ): Promise<UserProfile> {
    const _existingProfile = this.profiles.find(p => p.userId === userId);
    if (existingProfile) {
      return existingProfile;
    }

    // 如果沒有找到，返回默認畫像
    return {
      id: `profile_${userId}`,
      userId,
      userType: 'collector',
      experienceLevel: 'intermediate',
      interests: ['Pokemon', 'Yu-Gi-Oh'],
      budget: {
        min: 10,
        max: 500,
        currency: 'USD',
      },
      collectionSize: 50,
      activeSince: Date.now() - 30 * 24 * 60 * 60 * 1000,
      lastActive: Date.now(),
      engagementScore: 0.6,
      loyaltyScore: 0.7,
      behaviorScore: 0.65,
      riskTolerance: 'medium',
      preferences: {
        favoriteCategories: ['Pokemon'],
        favoriteSeries: ['Base Set'],
        preferredConditions: ['Near Mint'],
        preferredLanguages: ['English'],
        notificationPreferences: {
          email: true,
          push: true,
          sms: false,
        },
      },
      behaviorMetrics: {
        totalSessions: 20,
        averageSessionDuration: 1200,
        averageSessionsPerDay: 1.0,
        mostActiveHour: 14,
        mostActiveDay: 3,
        bounceRate: 0.2,
        returnRate: 0.8,
        conversionRate: 0.1,
      },
    };
  }

  private async calculateStats(
    events: UserBehaviorEvent[]
  ): Promise<UserBehaviorStats> {
    return {
      totalUsers: 1000,
      activeUsers: 500,
      newUsers: 50,
      returningUsers: 450,
      churnRate: 0.1,
      totalEvents: events.length,
      averageEventsPerUser: events.length / 1000,
      averageSessionDuration: 1800,
      sessionFrequency: 2.5,
      conversionRate: 0.12,
      revenuePerUser: 25,
      eventsByType: {
        page_view: 5000,
        card_view: 3000,
        search: 1500,
        purchase: 200,
      },
      peakHours: [9, 10, 11, 14, 15, 16],
      conversionFunnel: {
        step1: 0.8,
        step2: 0.6,
        step3: 0.4,
        step4: 0.2,
      },
    };
  }

  private async generateInsights(
    events: UserBehaviorEvent[],
    stats: UserBehaviorStats
  ): Promise<UserBehaviorInsight[]> {
    return [
      {
        id: `insight_${Date.now()}_1`,
        type: 'opportunity',
        title: '用戶參與度提升機會',
        description: '用戶平均會話時長有提升空間',
        impact: 'medium',
        confidence: 0.8,
        data: { averageSessionDuration: stats.averageSessionDuration },
        timestamp: Date.now(),
        affectedUsers: 500,
        potentialValue: 5000,
      },
    ];
  }

  private async generateRecommendations(
    insights: UserBehaviorInsight[],
    stats: UserBehaviorStats
  ): Promise<UserBehaviorRecommendation[]> {
    return [
      {
        id: `rec_${Date.now()}_1`,
        type: 'engagement',
        title: '優化用戶體驗',
        description: '改善應用性能和用戶界面',
        priority: 'high',
        effort: 'medium',
        expectedImpact: '會話時長提升 30-50%',
        implementation: '性能優化、UI/UX改進',
        cost: 8000,
        timeline: '4-6 週',
        targetUsers: ['all'],
        successMetrics: ['會話時長', '頁面瀏覽量'],
      },
    ];
  }

  private applyFilter(
    events: UserBehaviorEvent[],
    filter?: UserBehaviorFilter
  ): UserBehaviorEvent[] {
    if (!filter) return events;

    let filteredEvents = events;

    if (filter.dateRange) {
      filteredEvents = filteredEvents.filter(
        event =>
          event.timestamp >= filter.dateRange.start &&
          event.timestamp <= filter.dateRange.end
      );
    }

    if (filter.userIds) {
      filteredEvents = filteredEvents.filter(event =>
        filter.userIds.includes(event.userId)
      );
    }

    if (filter.eventTypes) {
      filteredEvents = filteredEvents.filter(event =>
        filter.eventTypes.includes(event.eventType)
      );
    }

    if (filter.startTime && filter.endTime) {
      filteredEvents = filteredEvents.filter(
        event =>
          event.timestamp >= filter.startTime &&
          event.timestamp <= filter.endTime
      );
    }

    return filteredEvents;
  }

  private checkAlerts(event: UserBehaviorEvent): void {
    // 檢查警報邏輯
  }

  private emitEvent(event: UserBehaviorEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.warn('用戶行為事件監聽器錯誤:', error);
      }
    });
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateDataQuality(events: UserBehaviorEvent[]): number {
    if (events.length === 0) return 0;

    const _validEvents = events.filter(
      e => e.userId && e.sessionId && e.eventType && e.timestamp
    ).length;

    return validEvents / events.length;
  }

  private calculateConfidence(events: UserBehaviorEvent[]): number {
    if (events.length === 0) return 0;

    const _dataQuality = this.calculateDataQuality(events);
    const _sampleSize = Math.min(events.length / 100, 1);

    return dataQuality * sampleSize;
  }

  private calculateUserMetrics(
    events: UserBehaviorEvent[]
  ): UserBehaviorMetrics {
    return {
      totalEvents: events.length,
      uniqueUsers: new Set(events.map(e => e.userId)).size,
      activeSessions: new Set(events.map(e => e.sessionId)).size,
      averageSessionDuration: 1800,
      pageViewsPerSession: 8,
      averageTimeOnPage: 60,
      bounceRate: 0.25,
      returnRate: 0.75,
      conversionRate: 0.12,
      funnelConversion: {
        step1: 0.8,
        step2: 0.6,
        step3: 0.4,
        step4: 0.2,
      },
      averageUserValue: 50,
      customerLifetimeValue: 200,
      revenuePerUser: 25,
      retentionRates: {
        day1: 0.7,
        day7: 0.5,
        day30: 0.3,
        day90: 0.2,
      },
      searchBehavior: {
        averageSearchesPerSession: 3,
        popularSearchTerms: ['Pokemon', 'Charizard', 'Yu-Gi-Oh'],
        searchRefinementRate: 0.3,
      },
      collectionBehavior: {
        averageCardsPerCollection: 50,
        collectionGrowthRate: 0.1,
        popularCategories: ['Pokemon', 'Yu-Gi-Oh'],
      },
      purchaseBehavior: {
        averageOrderValue: 75,
        purchaseFrequency: 0.2,
        preferredPaymentMethods: ['Credit Card', 'PayPal'],
      },
    };
  }

  private anonymizeEvents(events: UserBehaviorEvent[]): UserBehaviorEvent[] {
    return events.map(event => ({
      ...event,
      userId: `user_${this.hashCode(event.userId)}`,
      sessionId: `session_${this.hashCode(event.sessionId)}`,
      location: event.location
        ? {
            country: 'Unknown',
            region: 'Unknown',
            city: 'Unknown',
            timezone: event.location.timezone,
          }
        : undefined,
    }));
  }

  private anonymizeProfiles(profiles: UserProfile[]): UserProfile[] {
    return profiles.map(profile => ({
      ...profile,
      userId: `user_${this.hashCode(profile.userId)}`,
      location: undefined,
    }));
  }

  private hashCode(str: string): number {
    let hash = 0;
    if (str.length === 0) return hash;

    for (let i = 0; i < str.length; i++) {
      const _char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }

    return Math.abs(hash);
  }

  getInitializationStatus(): boolean {
    return this.isInitialized;
  }
}
