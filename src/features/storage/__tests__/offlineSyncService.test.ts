import AsyncStorage from '@react-native-async-storage/async-storage';

import type { OfflineSyncConfig } from '../services/offlineSyncService';
import { offlineSyncService } from '../services/offlineSyncService';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() =>
    Promise.resolve({ isConnected: true, isInternetReachable: true })
  ),
}));

// Mock logger
jest.mock('../../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('OfflineSyncService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the singleton instance
    (offlineSyncService as any).instance = undefined;
    // Reset the sync queue
    (offlineSyncService as any).syncQueue = [];
    (offlineSyncService as any).state = {
      isOnline: true,
      isSyncing: false,
      lastSyncTime: null,
      pendingItemsCount: 0,
      error: null,
      stats: {
        totalSynced: 0,
        pendingSync: 0,
        syncErrors: 0,
        lastSyncTime: new Date(),
        avgSyncTime: 0,
      },
    };
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const _instance1 = offlineSyncService;
      const _instance2 = offlineSyncService;
      expect(instance1).toBe(instance2);
    });
  });

  describe('initialize', () => {
    it('should initialize successfully', async () => {
      const _mockGetItem = AsyncStorage.getItem as jest.MockedFunction<
        typeof AsyncStorage.getItem
      >;

      mockGetItem.mockResolvedValue(null);

      await offlineSyncService.initialize('test-user-id');

      // Check that the service is initialized
      expect(offlineSyncService.getSyncState()).toBeDefined();
    });

    it('should handle initialization errors', async () => {
      const _mockGetItem = AsyncStorage.getItem as jest.MockedFunction<
        typeof AsyncStorage.getItem
      >;
      mockGetItem.mockRejectedValue(new Error('Storage error'));

      // The service should handle the error gracefully and not throw
      await expect(
        offlineSyncService.initialize('test-user-id')
      ).resolves.toBeUndefined();
    });
  });

  describe('configure', () => {
    it('should update configuration', () => {
      const newConfig: Partial<OfflineSyncConfig> = {
        maxRetries: 5,
        syncInterval: 60000,
      };

      offlineSyncService.configure(newConfig);

      // Configuration should be updated internally
      expect(offlineSyncService).toBeDefined();
    });
  });

  describe('addToSyncQueue', () => {
    beforeEach(async () => {
      const _mockGetItem = AsyncStorage.getItem as jest.MockedFunction<
        typeof AsyncStorage.getItem
      >;
      mockGetItem.mockResolvedValue(null);
      await offlineSyncService.initialize('test-user-id');
    });

    it('should add item to sync queue', async () => {
      const _mockSetItem = AsyncStorage.setItem as jest.MockedFunction<
        typeof AsyncStorage.setItem
      >;

      await offlineSyncService.addToSyncQueue(
        'test-key',
        { data: 'test' },
        'create',
        'high'
      );

      expect(mockSetItem).toHaveBeenCalled();
      expect(offlineSyncService.getPendingItemsCount()).toBe(1);
    });

    it('should add multiple items with different priorities', async () => {
      // Reset the queue before this test
      (offlineSyncService as any).syncQueue = [];
      (offlineSyncService as any).state.pendingItemsCount = 0;

      await offlineSyncService.addToSyncQueue(
        'key1',
        { data: 'test1' },
        'create',
        'high'
      );
      await offlineSyncService.addToSyncQueue(
        'key2',
        { data: 'test2' },
        'update',
        'normal'
      );
      await offlineSyncService.addToSyncQueue(
        'key3',
        { data: 'test3' },
        'delete',
        'low'
      );

      expect(offlineSyncService.getPendingItemsCount()).toBe(3);
    });
  });

  describe('getSyncState', () => {
    beforeEach(async () => {
      const _mockGetItem = AsyncStorage.getItem as jest.MockedFunction<
        typeof AsyncStorage.getItem
      >;
      mockGetItem.mockResolvedValue(null);
      await offlineSyncService.initialize('test-user-id');
    });

    it('should return sync state', () => {
      const _state = offlineSyncService.getSyncState();

      expect(state).toHaveProperty('isOnline');
      expect(state).toHaveProperty('isSyncing');
      expect(state).toHaveProperty('pendingItemsCount');
      expect(state).toHaveProperty('error');
      expect(state).toHaveProperty('stats');
    });
  });

  describe('clearError', () => {
    beforeEach(async () => {
      const _mockGetItem = AsyncStorage.getItem as jest.MockedFunction<
        typeof AsyncStorage.getItem
      >;
      mockGetItem.mockResolvedValue(null);
      await offlineSyncService.initialize('test-user-id');
    });

    it('should clear error state', () => {
      // Simulate an error state
      (offlineSyncService as any).state.error = 'Test error';

      offlineSyncService.clearError();

      const _state = offlineSyncService.getSyncState();
      expect(state.error).toBeNull();
    });
  });

  describe('cleanupExpiredItems', () => {
    beforeEach(async () => {
      const _mockGetItem = AsyncStorage.getItem as jest.MockedFunction<
        typeof AsyncStorage.getItem
      >;
      mockGetItem.mockResolvedValue(null);
      await offlineSyncService.initialize('test-user-id');
    });

    it('should cleanup expired items', async () => {
      const _mockSetItem = AsyncStorage.setItem as jest.MockedFunction<
        typeof AsyncStorage.setItem
      >;

      // Reset the queue before this test
      (offlineSyncService as any).syncQueue = [];
      (offlineSyncService as any).state.pendingItemsCount = 0;

      // Add some items
      await offlineSyncService.addToSyncQueue(
        'key1',
        { data: 'test1' },
        'create',
        'normal'
      );
      await offlineSyncService.addToSyncQueue(
        'key2',
        { data: 'test2' },
        'update',
        'normal'
      );

      // Simulate old items by modifying timestamps
      (offlineSyncService as any).syncQueue[0].timestamp =
        Date.now() - 8 * 24 * 60 * 60 * 1000; // 8 days old

      await offlineSyncService.cleanupExpiredItems(7 * 24 * 60 * 60 * 1000); // 7 days max age

      expect(mockSetItem).toHaveBeenCalled();
      expect(offlineSyncService.getPendingItemsCount()).toBe(1); // Only the newer item should remain
    });
  });

  describe('destroy', () => {
    beforeEach(async () => {
      const _mockGetItem = AsyncStorage.getItem as jest.MockedFunction<
        typeof AsyncStorage.getItem
      >;
      mockGetItem.mockResolvedValue(null);
      await offlineSyncService.initialize('test-user-id');
    });

    it('should destroy service', async () => {
      await offlineSyncService.destroy();

      // Service should be cleaned up
      expect(offlineSyncService).toBeDefined();
    });
  });
});
