import { chromium, FullConfig } from '@playwright/test';
import { setupTestEnvironment } from './e2e-setup';

/**
 * 全局設置 - 在所有測試開始前執行
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 開始全局測試環境設置...');

  try {
    // 設置測試環境
    await setupTestEnvironment({
      baseUrl: 'http://localhost:3000',
      apiBaseUrl: 'http://localhost:5000',
      timeout: 30000,
      retries: 2,
    });

    console.log('✅ 測試環境設置完成');

    // 檢查服務器是否運行
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      // 檢查前端服務器
      await page.goto('http://localhost:3000', { timeout: 10000 });
      console.log('✅ 前端服務器運行正常');

      // 檢查後端 API 服務器
      const response = await page.request.get(
        'http://localhost:5000/api/health'
      );
      if (response.ok()) {
        console.log('✅ 後端 API 服務器運行正常');
      } else {
        console.warn('⚠️ 後端 API 服務器可能未運行');
      }
    } catch (error) {
      console.warn('⚠️ 服務器檢查失敗:', error.message);
    } finally {
      await context.close();
      await browser.close();
    }

    // 創建測試目錄
    const fs = require('fs');
    const path = require('path');

    const testDirs = [
      'test-results',
      'test-results/screenshots',
      'test-results/videos',
      'test-results/traces',
      'test-results/html-report',
    ];

    for (const dir of testDirs) {
      const fullPath = path.join(process.cwd(), dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`📁 創建目錄: ${dir}`);
      }
    }

    // 清理之前的測試結果
    const testResultsPath = path.join(process.cwd(), 'test-results');
    if (fs.existsSync(testResultsPath)) {
      const files = fs.readdirSync(testResultsPath);
      for (const file of files) {
        if (file !== 'html-report') {
          // 保留 HTML 報告
          const filePath = path.join(testResultsPath, file);
          if (fs.statSync(filePath).isFile()) {
            fs.unlinkSync(filePath);
            console.log(`🗑️ 清理文件: ${file}`);
          }
        }
      }
    }

    console.log('🧹 測試環境清理完成');

    // 設置環境變數
    process.env.NODE_ENV = 'test';
    process.env.TEST_MODE = 'e2e';
    process.env.API_BASE_URL = 'http://localhost:5000';

    console.log('🔧 環境變數設置完成');

    // 檢查依賴服務
    await checkDependencies();

    console.log('🎉 全局設置完成！');
  } catch (error) {
    console.error('❌ 全局設置失敗:', error);
    throw error;
  }
}

/**
 * 檢查依賴服務
 */
async function checkDependencies() {
  console.log('🔍 檢查依賴服務...');

  const services = [
    { name: 'Node.js', check: () => process.version },
    {
      name: 'npm',
      check: () =>
        require('child_process')
          .execSync('npm --version', { encoding: 'utf8' })
          .trim(),
    },
    {
      name: 'Playwright',
      check: () => require('@playwright/test/package.json').version,
    },
  ];

  for (const service of services) {
    try {
      const version = service.check();
      console.log(`✅ ${service.name}: ${version}`);
    } catch (error) {
      console.warn(`⚠️ ${service.name}: 未找到或版本檢查失敗`);
    }
  }
}

export default globalSetup;
