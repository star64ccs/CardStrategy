// 生物識別認證服務單元測試
import { BiometricAuthService } from '../../../../features/auth/services/biometricAuthService';
import { mockApiError, mockApiResponse } from '../../../fixtures/test-utils';

// Mock 外部依賴
jest.mock('../../../../features/auth/services/iosBiometricService');
jest.mock('../../../../features/auth/services/androidBiometricService');

describe('BiometricAuthService', () => {
  let biometricAuthService: BiometricAuthService;

  beforeEach(() => {
    biometricAuthService = {
      checkBiometricAvailability: jest.fn(),
      registerBiometric: jest.fn(),
      verifyBiometric: jest.fn(),
      deleteBiometric: jest.fn(),
      updateBiometric: jest.fn(),
      initialize: jest.fn(),
      getServiceStats: jest.fn(),
    } as any;
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('生物識別可用性檢查', () => {
    it('應該檢測到可用的指紋識別', async () => {
      // Arrange
      const mockBiometricData = {
        available: true,
        type: 'fingerprint',
        enrolled: true,
      };

      const mockResponse = mockApiResponse(mockBiometricData);
      (
        biometricAuthService.checkBiometricAvailability as jest.Mock
      ).mockResolvedValue(mockResponse);

      // Act
      const result = await biometricAuthService.checkBiometricAvailability();

      // Assert
      expect(result).toEqual({
        success: true,
        available: true,
        type: 'fingerprint',
        enrolled: true,
      });
    });

    it('應該檢測到可用的面部識別', async () => {
      // Arrange
      const mockBiometricData = {
        available: true,
        type: 'face',
        enrolled: true,
      };

      const mockResponse = mockApiResponse(mockBiometricData);
      (
        biometricAuthService.checkBiometricAvailability as jest.Mock
      ).mockResolvedValue(mockResponse);

      // Act
      const result = await biometricAuthService.checkBiometricAvailability();

      // Assert
      expect(result).toEqual({
        success: true,
        available: true,
        type: 'face',
        enrolled: true,
      });
    });

    it('應該檢測到生物識別不可用', async () => {
      // Arrange
      const mockBiometricData = {
        available: false,
        type: null,
        enrolled: false,
      };

      const mockResponse = mockApiResponse(mockBiometricData);
      (
        biometricAuthService.checkBiometricAvailability as jest.Mock
      ).mockResolvedValue(mockResponse);

      // Act
      const result = await biometricAuthService.checkBiometricAvailability();

      // Assert
      expect(result).toEqual({
        success: true,
        available: false,
        type: null,
        enrolled: false,
      });
    });
  });

  describe('生物識別註冊', () => {
    it('應該成功註冊指紋', async () => {
      // Arrange
      const mockUserData = {
        userId: '1',
        biometricType: 'fingerprint',
        template: 'mock_template_data',
      };

      const mockResponse = mockApiResponse({
        biometricId: 'bio_123',
        template: 'mock_template_data',
        createdAt: new Date().toISOString(),
      });

      (biometricAuthService.registerBiometric as jest.Mock).mockResolvedValue(
        mockResponse
      );

      // Act
      const result = await biometricAuthService.registerBiometric(mockUserData);

      // Assert
      expect(result).toEqual({
        success: true,
        biometricId: 'bio_123',
        template: 'mock_template_data',
        createdAt: expect.any(String),
      });
    });

    it('應該成功註冊面部識別', async () => {
      // Arrange
      const mockUserData = {
        userId: '1',
        biometricType: 'face',
        template: 'mock_face_template_data',
      };

      const mockResponse = mockApiResponse({
        biometricId: 'bio_456',
        template: 'mock_face_template_data',
        createdAt: new Date().toISOString(),
      });

      (biometricAuthService.registerBiometric as jest.Mock).mockResolvedValue(
        mockResponse
      );

      // Act
      const result = await biometricAuthService.registerBiometric(mockUserData);

      // Assert
      expect(result).toEqual({
        success: true,
        biometricId: 'bio_456',
        template: 'mock_face_template_data',
        createdAt: expect.any(String),
      });
    });

    it('應該拒絕重複註冊', async () => {
      // Arrange
      const mockUserData = {
        userId: '1',
        biometricType: 'fingerprint',
        template: 'mock_template_data',
      };

      (biometricAuthService.registerBiometric as jest.Mock).mockImplementation(
        () => mockApiError('Biometric already registered')
      );

      // Act & Assert
      await expect(
        biometricAuthService.registerBiometric(mockUserData)
      ).rejects.toThrow('Biometric already registered');
    });
  });

  describe('生物識別驗證', () => {
    it('應該成功驗證指紋', async () => {
      // Arrange
      const mockBiometricData = {
        userId: '1',
        biometricType: 'fingerprint',
        template: 'mock_template_data',
      };

      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
      };

      const mockResponse = mockApiResponse({
        verified: true,
        user: mockUser,
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
      });

      (biometricAuthService.verifyBiometric as jest.Mock).mockResolvedValue(
        mockResponse
      );

      // Act
      const result =
        await biometricAuthService.verifyBiometric(mockBiometricData);

      // Assert
      expect(result).toEqual({
        success: true,
        verified: true,
        user: mockUser,
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
      });
    });

    it('應該成功驗證面部識別', async () => {
      // Arrange
      const mockBiometricData = {
        userId: '1',
        biometricType: 'face',
        template: 'mock_face_template_data',
      };

      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
      };

      const mockResponse = mockApiResponse({
        verified: true,
        user: mockUser,
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
      });

      (biometricAuthService.verifyBiometric as jest.Mock).mockResolvedValue(
        mockResponse
      );

      // Act
      const result =
        await biometricAuthService.verifyBiometric(mockBiometricData);

      // Assert
      expect(result).toEqual({
        success: true,
        verified: true,
        user: mockUser,
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
      });
    });

    it('應該拒絕無效的生物識別數據', async () => {
      // Arrange
      const mockBiometricData = {
        userId: '1',
        biometricType: 'fingerprint',
        template: 'invalid_template',
      };

      (biometricAuthService.verifyBiometric as jest.Mock).mockImplementation(
        () => mockApiError('Biometric verification failed')
      );

      // Act & Assert
      await expect(
        biometricAuthService.verifyBiometric(mockBiometricData)
      ).rejects.toThrow('Biometric verification failed');
    });
  });

  describe('生物識別刪除', () => {
    it('應該成功刪除生物識別數據', async () => {
      // Arrange
      const biometricId = 'bio_123';

      const mockResponse = mockApiResponse({
        message: 'Biometric data deleted successfully',
      });

      (biometricAuthService.deleteBiometric as jest.Mock).mockResolvedValue(
        mockResponse
      );

      // Act
      const result = await biometricAuthService.deleteBiometric(biometricId);

      // Assert
      expect(result).toEqual({
        success: true,
        message: 'Biometric data deleted successfully',
      });
    });

    it('應該拒絕刪除不存在的生物識別數據', async () => {
      // Arrange
      const invalidBiometricId = 'invalid_bio_id';

      (biometricAuthService.deleteBiometric as jest.Mock).mockImplementation(
        () => mockApiError('Biometric data not found')
      );

      // Act & Assert
      await expect(
        biometricAuthService.deleteBiometric(invalidBiometricId)
      ).rejects.toThrow('Biometric data not found');
    });
  });

  describe('生物識別更新', () => {
    it('應該成功更新生物識別數據', async () => {
      // Arrange
      const mockUpdateData = {
        biometricId: 'bio_123',
        template: 'updated_template_data',
      };

      const mockResponse = mockApiResponse({
        biometricId: 'bio_123',
        template: 'updated_template_data',
        updatedAt: new Date().toISOString(),
      });

      (biometricAuthService.updateBiometric as jest.Mock).mockResolvedValue(
        mockResponse
      );

      // Act
      const result = await biometricAuthService.updateBiometric(mockUpdateData);

      // Assert
      expect(result).toEqual({
        success: true,
        biometricId: 'bio_123',
        template: 'updated_template_data',
        updatedAt: expect.any(String),
      });
    });

    it('應該拒絕更新不存在的生物識別數據', async () => {
      // Arrange
      const mockUpdateData = {
        biometricId: 'invalid_bio_id',
        template: 'updated_template_data',
      };

      (biometricAuthService.updateBiometric as jest.Mock).mockImplementation(
        () => mockApiError('Biometric data not found')
      );

      // Act & Assert
      await expect(
        biometricAuthService.updateBiometric(mockUpdateData)
      ).rejects.toThrow('Biometric data not found');
    });
  });

  describe('邊界條件測試', () => {
    it('應該處理空的生物識別數據', async () => {
      // Arrange
      const emptyBiometricData = {
        userId: '',
        biometricType: '',
        template: '',
      };

      (biometricAuthService.verifyBiometric as jest.Mock).mockImplementation(
        () => mockApiError('Invalid biometric data')
      );

      // Act & Assert
      await expect(
        biometricAuthService.verifyBiometric(emptyBiometricData)
      ).rejects.toThrow('Invalid biometric data');
    });

    it('應該處理無效的生物識別類型', async () => {
      // Arrange
      const invalidBiometricData = {
        userId: '1',
        biometricType: 'invalid_type',
        template: 'mock_template_data',
      };

      (biometricAuthService.verifyBiometric as jest.Mock).mockImplementation(
        () => mockApiError('Invalid biometric type')
      );

      // Act & Assert
      await expect(
        biometricAuthService.verifyBiometric(invalidBiometricData)
      ).rejects.toThrow('Invalid biometric type');
    });

    it('應該處理超長的模板數據', async () => {
      // Arrange
      const longTemplateData = {
        userId: '1',
        biometricType: 'fingerprint',
        template: 'a'.repeat(10000),
      };

      (biometricAuthService.verifyBiometric as jest.Mock).mockImplementation(
        () => mockApiError('Template data too long')
      );

      // Act & Assert
      await expect(
        biometricAuthService.verifyBiometric(longTemplateData)
      ).rejects.toThrow('Template data too long');
    });
  });

  describe('錯誤處理', () => {
    it('應該處理生物識別硬件錯誤', async () => {
      // Arrange
      const mockBiometricData = {
        userId: '1',
        biometricType: 'fingerprint',
        template: 'mock_template_data',
      };

      (biometricAuthService.verifyBiometric as jest.Mock).mockImplementation(
        () => mockApiError('Biometric hardware error')
      );

      // Act & Assert
      await expect(
        biometricAuthService.verifyBiometric(mockBiometricData)
      ).rejects.toThrow('Biometric hardware error');
    });

    it('應該處理生物識別權限錯誤', async () => {
      // Arrange
      const mockBiometricData = {
        userId: '1',
        biometricType: 'fingerprint',
        template: 'mock_template_data',
      };

      (biometricAuthService.verifyBiometric as jest.Mock).mockImplementation(
        () => mockApiError('Biometric permission denied')
      );

      // Act & Assert
      await expect(
        biometricAuthService.verifyBiometric(mockBiometricData)
      ).rejects.toThrow('Biometric permission denied');
    });

    it('應該處理生物識別超時錯誤', async () => {
      // Arrange
      const mockBiometricData = {
        userId: '1',
        biometricType: 'fingerprint',
        template: 'mock_template_data',
      };

      (biometricAuthService.verifyBiometric as jest.Mock).mockImplementation(
        () => mockApiError('Biometric verification timeout')
      );

      // Act & Assert
      await expect(
        biometricAuthService.verifyBiometric(mockBiometricData)
      ).rejects.toThrow('Biometric verification timeout');
    });
  });
});
