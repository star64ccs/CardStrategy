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
  { name: 'social-features', port: 3006, cwd: './social-features' },
];

// 啟動所有模組
function startAllModules() {
  // logger.info('🚀 啟動 CardStrategy 微前端架構...\n');

  const processes = [];

  modules.forEach((module) => {
    // logger.info(`📦 啟動 ${module.name} 模組 (端口: ${module.port})`);

    const child = spawn('npm', ['start'], {
      cwd: path.join(__dirname, module.cwd),
      stdio: 'pipe',
      shell: true,
    });

    child.stdout.on('data', (data) => {
      // logger.info(`[${module.name}] ${data.toString().trim()}`);
    });

    child.stderr.on('data', (data) => {
      // logger.info(`[${module.name}] ERROR: ${data.toString().trim()}`);
    });

    child.on('close', (code) => {
      // logger.info(`[${module.name}] 進程結束，退出碼: ${code}`);
    });

    processes.push(child);
  });

  // 優雅關閉
  process.on('SIGINT', () => {
    // logger.info('\n🛑 正在關閉所有模組...');
    processes.forEach((child) => {
      child.kill('SIGINT');
    });
    process.exit(0);
  });

  // logger.info('\n✅ 所有模組已啟動！');
  // logger.info('📱 主應用: http://localhost:3000');
  // logger.info('🎴 卡片管理: http://localhost:3001');
  // logger.info('📊 市場分析: http://localhost:3002');
  // logger.info('🤖 AI 生態: http://localhost:3003');
  // logger.info('👤 用戶管理: http://localhost:3004');
  // logger.info('💼 投資組合: http://localhost:3005');
  // logger.info('👥 社交功能: http://localhost:3006');
  // logger.info('\n按 Ctrl+C 停止所有模組');
}

// 檢查依賴並啟動
function checkAndStart() {
  // logger.info('🔍 檢查模組依賴...\n');

  const fs = require('fs');
  const missingModules = [];

  modules.forEach((module) => {
    const packageJsonPath = path.join(__dirname, module.cwd, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      missingModules.push(module.name);
    }
  });

  if (missingModules.length > 0) {
    // logger.info('❌ 以下模組缺少 package.json 文件:');
    missingModules.forEach((name) => {
      /* logger.info(`   - ${name}`) */
    });
    // logger.info('\n請先創建這些模組的配置文件。');
    return;
  }

  startAllModules();
}

checkAndStart();
