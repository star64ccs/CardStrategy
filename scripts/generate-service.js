#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const serviceName = process.argv[2];
const serviceType = process.argv[3] || 'api';

if (!serviceName) {
  console.log('❌ 請提供服務名稱');
  console.log('用法: node scripts/generate-service.js <ServiceName> [api|utility|storage]');
  process.exit(1);
}

const pascalCase = serviceName.charAt(0).toUpperCase() + serviceName.slice(1);
const camelCase = serviceName.charAt(0).toLowerCase() + serviceName.slice(1);
const kebabCase = serviceName.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();

// 創建服務目錄
const serviceDir = path.join(__dirname, '..', 'src', 'services', kebabCase);
if (!fs.existsSync(serviceDir)) {
  fs.mkdirSync(serviceDir, { recursive: true });
}

// 生成服務模板
const generateApiService = () => `import axios, { AxiosResponse } from 'axios';
import { API_BASE_URL } from '@/config/api';

export interface ${pascalCase}Data {
  // 定義數據類型
  id: string;
  name: string;
  // 添加更多字段
}

export interface ${pascalCase}Response {
  success: boolean;
  data: ${pascalCase}Data[];
  message?: string;
}

export interface ${pascalCase}Request {
  // 定義請求參數類型
  name?: string;
  // 添加更多參數
}

class ${pascalCase}Service {
  private baseUrl: string;

  constructor() {
    this.baseUrl = \`\${API_BASE_URL}/${kebabCase}\`;
  }

  async getAll(params?: ${pascalCase}Request): Promise<${pascalCase}Data[]> {
    try {
      const response: AxiosResponse<${pascalCase}Response> = await axios.get(this.baseUrl, { params });
      return response.data.data;
    } catch (error) {
      console.error('獲取${pascalCase}列表失敗:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<${pascalCase}Data | null> {
    try {
      const response: AxiosResponse<${pascalCase}Response> = await axios.get(\`\${this.baseUrl}/\${id}\`);
      return response.data.data[0] || null;
    } catch (error) {
      console.error('獲取${pascalCase}詳情失敗:', error);
      throw error;
    }
  }

  async create(data: Omit<${pascalCase}Data, 'id'>): Promise<${pascalCase}Data> {
    try {
      const response: AxiosResponse<${pascalCase}Response> = await axios.post(this.baseUrl, data);
      return response.data.data[0];
    } catch (error) {
      console.error('創建${pascalCase}失敗:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<${pascalCase}Data>): Promise<${pascalCase}Data> {
    try {
      const response: AxiosResponse<${pascalCase}Response> = await axios.put(\`\${this.baseUrl}/\${id}\`, data);
      return response.data.data[0];
    } catch (error) {
      console.error('更新${pascalCase}失敗:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await axios.delete(\`\${this.baseUrl}/\${id}\`);
      return true;
    } catch (error) {
      console.error('刪除${pascalCase}失敗:', error);
      throw error;
    }
  }
}

// 導出單例實例
export const ${camelCase}Service = new ${pascalCase}Service();
`;

const generateUtilityService = () => `export class ${pascalCase}Service {
  /**
   * 處理${pascalCase}相關的工具函數
   */

  static formatData(data: any): any {
    // 實現數據格式化邏輯
    return data;
  }

  static validateInput(input: any): boolean {
    // 實現輸入驗證邏輯
    return true;
  }

  static transformData(data: any): any {
    // 實現數據轉換邏輯
    return data;
  }

  static calculateMetrics(data: any[]): any {
    // 實現指標計算邏輯
    return {
      total: data.length,
      // 添加更多指標
    };
  }
}

// 導出工具函數
export const ${camelCase}Utils = {
  format: ${pascalCase}Service.formatData,
  validate: ${pascalCase}Service.validateInput,
  transform: ${pascalCase}Service.transformData,
  calculate: ${pascalCase}Service.calculateMetrics,
};
`;

const generateStorageService = () => `import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ${pascalCase}StorageData {
  // 定義存儲數據類型
  id: string;
  data: any;
  timestamp: number;
}

class ${pascalCase}StorageService {
  private storageKey = '@${kebabCase}_storage';

  async save(data: any): Promise<void> {
    try {
      const storageData: ${pascalCase}StorageData = {
        id: Date.now().toString(),
        data,
        timestamp: Date.now(),
      };

      await AsyncStorage.setItem(this.storageKey, JSON.stringify(storageData));
    } catch (error) {
      console.error('保存${pascalCase}數據失敗:', error);
      throw error;
    }
  }

  async load(): Promise<any | null> {
    try {
      const data = await AsyncStorage.getItem(this.storageKey);
      if (data) {
        const parsedData: ${pascalCase}StorageData = JSON.parse(data);
        return parsedData.data;
      }
      return null;
    } catch (error) {
      console.error('加載${pascalCase}數據失敗:', error);
      throw error;
    }
  }

  async remove(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('刪除${pascalCase}數據失敗:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('清空${pascalCase}存儲失敗:', error);
      throw error;
    }
  }
}

// 導出單例實例
export const ${camelCase}Storage = new ${pascalCase}StorageService();
`;

// 生成測試文件模板
const generateTestFile = () => `import { ${camelCase}${serviceType === 'api' ? 'Service' : serviceType === 'utility' ? 'Utils' : 'Storage'} } from './${pascalCase}';

describe('${pascalCase}${serviceType === 'api' ? 'Service' : serviceType === 'utility' ? 'Utils' : 'Storage'}', () => {
  beforeEach(() => {
    // 設置測試環境
  });

  afterEach(() => {
    // 清理測試環境
  });

  it('應該正確初始化', () => {
    expect(${camelCase}${serviceType === 'api' ? 'Service' : serviceType === 'utility' ? 'Utils' : 'Storage'}).toBeDefined();
  });

  // 添加更多測試
});
`;

// 生成索引文件模板
const generateIndexFile = () => {
  const exportName = serviceType === 'api' ? 'Service' : serviceType === 'utility' ? 'Utils' : 'Storage';
  return `export { ${camelCase}${exportName} } from './${pascalCase}';
`;
};

// 生成服務文件
let serviceContent;
switch (serviceType) {
  case 'api':
    serviceContent = generateApiService();
    break;
  case 'utility':
    serviceContent = generateUtilityService();
    break;
  case 'storage':
    serviceContent = generateStorageService();
    break;
  default:
    serviceContent = generateApiService();
}

fs.writeFileSync(path.join(serviceDir, `${pascalCase}.ts`), serviceContent);

// 生成測試文件
fs.writeFileSync(path.join(serviceDir, `${pascalCase}.test.ts`), generateTestFile());

// 生成索引文件
fs.writeFileSync(path.join(serviceDir, 'index.ts'), generateIndexFile());

console.log(`✅ 服務 ${pascalCase} 已生成在 ${serviceDir}`);
console.log(`📁 文件結構:`);
console.log(`  - ${pascalCase}.ts (服務文件)`);
console.log(`  - ${pascalCase}.test.ts (測試文件)`);
console.log(`  - index.ts (導出文件)`);
console.log('');
console.log('🔧 下一步:');
console.log(`  1. 編輯 ${pascalCase}.ts 添加你的服務邏輯`);
console.log(`  2. 編輯 ${pascalCase}.test.ts 添加測試用例`);
console.log(`  3. 在需要的地方導入: import { ${camelCase}${serviceType === 'api' ? 'Service' : serviceType === 'utility' ? 'Utils' : 'Storage'} } from '@/services/${kebabCase}'`);
