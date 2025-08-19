# 🧠 CardStrategy 內存優化與防洩漏指南

## 📋 概述

本指南提供 CardStrategy 專案中內存使用優化和防止內存洩漏的完整解決方案，包括前端、後端和微前端架構的內存管理策略。

---

## 🎯 內存洩漏檢測與監控

### 1. 前端內存監控

#### 內存使用監控服務
```typescript
// src/services/memoryMonitorService.ts
export class MemoryMonitorService {
  private memoryHistory: number[] = [];
  private leakThreshold = 10 * 1024 * 1024; // 10MB
  private checkInterval: NodeJS.Timeout | null = null;

  startMonitoring(): void {
    this.checkInterval = setInterval(() => {
      this.checkMemoryUsage();
    }, 10000); // 每10秒檢查一次
  }

  private checkMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMemory = memory.usedJSHeapSize;
      
      this.memoryHistory.push(usedMemory);
      
      // 保持最近20次記錄
      if (this.memoryHistory.length > 20) {
        this.memoryHistory.shift();
      }
      
      // 檢測內存洩漏
      if (this.memoryHistory.length >= 10) {
        const recentMemory = this.memoryHistory.slice(-10);
        const memoryGrowth = recentMemory[recentMemory.length - 1] - recentMemory[0];
        
        if (memoryGrowth > this.leakThreshold) {
          this.reportMemoryLeak(memoryGrowth);
        }
      }
    }
  }

  private reportMemoryLeak(growth: number): void {
    console.warn(`檢測到可能的內存洩漏: ${Math.round(growth / 1024 / 1024)}MB 增長`);
    // 發送到監控服務
  }

  cleanup(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.memoryHistory = [];
  }
}
```

#### 組件內存監控 Hook
```typescript
// src/hooks/useMemoryMonitor.ts
import { useEffect, useRef } from 'react';

export const useMemoryMonitor = (componentName: string) => {
  const mountTime = useRef(Date.now());
  const memoryStart = useRef(0);

  useEffect(() => {
    // 記錄組件掛載時的內存使用
    if ('memory' in performance) {
      memoryStart.current = (performance as any).memory.usedJSHeapSize;
    }

    return () => {
      // 組件卸載時檢查內存變化
      if ('memory' in performance) {
        const memoryEnd = (performance as any).memory.usedJSHeapSize;
        const memoryDiff = memoryEnd - memoryStart.current;
        const duration = Date.now() - mountTime.current;
        
        if (memoryDiff > 1024 * 1024) { // 1MB 增長
          console.warn(`${componentName} 可能存在內存洩漏: ${Math.round(memoryDiff / 1024)}KB 增長，生命週期: ${duration}ms`);
        }
      }
    };
  }, [componentName]);
};
```

### 2. 後端內存監控

#### Node.js 內存監控中間件
```javascript
// backend/src/middleware/memoryMonitor.js
const logger = require('../utils/logger');

class MemoryMonitor {
  constructor() {
    this.memoryHistory = [];
    this.maxHistorySize = 100;
    this.leakThreshold = 50 * 1024 * 1024; // 50MB
    this.checkInterval = null;
  }

  startMonitoring() {
    this.checkInterval = setInterval(() => {
      this.checkMemoryUsage();
    }, 30000); // 每30秒檢查一次
  }

  checkMemoryUsage() {
    const memUsage = process.memoryUsage();
    const usedMemory = memUsage.heapUsed;
    
    this.memoryHistory.push({
      timestamp: Date.now(),
      heapUsed: usedMemory,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      rss: memUsage.rss
    });
    
    // 限制歷史記錄大小
    if (this.memoryHistory.length > this.maxHistorySize) {
      this.memoryHistory.shift();
    }
    
    // 檢測內存洩漏
    if (this.memoryHistory.length >= 20) {
      const recentMemory = this.memoryHistory.slice(-20);
      const memoryGrowth = recentMemory[recentMemory.length - 1].heapUsed - recentMemory[0].heapUsed;
      
      if (memoryGrowth > this.leakThreshold) {
        this.reportMemoryLeak(memoryGrowth);
      }
    }
    
    // 記錄內存使用
    logger.debug('Memory usage', {
      heapUsed: `${Math.round(usedMemory / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`
    });
  }

  reportMemoryLeak(growth) {
    logger.warn('Memory leak detected', {
      growth: `${Math.round(growth / 1024 / 1024)}MB`,
      threshold: `${Math.round(this.leakThreshold / 1024 / 1024)}MB`
    });
  }

  cleanup() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.memoryHistory = [];
  }
}

module.exports = new MemoryMonitor();
```

---

## 🔧 內存優化策略

### 1. React 組件優化

#### 使用 React.memo 優化渲染
```typescript
// src/components/cards/CardDisplay.tsx
import React, { memo, useCallback } from 'react';

interface CardDisplayProps {
  card: Card;
  onPress?: (card: Card) => void;
  showPrice?: boolean;
}

export const CardDisplay: React.FC<CardDisplayProps> = memo(({
  card,
  onPress,
  showPrice = true
}) => {
  const handlePress = useCallback(() => {
    onPress?.(card);
  }, [card, onPress]);

  return (
    <TouchableOpacity onPress={handlePress}>
      {/* 組件內容 */}
    </TouchableOpacity>
  );
});

CardDisplay.displayName = 'CardDisplay';
```

#### 使用 useMemo 和 useCallback 優化計算
```typescript
// src/components/cards/CardGrid.tsx
import React, { useMemo, useCallback } from 'react';

export const CardGrid: React.FC<CardGridProps> = ({ cards, filters }) => {
  // 使用 useMemo 緩存過濾結果
  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      return filters.every(filter => filter(card));
    });
  }, [cards, filters]);

  // 使用 useCallback 緩存事件處理函數
  const handleCardPress = useCallback((card: Card) => {
    // 處理卡片點擊
  }, []);

  return (
    <FlatList
      data={filteredCards}
      renderItem={({ item }) => (
        <CardDisplay card={item} onPress={handleCardPress} />
      )}
      keyExtractor={useCallback((item: Card) => item.id, [])}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={8}
    />
  );
};
```

### 2. 圖片內存優化

#### 圖片懶加載和緩存
```typescript
// src/components/common/OptimizedImage.tsx
import React, { useState, useEffect } from 'react';
import { Image, ImageURISource } from 'react-native';

interface OptimizedImageProps {
  source: ImageURISource;
  style: any;
  placeholder?: ImageURISource;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  style,
  placeholder
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // 預加載圖片
    if (typeof source === 'object' && source.uri) {
      Image.prefetch(source.uri)
        .then(() => setIsLoaded(true))
        .catch(() => setHasError(true));
    }
  }, [source]);

  if (hasError && placeholder) {
    return <Image source={placeholder} style={style} />;
  }

  return (
    <Image
      source={isLoaded ? source : placeholder}
      style={style}
      onLoad={() => setIsLoaded(true)}
      onError={() => setHasError(true)}
    />
  );
};
```

#### 圖片壓縮和格式優化
```typescript
// src/utils/imageOptimizer.ts
export class ImageOptimizer {
  static optimizeImageUrl(url: string, width: number, quality: number = 0.8): string {
    const supportsWebP = this.supportsWebP();
    const format = supportsWebP ? 'webp' : 'jpg';
    
    return `${url}?w=${width}&q=${quality}&fmt=${format}`;
  }

  private static supportsWebP(): boolean {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  static preloadImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = url;
    });
  }
}
```

### 3. 數據結構優化

#### 使用 Map 和 Set 優化查找
```typescript
// src/services/cardService.ts
export class CardService {
  private cardCache = new Map<string, Card>();
  private cardIndex = new Map<string, Set<string>>();

  addCard(card: Card): void {
    this.cardCache.set(card.id, card);
    
    // 建立索引
    this.addToIndex('name', card.name.toLowerCase(), card.id);
    this.addToIndex('set', card.set.toLowerCase(), card.id);
  }

  private addToIndex(field: string, value: string, cardId: string): void {
    if (!this.cardIndex.has(field)) {
      this.cardIndex.set(field, new Set());
    }
    this.cardIndex.get(field)!.add(value);
  }

  searchCards(query: string): Card[] {
    const results = new Set<string>();
    const lowerQuery = query.toLowerCase();
    
    // 使用索引快速查找
    for (const [field, values] of this.cardIndex) {
      for (const value of values) {
        if (value.includes(lowerQuery)) {
          // 找到匹配的卡片ID
        }
      }
    }
    
    return Array.from(results).map(id => this.cardCache.get(id)!);
  }

  cleanup(): void {
    this.cardCache.clear();
    this.cardIndex.clear();
  }
}
```

### 4. 事件監聽器管理

#### 自動清理事件監聽器
```typescript
// src/hooks/useEventListener.ts
import { useEffect, useRef } from 'react';

export const useEventListener = (
  eventName: string,
  handler: EventListener,
  element: EventTarget = window,
  options?: AddEventListenerOptions
) => {
  const savedHandler = useRef<EventListener>();

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const eventListener = (event: Event) => savedHandler.current?.(event);
    
    element.addEventListener(eventName, eventListener, options);
    
    return () => {
      element.removeEventListener(eventName, eventListener, options);
    };
  }, [eventName, element, options]);
};
```

#### 組件事件管理
```typescript
// src/components/common/EventManager.tsx
import React, { useEffect, useRef } from 'react';

export class EventManager {
  private listeners = new Map<string, Set<EventListener>>();

  addEventListener(event: string, listener: EventListener): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  removeEventListener(event: string, listener: EventListener): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  cleanup(): void {
    this.listeners.clear();
  }
}

// 在組件中使用
export const useEventManager = () => {
  const eventManager = useRef(new EventManager());

  useEffect(() => {
    return () => {
      eventManager.current.cleanup();
    };
  }, []);

  return eventManager.current;
};
```

---

## 🚨 常見內存洩漏問題與解決方案

### 1. 閉包導致的內存洩漏

#### 問題示例
```typescript
// ❌ 錯誤：閉包引用大對象
const createLeakyFunction = (largeData: any[]) => {
  return () => {
    console.log(largeData.length); // 閉包持有 largeData 引用
  };
};
```

#### 解決方案
```typescript
// ✅ 正確：避免閉包引用大對象
const createCleanFunction = (dataLength: number) => {
  return () => {
    console.log(dataLength); // 只引用需要的數據
  };
};

// 或者使用 WeakMap
const dataCache = new WeakMap();
const createWeakReference = (largeData: any[]) => {
  const key = {};
  dataCache.set(key, largeData);
  return () => {
    const data = dataCache.get(key);
    if (data) {
      console.log(data.length);
    }
  };
};
```

### 2. 定時器未清理

#### 問題示例
```typescript
// ❌ 錯誤：定時器未清理
useEffect(() => {
  const timer = setInterval(() => {
    // 執行任務
  }, 1000);
  // 缺少清理函數
}, []);
```

#### 解決方案
```typescript
// ✅ 正確：及時清理定時器
useEffect(() => {
  const timer = setInterval(() => {
    // 執行任務
  }, 1000);
  
  return () => {
    clearInterval(timer);
  };
}, []);
```

### 3. DOM 引用未清理

#### 問題示例
```typescript
// ❌ 錯誤：DOM 引用未清理
class Component {
  private elementRef: HTMLElement | null = null;
  
  mount() {
    this.elementRef = document.getElementById('my-element');
    this.elementRef?.addEventListener('click', this.handleClick);
  }
  
  // 缺少 unmount 方法
}
```

#### 解決方案
```typescript
// ✅ 正確：及時清理 DOM 引用
class Component {
  private elementRef: HTMLElement | null = null;
  private boundHandleClick: (event: Event) => void;
  
  constructor() {
    this.boundHandleClick = this.handleClick.bind(this);
  }
  
  mount() {
    this.elementRef = document.getElementById('my-element');
    this.elementRef?.addEventListener('click', this.boundHandleClick);
  }
  
  unmount() {
    if (this.elementRef) {
      this.elementRef.removeEventListener('click', this.boundHandleClick);
      this.elementRef = null;
    }
  }
}
```

---

## 📊 內存優化工具和腳本

### 1. 內存分析腳本

#### 前端內存分析
```typescript
// scripts/analyzeMemory.ts
export class MemoryAnalyzer {
  static analyzeComponentMemory(componentName: string) {
    const startMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    return {
      componentName,
      startMemory: Math.round(startMemory / 1024 / 1024),
      timestamp: Date.now()
    };
  }

  static generateMemoryReport() {
    const memory = (performance as any).memory;
    if (!memory) return null;

    return {
      usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1024 / 1024),
      totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1024 / 1024),
      jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
      timestamp: Date.now()
    };
  }
}
```

#### 後端內存分析
```javascript
// scripts/analyzeBackendMemory.js
const v8 = require('v8');

class BackendMemoryAnalyzer {
  static analyzeMemory() {
    const memUsage = process.memoryUsage();
    const heapStats = v8.getHeapStatistics();
    
    return {
      processMemory: {
        rss: Math.round(memUsage.rss / 1024 / 1024),
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024)
      },
      v8Heap: {
        totalHeapSize: Math.round(heapStats.total_heap_size / 1024 / 1024),
        totalHeapSizeExecutable: Math.round(heapStats.total_heap_size_executable / 1024 / 1024),
        totalPhysicalSize: Math.round(heapStats.total_physical_size / 1024 / 1024),
        usedHeapSize: Math.round(heapStats.used_heap_size / 1024 / 1024)
      },
      timestamp: Date.now()
    };
  }
}

module.exports = BackendMemoryAnalyzer;
```

### 2. 內存清理工具

#### 自動清理服務
```typescript
// src/services/memoryCleanupService.ts
export class MemoryCleanupService {
  private cleanupTasks: Array<() => void> = [];
  private cleanupInterval: NodeJS.Timeout | null = null;

  registerCleanupTask(task: () => void): void {
    this.cleanupTasks.push(task);
  }

  startAutoCleanup(interval: number = 60000): void {
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, interval);
  }

  private performCleanup(): void {
    console.log('開始執行內存清理...');
    
    // 執行所有清理任務
    this.cleanupTasks.forEach(task => {
      try {
        task();
      } catch (error) {
        console.error('清理任務執行失敗:', error);
      }
    });

    // 強制垃圾回收（僅在開發環境）
    if (process.env.NODE_ENV === 'development') {
      if (global.gc) {
        global.gc();
      }
    }
  }

  stopAutoCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  cleanup(): void {
    this.stopAutoCleanup();
    this.performCleanup();
    this.cleanupTasks = [];
  }
}
```

---

## 🎯 最佳實踐建議

### 1. 開發階段
- **使用 React DevTools Profiler** 分析組件渲染性能
- **使用 Chrome DevTools Memory** 檢測內存洩漏
- **定期運行內存分析腳本** 監控內存使用趨勢
- **使用 TypeScript** 避免類型相關的內存問題

### 2. 生產環境
- **啟用內存監控** 實時監控內存使用情況
- **設置內存警報** 當內存使用超過閾值時發送通知
- **定期清理緩存** 避免緩存數據積累
- **使用 CDN** 減少靜態資源的內存佔用

### 3. 代碼審查
- **檢查事件監聽器** 確保正確清理
- **檢查定時器** 確保在組件卸載時清理
- **檢查閉包** 避免不必要的對象引用
- **檢查異步操作** 確保正確處理 Promise 和 async/await

---

## 📈 性能指標

### 目標指標
- **內存使用增長率** < 5MB/小時
- **組件渲染時間** < 16ms (60fps)
- **圖片加載時間** < 2秒
- **API 響應時間** < 500ms
- **垃圾回收頻率** < 每分鐘1次

### 監控指標
- **堆內存使用量**
- **外部內存使用量**
- **垃圾回收時間**
- **內存洩漏檢測**
- **組件生命週期時間**

---

*本指南提供了完整的內存優化解決方案，幫助確保 CardStrategy 應用的穩定性和性能。*
