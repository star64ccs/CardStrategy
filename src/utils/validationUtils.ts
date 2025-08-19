import { z, ZodSchema } from 'zod';
import { validateInput } from './validationService';

/**
 * 統一驗證工具類
 * 提供常用的驗證模式和驗證方法
 */
export class ValidationUtils {
  /**
   * 常用驗證模式
   */
  static readonly schemas = {
    // 基礎類型驗證
    uuid: z.string().uuid('無效的 UUID'),
    email: z.string().email('無效的電子郵件'),
    url: z.string().url('無效的 URL'),
    phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, '無效的電話號碼'),

    // 密碼驗證
    password: z.string()
      .min(8, '密碼至少8個字元')
      .max(128, '密碼不能超過128個字元')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, '密碼必須包含大小寫字母和數字'),

    // ID 驗證
    cardId: z.string().uuid('無效的卡牌 ID'),
    collectionId: z.string().uuid('無效的收藏 ID'),
    userId: z.string().uuid('無效的用戶 ID'),
    investmentId: z.string().uuid('無效的投資 ID'),

    // 數值驗證
    positiveNumber: z.number().positive('必須是正數'),
    nonNegativeNumber: z.number().min(0, '不能為負數'),
    percentage: z.number().min(0).max(100, '百分比必須在0-100之間'),
    price: z.number().min(0, '價格不能為負數').max(999999, '價格不能超過999999'),
    quantity: z.number().int().min(1, '數量必須是正整數'),

    // 日期驗證
    date: z.string().datetime('無效的日期格式'),
    futureDate: z.string().datetime().refine(
      date => new Date(date) > new Date(),
      '日期必須是未來時間'
    ),
    pastDate: z.string().datetime().refine(
      date => new Date(date) < new Date(),
      '日期必須是過去時間'
    ),

    // 日期範圍驗證
    dateRange: z.object({
      startDate: z.string().datetime('無效的開始日期'),
      endDate: z.string().datetime('無效的結束日期')
    }).refine(
      data => new Date(data.startDate) <= new Date(data.endDate),
      { message: '開始日期不能晚於結束日期' }
    ),

    // 分頁參數驗證
    pagination: z.object({
      page: z.number().int().min(1, '頁碼必須是正整數').optional(),
      limit: z.number().int().min(1, '每頁數量必須是正整數').max(100, '每頁數量不能超過100').optional(),
      sortBy: z.string().optional(),
      sortOrder: z.enum(['asc', 'desc']).optional()
    }),

    // 搜索參數驗證
    searchParams: z.object({
      query: z.string().min(1, '搜索關鍵字不能為空').max(100, '搜索關鍵字不能超過100個字元').optional(),
      filters: z.record(z.any()).optional(),
      category: z.string().optional(),
      tags: z.array(z.string()).optional()
    }),

    // 文件驗證
    imageFile: z.object({
      type: z.string().regex(/^image\//, '必須是圖片文件'),
      size: z.number().max(10 * 1024 * 1024, '文件大小不能超過10MB')
    }),

    // 卡片相關驗證
    cardCondition: z.enum(['mint', 'near_mint', 'excellent', 'good', 'light_played', 'played', 'poor']),
    cardRarity: z.enum(['common', 'uncommon', 'rare', 'mythic', 'special']),
    cardType: z.enum(['creature', 'instant', 'sorcery', 'enchantment', 'artifact', 'planeswalker', 'land']),

    // 投資相關驗證
    investmentType: z.enum(['buy', 'sell', 'hold']),
    riskLevel: z.enum(['low', 'medium', 'high']),
    timeframe: z.enum(['1d', '7d', '30d', '90d', '180d', '365d']),

    // 通知相關驗證
    notificationType: z.enum(['price_alert', 'market_update', 'system_alert', 'investment_reminder']),
    notificationPriority: z.enum(['low', 'medium', 'high', 'urgent'])
  };

  /**
   * 驗證 UUID
   * @param id UUID 字符串
   * @param fieldName 字段名稱（用於錯誤消息）
   * @throws Error 如果驗證失敗
   */
  static validateUUID(id: string, fieldName: string = 'ID'): void {
    const result = validateInput(this.schemas.uuid, id);
    if (!result.isValid) {
      throw new Error(`${fieldName} 驗證失敗: ${result.errorMessage}`);
    }
  }

  /**
   * 驗證電子郵件
   * @param email 電子郵件地址
   * @throws Error 如果驗證失敗
   */
  static validateEmail(email: string): void {
    const result = validateInput(this.schemas.email, email);
    if (!result.isValid) {
      throw new Error(`電子郵件驗證失敗: ${result.errorMessage}`);
    }
  }

  /**
   * 驗證密碼
   * @param password 密碼
   * @throws Error 如果驗證失敗
   */
  static validatePassword(password: string): void {
    const result = validateInput(this.schemas.password, password);
    if (!result.isValid) {
      throw new Error(`密碼驗證失敗: ${result.errorMessage}`);
    }
  }

  /**
   * 驗證卡牌 ID
   * @param cardId 卡牌 ID
   * @throws Error 如果驗證失敗
   */
  static validateCardId(cardId: string): void {
    const result = validateInput(this.schemas.cardId, cardId);
    if (!result.isValid) {
      throw new Error(`卡牌 ID 驗證失敗: ${result.errorMessage}`);
    }
  }

  /**
   * 驗證收藏 ID
   * @param collectionId 收藏 ID
   * @throws Error 如果驗證失敗
   */
  static validateCollectionId(collectionId: string): void {
    const result = validateInput(this.schemas.collectionId, collectionId);
    if (!result.isValid) {
      throw new Error(`收藏 ID 驗證失敗: ${result.errorMessage}`);
    }
  }

  /**
   * 驗證用戶 ID
   * @param userId 用戶 ID
   * @throws Error 如果驗證失敗
   */
  static validateUserId(userId: string): void {
    const result = validateInput(this.schemas.userId, userId);
    if (!result.isValid) {
      throw new Error(`用戶 ID 驗證失敗: ${result.errorMessage}`);
    }
  }

  /**
   * 驗證價格
   * @param price 價格
   * @throws Error 如果驗證失敗
   */
  static validatePrice(price: number): void {
    const result = validateInput(this.schemas.price, price);
    if (!result.isValid) {
      throw new Error(`價格驗證失敗: ${result.errorMessage}`);
    }
  }

  /**
   * 驗證數量
   * @param quantity 數量
   * @throws Error 如果驗證失敗
   */
  static validateQuantity(quantity: number): void {
    const result = validateInput(this.schemas.quantity, quantity);
    if (!result.isValid) {
      throw new Error(`數量驗證失敗: ${result.errorMessage}`);
    }
  }

  /**
   * 驗證百分比
   * @param percentage 百分比值
   * @throws Error 如果驗證失敗
   */
  static validatePercentage(percentage: number): void {
    const result = validateInput(this.schemas.percentage, percentage);
    if (!result.isValid) {
      throw new Error(`百分比驗證失敗: ${result.errorMessage}`);
    }
  }

  /**
   * 驗證日期範圍
   * @param startDate 開始日期
   * @param endDate 結束日期
   * @throws Error 如果驗證失敗
   */
  static validateDateRange(startDate: string, endDate: string): void {
    const result = validateInput(this.schemas.dateRange, { startDate, endDate });
    if (!result.isValid) {
      throw new Error(`日期範圍驗證失敗: ${result.errorMessage}`);
    }
  }

  /**
   * 驗證分頁參數
   * @param params 分頁參數
   * @returns 驗證後的分頁參數
   */
  static validatePagination(params: any): {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } {
    const result = validateInput(this.schemas.pagination, params);
    if (!result.isValid) {
      throw new Error(`分頁參數驗證失敗: ${result.errorMessage}`);
    }

    return {
      page: result.data!.page || 1,
      limit: result.data!.limit || 20,
      sortBy: result.data!.sortBy,
      sortOrder: result.data!.sortOrder || 'desc'
    };
  }

  /**
   * 驗證搜索參數
   * @param params 搜索參數
   * @returns 驗證後的搜索參數
   */
  static validateSearchParams(params: any): {
    query?: string;
    filters?: Record<string, any>;
    category?: string;
    tags?: string[];
  } {
    const result = validateInput(this.schemas.searchParams, params);
    if (!result.isValid) {
      throw new Error(`搜索參數驗證失敗: ${result.errorMessage}`);
    }

    return result.data!;
  }

  /**
   * 驗證文件
   * @param file 文件對象
   * @throws Error 如果驗證失敗
   */
  static validateFile(file: File): void {
    const result = validateInput(this.schemas.imageFile, {
      type: file.type,
      size: file.size
    });
    if (!result.isValid) {
      throw new Error(`文件驗證失敗: ${result.errorMessage}`);
    }
  }

  /**
   * 驗證卡片條件
   * @param condition 卡片條件
   * @throws Error 如果驗證失敗
   */
  static validateCardCondition(condition: string): void {
    const result = validateInput(this.schemas.cardCondition, condition);
    if (!result.isValid) {
      throw new Error(`卡片條件驗證失敗: ${result.errorMessage}`);
    }
  }

  /**
   * 驗證投資類型
   * @param type 投資類型
   * @throws Error 如果驗證失敗
   */
  static validateInvestmentType(type: string): void {
    const result = validateInput(this.schemas.investmentType, type);
    if (!result.isValid) {
      throw new Error(`投資類型驗證失敗: ${result.errorMessage}`);
    }
  }

  /**
   * 驗證時間框架
   * @param timeframe 時間框架
   * @throws Error 如果驗證失敗
   */
  static validateTimeframe(timeframe: string): void {
    const result = validateInput(this.schemas.timeframe, timeframe);
    if (!result.isValid) {
      throw new Error(`時間框架驗證失敗: ${result.errorMessage}`);
    }
  }

  /**
   * 批量驗證 UUID
   * @param ids UUID 數組
   * @param fieldName 字段名稱
   * @throws Error 如果有任何驗證失敗
   */
  static validateUUIDs(ids: string[], fieldName: string = 'ID'): void {
    for (let i = 0; i < ids.length; i++) {
      try {
        this.validateUUID(ids[i], `${fieldName}[${i}]`);
      } catch (error) {
        throw new Error(`${fieldName} 驗證失敗: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  /**
   * 驗證對象的所有必需字段
   * @param obj 要驗證的對象
   * @param requiredFields 必需字段列表
   * @throws Error 如果有任何必需字段缺失
   */
  static validateRequiredFields(obj: any, requiredFields: string[]): void {
    const missingFields = requiredFields.filter(field => !obj[field]);
    if (missingFields.length > 0) {
      throw new Error(`缺少必需字段: ${missingFields.join(', ')}`);
    }
  }

  /**
   * 驗證對象的字段類型
   * @param obj 要驗證的對象
   * @param fieldTypes 字段類型映射
   * @throws Error 如果有任何字段類型不匹配
   */
  static validateFieldTypes(obj: any, fieldTypes: Record<string, string>): void {
    for (const [field, expectedType] of Object.entries(fieldTypes)) {
      if (obj[field] !== undefined) {
        const actualType = typeof obj[field];
        if (actualType !== expectedType) {
          throw new Error(`字段 ${field} 類型錯誤: 期望 ${expectedType}，實際 ${actualType}`);
        }
      }
    }
  }

  /**
   * 創建自定義驗證模式
   * @param baseSchema 基礎模式
   * @param customRules 自定義規則
   * @returns 自定義驗證模式
   */
  static createCustomSchema<T>(
    baseSchema: ZodSchema<T>,
    customRules: ((value: T) => boolean | { success: false; error: string })[]
  ): ZodSchema<T> {
    return baseSchema.refine(
      (value) => {
        for (const rule of customRules) {
          const result = rule(value);
          if (result === false || (typeof result === 'object' && !result.success)) {
            return false;
          }
        }
        return true;
      },
      {
        message: '自定義驗證失敗'
      }
    );
  }
}
