const axios = require('axios');

// Cloudflare 配置 (使用已記錄的配置)
const cloudflareConfig = {
  zoneId: 'ceadb25b709450bbd450ad7cbd03bb68',
  apiToken: '2HWoQayJYac26tQQVlvWiNIDhxSibuwPUZoJ4ynM',
  accountId: '20ec399929456bafdd9dfe4035ab0c33',
  domain: 'cardstrategyapp.com',
  dropletIp: '159.223.84.189',
  apiUrl: 'https://api.cloudflare.com/client/v4'
};

// 檢查配置
function checkConfiguration() {
  // logger.info('🔍 檢查 Cloudflare 配置...');
  
  if (!cloudflareConfig.apiToken) {
    throw new Error('❌ 未設置 API Token');
  }
  
  if (!cloudflareConfig.zoneId) {
    throw new Error('❌ 未設置 Zone ID');
  }
  
  if (!cloudflareConfig.dropletIp) {
    throw new Error('❌ 未設置 Droplet IP');
  }
  
  // logger.info('✅ 配置檢查通過');
  // logger.info(`🌐 域名: ${cloudflareConfig.domain}`);
  // logger.info(`🏷️  Zone ID: ${cloudflareConfig.zoneId}`);
  // logger.info(`🔑 API Token: ${cloudflareConfig.apiToken.substring(0, 8)}...`);
  // logger.info(`🌍 Droplet IP: ${cloudflareConfig.dropletIp}`);
}

// 獲取 Zone ID (如果沒有設置)
async function getZoneId() {
  // logger.info('🔍 獲取域名 Zone ID...');
  
  try {
    const response = await axios.get(`${cloudflareConfig.apiUrl}/zones?name=${cloudflareConfig.domain}`, {
      headers: {
        'Authorization': `Bearer ${cloudflareConfig.apiToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.success && response.data.result.length > 0) {
      const zoneId = response.data.result[0].id;
      // logger.info(`✅ 找到 Zone ID: ${zoneId}`);
      return zoneId;
    } else {
      throw new Error('找不到域名對應的 Zone ID');
    }
  } catch (error) {
    // logger.info('❌ 獲取 Zone ID 失敗:', error.message);
    throw error;
  }
}

// 配置 DNS 記錄
async function setupDNSRecords() {
  // logger.info('🔧 配置 DNS 記錄...');
  
  const dnsRecords = [
    {
      type: 'A',
      name: '@',
      content: cloudflareConfig.dropletIp,
      proxied: true
    },
    {
      type: 'A',
      name: 'www',
      content: cloudflareConfig.dropletIp,
      proxied: true
    },
    {
      type: 'A',
      name: 'api',
      content: cloudflareConfig.dropletIp,
      proxied: true
    },
    {
      type: 'A',
      name: 'cdn',
      content: cloudflareConfig.dropletIp,
      proxied: true
    }
  ];
  
  for (const record of dnsRecords) {
    try {
      const response = await axios.post(`${cloudflareConfig.apiUrl}/zones/${cloudflareConfig.zoneId}/dns_records`, record, {
        headers: {
          'Authorization': `Bearer ${cloudflareConfig.apiToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        // logger.info(`✅ 成功創建 DNS 記錄: ${record.name}.${cloudflareConfig.domain}`);
      } else {
        // logger.info(`⚠️  DNS 記錄可能已存在: ${record.name}.${cloudflareConfig.domain}`);
      }
    } catch (error) {
      if (error.response?.data?.errors?.[0]?.code === 81057) {
        // logger.info(`ℹ️  DNS 記錄已存在: ${record.name}.${cloudflareConfig.domain}`);
      } else {
        // logger.info(`❌ 創建 DNS 記錄失敗: ${record.name}.${cloudflareConfig.domain}`, error.message);
      }
    }
  }
}

// 配置 SSL/TLS 設置
async function setupSSL() {
  // logger.info('🔒 配置 SSL/TLS 設置...');
  
  try {
    // 設置加密模式為 Full (strict)
    const sslResponse = await axios.patch(`${cloudflareConfig.apiUrl}/zones/${cloudflareConfig.zoneId}/settings/ssl`, {
      value: 'full_strict'
    }, {
      headers: {
        'Authorization': `Bearer ${cloudflareConfig.apiToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (sslResponse.data.success) {
      // logger.info('✅ SSL 加密模式設置為 Full (strict)');
    }
    
    // 啟用 Always Use HTTPS
    const httpsResponse = await axios.patch(`${cloudflareConfig.apiUrl}/zones/${cloudflareConfig.zoneId}/settings/always_use_https`, {
      value: 'on'
    }, {
      headers: {
        'Authorization': `Bearer ${cloudflareConfig.apiToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (httpsResponse.data.success) {
      // logger.info('✅ 啟用 Always Use HTTPS');
    }
    
    // 設置最低 TLS 版本
    const tlsResponse = await axios.patch(`${cloudflareConfig.apiUrl}/zones/${cloudflareConfig.zoneId}/settings/min_tls_version`, {
      value: '1.2'
    }, {
      headers: {
        'Authorization': `Bearer ${cloudflareConfig.apiToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (tlsResponse.data.success) {
      // logger.info('✅ 設置最低 TLS 版本為 1.2');
    }
    
  } catch (error) {
    // logger.info('❌ SSL/TLS 配置失敗:', error.message);
  }
}

// 配置頁面規則
async function setupPageRules() {
  // logger.info('📋 配置頁面規則...');
  
  const pageRules = [
    {
      // API 端點 - 不緩存
      targets: [
        {
          target: 'url',
          constraint: {
            operator: 'matches',
            value: `api.${cloudflareConfig.domain}/*`
          }
        }
      ],
      actions: [
        {
          id: 'cache_level',
          value: 'bypass'
        },
        {
          id: 'ssl',
          value: 'full'
        },
        {
          id: 'security_level',
          value: 'medium'
        }
      ],
      priority: 1,
      status: 'active'
    },
    {
      // 靜態資源 - 緩存
      targets: [
        {
          target: 'url',
          constraint: {
            operator: 'matches',
            value: `${cloudflareConfig.domain}/*`
          }
        }
      ],
      actions: [
        {
          id: 'cache_level',
          value: 'standard'
        },
        {
          id: 'edge_cache_ttl',
          value: 14400 // 4 hours
        },
        {
          id: 'browser_cache_ttl',
          value: 3600 // 1 hour
        }
      ],
      priority: 2,
      status: 'active'
    }
  ];
  
  for (const rule of pageRules) {
    try {
      const response = await axios.post(`${cloudflareConfig.apiUrl}/zones/${cloudflareConfig.zoneId}/pagerules`, rule, {
        headers: {
          'Authorization': `Bearer ${cloudflareConfig.apiToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        // logger.info(`✅ 成功創建頁面規則: ${rule.targets[0].constraint.value}`);
      }
    } catch (error) {
      // logger.info(`❌ 創建頁面規則失敗: ${rule.targets[0].constraint.value}`, error.message);
    }
  }
}

// 配置安全設置
async function setupSecurity() {
  // logger.info('🛡️ 配置安全設置...');
  
  try {
    // 設置安全級別
    const securityResponse = await axios.patch(`${cloudflareConfig.apiUrl}/zones/${cloudflareConfig.zoneId}/settings/security_level`, {
      value: 'medium'
    }, {
      headers: {
        'Authorization': `Bearer ${cloudflareConfig.apiToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (securityResponse.data.success) {
      // logger.info('✅ 設置安全級別為 Medium');
    }
    
    // 啟用 HSTS
    const hstsResponse = await axios.patch(`${cloudflareConfig.apiUrl}/zones/${cloudflareConfig.zoneId}/settings/security_header`, {
      value: {
        strict_transport_security: {
          enabled: true,
          max_age: 31536000,
          include_subdomains: true,
          preload: true
        }
      }
    }, {
      headers: {
        'Authorization': `Bearer ${cloudflareConfig.apiToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (hstsResponse.data.success) {
      // logger.info('✅ 啟用 HSTS');
    }
    
  } catch (error) {
    // logger.info('❌ 安全設置配置失敗:', error.message);
  }
}

// 配置性能優化
async function setupPerformance() {
  // logger.info('⚡ 配置性能優化...');
  
  const performanceSettings = [
    { setting: 'minify', value: { css: 'on', html: 'on', js: 'on' } },
    { setting: 'brotli', value: 'on' },
    { setting: 'early_hints', value: 'on' },
    { setting: 'http2', value: 'on' },
    { setting: 'http3', value: 'on' },
    { setting: 'rocket_loader', value: 'on' },
    { setting: 'polish', value: 'lossy' },
    { setting: 'webp', value: 'on' }
  ];
  
  for (const { setting, value } of performanceSettings) {
    try {
      const response = await axios.patch(`${cloudflareConfig.apiUrl}/zones/${cloudflareConfig.zoneId}/settings/${setting}`, {
        value: value
      }, {
        headers: {
          'Authorization': `Bearer ${cloudflareConfig.apiToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        // logger.info(`✅ 啟用 ${setting} 優化`);
      }
    } catch (error) {
      // logger.info(`⚠️  ${setting} 設置可能已存在或不需要配置`);
    }
  }
}

// 主配置函數
async function setupCloudflare() {
  // logger.info('🚀 開始配置 Cloudflare...\n');
  
  try {
    // 檢查配置
    checkConfiguration();
    
    // 配置各項設置
    await setupDNSRecords();
    await setupSSL();
    await setupPageRules();
    await setupSecurity();
    await setupPerformance();
    
    // logger.info('\n🎉 Cloudflare 配置完成！');
    // logger.info('\n📋 配置摘要:');
    // logger.info('='.repeat(50));
    // logger.info(`🌐 域名: ${cloudflareConfig.domain}`);
    // logger.info(`🔒 SSL: Full (strict) + Always HTTPS`);
    // logger.info(`🛡️ 安全: Medium 級別 + HSTS`);
    // logger.info(`⚡ 性能: 所有優化已啟用`);
    // logger.info(`📋 頁面規則: API 不緩存，靜態資源緩存`);
    // logger.info('='.repeat(50));
    
    // logger.info('\n🔗 您的域名現在可以通過以下地址訪問:');
    // logger.info(`   🌐 主網站: https://${cloudflareConfig.domain}`);
    // logger.info(`   🔧 API: https://api.${cloudflareConfig.domain}`);
    // logger.info(`   📦 CDN: https://cdn.${cloudflareConfig.domain}`);
    
  } catch (error) {
    // logger.info('❌ Cloudflare 配置失敗:', error.message);
    process.exit(1);
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  setupCloudflare()
    .then(() => {
      // logger.info('\n✅ 腳本執行完成');
      process.exit(0);
    })
    .catch((error) => {
      // logger.info('❌ 腳本執行失敗:', error);
      process.exit(1);
    });
}

module.exports = {
  setupCloudflare,
  setupDNSRecords,
  setupSSL,
  setupPageRules,
  setupSecurity,
  setupPerformance
};
