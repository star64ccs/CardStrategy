#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 設置開發環境...');

// Check必要的Tool
const checkTool = (tool, command) => {
  try {
    execSync(`${command} --version`, { stdio: 'ignore' });
    console.log(`✅ ${tool} 已安裝`);
    return true;
  } catch (error) {
    console.log(`❌ ${tool} 未安裝`);
    return false;
  }
};

// CheckTool
const tools = [
  { name: 'Node.js', command: 'node' },
  { name: 'npm', command: 'npm' },
  { name: 'Git', command: 'git' },
];

let allToolsInstalled = true;
tools.forEach(tool => {
  if (!checkTool(tool.name, tool.command)) {
    allToolsInstalled = false;
  }
});

if (!allToolsInstalled) {
  console.log('❌ 請先安裝缺少的工具');
  process.exit(1);
}

// Install依賴
console.log('📦 安裝依賴...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ 依賴安裝完成');
} catch (error) {
  console.log('❌ 依賴安裝Failed');
  process.exit(1);
}

// Settings Git hooks
console.log('🔧 設置 Git hooks...');
try {
  execSync('npx husky install', { stdio: 'inherit' });
  console.log('✅ Git hooks 設置完成');
} catch (error) {
  console.log('❌ Git hooks SettingsFailed');
}

// 運RowClass型Check
console.log('🔍 運行類型檢查...');
try {
  execSync('npm run type-check', { stdio: 'inherit' });
  console.log('✅ 類型檢查通過');
} catch (error) {
  console.log('❌ 類型CheckFailed');
}

// 運Row ESLint
console.log('📝 運行 ESLint 檢查...');
try {
  execSync('npm run lint', { stdio: 'inherit' });
  console.log('✅ ESLint 檢查通過');
} catch (error) {
  console.log('❌ ESLint CheckFailed');
}

// 運RowTest
console.log('🧪 運行測試...');
try {
  execSync('npm run test:fast', { stdio: 'inherit' });
  console.log('✅ 測試通過');
} catch (error) {
  console.log('❌ 測試Failed');
}

console.log('🎉 開發環境設置完成！');
console.log('');
console.log('可用的命令:');
console.log('  npm start          - 啟動開發Server');
console.log('  npm run lint       - 運行 ESLint 檢查');
console.log('  npm run lint:fix   - 自動修復 ESLint 問題');
console.log('  npm run type-check - 運行 TypeScript 類型檢查');
console.log('  npm run format     - 格式化代碼');
console.log('  npm test           - 運行測試');
console.log('  npm run test:watch - 監視模式運行測試');
