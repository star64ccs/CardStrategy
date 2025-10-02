import type {
  RegulationUpdate,
  ComplianceImpact,
} from '../services/regulationUpdateMonitor';
import { RegulationUpdateMonitor } from '../services/regulationUpdateMonitor';

describe('RegulationUpdateMonitor', () => {
  let monitor: RegulationUpdateMonitor;

  beforeEach(() => {
    monitor = RegulationUpdateMonitor.getInstance();
    jest.clearAllMocks();
  });

  describe('getInstance', () => {
    it('應該返回單例實例', () => {
      const instance1 = RegulationUpdateMonitor.getInstance();
      const instance2 = RegulationUpdateMonitor.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('initialize', () => {
    it('應該成功初始化監控器', async () => {
      await monitor.initialize();

      const status = monitor.getMonitoringStatus();
      expect(status.isInitialized).toBe(true);
      expect(status.sourcesCount).toBeGreaterThan(0);
    });

    it('應該不重複初始化', async () => {
      await monitor.initialize();
      await monitor.initialize(); // 第二次調用

      const status = monitor.getMonitoringStatus();
      expect(status.isInitialized).toBe(true);
    });
  });

  describe('startMonitoring', () => {
    beforeEach(async () => {
      await monitor.initialize();
    });

    it('應該成功開始監控', async () => {
      await monitor.startMonitoring();

      const status = monitor.getMonitoringStatus();
      expect(status.isMonitoring).toBe(true);
    });

    it('應該立即執行一次檢查', async () => {
      const checkSpy = jest.spyOn(monitor, 'checkForUpdates');

      await monitor.startMonitoring();

      expect(checkSpy).toHaveBeenCalled();
    });

    it('應該處理監控啟動錯誤', async () => {
      jest
        .spyOn(monitor, 'checkForUpdates')
        .mockRejectedValue(new Error('Network error'));

      await expect(monitor.startMonitoring()).rejects.toThrow('Network error');
    });
  });

  describe('stopMonitoring', () => {
    beforeEach(async () => {
      await monitor.initialize();
      await monitor.startMonitoring();
    });

    it('應該成功停止監控', () => {
      monitor.stopMonitoring();

      const status = monitor.getMonitoringStatus();
      expect(status.isMonitoring).toBe(false);
    });

    it('應該安全地停止未啟動的監控', () => {
      monitor.stopMonitoring(); // 已經停止
      monitor.stopMonitoring(); // 再次停止

      const status = monitor.getMonitoringStatus();
      expect(status.isMonitoring).toBe(false);
    });
  });

  describe('checkForUpdates', () => {
    beforeEach(async () => {
      await monitor.initialize();
    });

    it('應該檢查所有監控源的更新', async () => {
      const updates = await monitor.checkForUpdates();

      expect(Array.isArray(updates)).toBe(true);
      expect(updates.length).toBeGreaterThan(0);
    });

    it('應該處理檢查錯誤', async () => {
      await monitor.initialize(); // 確保已初始化

      // 模擬網絡錯誤
      const originalMethod = (monitor as any).checkSourceForUpdates;
      (monitor as any).checkSourceForUpdates = jest
        .fn()
        .mockRejectedValue(new Error('Network error'));

      const updates = await monitor.checkForUpdates();
      expect(updates).toEqual([]);

      // 恢復原始方法
      (monitor as any).checkSourceForUpdates = originalMethod;
    });

    it('應該記錄檢查時間', async () => {
      await monitor.checkForUpdates();

      const status = monitor.getMonitoringStatus();
      expect(status.lastCheck).toBeInstanceOf(Date);
    });
  });

  describe('manualCheck', () => {
    beforeEach(async () => {
      await monitor.initialize();
    });

    it('應該執行手動檢查', async () => {
      const checkSpy = jest.spyOn(monitor, 'checkForUpdates');

      await monitor.manualCheck();

      expect(checkSpy).toHaveBeenCalled();
    });

    it('應該返回更新結果', async () => {
      const updates = await monitor.manualCheck();

      expect(Array.isArray(updates)).toBe(true);
    });
  });

  describe('getMonitoringStatus', () => {
    it('應該返回正確的監控狀態', () => {
      const status = monitor.getMonitoringStatus();

      expect(status).toHaveProperty('isInitialized');
      expect(status).toHaveProperty('isMonitoring');
      expect(status).toHaveProperty('lastCheck');
      expect(status).toHaveProperty('sourcesCount');
      expect(status).toHaveProperty('sources');
    });

    it('應該反映初始化狀態', async () => {
      // 重置實例狀態
      (monitor as any).isInitialized = false;

      let status = monitor.getMonitoringStatus();
      expect(status.isInitialized).toBe(false);

      await monitor.initialize();

      status = monitor.getMonitoringStatus();
      expect(status.isInitialized).toBe(true);
    });
  });

  describe('GDPR 更新處理', () => {
    beforeEach(async () => {
      await monitor.initialize();
    });

    it('應該檢測到 GDPR 更新', async () => {
      const updates = await monitor.checkForUpdates();
      const gdprUpdates = updates.filter(u => u.regulation === 'GDPR');

      expect(gdprUpdates.length).toBeGreaterThan(0);
    });

    it('應該正確識別 GDPR 受影響模組', async () => {
      const updates = await monitor.checkForUpdates();
      const gdprUpdate = updates.find(u => u.regulation === 'GDPR');

      if (gdprUpdate) {
        expect(gdprUpdate.status).toBe('IN_REVIEW');
        expect(gdprUpdate.priority).toBe('MEDIUM');
      }
    });
  });

  describe('CCPA 更新處理', () => {
    beforeEach(async () => {
      await monitor.initialize();
    });

    it('應該檢測到 CCPA 更新', async () => {
      const updates = await monitor.checkForUpdates();
      const ccpaUpdates = updates.filter(u => u.regulation === 'CCPA');

      expect(ccpaUpdates.length).toBeGreaterThan(0);
    });

    it('應該正確識別 CCPA 受影響模組', async () => {
      const updates = await monitor.checkForUpdates();
      const ccpaUpdate = updates.find(u => u.regulation === 'CCPA');

      if (ccpaUpdate) {
        expect(ccpaUpdate.status).toBe('IN_REVIEW');
        expect(ccpaUpdate.priority).toBe('HIGH');
      }
    });
  });

  describe('合規影響評估', () => {
    let mockUpdate: RegulationUpdate;

    beforeEach(() => {
      mockUpdate = {
        id: 'test-update',
        regulation: 'GDPR',
        jurisdiction: 'EU',
        version: '2.1',
        effectiveDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        changes: [
          {
            type: 'CLARIFICATION',
            section: 'Article 7 - Consent',
            description: 'Test change',
            impact: 'Test impact',
            implementationRequired: true,
            estimatedEffort: 8,
          },
        ],
        priority: 'MEDIUM',
        status: 'PENDING',
      };
    });

    it('應該正確評估 GDPR 影響', async () => {
      const impact = await (monitor as any).assessComplianceImpact(mockUpdate);

      expect(impact.regulationId).toBe(mockUpdate.id);
      expect(impact.impactLevel).toBe(mockUpdate.priority);
      expect(impact.affectedModules).toContain('DataProtectionModule');
      expect(impact.affectedModules).toContain('ConsentManagementModule');
      expect(impact.requiredActions.length).toBeGreaterThan(0);
      expect(impact.estimatedCost).toBeGreaterThan(0);
    });

    it('應該正確評估 CCPA 影響', async () => {
      mockUpdate.regulation = 'CCPA';
      const impact = await (monitor as any).assessComplianceImpact(mockUpdate);

      expect(impact.affectedModules).toContain('DataProtectionModule');
      expect(impact.affectedModules).toContain('ConsumerRightsModule');
    });
  });

  describe('實施計劃生成', () => {
    let mockUpdate: RegulationUpdate;
    let mockImpact: ComplianceImpact;

    beforeEach(() => {
      mockUpdate = {
        id: 'test-update',
        regulation: 'GDPR',
        jurisdiction: 'EU',
        version: '2.1',
        effectiveDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        changes: [
          {
            type: 'CLARIFICATION',
            section: 'Article 7 - Consent',
            description: 'Test change',
            impact: 'Test impact',
            implementationRequired: true,
            estimatedEffort: 8,
          },
        ],
        priority: 'MEDIUM',
        status: 'PENDING',
      };

      mockImpact = {
        regulationId: 'test-update',
        impactLevel: 'MEDIUM',
        affectedModules: ['DataProtectionModule'],
        requiredActions: ['Action 1', 'Action 2'],
        deadline: new Date(),
        estimatedCost: 800,
      };
    });

    it('應該生成完整的實施計劃', async () => {
      const plan = await (monitor as any).generateImplementationPlan(
        mockUpdate,
        mockImpact
      );

      expect(plan.regulationId).toBe(mockUpdate.id);
      expect(plan.timeline).toBeDefined();
      expect(plan.resources).toBeDefined();
      expect(plan.milestones).toBeDefined();
      expect(plan.milestones.length).toBe(4);
    });

    it('應該包含正確的時間線', async () => {
      const plan = await (monitor as any).generateImplementationPlan(
        mockUpdate,
        mockImpact
      );

      expect(plan.timeline.review).toBe(7);
      expect(plan.timeline.implementation).toBeGreaterThan(0);
      expect(plan.timeline.testing).toBe(5);
      expect(plan.timeline.deployment).toBe(2);
    });

    it('應該包含正確的資源分配', async () => {
      const plan = await (monitor as any).generateImplementationPlan(
        mockUpdate,
        mockImpact
      );

      expect(plan.resources.developers).toBeGreaterThan(0);
      expect(plan.resources.testers).toBe(2);
      expect(plan.resources.legalReview).toBe(1);
    });
  });

  describe('通知發送', () => {
    let mockUpdate: RegulationUpdate;
    let mockImpact: ComplianceImpact;
    let mockPlan: unknown;

    beforeEach(() => {
      mockUpdate = {
        id: 'test-update',
        regulation: 'GDPR',
        jurisdiction: 'EU',
        version: '2.1',
        effectiveDate: new Date(),
        changes: [],
        priority: 'MEDIUM',
        status: 'PENDING',
      };

      mockImpact = {
        regulationId: 'test-update',
        impactLevel: 'MEDIUM',
        affectedModules: [],
        requiredActions: [],
        deadline: new Date(),
        estimatedCost: 0,
      };

      mockPlan = {
        regulationId: 'test-update',
        timeline: {},
        resources: {},
        milestones: [],
      };
    });

    it('應該發送通知', async () => {
      await expect(
        (monitor as any).sendNotification(mockUpdate, mockImpact, mockPlan)
      ).resolves.not.toThrow();
    });

    it('應該包含正確的通知內容', async () => {
      const loggerSpy = jest
        .spyOn(require('../../../utils/logger').logger, 'info')
        .mockImplementation();

      await (monitor as any).sendNotification(mockUpdate, mockImpact, mockPlan);

      expect(loggerSpy).toHaveBeenCalledWith(
        'Regulation update notification sent',
        expect.objectContaining({
          type: 'REGULATION_UPDATE',
          priority: 'MEDIUM',
          title: 'New GDPR Update Available',
        })
      );

      loggerSpy.mockRestore();
    });
  });

  describe('錯誤處理', () => {
    beforeEach(async () => {
      await monitor.initialize();
    });

    it('應該處理初始化錯誤', async () => {
      const originalSources = (monitor as any).updateSources;
      (monitor as any).updateSources = null;
      (monitor as any).isInitialized = false;

      try {
        await monitor.initialize();
        fail('應該拋出錯誤');
      } catch (error) {
        expect(error).toBeDefined();
      }

      (monitor as any).updateSources = originalSources;
    });

    it('應該處理監控源檢查錯誤', async () => {
      await monitor.initialize(); // 確保已初始化

      // 模擬 checkSourceForUpdates 拋出錯誤
      const originalMethod = (monitor as any).checkSourceForUpdates;
      (monitor as any).checkSourceForUpdates = jest
        .fn()
        .mockRejectedValue(new Error('Source error'));

      const updates = await monitor.checkForUpdates();
      expect(updates).toEqual([]);

      // 恢復原始方法
      (monitor as any).checkSourceForUpdates = originalMethod;
    });

    it('應該處理影響評估錯誤', async () => {
      await monitor.initialize(); // 確保已初始化

      // 模擬 processUpdates 中的錯誤
      const originalMethod = (monitor as any).processUpdates;
      (monitor as any).processUpdates = jest
        .fn()
        .mockRejectedValue(new Error('Assessment error'));

      await expect(monitor.checkForUpdates()).rejects.toThrow(
        'Assessment error'
      );

      // 恢復原始方法
      (monitor as any).processUpdates = originalMethod;
    });
  });

  describe('性能測試', () => {
    beforeEach(async () => {
      await monitor.initialize();
    });

    it('應該在合理時間內完成檢查', async () => {
      await monitor.initialize(); // 確保已初始化

      const startTime = Date.now();

      await monitor.checkForUpdates();

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(5000); // 5秒內完成
    });

    it('應該支持並發檢查', async () => {
      await monitor.initialize(); // 確保已初始化

      const promises = [
        monitor.checkForUpdates(),
        monitor.checkForUpdates(),
        monitor.checkForUpdates(),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(Array.isArray(result)).toBe(true);
      });
    });
  });
});
