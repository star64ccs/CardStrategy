import { api } from '../config/api';
import { errorHandler, withErrorHandling } from '@/utils/errorHandler';

export interface CollectionStatsOptions {
  startDate?: string;
  endDate?: string;
  source?: string;
  quality?: string;
  status?: string;
}

export interface CollectionStats {
  summary: {
    totalRecords: number;
    dateRange: {
      startDate: string;
      endDate: string;
    };
    collectionPeriod: number;
  };
  sourceDistribution: {
    source: string;
    count: number;
    percentage: string;
    avgConfidence: string;
  }[];
  qualityDistribution: {
    quality: string;
    count: number;
    percentage: string;
  }[];
  statusDistribution: {
    status: string;
    count: number;
    percentage: string;
  }[];
  timeSeries: {
    daily: {
      date: string;
      count: number;
    }[];
    hourly: {
      hour: string;
      count: number;
    }[];
  };
  performance: {
    processingTime: {
      average: string;
      minimum: string;
      maximum: string;
    };
    imageSize: {
      average: string;
      minimum: string;
      maximum: string;
    };
  };
  formatDistribution: {
    format: string;
    count: number;
    percentage: string;
  }[];
  qualityMetrics: {
    completeness: number;
    accuracy: number;
    consistency: number;
    timeliness: number;
    overallScore: number;
    assessmentDate: string;
  } | null;
  trends: {
    firstHalfCount: number;
    secondHalfCount: number;
    growthRate: number;
    trend: string;
    averageDailyGrowth: string;
  };
  efficiency: {
    averageDailyCollection: number;
    highQualityRatio: number;
    successRate: number;
    efficiencyScore: string;
  };
  insights: string[];
}

export interface AnnotationStats {
  totalAnnotators: number;
  totalAnnotations: number;
  averageAccuracy: number;
  averageProcessingTime: number;
  qualityDistribution: {
    quality: string;
    count: number;
    percentage: string;
  }[];
  annotatorPerformance: {
    annotatorId: number;
    level: string;
    accuracy: number;
    totalAnnotations: number;
    completedAnnotations: number;
    averageProcessingTime: number;
    lastActiveDate: string;
  }[];
}

export interface AssignmentOptions {
  batchSize?: number;
  priorityFilter?: string;
  difficultyFilter?: string;
  annotationTypeFilter?: string;
  forceReassignment?: boolean;
}

export interface AssignmentResult {
  taskId: number;
  trainingDataId: number;
  annotatorId: number;
  annotationType: string;
  expectedQuality: number;
  assignmentReason: string;
}

export interface AssignmentResponse {
  totalAssigned: number;
  assignments: AssignmentResult[];
  algorithm: string;
  timestamp: string;
}

export interface AnnotatorDetails {
  id: number;
  userId: number;
  level: string;
  accuracy: number;
  totalAnnotations: number;
  completedAnnotations: number;
  averageProcessingTime: number;
  lastActiveDate: string;
  isActive: boolean;
  expertise: {
    card_identification: number;
    condition_assessment: number;
    authenticity_verification: number;
    centering_analysis: number;
  };
  availability: number;
  performanceHistory: {
    averageConfidence: number;
    averageProcessingTime: number;
    successRate: number;
    qualityTrend: string;
  };
}

export interface AssignmentConfig {
  maxTasksPerAnnotator: number;
  qualityThreshold: number;
  workloadWeight: number;
  expertiseWeight: number;
  qualityWeight: number;
  learningRate: number;
  priorityBoost: number;
  difficultyPenalty: number;
}

export interface LearningRequest {
  annotationId: number;
  actualQuality: number;
  processingTime?: number;
}

export interface LearningResponse {
  totalAnnotations: number;
  averageProcessingTime: number;
}

export interface DataQualityMetrics {
  id: number;
  dataType: string;
  completeness: number;
  accuracy: number;
  consistency: number;
  timeliness: number;
  overallScore: number;
  assessmentDate: string;
  dataSource: string;
  sampleSize: number;
  metadata: any;
}

export interface QualityReport {
  totalAssessments: number;
  averageOverallScore: number;
  dataTypeDistribution: Record<string, number>;
  qualityTrend: string;
  recommendations: string[];
}

export interface DataQualityRecommendations {
  dataCollection: string[];
  annotation: string[];
  cleaning: string[];
  general: string[];
}

// Dashboard interfaces
export interface DashboardData {
  overallMetrics: OverallMetrics;
  trendData: TrendData;
  sourceBreakdown: SourceBreakdown;
  qualityDistribution: QualityDistribution;
  annotatorPerformance: AnnotatorPerformance;
  recentIssues: QualityIssue[];
  improvementSuggestions: ImprovementSuggestion[];
  lastUpdated: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export interface OverallMetrics {
  averageCompleteness: number;
  averageAccuracy: number;
  averageConsistency: number;
  averageTimeliness: number;
  overallScore: number;
  totalAssessments: number;
}

export interface TrendData {
  dateLabels: string[];
  trendData: {
    [dataType: string]: {
      completeness: number[];
      accuracy: number[];
      consistency: number[];
      timeliness: number[];
      overallScore: number[];
    };
  };
}

export interface SourceBreakdown {
  sourceBreakdown: {
    source: string;
    count: number;
    percentage: number;
  }[];
  qualityBreakdown: {
    quality: string;
    count: number;
    percentage: number;
  }[];
  statusBreakdown: {
    status: string;
    count: number;
    percentage: number;
  }[];
  totalRecords: number;
}

export interface QualityDistribution {
  overallDistribution: {
    excellent: { count: number; percentage: number };
    good: { count: number; percentage: number };
    fair: { count: number; percentage: number };
    poor: { count: number; percentage: number };
  };
  typeDistribution: {
    [dataType: string]: {
      excellent: number;
      good: number;
      fair: number;
      poor: number;
      total: number;
      excellentPercentage: number;
      goodPercentage: number;
      fairPercentage: number;
      poorPercentage: number;
    };
  };
  totalAssessments: number;
}

export interface AnnotatorPerformance {
  annotatorStats: {
    username: string;
    totalAnnotations: number;
    approvedAnnotations: number;
    rejectedAnnotations: number;
    averageConfidence: number;
    averageProcessingTime: number;
    approvalRate: number;
  }[];
  typeStats: {
    type: string;
    totalAnnotations: number;
    approvedAnnotations: number;
    rejectedAnnotations: number;
    averageConfidence: number;
    averageProcessingTime: number;
    approvalRate: number;
  }[];
  totalAnnotations: number;
}

export interface QualityIssue {
  type: 'low_quality' | 'rejected_annotation';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  date: string;
  dataType?: string;
  score?: number;
  annotationType?: string;
  annotatorId?: number;
}

export interface ImprovementSuggestion {
  priority: 'high' | 'medium' | 'low';
  category:
    | 'data_collection'
    | 'annotation'
    | 'data_cleaning'
    | 'processing'
    | 'specific_type';
  title: string;
  description: string;
  action: string;
}

export interface Alert {
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
}

export interface DashboardOptions {
  startDate?: string;
  endDate?: string;
  dataTypes?: string[];
}

class DataQualityService {
  // 獲取數據收集統計
  async getCollectionStats(
    options: CollectionStatsOptions = {}
  ): Promise<{ data: CollectionStats }> {
    const params = new URLSearchParams();

    if (options.startDate) params.append('startDate', options.startDate);
    if (options.endDate) params.append('endDate', options.endDate);
    if (options.source) params.append('source', options.source);
    if (options.quality) params.append('quality', options.quality);
    if (options.status) params.append('status', options.status);

    const response = await api.get(
      `/data-quality/collect/stats?${params.toString()}`
    );
    return response.data;
  }

  // 開始數據收集
  async startDataCollection(): Promise<{ data: any }> {
    const response = await api.post('/data-quality/collect');
    return response.data;
  }

  // 智能分配標註任務
  async assignAnnotationTasks(
    options: AssignmentOptions = {}
  ): Promise<{ data: AssignmentResponse }> {
    const response = await api.post('/data-quality/annotate/assign', options);
    return response.data;
  }

  // 學習機制：根據實際結果調整分配策略
  async learnFromResults(request: LearningRequest): Promise<{ data: any }> {
    const response = await api.post('/data-quality/annotate/learn', request);
    return response.data;
  }

  // 獲取分配算法配置
  async getAssignmentConfig(): Promise<{
    data: {
      config: AssignmentConfig;
      algorithm: string;
      version: string;
      features: string[];
    };
  }> {
    const response = await api.get('/data-quality/annotate/config');
    return response.data;
  }

  // 更新分配算法配置
  async updateAssignmentConfig(
    config: Partial<AssignmentConfig>
  ): Promise<{ data: { config: AssignmentConfig; timestamp: string } }> {
    const response = await api.put('/data-quality/annotate/config', { config });
    return response.data;
  }

  // 獲取標註者詳細信息
  async getAnnotatorDetails(includeInactive: boolean = false): Promise<{
    data: {
      annotators: AnnotatorDetails[];
      totalCount: number;
      activeCount: number;
    };
  }> {
    const params = new URLSearchParams();
    if (includeInactive) params.append('includeInactive', 'true');

    const response = await api.get(
      `/data-quality/annotate/annotators?${params.toString()}`
    );
    return response.data;
  }

  // 提交標註結果
  async submitAnnotation(
    annotationId: number,
    annotationResult: any,
    confidence: number
  ): Promise<{ data: any }> {
    const response = await api.post('/data-quality/annotate/submit', {
      annotationId,
      annotationResult,
      confidence,
    });
    return response.data;
  }

  // 審核標註結果
  async reviewAnnotation(
    annotationId: number,
    reviewStatus: string,
    reviewNotes?: string
  ): Promise<{ data: any }> {
    const response = await api.post('/data-quality/annotate/review', {
      annotationId,
      reviewStatus,
      reviewNotes,
    });
    return response.data;
  }

  // 批量審核標註結果
  async batchReviewAnnotations(
    reviews: {
      annotationId: number;
      reviewStatus: string;
      reviewNotes?: string;
    }[]
  ): Promise<{ data: any }> {
    const response = await api.post('/data-quality/annotate/batch-review', {
      reviews,
    });
    return response.data;
  }

  // 獲取標註統計
  async getAnnotationStats(): Promise<{ data: AnnotationStats }> {
    const response = await api.get('/data-quality/annotate/stats');
    return response.data;
  }

  // 執行數據清洗
  async performDataCleaning(): Promise<{ data: any }> {
    const response = await api.post('/data-quality/clean');
    return response.data;
  }

  // 獲取數據質量指標
  async getQualityMetrics(
    dataType?: string,
    limit: number = 10
  ): Promise<{ data: DataQualityMetrics[] }> {
    const params = new URLSearchParams();
    if (dataType) params.append('dataType', dataType);
    params.append('limit', limit.toString());

    const response = await api.get(
      `/data-quality/quality-metrics?${params.toString()}`
    );
    return response.data;
  }

  // 獲取數據質量報告
  async getQualityReport(
    startDate?: string,
    endDate?: string
  ): Promise<{ data: QualityReport }> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get(
      `/data-quality/quality-report?${params.toString()}`
    );
    return response.data;
  }

  // 執行完整的數據質量改進流程
  async performQualityImprovement(): Promise<{ data: any }> {
    const response = await api.post('/data-quality/improve');
    return response.data;
  }

  // 獲取數據質量改進建議
  async getRecommendations(): Promise<{ data: DataQualityRecommendations }> {
    const response = await api.get('/data-quality/recommendations');
    return response.data;
  }

  // 導出統計報告
  async exportStatsReport(options: CollectionStatsOptions = {}): Promise<Blob> {
    const params = new URLSearchParams();

    if (options.startDate) params.append('startDate', options.startDate);
    if (options.endDate) params.append('endDate', options.endDate);
    if (options.source) params.append('source', options.source);
    if (options.quality) params.append('quality', options.quality);
    if (options.status) params.append('status', options.status);

    const response = await api.get(
      `/data-quality/collect/stats/export?${params.toString()}`,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  }

  // 獲取實時統計數據
  async getRealTimeStats(): Promise<{ data: any }> {
    const response = await api.get('/data-quality/collect/stats/realtime');
    return response.data;
  }

  // 設置數據收集警報
  async setCollectionAlerts(alerts: {
    minDailyCollection?: number;
    maxProcessingTime?: number;
    minQualityScore?: number;
    emailNotifications?: boolean;
  }): Promise<{ data: any }> {
    const response = await api.post('/data-quality/alerts', alerts);
    return response.data;
  }

  // 獲取數據收集警報設置
  async getCollectionAlerts(): Promise<{ data: any }> {
    const response = await api.get('/data-quality/alerts');
    return response.data;
  }

  /**
   * Get comprehensive dashboard data
   */
  async getDashboardData(
    options: DashboardOptions = {}
  ): Promise<{ data: DashboardData }> {
    const params = new URLSearchParams();
    if (options.startDate) params.append('startDate', options.startDate);
    if (options.endDate) params.append('endDate', options.endDate);
    if (options.dataTypes)
      params.append('dataTypes', options.dataTypes.join(','));

    const response = await api.get(
      `/data-quality/dashboard?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Get real-time alerts
   */
  async getRealTimeAlerts(): Promise<{ data: Alert[] }> {
    const response = await api.get('/data-quality/alerts');
    return response.data;
  }

  /**
   * Get overall metrics
   */
  async getOverallMetrics(
    options: DashboardOptions = {}
  ): Promise<{ data: OverallMetrics }> {
    const params = new URLSearchParams();
    if (options.startDate) params.append('startDate', options.startDate);
    if (options.endDate) params.append('endDate', options.endDate);
    if (options.dataTypes)
      params.append('dataTypes', options.dataTypes.join(','));

    const response = await api.get(
      `/data-quality/overall-metrics?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Get trend data
   */
  async getTrendData(
    options: DashboardOptions = {}
  ): Promise<{ data: TrendData }> {
    const params = new URLSearchParams();
    if (options.startDate) params.append('startDate', options.startDate);
    if (options.endDate) params.append('endDate', options.endDate);
    if (options.dataTypes)
      params.append('dataTypes', options.dataTypes.join(','));

    const response = await api.get(`/data-quality/trends?${params.toString()}`);
    return response.data;
  }

  /**
   * Get source breakdown
   */
  async getSourceBreakdown(
    startDate?: string,
    endDate?: string
  ): Promise<{ data: SourceBreakdown }> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get(
      `/data-quality/source-breakdown?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Get quality distribution
   */
  async getQualityDistribution(
    startDate?: string,
    endDate?: string
  ): Promise<{ data: QualityDistribution }> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get(
      `/data-quality/quality-distribution?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Get annotator performance
   */
  async getAnnotatorPerformance(
    startDate?: string,
    endDate?: string
  ): Promise<{ data: AnnotatorPerformance }> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get(
      `/data-quality/annotator-performance?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Get recent issues
   */
  async getRecentIssues(
    startDate?: string,
    endDate?: string
  ): Promise<{ data: QualityIssue[] }> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get(
      `/data-quality/recent-issues?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Get improvement suggestions
   */
  async getImprovementSuggestions(): Promise<{
    data: ImprovementSuggestion[];
  }> {
    const response = await api.get('/data-quality/improvement-suggestions');
    return response.data;
  }

  // ==================== 圖片轉base64功能 ====================

  /**
   * 將圖片文件轉換為base64格式
   */
  async convertImageToBase64(
    file: File | Blob,
    options: ImageToBase64Options = {}
  ): Promise<ImageToBase64Result> {
    return convertImageToBase64(file, options);
  }

  /**
   * 批量轉換圖片為base64格式
   */
  async convertImagesToBase64(
    files: (File | Blob)[],
    options: ImageToBase64Options = {}
  ): Promise<BatchImageToBase64Result> {
    return convertImagesToBase64(files, options);
  }

  /**
   * 從URL獲取圖片並轉換為base64
   */
  async convertImageUrlToBase64(
    imageUrl: string,
    options: ImageToBase64Options = {}
  ): Promise<ImageToBase64Result> {
    return convertImageUrlToBase64(imageUrl, options);
  }

  /**
   * 將base64字符串轉換回Blob對象
   */
  base64ToBlob(base64: string, mimeType: string = 'image/jpeg'): Blob {
    return base64ToBlob(base64, mimeType);
  }

  /**
   * 驗證base64字符串是否為有效的圖片
   */
  isValidImageBase64(base64: string): boolean {
    return isValidImageBase64(base64);
  }

  /**
   * 獲取base64圖片的尺寸信息
   */
  async getBase64ImageDimensions(
    base64: string
  ): Promise<{ width: number; height: number }> {
    return getBase64ImageDimensions(base64);
  }

  /**
   * 壓縮base64圖片
   */
  async compressBase64Image(
    base64: string,
    options: ImageToBase64Options = {}
  ): Promise<ImageToBase64Result> {
    return compressBase64Image(base64, options);
  }
}

export { DataQualityService };
export const dataQualityService = new DataQualityService();

// ==================== 反饋管理相關接口 ====================

export interface FeedbackData {
  feedbackType: string;
  category: string;
  severity: string;
  title: string;
  description: string;
  tags?: string[];
  attachments?: any[];
  metadata?: any;
}

export interface Feedback {
  id: number;
  userId: number;
  feedbackType: string;
  category: string;
  severity: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignedTo?: number;
  resolution?: string;
  resolutionDate?: string;
  resolvedBy?: number;
  tags: string[];
  attachments: any[];
  metadata: any;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
  assignedUser?: {
    id: number;
    username: string;
  };
  resolvedByUser?: {
    id: number;
    username: string;
  };
  responses: {
    id: number;
    userId: number;
    responseType: string;
    content: string;
    isInternal: boolean;
    createdAt: string;
    user: {
      id: number;
      username: string;
    };
  }[];
}

export interface FeedbackStats {
  totalSubmitted: number;
  totalResolved: number;
  averageResolutionTime: number;
  feedbackTypeDistribution: { [key: string]: number };
  categoryDistribution: { [key: string]: number };
  priorityDistribution: { [key: string]: number };
  statusDistribution: { [key: string]: number };
  severityDistribution: { [key: string]: number };
  dailyTrend: {
    date: string;
    submitted: number;
    resolved: number;
  }[];
}

export interface FeedbackSuggestion {
  priority: string;
  category: string;
  title: string;
  description: string;
  action: string;
}

// 定期數據質量評估相關接口
export interface AssessmentSchedule {
  id: number;
  name: string;
  description?: string;
  assessmentType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'custom';
  frequency: {
    interval: number;
    unit: string;
    timeOfDay: string;
    daysOfWeek: number[];
    dayOfMonth: number;
    monthOfQuarter: number;
  };
  dataTypes: string[];
  assessmentCriteria: {
    completeness: { weight: number; threshold: number };
    accuracy: { weight: number; threshold: number };
    consistency: { weight: number; threshold: number };
    timeliness: { weight: number; threshold: number };
  };
  isActive: boolean;
  startDate: string;
  endDate?: string;
  lastRunDate?: string;
  nextRunDate?: string;
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  averageExecutionTime?: number;
  notificationSettings: {
    onSuccess: boolean;
    onFailure: boolean;
    onCompletion: boolean;
    recipients: string[];
    emailNotifications: boolean;
    slackNotifications: boolean;
  };
  createdBy: number;
  metadata: any;
  createdAt: string;
  updatedAt: string;
  createdByUser?: { id: number; username: string; email: string };
}

export interface DataQualityAssessment {
  id: number;
  assessmentType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'custom';
  assessmentDate: string;
  scheduledDate: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  dataTypes: string[];
  assessmentCriteria: {
    completeness: { weight: number; threshold: number };
    accuracy: { weight: number; threshold: number };
    consistency: { weight: number; threshold: number };
    timeliness: { weight: number; threshold: number };
  };
  results: {
    overallScore: number;
    completeness: number;
    accuracy: number;
    consistency: number;
    timeliness: number;
    sampleSize: number;
    dataSources: {
      type: string;
      sampleSize: number;
      completeness: number;
      accuracy: number;
      consistency: number;
      timeliness: number;
      issues: {
        type: string;
        category?: string;
        message: string;
      }[];
    }[];
    qualityDistribution: {
      excellent: number;
      good: number;
      fair: number;
      poor: number;
    };
    issues: {
      type: string;
      dataType?: string;
      message: string;
    }[];
    recommendations: {
      priority: string;
      category: string;
      title: string;
      description: string;
      action: string;
    }[];
  };
  executionTime?: number;
  errorMessage?: string;
  triggeredBy: 'system' | 'manual' | 'api';
  triggeredByUserId?: number;
  nextAssessmentDate?: string;
  metadata: any;
  createdAt: string;
  updatedAt: string;
  triggeredByUser?: { id: number; username: string; email: string };
}

export interface AssessmentStats {
  totalAssessments: number;
  completedAssessments: number;
  failedAssessments: number;
  averageExecutionTime: number;
  averageOverallScore: number;
  statusDistribution: { [key: string]: number };
  typeDistribution: { [key: string]: number };
  dailyTrend: {
    date: string;
    total: number;
    completed: number;
    failed: number;
  }[];
}

export interface AssessmentFilters {
  status?: string;
  assessmentType?: string;
  startDate?: string;
  endDate?: string;
  triggeredBy?: string;
}

export interface ScheduleFilters {
  isActive?: boolean;
  assessmentType?: string;
}

export interface CreateScheduleRequest {
  name: string;
  description?: string;
  assessmentType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'custom';
  frequency: {
    interval: number;
    unit: string;
    timeOfDay: string;
    daysOfWeek?: number[];
    dayOfMonth?: number;
    monthOfQuarter?: number;
  };
  dataTypes: string[];
  assessmentCriteria: {
    completeness: { weight: number; threshold: number };
    accuracy: { weight: number; threshold: number };
    consistency: { weight: number; threshold: number };
    timeliness: { weight: number; threshold: number };
  };
  startDate?: string;
  endDate?: string;
  notificationSettings?: {
    onSuccess: boolean;
    onFailure: boolean;
    onCompletion: boolean;
    recipients: string[];
    emailNotifications: boolean;
    slackNotifications: boolean;
  };
  metadata?: any;
}

export interface ManualAssessmentRequest {
  dataTypes: string[];
  assessmentCriteria: {
    completeness: { weight: number; threshold: number };
    accuracy: { weight: number; threshold: number };
    consistency: { weight: number; threshold: number };
    timeliness: { weight: number; threshold: number };
  };
}

export interface FeedbackFilters {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  feedbackType?: string;
  category?: string;
  severity?: string;
  assignedTo?: number;
  startDate?: string;
  endDate?: string;
  userId?: number;
}

export interface FeedbackStatsOptions {
  startDate?: string;
  endDate?: string;
  feedbackType?: string;
  category?: string;
}

// 提交反饋
export const submitFeedback = async (
  feedbackData: FeedbackData
): Promise<{ data: Feedback }> => {
  const response = await api.post('/data-quality/feedback', feedbackData);
  return response.data;
};

// 獲取反饋列表
export const getFeedbacks = async (
  filters: FeedbackFilters = {}
): Promise<{ data: { feedbacks: Feedback[]; pagination: any } }> => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, value.toString());
    }
  });
  const response = await api.get(`/data-quality/feedback?${params}`);
  return response.data;
};

// 獲取單個反饋詳情
export const getFeedbackById = async (
  feedbackId: number
): Promise<{ data: Feedback }> => {
  const response = await api.get(`/data-quality/feedback/${feedbackId}`);
  return response.data;
};

// 更新反饋狀態
export const updateFeedbackStatus = async (
  feedbackId: number,
  status: string,
  resolution?: string
): Promise<{ data: Feedback }> => {
  const response = await api.put(
    `/data-quality/feedback/${feedbackId}/status`,
    { status, resolution }
  );
  return response.data;
};

// 分配反饋
export const assignFeedback = async (
  feedbackId: number,
  assignedTo: number
): Promise<{ data: Feedback }> => {
  const response = await api.put(
    `/data-quality/feedback/${feedbackId}/assign`,
    { assignedTo }
  );
  return response.data;
};

// 添加反饋回應
export const addFeedbackResponse = async (
  feedbackId: number,
  content: string,
  responseType: string = 'comment',
  isInternal: boolean = false
): Promise<{ data: any }> => {
  const response = await api.post(
    `/data-quality/feedback/${feedbackId}/response`,
    {
      content,
      responseType,
      isInternal,
    }
  );
  return response.data;
};

// 獲取反饋統計
export const getFeedbackStats = async (
  options: FeedbackStatsOptions = {}
): Promise<{ data: FeedbackStats }> => {
  const params = new URLSearchParams();
  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, value);
    }
  });
  const response = await api.get(`/data-quality/feedback/stats?${params}`);
  return response.data;
};

// 獲取反饋改進建議
export const getFeedbackSuggestions = async (): Promise<{
  data: FeedbackSuggestion[];
}> => {
  const response = await api.get('/data-quality/feedback/suggestions');
  return response.data;
};

// 定期數據質量評估相關函數
export const createAssessmentSchedule = async (
  scheduleData: CreateScheduleRequest
): Promise<AssessmentSchedule> => {
  const response = await api.post(
    '/data-quality/assessment/schedule',
    scheduleData
  );
  return response.data;
};

export const getAssessmentSchedules = async (
  options: { page?: number; limit?: number } & ScheduleFilters = {}
): Promise<{
  schedules: AssessmentSchedule[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> => {
  const params = new URLSearchParams();
  if (options.page) params.append('page', options.page.toString());
  if (options.limit) params.append('limit', options.limit.toString());
  if (options.isActive !== undefined)
    params.append('isActive', options.isActive.toString());
  if (options.assessmentType)
    params.append('assessmentType', options.assessmentType);

  const response = await api.get(
    `/data-quality/assessment/schedules?${params.toString()}`
  );
  return response.data;
};

export const updateScheduleStatus = async (
  scheduleId: number,
  isActive: boolean
): Promise<AssessmentSchedule> => {
  const response = await api.put(
    `/data-quality/assessment/schedule/${scheduleId}/status`,
    { isActive }
  );
  return response.data;
};

export const deleteAssessmentSchedule = async (
  scheduleId: number
): Promise<void> => {
  await api.delete(`/data-quality/assessment/schedule/${scheduleId}`);
};

export const executeManualAssessment = async (
  assessmentData: ManualAssessmentRequest
): Promise<DataQualityAssessment> => {
  const response = await api.post(
    '/data-quality/assessment/execute',
    assessmentData
  );
  return response.data;
};

export const executeScheduledAssessment = async (
  scheduleId: number
): Promise<DataQualityAssessment> => {
  const response = await api.post(
    `/data-quality/assessment/schedule/${scheduleId}/execute`
  );
  return response.data;
};

export const getAssessments = async (
  options: { page?: number; limit?: number } & AssessmentFilters = {}
): Promise<{
  assessments: DataQualityAssessment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> => {
  const params = new URLSearchParams();
  if (options.page) params.append('page', options.page.toString());
  if (options.limit) params.append('limit', options.limit.toString());
  if (options.status) params.append('status', options.status);
  if (options.assessmentType)
    params.append('assessmentType', options.assessmentType);
  if (options.startDate) params.append('startDate', options.startDate);
  if (options.endDate) params.append('endDate', options.endDate);
  if (options.triggeredBy) params.append('triggeredBy', options.triggeredBy);

  const response = await api.get(
    `/data-quality/assessment/list?${params.toString()}`
  );
  return response.data;
};

export const getAssessmentById = async (
  assessmentId: number
): Promise<DataQualityAssessment> => {
  const response = await api.get(`/data-quality/assessment/${assessmentId}`);
  return response.data;
};

export const getAssessmentStats = async (
  options: {
    startDate?: string;
    endDate?: string;
    assessmentType?: string;
  } = {}
): Promise<AssessmentStats> => {
  const params = new URLSearchParams();
  if (options.startDate) params.append('startDate', options.startDate);
  if (options.endDate) params.append('endDate', options.endDate);
  if (options.assessmentType)
    params.append('assessmentType', options.assessmentType);

  const response = await api.get(
    `/data-quality/assessment/stats?${params.toString()}`
  );
  return response.data;
};

// ==================== 圖片轉base64功能 ====================

export interface ImageToBase64Options {
  quality?: number; // 圖片質量 (0-1)
  maxWidth?: number; // 最大寬度
  maxHeight?: number; // 最大高度
  format?: 'jpeg' | 'png' | 'webp'; // 輸出格式
  compression?: boolean; // 是否啟用壓縮
}

export interface ImageToBase64Result {
  base64: string;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
  format: string;
  mimeType: string;
  compressionRatio: number;
  processingTime: number;
}

export interface BatchImageToBase64Result {
  results: ImageToBase64Result[];
  totalImages: number;
  successfulConversions: number;
  failedConversions: number;
  totalProcessingTime: number;
  averageProcessingTime: number;
}

/**
 * 將圖片文件轉換為base64格式
 * @param file 圖片文件
 * @param options 轉換選項
 * @returns Promise<ImageToBase64Result>
 */
export const convertImageToBase64 = async (
  file: File | Blob,
  options: ImageToBase64Options = {}
): Promise<ImageToBase64Result> => {
  const startTime = performance.now();

  return new Promise((resolve, reject) => {
    // 驗證文件類型
    if (!file.type.startsWith('image/')) {
      reject(new Error('文件不是有效的圖片格式'));
      return;
    }

    const reader = new FileReader();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('無法創建canvas上下文'));
      return;
    }

    reader.onload = (event) => {
      try {
        const img = new Image();
        img.onload = () => {
          try {
            const {
              quality = 0.8,
              maxWidth,
              maxHeight,
              format = 'jpeg',
              compression = true,
            } = options;

            // 計算新的尺寸
            let { width, height } = img;
            if (maxWidth && width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
            if (maxHeight && height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }

            // 設置canvas尺寸
            canvas.width = width;
            canvas.height = height;

            // 繪製圖片
            ctx.drawImage(img, 0, 0, width, height);

            // 轉換為base64
            const mimeType = `image/${format}`;
            const base64 = canvas.toDataURL(
              mimeType,
              compression ? quality : 1
            );

            const endTime = performance.now();
            const processingTime = endTime - startTime;

            // 計算大小
            const originalSize = file.size;
            const compressedSize = Math.round((base64.length * 3) / 4); // base64轉字節的近似值
            const compressionRatio =
              originalSize > 0 ? 1 - compressedSize / originalSize : 0;

            resolve({
              base64,
              originalSize,
              compressedSize,
              width,
              height,
              format,
              mimeType,
              compressionRatio,
              processingTime,
            });
          } catch (error) {
            reject(
              new Error(
                `圖片處理失敗: ${error instanceof Error ? error.message : '未知錯誤'}`
              )
            );
          }
        };

        img.onerror = () => {
          reject(new Error('圖片加載失敗'));
        };

        img.src = event.target?.result as string;
      } catch (error) {
        reject(
          new Error(
            `文件讀取失敗: ${error instanceof Error ? error.message : '未知錯誤'}`
          )
        );
      }
    };

    reader.onerror = () => {
      reject(new Error('文件讀取失敗'));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * 批量轉換圖片為base64格式
 * @param files 圖片文件數組
 * @param options 轉換選項
 * @returns Promise<BatchImageToBase64Result>
 */
export const convertImagesToBase64 = async (
  files: (File | Blob)[],
  options: ImageToBase64Options = {}
): Promise<BatchImageToBase64Result> => {
  const startTime = performance.now();
  const results: ImageToBase64Result[] = [];
  let successfulConversions = 0;
  let failedConversions = 0;

  for (const file of files) {
    try {
      const result = await convertImageToBase64(file, options);
      results.push(result);
      successfulConversions++;
    } catch (error) {
      failedConversions++;
      // logger.info(`圖片轉換失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  }

  const endTime = performance.now();
  const totalProcessingTime = endTime - startTime;

  return {
    results,
    totalImages: files.length,
    successfulConversions,
    failedConversions,
    totalProcessingTime,
    averageProcessingTime:
      successfulConversions > 0
        ? totalProcessingTime / successfulConversions
        : 0,
  };
};

/**
 * 從URL獲取圖片並轉換為base64
 * @param imageUrl 圖片URL
 * @param options 轉換選項
 * @returns Promise<ImageToBase64Result>
 */
export const convertImageUrlToBase64 = async (
  imageUrl: string,
  options: ImageToBase64Options = {}
): Promise<ImageToBase64Result> => {
  const startTime = performance.now();

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('無法創建canvas上下文'));
      return;
    }

    img.crossOrigin = 'anonymous'; // 處理跨域問題

    img.onload = () => {
      try {
        const {
          quality = 0.8,
          maxWidth,
          maxHeight,
          format = 'jpeg',
          compression = true,
        } = options;

        // 計算新的尺寸
        let { width, height } = img;
        if (maxWidth && width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (maxHeight && height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        // 設置canvas尺寸
        canvas.width = width;
        canvas.height = height;

        // 繪製圖片
        ctx.drawImage(img, 0, 0, width, height);

        // 轉換為base64
        const mimeType = `image/${format}`;
        const base64 = canvas.toDataURL(mimeType, compression ? quality : 1);

        const endTime = performance.now();
        const processingTime = endTime - startTime;

        // 計算大小
        const compressedSize = Math.round((base64.length * 3) / 4);
        const originalSize = compressedSize; // 無法獲取原始大小，使用壓縮後的大小

        resolve({
          base64,
          originalSize,
          compressedSize,
          width,
          height,
          format,
          mimeType,
          compressionRatio: 0,
          processingTime,
        });
      } catch (error) {
        reject(
          new Error(
            `圖片處理失敗: ${error instanceof Error ? error.message : '未知錯誤'}`
          )
        );
      }
    };

    img.onerror = () => {
      reject(new Error('圖片加載失敗'));
    };

    img.src = imageUrl;
  });
};

/**
 * 將base64字符串轉換回Blob對象
 * @param base64 base64字符串
 * @param mimeType MIME類型
 * @returns Blob
 */
export const base64ToBlob = (
  base64: string,
  mimeType: string = 'image/jpeg'
): Blob => {
  const dataPart = base64.split(',')[1];
  if (!dataPart) {
    throw new Error('無效的base64格式');
  }

  const byteCharacters = atob(dataPart);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
};

/**
 * 驗證base64字符串是否為有效的圖片
 * @param base64 base64字符串
 * @returns boolean
 */
export const isValidImageBase64 = (base64: string): boolean => {
  try {
    // 檢查base64格式
    if (!base64.startsWith('data:image/')) {
      return false;
    }

    // 檢查數據部分
    const dataPart = base64.split(',')[1];
    if (!dataPart) {
      return false;
    }

    // 嘗試解碼
    atob(dataPart);
    return true;
  } catch {
    return false;
  }
};

/**
 * 獲取base64圖片的尺寸信息
 * @param base64 base64字符串
 * @returns Promise<{width: number, height: number}>
 */
export const getBase64ImageDimensions = (
  base64: string
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
      });
    };

    img.onerror = () => {
      reject(new Error('無法獲取圖片尺寸'));
    };

    img.src = base64;
  });
};

/**
 * 壓縮base64圖片
 * @param base64 base64字符串
 * @param options 壓縮選項
 * @returns Promise<ImageToBase64Result>
 */
export const compressBase64Image = async (
  base64: string,
  options: ImageToBase64Options = {}
): Promise<ImageToBase64Result> => {
  const startTime = performance.now();

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('無法創建canvas上下文'));
      return;
    }

    img.onload = () => {
      try {
        const { quality = 0.8, maxWidth, maxHeight, format = 'jpeg' } = options;

        // 計算新的尺寸
        let { width, height } = img;
        if (maxWidth && width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (maxHeight && height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        // 設置canvas尺寸
        canvas.width = width;
        canvas.height = height;

        // 繪製圖片
        ctx.drawImage(img, 0, 0, width, height);

        // 轉換為base64
        const mimeType = `image/${format}`;
        const compressedBase64 = canvas.toDataURL(mimeType, quality);

        const endTime = performance.now();
        const processingTime = endTime - startTime;

        // 計算大小
        const originalSize = Math.round((base64.length * 3) / 4);
        const compressedSize = Math.round((compressedBase64.length * 3) / 4);
        const compressionRatio =
          originalSize > 0 ? 1 - compressedSize / originalSize : 0;

        resolve({
          base64: compressedBase64,
          originalSize,
          compressedSize,
          width,
          height,
          format,
          mimeType,
          compressionRatio,
          processingTime,
        });
      } catch (error) {
        reject(
          new Error(
            `圖片壓縮失敗: ${error instanceof Error ? error.message : '未知錯誤'}`
          )
        );
      }
    };

    img.onerror = () => {
      reject(new Error('圖片加載失敗'));
    };

    img.src = base64;
  });
};
