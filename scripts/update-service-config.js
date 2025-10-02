const fs = require('fs');
const path = require('path');

/**
 * GenericServiceConfigureUpdate腳本
 * SupportUpdate所有免費Service的Configure
 */

// eslint-disable-next-line no-console
console.log('🔧 ServiceConfigureUpdate工具...\n');

const services = {
  mixpanel: {
    name: 'Mixpanel',
    required: ['projectToken', 'apiSecret'],
    description: '用戶行為分析Service'
  },
  sendgrid: {
    name: 'SendGrid',
    required: ['apiKey'],
    description: '郵件發送Service'
  },
  logrocket: {
    name: 'LogRocket',
    required: ['appId'],
    description: '前端Error監控'
  },
  slack: {
    name: 'Slack',
    required: ['botToken', 'signingSecret', 'webhookUrl'],
    description: '團隊溝通通知'
  },
  smtp: {
    name: 'SMTP',
    required: ['host', 'port', 'user', 'pass'],
    description: '郵件發送Service'
  }
};

function updateServiceConfig(serviceName, configData) {
  const configPath = path.join(__dirname, '../src/config/ai-keys', `${serviceName}-config.json`);
  const backupPath = path.join(__dirname, '../backups/api-keys', `${serviceName}-config-backup.json`);
  
  if (!fs.existsSync(configPath)) {
    // eslint-disable-next-line no-console
    console.log(`❌ ${services[serviceName].name} 配置文件不存在`);
    return false;
  }
  
  try {
    // Read現有Configure
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    // UpdateConfigure
    Object.assign(config, configData);
    config.status = 'active';
    config.lastUpdated = new Date().toISOString();
    config.notes.push(`${services[serviceName].name} 配置已更新`);
    
    // WriteUpdate後的Configure
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    // eslint-disable-next-line no-console
    console.log(`✅ ${services[serviceName].name} 配置文件已更新`);
    
    // UpdateBackup
    fs.copyFileSync(configPath, backupPath);
    // eslint-disable-next-line no-console
    console.log(`✅ ${services[serviceName].name} 備份文件已更新`);
    
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`❌ Update ${services[serviceName].name} ConfigureFailed:`, error.message);
    return false;
  }
}

function showUsage() {
  // eslint-disable-next-line no-console
  console.log('📋 使用方法:');
  // eslint-disable-next-line no-console
  console.log('node scripts/update-service-config.js <service> <key1=value1> <key2=value2> ...');
  // eslint-disable-next-line no-console
  console.log('');
  // eslint-disable-next-line no-console
  console.log('🔹 支持的Service:');
  Object.entries(services).forEach(([key, service]) => {
    // eslint-disable-next-line no-console
    console.log(`  ${key}: ${service.name} - ${service.description}`);
    // eslint-disable-next-line no-console
    console.log(`    需要參數: ${service.required.join(', ')}`);
  });
  // eslint-disable-next-line no-console
  console.log('');
  // eslint-disable-next-line no-console
  console.log('📝 示例:');
  // eslint-disable-next-line no-console
  console.log('node scripts/update-service-config.js mixpanel projectToken=1234567890abcdef apiSecret=your-secret');
  // eslint-disable-next-line no-console
  console.log('node scripts/update-service-config.js sendgrid apiKey=SG.your-api-key');
  // eslint-disable-next-line no-console
  console.log('node scripts/update-service-config.js logrocket appId=your-app-id');
  // eslint-disable-next-line no-console
  console.log('node scripts/update-service-config.js slack botToken=xoxb-your-token signingSecret=your-secret webhookUrl=https://hooks.slack.com/services/xxx/xxx/xxx');
  // eslint-disable-next-line no-console
  console.log('node scripts/update-service-config.js smtp host=smtp.gmail.com port=587 user=your-email@gmail.com pass=your-app-password');
}

// 主程序
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === 'help') {
    showUsage();
    process.exit(0);
  }
  
  const serviceName = args[0];
  
  if (!services[serviceName]) {
    // eslint-disable-next-line no-console
    console.log(`❌ 不支持的Service: ${serviceName}`);
    showUsage();
    process.exit(1);
  }
  
  const service = services[serviceName];
  const configData = {};
  
  // ParseParameter
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    const [key, value] = arg.split('=');
    
    if (!key || !value) {
      // eslint-disable-next-line no-console
      console.log(`❌ 無效的參數格式: ${arg}`);
      // eslint-disable-next-line no-console
      console.log('正確格式: key=value');
      process.exit(1);
    }
    
    configData[key] = value;
  }
  
  // CheckRequiredParameter
  const missingParams = service.required.filter(param => !configData[param]);
  if (missingParams.length > 0) {
    // eslint-disable-next-line no-console
    console.log(`❌ 缺少必需參數: ${missingParams.join(', ')}`);
    // eslint-disable-next-line no-console
    console.log(`📋 ${service.name} 需要參數: ${service.required.join(', ')}`);
    process.exit(1);
  }
  
  // UpdateConfigure
  // eslint-disable-next-line no-console
  console.log(`🔄 更新 ${service.name} 配置...`);
  const success = updateServiceConfig(serviceName, configData);
  
  if (success) {
    // eslint-disable-next-line no-console
    console.log(`\n🎉 ${service.name} 配置更新完成！`);
    // eslint-disable-next-line no-console
    console.log('\n📋 下一步:');
    // eslint-disable-next-line no-console
    console.log('1. 測試ServiceConnect');
    // eslint-disable-next-line no-console
    console.log('2. 更新環境變量文件');
    // eslint-disable-next-line no-console
    console.log('3. 集成到應用中');
  } else {
    process.exit(1);
  }
}

module.exports = { updateServiceConfig, services };
