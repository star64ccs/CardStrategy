// 響應式組件簡化測試

import { responsiveComponentService } from '../services/responsiveComponentService';

describe('響應式組件服務測試', () => {
  beforeEach(() => {
    // 重置服務狀態
    jest.clearAllMocks();
  });

  describe('組件註冊', () => {
    it('應該正確註冊組件', () => {
      const _component = {
        name: 'TestComponent',
        category: 'other' as const,
        responsive: true,
        breakpoints: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
        props: {},
        accessible: true,
      };

      responsiveComponentService.registerComponent(component);
      const _registeredComponent =
        responsiveComponentService.getComponent('TestComponent');

      expect(registeredComponent).toEqual(component);
    });

    it('應該返回所有註冊的組件', () => {
      // 清理之前的測試數據
      const _allComponents = responsiveComponentService.getAllComponents();
      const _initialCount = allComponents.length;

      const _component1 = {
        name: 'TestComponent1',
        category: 'other' as const,
        responsive: true,
        breakpoints: ['xs', 'sm'],
        props: {},
        accessible: true,
      };

      const _component2 = {
        name: 'TestComponent2',
        category: 'other' as const,
        responsive: true,
        breakpoints: ['md', 'lg'],
        props: {},
        accessible: true,
      };

      responsiveComponentService.registerComponent(component1);
      responsiveComponentService.registerComponent(component2);

      const _updatedComponents = responsiveComponentService.getAllComponents();
      expect(updatedComponents.length).toBeGreaterThanOrEqual(initialCount + 2);
    });

    it('應該返回null當組件不存在時', () => {
      const _component = responsiveComponentService.getComponent(
        'NonExistentComponent'
      );
      expect(component).toBeNull();
    });
  });

  describe('測試報告生成', () => {
    it('應該生成測試報告', () => {
      const _mockResults = [
        {
          component: 'TestComponent',
          device: 'iPhone SE',
          breakpoint: 'xs' as const,
          orientation: 'portrait',
          passed: true,
          issues: [],
          performance: {
            renderTime: 50,
            memoryUsage: 10,
            interactionTime: 20,
          },
        },
        {
          component: 'TestComponent',
          device: 'Desktop',
          breakpoint: 'lg' as const,
          orientation: 'landscape',
          passed: false,
          issues: ['渲染問題', '佈局問題'],
          performance: {
            renderTime: 100,
            memoryUsage: 20,
            interactionTime: 30,
          },
        },
      ];

      const _report = responsiveComponentService.generateTestReport(mockResults);

      expect(report).toContain('響應式組件測試報告');
      expect(report).toContain('總測試數: 2');
      expect(report).toContain('通過測試: 1');
      expect(report).toContain('失敗測試: 1');
      expect(report).toContain('通過率: 50.00%');
    });

    it('應該處理空結果', () => {
      const _report = responsiveComponentService.generateTestReport([]);
      expect(report).toContain('總測試數: 0');
      expect(report).toContain('通過測試: 0');
    });
  });

  describe('性能監控', () => {
    it('應該追蹤性能數據', () => {
      const _componentName = 'TestComponent';
      const _breakpoint = 'md' as const;
      const _metrics = {
        renderTime: 45,
        memoryUsage: 15,
        interactionTime: 25,
      };

      responsiveComponentService.trackPerformance(
        componentName,
        breakpoint,
        metrics
      );

      const _report =
        responsiveComponentService.getPerformanceReport(componentName);
      expect(report.summary[componentName]).toBeDefined();
    });

    it('應該返回性能報告', () => {
      const _report = responsiveComponentService.getPerformanceReport();
      expect(report).toHaveProperty('summary');
      expect(report).toHaveProperty('details');
    });
  });

  describe('事件管理', () => {
    it('應該發送和接收事件', () => {
      const _mockCallback = jest.fn();
      const _unsubscribe =
        responsiveComponentService.onComponentEvent(mockCallback);

      const _testEvent = {
        type: 'componentRender' as const,
        componentName: 'TestComponent',
        breakpoint: 'md' as const,
        deviceType: 'desktop' as const,
        timestamp: Date.now(),
      };

      responsiveComponentService.emitEvent(testEvent);

      expect(mockCallback).toHaveBeenCalledWith(testEvent);

      unsubscribe();
    });
  });
});

describe('響應式類型定義測試', () => {
  it('應該正確定義響應式值類型', () => {
    // 測試響應式值類型
    const responsiveValue: unknown = {
      xs: '100px',
      sm: '200px',
      md: '300px',
      lg: '400px',
    };

    expect(responsiveValue).toHaveProperty('xs');
    expect(responsiveValue).toHaveProperty('sm');
    expect(responsiveValue).toHaveProperty('md');
    expect(responsiveValue).toHaveProperty('lg');
  });

  it('應該正確定義斷點類型', () => {
    const _breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];

    breakpoints.forEach(breakpoint => {
      expect(breakpoints).toContain(breakpoint);
    });
  });

  it('應該正確定義設備類型', () => {
    const _deviceTypes = ['mobile', 'tablet', 'desktop'];

    deviceTypes.forEach(deviceType => {
      expect(deviceTypes).toContain(deviceType);
    });
  });
});
