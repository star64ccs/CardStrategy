const axios = require('axios');

// Cloudflare 配置 (使用已記錄的 Token 和 Zone ID)
const cloudflareConfig = {
  apiToken: '2HWoQayJYac26tQQVlvWiNIDhxSibuwPUZoJ4ynM',
  zoneId: 'ceadb25b709450bbd450ad7cbd03bb68',
  domain: 'cardstrategyapp.com',
  apiUrl: 'https://api.cloudflare.com/client/v4'
};

console.log('🚀 Cloudflare 快速配置工具');
console.log('='.repeat(50));
console.log(`🌐 域名: ${cloudflareConfig.domain}`);
console.log(`🔑 API Token: ${cloudflareConfig.apiToken.substring(0, 8)}...`);
console.log('='.repeat(50));

// 獲取 Zone ID
async function getZoneId() {
  console.log('\n🔍 正在獲取 Zone ID...');
  
  try {
    const response = await axios.get(`${cloudflareConfig.apiUrl}/zones?name=${cloudflareConfig.domain}`, {
      headers: {
        'Authorization': `Bearer ${cloudflareConfig.apiToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.success && response.data.result.length > 0) {
      const zoneId = response.data.result[0].id;
      const accountId = response.data.result[0].account.id;
      
      console.log(`✅ 找到 Zone ID: ${zoneId}`);
      console.log(`✅ 找到 Account ID: ${accountId}`);
      
      return { zoneId, accountId };
    } else {
      throw new Error('找不到域名對應的 Zone ID');
    }
  } catch (error) {
    console.error('❌ 獲取 Zone ID 失敗:', error.message);
    if (error.response?.data?.errors) {
      console.error('詳細錯誤:', error.response.data.errors);
    }
    throw error;
  }
}

// 測試 API 連接
async function testAPIConnection() {
  console.log('\n🔍 測試 API 連接...');
  
  try {
    const response = await axios.get(`${cloudflareConfig.apiUrl}/user`, {
      headers: {
        'Authorization': `Bearer ${cloudflareConfig.apiToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.success) {
      const user = response.data.result;
      console.log(`✅ API 連接成功`);
      console.log(`👤 用戶: ${user.email}`);
      console.log(`🏢 組織: ${user.organizations?.[0]?.name || 'N/A'}`);
      return true;
    } else {
      throw new Error('API 響應失敗');
    }
  } catch (error) {
    console.error('❌ API 連接失敗:', error.message);
    throw error;
  }
}

// 檢查域名狀態
async function checkDomainStatus(zoneId) {
  console.log('\n🔍 檢查域名狀態...');
  
  try {
    const response = await axios.get(`${cloudflareConfig.apiUrl}/zones/${zoneId}`, {
      headers: {
        'Authorization': `Bearer ${cloudflareConfig.apiToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.success) {
      const zone = response.data.result;
      console.log(`✅ 域名狀態: ${zone.status}`);
      console.log(`📊 計劃: ${zone.plan.name}`);
      console.log(`🌍 名稱服務器: ${zone.name_servers.join(', ')}`);
      return zone;
    } else {
      throw new Error('獲取域名信息失敗');
    }
  } catch (error) {
    console.error('❌ 檢查域名狀態失敗:', error.message);
    throw error;
  }
}

// 生成環境變數配置
function generateEnvConfig(zoneId, accountId) {
  console.log('\n📝 生成環境變數配置...');
  
  const envConfig = `# Cloudflare 配置
CLOUDFLARE_API_TOKEN=2HWoQayJYac26tQQVlvWiNIDhxSibuwPUZoJ4ynM
CLOUDFLARE_ZONE_ID=${zoneId}
CLOUDFLARE_ACCOUNT_ID=${accountId}

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

// 主函數
async function quickSetup() {
  try {
    // 1. 測試 API 連接
    await testAPIConnection();
    
    // 2. 獲取 Zone ID 和 Account ID
    const { zoneId, accountId } = await getZoneId();
    
    // 3. 檢查域名狀態
    await checkDomainStatus(zoneId);
    
    // 4. 生成環境變數配置
    generateEnvConfig(zoneId, accountId);
    
    console.log('\n🎉 快速配置完成！');
    console.log('\n📋 下一步操作:');
    console.log('1. 設置 DROPLET_IP 環境變數');
    console.log('2. 運行: npm run setup:cloudflare');
    console.log('3. 或者手動配置 DNS 記錄');
    
  } catch (error) {
    console.error('\n❌ 配置失敗:', error.message);
    process.exit(1);
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  quickSetup()
    .then(() => {
      console.log('\n✅ 腳本執行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 腳本執行失敗:', error);
      process.exit(1);
    });
}

module.exports = {
  quickSetup,
  getZoneId,
  testAPIConnection,
  checkDomainStatus
};
