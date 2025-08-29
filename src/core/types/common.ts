// 基礎類型定義
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// API 響應類型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: Date;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// 分頁類型
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 搜索類型
export interface SearchParams {
  query: string;
  filters?: Record<string, unknown>;
  pagination: PaginationParams;
}

// 地址類型
export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// 錯誤類型
export interface AppError {
  code: string;
  message: string;
  stack?: string;
  timestamp: Date;
  userId?: string;
  context?: Record<string, unknown>;
}

// 日誌類型
export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: Date;
  userId?: string;
  context?: Record<string, unknown>;
  stack?: string;
}

// 工具類型
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type Nullable<T> = T | null;

export type NonNullable<T> = T extends null | undefined ? never : T;
