// 儀Table板Class型定義
export interface DashboardWidget {
  id: string;
  type:
    | 'chart'
    | 'metric'
    | 'table'
    | 'list'
    | 'gauge'
    | 'progress'
    | 'heatmap'
    | 'map';
  title: string;
  description?: string;
  dataSource: string;
  config: WidgetConfig;
  position: WidgetPosition;
  size: WidgetSize;
  refreshInterval?: number; // Second
  lastUpdated?: Date;
  isVisible: boolean;
  isEditable: boolean;
}

export interface WidgetConfig {
  chartType?:
    | 'line'
    | 'bar'
    | 'pie'
    | 'doughnut'
    | 'area'
    | 'scatter'
    | 'bubble'
    | 'radar';
  metrics?: string[];
  filters?: DashboardFilter[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  colors?: string[];
  thresholds?: ThresholdConfig[];
  format?: DataFormat;
}

export interface WidgetPosition {
  x: number;
  y: number;
}

export interface WidgetSize {
  width: number;
  height: number;
}

export interface ThresholdConfig {
  value: number;
  color: string;
  label: string;
}

export interface DataFormat {
  type: 'number' | 'currency' | 'percentage' | 'date' | 'text';
  precision?: number;
  currency?: string;
  dateFormat?: string;
  suffix?: string;
  prefix?: string;
}

export interface DashboardFilter {
  field: string;
  operator:
    | 'eq'
    | 'ne'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte'
    | 'in'
    | 'nin'
    | 'contains'
    | 'startsWith'
    | 'endsWith';
  value: unknown;
}

export interface DashboardLayout {
  id: string;
  name: string;
  description?: string;
  gridSize: GridSize;
  widgets: DashboardWidget[];
  theme: DashboardTheme;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GridSize {
  columns: number;
  rows: number;
  cellWidth: number;
  cellHeight: number;
}

export interface DashboardTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  chartColors: string[];
  fontFamily: string;
  fontSize: number;
}

export interface DashboardData {
  widgetId: string;
  data: unknown;
  metadata: DataMetadata;
  timestamp: Date;
}

export interface DataMetadata {
  source: string;
  lastUpdated: Date;
  recordCount: number;
  processingTime: number;
  cacheStatus: 'fresh' | 'stale' | 'expired';
}

export interface DashboardConfig {
  id: string;
  name: string;
  description?: string;
  layouts: DashboardLayout[];
  dataSources: DataSource[];
  refreshInterval: number;
  autoSave: boolean;
  sharing: SharingConfig;
  permissions: PermissionConfig;
  theme: DashboardTheme;
  createdAt: Date;
  updatedAt: Date;
}

export interface DataSource {
  id: string;
  name: string;
  type: 'api' | 'database' | 'file' | 'stream';
  connection: DataSourceConnection;
  schema: DataSourceSchema;
  refreshInterval: number;
  isActive: boolean;
}

export interface DataSourceConnection {
  url?: string;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  apiKey?: string;
  headers?: Record<string, string>;
  timeout: number;
  retryAttempts: number;
}

export interface DataSourceSchema {
  fields: SchemaField[];
  primaryKey?: string;
  indexes?: string[];
}

export interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  required: boolean;
  description?: string;
  defaultValue?: unknown;
}

export interface SharingConfig {
  isPublic: boolean;
  allowEdit: boolean;
  allowCopy: boolean;
  password?: string;
  expirationDate?: Date;
  allowedUsers: string[];
  allowedRoles: string[];
}

export interface PermissionConfig {
  owner: string;
  editors: string[];
  viewers: string[];
  roles: RolePermission[];
}

export interface RolePermission {
  role: string;
  permissions: ('view' | 'edit' | 'delete' | 'share' | 'export')[];
}

export interface DashboardExport {
  id: string;
  dashboardId: string;
  format: 'pdf' | 'png' | 'jpg' | 'svg' | 'html';
  size: 'small' | 'medium' | 'large' | 'custom';
  customSize?: { width: number; height: number };
  includeData: boolean;
  includeCharts: boolean;
  includeTables: boolean;
  watermark?: string;
  createdAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  errorMessage?: string;
}

export interface DashboardAlert {
  id: string;
  dashboardId: string;
  widgetId?: string;
  condition: AlertCondition;
  action: AlertAction;
  isActive: boolean;
  lastTriggered?: Date;
  createdAt: Date;
}

export interface AlertCondition {
  metric: string;
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne';
  value: number;
  timeWindow: number; // Minute
  frequency: number; // Check頻率（Minute）
}

export interface AlertAction {
  type: 'email' | 'notification' | 'webhook' | 'sms';
  target: string;
  message: string;
  enabled: boolean;
}

export interface DashboardResponse {
  success: boolean;
  data?: DashboardConfig;
  error?: string;
  message?: string;
}

export interface DashboardListResponse {
  success: boolean;
  data?: DashboardConfig[];
  total: number;
  page: number;
  limit: number;
  error?: string;
}

export interface DashboardCreateRequest {
  name: string;
  description?: string;
  layout?: Partial<DashboardLayout>;
  theme?: Partial<DashboardTheme>;
  dataSources?: DataSource[];
}

export interface DashboardUpdateRequest {
  name?: string;
  description?: string;
  layouts?: DashboardLayout[];
  dataSources?: DataSource[];
  refreshInterval?: number;
  autoSave?: boolean;
  sharing?: Partial<SharingConfig>;
  permissions?: Partial<PermissionConfig>;
  theme?: Partial<DashboardTheme>;
}

export interface DashboardFilterOptions {
  search?: string;
  owner?: string;
  tags?: string[];
  createdAfter?: Date;
  createdBefore?: Date;
  isPublic?: boolean;
  hasAlerts?: boolean;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

export interface DashboardAnalytics {
  dashboardId: string;
  views: number;
  uniqueViews: number;
  averageViewTime: number;
  lastViewed: Date;
  favoriteCount: number;
  shareCount: number;
  exportCount: number;
  alertCount: number;
  performanceMetrics: PerformanceMetrics;
}

export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  dataFetchTime: number;
  memoryUsage: number;
  errorRate: number;
  uptime: number;
}

export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail: string;
  config: DashboardConfig;
  tags: string[];
  rating: number;
  downloadCount: number;
  isOfficial: boolean;
  createdAt: Date;
  updatedAt: Date;
}
