// DataConvertTool
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

// 聯合Class型定義
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

// Convert為 JSON 格式
export const _convertToJSON = (data: AnalysisData): string => {
  try {
    return JSON.stringify(data, null, 2);
  } catch (error) {
    throw new Error(`JSON 轉換Failed: ${error}`);
  }
};

// Convert為 CSV 格式
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
      // SingleObjectConvert為單Row CSV
      const _headers = Object.keys(data);
      const _values = headers.map(header => {
        const _value = data[header as keyof typeof data];
        return typeof value === 'string' ? `"${value}"` : value;
      });
      return [headers.join(','), values.join(',')].join('\n');
    }
  } catch (error) {
    throw new Error(`CSV 轉換Failed: ${error}`);
  }
};

// Convert為 Excel 格式 (簡化Version，實際應使用 xlsx Library)
export const _convertToExcel = (data: AnalysisData): string => {
  try {
    // 這裡應該使用 xlsx Library來生成True正的 Excel File
    // 目前Return CSV 格式作為簡化實現
    return convertToCSV(data);
  } catch (error) {
    throw new Error(`Excel 轉換Failed: ${error}`);
  }
};

// Convert為 PDF 格式 (簡化Version，實際應使用 jsPDF Library)
export const _convertToPDF = (data: AnalysisData): string => {
  try {
    // 這裡應該使用 jsPDF Library來生成True正的 PDF File
    // 目前ReturnFormat的文本作為簡化實現
    if (Array.isArray(data)) {
      return data.map(item => JSON.stringify(item, null, 2)).join('\n\n');
    } else {
      return JSON.stringify(data, null, 2);
    }
  } catch (error) {
    throw new Error(`PDF 轉換Failed: ${error}`);
  }
};

// FormatDataShow
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
    return '格式化Failed';
  }
};

// VerifyData格式
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

// GetData摘要
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
