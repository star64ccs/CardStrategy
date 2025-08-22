const TestSequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends TestSequencer {
  sort(tests) {
    // 按測試類型排序：單元測試 -> 集成測試 -> E2E測試
    return tests.sort((testA, testB) => {
      const getTestType = (test) => {
        if (test.path.includes('unit')) return 1;
        if (test.path.includes('integration')) return 2;
        if (test.path.includes('e2e')) return 3;
        return 4;
      };
      
      return getTestType(testA) - getTestType(testB);
    });
  }
}

module.exports = CustomSequencer;
