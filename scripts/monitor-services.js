const fs = require('fs');
const path = require('path');

// eslint-disable-next-line no-console
console.log('🔍 CardStrategy Service監控Check...');

async function checkServiceHealth() {
  const results = {
    timestamp: new Date().toISOString(),
    services: {},
    overall: 'healthy'
  };

  // CheckConfigureFile
  const configFiles = [
    'src/config/ai-keys/mixpanel-config.json',
    'src/config/ai-keys/sendgrid-config.json',
    'src/config/ai-keys/logrocket-config.json',
    'src/config/ai-keys/smtp-config.json'
  ];

  for (const file of configFiles) {
    const serviceName = path.basename(file, '-config.json');
    try {
      const config = JSON.parse(fs.readFileSync(file, 'utf8'));
      results.services[serviceName] = {
        status: config.status || 'unknown',
        healthy: config.status === 'active'
      };
    } catch (error) {
      results.services[serviceName] = {
        status: 'error',
        healthy: false,
        error: error.message
      };
      results.overall = 'degraded';
    }
  }

  return results;
}

// 執Row健康Check
checkServiceHealth().then(results => {
  // eslint-disable-next-line no-console
  console.log('📊 監控結果:');
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(results, null, 2));
  
  // Save結果
  const reportPath = path.join(__dirname, '../monitoring/health-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  // eslint-disable-next-line no-console
  console.log('✅ 健康報告已保存: monitoring/health-report.json');
});