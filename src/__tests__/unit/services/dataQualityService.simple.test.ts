/* global jest, describe, it, expect, beforeEach, afterEach */
// 首先設置 mock，然後再導入
// 導入被測試的模組
import { dataQualityService } from '../../../services/dataQualityService';
import { api } from '../../../config/api';

jest.mock('../../../config/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('DataQualityService 修復驗證測試', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('應該成功修復 apiClient 到 api 的引用', async () => {
    // 測試一個簡單的方法來驗證修復
    const mockResponse = {
      data: {
        status: 'success',
        message: 'API call successful',
      },
    };

    // 設置 mock 返回值
    (api.get as jest.Mock).mockResolvedValue(mockResponse);

    // 調用一個方法來驗證 api 引用是否正確
    const result = await dataQualityService.getCollectionStats();

    // 驗證 mock 被調用
    expect(api.get).toHaveBeenCalled();
    expect(result).toEqual(mockResponse.data);
  });

  it('應該正確處理 API 錯誤', async () => {
    const error = new Error('API Error');
    (api.get as jest.Mock).mockRejectedValue(error);

    await expect(dataQualityService.getCollectionStats()).rejects.toThrow(
      'API Error'
    );
  });

  it('應該正確調用 POST 方法', async () => {
    const mockResponse = {
      data: {
        status: 'started',
        collectionId: 'test-123',
      },
    };

    (api.post as jest.Mock).mockResolvedValue(mockResponse);

    const result = await dataQualityService.startDataCollection();

    expect(api.post).toHaveBeenCalledWith('/data-quality/collect');
    expect(result).toEqual(mockResponse.data);
  });

  it('應該正確調用 PUT 方法', async () => {
    const config = { maxTasksPerAnnotator: 50 };
    const mockResponse = {
      data: {
        config,
        timestamp: '2024-01-01T00:00:00Z',
      },
    };

    (api.put as jest.Mock).mockResolvedValue(mockResponse);

    const result = await dataQualityService.updateAssignmentConfig(config);

    expect(api.put).toHaveBeenCalledWith('/data-quality/annotate/config', {
      config,
    });
    expect(result).toEqual(mockResponse.data);
  });
});
