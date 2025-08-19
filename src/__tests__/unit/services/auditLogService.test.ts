import { auditLogService, AuditEvent, AuditSeverity, AuditEventStatus, OperationResult } from '../../../services/auditLogService';
import { storage } from '../../../utils/storage';

// Mock dependencies
jest.mock('../../../utils/storage');
jest.mock('../../../utils/logger');
jest.mock('../../../services/notificationService');
jest.mock('../../../services/apiService');

const mockStorage = storage as jest.Mocked<typeof storage>;

describe('AuditLogService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage.get.mockResolvedValue(null);
    mockStorage.set.mockResolvedValue();
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      await expect(auditLogService.initialize()).resolves.not.toThrow();
    });

    it('should load configuration from storage', async () => {
      const mockConfig = {
        enabled: false,
        logLevel: 'high',
        retentionDays: 180
      };
      mockStorage.get.mockResolvedValueOnce(mockConfig);

      await auditLogService.initialize();

      expect(mockStorage.get).toHaveBeenCalledWith('auditLogConfig');
    });
  });

  describe('event logging', () => {
    it('should log event with default values', async () => {
      const eventData = {
        title: 'Test Event',
        description: 'Test description',
        eventType: 'user_login' as const,
        severity: 'medium' as AuditSeverity
      };

      const eventId = await auditLogService.logEvent(eventData);

      expect(eventId).toBeDefined();
      expect(mockStorage.set).toHaveBeenCalled();
    });

    it('should not log event when service is disabled', async () => {
      // Mock disabled configuration
      mockStorage.get.mockResolvedValueOnce({ enabled: false });

      await auditLogService.initialize();

      const eventId = await auditLogService.logEvent({
        title: 'Test Event',
        eventType: 'user_login'
      });

      expect(eventId).toBe('');
    });

    it('should not log event below log level', async () => {
      // Mock high log level configuration
      mockStorage.get.mockResolvedValueOnce({ logLevel: 'high' });

      await auditLogService.initialize();

      const eventId = await auditLogService.logEvent({
        title: 'Test Event',
        eventType: 'user_login',
        severity: 'low'
      });

      expect(eventId).toBe('');
    });

    it('should log event with full details', async () => {
      const eventData = {
        title: 'Full Test Event',
        description: 'Complete test event with all details',
        eventType: 'data_export' as const,
        severity: 'high' as AuditSeverity,
        status: 'success' as AuditEventStatus,
        result: 'success' as OperationResult,
        userId: 'user-123',
        userEmail: 'test@example.com',
        userRole: 'admin',
        ipAddress: '192.168.1.100',
        location: 'Taipei, Taiwan',
        resourceType: 'data_export',
        resourceId: 'export-123',
        resourceName: 'User Data Export',
        sessionId: 'session-123',
        requestId: 'request-123',
        traceId: 'trace-123',
        errorCode: 'SUCCESS',
        errorMessage: 'Export completed successfully',
        complianceTags: ['gdpr', 'ccpa'],
        regulatoryRequirements: ['data_protection'],
        auditTrail: ['step1', 'step2'],
        relatedEvents: ['event-1', 'event-2']
      };

      const eventId = await auditLogService.logEvent(eventData);

      expect(eventId).toBeDefined();
    });
  });

  describe('event querying', () => {
    it('should query events with filters', async () => {
      const mockEvents: AuditEvent[] = [
        {
          id: 'test-1',
          eventType: 'user_login',
          severity: 'medium',
          status: 'success',
          result: 'success',
          title: 'Test Login',
          description: 'Test login event',
          timestamp: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockStorage.get.mockResolvedValueOnce(mockEvents);

      const query = {
        page: 1,
        limit: 10,
        eventTypes: ['user_login'],
        severities: ['medium'],
        sortBy: 'timestamp',
        sortOrder: 'desc' as const
      };

      const result = await auditLogService.queryEvents(query);

      expect(result.events).toEqual(mockEvents);
      expect(result.totalCount).toBe(1);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(result.hasMore).toBe(false);
    });

    it('should filter events by date range', async () => {
      const mockEvents: AuditEvent[] = [
        {
          id: 'test-1',
          eventType: 'user_login',
          severity: 'medium',
          status: 'success',
          result: 'success',
          title: 'Test Login',
          description: 'Test login event',
          timestamp: new Date('2024-01-01'),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'test-2',
          eventType: 'user_logout',
          severity: 'low',
          status: 'success',
          result: 'success',
          title: 'Test Logout',
          description: 'Test logout event',
          timestamp: new Date('2024-01-15'),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockStorage.get.mockResolvedValueOnce(mockEvents);

      const query = {
        page: 1,
        limit: 10,
        startDate: new Date('2024-01-10'),
        endDate: new Date('2024-01-20')
      };

      const result = await auditLogService.queryEvents(query);

      expect(result.events).toHaveLength(1);
      expect(result.events[0].id).toBe('test-2');
    });

    it('should search events by text', async () => {
      const mockEvents: AuditEvent[] = [
        {
          id: 'test-1',
          eventType: 'user_login',
          severity: 'medium',
          status: 'success',
          result: 'success',
          title: 'User Login',
          description: 'User logged in successfully',
          timestamp: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'test-2',
          eventType: 'data_export',
          severity: 'high',
          status: 'success',
          result: 'success',
          title: 'Data Export',
          description: 'Data exported to CSV',
          timestamp: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockStorage.get.mockResolvedValueOnce(mockEvents);

      const query = {
        page: 1,
        limit: 10,
        searchText: 'login'
      };

      const result = await auditLogService.queryEvents(query);

      expect(result.events).toHaveLength(1);
      expect(result.events[0].id).toBe('test-1');
    });
  });

  describe('statistics', () => {
    it('should calculate statistics correctly', async () => {
      const mockEvents: AuditEvent[] = [
        {
          id: 'test-1',
          eventType: 'user_login',
          severity: 'medium',
          status: 'success',
          result: 'success',
          title: 'Login 1',
          description: 'User login',
          timestamp: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'test-2',
          eventType: 'user_login',
          severity: 'high',
          status: 'failure',
          result: 'failure',
          title: 'Login 2',
          description: 'Failed login',
          timestamp: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'test-3',
          eventType: 'data_export',
          severity: 'critical',
          status: 'success',
          result: 'success',
          title: 'Export',
          description: 'Data export',
          timestamp: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockStorage.get.mockResolvedValueOnce(mockEvents);

      const stats = await auditLogService.getStatistics();

      expect(stats.totalEvents).toBe(3);
      expect(stats.eventsByType.user_login).toBe(2);
      expect(stats.eventsByType.data_export).toBe(1);
      expect(stats.eventsBySeverity.medium).toBe(1);
      expect(stats.eventsBySeverity.high).toBe(1);
      expect(stats.eventsBySeverity.critical).toBe(1);
      expect(stats.eventsByStatus.success).toBe(2);
      expect(stats.eventsByStatus.failure).toBe(1);
      expect(stats.errorRate).toBe(33.33333333333333);
    });

    it('should handle empty events list', async () => {
      mockStorage.get.mockResolvedValueOnce([]);

      const stats = await auditLogService.getStatistics();

      expect(stats.totalEvents).toBe(0);
      expect(stats.errorRate).toBe(0);
      expect(stats.securityEvents).toBe(0);
      expect(stats.failedLoginAttempts).toBe(0);
      expect(stats.suspiciousActivities).toBe(0);
    });
  });

  describe('report generation', () => {
    it('should generate report successfully', async () => {
      const mockEvents: AuditEvent[] = [
        {
          id: 'test-1',
          eventType: 'user_login',
          severity: 'medium',
          status: 'success',
          result: 'success',
          title: 'Test Event',
          description: 'Test description',
          timestamp: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockStorage.get.mockResolvedValueOnce(mockEvents);

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const report = await auditLogService.generateReport({
        type: 'summary',
        startDate,
        endDate,
        format: 'json'
      });

      expect(report.id).toBeDefined();
      expect(report.title).toBe('summary 審計報告');
      expect(report.type).toBe('summary');
      expect(report.startDate).toEqual(startDate);
      expect(report.endDate).toEqual(endDate);
      expect(report.status).toBe('completed');
      expect(report.statistics).toBeDefined();
      expect(report.events).toHaveLength(1);
      expect(report.summary).toBeDefined();
      expect(report.recommendations).toBeInstanceOf(Array);
    });
  });

  describe('export functionality', () => {
    it('should export logs in JSON format', async () => {
      const mockEvents: AuditEvent[] = [
        {
          id: 'test-1',
          eventType: 'user_login',
          severity: 'medium',
          status: 'success',
          result: 'success',
          title: 'Test Event',
          description: 'Test description',
          timestamp: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockStorage.get.mockResolvedValueOnce(mockEvents);

      const fileName = await auditLogService.exportLogs({
        format: 'json',
        compression: false,
        encryption: false,
        includeDetails: true,
        includeMetadata: true,
        includeStackTrace: false,
        filters: {
          page: 1,
          limit: 10
        },
        batchSize: 1000,
        maxRecords: 10000
      });

      expect(fileName).toMatch(/audit_logs_\d{4}-\d{2}-\d{2}\.json$/);
      expect(mockStorage.set).toHaveBeenCalled();
    });

    it('should export logs in CSV format', async () => {
      const mockEvents: AuditEvent[] = [
        {
          id: 'test-1',
          eventType: 'user_login',
          severity: 'medium',
          status: 'success',
          result: 'success',
          title: 'Test Event',
          description: 'Test description',
          timestamp: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockStorage.get.mockResolvedValueOnce(mockEvents);

      const fileName = await auditLogService.exportLogs({
        format: 'csv',
        compression: false,
        encryption: false,
        includeDetails: true,
        includeMetadata: true,
        includeStackTrace: false,
        filters: {
          page: 1,
          limit: 10
        },
        batchSize: 1000,
        maxRecords: 10000
      });

      expect(fileName).toMatch(/audit_logs_\d{4}-\d{2}-\d{2}\.csv$/);
    });

    it('should export logs in XML format', async () => {
      const mockEvents: AuditEvent[] = [
        {
          id: 'test-1',
          eventType: 'user_login',
          severity: 'medium',
          status: 'success',
          result: 'success',
          title: 'Test Event',
          description: 'Test description',
          timestamp: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockStorage.get.mockResolvedValueOnce(mockEvents);

      const fileName = await auditLogService.exportLogs({
        format: 'xml',
        compression: false,
        encryption: false,
        includeDetails: true,
        includeMetadata: true,
        includeStackTrace: false,
        filters: {
          page: 1,
          limit: 10
        },
        batchSize: 1000,
        maxRecords: 10000
      });

      expect(fileName).toMatch(/audit_logs_\d{4}-\d{2}-\d{2}\.xml$/);
    });

    it('should throw error for unsupported format', async () => {
      await expect(auditLogService.exportLogs({
        format: 'pdf' as any,
        compression: false,
        encryption: false,
        includeDetails: true,
        includeMetadata: true,
        includeStackTrace: false,
        filters: {
          page: 1,
          limit: 10
        },
        batchSize: 1000,
        maxRecords: 10000
      })).rejects.toThrow('不支持的導出格式: pdf');
    });
  });

  describe('cleanup functionality', () => {
    it('should cleanup old logs', async () => {
      const oldDate = new Date(Date.now() - 400 * 24 * 60 * 60 * 1000); // 400 days ago
      const recentDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days ago

      const mockEvents: AuditEvent[] = [
        {
          id: 'old-1',
          eventType: 'user_login',
          severity: 'medium',
          status: 'success',
          result: 'success',
          title: 'Old Event',
          description: 'Old event to be deleted',
          timestamp: oldDate,
          createdAt: oldDate,
          updatedAt: oldDate
        },
        {
          id: 'recent-1',
          eventType: 'user_login',
          severity: 'medium',
          status: 'success',
          result: 'success',
          title: 'Recent Event',
          description: 'Recent event to keep',
          timestamp: recentDate,
          createdAt: recentDate,
          updatedAt: recentDate
        }
      ];

      mockStorage.get.mockResolvedValueOnce(mockEvents);

      await auditLogService.cleanupLogs({
        retentionDays: 365,
        deleteEvents: ['user_login'],
        archiveEvents: [],
        compressArchives: false,
        backupBeforeCleanup: false
      });

      expect(mockStorage.set).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle storage errors gracefully', async () => {
      mockStorage.get.mockRejectedValueOnce(new Error('Storage error'));

      const events = await auditLogService.queryEvents({
        page: 1,
        limit: 10
      });

      expect(events.events).toEqual([]);
      expect(events.totalCount).toBe(0);
    });

    it('should handle event logging errors', async () => {
      mockStorage.set.mockRejectedValueOnce(new Error('Save error'));

      await expect(
        auditLogService.logEvent({
          title: 'Error Test'
        })
      ).rejects.toThrow('Save error');
    });

    it('should handle statistics calculation errors', async () => {
      mockStorage.get.mockRejectedValueOnce(new Error('Storage error'));

      await expect(auditLogService.getStatistics()).rejects.toThrow('Storage error');
    });
  });

  describe('service lifecycle', () => {
    it('should stop service correctly', async () => {
      await auditLogService.initialize();
      await auditLogService.stop();

      // Service should be stopped
      expect(true).toBe(true); // Basic assertion that stop doesn't throw
    });
  });
});
