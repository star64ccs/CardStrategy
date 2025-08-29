// 微交互服務簡化單元測試
import { MicroInteractionService } from '../services/microInteractionService';
import {
  MicroInteractionStatus,
  MicroInteractionType,
  TriggerType,
} from '../types/microInteractions';

// Mock DOM 環境
const _createMockAnimation = () => {
  const _animation = {
    onfinish: null as any,
    oncancel: null as any,
    cancel: jest.fn(),
  };
  return animation;
};

const _mockElement = {
  animate: jest.fn().mockReturnValue(createMockAnimation()),
};

const _mockDocument = {
  getElementById: jest.fn().mockReturnValue(mockElement),
  querySelector: jest.fn().mockReturnValue(mockElement),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

const _mockWindow = {
  matchMedia: jest.fn().mockReturnValue({
    matches: false,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }),
  performance: {
    now: jest.fn().mockReturnValue(1000),
  },
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

const _mockRequestAnimationFrame = jest.fn().mockImplementation(callback => {
  setTimeout(callback, 16);
  return 1;
});

// 設置全局對象
Object.defineProperty(global, 'document', {
  value: mockDocument,
  writable: true,
  configurable: true,
});

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true,
  configurable: true,
});

Object.defineProperty(global, 'requestAnimationFrame', {
  value: mockRequestAnimationFrame,
  writable: true,
  configurable: true,
});

// 確保在測試開始前設置好環境
beforeAll(() => {
  // 額外的環境設置
  if (typeof global.document === 'undefined') {
    Object.defineProperty(global, 'document', {
      value: mockDocument,
      writable: true,
      configurable: true,
    });
  }

  if (typeof global.window === 'undefined') {
    Object.defineProperty(global, 'window', {
      value: mockWindow,
      writable: true,
      configurable: true,
    });
  }
});

describe('MicroInteractionService', () => {
  let service: MicroInteractionService;

  beforeEach(() => {
    // 清除單例實例
    (MicroInteractionService as any).instance = null;
    service = MicroInteractionService.getInstance();

    // 重置 mock
    jest.clearAllMocks();

    // 重置動畫 mock
    mockElement.animate = jest.fn().mockReturnValue(createMockAnimation());
  });

  describe('初始化', () => {
    test('應該正確初始化服務', async () => {
      await service.initialize();

      expect(service).toBeDefined();
      expect(service.getStats()).toBeDefined();
    });

    test('應該使用默認配置初始化', async () => {
      await service.initialize();

      const _config = service['config'];
      expect(config.enabled).toBe(true);
      expect(config.defaultDuration).toBe(300);
    });

    test('應該接受自定義配置', async () => {
      const _customConfig = {
        enabled: false,
        defaultDuration: 500,
      };

      await service.initialize(customConfig);

      const _config = service['config'];
      expect(config.enabled).toBe(false);
      expect(config.defaultDuration).toBe(500);
    });
  });

  describe('註冊和註銷', () => {
    test('應該成功註冊微交互', () => {
      const _config = {
        id: 'test-interaction',
        type: MicroInteractionType.BUTTON_CLICK,
        trigger: TriggerType.CLICK,
        duration: 300,
      };

      const _id = service.register(config);

      expect(id).toBeDefined();
      expect(service.getConfig(id)).toEqual(expect.objectContaining(config));
    });

    test('應該成功註銷微交互', () => {
      const _config = {
        id: 'test-interaction',
        type: MicroInteractionType.BUTTON_CLICK,
        trigger: TriggerType.CLICK,
        duration: 300,
      };

      const _id = service.register(config);
      service.unregister(id);

      expect(service.getConfig(id)).toBeNull();
    });

    test('應該生成唯一ID', () => {
      const _config = {
        type: MicroInteractionType.BUTTON_CLICK,
        trigger: TriggerType.CLICK,
        duration: 300,
      };

      const _id1 = service.register(config);
      const _id2 = service.register(config);

      expect(id1).not.toBe(id2);
    });
  });

  describe('狀態管理', () => {
    test('應該正確獲取狀態', () => {
      const _config = {
        id: 'test-interaction',
        type: MicroInteractionType.BUTTON_CLICK,
        trigger: TriggerType.CLICK,
        duration: 300,
      };

      const _id = service.register(config);
      const _state = service.getState(id);

      expect(state).toBeDefined();
      expect(state?.status).toBe(MicroInteractionStatus.IDLE);
    });

    test('應該正確獲取進度', () => {
      const _config = {
        id: 'test-interaction',
        type: MicroInteractionType.BUTTON_CLICK,
        trigger: TriggerType.CLICK,
        duration: 300,
      };

      const _id = service.register(config);
      const _progress = service.getProgress(id);

      expect(progress).toBe(0);
    });

    test('應該正確檢查播放狀態', () => {
      const _config = {
        id: 'test-interaction',
        type: MicroInteractionType.BUTTON_CLICK,
        trigger: TriggerType.CLICK,
        duration: 300,
      };

      const _id = service.register(config);

      expect(service.isPlaying(id)).toBe(false);
      expect(service.isCompleted(id)).toBe(false);
    });
  });

  describe('配置管理', () => {
    test('應該正確更新配置', () => {
      const _config = {
        id: 'test-interaction',
        type: MicroInteractionType.BUTTON_CLICK,
        trigger: TriggerType.CLICK,
        duration: 300,
      };

      const _id = service.register(config);

      const _updatedConfig = { duration: 500 };
      service.updateConfig(id, updatedConfig);

      const _currentConfig = service.getConfig(id);
      expect(currentConfig?.duration).toBe(500);
    });

    test('應該在更新不存在的配置時拋出錯誤', () => {
      expect(() => {
        service.updateConfig('non-existent', { duration: 500 });
      }).toThrow('微交互 non-existent 不存在');
    });
  });

  describe('批量操作', () => {
    test('應該正確停止所有微交互', () => {
      const _config1 = {
        id: 'test-interaction-1',
        type: MicroInteractionType.BUTTON_CLICK,
        trigger: TriggerType.CLICK,
        duration: 300,
      };

      const _config2 = {
        id: 'test-interaction-2',
        type: MicroInteractionType.FORM_VALIDATION,
        trigger: TriggerType.VALIDATION,
        duration: 200,
      };

      service.register(config1);
      service.register(config2);

      service.stopAll();

      // 驗證所有狀態都被重置
      const _states = service['states'];
      Object.values(states).forEach(state => {
        expect(state.status).toBe(MicroInteractionStatus.IDLE);
      });
    });

    test('應該正確重置所有微交互', () => {
      const _config = {
        id: 'test-interaction',
        type: MicroInteractionType.BUTTON_CLICK,
        trigger: TriggerType.CLICK,
        duration: 300,
      };

      const _id = service.register(config);

      // 模擬設置一些狀態
      const _state = service.getState(id);
      if (state) {
        state.startTime = 1000;
        state.endTime = 1300;
        state.data = { test: true };
      }

      service.resetAll();

      const _resetState = service.getState(id);
      expect(resetState?.startTime).toBeUndefined();
      expect(resetState?.endTime).toBeUndefined();
      expect(resetState?.data).toBeUndefined();
    });
  });

  describe('性能監控', () => {
    test('應該正確啟用性能監控', () => {
      service.enablePerformanceMonitoring(true);

      expect(service['performanceMonitoring']).toBe(true);
    });

    test('應該正確獲取性能指標', () => {
      const _config = {
        id: 'test-interaction',
        type: MicroInteractionType.BUTTON_CLICK,
        trigger: TriggerType.CLICK,
        duration: 300,
      };

      const _id = service.register(config);
      const _performance = service.getPerformance(id);

      expect(performance).toBeNull(); // 初始狀態下應該為 null
    });

    test('應該正確獲取統計信息', () => {
      const _stats = service.getStats();

      expect(stats).toBeDefined();
      expect(stats.totalInteractions).toBe(0);
      expect(stats.successfulInteractions).toBe(0);
      expect(stats.failedInteractions).toBe(0);
    });
  });

  describe('事件監聽', () => {
    test('應該正確添加和移除事件監聽器', () => {
      const _callback = jest.fn();

      service.on('test-event', callback);
      service.emit('test-event', { data: 'test' });

      expect(callback).toHaveBeenCalledWith({ data: 'test' });

      service.off('test-event', callback);
      service.emit('test-event', { data: 'test2' });

      expect(callback).toHaveBeenCalledTimes(1); // 應該只被調用一次
    });
  });

  describe('錯誤處理', () => {
    test('應該在觸發不存在的微交互時拋出錯誤', async () => {
      await expect(service.trigger('non-existent')).rejects.toThrow(
        '微交互 non-existent 不存在或已禁用'
      );
    });
  });

  describe('用戶偏好檢測', () => {
    test('應該正確檢測 prefers-reduced-motion', () => {
      // 模擬用戶偏好減少動畫
      mockWindow.matchMedia.mockReturnValue({
        matches: true,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      });

      // 清除現有實例並重新創建
      (MicroInteractionService as any).instance = null;
      const _newService = MicroInteractionService.getInstance();

      expect(newService['config'].accessibilityMode).toBe(true);
      expect(newService['config'].defaultDuration).toBe(0);
    });

    test('應該在無法檢測偏好時繼續運行', () => {
      // 模擬 matchMedia 不可用
      mockWindow.matchMedia.mockReturnValue(null);

      // 清除現有實例並重新創建
      (MicroInteractionService as any).instance = null;
      const _newService = MicroInteractionService.getInstance();

      expect(newService['config'].accessibilityMode).toBe(false);
      expect(newService['config'].defaultDuration).toBe(300);
    });
  });

  describe('統計更新', () => {
    test('應該正確更新統計信息', () => {
      const _config = {
        id: 'test-interaction',
        type: MicroInteractionType.BUTTON_CLICK,
        trigger: TriggerType.CLICK,
        duration: 300,
      };

      const _id = service.register(config);

      // 模擬成功的交互
      const _state = service.getState(id);
      if (state) {
        state.status = MicroInteractionStatus.COMPLETED;
        state.startTime = 1000;
        state.endTime = 1300;
      }

      service['updateStats'](state);

      const _stats = service.getStats();
      expect(stats.totalInteractions).toBe(1);
      expect(stats.successfulInteractions).toBe(1);
      expect(stats.failedInteractions).toBe(0);
    });

    test('應該正確處理失敗的交互', () => {
      const _config = {
        id: 'test-interaction',
        type: MicroInteractionType.BUTTON_CLICK,
        trigger: TriggerType.CLICK,
        duration: 300,
      };

      const _id = service.register(config);

      // 模擬失敗的交互
      const _state = service.getState(id);
      if (state) {
        state.status = MicroInteractionStatus.ERROR;
        state.error = 'test error';
      }

      service['updateStats'](state);

      const _stats = service.getStats();
      expect(stats.totalInteractions).toBe(1);
      expect(stats.successfulInteractions).toBe(0);
      expect(stats.failedInteractions).toBe(1);
    });
  });

  describe('服務銷毀', () => {
    test('應該正確銷毀服務', () => {
      const _config = {
        id: 'test-interaction',
        type: MicroInteractionType.BUTTON_CLICK,
        trigger: TriggerType.CLICK,
        duration: 300,
      };

      const _id = service.register(config);

      service.destroy();

      // 驗證所有內部狀態都被清理
      expect(service['interactions'].size).toBe(0);
      expect(service['states'].size).toBe(0);
      expect(service['activeAnimations'].size).toBe(0);
    });
  });

  describe('動畫執行情境', () => {
    test('應該正確執行按鈕點擊動畫', async () => {
      const _config = {
        id: 'button-click',
        type: MicroInteractionType.BUTTON_CLICK,
        trigger: TriggerType.CLICK,
        duration: 300,
      };

      const _id = service.register(config);

      // 模擬動畫執行
      const _animation = createMockAnimation();
      mockElement.animate.mockReturnValue(animation);

      const _triggerPromise = service.trigger(id, { element: mockElement });

      // 模擬動畫完成
      setTimeout(() => {
        if (animation.onfinish) {
          animation.onfinish();
        }
      }, 50);

      await triggerPromise;

      expect(mockElement.animate).toHaveBeenCalled();
      expect(service.getState(id)?.status).toBe(
        MicroInteractionStatus.COMPLETED
      );
    });

    test('應該正確執行表單驗證動畫', async () => {
      const _config = {
        id: 'form-validation',
        type: MicroInteractionType.FORM_VALIDATION,
        trigger: TriggerType.VALIDATION,
        duration: 200,
      };

      const _id = service.register(config);

      // 模擬動畫執行
      const _animation = createMockAnimation();
      mockElement.animate.mockReturnValue(animation);

      const _triggerPromise = service.trigger(id, {
        element: mockElement,
        validationState: 'success',
      });

      // 模擬動畫完成
      setTimeout(() => {
        if (animation.onfinish) {
          animation.onfinish();
        }
      }, 50);

      await triggerPromise;

      expect(mockElement.animate).toHaveBeenCalled();
      expect(service.getState(id)?.status).toBe(
        MicroInteractionStatus.COMPLETED
      );
    });

    test('應該正確執行加載動畫', async () => {
      const _config = {
        id: 'loading',
        type: MicroInteractionType.LOADING,
        trigger: TriggerType.LOADING,
        duration: 1000,
      };

      const _id = service.register(config);

      // 模擬動畫執行
      const _animation = createMockAnimation();
      mockElement.animate.mockReturnValue(animation);

      const _triggerPromise = service.trigger(id, {
        element: mockElement,
        loading: true,
      });

      // 模擬動畫完成
      setTimeout(() => {
        if (animation.onfinish) {
          animation.onfinish();
        }
      }, 50);

      await triggerPromise;

      expect(mockElement.animate).toHaveBeenCalled();
      expect(service.getState(id)?.status).toBe(
        MicroInteractionStatus.COMPLETED
      );
    });
  });

  describe('並發控制情境', () => {
    test('應該正確處理並發限制', async () => {
      // 設置較小的並發限制
      await service.initialize({ maxConcurrent: 1 });

      const _config = {
        id: 'concurrent-test',
        type: MicroInteractionType.BUTTON_CLICK,
        trigger: TriggerType.CLICK,
        duration: 300,
      };

      const _id = service.register(config);

      // 模擬動畫執行
      const _animation = createMockAnimation();
      mockElement.animate.mockReturnValue(animation);

      // 第一次觸發應該成功
      const _triggerPromise1 = service.trigger(id, { element: mockElement });

      // 第二次觸發應該失敗（因為並發限制）
      const _triggerPromise2 = service.trigger(id, { element: mockElement });

      await expect(triggerPromise2).rejects.toThrow('達到最大並發限制');

      // 清理第一個動畫
      setTimeout(() => {
        if (animation.onfinish) {
          animation.onfinish();
        }
      }, 50);

      await triggerPromise1;
    });

    test('應該在動畫完成後釋放並發槽位', async () => {
      // 設置並發限制為 1
      await service.initialize({ maxConcurrent: 1 });

      const _config = {
        id: 'concurrent-release',
        type: MicroInteractionType.BUTTON_CLICK,
        trigger: TriggerType.CLICK,
        duration: 300,
      };

      const _id = service.register(config);

      // 模擬動畫執行
      const _animation = createMockAnimation();
      mockElement.animate.mockReturnValue(animation);

      // 第一次觸發
      const _triggerPromise1 = service.trigger(id, { element: mockElement });

      // 等待動畫完成
      setTimeout(() => {
        if (animation.onfinish) {
          animation.onfinish();
        }
      }, 50);

      await triggerPromise1;

      // 動畫完成後，應該可以再次觸發
      const _triggerPromise2 = service.trigger(id, { element: mockElement });

      setTimeout(() => {
        if (animation.onfinish) {
          animation.onfinish();
        }
      }, 50);

      await triggerPromise2; // 這次應該成功
    });
  });

  describe('錯誤處理情境', () => {
    test('應該正確處理動畫取消', async () => {
      const _config = {
        id: 'cancel-test',
        type: MicroInteractionType.BUTTON_CLICK,
        trigger: TriggerType.CLICK,
        duration: 300,
      };

      const _id = service.register(config);

      // 模擬動畫執行
      const _animation = createMockAnimation();
      mockElement.animate.mockReturnValue(animation);

      const _triggerPromise = service.trigger(id, { element: mockElement });

      // 模擬動畫取消
      setTimeout(() => {
        if (animation.oncancel) {
          animation.oncancel();
        }
      }, 50);

      await expect(triggerPromise).rejects.toThrow('動畫被取消');
    });

    test('應該正確處理元素不存在的情況', async () => {
      const _config = {
        id: 'no-element',
        type: MicroInteractionType.BUTTON_CLICK,
        trigger: TriggerType.CLICK,
        duration: 300,
      };

      const _id = service.register(config);

      // 不提供 element 數據
      await expect(service.trigger(id)).rejects.toThrow(
        '找不到元素: no-element'
      );
    });
  });
});
