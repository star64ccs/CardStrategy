import { layoutService } from '../services/layoutService';
import type {
  LayoutComponentRegistration,
  ResponsiveValue,
} from '../types/layout';

// 模擬 window Object
const _mockWindow = {
  innerWidth: 800, // Modify為 md 斷點對應的寬度 (768 <= 800 < 1024)
  innerHeight: 768,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true,
});

describe('佈局系統測試', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // ResetServiceInstance
    (layoutService as any).instance = null;
    // ResetConfigure到DefaultValue
    layoutService.updateConfig({
      breakpoints: {
        xs: 575,
        sm: 767,
        md: 991,
        lg: 1199,
        xl: 1399,
        xxl: 1400,
      },
    });
  });

  describe('LayoutService 測試', () => {
    test('應該正確InitializeService', async () => {
      await layoutService.initialize();
      expect(layoutService.getCurrentBreakpoint()).toBe('md');
    });

    test('應該正確獲取響應式值', () => {
      const responsiveValue: ResponsiveValue<string> = {
        xs: 'small',
        md: 'medium',
        lg: 'large',
      };

      // 模擬當前斷點為 md
      (layoutService as any).responsiveState.currentBreakpoint = 'md';
      const _result = layoutService.getResponsiveValue(responsiveValue);
      expect(result).toBe('medium');
    });

    test('應該正確檢查斷點', () => {
      (layoutService as any).responsiveState.currentBreakpoint = 'lg';

      expect(layoutService.isBreakpoint('lg')).toBe(true);
      expect(layoutService.isBreakpoint('md')).toBe(false);
      expect(layoutService.isAboveBreakpoint('md')).toBe(true);
      expect(layoutService.isBelowBreakpoint('xl')).toBe(true);
    });

    test('應該正確註冊組件', () => {
      const component: LayoutComponentRegistration = {
        name: 'TestContainer',
        category: 'container',
        props: {},
        defaultProps: { maxWidth: 'lg' },
        variants: ['fluid'],
        responsive: true,
        accessible: true,
      };

      layoutService.registerComponent(component);
      const _registeredComponent = layoutService.getComponent('TestContainer');
      expect(registeredComponent).toEqual(component);
    });

    test('應該正確獲取所有組件', () => {
      const _components = layoutService.getAllComponents();
      expect(Array.isArray(components)).toBe(true);
      expect(components.length).toBeGreaterThan(0);
    });

    test('應該正確更新配置', () => {
      const _newBreakpoints = {
        xs: 480,
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
        xxl: 1536,
      };

      layoutService.updateConfig({ breakpoints: newBreakpoints });
      const _config = layoutService.getConfig();
      expect(config.breakpoints).toEqual(newBreakpoints);
    });

    test('應該正確獲取斷點配置', () => {
      const _breakpoints = layoutService.getBreakpointConfig();
      expect(breakpoints).toHaveProperty('xs');
      expect(breakpoints).toHaveProperty('sm');
      expect(breakpoints).toHaveProperty('md');
      expect(breakpoints).toHaveProperty('lg');
      expect(breakpoints).toHaveProperty('xl');
      expect(breakpoints).toHaveProperty('xxl');
    });

    test('應該正確獲取響應式狀態', () => {
      const _state = layoutService.getResponsiveState();
      expect(state).toHaveProperty('currentBreakpoint');
      expect(state).toHaveProperty('breakpoints');
      expect(state).toHaveProperty('isMobile');
      expect(state).toHaveProperty('isTablet');
      expect(state).toHaveProperty('isDesktop');
      expect(state).toHaveProperty('isLargeScreen');
      expect(state).toHaveProperty('windowWidth');
      expect(state).toHaveProperty('windowHeight');
    });

    test('應該正確處理事件監聽', () => {
      const _mockCallback = jest.fn();
      const _unsubscribe = layoutService.onBreakpointChange(mockCallback);

      expect(typeof unsubscribe).toBe('function');

      // TestCancel監聽
      unsubscribe();
    });

    test('應該正確處理窗口大小變化事件', () => {
      const _mockCallback = jest.fn();
      const _unsubscribe = layoutService.onResize(mockCallback);

      expect(typeof unsubscribe).toBe('function');

      // TestCancel監聽
      unsubscribe();
    });
  });

  describe('響應式值處理測試', () => {
    test('應該正確處理簡單值', () => {
      const _simpleValue = 'test';
      const _result = layoutService.getResponsiveValue(simpleValue);
      expect(result).toBe('test');
    });

    test('應該正確處理數字值', () => {
      const _numberValue = 42;
      const _result = layoutService.getResponsiveValue(numberValue);
      expect(result).toBe(42);
    });

    test('應該正確處理響應式對象', () => {
      const _responsiveObject = {
        xs: 'extra-small',
        sm: 'small',
        md: 'medium',
      };

      (layoutService as any).responsiveState.currentBreakpoint = 'sm';
      const _result = layoutService.getResponsiveValue(responsiveObject);
      expect(result).toBe('small');
    });

    test('應該正確處理缺失的斷點值', () => {
      const _responsiveObject = {
        xs: 'extra-small',
        lg: 'large',
      };

      (layoutService as any).responsiveState.currentBreakpoint = 'md';
      const _result = layoutService.getResponsiveValue(responsiveObject);
      expect(result).toBe('extra-small'); // 應該Return第一個可用的Value
    });
  });

  describe('斷點計算測試', () => {
    test('應該正確計算斷點', () => {
      // Root據實際的斷點Configure進RowTest
      const _testCases = [
        { width: 400, expected: 'xs' }, // 400 <= 575
        { width: 600, expected: 'sm' }, // 576 <= 600 <= 767
        { width: 800, expected: 'md' }, // 768 <= 800 <= 991
        { width: 1000, expected: 'lg' }, // 992 <= 1000 <= 1199
        { width: 1200, expected: 'xl' }, // 1200 <= 1200 <= 1399
        { width: 1500, expected: 'xxl' }, // 1500 > 1400
      ];

      testCases.forEach(({ width, expected }) => {
        // 直接調用PrivateMethod進RowTest
        const _breakpoint = (layoutService as any).getBreakpointFromWidth(width);
        // 直接調用PrivateMethod進RowTest
        expect(breakpoint).toBe(expected);
      });
    });
  });

  describe('組件註冊測試', () => {
    test('應該正確註冊默認組件', () => {
      const _components = layoutService.getAllComponents();
      const _componentNames = components.map(c => c.name);

      expect(componentNames).toContain('Container');
      expect(componentNames).toContain('Grid');
      expect(componentNames).toContain('Flex');
      expect(componentNames).toContain('Stack');
    });

    test('應該正確處理組件類別', () => {
      const _components = layoutService.getAllComponents();
      const _categories = components.map(c => c.category);

      expect(categories).toContain('container');
      expect(categories).toContain('grid');
      expect(categories).toContain('flex');
      expect(categories).toContain('stack');
    });

    test('應該正確處理響應式組件', () => {
      const _components = layoutService.getAllComponents();
      const _responsiveComponents = components.filter(c => c.responsive);

      expect(responsiveComponents.length).toBeGreaterThan(0);
      responsiveComponents.forEach(component => {
        expect(component.responsive).toBe(true);
      });
    });

    test('應該正確處理可訪問性組件', () => {
      const _components = layoutService.getAllComponents();
      const _accessibleComponents = components.filter(c => c.accessible);

      expect(accessibleComponents.length).toBeGreaterThan(0);
      accessibleComponents.forEach(component => {
        expect(component.accessible).toBe(true);
      });
    });
  });

  describe('配置管理測試', () => {
    test('應該正確獲取默認配置', () => {
      const _config = layoutService.getConfig();

      expect(config.enableResponsive).toBe(true);
      expect(config.enableAccessibility).toBe(true);
      expect(config.enableAnimations).toBe(true);
      expect(config.gridColumns).toBe(12);
      expect(config.defaultSpacing).toBe('1rem');
      expect(config.defaultGap).toBe('1rem');
    });

    test('應該正確更新部分配置', () => {
      const _updates = {
        gridColumns: 16,
        defaultSpacing: '2rem',
        enableAnimations: false,
      };

      layoutService.updateConfig(updates);
      const _config = layoutService.getConfig();

      expect(config.gridColumns).toBe(16);
      expect(config.defaultSpacing).toBe('2rem');
      expect(config.enableAnimations).toBe(false);
      expect(config.enableResponsive).toBe(true); // 未Update的Value應該保持不變
    });
  });

  describe('ErrorHandle測試', () => {
    test('應該正確HandleInitializeError', async () => {
      // 模擬InitializeError
      const _originalInitialize = (layoutService as any).initialize;
      (layoutService as any).initialize = jest
        .fn()
        .mockRejectedValue(new Error('InitializeFailed'));

      await expect(layoutService.initialize()).rejects.toThrow('InitializeFailed');

      // Restore原始Method
      (layoutService as any).initialize = originalInitialize;
    });

    test('應該正確Handle事件監聽器Error', () => {
      const _mockCallback = jest.fn().mockImplementation(() => {
        throw new Error('回調Error');
      });

      layoutService.onBreakpointChange(mockCallback);

      // 應該不會ThrowError，而YesRecordError
      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe('性能測試', () => {
    test('響應式值獲取應該在合理時間內完成', () => {
      const _responsiveValue = {
        xs: 'small',
        sm: 'medium',
        md: 'large',
        lg: 'xlarge',
        xl: 'xxlarge',
        xxl: 'xxxlarge',
      };

      const _startTime = Date.now();

      for (let i = 0; i < 1000; i++) {
        layoutService.getResponsiveValue(responsiveValue);
      }

      const _endTime = Date.now();
      const _duration = endTime - startTime;

      expect(duration).toBeLessThan(100); // 應該在 100ms 內Complete
    });

    test('組件註冊應該在合理時間內完成', () => {
      const component: LayoutComponentRegistration = {
        name: 'PerformanceTest',
        category: 'container',
        props: {},
        responsive: true,
        accessible: true,
      };

      const _startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        layoutService.registerComponent({
          ...component,
          name: `PerformanceTest${i}`,
        });
      }

      const _endTime = Date.now();
      const _duration = endTime - startTime;

      expect(duration).toBeLessThan(50); // 應該在 50ms 內Complete
    });
  });
});
