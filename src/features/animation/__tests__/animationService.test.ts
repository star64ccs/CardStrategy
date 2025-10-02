import AnimationService from '../services/animationService';
import {
  AnimationConfig,
  AnimationType,
  AnimationPreset,
  AnimationEvent,
} from '../types/animation';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock logger
jest.mock('../../../core/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('AnimationService', () => {
  let animationService: AnimationService;

  beforeEach(() => {
    // 不需要ResetInstance，直接Get
    animationService = AnimationService.getInstance();
  });

  describe('Singleton Pattern', () => {
    it('應該返回相同的實例', () => {
      const _instance1 = AnimationService.getInstance();
      const _instance2 = AnimationService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('初始化', () => {
    it('應該SuccessCreate實例', () => {
      expect(animationService).toBeDefined();
      expect(animationService).toBeInstanceOf(AnimationService);
    });

    it('應該返回單例實例', () => {
      const _instance1 = AnimationService.getInstance();
      const _instance2 = AnimationService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('動畫管理', () => {
    beforeEach(() => {
      // 不需要Initialize
    });

    it('應該創建動畫', () => {
      const _animationId = animationService.createAnimation({
        type: 'timing',
        duration: 300,
        easing: 'ease-in-out',
        from: { opacity: 0 },
        to: { opacity: 1 },
        useNativeDriver: true,
        isInteraction: false,
        iterations: 1,
        loop: false,
      });
      expect(animationId).toBeDefined();
      expect(typeof animationId).toBe('string');
    });

    it('應該獲取預設動畫', () => {
      const _presets = animationService.getPresets();
      expect(Array.isArray(presets)).toBe(true);
      expect(presets.length).toBeGreaterThan(0);
    });

    it('應該創建預設動畫', () => {
      const _presetId = animationService.createPreset({
        name: 'Test Preset',
        description: 'Test animation preset',
        config: {
          type: 'timing',
          duration: 300,
          easing: 'ease-in-out',
          from: { opacity: 0 },
          to: { opacity: 1 },
          useNativeDriver: true,
          isInteraction: false,
          iterations: 1,
          loop: false,
        },
      });
      expect(presetId).toBeDefined();
      expect(typeof presetId).toBe('string');
    });
  });

  describe('預設動畫', () => {
    beforeEach(() => {
      // 不需要Initialize
    });

    it('應該獲取預設動畫', () => {
      const _presets = animationService.getPresets();
      expect(Array.isArray(presets)).toBe(true);
      expect(presets.length).toBeGreaterThan(0);
    });

    it('應該創建淡入動畫', () => {
      const _animation = animationService.createFadeAnimation(0, 1, 300);
      expect(animation).toBeDefined();
      expect(animation.type).toBe('timing');
      expect(animation.duration).toBe(300);
    });

    it('應該創建滑動動畫', () => {
      const _animation = animationService.createSlideAnimation('left', 100);
      expect(animation).toBeDefined();
      expect(animation.type).toBe('timing');
      expect(animation.duration).toBe(400);
    });

    it('應該創建縮放動畫', () => {
      const _animation = animationService.createScaleAnimation(0, 1, 300);
      expect(animation).toBeDefined();
      expect(animation.type).toBe('spring');
      expect(animation.duration).toBe(300);
    });
  });

  describe('性能管理', () => {
    beforeEach(() => {
      // 不需要Initialize
    });

    it('應該獲取動畫統計', () => {
      const _stats = animationService.getAnimationStats();
      expect(stats).toBeDefined();
      expect(typeof stats.totalAnimations).toBe('number');
      expect(typeof stats.activeAnimations).toBe('number');
    });

    it('應該設置性能模式', () => {
      animationService.setPerformanceMode('high');
      expect(animationService.isReducedMotionEnabled()).toBe(false);
    });

    it('應該啟用減少動畫', () => {
      animationService.enableReducedMotion(true);
      expect(animationService.isReducedMotionEnabled()).toBe(true);
    });
  });

  describe('動畫工具', () => {
    beforeEach(() => {
      // 不需要Initialize
    });

    it('應該組合動畫', () => {
      const _animation1 = animationService.createFadeAnimation(0, 1, 200);
      const _animation2 = animationService.createSlideAnimation('left', 100);

      const _combined = animationService.createSequence([
        animation1,
        animation2,
      ]);
      expect(combined).toBeDefined();
      expect(combined.type).toBe('timing');
    });

    it('應該插值動畫值', () => {
      const _interpolated = animationService.interpolate(0.5, [0, 1], [0, 100]);
      expect(interpolated).toBe(50);
    });

    it('應該插值顏色', () => {
      const _interpolated = animationService.interpolateColor(
        0.5,
        [0, 1],
        ['#FF0000', '#0000FF']
      );
      expect(typeof interpolated).toBe('string');
    });
  });

  describe('事件系統', () => {
    beforeEach(() => {
      // 不需要Initialize
    });

    it('應該註冊和觸發事件', () => {
      const _mockCallback = jest.fn();
      animationService.addEventListener(mockCallback);

      // Create並Start動畫來觸發Event
      const _animationId = animationService.createAnimation({
        type: 'timing',
        duration: 100,
        easing: 'ease-out',
        from: { opacity: 0 },
        to: { opacity: 1 },
        useNativeDriver: true,
        isInteraction: false,
        iterations: 1,
        loop: false,
      });

      animationService.startAnimation(animationId);
      expect(mockCallback).toHaveBeenCalled();
    });

    it('應該移除事件監聽器', () => {
      const _mockCallback = jest.fn();
      animationService.addEventListener(mockCallback);
      animationService.removeEventListener(mockCallback);

      // Create並Start動畫來觸發Event
      const _animationId = animationService.createAnimation({
        type: 'timing',
        duration: 100,
        easing: 'ease-out',
        from: { opacity: 0 },
        to: { opacity: 1 },
        useNativeDriver: true,
        isInteraction: false,
        iterations: 1,
        loop: false,
      });

      animationService.startAnimation(animationId);
      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe('ErrorHandle', () => {
    it('應該處理無效的動畫ID', async () => {
      await expect(
        animationService.startAnimation('invalid_id')
      ).rejects.toThrow('Animation not found: invalid_id');
    });

    it('應該Handle事件監聽器Error', () => {
      const _mockCallback = jest.fn().mockImplementation(() => {
        throw new Error('Callback error');
      });

      animationService.addEventListener(mockCallback);
      expect(() => {
        // Create並Start動畫來觸發Event
        const _animationId = animationService.createAnimation({
          type: 'timing',
          duration: 100,
          easing: 'ease-out',
          from: { opacity: 0 },
          to: { opacity: 1 },
          useNativeDriver: true,
          isInteraction: false,
          iterations: 1,
          loop: false,
        });
        animationService.startAnimation(animationId);
      }).not.toThrow();
    });
  });

  describe('性能測試', () => {
    beforeEach(() => {
      // 不需要Initialize
    });

    it('應該快速創建動畫', () => {
      const _startTime = Date.now();
      for (let i = 0; i < 100; i++) {
        animationService.createAnimation({
          type: 'timing',
          duration: 300,
          easing: 'ease-in-out',
          from: { opacity: 0 },
          to: { opacity: 1 },
          useNativeDriver: true,
          isInteraction: false,
          iterations: 1,
          loop: false,
        });
      }
      const _endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100);
    });

    it('應該快速獲取統計', () => {
      const _startTime = Date.now();
      animationService.getAnimationStats();
      const _endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(10);
    });
  });

  describe('邊界條件', () => {
    beforeEach(() => {
      // 不需要Initialize
    });

    it('應該處理無效的插值範圍', () => {
      expect(() => {
        animationService.interpolate(0.5, [0, 1], [0]);
      }).toThrow('Input and output ranges must have the same length');
    });

    it('應該處理空的插值範圍', () => {
      const _result = animationService.interpolate(0.5, [], []);
      expect(result).toBeUndefined();
    });

    it('應該處理無效的動畫ID', () => {
      expect(() => {
        animationService.stopAnimation('invalid_id');
      }).not.toThrow();
    });
  });
});
