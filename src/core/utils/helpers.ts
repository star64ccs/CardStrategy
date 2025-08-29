import { logger } from './logger';

// 陣列操作工具
export const _chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const _unique = <T>(array: T[]): T[] => {
  return [...new Set(array)];
};

export const _groupBy = <T, K extends keyof any>(
  array: T[],
  key: (item: T) => K
): Record<K, T[]> => {
  return array.reduce(
    (groups, item) => {
      const _groupKey = key(item);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    },
    {} as Record<K, T[]>
  );
};

export const _sortBy = <T>(
  array: T[],
  key: keyof T,
  order: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...array].sort((a, b) => {
    const _aVal = a[key];
    const _bVal = b[key];

    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

export const _filterBy = <T>(
  array: T[],
  predicate: (item: T) => boolean
): T[] => {
  return array.filter(predicate);
};

// 物件操作工具
export const _pick = <T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const _result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

export const _omit = <T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  const _result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
};

export const _deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T;
  }

  if (typeof obj === 'object') {
    const _cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }

  return obj;
};

export const _merge = <T extends object>(
  target: T,
  ...sources: Partial<T>[]
): T => {
  return sources.reduce(
    (result, source) => {
      if (source) {
        Object.keys(source).forEach(key => {
          const _value = source[key as keyof T];
          if (value !== undefined) {
            (result as any)[key] = value;
          }
        });
      }
      return result;
    },
    { ...target }
  ) as T;
};

// 字符串操作工具
export const _capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const _camelCase = (str: string): string => {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (_, c) => c.toLowerCase());
};

export const _snakeCase = (str: string): string => {
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '');
};

export const _kebabCase = (str: string): string => {
  return str
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');
};

export const _truncate = (
  str: string,
  length: number,
  suffix = '...'
): string => {
  if (str.length <= length) {
    return str;
  }
  return str.substring(0, length - suffix.length) + suffix;
};

// 數字操作工具
export const _formatNumber = (num: number, decimals = 2): string => {
  return num.toFixed(decimals);
};

export const _formatCurrency = (
  amount: number,
  currency = 'TWD',
  locale = 'zh-TW'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};

export const _clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export const _round = (value: number, decimals = 0): number => {
  const _factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

// 日期操作工具
export const _formatDate = (date: Date, format = 'YYYY-MM-DD'): string => {
  const _year = date.getFullYear();
  const _month = String(date.getMonth() + 1).padStart(2, '0');
  const _day = String(date.getDate()).padStart(2, '0');
  const _hours = String(date.getHours()).padStart(2, '0');
  const _minutes = String(date.getMinutes()).padStart(2, '0');
  const _seconds = String(date.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

export const _isToday = (date: Date): boolean => {
  const _today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const _isYesterday = (date: Date): boolean => {
  const _yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
};

export const _addDays = (date: Date, days: number): Date => {
  const _result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const _addMonths = (date: Date, months: number): Date => {
  const _result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

export const _addYears = (date: Date, years: number): Date => {
  const _result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
};

// 異步操作工具
export const _retry = async <T>(
  fn: () => Promise<T>,
  attempts = 3,
  delay = 1000
): Promise<T> => {
  let lastError: Error;

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      logger.warn(`Retry attempt ${i + 1} failed:`, {
        error: lastError.message,
      });

      if (i < attempts - 1) {
        await sleep(delay * 2 ** i); // 指數退避
      }
    }
  }

  throw lastError;
};

export const _sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const _safeExecute = async <T>(
  fn: () => Promise<T>,
  fallback?: T
): Promise<T | undefined> => {
  try {
    return await fn();
  } catch (error) {
    logger.error('Safe execute error:', { error });
    return fallback;
  }
};

// 驗證工具
export const _isValidEmail = (email: string): boolean => {
  const _emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const _isValidPhone = (phone: string): boolean => {
  const _phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const _isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const _isValidDate = (date: unknown): boolean => {
  const _d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
};

// 隨機工具
export const _randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const _randomFloat = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

export const _randomChoice = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

export const _shuffle = <T>(array: T[]): T[] => {
  const _shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const _j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// 性能工具
export const _debounce = <T extends (...args: unknown[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const _throttle = <T extends (...args: unknown[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// 類型檢查工具
export const _isObject = (value: unknown): value is object => {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
};

export const _isArray = (value: unknown): value is any[] => {
  return Array.isArray(value);
};

export const _isString = (value: unknown): value is string => {
  return typeof value === 'string';
};

export const _isNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !isNaN(value);
};

export const _isBoolean = (value: unknown): value is boolean => {
  return typeof value === 'boolean';
};

export const _isFunction = (value: unknown): value is Function => {
  return typeof value === 'function';
};

export const _isNull = (value: unknown): value is null => {
  return value === null;
};

export const _isUndefined = (value: unknown): value is undefined => {
  return value === undefined;
};

export const _isEmpty = (value: unknown): boolean => {
  if (isNull(value) || isUndefined(value)) {
    return true;
  }
  if (isString(value) || isArray(value)) {
    return value.length === 0;
  }
  if (isObject(value)) {
    return Object.keys(value).length === 0;
  }
  return false;
};
