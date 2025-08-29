const TestSequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends TestSequencer {
  sort(tests) {
    // 優化的測試排序：優先執行快速測試，後執行慢速測試
    return tests.sort((testA, testB) => {
      const getTestPriority = (test) => {
        const path = test.path.toLowerCase();
        
        // 優先執行單元測試和服務測試（通常較快）
        if (path.includes('unit') || path.includes('service') || path.includes('utils')) {
          return 1;
        }
        
        // 其次執行組件測試
        if (path.includes('component') || path.includes('screen')) {
          return 2;
        }
        
        // 最後執行集成測試和 E2E 測試（通常較慢）
        if (path.includes('integration') || path.includes('e2e')) {
          return 3;
        }
        
        // 其他測試
        return 4;
      };
      
      const priorityA = getTestPriority(testA);
      const priorityB = getTestPriority(testB);
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // 相同優先級內按路徑排序
      return testA.path.localeCompare(testB.path);
    });
  }
}

module.exports = CustomSequencer;
