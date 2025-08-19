import { dataBreachNotificationService, DataBreachEvent, RiskLevel } from '../../../services/dataBreachNotificationService';
import { storage } from '../../../utils/storage';

// Mock dependencies
jest.mock('../../../utils/storage');
jest.mock('../../../utils/logger');
jest.mock('../../../services/notificationService');

const mockStorage = storage as jest.Mocked<typeof storage>;

describe('DataBreachNotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage.get.mockResolvedValue(null);
    mockStorage.set.mockResolvedValue();
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      await expect(dataBreachNotificationService.initialize()).resolves.not.toThrow();
    });

    it('should load configuration from storage', async () => {
      const mockConfig = {
        enableAutoNotification: false,
        notificationDelay: 2,
        regulatoryDeadline: 48
      };
      mockStorage.get.mockResolvedValueOnce(mockConfig);

      await dataBreachNotificationService.initialize();

      expect(mockStorage.get).toHaveBeenCalledWith('dataBreachNotificationConfig');
    });
  });

  describe('breach event creation', () => {
    it('should create a breach event with default values', async () => {
      const eventData = {
        title: 'Test Breach',
        description: 'Test description',
        breachType: 'unauthorized_access' as const,
        riskLevel: 'medium' as RiskLevel
      };

      const event = await dataBreachNotificationService.createBreachEvent(eventData);

      expect(event.id).toBeDefined();
      expect(event.title).toBe('Test Breach');
      expect(event.description).toBe('Test description');
      expect(event.breachType).toBe('unauthorized_access');
      expect(event.riskLevel).toBe('medium');
      expect(event.status).toBe('discovered');
      expect(event.regulatoryNotification).toBe(false);
      expect(event.userNotification).toBe(false);
      expect(event.discoveryDate).toBeInstanceOf(Date);
      expect(event.complianceDeadline).toBeInstanceOf(Date);
    });

    it('should create a breach event with custom affected data', async () => {
      const eventData = {
        title: 'Custom Breach',
        affectedData: {
          dataCategories: ['personal_info', 'contact_info'],
          affectedUsers: 100,
          dataSensitivity: 'high' as const,
          estimatedRecords: 500
        }
      };

      const event = await dataBreachNotificationService.createBreachEvent(eventData);

      expect(event.affectedData.affectedUsers).toBe(100);
      expect(event.affectedData.estimatedRecords).toBe(500);
      expect(event.affectedData.dataSensitivity).toBe('high');
      expect(event.affectedData.dataCategories).toEqual(['personal_info', 'contact_info']);
    });
  });

  describe('event management', () => {
    it('should get all breach events', async () => {
      const mockEvents: DataBreachEvent[] = [
        {
          id: 'test-1',
          title: 'Test Event 1',
          description: 'Test description 1',
          breachType: 'unauthorized_access',
          riskLevel: 'medium',
          affectedData: {
            dataCategories: [],
            affectedUsers: 0,
            dataSensitivity: 'low',
            estimatedRecords: 0
          },
          discoveryDate: new Date(),
          status: 'discovered',
          regulatoryNotification: false,
          userNotification: false,
          affectedRegions: ['TW'],
          complianceDeadline: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockStorage.get.mockResolvedValueOnce(mockEvents);

      const events = await dataBreachNotificationService.getBreachEvents();

      expect(events).toEqual(mockEvents);
      expect(mockStorage.get).toHaveBeenCalledWith('dataBreachEvents');
    });

    it('should update event status', async () => {
      const mockEvents: DataBreachEvent[] = [
        {
          id: 'test-1',
          title: 'Test Event',
          description: 'Test description',
          breachType: 'unauthorized_access',
          riskLevel: 'medium',
          affectedData: {
            dataCategories: [],
            affectedUsers: 0,
            dataSensitivity: 'low',
            estimatedRecords: 0
          },
          discoveryDate: new Date(),
          status: 'discovered',
          regulatoryNotification: false,
          userNotification: false,
          affectedRegions: ['TW'],
          complianceDeadline: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockStorage.get.mockResolvedValueOnce(mockEvents);

      await dataBreachNotificationService.updateEventStatus('test-1', 'investigating');

      expect(mockStorage.set).toHaveBeenCalled();
    });
  });

  describe('statistics', () => {
    it('should calculate statistics correctly', async () => {
      const mockEvents: DataBreachEvent[] = [
        {
          id: 'test-1',
          title: 'Critical Event',
          description: 'Critical description',
          breachType: 'data_exfiltration',
          riskLevel: 'critical',
          affectedData: {
            dataCategories: [],
            affectedUsers: 100,
            dataSensitivity: 'high',
            estimatedRecords: 1000
          },
          discoveryDate: new Date(),
          status: 'resolved',
          regulatoryNotification: true,
          userNotification: true,
          affectedRegions: ['TW'],
          complianceDeadline: new Date(),
          resolutionDate: new Date(Date.now() + 3600000), // 1 hour later
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'test-2',
          title: 'High Event',
          description: 'High description',
          breachType: 'unauthorized_access',
          riskLevel: 'high',
          affectedData: {
            dataCategories: [],
            affectedUsers: 50,
            dataSensitivity: 'medium',
            estimatedRecords: 500
          },
          discoveryDate: new Date(),
          status: 'discovered',
          regulatoryNotification: false,
          userNotification: false,
          affectedRegions: ['TW'],
          complianceDeadline: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockStorage.get.mockResolvedValueOnce(mockEvents);

      const stats = await dataBreachNotificationService.getStatistics();

      expect(stats.totalEvents).toBe(2);
      expect(stats.criticalEvents).toBe(1);
      expect(stats.highRiskEvents).toBe(1);
      expect(stats.pendingNotifications).toBe(1); // Only the second event hasn't sent notifications
      expect(stats.complianceRate).toBe(50); // Only 1 out of 2 events are compliant
    });

    it('should handle empty events list', async () => {
      mockStorage.get.mockResolvedValueOnce([]);

      const stats = await dataBreachNotificationService.getStatistics();

      expect(stats.totalEvents).toBe(0);
      expect(stats.criticalEvents).toBe(0);
      expect(stats.highRiskEvents).toBe(0);
      expect(stats.pendingNotifications).toBe(0);
      expect(stats.complianceRate).toBe(100);
    });
  });

  describe('monitoring', () => {
    it('should start monitoring', async () => {
      await dataBreachNotificationService.startMonitoring();

      // Note: In a real test, you might want to verify that the interval is set
      // This is challenging with the current implementation
    });

    it('should stop monitoring', async () => {
      await dataBreachNotificationService.startMonitoring();
      await dataBreachNotificationService.stopMonitoring();

      // Note: In a real test, you might want to verify that the interval is cleared
    });
  });

  describe('manual event creation', () => {
    it('should create manual breach event', async () => {
      const eventData = {
        title: 'Manual Test Event',
        description: 'Manual test description',
        breachType: 'accidental_disclosure' as const,
        riskLevel: 'low' as RiskLevel
      };

      const event = await dataBreachNotificationService.createManualBreachEvent(eventData);

      expect(event.title).toBe('Manual Test Event');
      expect(event.breachType).toBe('accidental_disclosure');
      expect(event.riskLevel).toBe('low');
    });
  });

  describe('error handling', () => {
    it('should handle storage errors gracefully', async () => {
      mockStorage.get.mockRejectedValueOnce(new Error('Storage error'));

      const events = await dataBreachNotificationService.getBreachEvents();

      expect(events).toEqual([]);
    });

    it('should handle event creation errors', async () => {
      mockStorage.set.mockRejectedValueOnce(new Error('Save error'));

      await expect(
        dataBreachNotificationService.createBreachEvent({
          title: 'Error Test'
        })
      ).rejects.toThrow('Save error');
    });
  });
});
