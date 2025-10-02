const TestSequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends TestSequencer {
  sort(tests) {
    // 優化的TestSort：優先執Row快速Test，後執Row慢速Test
    return tests.sort((testA, testB) => {
      const getTestPriority = (test) => {
        const path = test.path.toLowerCase();
        
        // 優先執Row單元Test和ServiceTest（通常較快）
        if (path.includes('unit') || path.includes('service') || path.includes('utils')) {
          return 1;
        }
        
        // 其次執RowComponentTest
        if (path.includes('component') || path.includes('screen')) {
          return 2;
        }
        
        // 最後執Row集成Test和 E2E Test（通常較慢）
        if (path.includes('integration') || path.includes('e2e')) {
          return 3;
        }
        
        // 其他Test
        return 4;
      };
      
      const priorityA = getTestPriority(testA);
      const priorityB = getTestPriority(testB);
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // 相同優先級內按PathSort
      return testA.path.localeCompare(testB.path);
    });
  }
}

module.exports = CustomSequencer;
