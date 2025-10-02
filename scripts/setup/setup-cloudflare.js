const axios = require('axios');

// Cloudflare Configure (使用已Record的Configure)
const cloudflareConfig = {
  zoneId: 'ceadb25b709450bbd450ad7cbd03bb68',
  apiToken: '2HWoQayJYac26tQQVlvWiNIDhxSibuwPUZoJ4ynM',
  accountId: '20ec399929456bafdd9dfe4035ab0c33',
  domain: 'cardstrategyapp.com',
  dropletIp: '159.223.84.189',
  apiUrl: 'https://api.cloudflare.com/client/v4',
};

// CheckConfigure
function checkConfiguration() {
  // logger.info('🔍 Check Cloudflare Configure...');

  if (!cloudflareConfig.apiToken) {
    throw new Error('❌ 未設置 API Token');
  }

  if (!cloudflareConfig.zoneId) {
    throw new Error('❌ 未設置 Zone ID');
  }

  if (!cloudflareConfig.dropletIp) {
    throw new Error('❌ 未設置 Droplet IP');
  }

  // logger.info('✅ ConfigureCheck通過');
  // logger.info(`🌐 Domain: ${cloudflareConfig.domain}`);
  // logger.info(`🏷️  Zone ID: ${cloudflareConfig.zoneId}`);
  // logger.info(`🔑 API Token: ${cloudflareConfig.apiToken.substring(0, 8)}...`);
  // logger.info(`🌍 Droplet IP: ${cloudflareConfig.dropletIp}`);
}

// Get Zone ID (如果沒有Settings)
async function getZoneId() {
  // logger.info('🔍 GetDomain Zone ID...');

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
    // logger.info(`✅ 找到 Zone ID: ${zoneId}`);
    return zoneId;
  } else {
    throw new Error('找不到域名對應的 Zone ID');
  }
}

// Configure DNS Record
async function setupDNSRecords() {
  // logger.info('🔧 Configure DNS Record...');

  const dnsRecords = [
    {
      type: 'A',
      name: '@',
      content: cloudflareConfig.dropletIp,
      proxied: true,
    },
    {
      type: 'A',
      name: 'www',
      content: cloudflareConfig.dropletIp,
      proxied: true,
    },
    {
      type: 'A',
      name: 'api',
      content: cloudflareConfig.dropletIp,
      proxied: true,
    },
    {
      type: 'A',
      name: 'cdn',
      content: cloudflareConfig.dropletIp,
      proxied: true,
    },
  ];

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  for (const record of dnsRecords) {
    try {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
      const response = await axios.post(
        `${cloudflareConfig.apiUrl}/zones/${cloudflareConfig.zoneId}/dns_records`,
        record,
        {
          headers: {
            Authorization: `Bearer ${cloudflareConfig.apiToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        // logger.info(`✅ SuccessCreate DNS Record: ${record.name}.${cloudflareConfig.domain}`);
      } else {
        // logger.info(`⚠️  DNS Record可能已存在: ${record.name}.${cloudflareConfig.domain}`);
      }
    } catch (error) {
      if (error.response?.data?.errors?.[0]?.code === 81057) {
        // logger.info(`ℹ️  DNS Record已存在: ${record.name}.${cloudflareConfig.domain}`);
      } else {
        // logger.info(`❌ Create DNS RecordFailed: ${record.name}.${cloudflareConfig.domain}`, error.message);
      }
    }
  }
}

// Configure SSL/TLS Settings
async function setupSSL() {
  // logger.info('🔒 Configure SSL/TLS Settings...');

  try {
    // SettingsEncrypt模式為 Full (strict)
    const sslResponse = await axios.patch(
      `${cloudflareConfig.apiUrl}/zones/${cloudflareConfig.zoneId}/settings/ssl`,
      {
        value: 'full_strict',
      },
      {
        headers: {
          Authorization: `Bearer ${cloudflareConfig.apiToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (sslResponse.data.success) {
      // logger.info('✅ SSL Encrypt模式Settings為 Full (strict)');
    }

    // Enable Always Use HTTPS
    const httpsResponse = await axios.patch(
      `${cloudflareConfig.apiUrl}/zones/${cloudflareConfig.zoneId}/settings/always_use_https`,
      {
        value: 'on',
      },
      {
        headers: {
          Authorization: `Bearer ${cloudflareConfig.apiToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (httpsResponse.data.success) {
      // logger.info('✅ Enable Always Use HTTPS');
    }

    // Settings最低 TLS Version
    const tlsResponse = await axios.patch(
      `${cloudflareConfig.apiUrl}/zones/${cloudflareConfig.zoneId}/settings/min_tls_version`,
      {
        value: '1.2',
      },
      {
        headers: {
          Authorization: `Bearer ${cloudflareConfig.apiToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (tlsResponse.data.success) {
      // logger.info('✅ Settings最低 TLS Version為 1.2');
    }
  } catch (error) {
    // logger.info('❌ SSL/TLS ConfigureFailed:', error.message);
  }
}

// Configure頁面規則
async function setupPageRules() {
  // logger.info('📋 Configure頁面規則...');

  const pageRules = [
    {
      // API 端點 - 不Cache
      targets: [
        {
          target: 'url',
          constraint: {
            operator: 'matches',
            value: `api.${cloudflareConfig.domain}/*`,
          },
        },
      ],
      actions: [
        {
          id: 'cache_level',
          value: 'bypass',
        },
        {
          id: 'ssl',
          value: 'full',
        },
        {
          id: 'security_level',
          value: 'medium',
        },
      ],
      priority: 1,
      status: 'active',
    },
    {
      // StaticResource - Cache
      targets: [
        {
          target: 'url',
          constraint: {
            operator: 'matches',
            value: `${cloudflareConfig.domain}/*`,
          },
        },
      ],
      actions: [
        {
          id: 'cache_level',
          value: 'standard',
        },
        {
          id: 'edge_cache_ttl',
          value: 14400, // 4 hours
        },
        {
          id: 'browser_cache_ttl',
          value: 3600, // 1 hour
        },
      ],
      priority: 2,
      status: 'active',
    },
  ];

  for (const rule of pageRules) {
    try {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
      const response = await axios.post(
        `${cloudflareConfig.apiUrl}/zones/${cloudflareConfig.zoneId}/pagerules`,
        rule,
        {
          headers: {
            Authorization: `Bearer ${cloudflareConfig.apiToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        // logger.info(`✅ SuccessCreate頁面規則: ${rule.targets[0].constraint.value}`);
      }
    } catch (error) {
      // logger.info(`❌ Create頁面規則Failed: ${rule.targets[0].constraint.value}`, error.message);
    }
  }
}

// Configure安全Settings
async function setupSecurity() {
  // logger.info('🛡️ Configure安全Settings...');

  try {
    // Settings安全級別
    const securityResponse = await axios.patch(
      `${cloudflareConfig.apiUrl}/zones/${cloudflareConfig.zoneId}/settings/security_level`,
      {
        value: 'medium',
      },
      {
        headers: {
          Authorization: `Bearer ${cloudflareConfig.apiToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (securityResponse.data.success) {
      // logger.info('✅ Settings安全級別為 Medium');
    }

    // Enable HSTS
    const hstsResponse = await axios.patch(
      `${cloudflareConfig.apiUrl}/zones/${cloudflareConfig.zoneId}/settings/security_header`,
      {
        value: {
          strict_transport_security: {
            enabled: true,
            max_age: 31536000,
            include_subdomains: true,
            preload: true,
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${cloudflareConfig.apiToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (hstsResponse.data.success) {
      // logger.info('✅ Enable HSTS');
    }
  } catch (error) {
    // logger.info('❌ 安全SettingsConfigureFailed:', error.message);
  }
}

// Configure性能優化
async function setupPerformance() {
  // logger.info('⚡ Configure性能優化...');

  const performanceSettings = [
    { setting: 'minify', value: { css: 'on', html: 'on', js: 'on' } },
    { setting: 'brotli', value: 'on' },
    { setting: 'early_hints', value: 'on' },
    { setting: 'http2', value: 'on' },
    { setting: 'http3', value: 'on' },
    { setting: 'rocket_loader', value: 'on' },
    { setting: 'polish', value: 'lossy' },
    { setting: 'webp', value: 'on' },
  ];

  for (const { setting, value } of performanceSettings) {
    try {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
      const response = await axios.patch(
        `${cloudflareConfig.apiUrl}/zones/${cloudflareConfig.zoneId}/settings/${setting}`,
        {
          value: value,
        },
        {
          headers: {
            Authorization: `Bearer ${cloudflareConfig.apiToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        // logger.info(`✅ Enable ${setting} 優化`);
      }
    } catch (error) {
      // logger.info(`⚠️  ${setting} Settings可能已存在或不需要Configure`);
    }
  }
}

// 主ConfigureFunction
async function setupCloudflare() {
  // logger.info('🚀 BeginConfigure Cloudflare...\n');

  try {
    // CheckConfigure
    checkConfiguration();

    // Configure各項Settings
    await setupDNSRecords();
    await setupSSL();
    await setupPageRules();
    await setupSecurity();
    await setupPerformance();

    // logger.info('\n🎉 Cloudflare ConfigureComplete！');
    // logger.info('\n📋 Configure摘要:');
    // logger.info('='.repeat(50));
    // logger.info(`🌐 Domain: ${cloudflareConfig.domain}`);
    // logger.info(`🔒 SSL: Full (strict) + Always HTTPS`);
    // logger.info(`🛡️ 安全: Medium 級別 + HSTS`);
    // logger.info(`⚡ 性能: 所有優化已Enable`);
    // logger.info(`📋 頁面規則: API 不Cache，StaticResourceCache`);
    // logger.info('='.repeat(50));

    // logger.info('\n🔗 您的Domain現在可以通過以下Address訪問:');
    // logger.info(`   🌐 主網站: https://${cloudflareConfig.domain}`);
    // logger.info(`   🔧 API: https://api.${cloudflareConfig.domain}`);
    // logger.info(`   📦 CDN: https://cdn.${cloudflareConfig.domain}`);
  } catch (error) {
    // logger.info('❌ Cloudflare ConfigureFailed:', error.message);
    process.exit(1);
  }
}

// 如果直接運Row此腳本
if (require.main === module) {
  setupCloudflare()
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
  setupCloudflare,
  setupDNSRecords,
  setupSSL,
  setupPageRules,
  setupSecurity,
  setupPerformance,
};
