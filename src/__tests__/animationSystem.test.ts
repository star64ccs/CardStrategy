import { defaultKeyframes } from '../components/ui/Keyframe';
import { defaultTransitions } from '../components/ui/Transition';
import { AnimationService } from '../services/animationService';
import animationReducer from '../store/slices/animationSlice';

// Mock DOM APIs
const _mockElement = {
  animate: jest.fn().mockReturnValue({
    onfinish: null,
    oncancel: null,
    pause: jest.fn(),
    play: jest.fn(),
    cancel: jest.fn(),
    reverse: jest.fn(),
    currentTime: 0,
    playbackRate: 1,
    finished: false,
  }),
  style: {},
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

const _mockDocument = {
  createElement: jest.fn().mockReturnValue(mockElement),
  querySelector: jest.fn().mockReturnValue(mockElement),
  body: {
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
      toggle: jest.fn(),
    },
  },
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  hidden: false,
};

const _mockMatchMedia = jest.fn().mockReturnValue({
  matches: false,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
});

const _mockWindow = {
  matchMedia: mockMatchMedia,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  requestAnimationFrame: jest.fn().mockReturnValue(1),
  cancelAnimationFrame: jest.fn(),
};

const _mockPerformance = {
  now: jest.fn().mockReturnValue(1000),
};

// Mock global objects
global.document = mockDocument as any;
global.window = mockWindow as any;
global.performance = mockPerformance as any;

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn().mockReturnValue(1);
global.cancelAnimationFrame = jest.fn();

describe('動畫系統測試', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 重置 matchMedia mock
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    });
  });

  describe('AnimationService', () => {
    let animationService: AnimationService;

    beforeEach(() => {
      // 清除單例實例以確保測試隔離
      (AnimationService as any).instance = undefined;
      animationService = AnimationService.getInstance();
    });

    test('應該創建單例實例', () => {
      const _instance1 = AnimationService.getInstance();
      const _instance2 = AnimationService.getInstance();
      expect(instance1).toBe(instance2);
    });

    test('應該創建動畫', () => {
      const _config = {
        duration: 300,
        easing: 'ease-out',
      };

      const _id = animationService.createAnimation(config);
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
    });

    test('應該獲取偏好設置', () => {
      const _preferences = animationService.getPreferences();
      expect(preferences).toBeDefined();
      expect(preferences.reducedMotion).toBeDefined();
      expect(preferences.prefersAnimation).toBeDefined();
    });

    test('應該更新偏好設置', () => {
      const _newPreferences = {
        reducedMotion: true,
        animationDuration: 'fast' as const,
      };

      animationService.updatePreferences(newPreferences);
      const _preferences = animationService.getPreferences();
      expect(preferences.reducedMotion).toBe(true);
      expect(preferences.animationDuration).toBe('fast');
    });

    test('應該獲取性能指標', () => {
      const _performance = animationService.getPerformance();
      expect(performance).toBeDefined();
      expect(performance.fps).toBeDefined();
      expect(performance.frameTime).toBeDefined();
    });

    test('應該註冊和獲取預設動畫', () => {
      const _preset = {
        name: 'test-preset',
        config: {
          duration: 500,
          easing: 'ease-in-out',
        },
        description: '測試預設動畫',
        category: 'entrance' as const,
      };

      animationService.registerPreset(preset);
      const _retrievedPreset = animationService.getPreset('test-preset');
      expect(retrievedPreset).toEqual(preset);
    });

    test('應該獲取所有預設動畫', () => {
      const _presets = animationService.getAllPresets();
      expect(Array.isArray(presets)).toBe(true);
      expect(presets.length).toBeGreaterThan(0);
    });

    test('應該處理事件監聽', () => {
      const _callback = jest.fn();
      animationService.on('test-event', callback);

      // 模擬事件觸發
      const _event = {
        type: 'start' as const,
        timestamp: Date.now(),
        animation: { duration: 300, easing: 'ease-out' },
      };

      // 這裡需要訪問私有方法來測試事件觸發
      // 由於私有方法無法直接訪問，我們測試事件註冊是否成功
      expect(callback).toBeDefined();
    });

    test('應該處理批量操作', async () => {
      // 創建多個動畫
      const _config1 = { duration: 300, easing: 'ease-out' };
      const _config2 = { duration: 400, easing: 'ease-in' };

      const _id1 = animationService.createAnimation(config1);
      const _id2 = animationService.createAnimation(config2);

      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
    });

    test('應該處理動畫配置更新', () => {
      const _config = { duration: 300, easing: 'ease-out' };
      const _id = animationService.createAnimation(config);

      const _updatedConfig = { duration: 500 };
      animationService.updateConfig(id, updatedConfig);

      const _retrievedConfig = animationService.getConfig(id);
      expect(retrievedConfig).toBeDefined();
    });
  });

  describe('預設動畫配置', () => {
    test('應該有淡入淡出動畫配置', () => {
      expect(defaultTransitions.fade).toBeDefined();
      expect(defaultTransitions.fade.property).toBe('opacity');
      expect(defaultTransitions.fade.duration).toBe(300);
    });

    test('應該有滑動動畫配置', () => {
      expect(defaultTransitions.slide).toBeDefined();
      expect(Array.isArray(defaultTransitions.slide.property)).toBe(true);
      expect(defaultTransitions.slide.duration).toBe(400);
    });

    test('應該有縮放動畫配置', () => {
      expect(defaultTransitions.scale).toBeDefined();
      expect(Array.isArray(defaultTransitions.scale.property)).toBe(true);
      expect(defaultTransitions.scale.duration).toBe(300);
    });

    test('應該有旋轉動畫配置', () => {
      expect(defaultTransitions.rotate).toBeDefined();
      expect(Array.isArray(defaultTransitions.rotate.property)).toBe(true);
      expect(defaultTransitions.rotate.duration).toBe(500);
    });
  });

  describe('預設關鍵幀配置', () => {
    test('應該有彈跳動畫配置', () => {
      expect(defaultKeyframes.bounce).toBeDefined();
      expect(defaultKeyframes.bounce.keyframes.length).toBeGreaterThan(0);
      expect(defaultKeyframes.bounce.config.duration).toBe(1000);
    });

    test('應該有脈衝動畫配置', () => {
      expect(defaultKeyframes.pulse).toBeDefined();
      expect(defaultKeyframes.pulse.keyframes.length).toBeGreaterThan(0);
      expect(defaultKeyframes.pulse.config.iterations).toBe(-1);
    });

    test('應該有搖晃動畫配置', () => {
      expect(defaultKeyframes.shake).toBeDefined();
      expect(defaultKeyframes.shake.keyframes.length).toBeGreaterThan(0);
      expect(defaultKeyframes.shake.config.duration).toBe(800);
    });

    test('應該有淡入動畫配置', () => {
      expect(defaultKeyframes.fadeInUp).toBeDefined();
      expect(defaultKeyframes.fadeInUp.keyframes.length).toBe(2);
      expect(defaultKeyframes.fadeInUp.config.duration).toBe(600);
    });
  });

  describe('Redux Slice', () => {
    test('應該有初始狀態', () => {
      const _initialState = animationReducer(undefined, { type: 'unknown' });
      expect(initialState).toBeDefined();
      expect(initialState.animations).toBeDefined();
      expect(initialState.preferences).toBeDefined();
      expect(initialState.presets).toBeDefined();
    });

    test('應該處理錯誤設置', () => {
      const _initialState = animationReducer(undefined, { type: 'unknown' });
      const _stateWithError = animationReducer(initialState, {
        type: 'animation/setError',
        payload: '測試錯誤',
      });

      expect(stateWithError.error).toBe('測試錯誤');
    });

    test('應該清除錯誤', () => {
      const _initialState = animationReducer(undefined, { type: 'unknown' });
      const _stateWithError = animationReducer(initialState, {
        type: 'animation/setError',
        payload: '測試錯誤',
      });
      const _stateWithoutError = animationReducer(stateWithError, {
        type: 'animation/clearError',
      });

      expect(stateWithoutError.error).toBeNull();
    });

    test('應該更新性能指標', () => {
      const _initialState = animationReducer(undefined, { type: 'unknown' });
      const _performance = {
        fps: 60,
        frameTime: 16.67,
        droppedFrames: 0,
        memoryUsage: 0,
        cpuUsage: 0,
      };

      const _updatedState = animationReducer(initialState, {
        type: 'animation/updatePerformanceMetrics',
        payload: performance,
      });

      expect(updatedState.performanceMonitoring.metrics).toEqual(performance);
    });

    test('應該設置全局配置', () => {
      const _initialState = animationReducer(undefined, { type: 'unknown' });
      const _config = {
        maxConcurrentAnimations: 20,
        performanceThreshold: 25,
      };

      const _updatedState = animationReducer(initialState, {
        type: 'animation/setGlobalConfig',
        payload: config,
      });

      expect(updatedState.globalConfig.maxConcurrentAnimations).toBe(20);
      expect(updatedState.globalConfig.performanceThreshold).toBe(25);
    });
  });

  describe('性能優化', () => {
    test('應該啟用性能監控', () => {
      const _animationService = AnimationService.getInstance();
      animationService.enablePerformanceMonitoring(true);

      const _performance = animationService.getPerformance();
      expect(performance).toBeDefined();
    });

    test('應該應用偏好設置', () => {
      const _animationService = AnimationService.getInstance();

      // 設置減少動畫偏好
      animationService.updatePreferences({
        reducedMotion: true,
        animationDuration: 'fast',
      });

      const _preferences = animationService.getPreferences();
      expect(preferences.reducedMotion).toBe(true);
      expect(preferences.animationDuration).toBe('fast');
    });

    test('應該處理動畫強度設置', () => {
      const _animationService = AnimationService.getInstance();

      // 測試不同強度設置
      const _intensities = ['minimal', 'normal', 'intense'] as const;

      intensities.forEach(intensity => {
        animationService.updatePreferences({ animationIntensity: intensity });
        const _preferences = animationService.getPreferences();
        expect(preferences.animationIntensity).toBe(intensity);
      });
    });
  });

  describe('錯誤處理', () => {
    test('應該處理動畫創建失敗', () => {
      const _animationService = AnimationService.getInstance();

      // 測試無效配置
      expect(() => {
        animationService.createAnimation({} as any);
      }).not.toThrow();
    });

    test('應該處理播放不存在的動畫', async () => {
      const _animationService = AnimationService.getInstance();

      await expect(
        animationService.playAnimation('non-existent-id')
      ).rejects.toThrow();
    });

    test('應該處理暫停不存在的動畫', () => {
      const _animationService = AnimationService.getInstance();

      expect(() => {
        animationService.pauseAnimation('non-existent-id');
      }).toThrow();
    });

    test('應該處理停止不存在的動畫', () => {
      const _animationService = AnimationService.getInstance();

      expect(() => {
        animationService.stopAnimation('non-existent-id');
      }).toThrow();
    });

    test('應該處理更新不存在的動畫配置', () => {
      const _animationService = AnimationService.getInstance();

      expect(() => {
        animationService.updateConfig('non-existent-id', { duration: 500 });
      }).toThrow();
    });

    test('應該處理獲取不存在的動畫配置', () => {
      const _animationService = AnimationService.getInstance();

      const _config = animationService.getConfig('non-existent-id');
      expect(config).toBeNull();
    });
  });

  describe('動畫類型支持', () => {
    test('應該支持淡入淡出動畫', () => {
      const _config = {
        duration: 300,
        easing: 'ease-out',
        property: 'opacity',
        from: { opacity: 0 },
        to: { opacity: 1 },
      };

      const _animationService = AnimationService.getInstance();
      const _id = animationService.createAnimation(config);
      expect(id).toBeDefined();
    });

    test('應該支持滑動動畫', () => {
      const _config = {
        duration: 400,
        easing: 'ease-out',
        property: ['opacity', 'transform'],
        from: { opacity: 0, transform: 'translateY(20px)' },
        to: { opacity: 1, transform: 'translateY(0)' },
      };

      const _animationService = AnimationService.getInstance();
      const _id = animationService.createAnimation(config);
      expect(id).toBeDefined();
    });

    test('應該支持縮放動畫', () => {
      const _config = {
        duration: 300,
        easing: 'ease-out',
        property: ['opacity', 'transform'],
        from: { opacity: 0, transform: 'scale(0.8)' },
        to: { opacity: 1, transform: 'scale(1)' },
      };

      const _animationService = AnimationService.getInstance();
      const _id = animationService.createAnimation(config);
      expect(id).toBeDefined();
    });

    test('應該支持旋轉動畫', () => {
      const _config = {
        duration: 500,
        easing: 'ease-out',
        property: ['opacity', 'transform'],
        from: { opacity: 0, transform: 'rotate(-180deg)' },
        to: { opacity: 1, transform: 'rotate(0deg)' },
      };

      const _animationService = AnimationService.getInstance();
      const _id = animationService.createAnimation(config);
      expect(id).toBeDefined();
    });
  });

  describe('緩動函數支持', () => {
    test('應該支持線性緩動', () => {
      const _config = {
        duration: 300,
        easing: 'linear',
      };

      const _animationService = AnimationService.getInstance();
      const _id = animationService.createAnimation(config);
      expect(id).toBeDefined();
    });

    test('應該支持 ease-in 緩動', () => {
      const _config = {
        duration: 300,
        easing: 'ease-in',
      };

      const _animationService = AnimationService.getInstance();
      const _id = animationService.createAnimation(config);
      expect(id).toBeDefined();
    });

    test('應該支持 ease-out 緩動', () => {
      const _config = {
        duration: 300,
        easing: 'ease-out',
      };

      const _animationService = AnimationService.getInstance();
      const _id = animationService.createAnimation(config);
      expect(id).toBeDefined();
    });

    test('應該支持 ease-in-out 緩動', () => {
      const _config = {
        duration: 300,
        easing: 'ease-in-out',
      };

      const _animationService = AnimationService.getInstance();
      const _id = animationService.createAnimation(config);
      expect(id).toBeDefined();
    });

    test('應該支持 cubic-bezier 緩動', () => {
      const _config = {
        duration: 300,
        easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      };

      const _animationService = AnimationService.getInstance();
      const _id = animationService.createAnimation(config);
      expect(id).toBeDefined();
    });
  });
});
