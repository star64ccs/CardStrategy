import { Platform } from 'react-native';

// 性能MonitorConfigure
export interface PerformanceMonitoringConfig {
  enabled: boolean;
  collectionInterval: number; // 收集間隔（毫Second）
  alertThresholds: {
    memoryUsage: number; // Memory使用率閾Value
    cpuUsage: number; // CPU 使用率閾Value
    responseTime: number; // ResponseTime閾Value
    errorRate: number; // Error率閾Value
  };
  retentionPeriod: number; // Data保留期（天）
  enableRealTimeAlerts: boolean;
  enablePerformanceOptimization: boolean;
}

// 性能指標
export interface PerformanceMetrics {
  id: string;
  timestamp: Date;
  memory: {
    used: number; // MB
    total: number; // MB
    usage: number; // 百分比
  };
  cpu: {
    usage: number; // 百分比
    cores: number;
  };
  network: {
    requests: number;
    errors: number;
    averageResponseTime: number; // ms
    bandwidth: number; // KB/s
  };
  app: {
    startupTime: number; // ms
    renderTime: number; // ms
    frameRate: number; // FPS
    crashes: number;
  };
  battery: {
    level: number; // 百分比
    isCharging: boolean;
    temperature: number; // 攝氏度
  };
}

// 性能Alert
export interface PerformanceAlert {
  id: string;
  type: 'memory' | 'cpu' | 'network' | 'app' | 'battery';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metric: PerformanceMetrics;
  threshold: number;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

// 性能基準
export interface PerformanceBaseline {
  id: string;
  name: string;
  description: string;
  metrics: {
    memory: {
      average: number;
      max: number;
      min: number;
    };
    cpu: {
      average: number;
      max: number;
      min: number;
    };
    network: {
      averageResponseTime: number;
      errorRate: number;
    };
    app: {
      averageStartupTime: number;
      averageFrameRate: number;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

// 性能優化建議
export interface PerformanceOptimization {
  id: string;
  type: 'memory' | 'cpu' | 'network' | 'app' | 'battery';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  estimatedTime: number; // Hour
  recommendations: string[];
  createdAt: Date;
  implemented: boolean;
  implementedAt?: Date;
}

// 性能MonitorService
export class PerformanceMonitoringService {
  private static instance: PerformanceMonitoringService;
  private config: PerformanceMonitoringConfig;
  private metrics: PerformanceMetrics[] = [];
  private alerts: PerformanceAlert[] = [];
  private baselines: PerformanceBaseline[] = [];
  private optimizations: PerformanceOptimization[] = [];
  private monitoringInterval?: NodeJS.Timeout;
  private readonly listeners: ((metrics: PerformanceMetrics) => void)[] = [];
  private isMonitoring = false;

  private constructor() {
    this.config = {
      enabled: true,
      collectionInterval: 5000, // 5Second
      alertThresholds: {
        memoryUsage: 80, // 80%
        cpuUsage: 70, // 70%
        responseTime: 2000, // 2Second
        errorRate: 5, // 5%
      },
      retentionPeriod: 30, // 30天
      enableRealTimeAlerts: true,
      enablePerformanceOptimization: true,
    };
  }

  static getInstance(): PerformanceMonitoringService {
    if (!PerformanceMonitoringService.instance) {
      PerformanceMonitoringService.instance =
        new PerformanceMonitoringService();
    }
    return PerformanceMonitoringService.instance;
  }

  // InitializeService
  async initialize(): Promise<void> {
    try {
      console.log('Initialize性能監控Service...');

      // Initialize歷史Data
      await this.initializeHistoricalData();

      // BeginMonitor
      if (this.config.enabled) {
        await this.startMonitoring();
      }

      console.log('性能監控ServiceInitialize完成');
    } catch (error) {
      console.error('性能監控ServiceInitializeFailed:', error);
      throw error;
    }
  }

  // Initialize歷史Data
  private async initializeHistoricalData(): Promise<void> {
    // CreateDefault基準
    this.baselines = [
      {
        id: 'baseline_default',
        name: '默認性能基準',
        description: '系統默認性能基準',
        metrics: {
          memory: { average: 150, max: 300, min: 50 },
          cpu: { average: 15, max: 50, min: 5 },
          network: { averageResponseTime: 500, errorRate: 1 },
          app: { averageStartupTime: 2000, averageFrameRate: 60 },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // 生成模擬優化建議
    this.optimizations = this.generateMockOptimizations();
  }

  // BeginMonitor
  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      console.log('性能監控已在運行中');
      return;
    }

    this.isMonitoring = true;
    console.log('開始性能監控...');

    // 立即執Row一次收集
    await this.collectMetrics();

    // Settings定期Monitor
    this.monitoringInterval = setInterval(async () => {
      await this.collectMetrics();
    }, this.config.collectionInterval);
  }

  // StopMonitor
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    this.isMonitoring = false;
    console.log('性能監控已停止');
  }

  // 收集性能指標
  async collectMetrics(): Promise<PerformanceMetrics> {
    const metrics: PerformanceMetrics = {
      id: `metrics_${Date.now()}`,
      timestamp: new Date(),
      memory: await this.collectMemoryMetrics(),
      cpu: await this.collectCpuMetrics(),
      network: await this.collectNetworkMetrics(),
      app: await this.collectAppMetrics(),
      battery: await this.collectBatteryMetrics(),
    };

    this.metrics.push(metrics);

    // CheckAlert
    if (this.config.enableRealTimeAlerts) {
      await this.checkAlerts(metrics);
    }

    // Notification監聽器
    this.notifyListeners(metrics);

    // 清理舊Data
    this.cleanupOldData();

    return metrics;
  }

  // 收集Memory指標
  private async collectMemoryMetrics(): Promise<PerformanceMetrics['memory']> {
    // 模擬MemoryData收集
    const _used = Math.random() * 200 + 50; // 50-250 MB
    const _total = 512; // False設總Memory 512MB
    const _usage = (used / total) * 100;

    return {
      used: Math.round(used),
      total,
      usage: Math.round(usage * 100) / 100,
    };
  }

  // 收集CPU指標
  private async collectCpuMetrics(): Promise<PerformanceMetrics['cpu']> {
    // 模擬CPUData收集
    const _usage = Math.random() * 30 + 5; // 5-35%
    const _cores =
      Platform.OS === 'web' ? navigator.hardwareConcurrency || 4 : 4;

    return {
      usage: Math.round(usage * 100) / 100,
      cores,
    };
  }

  // 收集Network指標
  private async collectNetworkMetrics(): Promise<
    PerformanceMetrics['network']
  > {
    // 模擬NetworkData收集
    const _requests = Math.floor(Math.random() * 10) + 1;
    const _errors = Math.floor(Math.random() * 2);
    const _averageResponseTime = Math.random() * 1000 + 100; // 100-1100ms
    const _bandwidth = Math.random() * 1000 + 100; // 100-1100 KB/s

    return {
      requests,
      errors,
      averageResponseTime: Math.round(averageResponseTime),
      bandwidth: Math.round(bandwidth),
    };
  }

  // 收集Apply指標
  private async collectAppMetrics(): Promise<PerformanceMetrics['app']> {
    // 模擬ApplyData收集
    const _startupTime = Math.random() * 3000 + 1000; // 1-4Second
    const _renderTime = Math.random() * 100 + 10; // 10-110ms
    const _frameRate = Math.random() * 20 + 50; // 50-70 FPS
    const _crashes = Math.floor(Math.random() * 2);

    return {
      startupTime: Math.round(startupTime),
      renderTime: Math.round(renderTime),
      frameRate: Math.round(frameRate),
      crashes,
    };
  }

  // 收集電池指標
  private async collectBatteryMetrics(): Promise<
    PerformanceMetrics['battery']
  > {
    // 模擬電池Data收集
    const _level = Math.random() * 100; // 0-100%
    const _isCharging = Math.random() > 0.7; // 30% 概率充電中
    const _temperature = Math.random() * 20 + 20; // 20-40°C

    return {
      level: Math.round(level * 100) / 100,
      isCharging,
      temperature: Math.round(temperature * 100) / 100,
    };
  }

  // CheckAlert
  private async checkAlerts(metrics: PerformanceMetrics): Promise<void> {
    const alerts: PerformanceAlert[] = [];

    // CheckMemory使用率
    if (metrics.memory.usage > this.config.alertThresholds.memoryUsage) {
      alerts.push({
        id: `alert_${Date.now()}_memory`,
        type: 'memory',
        severity: this.getSeverity(
          metrics.memory.usage,
          this.config.alertThresholds.memoryUsage
        ),
        message: `內存使用率過高: ${metrics.memory.usage}%`,
        metric: metrics,
        threshold: this.config.alertThresholds.memoryUsage,
        timestamp: new Date(),
        resolved: false,
      });
    }

    // CheckCPU使用率
    if (metrics.cpu.usage > this.config.alertThresholds.cpuUsage) {
      alerts.push({
        id: `alert_${Date.now()}_cpu`,
        type: 'cpu',
        severity: this.getSeverity(
          metrics.cpu.usage,
          this.config.alertThresholds.cpuUsage
        ),
        message: `CPU 使用率過高: ${metrics.cpu.usage}%`,
        metric: metrics,
        threshold: this.config.alertThresholds.cpuUsage,
        timestamp: new Date(),
        resolved: false,
      });
    }

    // CheckResponseTime
    if (
      metrics.network.averageResponseTime >
      this.config.alertThresholds.responseTime
    ) {
      alerts.push({
        id: `alert_${Date.now()}_response`,
        type: 'network',
        severity: this.getSeverity(
          metrics.network.averageResponseTime,
          this.config.alertThresholds.responseTime
        ),
        message: `網絡響應時間過長: ${metrics.network.averageResponseTime}ms`,
        metric: metrics,
        threshold: this.config.alertThresholds.responseTime,
        timestamp: new Date(),
        resolved: false,
      });
    }

    // CheckError率
    const _errorRate =
      metrics.network.requests > 0
        ? (metrics.network.errors / metrics.network.requests) * 100
        : 0;
    if (errorRate > this.config.alertThresholds.errorRate) {
      alerts.push({
        id: `alert_${Date.now()}_error`,
        type: 'network',
        severity: this.getSeverity(
          errorRate,
          this.config.alertThresholds.errorRate
        ),
        message: `網絡Error率過高: ${errorRate.toFixed(2)}%`,
        metric: metrics,
        threshold: this.config.alertThresholds.errorRate,
        timestamp: new Date(),
        resolved: false,
      });
    }

    this.alerts.push(...alerts);

    // 生成優化建議
    if (this.config.enablePerformanceOptimization) {
      await this.generateOptimizationSuggestions(metrics);
    }
  }

  // Get嚴重程度
  private getSeverity(
    value: number,
    threshold: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    const _ratio = value / threshold;
    if (ratio >= 2) return 'critical';
    if (ratio >= 1.5) return 'high';
    if (ratio >= 1.2) return 'medium';
    return 'low';
  }

  // 生成優化建議
  private async generateOptimizationSuggestions(
    metrics: PerformanceMetrics
  ): Promise<void> {
    const suggestions: PerformanceOptimization[] = [];

    // Memory優化建議
    if (metrics.memory.usage > 70) {
      suggestions.push({
        id: `opt_${Date.now()}_memory`,
        type: 'memory',
        priority: 'high',
        title: '內存使用優化',
        description: '檢測到內存使用率較高，建議優化內存管理',
        impact: '可減少內存使用 20-30%',
        effort: 'medium',
        estimatedTime: 8,
        recommendations: [
          '檢查內存洩漏',
          '優化圖片加載',
          '減少不必要的組件渲染',
          '使用內存池管理',
        ],
        createdAt: new Date(),
        implemented: false,
      });
    }

    // CPU 優化建議
    if (metrics.cpu.usage > 50) {
      suggestions.push({
        id: `opt_${Date.now()}_cpu`,
        type: 'cpu',
        priority: 'medium',
        title: 'CPU 使用優化',
        description: '檢測到 CPU 使用率較高，建議優化計算密集型操作',
        impact: '可減少 CPU 使用 15-25%',
        effort: 'high',
        estimatedTime: 12,
        recommendations: [
          '優化算法複雜度',
          '使用 Web Workers',
          '減少不必要的計算',
          '實現緩存機制',
        ],
        createdAt: new Date(),
        implemented: false,
      });
    }

    // Network優化建議
    if (metrics.network.averageResponseTime > 1000) {
      suggestions.push({
        id: `opt_${Date.now()}_network`,
        type: 'network',
        priority: 'high',
        title: '網絡性能優化',
        description: '檢測到網絡響應時間較長，建議優化網絡請求',
        impact: '可減少響應時間 30-50%',
        effort: 'medium',
        estimatedTime: 6,
        recommendations: [
          '實現請求緩存',
          '優化 API 端點',
          '使用 CDN',
          '實現請求合併',
        ],
        createdAt: new Date(),
        implemented: false,
      });
    }

    this.optimizations.push(...suggestions);
  }

  // Update基準
  async updateBaselines(): Promise<void> {
    const _recentMetrics = this.metrics.slice(-100); // 最近100個指標

    if (recentMetrics.length === 0) return;

    const baseline: PerformanceBaseline = {
      id: `baseline_${Date.now()}`,
      name: '動態性能基準',
      description: '基於最近性能數據生成的基準',
      metrics: {
        memory: {
          average: this.calculateAverage(
            recentMetrics.map(m => m.memory.usage)
          ),
          max: Math.max(...recentMetrics.map(m => m.memory.usage)),
          min: Math.min(...recentMetrics.map(m => m.memory.usage)),
        },
        cpu: {
          average: this.calculateAverage(recentMetrics.map(m => m.cpu.usage)),
          max: Math.max(...recentMetrics.map(m => m.cpu.usage)),
          min: Math.min(...recentMetrics.map(m => m.cpu.usage)),
        },
        network: {
          averageResponseTime: this.calculateAverage(
            recentMetrics.map(m => m.network.averageResponseTime)
          ),
          errorRate: this.calculateAverage(
            recentMetrics.map(m =>
              m.network.requests > 0
                ? (m.network.errors / m.network.requests) * 100
                : 0
            )
          ),
        },
        app: {
          averageStartupTime: this.calculateAverage(
            recentMetrics.map(m => m.app.startupTime)
          ),
          averageFrameRate: this.calculateAverage(
            recentMetrics.map(m => m.app.frameRate)
          ),
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.baselines.push(baseline);
  }

  // 計算平均Value
  private calculateAverage(values: number[]): number {
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  // 生成基於基準的優化建議
  async generateBaselineOptimizationSuggestions(
    metrics: PerformanceMetrics
  ): Promise<PerformanceOptimization[]> {
    const suggestions: PerformanceOptimization[] = [];

    // 基於基準比較生成建議
    const _currentBaseline = this.baselines[this.baselines.length - 1];
    if (currentBaseline) {
      if (metrics.memory.usage > currentBaseline.metrics.memory.average * 1.2) {
        suggestions.push({
          id: `opt_${Date.now()}_memory_baseline`,
          type: 'memory',
          priority: 'medium',
          title: '內存使用超出基準',
          description: '當前內存使用率超出基準 20%',
          impact: '可恢復到基準水平',
          effort: 'low',
          estimatedTime: 4,
          recommendations: ['檢查最近的代碼變更', '分析內存使用模式'],
          createdAt: new Date(),
          implemented: false,
        });
      }
    }

    return suggestions;
  }

  // 清理舊Data
  private cleanupOldData(): void {
    const _cutoffDate = new Date(
      Date.now() - this.config.retentionPeriod * 24 * 60 * 60 * 1000
    );

    this.metrics = this.metrics.filter(metric => metric.timestamp > cutoffDate);
    this.alerts = this.alerts.filter(alert => alert.timestamp > cutoffDate);

    console.log('舊性能數據清理完成');
  }

  // Notification監聽器
  private notifyListeners(metrics: PerformanceMetrics): void {
    this.listeners.forEach(listener => {
      try {
        listener(metrics);
      } catch (error) {
        console.error('性能監聽器Error:', error);
      }
    });
  }

  // Add監聽器
  addListener(listener: (metrics: PerformanceMetrics) => void): void {
    this.listeners.push(listener);
  }

  // Remove監聽器
  removeListener(listener: (metrics: PerformanceMetrics) => void): void {
    const _index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  // ResolveAlert
  resolveAlert(alertId: string): void {
    const _alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
    }
  }

  // UpdateConfigure
  updateConfig(newConfig: Partial<PerformanceMonitoringConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('性能監控配置已更新');
  }

  // GetConfigure
  getConfig(): PerformanceMonitoringConfig {
    return { ...this.config };
  }

  // Get指標
  getMetrics(limit = 100): PerformanceMetrics[] {
    return this.metrics.slice(-limit);
  }

  // GetAlert
  getAlerts(resolved = false): PerformanceAlert[] {
    return this.alerts.filter(alert => alert.resolved === resolved);
  }

  // Get基準
  getBaselines(): PerformanceBaseline[] {
    return [...this.baselines];
  }

  // Get優化建議
  getOptimizations(implemented = false): PerformanceOptimization[] {
    return this.optimizations.filter(opt => opt.implemented === implemented);
  }

  // 生成模擬優化建議
  private generateMockOptimizations(): PerformanceOptimization[] {
    return [
      {
        id: 'opt_001',
        type: 'memory',
        priority: 'high',
        title: '圖片優化',
        description: '優化圖片加載和緩存策略',
        impact: '可減少內存使用 25%',
        effort: 'medium',
        estimatedTime: 6,
        recommendations: [
          '實現圖片懶加載',
          '使用 WebP 格式',
          '實現圖片壓縮',
          '優化圖片緩存策略',
        ],
        createdAt: new Date(),
        implemented: false,
      },
      {
        id: 'opt_002',
        type: 'network',
        priority: 'medium',
        title: 'API 優化',
        description: '優化 API 請求和響應',
        impact: '可減少響應時間 40%',
        effort: 'high',
        estimatedTime: 10,
        recommendations: [
          '實現請求緩存',
          '優化 API 端點',
          '使用 GraphQL',
          '實現請求合併',
        ],
        createdAt: new Date(),
        implemented: false,
      },
    ];
  }
}

// Export單例Instance
export const _performanceMonitoringService =
  PerformanceMonitoringService.getInstance();
