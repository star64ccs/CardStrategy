const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Git HooksSettings腳本
 * 按照執Row原則建構
 * 嚴謹語法，無Error，高質量代碼
 * 確保Submit前Auto進Row質量Check
 */

console.log('🚀 開始設置Git Hooks...\n');

// 1. Settingspre-commit hook
function setupPreCommitHook() {
  console.log('📋 設置pre-commit hook...');

  const hooksDir = path.join(__dirname, '..', '.git', 'hooks');
  const preCommitPath = path.join(hooksDir, 'pre-commit');

  const preCommitContent = `#!/bin/sh

echo "🚀 執行提交前檢查..."

# 運行lint檢查
echo "📋 檢查代碼風格..."
npm run lint
if [ $? -ne 0 ]; then
  echo "❌ 代碼風格CheckFailed，請修復後再提交"
  exit 1
fi

# 運行類型檢查
echo "📋 檢查TypeScript類型..."
npm run type-check
if [ $? -ne 0 ]; then
  echo "❌ TypeScript類型CheckFailed，請修復後再提交"
  exit 1
fi

# 運行單元測試
echo "📋 運行單元測試..."
npm run test:unit
if [ $? -ne 0 ]; then
  echo "❌ 單元測試Failed，請修復後再提交"
  exit 1
fi

echo "✅ 提交前檢查通過"
exit 0
`;

  fs.writeFileSync(preCommitPath, preCommitContent);

  // Settings執Row權限
  try {
    execSync(`chmod +x "${preCommitPath}"`);
  } catch (error) {
    console.log('⚠️ 無法設置執行權限，請手動設置');
  }

  console.log('✅ pre-commit hook設置完成');
  console.log(`  Hook文件: ${preCommitPath}`);

  return preCommitPath;
}

// 2. Settingspre-push hook
function setupPrePushHook() {
  console.log('📋 設置pre-push hook...');

  const hooksDir = path.join(__dirname, '..', '.git', 'hooks');
  const prePushPath = path.join(hooksDir, 'pre-push');

  const prePushContent = `#!/bin/sh

echo "🚀 執行推送前檢查..."

# 運行完整測試套件
echo "📋 運行完整測試套件..."
npm run test
if [ $? -ne 0 ]; then
  echo "❌ 測試Failed，請修復後再推送"
  exit 1
fi

# 運行構建檢查
echo "📋 檢查構建..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ 構建Failed，請修復後再推送"
  exit 1
fi

echo "✅ 推送前檢查通過"
exit 0
`;

  fs.writeFileSync(prePushPath, prePushContent);

  // Settings執Row權限
  try {
    execSync(`chmod +x "${prePushPath}"`);
  } catch (error) {
    console.log('⚠️ 無法設置執行權限，請手動設置');
  }

  console.log('✅ pre-push hook設置完成');
  console.log(`  Hook文件: ${prePushPath}`);

  return prePushPath;
}

// 3. Settingscommit-msg hook
function setupCommitMsgHook() {
  console.log('📋 設置commit-msg hook...');

  const hooksDir = path.join(__dirname, '..', '.git', 'hooks');
  const commitMsgPath = path.join(hooksDir, 'commit-msg');

  const commitMsgContent = `#!/bin/sh

echo "🚀 檢查提交信息格式..."

# 獲取提交信息
commit_msg=$(cat "$1")

# 檢查提交信息格式
if ! echo "$commit_msg" | grep -qE "^(feat|fix|docs|style|refactor|test|chore)(\\(.+\\))?: .+"; then
  echo "❌ 提交信息格式不正確"
  echo "正確格式: <type>(<scope>): <description>"
  echo "類型: feat, fix, docs, style, refactor, test, chore"
  echo "示例: feat(user): add user authentication"
  exit 1
fi

echo "✅ 提交信息格式正確"
exit 0
`;

  fs.writeFileSync(commitMsgPath, commitMsgContent);

  // Settings執Row權限
  try {
    execSync(`chmod +x "${commitMsgPath}"`);
  } catch (error) {
    console.log('⚠️ 無法設置執行權限，請手動設置');
  }

  console.log('✅ commit-msg hook設置完成');
  console.log(`  Hook文件: ${commitMsgPath}`);

  return commitMsgPath;
}

// 4. CreateHuskyConfigure
function setupHuskyConfig() {
  console.log('📋 設置Husky配置...');

  const huskyDir = path.join(__dirname, '..', '.husky');
  if (!fs.existsSync(huskyDir)) {
    fs.mkdirSync(huskyDir, { recursive: true });
  }

  // pre-commit hook
  const preCommitHuskyPath = path.join(huskyDir, 'pre-commit');
  const preCommitHuskyContent = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🚀 執行Husky pre-commit檢查..."

npm run lint
npm run type-check
npm run test:unit
`;

  fs.writeFileSync(preCommitHuskyPath, preCommitHuskyContent);

  // pre-push hook
  const prePushHuskyPath = path.join(huskyDir, 'pre-push');
  const prePushHuskyContent = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🚀 執行Husky pre-push檢查..."

npm run test
npm run build
`;

  fs.writeFileSync(prePushHuskyPath, prePushHuskyContent);

  // Settings執Row權限
  try {
    execSync(`chmod +x "${preCommitHuskyPath}"`);
    execSync(`chmod +x "${prePushHuskyPath}"`);
  } catch (error) {
    console.log('⚠️ 無法設置執行權限，請手動設置');
  }

  console.log('✅ Husky配置設置完成');
  console.log(`  Husky目錄: ${huskyDir}`);

  return huskyDir;
}

// 5. Updatepackage.json腳本
function updatePackageScripts() {
  console.log('📋 更新package.json腳本...');

  const packagePath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  // Add新的腳本
  const newScripts = {
    'prepare': 'husky install',
    'pre-commit': 'npm run lint && npm run type-check && npm run test:unit',
    'pre-push': 'npm run test && npm run build',
    'quality-check': 'npm run lint && npm run type-check && npm run test',
    'quality-check:full': 'npm run lint && npm run type-check && npm run test && npm run build'
  };

  packageJson.scripts = { ...packageJson.scripts, ...newScripts };

  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));

  console.log('✅ package.json腳本更新完成');
  console.log(`  新增腳本: ${Object.keys(newScripts).length} 個`);

  return newScripts;
}

// 6. 生成SettingsReport
function generateSetupReport(results) {
  console.log('\n📊 Git Hooks設置報告');
  console.log('='.repeat(50));

  console.log('✅ Git Hooks設置完成！');
  console.log('📋 設置內容：');
  console.log('  - pre-commit hook');
  console.log('  - pre-push hook');
  console.log('  - commit-msg hook');
  console.log('  - Husky配置');
  console.log('  - package.json腳本');

  console.log('\n📊 設置結果：');
  console.log(`  Git Hooks: ${Object.keys(results.hooks).length} 個`);
  console.log(`  Husky配置: ${results.husky ? '已設置' : '未設置'}`);
  console.log(`  新增腳本: ${Object.keys(results.scripts).length} 個`);

  console.log('\n🚀 預防措施：');
  console.log('  1. 提交前自動檢查代碼風格');
  console.log('  2. 提交前自動檢查TypeScript類型');
  console.log('  3. 提交前自動運行單元測試');
  console.log('  4. 推送前自動運行完整測試');
  console.log('  5. 推送前自動檢查構建');
  console.log('  6. 提交信息格式檢查');

  return {
    hooks: Object.keys(results.hooks).length,
    husky: results.husky ? '已設置' : '未設置',
    scripts: Object.keys(results.scripts).length
  };
}

// 主Function
function main() {
  try {
    console.log('🚀 開始設置Git Hooks...\n');

    // 階段1：SettingsGit Hooks
    const preCommitPath = setupPreCommitHook();
    const prePushPath = setupPrePushHook();
    const commitMsgPath = setupCommitMsgHook();

    // 階段2：SettingsHuskyConfigure
    const huskyDir = setupHuskyConfig();

    // 階段3：Updatepackage.json腳本
    const newScripts = updatePackageScripts();

    console.log('\n' + '='.repeat(50));

    // 階段4：生成Report
    const report = generateSetupReport({
      hooks: { preCommitPath, prePushPath, commitMsgPath },
      husky: huskyDir,
      scripts: newScripts
    });

    console.log('\n🎯 Git Hooks設置完成！');
    console.log('📋 設置內容：');
    console.log('  - pre-commit hook');
    console.log('  - pre-push hook');
    console.log('  - commit-msg hook');
    console.log('  - Husky配置');
    console.log('  - package.json腳本');

    console.log('\n📊 設置結果：');
    console.log(`  Git Hooks: ${report.hooks} 個`);
    console.log(`  Husky配置: ${report.husky}`);
    console.log(`  新增腳本: ${report.scripts} 個`);

    console.log('\n🚀 下一步行動：');
    console.log('  1. 測試Git Hooks功能');
    console.log('  2. 配置團隊開發環境');
    console.log('  3. 培訓開發團隊');
    console.log('  4. 監控Hook執行效果');

  } catch (error) {
    console.error('❌ Git HooksSettingsFailed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  setupPreCommitHook,
  setupPrePushHook,
  setupCommitMsgHook,
  setupHuskyConfig,
  updatePackageScripts,
  generateSetupReport,
  main,
};
