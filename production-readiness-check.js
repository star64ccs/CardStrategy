const fs = require('fs');
const path = require('path');

// eslint-disable-next-line no-console
console.log('🔧 生產就緒檢查開始...\n');

// 檢查項目
const checks = {
  criticalFiles: [],
  dependencies: [],
  environment: [],
  services: [],
  issues: [],
};

// 1. 檢查關鍵文件
// eslint-disable-next-line no-console
console.log('📁 檢查關鍵文件...');
const criticalFiles = [
  'package.json',
  'backend/package.json',
  'backend/.env',
  'backend/src/server-enhanced-v2.js',
  'jest.config.js',
  'babel.config.js',
  'app.config.js',
];

criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    checks.criticalFiles.push(`✅ ${file}`);
  } else {
    checks.criticalFiles.push(`❌ ${file}`);
    checks.issues.push(`缺少關鍵文件: ${file}`);
  }
});

// 2. 檢查環境變量
// eslint-disable-next-line no-console
console.log('🔧 檢查環境變量...');
try {
  const envPath = path.join(__dirname, 'backend', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const requiredVars = [
      'JWT_SECRET',
      'DB_HOST',
      'DB_USER',
      'DB_PASSWORD',
      'DB_NAME',
      'OPENAI_API_KEY',
      'GOOGLE_CLOUD_VISION_API_KEY',
    ];

    requiredVars.forEach(varName => {
      if (envContent.includes(`${varName}=`)) {
        checks.environment.push(`✅ ${varName}`);
      } else {
        checks.environment.push(`❌ ${varName}`);
        checks.issues.push(`缺少環境變量: ${varName}`);
      }
    });
  } else {
    checks.issues.push('缺少 .env 文件');
  }
} catch (error) {
  checks.issues.push(`環境變量檢查失敗: ${error.message}`);
}

// 3. 檢查依賴包
// eslint-disable-next-line no-console
console.log('📦 檢查依賴包...');
try {
  const frontendPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const backendPackage = JSON.parse(
    fs.readFileSync('backend/package.json', 'utf8')
  );

  const frontendDeps = Object.keys(frontendPackage.dependencies || {}).length;
  const backendDeps = Object.keys(backendPackage.dependencies || {}).length;

  checks.dependencies.push(`✅ 前端依賴: ${frontendDeps} 個`);
  checks.dependencies.push(`✅ 後端依賴: ${backendDeps} 個`);

  if (frontendDeps < 50) {
    checks.issues.push('前端依賴數量異常');
  }
  if (backendDeps < 20) {
    checks.issues.push('後端依賴數量異常');
  }
} catch (error) {
  checks.issues.push(`依賴檢查失敗: ${error.message}`);
}

// 4. 檢查服務配置
// eslint-disable-next-line no-console
console.log('🛠️ 檢查服務配置...');
const serviceFiles = [
  'backend/src/services/fakeCardService.js',
  'backend/src/services/fakeCardTrainingService.js',
  'backend/src/routes/fakeCard.js',
  'backend/src/routes/fakeCardTraining.js',
  'backend/src/models/FakeCard.js',
];

serviceFiles.forEach(file => {
  if (fs.existsSync(file)) {
    checks.services.push(`✅ ${file}`);
  } else {
    checks.services.push(`❌ ${file}`);
    checks.issues.push(`缺少服務文件: ${file}`);
  }
});

// 5. 檢查前端組件
// eslint-disable-next-line no-console
console.log('🎨 檢查前端組件...');
const frontendFiles = [
  'src/screens/FakeCardReportScreen.tsx',
  'src/screens/FakeCardHistoryScreen.tsx',
  'src/screens/FakeCardTrainingScreen.tsx',
  'src/services/fakeCardCollectionService.ts',
  'src/services/fakeCardTrainingService.ts',
];

frontendFiles.forEach(file => {
  if (fs.existsSync(file)) {
    checks.services.push(`✅ ${file}`);
  } else {
    checks.services.push(`❌ ${file}`);
    checks.issues.push(`缺少前端文件: ${file}`);
  }
});

// 輸出結果
// eslint-disable-next-line no-console
console.log('\n📊 檢查結果:\n');

// eslint-disable-next-line no-console
console.log('📁 關鍵文件:');
checks.criticalFiles.forEach(check => {
  // eslint-disable-next-line no-console
  console.log(`  ${check}`);
});

// eslint-disable-next-line no-console
console.log('\n🔧 環境變量:');
checks.environment.forEach(check => {
  // eslint-disable-next-line no-console
  console.log(`  ${check}`);
});

// eslint-disable-next-line no-console
console.log('\n📦 依賴包:');
checks.dependencies.forEach(check => {
  // eslint-disable-next-line no-console
  console.log(`  ${check}`);
});

// eslint-disable-next-line no-console
console.log('\n🛠️ 服務配置:');
checks.services.forEach(check => {
  // eslint-disable-next-line no-console
  console.log(`  ${check}`);
});

// 總結
// eslint-disable-next-line no-console
console.log('\n🎯 生產就緒評估:');

const totalChecks =
  checks.criticalFiles.length +
  checks.environment.length +
  checks.dependencies.length +
  checks.services.length;
const passedChecks =
  checks.criticalFiles.filter(c => c.startsWith('✅')).length +
  checks.environment.filter(c => c.startsWith('✅')).length +
  checks.dependencies.filter(c => c.startsWith('✅')).length +
  checks.services.filter(c => c.startsWith('✅')).length;

const readinessScore = (passedChecks / totalChecks) * 100;

if (readinessScore >= 90) {
  // eslint-disable-next-line no-console
  console.log('✅ 專案已準備好進行實機測試');
  // eslint-disable-next-line no-console
  console.log(`📈 就緒度: ${readinessScore.toFixed(1)}%`);
} else if (readinessScore >= 70) {
  // eslint-disable-next-line no-console
  console.log('⚠️ 專案基本準備好，但需要修復一些問題');
  // eslint-disable-next-line no-console
  console.log(`📈 就緒度: ${readinessScore.toFixed(1)}%`);
} else {
  // eslint-disable-next-line no-console
  console.log('❌ 專案尚未準備好進行實機測試');
  // eslint-disable-next-line no-console
  console.log(`📈 就緒度: ${readinessScore.toFixed(1)}%`);
}

if (checks.issues.length > 0) {
  // eslint-disable-next-line no-console
  console.log('\n🚨 需要解決的問題:');
  checks.issues.forEach(issue => {
    // eslint-disable-next-line no-console
    console.log(`  • ${issue}`);
  });
}

// eslint-disable-next-line no-console
console.log('\n📋 實機測試建議:');
if (readinessScore >= 90) {
  // eslint-disable-next-line no-console
  console.log('1. ✅ 可以直接進行實機測試');
  // eslint-disable-next-line no-console
  console.log('2. 🔧 建議先運行單元測試');
  // eslint-disable-next-line no-console
  console.log('3. 🚀 可以啟動開發服務器');
  // eslint-disable-next-line no-console
  console.log('4. 📱 可以進行移動端測試');
} else if (readinessScore >= 70) {
  // eslint-disable-next-line no-console
  console.log('1. 🔧 需要修復上述問題');
  // eslint-disable-next-line no-console
  console.log('2. ⚠️ 建議修復後再進行測試');
  // eslint-disable-next-line no-console
  console.log('3. 🛠️ 優先修復關鍵文件問題');
} else {
  // eslint-disable-next-line no-console
  console.log('1. ❌ 需要大量修復工作');
  // eslint-disable-next-line no-console
  console.log('2. 🛠️ 建議先完成基礎配置');
  // eslint-disable-next-line no-console
  console.log('3. 📋 按照問題列表逐一修復');
}

// eslint-disable-next-line no-console
console.log('\n🚀 生產就緒檢查完成！');
