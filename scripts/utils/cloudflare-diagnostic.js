const axios = require('axios');

// Cloudflare Configure
const cloudflareConfig = {
  apiToken: '2HWoQayJYac26tQQVlvWiNIDhxSibuwPUZoJ4ynM',
  zoneId: 'ceadb25b709450bbd450ad7cbd03bb68',
  domain: 'cardstrategyapp.com',
  apiUrl: 'https://api.cloudflare.com/client/v4',
};

// logger.info('🔍 Cloudflare 診斷Tool');
// logger.info('='.repeat(50));
// logger.info(`🌐 Domain: ${cloudflareConfig.domain}`);
// logger.info(`🔑 API Token: ${cloudflareConfig.apiToken.substring(0, 8)}...`);
// logger.info(`🏷️  Zone ID: ${cloudflareConfig.zoneId}`);
// logger.info('='.repeat(50));

// Test基本 API Connect
async function testBasicConnection() {
  // logger.info('\n🔍 Test基本 API Connect...');

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
      // logger.info(`✅ 基本 API ConnectSuccess`);
      // logger.info(`👤 User: ${user.email}`);
      // logger.info(`🏢 組織: ${user.organizations?.[0]?.name || 'N/A'}`);
      return true;
    } else {
      // logger.info('❌ API ResponseFailed:', response.data);
      return false;
    }
  } catch (error) {
    // logger.info('❌ 基本 API ConnectFailed:', error.message);
    if (error.response) {
      // logger.info('Status碼:', error.response.status);
      // logger.info('Error詳情:', error.response.data);
    }
    return false;
  }
}

// Test Zone 訪問權限
async function testZoneAccess() {
  // logger.info('\n🔍 Test Zone 訪問權限...');

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
      // logger.info(`✅ Zone 訪問Success`);
      // logger.info(`📊 Domain: ${zone.name}`);
      // logger.info(`📊 Status: ${zone.status}`);
      // logger.info(`📊 計劃: ${zone.plan.name}`);
      // logger.info(`📊 Account ID: ${zone.account.id}`);
      return zone.account.id;
    } else {
      // logger.info('❌ Zone 訪問Failed:', response.data);
      return null;
    }
  } catch (error) {
    // logger.info('❌ Zone 訪問Failed:', error.message);
    if (error.response) {
      // logger.info('Status碼:', error.response.status);
      // logger.info('Error詳情:', error.response.data);
    }
    return null;
  }
}

// Test DNS Record訪問
async function testDNSAccess() {
  // logger.info('\n🔍 Test DNS Record訪問...');

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
      // logger.info(`✅ DNS Record訪問Success`);
      // logger.info(`📊 現有Record數量: ${response.data.result.length}`);

      if (response.data.result.length > 0) {
        // logger.info('📋 現有 DNS Record:');
        response.data.result.forEach((record, index) => {
          // logger.info(`  ${index + 1}. ${record.type} ${record.name} -> ${record.content}`);
        });
      }
      return true;
    } else {
      // logger.info('❌ DNS Record訪問Failed:', response.data);
      return false;
    }
  } catch (error) {
    // logger.info('❌ DNS Record訪問Failed:', error.message);
    if (error.response) {
      // logger.info('Status碼:', error.response.status);
      // logger.info('Error詳情:', error.response.data);
    }
    return false;
  }
}

// Check Token 權限
function checkTokenPermissions() {
  // logger.info('\n🔍 Check Token 權限...');
  // 基於ErrorInformation推斷權限
  // logger.info('📋 建議的 Token 權限:');
  // logger.info('  - Zone:Zone:Read');
  // logger.info('  - Zone:DNS:Edit');
  // logger.info('  - Zone:Zone Settings:Edit');
  // logger.info('  - Zone:Page Rules:Edit');
  // logger.info('  - User:User:Read');
  // logger.info('\n📋 請在 Cloudflare Control台中Check:');
  // logger.info('  1. 訪問 https://dash.cloudflare.com/profile/api-tokens');
  // logger.info('  2. 找到 "CardStrategy_Cloudflare_API_token"');
  // logger.info('  3. Check權限Settings');
  // logger.info('  4. 確保Package含上述權限');
}

// 生成環境變數Configure
function generateEnvConfig(accountId) {
  // logger.info('\n📝 生成環境變數Configure...');

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

  // logger.info('✅ 環境變數Configure已生成');
  // logger.info('\n📋 請將以下ConfigureAdd到您的環境變數中:');
  // logger.info('='.repeat(50));
  // logger.info(envConfig);
  // logger.info('='.repeat(50));

  return envConfig;
}

// 主診斷Function
async function runDiagnostic() {
  // logger.info('\n🚀 Begin診斷...\n');

  let accountId = null;

  // 1. Test基本Connect
  const basicConnection = await testBasicConnection();

  if (basicConnection) {
    // 2. Test Zone 訪問
    accountId = await testZoneAccess();

    // 3. Test DNS 訪問
    await testDNSAccess();

    // 4. 生成Configure
    generateEnvConfig(accountId);

    // logger.info('\n🎉 診斷Complete！所有Test通過。');
    // logger.info('\n📋 下一步Operation:');
    // logger.info('1. Settings DROPLET_IP 環境變數');
    // logger.info('2. 運Row: npm run setup:cloudflare');
  } else {
    // 5. Check權限
    checkTokenPermissions();

    // logger.info('\n❌ 診斷Complete！發現問題。');
    // logger.info('\n📋 需要Resolve的問題:');
    // logger.info('1. Check API Token 權限');
    // logger.info('2. 確保 Token Package含必要的權限');
    // logger.info('3. Re運Row診斷');
  }
}

// 如果直接運Row此腳本
if (require.main === module) {
  runDiagnostic()
    .then(() => {
      // logger.info('\n✅ 診斷腳本執RowComplete');
      process.exit(0);
    })
    .catch((error) => {
      // logger.info('❌ 診斷腳本執RowFailed:', error);
      process.exit(1);
    });
}

module.exports = {
  runDiagnostic,
  testBasicConnection,
  testZoneAccess,
  testDNSAccess,
};
