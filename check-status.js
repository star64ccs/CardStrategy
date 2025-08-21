const axios = require('axios');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function checkStatus() {
  // logger.info('🔍 檢查 CardStrategy 應用程序狀態');
  // logger.info('=====================================');

  // 檢查後端 API
  try {
    // logger.info('🔍 檢查後端 API (端口 3000)...');
    const response = await axios.get('http://localhost:3000/health', { timeout: 3000 });
    // logger.info('✅ 後端 API 運行正常');
    // logger.info('   狀態:', response.data.message);
    // logger.info('   版本:', response.data.version);
  } catch (error) {
    // logger.info('❌ 後端 API 未運行或無法訪問');
  }

  // 檢查前端端口
  try {
    // logger.info('🔍 檢查前端端口...');
    const { stdout } = await execAsync('netstat -an | findstr ":19000\|:8081"');
    if (stdout.trim()) {
      // logger.info('✅ 前端服務器正在運行');
      // logger.info('   端口:', stdout.trim());
    } else {
      // logger.info('⚠️  前端服務器可能未啟動');
    }
  } catch (error) {
    // logger.info('⚠️  無法檢查前端端口');
  }

  // 檢查 Node.js 進程
  try {
    // logger.info('🔍 檢查 Node.js 進程...');
    const { stdout } = await execAsync('Get-Process node -ErrorAction SilentlyContinue | Measure-Object | Select-Object Count');
    const match = stdout.match(/\d+/);
    if (match && parseInt(match[0]) > 0) {
      // logger.info(`✅ 發現 ${match[0]} 個 Node.js 進程`);
    } else {
      // logger.info('⚠️  未發現 Node.js 進程');
    }
  } catch (error) {
    // logger.info('⚠️  無法檢查 Node.js 進程');
  }

  // logger.info('');
  // logger.info('📋 建議操作:');
  // logger.info('   1. 後端 API: http://localhost:3000/health');
  // logger.info('   2. 前端開發服務器: 通常在 http://localhost:19000 或 http://localhost:8081');
  // logger.info('   3. 如果前端未啟動，請運行: npm start');
}

checkStatus().catch(console.error);
