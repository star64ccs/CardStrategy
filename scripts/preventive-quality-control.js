const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * 預防性質量控制腳本
 * 按照執行原則建構
 * 嚴謹語法，無錯誤，高質量代碼
 * 確保後續建構流程不會再出現大規模錯誤
 */

console.log('🚀 開始建立預防性質量控制體系...\n');

// 1. 建立代碼質量檢查點
function establishQualityCheckpoints() {
  console.log('📋 建立代碼質量檢查點...');

  const checkpoints = {
    preCommit: {
      name: '提交前檢查',
      checks: ['lint', 'type-check', 'test-unit'],
      threshold: { errors: 0, warnings: 100 }
    },
    preBuild: {
      name: '構建前檢查',
      checks: ['lint', 'type-check', 'test-integration'],
      threshold: { errors: 0, warnings: 50 }
    },
    preDeploy: {
      name: '部署前檢查',
      checks: ['lint', 'type-check', 'test-e2e', 'security-scan'],
      threshold: { errors: 0, warnings: 10 }
    }
  };

  // 創建檢查點配置文件
  const configPath = path.join(__dirname, '..', 'quality-checkpoints.json');
  fs.writeFileSync(configPath, JSON.stringify(checkpoints, null, 2));

  console.log('✅ 代碼質量檢查點建立完成');
  console.log(`  檢查點數量: ${Object.keys(checkpoints).length} 個`);
  console.log(`  配置文件: ${configPath}`);

  return checkpoints;
}

// 2. 建立自動化錯誤檢測
function establishAutomatedErrorDetection() {
  console.log('📋 建立自動化錯誤檢測...');

  const detectionRules = {
    // 變數定義檢查
    variableDefinition: {
      pattern: /const\s+(\w+)\s*=\s*[^;]+;/g,
      check: (match, context) => {
        const varName = match[1];
        return context.includes(varName);
      }
    },

    // 導入檢查
    importCheck: {
      pattern: /import\s+.*from\s+['"]([^'"]+)['"]/g,
      check: (match, context) => {
        const importPath = match[1];
        return fs.existsSync(path.resolve(importPath));
      }
    },

    // 函數調用檢查
    functionCall: {
      pattern: /(\w+)\(/g,
      check: (match, context) => {
        const funcName = match[1];
        return context.includes(`function ${funcName}`) ||
               context.includes(`const ${funcName} =`) ||
               context.includes(`export ${funcName}`);
      }
    }
  };

  // 創建檢測規則文件
  const rulesPath = path.join(__dirname, '..', 'error-detection-rules.json');
  fs.writeFileSync(rulesPath, JSON.stringify(detectionRules, null, 2));

  console.log('✅ 自動化錯誤檢測建立完成');
  console.log(`  檢測規則: ${Object.keys(detectionRules).length} 個`);
  console.log(`  規則文件: ${rulesPath}`);

  return detectionRules;
}

// 3. 建立代碼模板系統
function establishCodeTemplates() {
  console.log('📋 建立代碼模板系統...');

  const templates = {
    // Redux Slice模板
    reduxSlice: `import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

interface {{SliceName}}State {
  // 定義狀態類型
}

const initialState: {{SliceName}}State = {
  // 初始狀態
};

// 異步操作
export const {{asyncActionName}} = createAsyncThunk(
  '{{sliceName}}/{{asyncActionName}}',
  async (payload: any) => {
    // 異步邏輯
    return payload;
  }
);

const {{sliceName}}Slice = createSlice({
  name: '{{sliceName}}',
  initialState,
  reducers: {
    // 同步操作
  },
  extraReducers: (builder) => {
    // 異步操作處理
  },
});

export const { actions } = {{sliceName}}Slice;
export default {{sliceName}}Slice.reducer;`,

    // React組件模板
    reactComponent: `import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface {{ComponentName}}Props {
  // 組件屬性
}

export const {{ComponentName}}: React.FC<{{ComponentName}}Props> = (props) => {
  const [state, setState] = useState();

  useEffect(() => {
    // 副作用邏輯
  }, []);

  return (
    <View style={styles.container}>
      <Text>{{ComponentName}}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // 樣式定義
  },
});`,

    // 服務類模板
    serviceClass: `import { ApiResponse } from '@/types/api';

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

export const {{serviceName}}Service = {{ServiceName}}Service.getInstance();`
  };

  // 創建模板目錄
  const templatesDir = path.join(__dirname, '..', 'templates', 'code');
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
  }

  // 保存模板文件
  Object.entries(templates).forEach(([name, template]) => {
    const templatePath = path.join(templatesDir, `${name}.template.ts`);
    fs.writeFileSync(templatePath, template);
  });

  console.log('✅ 代碼模板系統建立完成');
  console.log(`  模板數量: ${Object.keys(templates).length} 個`);
  console.log(`  模板目錄: ${templatesDir}`);

  return templates;
}

// 4. 建立持續集成檢查
function establishCIChecks() {
  console.log('📋 建立持續集成檢查...');

  const ciConfig = {
    // GitHub Actions配置
    githubActions: {
      name: 'Quality Check',
      on: ['push', 'pull_request'],
      jobs: {
        quality: {
          runsOn: 'ubuntu-latest',
          steps: [
            { name: 'Checkout', uses: 'actions/checkout@v3' },
            { name: 'Setup Node.js', uses: 'actions/setup-node@v3', with: { 'node-version': '18' } },
            { name: 'Install dependencies', run: 'npm ci' },
            { name: 'Lint check', run: 'npm run lint' },
            { name: 'Type check', run: 'npm run type-check' },
            { name: 'Unit tests', run: 'npm run test:unit' },
            { name: 'Integration tests', run: 'npm run test:integration' }
          ]
        }
      }
    },

    // 本地檢查腳本
    localChecks: {
      preCommit: 'npm run lint && npm run type-check && npm run test:unit',
      preBuild: 'npm run lint && npm run type-check && npm run test:integration',
      preDeploy: 'npm run lint && npm run type-check && npm run test:e2e'
    }
  };

  // 創建GitHub Actions配置
  const workflowsDir = path.join(__dirname, '..', '.github', 'workflows');
  if (!fs.existsSync(workflowsDir)) {
    fs.mkdirSync(workflowsDir, { recursive: true });
  }

  const workflowPath = path.join(workflowsDir, 'quality-check.yml');
  const workflowContent = `name: Quality Check

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  quality:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout
      uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Install dependencies
      run: npm ci

    - name: Lint check
      run: npm run lint

    - name: Type check
      run: npm run type-check

    - name: Unit tests
      run: npm run test:unit

    - name: Integration tests
      run: npm run test:integration
`;

  fs.writeFileSync(workflowPath, workflowContent);

  // 創建本地檢查腳本
  const scriptsDir = path.join(__dirname, '..', 'scripts', 'quality');
  if (!fs.existsSync(scriptsDir)) {
    fs.mkdirSync(scriptsDir, { recursive: true });
  }

  Object.entries(ciConfig.localChecks).forEach(([name, command]) => {
    const scriptPath = path.join(scriptsDir, `${name}.js`);
    const scriptContent = `#!/usr/bin/env node

const { execSync } = require('child_process');

console.log(\`🚀 執行${name}檢查...\`);

try {
  execSync('${command}', { stdio: 'inherit' });
  console.log('✅ ${name}檢查通過');
} catch (error) {
  console.error('❌ ${name}檢查失敗');
  process.exit(1);
}
`;
    fs.writeFileSync(scriptPath, scriptContent);
  });

  console.log('✅ 持續集成檢查建立完成');
  console.log(`  GitHub Actions: ${workflowPath}`);
  console.log(`  本地檢查腳本: ${scriptsDir}`);

  return ciConfig;
}

// 5. 建立錯誤預防指南
function establishErrorPreventionGuide() {
  console.log('📋 建立錯誤預防指南...');

  const guide = {
    // 常見錯誤預防
    commonErrors: {
      'no-undef': {
        description: '變數未定義錯誤',
        prevention: [
          '確保所有變數在使用前已定義',
          '檢查導入語句是否正確',
          '使用TypeScript嚴格模式',
          '定期運行lint檢查'
        ],
        examples: {
          wrong: 'const result = someFunction(); // someFunction未定義',
          correct: 'import { someFunction } from "./utils";\nconst result = someFunction();'
        }
      },
      'no-unused-vars': {
        description: '未使用變數警告',
        prevention: [
          '使用下劃線前綴標記未使用變數',
          '定期清理未使用的導入',
          '使用ESLint自動修復'
        ],
        examples: {
          wrong: 'const unusedVar = "test";',
          correct: 'const _unusedVar = "test"; // eslint-disable-line @typescript-eslint/no-unused-vars'
        }
      },
      'no-explicit-any': {
        description: '使用any類型警告',
        prevention: [
          '定義具體的類型接口',
          '使用unknown替代any',
          '使用泛型提高類型安全性'
        ],
        examples: {
          wrong: 'function processData(data: any) { }',
          correct: 'function processData<T>(data: T) { }'
        }
      }
    },

    // 最佳實踐
    bestPractices: [
      '使用TypeScript嚴格模式',
      '定期運行代碼質量檢查',
      '使用代碼模板確保一致性',
      '實施代碼審查流程',
      '建立自動化測試',
      '使用ESLint和Prettier',
      '定期更新依賴包',
      '文檔化代碼變更'
    ],

    // 檢查清單
    checklist: {
      beforeCommit: [
        '運行lint檢查',
        '運行類型檢查',
        '運行單元測試',
        '檢查代碼格式',
        '更新文檔'
      ],
      beforeBuild: [
        '運行完整測試套件',
        '檢查依賴安全性',
        '驗證構建配置',
        '檢查性能指標'
      ],
      beforeDeploy: [
        '運行端到端測試',
        '安全掃描',
        '性能測試',
        '用戶驗收測試'
      ]
    }
  };

  // 創建指南文件
  const guidePath = path.join(__dirname, '..', 'docs', 'ERROR_PREVENTION_GUIDE.md');
  const guideDir = path.dirname(guidePath);
  if (!fs.existsSync(guideDir)) {
    fs.mkdirSync(guideDir, { recursive: true });
  }

  const guideContent = `# 錯誤預防指南

## 常見錯誤預防

### no-undef錯誤
**描述**: 變數未定義錯誤

**預防措施**:
- 確保所有變數在使用前已定義
- 檢查導入語句是否正確
- 使用TypeScript嚴格模式
- 定期運行lint檢查

**示例**:
\`\`\`typescript
// 錯誤
const result = someFunction(); // someFunction未定義

// 正確
import { someFunction } from "./utils";
const result = someFunction();
\`\`\`

### no-unused-vars警告
**描述**: 未使用變數警告

**預防措施**:
- 使用下劃線前綴標記未使用變數
- 定期清理未使用的導入
- 使用ESLint自動修復

**示例**:
\`\`\`typescript
// 錯誤
const unusedVar = "test";

// 正確
const _unusedVar = "test"; // eslint-disable-line @typescript-eslint/no-unused-vars
\`\`\`

## 最佳實踐

${guide.bestPractices.map(practice => `- ${practice}`).join('\n')}

## 檢查清單

### 提交前檢查
${guide.checklist.beforeCommit.map(item => `- [ ] ${item}`).join('\n')}

### 構建前檢查
${guide.checklist.beforeBuild.map(item => `- [ ] ${item}`).join('\n')}

### 部署前檢查
${guide.checklist.beforeDeploy.map(item => `- [ ] ${item}`).join('\n')}
`;

  fs.writeFileSync(guidePath, guideContent);

  console.log('✅ 錯誤預防指南建立完成');
  console.log(`  指南文件: ${guidePath}`);

  return guide;
}

// 6. 生成預防性控制報告
function generatePreventionReport(results) {
  console.log('\n📊 預防性控制報告');
  console.log('='.repeat(50));

  console.log('✅ 預防性質量控制體系建立完成！');
  console.log('📋 建立內容：');
  console.log('  - 代碼質量檢查點');
  console.log('  - 自動化錯誤檢測');
  console.log('  - 代碼模板系統');
  console.log('  - 持續集成檢查');
  console.log('  - 錯誤預防指南');

  console.log('\n📊 建立結果：');
  console.log(`  檢查點: ${Object.keys(results.checkpoints).length} 個`);
  console.log(`  檢測規則: ${Object.keys(results.detectionRules).length} 個`);
  console.log(`  代碼模板: ${Object.keys(results.templates).length} 個`);
  console.log(`  CI配置: GitHub Actions + 本地腳本`);
  console.log(`  預防指南: 完整文檔`);

  console.log('\n🚀 預防措施：');
  console.log('  1. 提交前自動檢查');
  console.log('  2. 構建前質量驗證');
  console.log('  3. 部署前安全掃描');
  console.log('  4. 代碼模板確保一致性');
  console.log('  5. 持續監控和改進');

  return {
    checkpoints: Object.keys(results.checkpoints).length,
    detectionRules: Object.keys(results.detectionRules).length,
    templates: Object.keys(results.templates).length,
    ciConfig: 'GitHub Actions + 本地腳本',
    guide: '完整文檔'
  };
}

// 主函數
function main() {
  try {
    console.log('🚀 開始建立預防性質量控制體系...\n');

    // 階段1：建立檢查點
    const checkpoints = establishQualityCheckpoints();

    // 階段2：建立錯誤檢測
    const detectionRules = establishAutomatedErrorDetection();

    // 階段3：建立代碼模板
    const templates = establishCodeTemplates();

    // 階段4：建立CI檢查
    const ciConfig = establishCIChecks();

    // 階段5：建立預防指南
    const guide = establishErrorPreventionGuide();

    console.log('\n' + '='.repeat(50));

    // 階段6：生成報告
    const report = generatePreventionReport({
      checkpoints,
      detectionRules,
      templates,
      ciConfig,
      guide
    });

    console.log('\n🎯 預防性質量控制體系建立完成！');
    console.log('📋 建立內容：');
    console.log('  - 代碼質量檢查點');
    console.log('  - 自動化錯誤檢測');
    console.log('  - 代碼模板系統');
    console.log('  - 持續集成檢查');
    console.log('  - 錯誤預防指南');

    console.log('\n📊 建立結果：');
    console.log(`  檢查點: ${report.checkpoints} 個`);
    console.log(`  檢測規則: ${report.detectionRules} 個`);
    console.log(`  代碼模板: ${report.templates} 個`);
    console.log(`  CI配置: ${report.ciConfig}`);
    console.log(`  預防指南: ${report.guide}`);

    console.log('\n🚀 下一步行動：');
    console.log('  1. 實施檢查點機制');
    console.log('  2. 配置CI/CD流程');
    console.log('  3. 培訓開發團隊');
    console.log('  4. 持續監控和改進');

  } catch (error) {
    console.error('❌ 預防性質量控制體系建立失敗:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  establishQualityCheckpoints,
  establishAutomatedErrorDetection,
  establishCodeTemplates,
  establishCIChecks,
  establishErrorPreventionGuide,
  generatePreventionReport,
  main,
};
