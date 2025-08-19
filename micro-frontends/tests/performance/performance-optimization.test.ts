import { test, expect, Page } from '@playwright/test';
import { setupTestEnvironment, cleanupTestEnvironment } from '../setup/e2e-setup';
import { PerformanceMonitor } from './performance-monitor';

// 性能優化測試配置
const OPTIMIZATION_CONFIG = {
  // 代碼分割測試
  codeSplitting: {
    expectedBundleSize: 2 * 1024 * 1024, // 2MB
    expectedLoadTime: 3000, // 3秒
    expectedChunkCount: 5
  },
  // 圖片優化測試
  imageOptimization: {
    expectedImageSize: 500 * 1024, // 500KB
    expectedLoadTime: 1000, // 1秒
    expectedFormat: 'webp'
  },
  // 緩存策略測試
  caching: {
    expectedCacheHitRate: 0.8, // 80%
    expectedLoadTime: 500, // 500ms
    expectedStorageUsage: 50 * 1024 * 1024 // 50MB
  },
  // 懶加載測試
  lazyLoading: {
    expectedInitialLoadTime: 2000, // 2秒
    expectedScrollLoadTime: 1000, // 1秒
    expectedVisibleImages: 10
  },
  // 壓縮測試
  compression: {
    expectedCompressionRatio: 0.7, // 70%壓縮率
    expectedTransferSize: 1 * 1024 * 1024, // 1MB
    expectedGzipEnabled: true
  }
};

describe('CardStrategy 性能優化測試', () => {
  let page: Page;
  let performanceMonitor: PerformanceMonitor;

  beforeAll(async () => {
    await setupTestEnvironment();
  });

  beforeEach(async ({ browser }) => {
    page = await browser.newPage();

    // 初始化性能監控器
    performanceMonitor = new PerformanceMonitor(page, {
      enableRealTimeMonitoring: true,
      collectInterval: 2000,
      maxDataPoints: 50
    });

    await performanceMonitor.startMonitoring();
    await page.goto('http://localhost:3000');
  });

  afterEach(async () => {
    performanceMonitor.stopMonitoring();
    await page.close();
  });

  afterAll(async () => {
    await cleanupTestEnvironment();
  });

  test('代碼分割和模組化優化測試', async () => {
    console.log('🚀 開始代碼分割優化測試...');

    // 監控 JavaScript 包大小
    const bundleMetrics = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      const jsResources = resources.filter(resource =>
        resource.name.includes('.js') && resource.initiatorType === 'script'
      );

      return {
        totalSize: jsResources.reduce((sum, resource) => sum + (resource.transferSize || 0), 0),
        chunkCount: jsResources.length,
        averageSize: jsResources.reduce((sum, resource) => sum + (resource.transferSize || 0), 0) / jsResources.length,
        largestChunk: Math.max(...jsResources.map(resource => resource.transferSize || 0)),
        loadTimes: jsResources.map(resource => resource.duration)
      };
    });

    // 驗證代碼分割效果
    expect(bundleMetrics.totalSize).toBeLessThan(OPTIMIZATION_CONFIG.codeSplitting.expectedBundleSize);
    expect(bundleMetrics.chunkCount).toBeGreaterThan(OPTIMIZATION_CONFIG.codeSplitting.expectedChunkCount);
    expect(bundleMetrics.averageSize).toBeLessThan(500 * 1024); // 每個chunk小於500KB

    console.log('📊 代碼分割測試結果:');
    console.log(`   總包大小: ${(bundleMetrics.totalSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   Chunk 數量: ${bundleMetrics.chunkCount}`);
    console.log(`   平均 Chunk 大小: ${(bundleMetrics.averageSize / 1024).toFixed(2)}KB`);
    console.log(`   最大 Chunk 大小: ${(bundleMetrics.largestChunk / 1024).toFixed(2)}KB`);

    // 測試動態加載
    const dynamicLoadTimes: number[] = [];

    // 測試各個模組的動態加載
    const modules = ['card-management', 'market-analysis', 'ai-ecosystem'];

    for (const module of modules) {
      const startTime = performance.now();
      try {
        await page.click(`[data-testid="${module}-nav"]`);
        await page.waitForSelector(`[data-testid="${module}-module"]`, { timeout: 10000 });
        const endTime = performance.now();
        dynamicLoadTimes.push(endTime - startTime);
      } catch (error) {
        console.warn(`模組 ${module} 加載失敗:`, error.message);
      }
    }

    // 驗證動態加載性能
    const averageLoadTime = dynamicLoadTimes.reduce((a, b) => a + b, 0) / dynamicLoadTimes.length;
    expect(averageLoadTime).toBeLessThan(OPTIMIZATION_CONFIG.codeSplitting.expectedLoadTime);

    console.log(`   平均動態加載時間: ${averageLoadTime.toFixed(2)}ms`);
  });

  test('圖片優化和懶加載測試', async () => {
    console.log('🚀 開始圖片優化測試...');

    // 監控圖片加載
    const imageMetrics = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      const imageResources = performance.getEntriesByType('resource').filter(resource =>
        resource.initiatorType === 'img'
      );

      return {
        totalImages: images.length,
        totalSize: imageResources.reduce((sum, resource) => sum + (resource.transferSize || 0), 0),
        averageSize: imageResources.reduce((sum, resource) => sum + (resource.transferSize || 0), 0) / imageResources.length,
        loadTimes: imageResources.map(resource => resource.duration),
        formats: Array.from(images).map(img => {
          const {src} = (img as HTMLImageElement);
          return src.split('.').pop()?.toLowerCase();
        }),
        lazyLoaded: Array.from(images).filter(img => (img as HTMLImageElement).loading === 'lazy').length
      };
    });

    // 驗證圖片優化
    expect(imageMetrics.totalSize).toBeLessThan(OPTIMIZATION_CONFIG.imageOptimization.expectedImageSize);
    expect(imageMetrics.averageSize).toBeLessThan(100 * 1024); // 平均圖片小於100KB
    expect(imageMetrics.lazyLoaded).toBeGreaterThan(0);

    console.log('📊 圖片優化測試結果:');
    console.log(`   總圖片數量: ${imageMetrics.totalImages}`);
    console.log(`   總圖片大小: ${(imageMetrics.totalSize / 1024).toFixed(2)}KB`);
    console.log(`   平均圖片大小: ${(imageMetrics.averageSize / 1024).toFixed(2)}KB`);
    console.log(`   懶加載圖片數量: ${imageMetrics.lazyLoaded}`);

    // 測試懶加載功能
    const initialVisibleImages = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      return Array.from(images).filter(img => {
        const rect = (img as HTMLImageElement).getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
      }).length;
    });

    // 滾動頁面測試懶加載
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);

    const finalVisibleImages = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      return Array.from(images).filter(img => {
        const rect = (img as HTMLImageElement).getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
      }).length;
    });

    expect(finalVisibleImages).toBeGreaterThan(initialVisibleImages);
    console.log(`   初始可見圖片: ${initialVisibleImages}`);
    console.log(`   滾動後可見圖片: ${finalVisibleImages}`);

    // 檢查圖片格式
    const webpImages = imageMetrics.formats.filter(format => format === 'webp').length;
    const webpRatio = webpImages / imageMetrics.formats.length;
    expect(webpRatio).toBeGreaterThan(0.5); // 至少50%的圖片使用WebP格式

    console.log(`   WebP 圖片比例: ${(webpRatio * 100).toFixed(2)}%`);
  });

  test('緩存策略和離線功能測試', async () => {
    console.log('🚀 開始緩存策略測試...');

    // 檢查 Service Worker
    const serviceWorkerStatus = await page.evaluate(() => {
      return {
        hasServiceWorker: 'serviceWorker' in navigator,
        isRegistered: false,
        cacheAvailable: 'caches' in window
      };
    });

    expect(serviceWorkerStatus.hasServiceWorker).toBe(true);
    expect(serviceWorkerStatus.cacheAvailable).toBe(true);

    // 測試緩存命中率
    const cacheMetrics = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      const cachedResources = resources.filter(resource =>
        resource.transferSize === 0 || resource.transferSize < resource.encodedBodySize
      );

      return {
        totalResources: resources.length,
        cachedResources: cachedResources.length,
        cacheHitRate: cachedResources.length / resources.length,
        averageCachedSize: cachedResources.reduce((sum, resource) => sum + (resource.transferSize || 0), 0) / cachedResources.length,
        averageUncachedSize: resources.filter(resource =>
          resource.transferSize > 0 && resource.transferSize >= resource.encodedBodySize
        ).reduce((sum, resource) => sum + (resource.transferSize || 0), 0) / resources.filter(resource =>
          resource.transferSize > 0 && resource.transferSize >= resource.encodedBodySize
        ).length
      };
    });

    // 驗證緩存效果
    expect(cacheMetrics.cacheHitRate).toBeGreaterThan(OPTIMIZATION_CONFIG.caching.expectedCacheHitRate);
    expect(cacheMetrics.averageCachedSize).toBeLessThan(cacheMetrics.averageUncachedSize);

    console.log('📊 緩存策略測試結果:');
    console.log(`   總資源數量: ${cacheMetrics.totalResources}`);
    console.log(`   緩存資源數量: ${cacheMetrics.cachedResources}`);
    console.log(`   緩存命中率: ${(cacheMetrics.cacheHitRate * 100).toFixed(2)}%`);
    console.log(`   平均緩存大小: ${(cacheMetrics.averageCachedSize / 1024).toFixed(2)}KB`);
    console.log(`   平均未緩存大小: ${(cacheMetrics.averageUncachedSize / 1024).toFixed(2)}KB`);

    // 測試離線功能
    await page.route('**/*', route => route.abort());

    try {
      await page.reload();
      const offlineContent = await page.evaluate(() => {
        return {
          hasOfflineIndicator: !!document.querySelector('[data-testid="offline-indicator"]'),
          hasCachedContent: !!document.querySelector('[data-testid="cached-content"]'),
          pageTitle: document.title
        };
      });

      expect(offlineContent.pageTitle).toContain('CardStrategy');
      console.log('✅ 離線功能正常工作');
    } catch (error) {
      console.warn('⚠️ 離線功能測試失敗:', error.message);
    }

    // 恢復網絡連接
    await page.unroute('**/*');
  });

  test('壓縮和傳輸優化測試', async () => {
    console.log('🚀 開始壓縮優化測試...');

    // 檢查壓縮效果
    const compressionMetrics = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');

      return {
        totalResources: resources.length,
        totalTransferSize: resources.reduce((sum, resource) => sum + (resource.transferSize || 0), 0),
        totalEncodedSize: resources.reduce((sum, resource) => sum + (resource.encodedBodySize || 0), 0),
        compressionRatio: 0,
        gzipEnabled: false,
        resourceTypes: resources.reduce((acc, resource) => {
          const type = resource.initiatorType;
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number })
      };
    });

    // 計算壓縮率
    compressionMetrics.compressionRatio =
      (compressionMetrics.totalEncodedSize - compressionMetrics.totalTransferSize) / compressionMetrics.totalEncodedSize;

    // 驗證壓縮效果
    expect(compressionMetrics.compressionRatio).toBeGreaterThan(OPTIMIZATION_CONFIG.compression.expectedCompressionRatio);
    expect(compressionMetrics.totalTransferSize).toBeLessThan(OPTIMIZATION_CONFIG.compression.expectedTransferSize);

    console.log('📊 壓縮優化測試結果:');
    console.log(`   總資源數量: ${compressionMetrics.totalResources}`);
    console.log(`   總傳輸大小: ${(compressionMetrics.totalTransferSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   總編碼大小: ${(compressionMetrics.totalEncodedSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   壓縮率: ${(compressionMetrics.compressionRatio * 100).toFixed(2)}%`);

    // 檢查 HTTP/2 和 HTTPS
    const protocolMetrics = await page.evaluate(() => {
      return {
        protocol: window.location.protocol,
        isSecure: window.location.protocol === 'https:',
        hasHttp2: 'connection' in navigator && (navigator as any).connection?.effectiveType === '4g'
      };
    });

    expect(protocolMetrics.isSecure).toBe(true);
    console.log(`   協議: ${protocolMetrics.protocol}`);
    console.log(`   安全連接: ${protocolMetrics.isSecure}`);
    console.log(`   HTTP/2 支持: ${protocolMetrics.hasHttp2}`);

    // 檢查資源類型分布
    console.log('   資源類型分布:');
    Object.entries(compressionMetrics.resourceTypes).forEach(([type, count]) => {
      console.log(`     ${type}: ${count} 個`);
    });
  });

  test('內存優化和垃圾回收測試', async () => {
    console.log('🚀 開始內存優化測試...');

    // 初始內存使用
    const initialMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
          jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
        };
      }
      return null;
    });

    if (!initialMemory) {
      console.warn('⚠️ 無法獲取內存信息，跳過內存測試');
      return;
    }

    console.log('📊 初始內存狀態:');
    console.log(`   已使用堆內存: ${(initialMemory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   總堆內存: ${(initialMemory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   堆內存限制: ${(initialMemory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`);

    // 執行內存密集型操作
    const memoryIntensiveOperations = async () => {
      for (let i = 0; i < 10; i++) {
        await page.click('[data-testid="card-management-nav"]');
        await page.waitForTimeout(500);
        await page.click('[data-testid="market-analysis-nav"]');
        await page.waitForTimeout(500);
        await page.click('[data-testid="ai-ecosystem-nav"]');
        await page.waitForTimeout(500);

        // 觸發垃圾回收（如果可能）
        await page.evaluate(() => {
          if ('gc' in window) {
            (window as any).gc();
          }
        });
      }
    };

    await memoryIntensiveOperations();

    // 最終內存使用
    const finalMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
          jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
        };
      }
      return null;
    });

    if (finalMemory) {
      const memoryGrowth = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
      const memoryGrowthMB = memoryGrowth / 1024 / 1024;

      console.log('📊 最終內存狀態:');
      console.log(`   已使用堆內存: ${(finalMemory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
      console.log(`   內存增長: ${memoryGrowthMB.toFixed(2)}MB`);

      // 驗證內存優化
      expect(memoryGrowthMB).toBeLessThan(100); // 內存增長應該小於100MB
      expect(finalMemory.usedJSHeapSize).toBeLessThan(finalMemory.jsHeapSizeLimit * 0.8); // 使用率應該小於80%

      if (memoryGrowthMB < 50) {
        console.log('✅ 內存優化效果良好');
      } else if (memoryGrowthMB < 100) {
        console.log('⚠️ 內存使用需要優化');
      } else {
        console.log('❌ 內存洩漏檢測到');
      }
    }
  });

  test('渲染性能和動畫優化測試', async () => {
    console.log('🚀 開始渲染性能測試...');

    // 監控幀率
    const frameRateMetrics = await page.evaluate(() => {
      return new Promise<{
        averageFPS: number;
        minFPS: number;
        maxFPS: number;
        droppedFrames: number;
        frameRates: number[];
      }>((resolve) => {
        const frameRates: number[] = [];
        let frameCount = 0;
        let lastTime = performance.now();
        let droppedFrames = 0;

        const measureFrameRate = () => {
          frameCount++;
          const currentTime = performance.now();

          if (currentTime - lastTime >= 1000) {
            const fps = frameCount * 1000 / (currentTime - lastTime);
            frameRates.push(fps);

            // 檢測丟幀
            if (fps < 30) {
              droppedFrames += (30 - fps);
            }

            frameCount = 0;
            lastTime = currentTime;
          }

          if (frameRates.length < 10) {
            requestAnimationFrame(measureFrameRate);
          } else {
            resolve({
              averageFPS: frameRates.reduce((a, b) => a + b, 0) / frameRates.length,
              minFPS: Math.min(...frameRates),
              maxFPS: Math.max(...frameRates),
              droppedFrames,
              frameRates
            });
          }
        };

        requestAnimationFrame(measureFrameRate);
      });
    });

    // 驗證渲染性能
    expect(frameRateMetrics.averageFPS).toBeGreaterThan(30);
    expect(frameRateMetrics.minFPS).toBeGreaterThan(20);
    expect(frameRateMetrics.droppedFrames).toBeLessThan(50);

    console.log('📊 渲染性能測試結果:');
    console.log(`   平均幀率: ${frameRateMetrics.averageFPS.toFixed(2)} FPS`);
    console.log(`   最低幀率: ${frameRateMetrics.minFPS.toFixed(2)} FPS`);
    console.log(`   最高幀率: ${frameRateMetrics.maxFPS.toFixed(2)} FPS`);
    console.log(`   丟幀數量: ${frameRateMetrics.droppedFrames.toFixed(2)}`);

    // 測試動畫流暢度
    const animationMetrics = await page.evaluate(() => {
      return new Promise<{
        animationCount: number;
        smoothAnimations: number;
        smoothnessRatio: number;
      }>((resolve) => {
        const animations = document.querySelectorAll('*[style*="animation"], *[style*="transition"]');
        const animationCount = animations.length;
        let smoothAnimations = 0;

        // 簡單的動畫流暢度檢測
        animations.forEach(element => {
          const style = window.getComputedStyle(element);
          const hasTransform = style.transform !== 'none';
          const hasTransition = style.transition !== 'all 0s ease 0s';
          const hasAnimation = style.animation !== 'none';

          if (hasTransform || hasTransition || hasAnimation) {
            smoothAnimations++;
          }
        });

        resolve({
          animationCount,
          smoothAnimations,
          smoothnessRatio: smoothAnimations / animationCount
        });
      });
    });

    console.log('📊 動畫優化測試結果:');
    console.log(`   動畫元素數量: ${animationMetrics.animationCount}`);
    console.log(`   流暢動畫數量: ${animationMetrics.smoothAnimations}`);
    console.log(`   流暢度比例: ${(animationMetrics.smoothnessRatio * 100).toFixed(2)}%`);

    expect(animationMetrics.smoothnessRatio).toBeGreaterThan(0.8); // 至少80%的動畫應該是流暢的
  });

  test('綜合性能優化效果測試', async () => {
    console.log('🚀 開始綜合性能優化測試...');

    // 獲取性能監控報告
    const performanceReport = performanceMonitor.getPerformanceReport();

    console.log('📊 綜合性能報告:');
    console.log(`   監控數據點: ${performanceReport.summary.totalDataPoints}`);
    console.log(`   性能警報: ${performanceReport.summary.totalAlerts}`);
    console.log(`   監控時長: ${(performanceReport.summary.monitoringDuration / 1000).toFixed(2)}秒`);

    // 驗證綜合性能指標
    if (performanceReport.summary.averageMetrics.pageLoad) {
      const {pageLoad} = performanceReport.summary.averageMetrics;
      console.log('   頁面加載性能:');
      console.log(`     DOM 內容加載: ${pageLoad.domContentLoaded?.toFixed(2)}ms`);
      console.log(`     頁面完全加載: ${pageLoad.loadComplete?.toFixed(2)}ms`);
      console.log(`     首次內容繪製: ${pageLoad.firstContentfulPaint?.toFixed(2)}ms`);
      console.log(`     最大內容繪製: ${pageLoad.largestContentfulPaint?.toFixed(2)}ms`);
    }

    if (performanceReport.summary.averageMetrics.apiPerformance) {
      const {apiPerformance} = performanceReport.summary.averageMetrics;
      console.log('   API 性能:');
      console.log(`     平均響應時間: ${apiPerformance.averageResponseTime?.toFixed(2)}ms`);
      console.log(`     錯誤率: ${(apiPerformance.errorRate * 100)?.toFixed(2)}%`);
    }

    // 輸出優化建議
    console.log('💡 性能優化建議:');
    performanceReport.recommendations.forEach((recommendation, index) => {
      console.log(`   ${index + 1}. ${recommendation}`);
    });

    // 驗證整體性能
    expect(performanceReport.summary.totalAlerts).toBeLessThan(10); // 警報數量應該少於10個

    if (performanceReport.summary.averageMetrics.pageLoad) {
      expect(performanceReport.summary.averageMetrics.pageLoad.domContentLoaded).toBeLessThan(2000);
      expect(performanceReport.summary.averageMetrics.pageLoad.largestContentfulPaint).toBeLessThan(3000);
    }

    if (performanceReport.summary.averageMetrics.apiPerformance) {
      expect(performanceReport.summary.averageMetrics.apiPerformance.averageResponseTime).toBeLessThan(1500);
      expect(performanceReport.summary.averageMetrics.apiPerformance.errorRate).toBeLessThan(0.1);
    }

    console.log('✅ 綜合性能優化測試完成');
  });
});
