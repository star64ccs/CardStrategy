import {
  crossPlatformOptimizationService,
  CrossPlatformOptimizationService,
} from '../../services/crossPlatformOptimizationService';

describe('CrossPlatformOptimizationService', () => {
  describe('單例模式測試', () => {
    it('應該返回相同的實例', () => {
      const _instance1 = CrossPlatformOptimizationService.getInstance();
      const _instance2 = CrossPlatformOptimizationService.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('代碼共享策略測試', () => {
    it('應該獲取所有代碼共享策略', () => {
      const _strategies = crossPlatformOptimizationService.getStrategies();

      expect(Array.isArray(strategies)).toBe(true);
      expect(strategies.length).toBeGreaterThan(0);

      strategies.forEach(strategy => {
        expect(strategy).toHaveProperty('id');
        expect(strategy).toHaveProperty('name');
        expect(strategy).toHaveProperty('description');
        expect(strategy).toHaveProperty('sharedCodePercentage');
        expect(strategy).toHaveProperty('platformSpecificCodePercentage');
        expect(strategy).toHaveProperty('implementation');
        expect(strategy).toHaveProperty('benefits');
        expect(strategy).toHaveProperty('challenges');

        expect(strategy.sharedCodePercentage).toBeGreaterThan(0);
        expect(strategy.platformSpecificCodePercentage).toBeGreaterThan(0);
        expect(
          strategy.sharedCodePercentage +
            strategy.platformSpecificCodePercentage
        ).toBe(100);
        expect(Array.isArray(strategy.benefits)).toBe(true);
        expect(Array.isArray(strategy.challenges)).toBe(true);
      });
    });

    it('應該包含業務邏輯共享策略', () => {
      const _strategies = crossPlatformOptimizationService.getStrategies();
      const _businessLogicStrategy = strategies.find(
        s => s.name === '業務邏輯共享策略'
      );

      expect(businessLogicStrategy).toBeDefined();
      expect(businessLogicStrategy?.sharedCodePercentage).toBe(70);
      expect(businessLogicStrategy?.platformSpecificCodePercentage).toBe(30);
    });

    it('應該包含組件庫共享策略', () => {
      const _strategies = crossPlatformOptimizationService.getStrategies();
      const _componentLibraryStrategy = strategies.find(
        s => s.name === '組件庫共享策略'
      );

      expect(componentLibraryStrategy).toBeDefined();
      expect(componentLibraryStrategy?.sharedCodePercentage).toBe(60);
      expect(componentLibraryStrategy?.platformSpecificCodePercentage).toBe(40);
    });

    it('應該包含Service層共享策略', () => {
      const _strategies = crossPlatformOptimizationService.getStrategies();
      const _serviceLayerStrategy = strategies.find(
        s => s.name === 'Service層共享策略'
      );

      expect(serviceLayerStrategy).toBeDefined();
      expect(serviceLayerStrategy?.sharedCodePercentage).toBe(80);
      expect(serviceLayerStrategy?.platformSpecificCodePercentage).toBe(20);
    });

    it('應該包含混合共享策略', () => {
      const _strategies = crossPlatformOptimizationService.getStrategies();
      const _hybridStrategy = strategies.find(s => s.name === '混合共享策略');

      expect(hybridStrategy).toBeDefined();
      expect(hybridStrategy?.sharedCodePercentage).toBe(65);
      expect(hybridStrategy?.platformSpecificCodePercentage).toBe(35);
    });
  });

  describe('平台特定功能測試', () => {
    it('應該獲取所有平台特定功能', () => {
      const _features = crossPlatformOptimizationService.getPlatformFeatures();

      expect(Array.isArray(features)).toBe(true);
      expect(features.length).toBeGreaterThan(0);

      features.forEach(feature => {
        expect(feature).toHaveProperty('platform');
        expect(feature).toHaveProperty('feature');
        expect(feature).toHaveProperty('implementation');
        expect(feature).toHaveProperty('sharedCode');
        expect(feature).toHaveProperty('platformSpecificCode');
        expect(feature).toHaveProperty('testStrategy');

        expect(['ios', 'android', 'web']).toContain(feature.platform);
      });
    });

    it('應該按平台過濾功能', () => {
      const _iosFeatures =
        crossPlatformOptimizationService.getPlatformFeatures('ios');
      const _androidFeatures =
        crossPlatformOptimizationService.getPlatformFeatures('android');
      const _webFeatures =
        crossPlatformOptimizationService.getPlatformFeatures('web');

      expect(Array.isArray(iosFeatures)).toBe(true);
      expect(Array.isArray(androidFeatures)).toBe(true);
      expect(Array.isArray(webFeatures)).toBe(true);

      iosFeatures.forEach(feature => {
        expect(feature.platform).toBe('ios');
      });

      androidFeatures.forEach(feature => {
        expect(feature.platform).toBe('android');
      });

      webFeatures.forEach(feature => {
        expect(feature.platform).toBe('web');
      });
    });

    it('應該包含生物識別功能', () => {
      const _features = crossPlatformOptimizationService.getPlatformFeatures();
      const _biometricFeatures = features.filter(
        f => f.feature === '生物識別認證'
      );

      expect(biometricFeatures.length).toBe(3); // iOS, Android, Web
      expect(biometricFeatures.some(f => f.platform === 'ios')).toBe(true);
      expect(biometricFeatures.some(f => f.platform === 'android')).toBe(true);
      expect(biometricFeatures.some(f => f.platform === 'web')).toBe(true);
    });

    it('應該包含推送通知功能', () => {
      const _features = crossPlatformOptimizationService.getPlatformFeatures();
      const _pushNotificationFeatures = features.filter(
        f => f.feature === '推送通知'
      );

      expect(pushNotificationFeatures.length).toBe(3); // iOS, Android, Web
      expect(pushNotificationFeatures.some(f => f.platform === 'ios')).toBe(
        true
      );
      expect(pushNotificationFeatures.some(f => f.platform === 'android')).toBe(
        true
      );
      expect(pushNotificationFeatures.some(f => f.platform === 'web')).toBe(
        true
      );
    });

    it('應該包含文件系統功能', () => {
      const _features = crossPlatformOptimizationService.getPlatformFeatures();
      const _fileSystemFeatures = features.filter(f => f.feature === '文件系統');

      expect(fileSystemFeatures.length).toBe(3); // iOS, Android, Web
      expect(fileSystemFeatures.some(f => f.platform === 'ios')).toBe(true);
      expect(fileSystemFeatures.some(f => f.platform === 'android')).toBe(true);
      expect(fileSystemFeatures.some(f => f.platform === 'web')).toBe(true);
    });
  });

  describe('開發流程測試', () => {
    it('應該獲取所有開發流程', () => {
      const _workflows = crossPlatformOptimizationService.getWorkflows();

      expect(Array.isArray(workflows)).toBe(true);
      expect(workflows.length).toBeGreaterThan(0);

      workflows.forEach(workflow => {
        expect(workflow).toHaveProperty('phase');
        expect(workflow).toHaveProperty('activities');
        expect(workflow).toHaveProperty('deliverables');
        expect(workflow).toHaveProperty('qualityGates');
        expect(workflow).toHaveProperty('estimatedTime');

        expect(Array.isArray(workflow.activities)).toBe(true);
        expect(Array.isArray(workflow.deliverables)).toBe(true);
        expect(Array.isArray(workflow.qualityGates)).toBe(true);
        expect(workflow.estimatedTime).toBeGreaterThan(0);
      });
    });

    it('應該包含需求分析階段', () => {
      const _workflows = crossPlatformOptimizationService.getWorkflows();
      const _requirementAnalysis = workflows.find(w => w.phase === '需求分析');

      expect(requirementAnalysis).toBeDefined();
      expect(requirementAnalysis?.activities).toContain('功能需求分析');
      expect(requirementAnalysis?.activities).toContain('平台特性評估');
      expect(requirementAnalysis?.estimatedTime).toBe(8);
    });

    it('應該包含架構設計階段', () => {
      const _workflows = crossPlatformOptimizationService.getWorkflows();
      const _architectureDesign = workflows.find(w => w.phase === '架構設計');

      expect(architectureDesign).toBeDefined();
      expect(architectureDesign?.activities).toContain('共享層設計');
      expect(architectureDesign?.activities).toContain('平台適配層設計');
      expect(architectureDesign?.estimatedTime).toBe(16);
    });

    it('應該包含代碼實現階段', () => {
      const _workflows = crossPlatformOptimizationService.getWorkflows();
      const _codeImplementation = workflows.find(w => w.phase === '代碼實現');

      expect(codeImplementation).toBeDefined();
      expect(codeImplementation?.activities).toContain('共享代碼開發');
      expect(codeImplementation?.activities).toContain('平台特定代碼開發');
      expect(codeImplementation?.estimatedTime).toBe(40);
    });

    it('應該包含測試驗證階段', () => {
      const _workflows = crossPlatformOptimizationService.getWorkflows();
      const _testVerification = workflows.find(w => w.phase === '測試驗證');

      expect(testVerification).toBeDefined();
      expect(testVerification?.activities).toContain('跨平台功能測試');
      expect(testVerification?.activities).toContain('性能測試');
      expect(testVerification?.estimatedTime).toBe(24);
    });

    it('應該包含部署發布階段', () => {
      const _workflows = crossPlatformOptimizationService.getWorkflows();
      const _deployment = workflows.find(w => w.phase === '部署發布');

      expect(deployment).toBeDefined();
      expect(deployment?.activities).toContain('平台特定打包');
      expect(deployment?.activities).toContain('應用商店提交');
      expect(deployment?.estimatedTime).toBe(12);
    });
  });

  describe('測試策略測試', () => {
    it('應該獲取所有測試策略', () => {
      const _testStrategies =
        crossPlatformOptimizationService.getTestStrategies();

      expect(Array.isArray(testStrategies)).toBe(true);
      expect(testStrategies.length).toBeGreaterThan(0);

      testStrategies.forEach(strategy => {
        expect(strategy).toHaveProperty('strategy');
        expect(strategy).toHaveProperty('platforms');
        expect(strategy).toHaveProperty('testTypes');
        expect(strategy).toHaveProperty('coverage');
        expect(strategy).toHaveProperty('automationLevel');
        expect(strategy).toHaveProperty('implementation');

        expect(Array.isArray(strategy.platforms)).toBe(true);
        expect(Array.isArray(strategy.testTypes)).toBe(true);
        expect(strategy.coverage).toBeGreaterThan(0);
        expect(strategy.coverage).toBeLessThanOrEqual(100);
        expect(['low', 'medium', 'high']).toContain(strategy.automationLevel);
      });
    });

    it('應該包含統一測試框架策略', () => {
      const _testStrategies =
        crossPlatformOptimizationService.getTestStrategies();
      const _unifiedFramework = testStrategies.find(
        s => s.strategy === '統一測試框架'
      );

      expect(unifiedFramework).toBeDefined();
      expect(unifiedFramework?.platforms).toEqual(['ios', 'android', 'web']);
      expect(unifiedFramework?.coverage).toBe(95);
      expect(unifiedFramework?.automationLevel).toBe('high');
    });

    it('應該包含平台特定測試策略', () => {
      const _testStrategies =
        crossPlatformOptimizationService.getTestStrategies();
      const _platformSpecific = testStrategies.find(
        s => s.strategy === '平台特定測試'
      );

      expect(platformSpecific).toBeDefined();
      expect(platformSpecific?.platforms).toEqual(['ios', 'android']);
      expect(platformSpecific?.coverage).toBe(90);
      expect(platformSpecific?.automationLevel).toBe('medium');
    });

    it('應該包含Web特定測試策略', () => {
      const _testStrategies =
        crossPlatformOptimizationService.getTestStrategies();
      const _webSpecific = testStrategies.find(
        s => s.strategy === 'Web 特定測試'
      );

      expect(webSpecific).toBeDefined();
      expect(webSpecific?.platforms).toEqual(['web']);
      expect(webSpecific?.coverage).toBe(85);
      expect(webSpecific?.automationLevel).toBe('high');
    });

    it('應該包含跨平台一致性測試策略', () => {
      const _testStrategies =
        crossPlatformOptimizationService.getTestStrategies();
      const _consistencyTest = testStrategies.find(
        s => s.strategy === '跨平台一致性測試'
      );

      expect(consistencyTest).toBeDefined();
      expect(consistencyTest?.platforms).toEqual(['ios', 'android', 'web']);
      expect(consistencyTest?.coverage).toBe(80);
      expect(consistencyTest?.automationLevel).toBe('medium');
    });
  });

  describe('代碼共享分析測試', () => {
    it('應該分析低共享率情況', () => {
      const _analysis = crossPlatformOptimizationService.analyzeCodeSharing(
        30,
        70
      );

      expect(analysis.totalLines).toBe(100);
      expect(analysis.sharedLines).toBe(30);
      expect(analysis.platformSpecificLines).toBe(70);
      expect(analysis.sharingPercentage).toBe(30);
      expect(analysis.recommendations).toContain('考慮增加業務邏輯共享');
      expect(analysis.recommendations).toContain('評估 UI 組件庫共享可能性');
      expect(analysis.optimizationOpportunities).toContain(
        '識別可共享的平台特定代碼'
      );
    });

    it('應該分析中等共享率情況', () => {
      const _analysis = crossPlatformOptimizationService.analyzeCodeSharing(
        60,
        40
      );

      expect(analysis.totalLines).toBe(100);
      expect(analysis.sharedLines).toBe(60);
      expect(analysis.platformSpecificLines).toBe(40);
      expect(analysis.sharingPercentage).toBe(60);
      expect(analysis.recommendations).toContain('進一步優化共享策略');
      expect(analysis.recommendations).toContain('考慮混合共享策略');
    });

    it('應該分析高共享率情況', () => {
      const _analysis = crossPlatformOptimizationService.analyzeCodeSharing(
        85,
        15
      );

      expect(analysis.totalLines).toBe(100);
      expect(analysis.sharedLines).toBe(85);
      expect(analysis.platformSpecificLines).toBe(15);
      expect(analysis.sharingPercentage).toBe(85);
      expect(analysis.recommendations).toContain('共享率已達優秀水平');
      expect(analysis.recommendations).toContain('關注性能優化');
      expect(analysis.optimizationOpportunities).toContain(
        '評估平台特性利用是否充分'
      );
    });

    it('應該處理零代碼情況', () => {
      const _analysis = crossPlatformOptimizationService.analyzeCodeSharing(
        0,
        0
      );

      expect(analysis.totalLines).toBe(0);
      expect(analysis.sharedLines).toBe(0);
      expect(analysis.platformSpecificLines).toBe(0);
      expect(analysis.sharingPercentage).toBe(0);
    });
  });

  describe('開發效率提升計算測試', () => {
    it('應該計算效率提升', () => {
      const _result =
        crossPlatformOptimizationService.calculateEfficiencyImprovement(50, 70);

      expect(result.improvement).toBe(20);
      expect(result.estimatedTimeSavings).toBe(6); // 20 * 0.3
      expect(result.maintenanceCostReduction).toBe(8); // 20 * 0.4
    });

    it('應該處理負數提升', () => {
      const _result =
        crossPlatformOptimizationService.calculateEfficiencyImprovement(70, 50);

      expect(result.improvement).toBe(-20);
      expect(result.estimatedTimeSavings).toBe(-6);
      expect(result.maintenanceCostReduction).toBe(-8);
    });

    it('應該處理零提升', () => {
      const _result =
        crossPlatformOptimizationService.calculateEfficiencyImprovement(60, 60);

      expect(result.improvement).toBe(0);
      expect(result.estimatedTimeSavings).toBe(0);
      expect(result.maintenanceCostReduction).toBe(0);
    });
  });

  describe('最佳實踐測試', () => {
    it('應該獲取最佳實踐建議', () => {
      const _bestPractices = crossPlatformOptimizationService.getBestPractices();

      expect(Array.isArray(bestPractices)).toBe(true);
      expect(bestPractices.length).toBeGreaterThan(0);

      expect(bestPractices).toContain('使用 TypeScript 確保類型安全');
      expect(bestPractices).toContain('實施依賴注入模式');
      expect(bestPractices).toContain('Create統一的ErrorHandle機制');
      expect(bestPractices).toContain('使用工廠模式處理平台差異');
      expect(bestPractices).toContain('實施策略模式處理平台特定邏輯');
    });
  });

  describe('優化建議測試', () => {
    it('應該生成優化建議', () => {
      const _suggestions =
        crossPlatformOptimizationService.generateOptimizationSuggestions();

      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);

      expect(suggestions).toContain('實施統一的ErrorHandle機制');
      expect(suggestions).toContain('創建平台適配器模式');
      expect(suggestions).toContain('建立共享組件庫');
      expect(suggestions).toContain('實施統一的狀態管理');
      expect(suggestions).toContain('創建平台特定的配置管理');
    });
  });

  describe('開發指南生成測試', () => {
    it('應該生成開發指南', () => {
      const _guide = crossPlatformOptimizationService.generateDevelopmentGuide();

      expect(typeof guide).toBe('string');
      expect(guide.length).toBeGreaterThan(0);

      expect(guide).toContain('# 跨平台開發指南');
      expect(guide).toContain('## 1. 架構原則');
      expect(guide).toContain('## 2. 開發流程');
      expect(guide).toContain('## 3. 測試策略');
      expect(guide).toContain('## 4. 最佳實踐');
      expect(guide).toContain('## 5. 優化建議');
    });

    it('應該包含架構原則', () => {
      const _guide = crossPlatformOptimizationService.generateDevelopmentGuide();

      expect(guide).toContain('業務邏輯共享最大化');
      expect(guide).toContain('UI 層保持平台特定');
      expect(guide).toContain('Service層統一抽象');
      expect(guide).toContain('ErrorHandle標準化');
    });

    it('應該包含開發流程詳情', () => {
      const _guide = crossPlatformOptimizationService.generateDevelopmentGuide();

      expect(guide).toContain('需求分析');
      expect(guide).toContain('架構設計');
      expect(guide).toContain('代碼實現');
      expect(guide).toContain('測試驗證');
      expect(guide).toContain('部署發布');
    });
  });

  describe('完整報告導出測試', () => {
    it('應該導出完整報告', () => {
      const _report = crossPlatformOptimizationService.exportFullReport();

      expect(typeof report).toBe('string');

      const _parsedReport = JSON.parse(report);
      expect(parsedReport).toHaveProperty('timestamp');
      expect(parsedReport).toHaveProperty('strategies');
      expect(parsedReport).toHaveProperty('platformFeatures');
      expect(parsedReport).toHaveProperty('workflows');
      expect(parsedReport).toHaveProperty('testStrategies');
      expect(parsedReport).toHaveProperty('bestPractices');
      expect(parsedReport).toHaveProperty('optimizationSuggestions');
      expect(parsedReport).toHaveProperty('developmentGuide');

      expect(Array.isArray(parsedReport.strategies)).toBe(true);
      expect(Array.isArray(parsedReport.platformFeatures)).toBe(true);
      expect(Array.isArray(parsedReport.workflows)).toBe(true);
      expect(Array.isArray(parsedReport.testStrategies)).toBe(true);
      expect(Array.isArray(parsedReport.bestPractices)).toBe(true);
      expect(Array.isArray(parsedReport.optimizationSuggestions)).toBe(true);
      expect(typeof parsedReport.developmentGuide).toBe('string');
    });
  });

  describe('數據完整性測試', () => {
    it('應該確保所有策略的共享率總和為100%', () => {
      const _strategies = crossPlatformOptimizationService.getStrategies();

      strategies.forEach(strategy => {
        const _total =
          strategy.sharedCodePercentage +
          strategy.platformSpecificCodePercentage;
        expect(total).toBe(100);
      });
    });

    it('應該確保所有平台都有對應的功能', () => {
      const _features = crossPlatformOptimizationService.getPlatformFeatures();
      const _platforms = ['ios', 'android', 'web'];

      platforms.forEach(platform => {
        const _platformFeatures = features.filter(f => f.platform === platform);
        expect(platformFeatures.length).toBeGreaterThan(0);
      });
    });

    it('應該確保所有工作流程都有合理的時間估算', () => {
      const _workflows = crossPlatformOptimizationService.getWorkflows();

      workflows.forEach(workflow => {
        expect(workflow.estimatedTime).toBeGreaterThan(0);
        expect(workflow.estimatedTime).toBeLessThanOrEqual(100); // 合理範圍
      });
    });

    it('應該確保所有測試策略都有合理的覆蓋率', () => {
      const _testStrategies =
        crossPlatformOptimizationService.getTestStrategies();

      testStrategies.forEach(strategy => {
        expect(strategy.coverage).toBeGreaterThan(0);
        expect(strategy.coverage).toBeLessThanOrEqual(100);
      });
    });
  });
});
