import type { ZodSchema } from 'zod';
import { z } from 'zod';

import { logger } from '../core/utils/logger';

/**
 * API Method裝飾器
 * AutoHandleInputVerify、API 調用、ResponseVerify和ErrorHandle
 */
export function ApiMethod<T, P = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  inputSchema?: ZodSchema<P>,
  responseSchema?: ZodSchema<T>
) {
  return function (
    target: unknown,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const _originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const _operation = `${method} ${endpoint}`;
      const _startTime = Date.now();

      try {
        // InputVerify
        if (inputSchema && args.length > 0) {
          try {
            inputSchema.parse(args[0]);
          } catch (error) {
            throw new Error(`${operation} 參數VerifyFailed: ${error}`);
          }
        }

        // 調用原始Method
        const _result = await originalMethod.apply(this, args);

        // ResponseVerify
        if (responseSchema && result?.data) {
          try {
            const _validatedData = responseSchema.parse(result.data);
            const _validatedResult = {
              ...result,
              data: validatedData,
            };

            // RecordSuccessLog
            const _duration = Date.now() - startTime;
            logger.info(`✅ ${operation} Success`, {
              duration: `${duration}ms`,
              status: result.status,
            });

            return validatedResult;
          } catch (error) {
            throw new Error(`${operation} 響應數據VerifyFailed: ${error}`);
          }
        }

        // RecordSuccessLog
        const _duration = Date.now() - startTime;
        logger.info(`✅ ${operation} Success`, {
          duration: `${duration}ms`,
          status: result?.status,
        });

        return result;
      } catch (error: unknown) {
        // RecordErrorLog
        const _duration = Date.now() - startTime;
        logger.error(`❌ ${operation} Failed`, {
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
 * Verify裝飾器
 * 只HandleInputVerify，不Handle API 調用
 */
export function ValidateInput<P = any>(schema: ZodSchema<P>) {
  return function (
    target: unknown,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const _originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      if (args.length > 0) {
        try {
          schema.parse(args[0]);
        } catch (error) {
          throw new Error(`${propertyName} 參數VerifyFailed: ${error}`);
        }
      }

      return originalMethod.apply(this, args);
    };
  };
}

/**
 * ResponseVerify裝飾器
 * 只HandleResponseVerify，不HandleInputVerify
 */
export function ValidateResponse<T>(schema: ZodSchema<T>) {
  return function (
    target: unknown,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const _originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const _result = await originalMethod.apply(this, args);

      if (result?.data) {
        try {
          const _validatedData = schema.parse(result.data);
          return {
            ...result,
            data: validatedData,
          };
        } catch (error) {
          throw new Error(`${propertyName} 響應數據VerifyFailed: ${error}`);
        }
      }

      return result;
    };
  };
}

/**
 * Retry裝飾器
 * 為MethodAddRetry功能
 */
export function Retry(_maxRetries = 3, _retryDelay = 1000) {
  return function (
    target: unknown,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const _originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      let lastError: Error;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error: unknown) {
          lastError = error;

          if (attempt === maxRetries) {
            logger.error(
              `❌ ${propertyName} 重試Failed (${attempt}/${maxRetries})`,
              {
                error: error.message,
              }
            );
            throw error;
          }

          logger.warn(
            `⚠️ ${propertyName} Failed，${retryDelay}ms 後重試 (${attempt}/${maxRetries})`,
            {
              error: error.message,
            }
          );

          await new Promise(resolve =>
            setTimeout(resolve, retryDelay * attempt)
          );
        }
      }

      throw lastError;
    };
  };
}

/**
 * 性能Monitor裝飾器
 * RecordMethod執RowTime
 */
export function PerformanceMonitor(operationName?: string) {
  return function (
    target: unknown,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const _originalMethod = descriptor.value;
    const _operation = operationName || propertyName;

    descriptor.value = async function (...args: unknown[]) {
      const _startTime = Date.now();

      try {
        const _result = await originalMethod.apply(this, args);

        const _duration = Date.now() - startTime;
        logger.debug(`⏱️ ${operation} 執行時間: ${duration}ms`);

        return result;
      } catch (error: unknown) {
        const _duration = Date.now() - startTime;
        logger.error(`❌ ${operation} 執行Failed (${duration}ms)`, {
          error: error.message,
        });
        throw error;
      }
    };
  };
}

/**
 * Cache裝飾器
 * 為MethodAddCache功能
 */
export function Cache(
  _ttl = 60000,
  keyGenerator?: (...args: unknown[]) => string
) {
  return function (
    target: unknown,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const _originalMethod = descriptor.value;
    const _cache = new Map<string, { data: unknown; timestamp: number }>();

    descriptor.value = async function (...args: unknown[]) {
      const _key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
      const _now = Date.now();

      // CheckCache
      const _cached = cache.get(key);
      if (cached && now - cached.timestamp < ttl) {
        logger.debug(`📦 ${propertyName} 使用緩存數據`);
        return cached.data;
      }

      // 執RowMethod
      const _result = await originalMethod.apply(this, args);

      // UpdateCache
      cache.set(key, { data: result, timestamp: now });
      logger.debug(`💾 ${propertyName} 數據已緩存`);

      return result;
    };
  };
}

/**
 * BatchHandle裝飾器
 * 將SingleOperationConvert為BatchOperation
 */
export function BatchProcess(_batchSize = 10) {
  return function (
    target: unknown,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const _originalMethod = descriptor.value;

    descriptor.value = async function (items: unknown[], ...args: unknown[]) {
      const _batches = [];
      for (let i = 0; i < items.length; i += batchSize) {
        batches.push(items.slice(i, i + batchSize));
      }

      const _results = [];
      for (const batch of batches) {
        const _batchResult = await originalMethod.apply(this, [batch, ...args]);
        results.push(...batchResult);
      }

      return results;
    };
  };
}

/**
 * 事務裝飾器
 * 為MethodAdd事務Support
 */
export function Transaction() {
  return function (
    target: unknown,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const _originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      // 這裡可以集成實際的事務Manage
      logger.debug(`🔄 ${propertyName} 開始事務`);

      try {
        const _result = await originalMethod.apply(this, args);
        logger.debug(`✅ ${propertyName} 事務提交Success`);
        return result;
      } catch (error: unknown) {
        logger.error(`❌ ${propertyName} 事務回滾`, { error: error.message });
        throw error;
      }
    };
  };
}

/**
 * 權限Check裝飾器
 * 為MethodAdd權限Check
 */
export function RequirePermission(permission: string) {
  return function (
    target: unknown,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const _originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      // 這裡可以集成實際的權限Check邏輯
      const _user = (this as any).getCurrentUser?.();
      if (!user?.permissions?.includes(permission)) {
        throw new Error(`權限不足: 需要 ${permission} 權限`);
      }

      return originalMethod.apply(this, args);
    };
  };
}
