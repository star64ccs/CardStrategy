// 數據轉換工具
import type { BusinessMetrics } from '../types/businessMetrics';
import type {
  ChartAnalytics,
  ChartInstance,
  ChartListResponse,
  ChartResponse,
  ChartStatistics,
  ChartTemplate,
} from '../types/chart';
import type {
  DashboardAlert,
  DashboardAnalytics,
  DashboardConfig,
  DashboardData,
  DashboardExport,
} from '../types/dashboard';
import type { PredictiveAnalysisResponse } from '../types/predictiveAnalysis';
import type {
  ReportAnalytics,
  ReportAnalyticsResponse,
  ReportExport,
  ReportExportResponse,
  ReportInstance,
  ReportResponse,
  ReportTemplate,
  ReportTemplateResponse,
} from '../types/report';
import type { UserBehaviorAnalysisResponse } from '../types/userBehavior';

// 聯合類型定義
export type AnalysisData =
  | UserBehaviorAnalysisResponse
  | BusinessMetrics
  | PredictiveAnalysisResponse
  | DashboardConfig
  | DashboardData[]
  | DashboardExport[]
  | DashboardAlert[]
  | DashboardAnalytics
  | ChartInstance
  | ChartTemplate
  | ChartAnalytics
  | ChartStatistics
  | ChartResponse
  | ChartListResponse
  | ChartInstance[]
  | ChartTemplate[]
  | ReportInstance
  | ReportTemplate
  | ReportExport
  | ReportAnalytics
  | ReportResponse
  | ReportTemplateResponse
  | ReportExportResponse
  | ReportAnalyticsResponse
  | ReportInstance[]
  | ReportTemplate[];

// 轉換為 JSON 格式
export const _convertToJSON = (data: AnalysisData): string => {
  try {
    return JSON.stringify(data, null, 2);
  } catch (error) {
    throw new Error(`JSON 轉換失敗: ${error}`);
  }
};

// 轉換為 CSV 格式
export const _convertToCSV = (data: AnalysisData): string => {
  try {
    if (Array.isArray(data)) {
      if (data.length === 0) return '';

      const _headers = Object.keys(data[0]);
      const _csvRows = [headers.join(',')];

      for (const row of data) {
        const _values = headers.map(header => {
          const _value = row[header as keyof typeof row];
          return typeof value === 'string' ? `"${value}"` : value;
        });
        csvRows.push(values.join(','));
      }

      return csvRows.join('\n');
    } else {
      // 單個對象轉換為單行 CSV
      const _headers = Object.keys(data);
      const _values = headers.map(header => {
        const _value = data[header as keyof typeof data];
        return typeof value === 'string' ? `"${value}"` : value;
      });
      return [headers.join(','), values.join(',')].join('\n');
    }
  } catch (error) {
    throw new Error(`CSV 轉換失敗: ${error}`);
  }
};

// 轉換為 Excel 格式 (簡化版本，實際應使用 xlsx 庫)
export const _convertToExcel = (data: AnalysisData): string => {
  try {
    // 這裡應該使用 xlsx 庫來生成真正的 Excel 文件
    // 目前返回 CSV 格式作為簡化實現
    return convertToCSV(data);
  } catch (error) {
    throw new Error(`Excel 轉換失敗: ${error}`);
  }
};

// 轉換為 PDF 格式 (簡化版本，實際應使用 jsPDF 庫)
export const _convertToPDF = (data: AnalysisData): string => {
  try {
    // 這裡應該使用 jsPDF 庫來生成真正的 PDF 文件
    // 目前返回格式化的文本作為簡化實現
    if (Array.isArray(data)) {
      return data.map(item => JSON.stringify(item, null, 2)).join('\n\n');
    } else {
      return JSON.stringify(data, null, 2);
    }
  } catch (error) {
    throw new Error(`PDF 轉換失敗: ${error}`);
  }
};

// 格式化數據顯示
export const _formatDataForDisplay = (data: AnalysisData): string => {
  try {
    if (Array.isArray(data)) {
      return `共 ${data.length} 條記錄`;
    } else if (typeof data === 'object') {
      return '數據對象';
    } else {
      return String(data);
    }
  } catch (error) {
    return '格式化失敗';
  }
};

// 驗證數據格式
export const _validateDataFormat = (data: AnalysisData): boolean => {
  try {
    if (data === null || data === undefined) {
      return false;
    }

    if (Array.isArray(data)) {
      return data.length > 0;
    }

    if (typeof data === 'object') {
      return Object.keys(data).length > 0;
    }

    return true;
  } catch (error) {
    return false;
  }
};

// 獲取數據摘要
export const _getDataSummary = (
  data: AnalysisData
): {
  type: string;
  count: number;
  fields: string[];
  sample: unknown;
} => {
  try {
    if (Array.isArray(data)) {
      return {
        type: 'array',
        count: data.length,
        fields: data.length > 0 ? Object.keys(data[0]) : [],
        sample: data.length > 0 ? data[0] : null,
      };
    } else if (typeof data === 'object') {
      return {
        type: 'object',
        count: 1,
        fields: Object.keys(data),
        sample: data,
      };
    } else {
      return {
        type: typeof data,
        count: 1,
        fields: [],
        sample: data,
      };
    }
  } catch (error) {
    return {
      type: 'unknown',
      count: 0,
      fields: [],
      sample: null,
    };
  }
};
