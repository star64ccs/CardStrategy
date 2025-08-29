import DashboardService from '../services/dashboardService';
import type { AlertCondition, AlertAction } from '../types/dashboard';
import {
  DashboardConfig,
  DashboardWidget,
  DashboardLayout,
  DashboardTheme,
} from '../types/dashboard';

// Mock dataConverters
const _mockConvertToJSON = jest.fn();
const _mockConvertToCSV = jest.fn();
const _mockConvertToExcel = jest.fn();
const _mockConvertToPDF = jest.fn();

jest.mock('../utils/dataConverters', () => ({
  convertToJSON: mockConvertToJSON,
  convertToCSV: mockConvertToCSV,
  convertToExcel: mockConvertToExcel,
  convertToPDF: mockConvertToPDF,
}));

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(() => {
    // Reset singleton instance
    (DashboardService as any).instance = undefined;

    // Reset mocks
    mockConvertToJSON.mockReset();
    mockConvertToCSV.mockReset();
    mockConvertToExcel.mockReset();
    mockConvertToPDF.mockReset();

    service = DashboardService.getInstance();
  });

  describe('初始化', () => {
    test('應該成功初始化服務', async () => {
      await expect(service.initialize()).resolves.not.toThrow();
    });

    test('應該在未初始化時拋出錯誤', async () => {
      // Reset instance to ensure uninitialized state
      (DashboardService as any).instance = undefined;
      const _uninitializedService = DashboardService.getInstance();

      await expect(uninitializedService.getDashboard('test')).rejects.toThrow(
        'DashboardService not initialized'
      );
    });

    test('重複初始化應該不會拋出錯誤', async () => {
      await service.initialize();
      await expect(service.initialize()).resolves.not.toThrow();
    });
  });

  describe('儀表板管理', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該獲取默認儀表板', async () => {
      const _dashboard = await service.getDashboard('default-dashboard');
      expect(dashboard).toBeDefined();
      expect(dashboard?.name).toBe('默認儀表板');
    });

    test('應該獲取儀表板列表', async () => {
      const _result = await service.getDashboards();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });

    test('應該創建新儀表板', async () => {
      const _newDashboard = await service.createDashboard({
        name: '測試儀表板',
        description: '測試描述',
      });

      expect(newDashboard).toBeDefined();
      expect(newDashboard.name).toBe('測試儀表板');
      expect(newDashboard.description).toBe('測試描述');
    });

    test('應該更新儀表板', async () => {
      const _dashboard = await service.createDashboard({
        name: '原始名稱',
        description: '原始描述',
      });

      const _updatedDashboard = await service.updateDashboard(dashboard.id, {
        name: '更新名稱',
        description: '更新描述',
      });

      expect(updatedDashboard.name).toBe('更新名稱');
      expect(updatedDashboard.description).toBe('更新描述');
    });

    test('應該刪除儀表板', async () => {
      const _dashboard = await service.createDashboard({
        name: '待刪除儀表板',
      });

      await expect(
        service.deleteDashboard(dashboard.id)
      ).resolves.not.toThrow();

      const _deletedDashboard = await service.getDashboard(dashboard.id);
      expect(deletedDashboard).toBeNull();
    });

    test('應該過濾儀表板列表', async () => {
      await service.createDashboard({ name: '測試儀表板1' });
      await service.createDashboard({ name: '測試儀表板2' });

      const _result = await service.getDashboards({ search: '測試儀表板1' });
      expect(result.data?.length).toBe(1);
      expect(result.data?.[0].name).toBe('測試儀表板1');
    });
  });

  describe('數據管理', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該獲取儀表板數據', async () => {
      const _data = await service.getDashboardData('default-dashboard');
      expect(Array.isArray(data)).toBe(true);
    });

    test('應該刷新儀表板數據', async () => {
      await expect(
        service.refreshDashboardData('default-dashboard')
      ).resolves.not.toThrow();
    });

    test('應該獲取特定組件數據', async () => {
      const _data = await service.getDashboardData(
        'default-dashboard',
        'widget-1'
      );
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('導出功能', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該導出儀表板為 PDF', async () => {
      const _exportResult = await service.exportDashboard(
        'default-dashboard',
        'pdf'
      );
      expect(exportResult).toBeDefined();
      expect(exportResult.format).toBe('pdf');
      expect(exportResult.status).toBe('processing');
    });

    test('應該導出儀表板為 PNG', async () => {
      const _exportResult = await service.exportDashboard(
        'default-dashboard',
        'png'
      );
      expect(exportResult).toBeDefined();
      expect(exportResult.format).toBe('png');
    });

    test('應該導出儀表板為 HTML', async () => {
      const _exportResult = await service.exportDashboard(
        'default-dashboard',
        'html'
      );
      expect(exportResult).toBeDefined();
      expect(exportResult.format).toBe('html');
    });
  });

  describe('警報管理', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該創建警報', async () => {
      const condition: AlertCondition = {
        metric: 'totalUsers',
        operator: 'gt',
        value: 1000,
        timeWindow: 5,
        frequency: 1,
      };

      const action: AlertAction = {
        type: 'notification',
        target: 'user@example.com',
        message: '用戶數量超過閾值',
        enabled: true,
      };

      const _alert = await service.createAlert(
        'default-dashboard',
        condition,
        action
      );
      expect(alert).toBeDefined();
      expect(alert.condition).toEqual(condition);
      expect(alert.action).toEqual(action);
      expect(alert.isActive).toBe(true);
    });

    test('應該更新警報', async () => {
      const condition: AlertCondition = {
        metric: 'totalUsers',
        operator: 'gt',
        value: 1000,
        timeWindow: 5,
        frequency: 1,
      };

      const action: AlertAction = {
        type: 'notification',
        target: 'user@example.com',
        message: '用戶數量超過閾值',
        enabled: true,
      };

      const _alert = await service.createAlert(
        'default-dashboard',
        condition,
        action
      );

      const _updatedAlert = await service.updateAlert(alert.id, {
        isActive: false,
      });
      expect(updatedAlert.isActive).toBe(false);
    });

    test('應該刪除警報', async () => {
      const condition: AlertCondition = {
        metric: 'totalUsers',
        operator: 'gt',
        value: 1000,
        timeWindow: 5,
        frequency: 1,
      };

      const action: AlertAction = {
        type: 'notification',
        target: 'user@example.com',
        message: '用戶數量超過閾值',
        enabled: true,
      };

      const _alert = await service.createAlert(
        'default-dashboard',
        condition,
        action
      );

      await expect(service.deleteAlert(alert.id)).resolves.not.toThrow();

      const _alerts = await service.getAlerts();
      const _deletedAlert = alerts.find(a => a.id === alert.id);
      expect(deletedAlert).toBeUndefined();
    });

    test('應該獲取警報列表', async () => {
      const _alerts = await service.getAlerts();
      expect(Array.isArray(alerts)).toBe(true);
    });

    test('應該獲取特定儀表板的警報', async () => {
      const _alerts = await service.getAlerts('default-dashboard');
      expect(Array.isArray(alerts)).toBe(true);
    });
  });

  describe('模板管理', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該獲取模板列表', async () => {
      const _templates = await service.getTemplates();
      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThan(0);
    });

    test('應該按分類獲取模板', async () => {
      const _businessTemplates = await service.getTemplates('business');
      expect(Array.isArray(businessTemplates)).toBe(true);
    });
  });

  describe('分析功能', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該獲取儀表板分析', async () => {
      const _analytics = await service.getAnalytics('default-dashboard');
      expect(analytics).toBeDefined();
    });

    test('應該更新儀表板分析', async () => {
      const _analytics = await service.updateAnalytics('default-dashboard', {
        views: 100,
        uniqueViews: 80,
      });
      expect(analytics.views).toBe(100);
      expect(analytics.uniqueViews).toBe(80);
    });

    test('應該獲取性能指標', async () => {
      const _metrics = await service.getPerformanceMetrics('default-dashboard');
      expect(metrics).toBeDefined();
    });
  });

  describe('配置管理', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該獲取配置', async () => {
      const _config = await service.getConfig();
      expect(config).toBeDefined();
      expect(config.defaultRefreshInterval).toBeDefined();
      expect(config.maxWidgetsPerDashboard).toBeDefined();
    });

    test('應該更新配置', async () => {
      const _newConfig = {
        defaultRefreshInterval: 600,
        maxWidgetsPerDashboard: 100,
      };

      await expect(service.updateConfig(newConfig)).resolves.not.toThrow();
    });
  });

  describe('事件監聽', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該添加事件監聽器', async () => {
      const _mockCallback = jest.fn();
      await service.addEventListener('dashboardCreated', mockCallback);

      await service.createDashboard({ name: '測試儀表板' });

      // 由於事件是異步的，我們需要等待一下
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockCallback).toHaveBeenCalled();
    });

    test('應該移除事件監聽器', async () => {
      const _mockCallback = jest.fn();
      await service.addEventListener('dashboardCreated', mockCallback);
      await service.removeEventListener('dashboardCreated', mockCallback);

      await service.createDashboard({ name: '測試儀表板' });

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe('錯誤處理', () => {
    test('應該處理不存在的儀表板', async () => {
      await service.initialize();

      await expect(service.getDashboard('non-existent')).resolves.toBeNull();
    });

    test('應該處理刪除不存在的儀表板', async () => {
      await service.initialize();

      await expect(service.deleteDashboard('non-existent')).rejects.toThrow(
        'Dashboard not found'
      );
    });

    test('應該處理更新不存在的儀表板', async () => {
      await service.initialize();

      await expect(
        service.updateDashboard('non-existent', { name: '新名稱' })
      ).rejects.toThrow('Dashboard not found');
    });

    test('應該處理刪除不存在的警報', async () => {
      await service.initialize();

      await expect(service.deleteAlert('non-existent')).rejects.toThrow(
        'Alert not found'
      );
    });

    test('應該處理更新不存在的警報', async () => {
      await service.initialize();

      await expect(
        service.updateAlert('non-existent', { isActive: false })
      ).rejects.toThrow('Alert not found');
    });
  });

  describe('數據驗證', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該驗證儀表板數據結構', async () => {
      const _dashboard = await service.getDashboard('default-dashboard');
      expect(dashboard).toHaveProperty('id');
      expect(dashboard).toHaveProperty('name');
      expect(dashboard).toHaveProperty('layouts');
      expect(dashboard).toHaveProperty('dataSources');
      expect(dashboard).toHaveProperty('theme');
    });

    test('應該驗證組件數據結構', async () => {
      const _dashboard = await service.getDashboard('default-dashboard');
      const _widgets = dashboard?.layouts[0]?.widgets || [];

      if (widgets.length > 0) {
        const _widget = widgets[0];
        expect(widget).toHaveProperty('id');
        expect(widget).toHaveProperty('type');
        expect(widget).toHaveProperty('title');
        expect(widget).toHaveProperty('dataSource');
        expect(widget).toHaveProperty('config');
        expect(widget).toHaveProperty('position');
        expect(widget).toHaveProperty('size');
      }
    });

    test('應該驗證主題數據結構', async () => {
      const _dashboard = await service.getDashboard('default-dashboard');
      const _theme = dashboard?.theme;

      expect(theme).toHaveProperty('primaryColor');
      expect(theme).toHaveProperty('secondaryColor');
      expect(theme).toHaveProperty('backgroundColor');
      expect(theme).toHaveProperty('textColor');
      expect(theme).toHaveProperty('chartColors');
      expect(theme).toHaveProperty('fontFamily');
      expect(theme).toHaveProperty('fontSize');
    });
  });
});
