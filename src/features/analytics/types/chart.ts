// 圖表系統類型定義

// 圖表類型枚舉
export enum ChartType {
  LINE = 'line',
  BAR = 'bar',
  PIE = 'pie',
  DOUGHNUT = 'doughnut',
  RADAR = 'radar',
  SCATTER = 'scatter',
  BUBBLE = 'bubble',
  AREA = 'area',
  STACKED_BAR = 'stacked_bar',
  STACKED_AREA = 'stacked_area',
  CANDLESTICK = 'candlestick',
  HEATMAP = 'heatmap',
  TREEMAP = 'treemap',
  GAUGE = 'gauge',
  FUNNEL = 'funnel',
  WATERFALL = 'waterfall',
  BOX_PLOT = 'box_plot',
  HISTOGRAM = 'histogram',
  POLAR_AREA = 'polar_area',
}

// 圖表數據點
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: Record<string, any>;
}

// 圖表數據集
export interface ChartDataset {
  label: string;
  data: ChartDataPoint[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
  tension?: number;
  pointRadius?: number;
  pointHoverRadius?: number;
  metadata?: Record<string, any>;
}

// 圖表配置
export interface ChartConfig {
  type: ChartType;
  title?: string;
  subtitle?: string;
  description?: string;
  width?: number;
  height?: number;
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  animation?: boolean;
  animationDuration?: number;
  theme?: ChartTheme;
  legend?: LegendConfig;
  axes?: AxesConfig;
  grid?: GridConfig;
  tooltip?: TooltipConfig;
  interaction?: InteractionConfig;
  export?: ExportConfig;
  accessibility?: AccessibilityConfig;
}

// 圖表主題
export interface ChartTheme {
  name: string;
  colors: string[];
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  gridColor: string;
  fontFamily: string;
  fontSize: number;
  borderRadius: number;
  shadow: boolean;
  gradient: boolean;
}

// 圖例配置
export interface LegendConfig {
  display: boolean;
  position: 'top' | 'bottom' | 'left' | 'right';
  align: 'start' | 'center' | 'end';
  labels: {
    color: string;
    fontSize: number;
    fontFamily: string;
    padding: number;
    usePointStyle: boolean;
  };
  onClick?: (event: unknown, legendItem: unknown) => void;
}

// 軸配置
export interface AxesConfig {
  x?: AxisConfig;
  y?: AxisConfig;
  r?: AxisConfig; // 用於雷達圖
}

// 單軸配置
export interface AxisConfig {
  display: boolean;
  type: 'linear' | 'logarithmic' | 'time' | 'category';
  position: 'top' | 'bottom' | 'left' | 'right';
  title?: string;
  titleColor?: string;
  titleFontSize?: number;
  gridLines: {
    display: boolean;
    color: string;
    lineWidth: number;
    drawBorder: boolean;
    drawOnChartArea: boolean;
    drawTicks: boolean;
  };
  ticks: {
    display: boolean;
    color: string;
    fontSize: number;
    fontFamily: string;
    padding: number;
    maxTicksLimit?: number;
    callback?: (value: unknown, index: number, values: unknown[]) => string;
  };
  scaleLabel?: {
    display: boolean;
    labelString: string;
    color: string;
    fontSize: number;
    fontFamily: string;
  };
}

// 網格配置
export interface GridConfig {
  display: boolean;
  color: string;
  lineWidth: number;
  drawBorder: boolean;
  drawOnChartArea: boolean;
  drawTicks: boolean;
  zeroLineColor: string;
  zeroLineWidth: number;
}

// 工具提示配置
export interface TooltipConfig {
  enabled: boolean;
  mode: 'index' | 'dataset' | 'point' | 'nearest' | 'x' | 'y';
  intersect: boolean;
  backgroundColor: string;
  titleColor: string;
  bodyColor: string;
  borderColor: string;
  borderWidth: number;
  cornerRadius: number;
  caretSize: number;
  displayColors: boolean;
  titleFontSize: number;
  bodyFontSize: number;
  footerFontSize: number;
  padding: number;
  callbacks?: {
    title?: (tooltipItems: unknown[]) => string;
    label?: (tooltipItem: unknown, data: unknown) => string;
    afterLabel?: (tooltipItem: unknown, data: unknown) => string;
    footer?: (tooltipItems: unknown[]) => string;
  };
}

// 交互配置
export interface InteractionConfig {
  mode: 'index' | 'dataset' | 'point' | 'nearest' | 'x' | 'y';
  intersect: boolean;
  axis: 'x' | 'y' | 'xy';
  animationDuration: number;
  onHover?: (event: unknown, activeElements: unknown[]) => void;
  onClick?: (event: unknown, activeElements: unknown[]) => void;
}

// 導出配置
export interface ExportConfig {
  enabled: boolean;
  formats: ('png' | 'jpg' | 'svg' | 'pdf')[];
  quality: number;
  width?: number;
  height?: number;
  backgroundColor?: string;
  filename?: string;
}

// 無障礙配置
export interface AccessibilityConfig {
  enabled: boolean;
  description?: string;
  announceChanges: boolean;
  highContrast: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
}

// 圖表數據
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
  metadata?: Record<string, any>;
}

// 圖表實例
export interface ChartInstance {
  id: string;
  config: ChartConfig;
  data: ChartData;
  element?: HTMLElement;
  instance?: unknown; // 實際的圖表庫實例
  status: 'idle' | 'loading' | 'rendered' | 'error';
  error?: string;
  lastUpdate: Date;
  performance?: PerformanceMetrics;
}

// 性能指標
export interface PerformanceMetrics {
  renderTime: number;
  dataProcessingTime: number;
  memoryUsage: number;
  frameRate: number;
  lastMeasured: Date;
}

// 圖表模板
export interface ChartTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  type: ChartType;
  config: ChartConfig;
  sampleData: ChartData;
  tags: string[];
  rating: number;
  downloads: number;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  isOfficial: boolean;
}

// 圖表響應
export interface ChartResponse {
  success: boolean;
  chart?: ChartInstance;
  error?: string;
  message?: string;
  timestamp: Date;
}

// 圖表列表響應
export interface ChartListResponse {
  success: boolean;
  charts: ChartInstance[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  error?: string;
  timestamp: Date;
}

// 圖表創建請求
export interface ChartCreateRequest {
  config: ChartConfig;
  data: ChartData;
  templateId?: string;
  metadata?: Record<string, any>;
}

// 圖表更新請求
export interface ChartUpdateRequest {
  config?: Partial<ChartConfig>;
  data?: ChartData;
  metadata?: Record<string, any>;
}

// 圖表過濾選項
export interface ChartFilterOptions {
  type?: ChartType;
  category?: string;
  author?: string;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  rating?: {
    min: number;
    max: number;
  };
  isOfficial?: boolean;
}

// 圖表分析
export interface ChartAnalytics {
  id: string;
  chartId: string;
  views: number;
  interactions: number;
  exports: number;
  shares: number;
  averageViewTime: number;
  userEngagement: number;
  performance: PerformanceMetrics;
  lastViewed: Date;
  createdAt: Date;
}

// 圖表事件
export interface ChartEvent {
  type:
    | 'created'
    | 'updated'
    | 'deleted'
    | 'viewed'
    | 'exported'
    | 'shared'
    | 'error';
  chartId: string;
  userId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// 圖表插件
export interface ChartPlugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  type: 'renderer' | 'interaction' | 'export' | 'theme' | 'data';
  enabled: boolean;
  config: Record<string, any>;
  dependencies?: string[];
  installDate: Date;
}

// 圖表緩存
export interface ChartCache {
  key: string;
  data: ChartData;
  config: ChartConfig;
  timestamp: Date;
  expiresAt: Date;
  size: number;
}

// 圖表統計
export interface ChartStatistics {
  totalCharts: number;
  chartsByType: Record<ChartType, number>;
  chartsByCategory: Record<string, number>;
  averageRenderTime: number;
  totalViews: number;
  totalExports: number;
  popularTemplates: ChartTemplate[];
  recentActivity: ChartEvent[];
  performanceTrends: {
    date: Date;
    renderTime: number;
    views: number;
  }[];
}
