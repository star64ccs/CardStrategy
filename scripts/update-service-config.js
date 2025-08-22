const fs = require('fs');
const path = require('path');

/**
 * 通用服務配置更新腳本
 * 支持更新所有免費服務的配置
 */

console.log('🔧 服務配置更新工具...\n');

const services = {
  mixpanel: {
    name: 'Mixpanel',
    required: ['projectToken', 'apiSecret'],
    description: '用戶行為分析服務'
  },
  sendgrid: {
    name: 'SendGrid',
    required: ['apiKey'],
    description: '郵件發送服務'
  },
  logrocket: {
    name: 'LogRocket',
    required: ['appId'],
    description: '前端錯誤監控'
  },
  slack: {
    name: 'Slack',
    required: ['botToken', 'signingSecret', 'webhookUrl'],
    description: '團隊溝通通知'
  },
  smtp: {
    name: 'SMTP',
    required: ['host', 'port', 'user', 'pass'],
    description: '郵件發送服務'
  }
};

function updateServiceConfig(serviceName, configData) {
  const configPath = path.join(__dirname, '../src/config/ai-keys', `${serviceName}-config.json`);
  const backupPath = path.join(__dirname, '../backups/api-keys', `${serviceName}-config-backup.json`);
  
  if (!fs.existsSync(configPath)) {
    console.log(`❌ ${services[serviceName].name} 配置文件不存在`);
    return false;
  }
  
  try {
    // 讀取現有配置
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    // 更新配置
    Object.assign(config, configData);
    config.status = 'active';
    config.lastUpdated = new Date().toISOString();
    config.notes.push(`${services[serviceName].name} 配置已更新`);
    
    // 寫入更新後的配置
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`✅ ${services[serviceName].name} 配置文件已更新`);
    
    // 更新備份
    fs.copyFileSync(configPath, backupPath);
    console.log(`✅ ${services[serviceName].name} 備份文件已更新`);
    
    return true;
  } catch (error) {
    console.error(`❌ 更新 ${services[serviceName].name} 配置失敗:`, error.message);
    return false;
  }
}

function showUsage() {
  console.log('📋 使用方法:');
  console.log('node scripts/update-service-config.js <service> <key1=value1> <key2=value2> ...');
  console.log('');
  console.log('🔹 支持的服務:');
  Object.entries(services).forEach(([key, service]) => {
    console.log(`  ${key}: ${service.name} - ${service.description}`);
    console.log(`    需要參數: ${service.required.join(', ')}`);
  });
  console.log('');
  console.log('📝 示例:');
  console.log('node scripts/update-service-config.js mixpanel projectToken=1234567890abcdef apiSecret=your-secret');
  console.log('node scripts/update-service-config.js sendgrid apiKey=SG.your-api-key');
  console.log('node scripts/update-service-config.js logrocket appId=your-app-id');
  console.log('node scripts/update-service-config.js slack botToken=xoxb-your-token signingSecret=your-secret webhookUrl=https://hooks.slack.com/services/xxx/xxx/xxx');
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
    console.log(`❌ 不支持的服務: ${serviceName}`);
    showUsage();
    process.exit(1);
  }
  
  const service = services[serviceName];
  const configData = {};
  
  // 解析參數
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    const [key, value] = arg.split('=');
    
    if (!key || !value) {
      console.log(`❌ 無效的參數格式: ${arg}`);
      console.log('正確格式: key=value');
      process.exit(1);
    }
    
    configData[key] = value;
  }
  
  // 檢查必需參數
  const missingParams = service.required.filter(param => !configData[param]);
  if (missingParams.length > 0) {
    console.log(`❌ 缺少必需參數: ${missingParams.join(', ')}`);
    console.log(`📋 ${service.name} 需要參數: ${service.required.join(', ')}`);
    process.exit(1);
  }
  
  // 更新配置
  console.log(`🔄 更新 ${service.name} 配置...`);
  const success = updateServiceConfig(serviceName, configData);
  
  if (success) {
    console.log(`\n🎉 ${service.name} 配置更新完成！`);
    console.log('\n📋 下一步:');
    console.log('1. 測試服務連接');
    console.log('2. 更新環境變量文件');
    console.log('3. 集成到應用中');
  } else {
    process.exit(1);
  }
}

module.exports = { updateServiceConfig, services };
