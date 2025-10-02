const axios = require('axios');

// Cloudflare Configure (使用已Record的 Token 和 Zone ID)
const cloudflareConfig = {
  apiToken: '2HWoQayJYac26tQQVlvWiNIDhxSibuwPUZoJ4ynM',
  zoneId: 'ceadb25b709450bbd450ad7cbd03bb68',
  domain: 'cardstrategyapp.com',
  apiUrl: 'https://api.cloudflare.com/client/v4',
};

// logger.info('🚀 Cloudflare 快速ConfigureTool');
// logger.info('='.repeat(50));
// logger.info(`🌐 Domain: ${cloudflareConfig.domain}`);
// logger.info(`🔑 API Token: ${cloudflareConfig.apiToken.substring(0, 8)}...`);
// logger.info('='.repeat(50));

// Get Zone ID
async function getZoneId() {
  // logger.info('\n🔍 正在Get Zone ID...');

  try {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const response = await axios.get(
      `${cloudflareConfig.apiUrl}/zones?name=${cloudflareConfig.domain}`,
      {
        headers: {
          Authorization: `Bearer ${cloudflareConfig.apiToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.success && response.data.result.length > 0) {
      const zoneId = response.data.result[0].id;
      const accountId = response.data.result[0].account.id;

      // logger.info(`✅ 找到 Zone ID: ${zoneId}`);
      // logger.info(`✅ 找到 Account ID: ${accountId}`);

      return { zoneId, accountId };
    } else {
      throw new Error('找不到域名對應的 Zone ID');
    }
  } catch (error) {
    // logger.info('❌ Get Zone ID Failed:', error.message);
    if (error.response?.data?.errors) {
      // logger.info('詳細Error:', error.response.data.errors);
    }
    throw error;
  }
}

// Test API Connect
async function testAPIConnection() {
  // logger.info('\n🔍 Test API Connect...');

  const response = await axios.get(`${cloudflareConfig.apiUrl}/user`, {
    headers: {
      Authorization: `Bearer ${cloudflareConfig.apiToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.data.success) {
    const user = response.data.result;
    // logger.info(`✅ API ConnectSuccess`);
    // logger.info(`👤 User: ${user.email}`);
    // logger.info(`🏢 組織: ${user.organizations?.[0]?.name || 'N/A'}`);
    return true;
  } else {
    throw new Error('API 響應Failed');
  }
}

// CheckDomainStatus
async function checkDomainStatus(zoneId) {
  // logger.info('\n🔍 CheckDomainStatus...');

  const response = await axios.get(
    `${cloudflareConfig.apiUrl}/zones/${zoneId}`,
    {
      headers: {
        Authorization: `Bearer ${cloudflareConfig.apiToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (response.data.success) {
    const zone = response.data.result;
    // logger.info(`✅ DomainStatus: ${zone.status}`);
    // logger.info(`📊 計劃: ${zone.plan.name}`);
    // logger.info(`🌍 名稱Server: ${zone.name_servers.join(', ')}`);
    return zone;
  } else {
    throw new Error('Get域名信息Failed');
  }
}

// 生成環境變數Configure
function generateEnvConfig(zoneId, accountId) {
  // logger.info('\n📝 生成環境變數Configure...');

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

  // logger.info('✅ 環境變數Configure已生成');
  // logger.info('\n📋 請將以下ConfigureAdd到您的環境變數中:');
  // logger.info('='.repeat(50));
  // logger.info(envConfig);
  // logger.info('='.repeat(50));

  return envConfig;
}

// 主Function
async function quickSetup() {
  try {
    // 1. Test API Connect
    await testAPIConnection();

    // 2. Get Zone ID 和 Account ID
    const { zoneId, accountId } = await getZoneId();

    // 3. CheckDomainStatus
    await checkDomainStatus(zoneId);

    // 4. 生成環境變數Configure
    generateEnvConfig(zoneId, accountId);

    // logger.info('\n🎉 快速ConfigureComplete！');
    // logger.info('\n📋 下一步Operation:');
    // logger.info('1. Settings DROPLET_IP 環境變數');
    // logger.info('2. 運Row: npm run setup:cloudflare');
    // logger.info('3. 或者ManualConfigure DNS Record');
  } catch (error) {
    // logger.info('\n❌ ConfigureFailed:', error.message);
    process.exit(1);
  }
}

// 如果直接運Row此腳本
if (require.main === module) {
  quickSetup()
    .then(() => {
      // logger.info('\n✅ 腳本執RowComplete');
      process.exit(0);
    })
    .catch((error) => {
      // logger.info('❌ 腳本執RowFailed:', error);
      process.exit(1);
    });
}

module.exports = {
  quickSetup,
  getZoneId,
  testAPIConnection,
  checkDomainStatus,
};
