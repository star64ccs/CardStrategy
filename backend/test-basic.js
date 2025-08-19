// 基本功能測試
const express = require('express');
const cors = require('cors');

console.log('🧪 開始基本功能測試...');

// 測試 1: 檢查基本依賴
try {
  console.log('✅ Express 依賴正常');
  console.log('✅ CORS 依賴正常');
} catch (error) {
  console.log('❌ 基本依賴檢查失敗:', error.message);
}

// 測試 2: 檢查環境變量
console.log('📋 環境變量檢查:');
console.log('- NODE_ENV:', process.env.NODE_ENV || '未設置');
console.log('- PORT:', process.env.PORT || '未設置');

// 測試 3: 創建簡單的 Express 應用
try {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/test', (req, res) => {
    res.json({ message: '測試成功', timestamp: new Date().toISOString() });
  });

  console.log('✅ Express 應用創建成功');
} catch (error) {
  console.log('❌ Express 應用創建失敗:', error.message);
}

// 測試 4: 檢查文件系統
const fs = require('fs');
const path = require('path');

try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  console.log('✅ package.json 讀取成功');
  console.log('- 項目名稱:', packageJson.name);
  console.log('- 版本:', packageJson.version);
} catch (error) {
  console.log('❌ package.json 讀取失敗:', error.message);
}

// 測試 5: 檢查目錄結構
const directories = ['src', 'tests', 'config'];
directories.forEach(dir => {
  try {
    const dirPath = path.join(__dirname, dir);
    if (fs.existsSync(dirPath)) {
      console.log(`✅ 目錄存在: ${dir}`);
    } else {
      console.log(`❌ 目錄不存在: ${dir}`);
    }
  } catch (error) {
    console.log(`❌ 檢查目錄失敗 ${dir}:`, error.message);
  }
});

console.log('🎉 基本功能測試完成！');
