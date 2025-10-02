// GraphTableServiceTest
import ChartService from '../services/chartService';
import type { ChartCreateRequest } from '../types/chart';
import { ChartType, ChartConfig, ChartData } from '../types/chart';

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

describe('ChartService', () => {
  let chartService: ChartService;

  beforeEach(() => {
    // Reset singleton Instance
    (ChartService as any).instance = undefined;
    chartService = ChartService.getInstance();

    // Reset mocks
    mockConvertToJSON.mockReset();
    mockConvertToCSV.mockReset();
    mockConvertToExcel.mockReset();
    mockConvertToPDF.mockReset();
  });

  describe('Singleton Pattern', () => {
    test('應該返回相同的實例', () => {
      const _instance1 = ChartService.getInstance();
      const _instance2 = ChartService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('initialize', () => {
    test('應該SuccessInitializeService', async () => {
      const _consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await expect(chartService.initialize()).resolves.not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith('ChartService: Initialize圖表Service');
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

    test('應該SuccessCreate圖表', async () => {
      const _response = await chartService.createChart(mockRequest);

      expect(response.success).toBe(true);
      expect(response.chart).toBeDefined();
      expect(response.chart?.config.type).toBe(ChartType.LINE);
      expect(response.chart?.config.title).toBe('測試圖表');
      expect(response.chart?.status).toBe('rendered');
      expect(response.message).toBe('圖表CreateSuccess');
    });

    test('應該驗證圖表配置', async () => {
      const _invalidRequest = {
        ...mockRequest,
        config: { ...mockRequest.config, type: 'invalid_type' as ChartType },
      };

      const _response = await chartService.createChart(invalidRequest);

      expect(response.success).toBe(false);
      expect(response.error).toContain('不支持的圖表類型');
    });

    test('應該驗證圖表數據', async () => {
      const _invalidRequest = {
        ...mockRequest,
        data: { labels: [], datasets: [] },
      };

      const _response = await chartService.createChart(invalidRequest);

      expect(response.success).toBe(false);
      expect(response.error).toContain('圖表標籤不能為空');
    });

    test('應該應用模板', async () => {
      const _requestWithTemplate = {
        ...mockRequest,
        templateId: 'line-chart-template',
      };

      const _response = await chartService.createChart(requestWithTemplate);

      expect(response.success).toBe(true);
      expect(response.chart).toBeDefined();
    });
  });

  describe('getChart', () => {
    test('應該SuccessGet圖表', async () => {
      // 先Create一個GraphTable
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

      const _createResponse = await chartService.createChart(createRequest);
      expect(createResponse.success).toBe(true);

      // GetGraphTable
      const _getResponse = await chartService.getChart(createResponse.chart.id);

      expect(getResponse.success).toBe(true);
      expect(getResponse.chart).toBeDefined();
      expect(getResponse.chart?.id).toBe(createResponse.chart.id);
    });

    test('應該處理不存在的圖表', async () => {
      const _response = await chartService.getChart('non-existent-id');

      expect(response.success).toBe(false);
      expect(response.error).toBe('圖表不存在');
    });
  });

  describe('getCharts', () => {
    beforeEach(async () => {
      // Create一些TestGraphTable
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
      const _response = await chartService.getCharts();

      expect(response.success).toBe(true);
      expect(response.charts.length).toBeGreaterThanOrEqual(2);
      expect(response.total).toBeGreaterThanOrEqual(2);
    });

    test('應該按類型過濾圖表', async () => {
      const _response = await chartService.getCharts({ type: ChartType.LINE });

      expect(response.success).toBe(true);
      expect(
        response.charts.every(chart => chart.config.type === ChartType.LINE)
      ).toBe(true);
    });

    test('應該按類別過濾圖表', async () => {
      const _response = await chartService.getCharts({ category: '線圖' });

      expect(response.success).toBe(true);
      expect(
        response.charts.every(chart => chart.config.title?.includes('線圖'))
      ).toBe(true);
    });
  });

  describe('updateChart', () => {
    test('應該SuccessUpdate圖表', async () => {
      // 先Create一個GraphTable
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

      const _createResponse = await chartService.createChart(createRequest);
      expect(createResponse.success).toBe(true);

      // UpdateGraphTable
      const _updateResponse = await chartService.updateChart(
        createResponse.chart.id,
        {
          config: { title: '更新後的標題' },
        }
      );

      expect(updateResponse.success).toBe(true);
      expect(updateResponse.chart?.config.title).toBe('更新後的標題');
      expect(updateResponse.message).toBe('圖表UpdateSuccess');
    });

    test('應該處理不存在的圖表', async () => {
      const _response = await chartService.updateChart('non-existent-id', {
        config: { title: '新標題' },
      });

      expect(response.success).toBe(false);
      expect(response.error).toBe('圖表不存在');
    });
  });

  describe('deleteChart', () => {
    test('應該SuccessDelete圖表', async () => {
      // 先Create一個GraphTable
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

      const _createResponse = await chartService.createChart(createRequest);
      expect(createResponse.success).toBe(true);

      // DeleteGraphTable
      const _deleteResponse = await chartService.deleteChart(
        createResponse.chart.id
      );

      expect(deleteResponse.success).toBe(true);
      expect(deleteResponse.message).toBe('圖表DeleteSuccess');

      // VerifyGraphTable已被Delete
      const _getResponse = await chartService.getChart(createResponse.chart.id);
      expect(getResponse.success).toBe(false);
    });

    test('應該處理不存在的圖表', async () => {
      const _response = await chartService.deleteChart('non-existent-id');

      expect(response.success).toBe(false);
      expect(response.error).toBe('圖表不存在');
    });
  });

  describe('exportChart', () => {
    test('應該Success導出圖表', async () => {
      // 先Create一個GraphTable
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

      const _createResponse = await chartService.createChart(createRequest);
      expect(createResponse.success).toBe(true);

      // ExportGraphTable
      const _exportResponse = await chartService.exportChart(
        createResponse.chart.id,
        'png'
      );

      expect(exportResponse.success).toBe(true);
      expect(exportResponse.message).toContain('圖表導出Success');
    });

    test('應該處理未啟用導出的圖表', async () => {
      // Create一個未EnableExport的GraphTable
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

      const _createResponse = await chartService.createChart(createRequest);
      expect(createResponse.success).toBe(true);

      // 嘗試Export
      const _exportResponse = await chartService.exportChart(
        createResponse.chart.id,
        'png'
      );

      expect(exportResponse.success).toBe(false);
      expect(exportResponse.error).toBe('圖表導出功能未啟用');
    });

    test('應該處理不支持的格式', async () => {
      // 先Create一個GraphTable
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

      const _createResponse = await chartService.createChart(createRequest);
      expect(createResponse.success).toBe(true);

      // 嘗試Export不Support的格式
      const _exportResponse = await chartService.exportChart(
        createResponse.chart.id,
        'pdf'
      );

      expect(exportResponse.success).toBe(false);
      expect(exportResponse.error).toContain('不支持的導出格式');
    });
  });

  describe('getTemplates', () => {
    test('應該返回模板列表', async () => {
      const _templates = await chartService.getTemplates();

      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThan(0);

      // Check模板結構
      const _template = templates[0];
      expect(template).toHaveProperty('id');
      expect(template).toHaveProperty('name');
      expect(template).toHaveProperty('description');
      expect(template).toHaveProperty('type');
      expect(template).toHaveProperty('config');
    });
  });

  describe('getAnalytics', () => {
    test('應該返回分析數據', async () => {
      // 先Create一個GraphTable
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

      const _createResponse = await chartService.createChart(createRequest);
      expect(createResponse.success).toBe(true);

      // GetAnalysisData
      const _analytics = await chartService.getAnalytics(
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
      const _analytics = await chartService.getAnalytics('non-existent-id');
      expect(analytics).toBeNull();
    });
  });

  describe('getStatistics', () => {
    test('應該返回統計數據', async () => {
      const _statistics = await chartService.getStatistics();

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
      const _mockCallback = jest.fn();

      chartService.addEventListener('test_event', mockCallback);
      chartService.emitEvent('test_event', { data: 'test' });

      expect(mockCallback).toHaveBeenCalledWith({ data: 'test' });
    });

    test('應該支持移除事件監聽器', () => {
      const _mockCallback = jest.fn();

      chartService.addEventListener('test_event', mockCallback);
      chartService.removeEventListener('test_event', mockCallback);
      chartService.emitEvent('test_event', { data: 'test' });

      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe('Configuration', () => {
    test('應該返回配置', () => {
      const _config = chartService.getConfig();

      expect(config).toBeDefined();
      expect(config).toHaveProperty('maxCharts');
      expect(config).toHaveProperty('cacheSize');
      expect(config).toHaveProperty('defaultTheme');
      expect(config).toHaveProperty('performanceMonitoring');
      expect(config).toHaveProperty('autoExport');
    });

    test('應該支持更新配置', () => {
      const _originalConfig = chartService.getConfig();
      const _newConfig = { maxCharts: 200 };

      chartService.updateConfig(newConfig);
      const _updatedConfig = chartService.getConfig();

      expect(updatedConfig.maxCharts).toBe(200);
      expect(updatedConfig.cacheSize).toBe(originalConfig.cacheSize); // 其他Configure保持不變
    });
  });

  describe('Error Handling', () => {
    test('應該Handle渲染Error', async () => {
      // Create一個會導致渲染Error的GraphTable
      const createRequest: ChartCreateRequest = {
        config: {
          type: ChartType.LINE,
          title: 'Error測試圖表',
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

      // 模擬渲染Error
      jest
        .spyOn(chartService as any, 'renderChart')
        .mockRejectedValueOnce(new Error('渲染Failed'));

      const _response = await chartService.createChart(createRequest);

      expect(response.success).toBe(false);
      expect(response.error).toContain('渲染Failed');
    });
  });
});
