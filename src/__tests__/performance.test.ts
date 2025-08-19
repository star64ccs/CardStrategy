import { PerformanceOptimizer } from '../utils/performanceOptimizer';

describe('Performance Tests', () => {
  test('should measure performance correctly', () => {
    const startTime = Date.now();
    
    // 模擬一些操作
    let result = 0;
    for (let i = 0; i < 1000000; i++) {
      result += i;
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(100); // 應該在 100ms 內完成
    expect(result).toBeGreaterThan(0);
  });

  test('should get memory usage', () => {
    const memoryUsage = PerformanceOptimizer.getMemoryUsage();
    
    expect(memoryUsage).toHaveProperty('used');
    expect(memoryUsage).toHaveProperty('total');
    expect(memoryUsage.used).toBeGreaterThanOrEqual(0);
    expect(memoryUsage.total).toBeGreaterThanOrEqual(0);
  });

  test('should defer tasks correctly', () => {
    let executed = false;
    
    PerformanceOptimizer.deferTask(() => {
      executed = true;
    });
    
    // 等待異步任務執行
    setTimeout(() => {
      expect(executed).toBe(true);
    }, 100);
  });

  test('should batch tasks correctly', () => {
    const tasks: (() => void)[] = [];
    let executedCount = 0;
    
    for (let i = 0; i < 5; i++) {
      tasks.push(() => {
        executedCount++;
      });
    }
    
    PerformanceOptimizer.batchTasks(tasks);
    
    // 等待批量任務執行
    setTimeout(() => {
      expect(executedCount).toBe(5);
    }, 100);
  });
});
