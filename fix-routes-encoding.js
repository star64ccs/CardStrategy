const fs = require('fs');
const path = require('path');

console.log('🔧 修復路由文件編碼問題...\n');

const routesDir = './backend/src/routes';
const routeFiles = [
  'alerts.js',
  'analytics.js', 
  'cards-optimized.js',
  'dataQuality.js',
  'deepLearning.js',
  'feedback.js',
  'localAI.js',
  'market-optimized.js',
  'mobile.js',
  'performance.js',
  'shareVerification.js',
  'simulatedGrading.js',
  'sync.js'
];

let fixedCount = 0;

routeFiles.forEach(file => {
  const filePath = path.join(routesDir, file);
  
  if (fs.existsSync(filePath)) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      // 修復導入語句
      if (content.includes('const auth = require(\'../middleware/auth\');')) {
        content = content.replace(
          'const auth = require(\'../middleware/auth\');',
          'const { authenticateToken: protect } = require(\'../middleware/auth\');'
        );
        modified = true;
      }
      
      // 修復使用auth的地方
      if (content.includes(', auth,')) {
        content = content.replace(/, auth,/g, ', protect,');
        modified = true;
      }
      
      if (content.includes('(auth,')) {
        content = content.replace(/\(auth,/g, '(protect,');
        modified = true;
      }
      
      if (content.includes('auth, ')) {
        content = content.replace(/auth, /g, 'protect, ');
        modified = true;
      }
      
      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ ${file}: 修復完成`);
        fixedCount++;
      } else {
        console.log(`⚠️ ${file}: 無需修復`);
      }
    } catch (error) {
      console.log(`❌ ${file}: 修復失敗 - ${error.message}`);
    }
  } else {
    console.log(`❌ ${file}: 文件不存在`);
  }
});

console.log(`\n📊 修復完成: ${fixedCount}/${routeFiles.length} 個文件`);
