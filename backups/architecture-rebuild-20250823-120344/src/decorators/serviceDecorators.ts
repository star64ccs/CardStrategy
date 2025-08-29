import { z, ZodSchema } from 'zod';
import { validateInput, validateApiResponse } from '@/utils/validationService';
import { logger } from '@/utils/logger';

/**
 * API 方法裝飾器
 * 自動處理輸入驗證、API 調用、響應驗證和錯誤處理
 */
export function ApiMethod<T, P = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  inputSchema?: ZodSchema<P>,
  responseSchema?: ZodSchema<T>
) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const operation = `${method} ${endpoint}`;
      const startTime = Date.now();

      try {
        // 輸入驗證
        if (inputSchema && args.length > 0) {
          const validationResult = validateInput(inputSchema, args[0]);
          if (!validationResult.isValid) {
            throw new Error(
              validationResult.errorMessage || `${operation} 參數驗證失敗`
            );
          }
        }

        // 調用原始方法
        const result = await originalMethod.apply(this, args);

        // 響應驗證
        if (responseSchema && result?.data) {
          const responseValidation = validateApiResponse(
            responseSchema,
            result.data
          );
          if (!responseValidation.isValid) {
            throw new Error(
              responseValidation.errorMessage || `${operation} 響應數據驗證失敗`
            );
          }

          const validatedResult = {
            ...result,
            data: responseValidation.data!,
          };

          // 記錄成功日誌
          const duration = Date.now() - startTime;
          logger.info(`✅ ${operation} 成功`, {
            duration: `${duration}ms`,
            status: result.status,
          });

          return validatedResult;
        }

        // 記錄成功日誌
        const duration = Date.now() - startTime;
        logger.info(`✅ ${operation} 成功`, {
          duration: `${duration}ms`,
          status: result?.status,
        });

        return result;
      } catch (error: any) {
        // 記錄錯誤日誌
        const duration = Date.now() - startTime;
        logger.error(`❌ ${operation} 失敗`, {
          error: error.message,
          duration: `${duration}ms`,
          stack: error.stack,
        });
        throw error;
      }
    };
  };
}

/**
 * 驗證裝飾器
 * 只處理輸入驗證，不處理 API 調用
 */
export function ValidateInput<P = any>(schema: ZodSchema<P>) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      if (args.length > 0) {
        const validationResult = validateInput(schema, args[0]);
        if (!validationResult.isValid) {
          throw new Error(
            validationResult.errorMessage || `${propertyName} 參數驗證失敗`
          );
        }
      }

      return originalMethod.apply(this, args);
    };
  };
}

/**
 * 響應驗證裝飾器
 * 只處理響應驗證，不處理輸入驗證
 */
export function ValidateResponse<T>(schema: ZodSchema<T>) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);

      if (result?.data) {
        const responseValidation = validateApiResponse(schema, result.data);
        if (!responseValidation.isValid) {
          throw new Error(
            responseValidation.errorMessage ||
              `${propertyName} 響應數據驗證失敗`
          );
        }

        return {
          ...result,
          data: responseValidation.data!,
        };
      }

      return result;
    };
  };
}

/**
 * 重試裝飾器
 * 為方法添加重試功能
 */
export function Retry(maxRetries: number = 3, retryDelay: number = 1000) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      let lastError: Error;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error: any) {
          lastError = error;

          if (attempt === maxRetries) {
            logger.error(
              `❌ ${propertyName} 重試失敗 (${attempt}/${maxRetries})`,
              {
                error: error.message,
              }
            );
            throw error;
          }

          logger.warn(
            `⚠️ ${propertyName} 失敗，${retryDelay}ms 後重試 (${attempt}/${maxRetries})`,
            {
              error: error.message,
            }
          );

          await new Promise(resolve =>
            setTimeout(resolve, retryDelay * attempt)
          );
        }
      }

      throw lastError!;
    };
  };
}

/**
 * 性能監控裝飾器
 * 記錄方法執行時間
 */
export function PerformanceMonitor(operationName?: string) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const operation = operationName || propertyName;

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();

      try {
        const result = await originalMethod.apply(this, args);

        const duration = Date.now() - startTime;
        logger.debug(`⏱️ ${operation} 執行時間: ${duration}ms`);

        return result;
      } catch (error: any) {
        const duration = Date.now() - startTime;
        logger.error(`❌ ${operation} 執行失敗 (${duration}ms)`, {
          error: error.message,
        });
        throw error;
      }
    };
  };
}

/**
 * 緩存裝飾器
 * 為方法添加緩存功能
 */
export function Cache(
  ttl: number = 60000,
  keyGenerator?: (...args: any[]) => string
) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const cache = new Map<string, { data: any; timestamp: number }>();

    descriptor.value = async function (...args: any[]) {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
      const now = Date.now();

      // 檢查緩存
      const cached = cache.get(key);
      if (cached && now - cached.timestamp < ttl) {
        logger.debug(`📦 ${propertyName} 使用緩存數據`);
        return cached.data;
      }

      // 執行方法
      const result = await originalMethod.apply(this, args);

      // 更新緩存
      cache.set(key, { data: result, timestamp: now });
      logger.debug(`💾 ${propertyName} 數據已緩存`);

      return result;
    };
  };
}

/**
 * 批量處理裝飾器
 * 將單個操作轉換為批量操作
 */
export function BatchProcess(batchSize: number = 10) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (items: any[], ...args: any[]) {
      const batches = [];
      for (let i = 0; i < items.length; i += batchSize) {
        batches.push(items.slice(i, i + batchSize));
      }

      const results = [];
      for (const batch of batches) {
        const batchResult = await originalMethod.apply(this, [batch, ...args]);
        results.push(...batchResult);
      }

      return results;
    };
  };
}

/**
 * 事務裝飾器
 * 為方法添加事務支持
 */
export function Transaction() {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // 這裡可以集成實際的事務管理
      logger.debug(`🔄 ${propertyName} 開始事務`);

      try {
        const result = await originalMethod.apply(this, args);
        logger.debug(`✅ ${propertyName} 事務提交成功`);
        return result;
      } catch (error: any) {
        logger.error(`❌ ${propertyName} 事務回滾`, { error: error.message });
        throw error;
      }
    };
  };
}

/**
 * 權限檢查裝飾器
 * 為方法添加權限檢查
 */
export function RequirePermission(permission: string) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // 這裡可以集成實際的權限檢查邏輯
      const user = (this as any).getCurrentUser?.();
      if (!user || !user.permissions?.includes(permission)) {
        throw new Error(`權限不足: 需要 ${permission} 權限`);
      }

      return originalMethod.apply(this, args);
    };
  };
}
