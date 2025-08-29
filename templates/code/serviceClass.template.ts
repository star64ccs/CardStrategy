import { ApiResponse } from '@/types/api';

export class {{ServiceName}}Service {
  private static instance: {{ServiceName}}Service;

  static getInstance(): {{ServiceName}}Service {
    if (!{{ServiceName}}Service.instance) {
      {{ServiceName}}Service.instance = new {{ServiceName}}Service();
    }
    return {{ServiceName}}Service.instance;
  }

  async {{methodName}}(params: any): Promise<ApiResponse> {
    try {
      // 服務邏輯
      return { success: true, data: null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export const {{serviceName}}Service = {{ServiceName}}Service.getInstance();