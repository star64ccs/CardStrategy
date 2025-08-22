const fs = require('fs');
const path = require('path');

console.log('🔍 檢查專案配置狀態...\n');

// 檢查配置狀態
const configStatus = {
  apiKeys: {
    status: 'unknown',
    details: []
  },
  database: {
    status: 'unknown',
    details: []
  },
  redis: {
    status: 'unknown',
    details: []
  },
  environment: {
    status: 'unknown',
    details: []
  },
  services: {
    status: 'unknown',
    details: []
  },
  coreIntegrations: {
    status: 'unknown',
    details: []
  },
  futureExpansions: {
    status: 'planned',
    details: []
  }
};

// 1. 檢查 API Keys 配置
console.log('📋 檢查 API Keys 配置...');
const apiKeysDir = path.join(__dirname, '../src/config/ai-keys');
if (fs.existsSync(apiKeysDir)) {
  const apiFiles = fs.readdirSync(apiKeysDir);
  console.log(`  ✅ API Keys 目錄存在: ${apiFiles.length} 個配置文件`);
  
  apiFiles.forEach(file => {
    if (file.endsWith('.json')) {
      const filePath = path.join(apiKeysDir, file);
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // 檢查是否有真實的 API Key 或其他必要配置
      if (content.apiKey && !content.apiKey.includes('your-') && !content.apiKey.includes('placeholder')) {
        configStatus.apiKeys.details.push(`${file}: ✅ 真實 API Key`);
      } else if (content.zoneId && content.accountId && !content.zoneId.includes('your-')) {
        // Cloudflare 使用 zoneId 和 accountId 而不是 apiKey
        configStatus.apiKeys.details.push(`${file}: ✅ 真實配置 (Cloudflare)`);
      } else {
        configStatus.apiKeys.details.push(`${file}: ❌ 佔位符或缺失`);
      }
    }
  });
  
  configStatus.apiKeys.status = configStatus.apiKeys.details.every(d => d.includes('✅')) ? 'configured' : 'partial';
} else {
  console.log('  ❌ API Keys 目錄不存在');
  configStatus.apiKeys.status = 'missing';
}

// 2. 檢查環境變量文件
console.log('\n🔧 檢查環境變量配置...');
const envFiles = [
  'api-keys.env',
  'local-config.env',
  'env.example'
];

envFiles.forEach(envFile => {
  const envPath = path.join(__dirname, '..', envFile);
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const hasRealValues = !content.includes('your-') && !content.includes('placeholder');
    console.log(`  ${hasRealValues ? '✅' : '⚠️'} ${envFile}: ${hasRealValues ? '真實值' : '佔位符'}`);
    configStatus.environment.details.push(`${envFile}: ${hasRealValues ? '真實值' : '佔位符'}`);
  } else {
    console.log(`  ❌ ${envFile}: 文件不存在`);
    configStatus.environment.details.push(`${envFile}: 缺失`);
  }
});

// 3. 檢查數據庫配置
console.log('\n🗄️ 檢查數據庫配置...');
const dbConfigPath = path.join(__dirname, '../backend/src/config/database.js');
if (fs.existsSync(dbConfigPath)) {
  const content = fs.readFileSync(dbConfigPath, 'utf8');
  
  // 檢查是否有環境變量配置
  const hasEnvVars = content.includes('process.env.DB_');
  const hasDefaultValues = content.includes('localhost') || content.includes('postgres');
  
  if (hasEnvVars) {
    console.log('  ✅ 數據庫配置使用環境變量');
    configStatus.database.details.push('使用環境變量配置');
  } else {
    console.log('  ⚠️ 數據庫配置使用硬編碼值');
    configStatus.database.details.push('使用硬編碼值');
  }
  
  if (hasDefaultValues) {
    console.log('  ⚠️ 包含默認開發值');
    configStatus.database.details.push('包含默認開發值');
  }
  
  configStatus.database.status = hasEnvVars ? 'configured' : 'default';
} else {
  console.log('  ❌ 數據庫配置文件不存在');
  configStatus.database.status = 'missing';
}

// 4. 檢查 Redis 配置
console.log('\n🔴 檢查 Redis 配置...');
const redisConfigPath = path.join(__dirname, '../backend/src/config/redis.js');
if (fs.existsSync(redisConfigPath)) {
  const content = fs.readFileSync(redisConfigPath, 'utf8');
  
  const hasEnvVars = content.includes('process.env.REDIS_');
  const hasDefaultValues = content.includes('localhost:6379');
  
  if (hasEnvVars) {
    console.log('  ✅ Redis 配置使用環境變量');
    configStatus.redis.details.push('使用環境變量配置');
  } else {
    console.log('  ⚠️ Redis 配置使用硬編碼值');
    configStatus.redis.details.push('使用硬編碼值');
  }
  
  if (hasDefaultValues) {
    console.log('  ⚠️ 包含默認開發值');
    configStatus.redis.details.push('包含默認開發值');
  }
  
  configStatus.redis.status = hasEnvVars ? 'configured' : 'default';
} else {
  console.log('  ❌ Redis 配置文件不存在');
  configStatus.redis.status = 'missing';
}

// 5. 檢查核心集成服務配置
console.log('\n🔗 檢查核心集成服務配置...');
const coreIntegrations = [
  { name: 'Mixpanel', env: 'MIXPANEL_API_KEY', desc: '用戶行為分析' },
  { name: 'AWS S3', env: 'S3_BUCKET', desc: '文件存儲' },
  { name: 'Firebase', env: 'FIREBASE_API_KEY', desc: '推送通知' },
  { name: 'SendGrid', env: 'SENDGRID_API_KEY', desc: '郵件發送' },
  { name: 'Sentry', env: 'SENTRY_DSN', desc: '錯誤追蹤' },
  { name: 'LogRocket', env: 'LOGROCKET_APP_ID', desc: '會話重現' },
  { name: 'Slack', env: 'SLACK_WEBHOOK_URL', desc: '警報通知' },
  { name: 'SMTP', env: 'SMTP_HOST', desc: '郵件服務器' }
];

coreIntegrations.forEach(integration => {
  const envValue = process.env[integration.env];
  if (envValue && !envValue.includes('your-') && !envValue.includes('placeholder')) {
    console.log(`  ✅ ${integration.name}: 已配置 (${integration.desc})`);
    configStatus.coreIntegrations.details.push(`${integration.name}: ✅ 已配置`);
  } else {
    console.log(`  ⚠️ ${integration.name}: 未配置 (${integration.desc})`);
    configStatus.coreIntegrations.details.push(`${integration.name}: ⚠️ 未配置`);
  }
});

configStatus.coreIntegrations.status = configStatus.coreIntegrations.details.every(d => d.includes('✅')) ? 'configured' : 'partial';

// 6. 檢查服務配置
console.log('\n🌐 檢查服務配置...');
const serviceConfigs = [
  { name: 'Cloudflare', file: 'cloudflare-config.env' },
  { name: 'Docker', file: 'docker-compose.yml' },
  { name: 'Render', file: 'render.yaml' }
];

serviceConfigs.forEach(service => {
  const servicePath = path.join(__dirname, '..', service.file);
  if (fs.existsSync(servicePath)) {
    const content = fs.readFileSync(servicePath, 'utf8');
    const hasRealValues = !content.includes('your-') && !content.includes('placeholder');
    console.log(`  ${hasRealValues ? '✅' : '⚠️'} ${service.name}: ${hasRealValues ? '真實值' : '佔位符'}`);
    configStatus.services.details.push(`${service.name}: ${hasRealValues ? '真實值' : '佔位符'}`);
  } else {
    console.log(`  ❌ ${service.name}: 配置文件不存在`);
    configStatus.services.details.push(`${service.name}: 缺失`);
  }
});

// 7. 檢查 .gitignore 保護
console.log('\n🛡️ 檢查安全保護...');
const gitignorePath = path.join(__dirname, '../.gitignore');
if (fs.existsSync(gitignorePath)) {
  const content = fs.readFileSync(gitignorePath, 'utf8');
  const hasApiKeyProtection = content.includes('api-keys') || content.includes('src/config/ai-keys');
  const hasEnvProtection = content.includes('.env');
  
  if (hasApiKeyProtection) {
    console.log('  ✅ API Keys 受到 .gitignore 保護');
  } else {
    console.log('  ❌ API Keys 未受到 .gitignore 保護');
  }
  
  if (hasEnvProtection) {
    console.log('  ✅ 環境變量文件受到 .gitignore 保護');
  } else {
    console.log('  ❌ 環境變量文件未受到 .gitignore 保護');
  }
}

// 8. 後期擴充計劃
console.log('\n📋 後期擴充計劃 (暫時不配置)...');
const futureExpansions = [
  'Stripe 支付處理',
  'PayPal 支付',
  'Twitter 社交分享',
  'Facebook 社交分享',
  'Instagram 社交分享',
  'LinkedIn 社交分享',
  'YouTube 視頻分享',
  'TikTok 短視頻',
  'Discord 社群',
  'Telegram 消息',
  'Reddit 討論',
  'Pinterest 圖片分享'
];

futureExpansions.forEach(expansion => {
  console.log(`  📅 ${expansion}: 後期擴充計劃`);
  configStatus.futureExpansions.details.push(`${expansion}: 後期擴充計劃`);
});

// 生成總結報告
console.log('\n📊 專案配置狀態總結');
console.log('='.repeat(50));

const getStatusEmoji = (status) => {
  switch (status) {
    case 'configured': return '✅';
    case 'partial': return '⚠️';
    case 'default': return '🔧';
    case 'missing': return '❌';
    case 'planned': return '📅';
    default: return '❓';
  }
};

Object.entries(configStatus).forEach(([category, info]) => {
  console.log(`${getStatusEmoji(info.status)} ${category.toUpperCase()}: ${info.status.toUpperCase()}`);
  info.details.forEach(detail => {
    console.log(`    ${detail}`);
  });
  console.log('');
});

// 計算整體配置狀態
const statusCounts = {
  configured: 0,
  partial: 0,
  default: 0,
  missing: 0,
  planned: 0
};

Object.values(configStatus).forEach(info => {
  statusCounts[info.status]++;
});

console.log('🎯 整體配置評估:');
if (statusCounts.configured >= 4) {
  console.log('  🟢 專案配置良好，核心服務已配置真實值');
} else if (statusCounts.configured >= 2) {
  console.log('  🟡 專案配置部分完成，需要進一步配置核心服務');
} else {
  console.log('  🔴 專案配置不完整，需要大量配置工作');
}

console.log('\n📋 當前配置建議:');
if (configStatus.apiKeys.status !== 'configured') {
  console.log('  - 確保所有 API Keys 都使用真實值');
}
if (configStatus.coreIntegrations.status !== 'configured') {
  console.log('  - 配置核心集成服務 (Mixpanel, AWS S3, Firebase, SendGrid, Sentry)');
}
if (configStatus.database.status === 'default') {
  console.log('  - 配置生產環境數據庫連接');
}
if (configStatus.redis.status === 'default') {
  console.log('  - 配置生產環境 Redis 連接');
}
if (configStatus.environment.details.some(d => d.includes('佔位符'))) {
  console.log('  - 更新環境變量文件中的佔位符值');
}

console.log('\n📅 後期擴充計劃:');
console.log('  - 支付服務: Stripe, PayPal 等');
console.log('  - 社交媒體: Twitter, Facebook, Instagram 等');
console.log('  - 其他第三方服務根據業務需求添加');

console.log('\n🎉 配置檢查完成！');
