import { Platform } from 'react-native';

/**
 * PWA ServiceConfigureInterface
 */
export interface PWAServiceConfig {
  appName: string;
  appShortName: string;
  appDescription: string;
  appVersion: string;
  appThemeColor: string;
  appBackgroundColor: string;
  appDisplay: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  appOrientation:
    | 'any'
    | 'natural'
    | 'landscape'
    | 'landscape-primary'
    | 'landscape-secondary'
    | 'portrait'
    | 'portrait-primary'
    | 'portrait-secondary';
  appScope: string;
  appStartUrl: string;
  appIcons: PWAIcon[];
  appScreenshots: PWAScreenshot[];
  appCategories: string[];
  appLang: string;
  appDir: 'ltr' | 'rtl' | 'auto';
  appPreferRelatedApplications: boolean;
  appRelatedApplications: PWARelatedApplication[];
  appShortcuts: PWAShortcut[];
  appProtocolHandlers: PWAProtocolHandler[];
  appFileHandlers: PWAFileHandler[];
  appShareTarget: PWAShareTarget;
  appCaptureLinks: 'new-client' | 'existing-client-navigate';
  appHandleLinks: 'preferred' | 'not-preferred' | 'auto';
  appLaunchHandler: PWALaunchHandler;
  appDisplayOverride: (
    | 'window-controls-overlay'
    | 'minimal-ui'
    | 'standalone'
    | 'fullscreen'
    | 'browser'
  )[];
  appEdgeSidePanel: PWAEdgeSidePanel;
  appNoteTaking: PWANoteTaking;
  appWindowControlsOverlay: PWAWindowControlsOverlay;
  appTabStrip: PWATabStrip;
  appIsla: PWAIsla;
  appLaunchQueue: PWALaunchQueue;
}

/**
 * PWA Graph標Interface
 */
export interface PWAIcon {
  src: string;
  sizes: string;
  type: string;
  purpose?: 'maskable' | 'any' | 'any maskable';
  platform?: string;
}

/**
 * PWA 截GraphInterface
 */
export interface PWAScreenshot {
  src: string;
  sizes: string;
  type: string;
  form_factor?: 'wide' | 'narrow';
  label?: string;
}

/**
 * PWA 相OffApplyInterface
 */
export interface PWARelatedApplication {
  platform: string;
  url?: string;
  id?: string;
}

/**
 * PWA 快捷方式Interface
 */
export interface PWAShortcut {
  name: string;
  short_name?: string;
  description?: string;
  url: string;
  icons?: PWAIcon[];
}

/**
 * PWA ProtocolHandle器Interface
 */
export interface PWAProtocolHandler {
  protocol: string;
  url: string;
}

/**
 * PWA FileHandle器Interface
 */
export interface PWAFileHandler {
  action: string;
  accept: Record<string, string[]>;
}

/**
 * PWA 分享目標Interface
 */
export interface PWAShareTarget {
  action: string;
  method: 'GET' | 'POST';
  enctype?: 'application/x-www-form-urlencoded' | 'multipart/form-data';
  params: {
    title?: string;
    text?: string;
    url?: string;
    files?: string;
  };
}

/**
 * PWA StartHandle器Interface
 */
export interface PWALaunchHandler {
  client_mode: 'navigate-existing' | 'auto' | 'focus-existing';
}

/**
 * PWA 邊欄面板Interface
 */
export interface PWAEdgeSidePanel {
  preferred_width: number;
}

/**
 * PWA 筆記功能Interface
 */
export interface PWANoteTaking {
  new_note_url: string;
}

/**
 * PWA 窗口Control覆蓋Interface
 */
export interface PWAWindowControlsOverlay {
  enabled: boolean;
}

/**
 * PWA Tag條Interface
 */
export interface PWATabStrip {
  home_tab: {
    name: string;
    icons: PWAIcon[];
  };
  new_tab_button: {
    enabled: boolean;
  };
}

/**
 * PWA ISLA Interface
 */
export interface PWAIsla {
  enabled: boolean;
}

/**
 * PWA StartQueueInterface
 */
export interface PWALaunchQueue {
  enabled: boolean;
}

/**
 * PWA InstallStatus
 */
export interface PWAInstallStatus {
  isInstalled: boolean;
  canInstall: boolean;
  installPrompt?: unknown;
  deferredPrompt?: unknown;
}

/**
 * PWA ServiceStatus
 */
export interface PWAServiceStatus {
  isServiceWorkerRegistered: boolean;
  isOffline: boolean;
  isOnline: boolean;
  networkType: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

/**
 * PWA Service結果
 */
export interface PWAServiceResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
}

/**
 * PWA ServiceStatistics
 */
export interface PWAServiceStats {
  totalInstallations: number;
  totalUninstallations: number;
  totalUpdates: number;
  averageInstallTime: number;
  averageUpdateTime: number;
  offlineUsageTime: number;
  onlineUsageTime: number;
  cacheHitRate: number;
  serviceWorkerUpdates: number;
}

/**
 * PWA ServiceClass
 */
export class PWAService {
  private static instance: PWAService;
  private isInitialized = false;
  private config: PWAServiceConfig | null = null;
  private readonly installStatus: PWAInstallStatus = {
    isInstalled: false,
    canInstall: false,
  };
  private readonly serviceStatus: PWAServiceStatus = {
    isServiceWorkerRegistered: false,
    isOffline: false,
    isOnline: true,
    networkType: 'unknown',
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0,
    saveData: false,
  };
  private readonly stats: PWAServiceStats = {
    totalInstallations: 0,
    totalUninstallations: 0,
    totalUpdates: 0,
    averageInstallTime: 0,
    averageUpdateTime: 0,
    offlineUsageTime: 0,
    onlineUsageTime: 0,
    cacheHitRate: 0,
    serviceWorkerUpdates: 0,
  };

  private constructor() {
    // Private構造Function，實現單例模式
  }

  /**
   * Get PWA ServiceInstance
   */
  public static getInstance(): PWAService {
    if (!PWAService.instance) {
      PWAService.instance = new PWAService();
    }
    return PWAService.instance;
  }

  /**
   * Initialize PWA Service
   */
  public async initialize(config: PWAServiceConfig): Promise<PWAServiceResult> {
    if (this.isInitialized) {
      return { success: true, data: 'PWA Service已Initialize' };
    }

    if (Platform.OS !== 'web') {
      return {
        success: false,
        error: 'PWA Service僅支持 Web 平台',
        errorCode: 'PLATFORM_NOT_SUPPORTED',
      };
    }

    try {
      this.config = config;
      await this.initializeServiceWorker();
      await this.initializeNetworkMonitoring();
      await this.initializeInstallationHandling();
      await this.generateManifest();
      await this.registerServiceWorker();

      this.isInitialized = true;

      return { success: true, data: 'PWA ServiceInitializeSuccess' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'PWA ServiceInitializeFailed',
        errorCode: 'INITIALIZATION_FAILED',
      };
    }
  }

  /**
   * Initialize Service Worker
   */
  private async initializeServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker 不支持');
    }
  }

  /**
   * InitializeNetworkMonitor
   */
  private async initializeNetworkMonitoring(): Promise<void> {
    if ('connection' in navigator) {
      const { connection } = navigator as any;
      this.updateNetworkInfo(connection);

      connection.addEventListener('change', () => {
        this.updateNetworkInfo(connection);
      });
    }

    window.addEventListener('online', () => {
      this.serviceStatus.isOnline = true;
      this.serviceStatus.isOffline = false;
    });

    window.addEventListener('offline', () => {
      this.serviceStatus.isOnline = false;
      this.serviceStatus.isOffline = true;
    });
  }

  /**
   * UpdateNetworkInformation
   */
  private updateNetworkInfo(connection: unknown): void {
    this.serviceStatus.networkType = connection.effectiveType || 'unknown';
    this.serviceStatus.effectiveType = connection.effectiveType || 'unknown';
    this.serviceStatus.downlink = connection.downlink || 0;
    this.serviceStatus.rtt = connection.rtt || 0;
    this.serviceStatus.saveData = connection.saveData || false;
  }

  /**
   * InitializeInstallHandle
   */
  private async initializeInstallationHandling(): Promise<void> {
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      this.installStatus.deferredPrompt = e;
      this.installStatus.canInstall = true;
    });

    window.addEventListener('appinstalled', () => {
      this.installStatus.isInstalled = true;
      this.installStatus.canInstall = false;
      this.installStatus.deferredPrompt = null;
      this.stats.totalInstallations++;
    });
  }

  /**
   * 生成 Web App Manifest
   */
  private async generateManifest(): Promise<void> {
    if (!this.config) {
      throw new Error('PWA 配置未設置');
    }

    const _manifest = {
      name: this.config.appName,
      short_name: this.config.appShortName,
      description: this.config.appDescription,
      version: this.config.appVersion,
      theme_color: this.config.appThemeColor,
      background_color: this.config.appBackgroundColor,
      display: this.config.appDisplay,
      orientation: this.config.appOrientation,
      scope: this.config.appScope,
      start_url: this.config.appStartUrl,
      icons: this.config.appIcons,
      screenshots: this.config.appScreenshots,
      categories: this.config.appCategories,
      lang: this.config.appLang,
      dir: this.config.appDir,
      prefer_related_applications: this.config.appPreferRelatedApplications,
      related_applications: this.config.appRelatedApplications,
      shortcuts: this.config.appShortcuts,
      protocol_handlers: this.config.appProtocolHandlers,
      file_handlers: this.config.appFileHandlers,
      share_target: this.config.appShareTarget,
      capture_links: this.config.appCaptureLinks,
      handle_links: this.config.appHandleLinks,
      launch_handler: this.config.appLaunchHandler,
      display_override: this.config.appDisplayOverride,
      edge_side_panel: this.config.appEdgeSidePanel,
      note_taking: this.config.appNoteTaking,
      window_controls_overlay: this.config.appWindowControlsOverlay,
      tab_strip: this.config.appTabStrip,
      isla: this.config.appIsla,
      launch_queue: this.config.appLaunchQueue,
    };

    const _manifestBlob = new Blob([JSON.stringify(manifest, null, 2)], {
      type: 'application/json',
    });

    const _manifestUrl = URL.createObjectURL(manifestBlob);

    // Create或Update manifest link
    let manifestLink = document.querySelector(
      'link[rel="manifest"]'
    ) as HTMLLinkElement;
    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      document.head.appendChild(manifestLink);
    }
    manifestLink.href = manifestUrl;
  }

  /**
   * Register Service Worker
   */
  private async registerServiceWorker(): Promise<void> {
    try {
      const _registration = await navigator.serviceWorker.register('/sw.js');
      this.serviceStatus.isServiceWorkerRegistered = true;
      this.stats.serviceWorkerUpdates++;

      registration.addEventListener('updatefound', () => {
        const _newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // 有新Version可用
              this.stats.serviceWorkerUpdates++;
            }
          });
        }
      });
    } catch (error) {
      console.warn('Service Worker 註冊Failed:', error);
    }
  }

  /**
   * Install PWA
   */
  public async installPWA(): Promise<PWAServiceResult> {
    if (!this.isInitialized) {
      return {
        success: false,
        error: 'PWA Service未Initialize',
        errorCode: 'SERVICE_NOT_INITIALIZED',
      };
    }

    if (!this.installStatus.canInstall || !this.installStatus.deferredPrompt) {
      return {
        success: false,
        error: '無法安裝 PWA',
        errorCode: 'CANNOT_INSTALL',
      };
    }

    try {
      const _startTime = Date.now();

      this.installStatus.deferredPrompt.prompt();
      const { outcome } = await this.installStatus.deferredPrompt.userChoice;

      const _installTime = Date.now() - startTime;
      this.stats.averageInstallTime =
        (this.stats.averageInstallTime + installTime) / 2;

      if (outcome === 'accepted') {
        this.installStatus.canInstall = false;
        this.installStatus.deferredPrompt = null;
        return { success: true, data: 'PWA 安裝Success' };
      } else {
        return {
          success: false,
          error: '用戶取消安裝',
          errorCode: 'USER_CANCELLED',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'PWA 安裝Failed',
        errorCode: 'INSTALLATION_FAILED',
      };
    }
  }

  /**
   * CheckInstallStatus
   */
  public getInstallStatus(): PWAInstallStatus {
    return { ...this.installStatus };
  }

  /**
   * GetServiceStatus
   */
  public getServiceStatus(): PWAServiceStatus {
    return { ...this.serviceStatus };
  }

  /**
   * GetServiceStatistics
   */
  public getServiceStats(): PWAServiceStats {
    return { ...this.stats };
  }

  /**
   * Update PWA
   */
  public async updatePWA(): Promise<PWAServiceResult> {
    if (!this.isInitialized) {
      return {
        success: false,
        error: 'PWA Service未Initialize',
        errorCode: 'SERVICE_NOT_INITIALIZED',
      };
    }

    try {
      const _startTime = Date.now();

      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SKIP_WAITING',
        });
      }

      const _updateTime = Date.now() - startTime;
      this.stats.averageUpdateTime =
        (this.stats.averageUpdateTime + updateTime) / 2;
      this.stats.totalUpdates++;

      return { success: true, data: 'PWA UpdateSuccess' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'PWA UpdateFailed',
        errorCode: 'UPDATE_FAILED',
      };
    }
  }

  /**
   * ClearCache
   */
  public async clearCache(): Promise<PWAServiceResult> {
    if (!this.isInitialized) {
      return {
        success: false,
        error: 'PWA Service未Initialize',
        errorCode: 'SERVICE_NOT_INITIALIZED',
      };
    }

    try {
      const _cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));

      return { success: true, data: '緩存清除Success' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '緩存清除Failed',
        errorCode: 'CACHE_CLEAR_FAILED',
      };
    }
  }

  /**
   * GetCacheInformation
   */
  public async getCacheInfo(): Promise<
    PWAServiceResult<{ cacheNames: string[]; totalSize: number }>
  > {
    if (!this.isInitialized) {
      return {
        success: false,
        error: 'PWA Service未Initialize',
        errorCode: 'SERVICE_NOT_INITIALIZED',
      };
    }

    try {
      const _cacheNames = await caches.keys();
      let totalSize = 0;

      for (const cacheName of cacheNames) {
        const _cache = await caches.open(cacheName);
        const _keys = await cache.keys();

        for (const request of keys) {
          const _response = await cache.match(request);
          if (response) {
            const _blob = await response.blob();
            totalSize += blob.size;
          }
        }
      }

      return {
        success: true,
        data: { cacheNames, totalSize },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Get緩存信息Failed',
        errorCode: 'CACHE_INFO_FAILED',
      };
    }
  }

  /**
   * CheckServiceYesNo就緒
   */
  public isServiceReady(): boolean {
    return this.isInitialized && Platform.OS === 'web';
  }

  /**
   * GetServiceInformation
   */
  public getServiceInfo(): PWAServiceResult<{
    isInitialized: boolean;
    platform: string;
    config: PWAServiceConfig | null;
    installStatus: PWAInstallStatus;
    serviceStatus: PWAServiceStatus;
    stats: PWAServiceStats;
  }> {
    return {
      success: true,
      data: {
        isInitialized: this.isInitialized,
        platform: Platform.OS,
        config: this.config,
        installStatus: this.installStatus,
        serviceStatus: this.serviceStatus,
        stats: this.stats,
      },
    };
  }
}

export default PWAService;
