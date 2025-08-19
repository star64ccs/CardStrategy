const axios = require('axios');

// Cloudflare 配置
const cloudflareConfig = {
  apiToken: '2HWoQayJYac26tQQVlvWiNIDhxSibuwPUZoJ4ynM',
  zoneId: 'ceadb25b709450bbd450ad7cbd03bb68',
  domain: 'cardstrategyapp.com',
  apiUrl: 'https://api.cloudflare.com/client/v4'
};

console.log('🔍 Cloudflare 診斷工具');
console.log('='.repeat(50));
console.log(`🌐 域名: ${cloudflareConfig.domain}`);
console.log(`🔑 API Token: ${cloudflareConfig.apiToken.substring(0, 8)}...`);
console.log(`🏷️  Zone ID: ${cloudflareConfig.zoneId}`);
console.log('='.repeat(50));

// 測試基本 API 連接
async function testBasicConnection() {
  console.log('\n🔍 測試基本 API 連接...');
  
  try {
    const response = await axios.get(`${cloudflareConfig.apiUrl}/user`, {
      headers: {
        'Authorization': `Bearer ${cloudflareConfig.apiToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    if (response.data.success) {
      const user = response.data.result;
      console.log(`✅ 基本 API 連接成功`);
      console.log(`👤 用戶: ${user.email}`);
      console.log(`🏢 組織: ${user.organizations?.[0]?.name || 'N/A'}`);
      return true;
    } else {
      console.log('❌ API 響應失敗:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ 基本 API 連接失敗:', error.message);
    if (error.response) {
      console.error('狀態碼:', error.response.status);
      console.error('錯誤詳情:', error.response.data);
    }
    return false;
  }
}

// 測試 Zone 訪問權限
async function testZoneAccess() {
  console.log('\n🔍 測試 Zone 訪問權限...');
  
  try {
    const response = await axios.get(`${cloudflareConfig.apiUrl}/zones/${cloudflareConfig.zoneId}`, {
      headers: {
        'Authorization': `Bearer ${cloudflareConfig.apiToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    if (response.data.success) {
      const zone = response.data.result;
      console.log(`✅ Zone 訪問成功`);
      console.log(`📊 域名: ${zone.name}`);
      console.log(`📊 狀態: ${zone.status}`);
      console.log(`📊 計劃: ${zone.plan.name}`);
      console.log(`📊 Account ID: ${zone.account.id}`);
      return zone.account.id;
    } else {
      console.log('❌ Zone 訪問失敗:', response.data);
      return null;
    }
  } catch (error) {
    console.error('❌ Zone 訪問失敗:', error.message);
    if (error.response) {
      console.error('狀態碼:', error.response.status);
      console.error('錯誤詳情:', error.response.data);
    }
    return null;
  }
}

// 測試 DNS 記錄訪問
async function testDNSAccess() {
  console.log('\n🔍 測試 DNS 記錄訪問...');
  
  try {
    const response = await axios.get(`${cloudflareConfig.apiUrl}/zones/${cloudflareConfig.zoneId}/dns_records`, {
      headers: {
        'Authorization': `Bearer ${cloudflareConfig.apiToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    if (response.data.success) {
      console.log(`✅ DNS 記錄訪問成功`);
      console.log(`📊 現有記錄數量: ${response.data.result.length}`);
      
      if (response.data.result.length > 0) {
        console.log('📋 現有 DNS 記錄:');
        response.data.result.forEach((record, index) => {
          console.log(`  ${index + 1}. ${record.type} ${record.name} -> ${record.content}`);
        });
      }
      return true;
    } else {
      console.log('❌ DNS 記錄訪問失敗:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ DNS 記錄訪問失敗:', error.message);
    if (error.response) {
      console.error('狀態碼:', error.response.status);
      console.error('錯誤詳情:', error.response.data);
    }
    return false;
  }
}

// 檢查 Token 權限
function checkTokenPermissions() {
  console.log('\n🔍 檢查 Token 權限...');
  
  // 基於錯誤信息推斷權限
  console.log('📋 建議的 Token 權限:');
  console.log('  - Zone:Zone:Read');
  console.log('  - Zone:DNS:Edit');
  console.log('  - Zone:Zone Settings:Edit');
  console.log('  - Zone:Page Rules:Edit');
  console.log('  - User:User:Read');
  
  console.log('\n📋 請在 Cloudflare 控制台中檢查:');
  console.log('  1. 訪問 https://dash.cloudflare.com/profile/api-tokens');
  console.log('  2. 找到 "CardStrategy_Cloudflare_API_token"');
  console.log('  3. 檢查權限設置');
  console.log('  4. 確保包含上述權限');
}

// 生成環境變數配置
function generateEnvConfig(accountId) {
  console.log('\n📝 生成環境變數配置...');
  
  const envConfig = `# Cloudflare 配置
CLOUDFLARE_API_TOKEN=2HWoQayJYac26tQQVlvWiNIDhxSibuwPUZoJ4ynM
CLOUDFLARE_ZONE_ID=ceadb25b709450bbd450ad7cbd03bb68
CLOUDFLARE_ACCOUNT_ID=${accountId || 'your-account-id-here'}

# 域名配置
DOMAIN=cardstrategyapp.com
API_DOMAIN=api.cardstrategyapp.com
CDN_DOMAIN=cdn.cardstrategyapp.com

# DigitalOcean Droplet IP (請設置您的 Droplet IP)
DROPLET_IP=your-droplet-ip-here
`;
  
  console.log('✅ 環境變數配置已生成');
  console.log('\n📋 請將以下配置添加到您的環境變數中:');
  console.log('='.repeat(50));
  console.log(envConfig);
  console.log('='.repeat(50));
  
  return envConfig;
}

// 主診斷函數
async function runDiagnostic() {
  console.log('\n🚀 開始診斷...\n');
  
  let accountId = null;
  
  // 1. 測試基本連接
  const basicConnection = await testBasicConnection();
  
  if (basicConnection) {
    // 2. 測試 Zone 訪問
    accountId = await testZoneAccess();
    
    // 3. 測試 DNS 訪問
    await testDNSAccess();
    
    // 4. 生成配置
    generateEnvConfig(accountId);
    
    console.log('\n🎉 診斷完成！所有測試通過。');
    console.log('\n📋 下一步操作:');
    console.log('1. 設置 DROPLET_IP 環境變數');
    console.log('2. 運行: npm run setup:cloudflare');
    
  } else {
    // 5. 檢查權限
    checkTokenPermissions();
    
    console.log('\n❌ 診斷完成！發現問題。');
    console.log('\n📋 需要解決的問題:');
    console.log('1. 檢查 API Token 權限');
    console.log('2. 確保 Token 包含必要的權限');
    console.log('3. 重新運行診斷');
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  runDiagnostic()
    .then(() => {
      console.log('\n✅ 診斷腳本執行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 診斷腳本執行失敗:', error);
      process.exit(1);
    });
}

module.exports = {
  runDiagnostic,
  testBasicConnection,
  testZoneAccess,
  testDNSAccess
};
