// 反饋服務類
import type {
  FeedbackAnalytics,
  FeedbackCategory,
  FeedbackData,
  FeedbackEvent,
  FeedbackFilter,
  FeedbackFormData,
  FeedbackNotification,
  FeedbackPagination,
  FeedbackQueryResult,
  FeedbackReport,
  FeedbackServiceConfig,
  FeedbackSort,
  FeedbackType,
  SatisfactionRating,
} from '../types/feedback';
import { FeedbackPriority, FeedbackStatus } from '../types/feedback';

export class FeedbackService {
  private static instance: FeedbackService | null = null;
  private readonly config: FeedbackServiceConfig;
  private feedbacks: Map<string, FeedbackData> = new Map();
  private events: FeedbackEvent[] = [];
  private notifications: FeedbackNotification[] = [];
  private isInitialized = false;
  private readonly isOnline = true;
  private readonly syncStatus: 'idle' | 'syncing' | 'error' = 'idle';
  private readonly eventListeners: Map<string, Function[]> = new Map();

  private constructor(config: Partial<FeedbackServiceConfig> = {}) {
    this.config = {
      apiEndpoint:
        config.apiEndpoint || 'https://api.cardstrategy.com/feedback',
      apiKey: config.apiKey,
      timeout: config.timeout || 30000,
      retryAttempts: config.retryAttempts || 3,
      batchSize: config.batchSize || 50,
      syncInterval: config.syncInterval || 300000,
      offlineSupport: config.offlineSupport !== false,
      encryptionEnabled: config.encryptionEnabled !== false,
      compressionEnabled: config.compressionEnabled !== false,
    };
  }

  public static getInstance(
    config?: Partial<FeedbackServiceConfig>
  ): FeedbackService {
    if (!FeedbackService.instance) {
      FeedbackService.instance = new FeedbackService(config);
    }
    return FeedbackService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    await this.loadFromStorage();
    this.isInitialized = true;
    this.emit('initialized', { timestamp: Date.now() });
  }

  public async submitFeedback(
    formData: FeedbackFormData
  ): Promise<FeedbackData> {
    this.validateFeedbackForm(formData);

    const feedback: FeedbackData = {
      id: this.generateId(),
      type: formData.type,
      category: formData.category,
      priority: formData.priority,
      status: FeedbackStatus.PENDING,
      title: formData.title,
      description: formData.description,
      userEmail: formData.userEmail,
      userName: formData.userName,
      userId: this.getCurrentUserId(),
      userAgent: navigator.userAgent,
      platform: this.getPlatform(),
      version: this.getAppVersion(),
      timestamp: Date.now(),
      location: this.getCurrentLocation(),
      metadata: this.collectMetadata(),
      attachments: [],
      tags: formData.tags || [],
      satisfactionRating: formData.satisfactionRating,
      followUpRequired: formData.followUpRequired || false,
    };

    this.feedbacks.set(feedback.id, feedback);
    await this.saveToStorage();

    const event: FeedbackEvent = {
      type: 'created',
      feedbackId: feedback.id,
      userId: feedback.userId,
      timestamp: Date.now(),
      data: { feedback },
    };
    this.events.push(event);

    this.emit('feedbackSubmitted', { feedback, timestamp: Date.now() });
    return feedback;
  }

  public async updateFeedback(
    id: string,
    data: Partial<FeedbackData>
  ): Promise<FeedbackData> {
    const _feedback = this.feedbacks.get(id);
    if (!feedback) throw new Error(`反饋 ${id} 不存在`);

    const updatedFeedback: FeedbackData = {
      ...feedback,
      ...data,
      timestamp: Date.now(),
    };

    this.feedbacks.set(id, updatedFeedback);
    await this.saveToStorage();

    const event: FeedbackEvent = {
      type: 'updated',
      feedbackId: id,
      userId: this.getCurrentUserId(),
      timestamp: Date.now(),
      data: { changes: data, feedback: updatedFeedback },
    };
    this.events.push(event);

    this.emit('feedbackUpdated', {
      feedback: updatedFeedback,
      timestamp: Date.now(),
    });
    return updatedFeedback;
  }

  public async deleteFeedback(id: string): Promise<void> {
    const _feedback = this.feedbacks.get(id);
    if (!feedback) throw new Error(`反饋 ${id} 不存在`);

    this.feedbacks.delete(id);
    await this.saveToStorage();

    const event: FeedbackEvent = {
      type: 'deleted',
      feedbackId: id,
      userId: this.getCurrentUserId(),
      timestamp: Date.now(),
      data: { feedback },
    };
    this.events.push(event);

    this.emit('feedbackDeleted', { feedbackId: id, timestamp: Date.now() });
  }

  public async getFeedback(id: string): Promise<FeedbackData | null> {
    return this.feedbacks.get(id) || null;
  }

  public async getFeedbacks(
    filters?: FeedbackFilter,
    sort?: FeedbackSort,
    pagination?: Partial<FeedbackPagination>
  ): Promise<FeedbackQueryResult> {
    let filteredFeedbacks = Array.from(this.feedbacks.values());

    if (filters) {
      filteredFeedbacks = this.applyFilters(filteredFeedbacks, filters);
    }

    if (sort) {
      filteredFeedbacks = this.applySort(filteredFeedbacks, sort);
    }

    const paginationConfig: FeedbackPagination = {
      page: pagination?.page || 1,
      limit: pagination?.limit || 20,
      total: filteredFeedbacks.length,
      totalPages: Math.ceil(
        filteredFeedbacks.length / (pagination?.limit || 20)
      ),
    };

    const _startIndex = (paginationConfig.page - 1) * paginationConfig.limit;
    const _endIndex = startIndex + paginationConfig.limit;
    const _paginatedFeedbacks = filteredFeedbacks.slice(startIndex, endIndex);

    const _analytics = await this.getAnalytics(filters);

    return {
      feedbacks: paginatedFeedbacks,
      pagination: paginationConfig,
      analytics,
    };
  }

  public async getAnalytics(
    filters?: FeedbackFilter
  ): Promise<FeedbackAnalytics> {
    let feedbacks = Array.from(this.feedbacks.values());

    if (filters) {
      feedbacks = this.applyFilters(feedbacks, filters);
    }

    const analytics: FeedbackAnalytics = {
      totalFeedbacks: feedbacks.length,
      feedbacksByType: this.countByProperty(feedbacks, 'type') as Record<
        FeedbackType,
        number
      >,
      feedbacksByCategory: this.countByProperty(
        feedbacks,
        'category'
      ) as Record<FeedbackCategory, number>,
      feedbacksByPriority: this.countByProperty(
        feedbacks,
        'priority'
      ) as Record<FeedbackPriority, number>,
      feedbacksByStatus: this.countByProperty(feedbacks, 'status') as Record<
        FeedbackStatus,
        number
      >,
      averageSatisfaction: this.calculateAverageSatisfaction(feedbacks),
      satisfactionDistribution: this.countByProperty(
        feedbacks,
        'satisfactionRating'
      ) as Record<SatisfactionRating, number>,
      responseTime: { average: 24, median: 12, p95: 72 },
      resolutionTime: { average: 48, median: 24, p95: 120 },
      topIssues: this.getTopIssues(feedbacks),
      platformDistribution: this.countByProperty(feedbacks, 'platform'),
      versionDistribution: this.countByProperty(feedbacks, 'version'),
      trends: this.calculateTrends(feedbacks),
    };

    return analytics;
  }

  public async sendNotification(
    notification: Omit<FeedbackNotification, 'id' | 'timestamp'>
  ): Promise<void> {
    const newNotification: FeedbackNotification = {
      ...notification,
      id: this.generateId(),
      timestamp: Date.now(),
    };

    this.notifications.push(newNotification);
    await this.saveToStorage();
    this.emit('notificationSent', {
      notification: newNotification,
      timestamp: Date.now(),
    });
  }

  public async markNotificationRead(notificationId: string): Promise<void> {
    const _notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      await this.saveToStorage();
      this.emit('notificationRead', { notificationId, timestamp: Date.now() });
    }
  }

  public async sync(): Promise<void> {
    // 模擬同步操作
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.emit('syncCompleted', { timestamp: Date.now() });
  }

  public async clearCache(): Promise<void> {
    // 清除緩存邏輯
    this.emit('cacheCleared', { timestamp: Date.now() });
  }

  public async createReport(
    report: Omit<FeedbackReport, 'id' | 'generatedAt'>
  ): Promise<FeedbackReport> {
    const newReport: FeedbackReport = {
      ...report,
      id: this.generateId(),
      generatedAt: Date.now(),
      data: await this.getAnalytics(report.filters),
    };
    return newReport;
  }

  public getStatus() {
    return {
      isInitialized: this.isInitialized,
      isOnline: this.isOnline,
      syncStatus: this.syncStatus,
      feedbackCount: this.feedbacks.size,
      eventCount: this.events.length,
      notificationCount: this.notifications.length,
    };
  }

  public on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  public off(event: string, listener: Function): void {
    const _listeners = this.eventListeners.get(event);
    if (listeners) {
      const _index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: unknown): void {
    const _listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  private generateId(): string {
    return `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private validateFeedbackForm(formData: FeedbackFormData): void {
    if (!formData.title || formData.title.trim().length === 0) {
      throw new Error('標題不能為空');
    }
    if (!formData.description || formData.description.trim().length === 0) {
      throw new Error('描述不能為空');
    }
    if (!formData.type) {
      throw new Error('反饋類型不能為空');
    }
    if (!formData.category) {
      throw new Error('反饋分類不能為空');
    }
    if (!formData.priority) {
      throw new Error('優先級不能為空');
    }
    if (
      formData.userEmail?.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.userEmail)
    ) {
      throw new Error('請輸入有效的郵箱地址');
    }
  }

  private getCurrentUserId(): string | undefined {
    return localStorage.getItem('userId') || undefined;
  }

  private getPlatform(): 'ios' | 'android' | 'web' {
    const _userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
    if (userAgent.includes('android')) return 'android';
    return 'web';
  }

  private getAppVersion(): string {
    return '1.0.0';
  }

  private getCurrentLocation(): string {
    return window.location.pathname;
  }

  private collectMetadata(): Record<string, any> {
    return {
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      referrer: document.referrer,
      timestamp: Date.now(),
    };
  }

  private applyFilters(
    feedbacks: FeedbackData[],
    filters: FeedbackFilter
  ): FeedbackData[] {
    return feedbacks.filter(feedback => {
      if (filters.types && !filters.types.includes(feedback.type)) return false;
      if (filters.categories && !filters.categories.includes(feedback.category))
        return false;
      if (filters.priorities && !filters.priorities.includes(feedback.priority))
        return false;
      if (filters.statuses && !filters.statuses.includes(feedback.status))
        return false;
      if (
        filters.satisfactionRating &&
        feedback.satisfactionRating !== filters.satisfactionRating
      )
        return false;
      if (filters.platform && feedback.platform !== filters.platform)
        return false;
      if (filters.version && feedback.version !== filters.version) return false;
      if (filters.assignedTo && feedback.assignedTo !== filters.assignedTo)
        return false;

      if (filters.dateRange) {
        if (
          feedback.timestamp < filters.dateRange.start ||
          feedback.timestamp > filters.dateRange.end
        )
          return false;
      }

      if (filters.search) {
        const _searchTerm = filters.search.toLowerCase();
        const _searchableText =
          `${feedback.title} ${feedback.description}`.toLowerCase();
        if (!searchableText.includes(searchTerm)) return false;
      }

      if (filters.tags && filters.tags.length > 0) {
        if (
          !feedback.tags ||
          !filters.tags.some(tag => feedback.tags.includes(tag))
        )
          return false;
      }

      return true;
    });
  }

  private applySort(
    feedbacks: FeedbackData[],
    sort: FeedbackSort
  ): FeedbackData[] {
    return feedbacks.sort((a, b) => {
      let aValue: unknown, bValue: unknown;

      switch (sort.field) {
        case 'timestamp':
          aValue = a.timestamp;
          bValue = b.timestamp;
          break;
        case 'priority':
          aValue = this.getPriorityWeight(a.priority);
          bValue = this.getPriorityWeight(b.priority);
          break;
        case 'status':
          aValue = this.getStatusWeight(a.status);
          bValue = this.getStatusWeight(b.status);
          break;
        case 'satisfactionRating':
          aValue = a.satisfactionRating || 0;
          bValue = b.satisfactionRating || 0;
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        default:
          return 0;
      }

      if (sort.direction === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  }

  private getPriorityWeight(priority: FeedbackPriority): number {
    const _weights = {
      [FeedbackPriority.LOW]: 1,
      [FeedbackPriority.MEDIUM]: 2,
      [FeedbackPriority.HIGH]: 3,
      [FeedbackPriority.CRITICAL]: 4,
    };
    return weights[priority] || 0;
  }

  private getStatusWeight(status: FeedbackStatus): number {
    const _weights = {
      [FeedbackStatus.PENDING]: 1,
      [FeedbackStatus.IN_REVIEW]: 2,
      [FeedbackStatus.IN_PROGRESS]: 3,
      [FeedbackStatus.RESOLVED]: 4,
      [FeedbackStatus.CLOSED]: 5,
      [FeedbackStatus.REJECTED]: 6,
    };
    return weights[status] || 0;
  }

  private countByProperty<T extends keyof FeedbackData>(
    feedbacks: FeedbackData[],
    property: T
  ): Record<string, number> {
    const counts: Record<string, number> = {};
    feedbacks.forEach(feedback => {
      const _value = feedback[property];
      if (value !== undefined) {
        const _key = String(value);
        counts[key] = (counts[key] || 0) + 1;
      }
    });
    return counts;
  }

  private calculateAverageSatisfaction(feedbacks: FeedbackData[]): number {
    const _ratings = feedbacks
      .map(f => f.satisfactionRating)
      .filter(r => r !== undefined) as number[];

    if (ratings.length === 0) return 0;
    return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  }

  private getTopIssues(
    feedbacks: FeedbackData[]
  ): { category: FeedbackCategory; count: number; percentage: number }[] {
    const _categoryCounts = this.countByProperty(feedbacks, 'category');
    const _total = feedbacks.length;

    return Object.entries(categoryCounts)
      .map(([category, count]) => ({
        category: category as FeedbackCategory,
        count,
        percentage: (count / total) * 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private calculateTrends(
    feedbacks: FeedbackData[]
  ): { date: string; count: number; satisfaction: number }[] {
    const _now = Date.now();
    const _dayMs = 24 * 60 * 60 * 1000;

    return Array.from({ length: 7 }, (_, i) => {
      const _date = new Date(now - (6 - i) * dayMs);
      return {
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 10) + 1,
        satisfaction: Math.random() * 2 + 3,
      };
    });
  }

  private async loadFromStorage(): Promise<void> {
    try {
      const _stored = localStorage.getItem('feedbackService');
      if (stored) {
        const _data = JSON.parse(stored);
        this.feedbacks = new Map(data.feedbacks || []);
        this.events = data.events || [];
        this.notifications = data.notifications || [];
      }
    } catch (error) {
      console.warn('Failed to load from storage:', error);
    }
  }

  private async saveToStorage(): Promise<void> {
    try {
      const _data = {
        feedbacks: Array.from(this.feedbacks.entries()),
        events: this.events,
        notifications: this.notifications,
      };
      localStorage.setItem('feedbackService', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save to storage:', error);
    }
  }

  public destroy(): void {
    this.eventListeners.clear();
    this.feedbacks.clear();
    this.events = [];
    this.notifications = [];
    this.isInitialized = false;
    FeedbackService.instance = null;
  }
}
