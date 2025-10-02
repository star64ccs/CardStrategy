// 圖表服務測試
import ChartService from '../services/chartService';
import type { ChartCreateRequest } from '../types/chart';
import { ChartType, ChartConfig, ChartData } from '../types/chart';

// Mock dataConverters
const mockConvertToJSON = jest.fn();
const mockConvertToCSV = jest.fn();
const mockConvertToExcel = jest.fn();
const mockConvertToPDF = jest.fn();

jest.mock('../utils/dataConverters', () => ({
  convertToJSON: mockConvertToJSON,
  convertToCSV: mockConvertToCSV,
  convertToExcel: mockConvertToExcel,
  convertToPDF: mockConvertToPDF,
}));

describe('ChartService', () => {
  let chartService: ChartService;

  beforeEach(() => {
    // 重置 singleton 實例
    (ChartService as any).instance = undefined;
    chartService = ChartService.getInstance();

    // 重置 mocks
    mockConvertToJSON.mockReset();
    mockConvertToCSV.mockReset();
    mockConvertToExcel.mockReset();
    mockConvertToPDF.mockReset();
  });

  describe('Singleton Pattern', () => {
    test('應該返回相同的實例', () => {
      const instance1 = ChartService.getInstance();
      const instance2 = ChartService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('initialize', () => {
    test('應該成功初始化服務', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await expect(chartService.initialize()).resolves.not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith('ChartService: 初始化圖表服務');
      expect(consoleSpy).toHaveBeenCalledWith('ChartService: 加載模板完成');
      expect(consoleSpy).toHaveBeenCalledWith('ChartService: 加載插件完成');
      expect(consoleSpy).toHaveBeenCalledWith('ChartService: 加載緩存完成');

      consoleSpy.mockRestore();
    });
  });

  describe('createChart', () => {
    const mockRequest: ChartCreateRequest = {
      config: {
        type: ChartType.LINE,
        title: '測試圖表',
        responsive: true,
        animation: true,
      },
      data: {
        labels: ['1月', '2月', '3月'],
        datasets: [
          {
            label: '銷售額',
            data: [
              { label: '1月', value: 100 },
              { label: '2月', value: 120 },
              { label: '3月', value: 90 },
            ],
          },
        ],
      },
    };

    test('應該成功創建圖表', async () => {
      const response = await chartService.createChart(mockRequest);

      expect(response.success).toBe(true);
      expect(response.chart).toBeDefined();
      expect(response.chart?.config.type).toBe(ChartType.LINE);
      expect(response.chart?.config.title).toBe('測試圖表');
      expect(response.chart?.status).toBe('rendered');
      expect(response.message).toBe('圖表創建成功');
    });

    test('應該驗證圖表配置', async () => {
      const invalidRequest = {
        ...mockRequest,
        config: { ...mockRequest.config, type: 'invalid_type' as ChartType },
      };

      const response = await chartService.createChart(invalidRequest);

      expect(response.success).toBe(false);
      expect(response.error).toContain('不支持的圖表類型');
    });

    test('應該驗證圖表數據', async () => {
      const invalidRequest = {
        ...mockRequest,
        data: { labels: [], datasets: [] },
      };

      const response = await chartService.createChart(invalidRequest);

      expect(response.success).toBe(false);
      expect(response.error).toContain('圖表標籤不能為空');
    });

    test('應該應用模板', async () => {
      const requestWithTemplate = {
        ...mockRequest,
        templateId: 'line-chart-template',
      };

      const response = await chartService.createChart(requestWithTemplate);

      expect(response.success).toBe(true);
      expect(response.chart).toBeDefined();
    });
  });

  describe('getChart', () => {
    test('應該成功獲取圖表', async () => {
      // 先創建一個圖表
      const createRequest: ChartCreateRequest = {
        config: {
          type: ChartType.LINE,
          title: '測試圖表',
          responsive: true,
        },
        data: {
          labels: ['1月', '2月'],
          datasets: [
            {
              label: '銷售額',
              data: [
                { label: '1月', value: 100 },
                { label: '2月', value: 120 },
              ],
            },
          ],
        },
      };

      const createResponse = await chartService.createChart(createRequest);
      expect(createResponse.success).toBe(true);

      // 獲取圖表
      const getResponse = await chartService.getChart(createResponse.chart.id);

      expect(getResponse.success).toBe(true);
      expect(getResponse.chart).toBeDefined();
      expect(getResponse.chart?.id).toBe(createResponse.chart.id);
    });

    test('應該處理不存在的圖表', async () => {
      const response = await chartService.getChart('non-existent-id');

      expect(response.success).toBe(false);
      expect(response.error).toBe('圖表不存在');
    });
  });

  describe('getCharts', () => {
    beforeEach(async () => {
      // 創建一些測試圖表
      const requests: ChartCreateRequest[] = [
        {
          config: { type: ChartType.LINE, title: '線圖1' },
          data: {
            labels: ['1月', '2月'],
            datasets: [
              {
                label: '數據1',
                data: [
                  { label: '1月', value: 100 },
                  { label: '2月', value: 120 },
                ],
              },
            ],
          },
        },
        {
          config: { type: ChartType.BAR, title: '柱狀圖1' },
          data: {
            labels: ['1月', '2月'],
            datasets: [
              {
                label: '數據2',
                data: [
                  { label: '1月', value: 80 },
                  { label: '2月', value: 90 },
                ],
              },
            ],
          },
        },
      ];

      for (const request of requests) {
        await chartService.createChart(request);
      }
    });

    test('應該獲取所有圖表', async () => {
      const response = await chartService.getCharts();

      expect(response.success).toBe(true);
      expect(response.charts.length).toBeGreaterThanOrEqual(2);
      expect(response.total).toBeGreaterThanOrEqual(2);
    });

    test('應該按類型過濾圖表', async () => {
      const response = await chartService.getCharts({ type: ChartType.LINE });

      expect(response.success).toBe(true);
      expect(
        response.charts.every(chart => chart.config.type === ChartType.LINE)
      ).toBe(true);
    });

    test('應該按類別過濾圖表', async () => {
      const response = await chartService.getCharts({ category: '線圖' });

      expect(response.success).toBe(true);
      expect(
        response.charts.every(chart => chart.config.title?.includes('線圖'))
      ).toBe(true);
    });
  });

  describe('updateChart', () => {
    test('應該成功更新圖表', async () => {
      // 先創建一個圖表
      const createRequest: ChartCreateRequest = {
        config: {
          type: ChartType.LINE,
          title: '原始標題',
          responsive: true,
        },
        data: {
          labels: ['1月', '2月'],
          datasets: [
            {
              label: '銷售額',
              data: [
                { label: '1月', value: 100 },
                { label: '2月', value: 120 },
              ],
            },
          ],
        },
      };

      const createResponse = await chartService.createChart(createRequest);
      expect(createResponse.success).toBe(true);

      // 更新圖表
      const updateResponse = await chartService.updateChart(
        createResponse.chart.id,
        {
          config: { title: '更新後的標題' },
        }
      );

      expect(updateResponse.success).toBe(true);
      expect(updateResponse.chart?.config.title).toBe('更新後的標題');
      expect(updateResponse.message).toBe('圖表更新成功');
    });

    test('應該處理不存在的圖表', async () => {
      const response = await chartService.updateChart('non-existent-id', {
        config: { title: '新標題' },
      });

      expect(response.success).toBe(false);
      expect(response.error).toBe('圖表不存在');
    });
  });

  describe('deleteChart', () => {
    test('應該成功刪除圖表', async () => {
      // 先創建一個圖表
      const createRequest: ChartCreateRequest = {
        config: {
          type: ChartType.LINE,
          title: '要刪除的圖表',
          responsive: true,
        },
        data: {
          labels: ['1月', '2月'],
          datasets: [
            {
              label: '銷售額',
              data: [
                { label: '1月', value: 100 },
                { label: '2月', value: 120 },
              ],
            },
          ],
        },
      };

      const createResponse = await chartService.createChart(createRequest);
      expect(createResponse.success).toBe(true);

      // 刪除圖表
      const deleteResponse = await chartService.deleteChart(
        createResponse.chart.id
      );

      expect(deleteResponse.success).toBe(true);
      expect(deleteResponse.message).toBe('圖表刪除成功');

      // 驗證圖表已被刪除
      const getResponse = await chartService.getChart(createResponse.chart.id);
      expect(getResponse.success).toBe(false);
    });

    test('應該處理不存在的圖表', async () => {
      const response = await chartService.deleteChart('non-existent-id');

      expect(response.success).toBe(false);
      expect(response.error).toBe('圖表不存在');
    });
  });

  describe('exportChart', () => {
    test('應該成功導出圖表', async () => {
      // 先創建一個圖表
      const createRequest: ChartCreateRequest = {
        config: {
          type: ChartType.LINE,
          title: '要導出的圖表',
          responsive: true,
          export: {
            enabled: true,
            formats: ['png', 'jpg', 'svg', 'pdf'],
            quality: 0.9,
          },
        },
        data: {
          labels: ['1月', '2月'],
          datasets: [
            {
              label: '銷售額',
              data: [
                { label: '1月', value: 100 },
                { label: '2月', value: 120 },
              ],
            },
          ],
        },
      };

      const createResponse = await chartService.createChart(createRequest);
      expect(createResponse.success).toBe(true);

      // 導出圖表
      const exportResponse = await chartService.exportChart(
        createResponse.chart.id,
        'png'
      );

      expect(exportResponse.success).toBe(true);
      expect(exportResponse.message).toContain('圖表導出成功');
    });

    test('應該處理未啟用導出的圖表', async () => {
      // 創建一個未啟用導出的圖表
      const createRequest: ChartCreateRequest = {
        config: {
          type: ChartType.LINE,
          title: '未啟用導出的圖表',
          responsive: true,
          export: {
            enabled: false,
            formats: ['png'],
            quality: 0.9,
          },
        },
        data: {
          labels: ['1月', '2月'],
          datasets: [
            {
              label: '銷售額',
              data: [
                { label: '1月', value: 100 },
                { label: '2月', value: 120 },
              ],
            },
          ],
        },
      };

      const createResponse = await chartService.createChart(createRequest);
      expect(createResponse.success).toBe(true);

      // 嘗試導出
      const exportResponse = await chartService.exportChart(
        createResponse.chart.id,
        'png'
      );

      expect(exportResponse.success).toBe(false);
      expect(exportResponse.error).toBe('圖表導出功能未啟用');
    });

    test('應該處理不支持的格式', async () => {
      // 先創建一個圖表
      const createRequest: ChartCreateRequest = {
        config: {
          type: ChartType.LINE,
          title: '測試圖表',
          responsive: true,
          export: {
            enabled: true,
            formats: ['png'],
            quality: 0.9,
          },
        },
        data: {
          labels: ['1月', '2月'],
          datasets: [
            {
              label: '銷售額',
              data: [
                { label: '1月', value: 100 },
                { label: '2月', value: 120 },
              ],
            },
          ],
        },
      };

      const createResponse = await chartService.createChart(createRequest);
      expect(createResponse.success).toBe(true);

      // 嘗試導出不支持的格式
      const exportResponse = await chartService.exportChart(
        createResponse.chart.id,
        'pdf'
      );

      expect(exportResponse.success).toBe(false);
      expect(exportResponse.error).toContain('不支持的導出格式');
    });
  });

  describe('getTemplates', () => {
    test('應該返回模板列表', async () => {
      const templates = await chartService.getTemplates();

      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThan(0);

      // 檢查模板結構
      const template = templates[0];
      expect(template).toHaveProperty('id');
      expect(template).toHaveProperty('name');
      expect(template).toHaveProperty('description');
      expect(template).toHaveProperty('type');
      expect(template).toHaveProperty('config');
    });
  });

  describe('getAnalytics', () => {
    test('應該返回分析數據', async () => {
      // 先創建一個圖表
      const createRequest: ChartCreateRequest = {
        config: {
          type: ChartType.LINE,
          title: '分析測試圖表',
          responsive: true,
        },
        data: {
          labels: ['1月', '2月'],
          datasets: [
            {
              label: '銷售額',
              data: [
                { label: '1月', value: 100 },
                { label: '2月', value: 120 },
              ],
            },
          ],
        },
      };

      const createResponse = await chartService.createChart(createRequest);
      expect(createResponse.success).toBe(true);

      // 獲取分析數據
      const analytics = await chartService.getAnalytics(
        createResponse.chart.id
      );

      expect(analytics).toBeDefined();
      if (analytics) {
        expect(analytics.chartId).toBe(createResponse.chart.id);
        expect(analytics.views).toBeGreaterThanOrEqual(0);
        expect(analytics.exports).toBeGreaterThanOrEqual(0);
      }
    });

    test('應該處理不存在的圖表分析', async () => {
      const analytics = await chartService.getAnalytics('non-existent-id');
      expect(analytics).toBeNull();
    });
  });

  describe('getStatistics', () => {
    test('應該返回統計數據', async () => {
      const statistics = await chartService.getStatistics();

      expect(statistics).toBeDefined();
      expect(statistics).toHaveProperty('totalCharts');
      expect(statistics).toHaveProperty('chartsByType');
      expect(statistics).toHaveProperty('chartsByCategory');
      expect(statistics).toHaveProperty('averageRenderTime');
      expect(statistics).toHaveProperty('totalViews');
      expect(statistics).toHaveProperty('totalExports');
      expect(statistics).toHaveProperty('popularTemplates');
      expect(statistics).toHaveProperty('recentActivity');
      expect(statistics).toHaveProperty('performanceTrends');
    });
  });

  describe('Event System', () => {
    test('應該支持事件監聽', () => {
      const mockCallback = jest.fn();

      chartService.addEventListener('test_event', mockCallback);
      chartService.emitEvent('test_event', { data: 'test' });

      expect(mockCallback).toHaveBeenCalledWith({ data: 'test' });
    });

    test('應該支持移除事件監聽器', () => {
      const mockCallback = jest.fn();

      chartService.addEventListener('test_event', mockCallback);
      chartService.removeEventListener('test_event', mockCallback);
      chartService.emitEvent('test_event', { data: 'test' });

      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe('Configuration', () => {
    test('應該返回配置', () => {
      const config = chartService.getConfig();

      expect(config).toBeDefined();
      expect(config).toHaveProperty('maxCharts');
      expect(config).toHaveProperty('cacheSize');
      expect(config).toHaveProperty('defaultTheme');
      expect(config).toHaveProperty('performanceMonitoring');
      expect(config).toHaveProperty('autoExport');
    });

    test('應該支持更新配置', () => {
      const originalConfig = chartService.getConfig();
      const newConfig = { maxCharts: 200 };

      chartService.updateConfig(newConfig);
      const updatedConfig = chartService.getConfig();

      expect(updatedConfig.maxCharts).toBe(200);
      expect(updatedConfig.cacheSize).toBe(originalConfig.cacheSize); // 其他配置保持不變
    });
  });

  describe('Error Handling', () => {
    test('應該處理渲染錯誤', async () => {
      // 創建一個會導致渲染錯誤的圖表
      const createRequest: ChartCreateRequest = {
        config: {
          type: ChartType.LINE,
          title: '錯誤測試圖表',
          responsive: true,
        },
        data: {
          labels: ['1月', '2月'],
          datasets: [
            {
              label: '銷售額',
              data: [
                { label: '1月', value: 100 },
                { label: '2月', value: 120 },
              ],
            },
          ],
        },
      };

      // 模擬渲染錯誤
      jest
        .spyOn(chartService as any, 'renderChart')
        .mockRejectedValueOnce(new Error('渲染失敗'));

      const response = await chartService.createChart(createRequest);

      expect(response.success).toBe(false);
      expect(response.error).toContain('渲染失敗');
    });
  });
});
