const axios = require('axios');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function checkStatus() {
  console.log('🔍 檢查 CardStrategy 應用程序狀態');
  console.log('=====================================');

  // 檢查後端 API
  try {
    console.log('🔍 檢查後端 API (端口 3000)...');
    const response = await axios.get('http://localhost:3000/health', { timeout: 3000 });
    console.log('✅ 後端 API 運行正常');
    console.log('   狀態:', response.data.message);
    console.log('   版本:', response.data.version);
  } catch (error) {
    console.log('❌ 後端 API 未運行或無法訪問');
  }

  // 檢查前端端口
  try {
    console.log('🔍 檢查前端端口...');
    const { stdout } = await execAsync('netstat -an | findstr ":19000\|:8081"');
    if (stdout.trim()) {
      console.log('✅ 前端服務器正在運行');
      console.log('   端口:', stdout.trim());
    } else {
      console.log('⚠️  前端服務器可能未啟動');
    }
  } catch (error) {
    console.log('⚠️  無法檢查前端端口');
  }

  // 檢查 Node.js 進程
  try {
    console.log('🔍 檢查 Node.js 進程...');
    const { stdout } = await execAsync('Get-Process node -ErrorAction SilentlyContinue | Measure-Object | Select-Object Count');
    const match = stdout.match(/\d+/);
    if (match && parseInt(match[0]) > 0) {
      console.log(`✅ 發現 ${match[0]} 個 Node.js 進程`);
    } else {
      console.log('⚠️  未發現 Node.js 進程');
    }
  } catch (error) {
    console.log('⚠️  無法檢查 Node.js 進程');
  }

  console.log('');
  console.log('📋 建議操作:');
  console.log('   1. 後端 API: http://localhost:3000/health');
  console.log('   2. 前端開發服務器: 通常在 http://localhost:19000 或 http://localhost:8081');
  console.log('   3. 如果前端未啟動，請運行: npm start');
}

checkStatus().catch(console.error);
