const { spawn } = require('child_process');
const path = require('path');

// 微前端模組配置
const modules = [
  { name: 'shell', port: 3000, cwd: './shell' },
  { name: 'card-management', port: 3001, cwd: './card-management' },
  { name: 'market-analysis', port: 3002, cwd: './market-analysis' },
  { name: 'ai-ecosystem', port: 3003, cwd: './ai-ecosystem' },
  { name: 'user-management', port: 3004, cwd: './user-management' },
  { name: 'investment-portfolio', port: 3005, cwd: './investment-portfolio' },
  { name: 'social-features', port: 3006, cwd: './social-features' }
];

// 啟動所有模組
function startAllModules() {
  console.log('🚀 啟動 CardStrategy 微前端架構...\n');

  const processes = [];

  modules.forEach(module => {
    console.log(`📦 啟動 ${module.name} 模組 (端口: ${module.port})`);

    const child = spawn('npm', ['start'], {
      cwd: path.join(__dirname, module.cwd),
      stdio: 'pipe',
      shell: true
    });

    child.stdout.on('data', (data) => {
      console.log(`[${module.name}] ${data.toString().trim()}`);
    });

    child.stderr.on('data', (data) => {
      console.error(`[${module.name}] ERROR: ${data.toString().trim()}`);
    });

    child.on('close', (code) => {
      console.log(`[${module.name}] 進程結束，退出碼: ${code}`);
    });

    processes.push(child);
  });

  // 優雅關閉
  process.on('SIGINT', () => {
    console.log('\n🛑 正在關閉所有模組...');
    processes.forEach(child => {
      child.kill('SIGINT');
    });
    process.exit(0);
  });

  console.log('\n✅ 所有模組已啟動！');
  console.log('📱 主應用: http://localhost:3000');
  console.log('🎴 卡片管理: http://localhost:3001');
  console.log('📊 市場分析: http://localhost:3002');
  console.log('🤖 AI 生態: http://localhost:3003');
  console.log('👤 用戶管理: http://localhost:3004');
  console.log('💼 投資組合: http://localhost:3005');
  console.log('👥 社交功能: http://localhost:3006');
  console.log('\n按 Ctrl+C 停止所有模組');
}

// 檢查依賴並啟動
function checkAndStart() {
  console.log('🔍 檢查模組依賴...\n');

  const fs = require('fs');
  const missingModules = [];

  modules.forEach(module => {
    const packageJsonPath = path.join(__dirname, module.cwd, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      missingModules.push(module.name);
    }
  });

  if (missingModules.length > 0) {
    console.log('❌ 以下模組缺少 package.json 文件:');
    missingModules.forEach(name => console.log(`   - ${name}`));
    console.log('\n請先創建這些模組的配置文件。');
    return;
  }

  startAllModules();
}

checkAndStart();
