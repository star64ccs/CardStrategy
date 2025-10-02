// Report系統Class型定義
export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: ReportCategory;
  type: ReportType;
  config: ReportConfig;
  schedule?: ReportSchedule;
  recipients: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportConfig {
  dataSources: string[];
  filters: ReportFilter[];
  aggregations: ReportAggregation[];
  visualizations: ReportVisualization[];
  format: ExportFormat;
  delivery: ReportDelivery;
  retention: ReportRetention;
}

export interface ReportFilter {
  field: string;
  operator: FilterOperator;
  value: unknown;
  condition: FilterCondition;
}

export interface ReportAggregation {
  field: string;
  function: AggregationFunction;
  alias?: string;
  groupBy?: string[];
}

export interface ReportVisualization {
  type: VisualizationType;
  config: VisualizationConfig;
  position: VisualizationPosition;
  size: VisualizationSize;
}

export interface ReportSchedule {
  frequency: ScheduleFrequency;
  interval?: number;
  startDate: Date;
  endDate?: Date;
  timezone: string;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  hour?: number;
  minute?: number;
  isActive: boolean;
}

export interface ReportDelivery {
  method: DeliveryMethod;
  email?: EmailDelivery;
  webhook?: WebhookDelivery;
  storage?: StorageDelivery;
}

export interface EmailDelivery {
  recipients: string[];
  subject: string;
  body: string;
  attachments: boolean;
  cc?: string[];
  bcc?: string[];
}

export interface WebhookDelivery {
  url: string;
  method: 'GET' | 'POST' | 'PUT';
  headers: Record<string, string>;
  timeout: number;
  retries: number;
}

export interface StorageDelivery {
  type: StorageType;
  path: string;
  credentials?: Record<string, any>;
  compression?: boolean;
}

export interface ReportRetention {
  days: number;
  maxReports: number;
  archiveAfter: number;
  deleteAfter: number;
}

export interface ReportInstance {
  id: string;
  templateId: string;
  name: string;
  status: ReportStatus;
  data: ReportData;
  metadata: ReportMetadata;
  generatedAt: Date;
  deliveredAt?: Date;
  expiresAt?: Date;
}

export interface ReportData {
  summary: ReportSummary;
  details: ReportDetail[];
  charts: ReportChart[];
  tables: ReportTable[];
  insights: ReportInsight[];
}

export interface ReportSummary {
  totalRecords: number;
  dateRange: DateRange;
  keyMetrics: KeyMetric[];
  trends: Trend[];
  alerts: Alert[];
}

export interface ReportDetail {
  section: string;
  data: unknown[];
  pagination: Pagination;
  sorting: Sorting[];
  filtering: Filtering[];
}

export interface ReportChart {
  id: string;
  type: string;
  title: string;
  data: ChartData;
  config: ChartConfig;
  interactive: boolean;
}

export interface ReportTable {
  id: string;
  title: string;
  columns: TableColumn[];
  data: TableData[];
  pagination: Pagination;
  sorting: Sorting[];
  filtering: Filtering[];
}

export interface ReportInsight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  confidence: number;
  recommendations: string[];
  actions: string[];
}

export interface ReportMetadata {
  generatedBy: string;
  dataSource: string;
  filters: string[];
  processingTime: number;
  dataSize: number;
  version: string;
}

export interface ReportExport {
  id: string;
  reportId: string;
  format: ExportFormat;
  status: ExportStatus;
  url?: string;
  size?: number;
  createdAt: Date;
  expiresAt?: Date;
}

export interface ReportAnalytics {
  totalReports: number;
  activeTemplates: number;
  scheduledReports: number;
  deliverySuccess: number;
  deliveryFailure: number;
  averageGenerationTime: number;
  popularTemplates: PopularTemplate[];
  deliveryStats: DeliveryStats;
  performanceMetrics: PerformanceMetrics;
}

export interface PopularTemplate {
  templateId: string;
  name: string;
  usageCount: number;
  successRate: number;
  averageRating: number;
}

export interface DeliveryStats {
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  averageDeliveryTime: number;
  deliveryMethods: DeliveryMethodStats[];
}

export interface DeliveryMethodStats {
  method: DeliveryMethod;
  count: number;
  successRate: number;
  averageTime: number;
}

export interface PerformanceMetrics {
  averageGenerationTime: number;
  averageDeliveryTime: number;
  successRate: number;
  errorRate: number;
  resourceUsage: ResourceUsage;
}

export interface ResourceUsage {
  cpu: number;
  memory: number;
  storage: number;
  network: number;
}

// 枚舉定義
export enum ReportCategory {
  BUSINESS = 'business',
  FINANCIAL = 'financial',
  OPERATIONAL = 'operational',
  MARKETING = 'marketing',
  USER = 'user',
  TECHNICAL = 'technical',
  COMPLIANCE = 'compliance',
}

export enum ReportType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  ON_DEMAND = 'on_demand',
  REAL_TIME = 'real_time',
}

export enum FilterOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  IN = 'in',
  NOT_IN = 'not_in',
  BETWEEN = 'between',
  IS_NULL = 'is_null',
  IS_NOT_NULL = 'is_not_null',
}

export enum FilterCondition {
  AND = 'and',
  OR = 'or',
}

export enum AggregationFunction {
  COUNT = 'count',
  SUM = 'sum',
  AVG = 'avg',
  MIN = 'min',
  MAX = 'max',
  MEDIAN = 'median',
  PERCENTILE = 'percentile',
  DISTINCT = 'distinct',
}

export enum VisualizationType {
  LINE_CHART = 'line_chart',
  BAR_CHART = 'bar_chart',
  PIE_CHART = 'pie_chart',
  SCATTER_PLOT = 'scatter_plot',
  HEATMAP = 'heatmap',
  TABLE = 'table',
  GAUGE = 'gauge',
  FUNNEL = 'funnel',
}

export enum ScheduleFrequency {
  MINUTELY = 'minutely',
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

export enum DeliveryMethod {
  EMAIL = 'email',
  WEBHOOK = 'webhook',
  STORAGE = 'storage',
  API = 'api',
  DASHBOARD = 'dashboard',
}

export enum StorageType {
  LOCAL = 'local',
  S3 = 's3',
  GCS = 'gcs',
  AZURE = 'azure',
  FTP = 'ftp',
  SFTP = 'sftp',
}

export enum ReportStatus {
  PENDING = 'pending',
  GENERATING = 'generating',
  COMPLETED = 'completed',
  FAILED = 'failed',
  DELIVERED = 'delivered',
  EXPIRED = 'expired',
}

export enum ExportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  JSON = 'json',
  HTML = 'html',
  XML = 'xml',
}

export enum ExportStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum InsightType {
  TREND = 'trend',
  ANOMALY = 'anomaly',
  CORRELATION = 'correlation',
  PREDICTION = 'prediction',
  RECOMMENDATION = 'recommendation',
}

// 輔助Class型
export interface DateRange {
  start: Date;
  end: Date;
}

export interface KeyMetric {
  name: string;
  value: number;
  unit: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export interface Trend {
  metric: string;
  values: TrendPoint[];
  direction: 'up' | 'down' | 'stable';
  confidence: number;
}

export interface TrendPoint {
  date: Date;
  value: number;
}

export interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface Sorting {
  field: string;
  direction: 'asc' | 'desc';
}

export interface Filtering {
  field: string;
  operator: FilterOperator;
  value: unknown;
}

export interface VisualizationConfig {
  title: string;
  subtitle?: string;
  colors: string[];
  legend: boolean;
  tooltip: boolean;
  animation: boolean;
  responsive: boolean;
}

export interface VisualizationPosition {
  x: number;
  y: number;
}

export interface VisualizationSize {
  width: number;
  height: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
}

export interface ChartConfig {
  type: string;
  options: Record<string, any>;
}

export interface TableColumn {
  key: string;
  title: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  sortable: boolean;
  filterable: boolean;
  width?: number;
  align?: 'left' | 'center' | 'right';
}

export interface TableData {
  [key: string]: unknown;
}

// API ResponseClass型
export interface ReportResponse {
  success: boolean;
  data: ReportInstance;
  message?: string;
  timestamp: Date;
}

export interface ReportListResponse {
  success: boolean;
  data: ReportInstance[];
  pagination: Pagination;
  message?: string;
  timestamp: Date;
}

export interface ReportTemplateResponse {
  success: boolean;
  data: ReportTemplate;
  message?: string;
  timestamp: Date;
}

export interface ReportTemplateListResponse {
  success: boolean;
  data: ReportTemplate[];
  pagination: Pagination;
  message?: string;
  timestamp: Date;
}

export interface ReportExportResponse {
  success: boolean;
  data: ReportExport;
  message?: string;
  timestamp: Date;
}

export interface ReportAnalyticsResponse {
  success: boolean;
  data: ReportAnalytics;
  message?: string;
  timestamp: Date;
}

// RequestClass型
export interface CreateReportRequest {
  templateId: string;
  name: string;
  config?: Partial<ReportConfig>;
  schedule?: Partial<ReportSchedule>;
  recipients?: string[];
}

export interface UpdateReportRequest {
  name?: string;
  config?: Partial<ReportConfig>;
  schedule?: Partial<ReportSchedule>;
  recipients?: string[];
  isActive?: boolean;
}

export interface CreateTemplateRequest {
  name: string;
  description: string;
  category: ReportCategory;
  type: ReportType;
  config: ReportConfig;
  schedule?: ReportSchedule;
  recipients: string[];
}

export interface UpdateTemplateRequest {
  name?: string;
  description?: string;
  category?: ReportCategory;
  type?: ReportType;
  config?: Partial<ReportConfig>;
  schedule?: Partial<ReportSchedule>;
  recipients?: string[];
  isActive?: boolean;
}

export interface ExportReportRequest {
  format: ExportFormat;
  options?: Record<string, any>;
}

export interface ReportFilterOptions {
  category?: ReportCategory;
  type?: ReportType;
  status?: ReportStatus;
  dateRange?: DateRange;
  templateId?: string;
  isActive?: boolean;
}
