import { FakeCardReportingService } from '../services/reportingService';
import {
  ReportType,
  ReportSeverity,
  ReportStatus,
  WarningType,
  BlacklistType,
} from '../types/reporting';

// Mock logger
jest.mock('../../../core/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('FakeCardReportingService', () => {
  let service: FakeCardReportingService;

  beforeEach(() => {
    service = FakeCardReportingService.getInstance();
    service.destroy();
  });

  afterEach(() => {
    service.destroy();
  });

  describe('getInstance', () => {
    it('should return the same instance', () => {
      const _instance1 = FakeCardReportingService.getInstance();
      const _instance2 = FakeCardReportingService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('initialize', () => {
    it('should initialize the service successfully', async () => {
      const _result = await service.initialize();
      expect(result).toBe(true);
    });

    it('should initialize with default data', async () => {
      await service.initialize();
      const _stats = await service.getReportStats();
      expect(stats.totalReports).toBeGreaterThan(0);
    });
  });

  describe('createReport', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should create a report successfully', async () => {
      const _reportData = {
        title: '測試假卡舉報',
        description: '發現假卡銷售',
        reportedUserId: 'user_001',
        cardId: 'card_001',
        reportType: ReportType.FAKE_CARD,
        severity: ReportSeverity.HIGH,
        priority: 'HIGH',
        contactInfo: 'test@example.com',
        isAnonymous: false,
        evidence: [
          {
            type: 'TEXT',
            content: '假卡證據',
            timestamp: new Date(),
          },
        ],
      };

      const _result = await service.createReport(reportData);
      expect(result.success).toBe(true);
      expect(result.reportId).toBeDefined();
      expect(result.status).toBe(ReportStatus.PENDING);
    });

    it('should handle creation errors', async () => {
      const _invalidData = {} as any;
      const _result = await service.createReport(invalidData);
      expect(result.success).toBe(false);
    });

    it('should create anonymous report', async () => {
      const _reportData = {
        title: '匿名舉報',
        description: '匿名舉報內容',
        reportType: ReportType.FAKE_CARD,
        severity: ReportSeverity.MEDIUM,
        isAnonymous: true,
      };

      const _result = await service.createReport(reportData);
      expect(result.success).toBe(true);
      expect(result.reportId).toBeDefined();
    });

    it('should validate required fields', async () => {
      const _incompleteData = {
        description: '缺少標題',
        reportType: ReportType.FAKE_CARD,
      } as any;

      const _result = await service.createReport(incompleteData);
      expect(result.success).toBe(false);
    });
  });

  describe('getReport', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should get report by ID', async () => {
      const _reportData = {
        title: '測試舉報',
        description: '測試描述',
        reportType: ReportType.FAKE_CARD,
        severity: ReportSeverity.MEDIUM,
      };

      const _createResult = await service.createReport(reportData);
      const _report = await service.getReport(createResult.reportId);

      expect(report).toBeDefined();
      expect(report?.report.title).toBe('測試舉報');
    });

    it('should return null for non-existent report', async () => {
      const _report = await service.getReport('non-existent-id');
      expect(report).toBeNull();
    });
  });

  describe('updateReportStatus', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should update report status successfully', async () => {
      const _reportData = {
        title: '狀態更新測試',
        description: '測試描述',
        reportType: ReportType.FAKE_CARD,
        severity: ReportSeverity.LOW,
      };

      const _createResult = await service.createReport(reportData);
      const _result = await service.updateReportStatus(
        createResult.reportId,
        ReportStatus.INVESTIGATING
      );

      expect(result.success).toBe(true);
    });

    it('should handle invalid status updates', async () => {
      const _result = await service.updateReportStatus(
        'invalid-id',
        ReportStatus.RESOLVED
      );
      expect(result.success).toBe(false);
    });
  });

  describe('createWarning', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should create warning successfully', async () => {
      const _warningData = {
        type: WarningType.SELLER_WARNING,
        targetId: 'user_002',
        targetType: 'SELLER',
        title: '假卡銷售警告',
        message: '請停止銷售假卡',
        severity: ReportSeverity.HIGH,
        isActive: true,
        createdBy: 'moderator_001',
      };

      const _result = await service.createWarning(warningData);
      expect(result.success).toBe(true);
      expect(result.warningId).toBeDefined();
    });

    it('should handle warning creation errors', async () => {
      const _invalidData = {} as any;
      const _result = await service.createWarning(invalidData);
      expect(result.success).toBe(false);
    });

    it('should create different warning types', async () => {
      const _warningData = {
        type: WarningType.BUYER_WARNING,
        targetId: 'user_003',
        targetType: 'BUYER',
        title: '購買假卡警告',
        message: '請謹慎購買',
        severity: ReportSeverity.MEDIUM,
        isActive: true,
        createdBy: 'moderator_001',
      };

      const _result = await service.createWarning(warningData);
      expect(result.success).toBe(true);
    });
  });

  describe('addToBlacklist', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should add user to blacklist successfully', async () => {
      const _blacklistData = {
        type: BlacklistType.USER,
        targetId: 'user_004',
        targetValue: 'user_004',
        reason: '多次違規',
        severity: ReportSeverity.CRITICAL,
        isActive: true,
        createdBy: 'admin_001',
      };

      const _result = await service.addToBlacklist(blacklistData);
      expect(result.success).toBe(true);
      expect(result.blacklistId).toBeDefined();
    });

    it('should add card to blacklist', async () => {
      const _blacklistData = {
        type: BlacklistType.CARD,
        targetId: 'card_002',
        targetValue: 'card_002',
        reason: '假卡',
        severity: ReportSeverity.HIGH,
        isActive: true,
        createdBy: 'moderator_001',
      };

      const _result = await service.addToBlacklist(blacklistData);
      expect(result.success).toBe(true);
    });

    it('should handle blacklist addition errors', async () => {
      const _invalidData = {} as any;
      const _result = await service.addToBlacklist(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('createCommunityWarning', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should create community warning successfully', async () => {
      const _warningData = {
        title: '社區警告',
        message: '請注意防範假卡',
        severity: ReportSeverity.MEDIUM,
        targetAudience: 'ALL',
        isActive: true,
        displayFrom: new Date(),
        createdBy: 'admin_001',
      };

      const _result = await service.createCommunityWarning(warningData);
      expect(result.success).toBe(true);
      expect(result.warningId).toBeDefined();
    });

    it('should handle community warning creation errors', async () => {
      const _invalidData = {} as any;
      const _result = await service.createCommunityWarning(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('getReportStats', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should return report statistics', async () => {
      const _stats = await service.getReportStats();
      expect(stats).toBeDefined();
      expect(stats.totalReports).toBeGreaterThanOrEqual(0);
      expect(stats.pendingReports).toBeGreaterThanOrEqual(0);
      expect(stats.resolvedReports).toBeGreaterThanOrEqual(0);
    });

    it('should calculate correct statistics', async () => {
      // Create一些TestData
      await service.createReport({
        title: '統計測試1',
        description: '測試1',
        reportType: ReportType.FAKE_CARD,
        severity: ReportSeverity.LOW,
      });

      await service.createReport({
        title: '統計測試2',
        description: '測試2',
        reportType: ReportType.FAKE_CARD,
        severity: ReportSeverity.MEDIUM,
      });

      const _stats = await service.getReportStats();
      expect(stats.totalReports).toBeGreaterThanOrEqual(2);
    });
  });

  describe('queryReports', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should query reports with filters', async () => {
      const _queryParams = {
        status: ReportStatus.PENDING,
        severity: ReportSeverity.HIGH,
        limit: 10,
        offset: 0,
      };

      const _result = await service.queryReports(queryParams);
      expect(result.success).toBe(true);
      expect(result.reports).toBeDefined();
    });

    it('should handle empty query results', async () => {
      const _queryParams = {
        status: ReportStatus.RESOLVED,
        severity: ReportSeverity.CRITICAL,
      };

      const _result = await service.queryReports(queryParams);
      expect(result.success).toBe(true);
      expect(result.reports).toBeDefined();
    });

    it('should paginate results correctly', async () => {
      const _queryParams = {
        limit: 5,
        offset: 0,
      };

      const _result = await service.queryReports(queryParams);
      expect(result.success).toBe(true);
      expect(result.reports.length).toBeLessThanOrEqual(5);
    });
  });

  describe('getUserWarnings', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should get user warnings', async () => {
      const _warnings = await service.getUserWarnings('user_001');
      expect(warnings).toBeDefined();
      expect(Array.isArray(warnings)).toBe(true);
    });

    it('should return empty array for user without warnings', async () => {
      const _warnings = await service.getUserWarnings('user_without_warnings');
      expect(warnings).toEqual([]);
    });
  });

  describe('isUserBlacklisted', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should check if user is blacklisted', async () => {
      const _isBlacklisted = await service.isUserBlacklisted('user_001');
      expect(typeof isBlacklisted).toBe('boolean');
    });

    it('should return false for non-blacklisted user', async () => {
      const _isBlacklisted = await service.isUserBlacklisted(
        'non_blacklisted_user'
      );
      expect(isBlacklisted).toBe(false);
    });
  });

  describe('getActiveCommunityWarnings', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should get active community warnings', async () => {
      const _warnings = await service.getActiveCommunityWarnings();
      expect(warnings).toBeDefined();
      expect(Array.isArray(warnings)).toBe(true);
    });

    it('should only return active warnings', async () => {
      const _warnings = await service.getActiveCommunityWarnings();
      warnings.forEach(warning => {
        expect(warning.isActive).toBe(true);
      });
    });
  });

  describe('destroy', () => {
    it('should destroy service instance', async () => {
      await service.initialize();
      service.destroy();

      // ReInitialize應該正常工作
      const _result = await service.initialize();
      expect(result).toBe(true);
    });
  });

  describe('Edge cases and error handling', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should handle concurrent report creation', async () => {
      const _reportData = {
        title: '並發測試',
        description: '並發測試描述',
        reportType: ReportType.FAKE_CARD,
        severity: ReportSeverity.MEDIUM,
      };

      const _promises = Array(5)
        .fill(null)
        .map(() => service.createReport(reportData));

      const _results = await Promise.all(promises);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });

    it('should handle invalid report types', async () => {
      const _reportData = {
        title: '無效類型測試',
        description: '測試描述',
        reportType: 'INVALID_TYPE' as any,
        severity: ReportSeverity.LOW,
      };

      const _result = await service.createReport(reportData);
      expect(result.success).toBe(false);
    });

    it('should handle invalid severity levels', async () => {
      const _reportData = {
        title: '無效嚴重程度測試',
        description: '測試描述',
        reportType: ReportType.FAKE_CARD,
        severity: 'INVALID_SEVERITY' as any,
      };

      const _result = await service.createReport(reportData);
      expect(result.success).toBe(false);
    });

    it('should handle very long report descriptions', async () => {
      const _longDescription = 'A'.repeat(10000);
      const _reportData = {
        title: '長描述測試',
        description: longDescription,
        reportType: ReportType.FAKE_CARD,
        severity: ReportSeverity.LOW,
      };

      const _result = await service.createReport(reportData);
      expect(result.success).toBe(true);
    });

    it('should handle special characters in report data', async () => {
      const _reportData = {
        title: '特殊字符測試 🚀',
        description: '包含特殊字符的描述：!@#$%^&*()_+-=[]{}|;:,.<>?',
        reportType: ReportType.FAKE_CARD,
        severity: ReportSeverity.MEDIUM,
      };

      const _result = await service.createReport(reportData);
      expect(result.success).toBe(true);
    });
  });

  describe('Data validation', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should validate report title length', async () => {
      const _reportData = {
        title: '', // Empty標題
        description: '測試描述',
        reportType: ReportType.FAKE_CARD,
        severity: ReportSeverity.LOW,
      };

      const _result = await service.createReport(reportData);
      expect(result.success).toBe(false);
    });

    it('should validate report description length', async () => {
      const _reportData = {
        title: '標題測試',
        description: '', // EmptyDescription
        reportType: ReportType.FAKE_CARD,
        severity: ReportSeverity.LOW,
      };

      const _result = await service.createReport(reportData);
      expect(result.success).toBe(false);
    });

    it('should validate email format in contact info', async () => {
      const _reportData = {
        title: '聯繫信息測試',
        description: '測試描述',
        reportType: ReportType.FAKE_CARD,
        severity: ReportSeverity.LOW,
        contactInfo: 'invalid-email', // 無效Email
      };

      const _result = await service.createReport(reportData);
      expect(result.success).toBe(false);
    });
  });
});
