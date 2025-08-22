const axios = require('axios');

// Cloudflare 配置
const cloudflareConfig = {
  apiToken: '2HWoQayJYac26tQQVlvWiNIDhxSibuwPUZoJ4ynM',
  zoneId: 'ceadb25b709450bbd450ad7cbd03bb68',
  domain: 'cardstrategyapp.com',
  apiUrl: 'https://api.cloudflare.com/client/v4',
};

// logger.info('🔍 Cloudflare 診斷工具');
// logger.info('='.repeat(50));
// logger.info(`🌐 域名: ${cloudflareConfig.domain}`);
// logger.info(`🔑 API Token: ${cloudflareConfig.apiToken.substring(0, 8)}...`);
// logger.info(`🏷️  Zone ID: ${cloudflareConfig.zoneId}`);
// logger.info('='.repeat(50));

// 測試基本 API 連接
async function testBasicConnection() {
  // logger.info('\n🔍 測試基本 API 連接...');

  try {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const response = await axios.get(`${cloudflareConfig.apiUrl}/user`, {
      headers: {
        Authorization: `Bearer ${cloudflareConfig.apiToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    if (response.data.success) {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
      const user = response.data.result;
      // logger.info(`✅ 基本 API 連接成功`);
      // logger.info(`👤 用戶: ${user.email}`);
      // logger.info(`🏢 組織: ${user.organizations?.[0]?.name || 'N/A'}`);
      return true;
    } else {
      // logger.info('❌ API 響應失敗:', response.data);
      return false;
    }
  } catch (error) {
    // logger.info('❌ 基本 API 連接失敗:', error.message);
    if (error.response) {
      // logger.info('狀態碼:', error.response.status);
      // logger.info('錯誤詳情:', error.response.data);
    }
    return false;
  }
}

// 測試 Zone 訪問權限
async function testZoneAccess() {
  // logger.info('\n🔍 測試 Zone 訪問權限...');

  try {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const response = await axios.get(
      `${cloudflareConfig.apiUrl}/zones/${cloudflareConfig.zoneId}`,
      {
        headers: {
          Authorization: `Bearer ${cloudflareConfig.apiToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    if (response.data.success) {
      const zone = response.data.result;
      // logger.info(`✅ Zone 訪問成功`);
      // logger.info(`📊 域名: ${zone.name}`);
      // logger.info(`📊 狀態: ${zone.status}`);
      // logger.info(`📊 計劃: ${zone.plan.name}`);
      // logger.info(`📊 Account ID: ${zone.account.id}`);
      return zone.account.id;
    } else {
      // logger.info('❌ Zone 訪問失敗:', response.data);
      return null;
    }
  } catch (error) {
    // logger.info('❌ Zone 訪問失敗:', error.message);
    if (error.response) {
      // logger.info('狀態碼:', error.response.status);
      // logger.info('錯誤詳情:', error.response.data);
    }
    return null;
  }
}

// 測試 DNS 記錄訪問
async function testDNSAccess() {
  // logger.info('\n🔍 測試 DNS 記錄訪問...');

  try {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const response = await axios.get(
      `${cloudflareConfig.apiUrl}/zones/${cloudflareConfig.zoneId}/dns_records`,
      {
        headers: {
          Authorization: `Bearer ${cloudflareConfig.apiToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    if (response.data.success) {
      // logger.info(`✅ DNS 記錄訪問成功`);
      // logger.info(`📊 現有記錄數量: ${response.data.result.length}`);

      if (response.data.result.length > 0) {
        // logger.info('📋 現有 DNS 記錄:');
        response.data.result.forEach((record, index) => {
          // logger.info(`  ${index + 1}. ${record.type} ${record.name} -> ${record.content}`);
        });
      }
      return true;
    } else {
      // logger.info('❌ DNS 記錄訪問失敗:', response.data);
      return false;
    }
  } catch (error) {
    // logger.info('❌ DNS 記錄訪問失敗:', error.message);
    if (error.response) {
      // logger.info('狀態碼:', error.response.status);
      // logger.info('錯誤詳情:', error.response.data);
    }
    return false;
  }
}

// 檢查 Token 權限
function checkTokenPermissions() {
  // logger.info('\n🔍 檢查 Token 權限...');
  // 基於錯誤信息推斷權限
  // logger.info('📋 建議的 Token 權限:');
  // logger.info('  - Zone:Zone:Read');
  // logger.info('  - Zone:DNS:Edit');
  // logger.info('  - Zone:Zone Settings:Edit');
  // logger.info('  - Zone:Page Rules:Edit');
  // logger.info('  - User:User:Read');
  // logger.info('\n📋 請在 Cloudflare 控制台中檢查:');
  // logger.info('  1. 訪問 https://dash.cloudflare.com/profile/api-tokens');
  // logger.info('  2. 找到 "CardStrategy_Cloudflare_API_token"');
  // logger.info('  3. 檢查權限設置');
  // logger.info('  4. 確保包含上述權限');
}

// 生成環境變數配置
function generateEnvConfig(accountId) {
  // logger.info('\n📝 生成環境變數配置...');

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

  // logger.info('✅ 環境變數配置已生成');
  // logger.info('\n📋 請將以下配置添加到您的環境變數中:');
  // logger.info('='.repeat(50));
  // logger.info(envConfig);
  // logger.info('='.repeat(50));

  return envConfig;
}

// 主診斷函數
async function runDiagnostic() {
  // logger.info('\n🚀 開始診斷...\n');

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

    // logger.info('\n🎉 診斷完成！所有測試通過。');
    // logger.info('\n📋 下一步操作:');
    // logger.info('1. 設置 DROPLET_IP 環境變數');
    // logger.info('2. 運行: npm run setup:cloudflare');
  } else {
    // 5. 檢查權限
    checkTokenPermissions();

    // logger.info('\n❌ 診斷完成！發現問題。');
    // logger.info('\n📋 需要解決的問題:');
    // logger.info('1. 檢查 API Token 權限');
    // logger.info('2. 確保 Token 包含必要的權限');
    // logger.info('3. 重新運行診斷');
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  runDiagnostic()
    .then(() => {
      // logger.info('\n✅ 診斷腳本執行完成');
      process.exit(0);
    })
    .catch((error) => {
      // logger.info('❌ 診斷腳本執行失敗:', error);
      process.exit(1);
    });
}

module.exports = {
  runDiagnostic,
  testBasicConnection,
  testZoneAccess,
  testDNSAccess,
};
