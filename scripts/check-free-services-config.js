const fs = require('fs');
const path = require('path');

/**
 * 免費服務配置檢查腳本
 * 檢查所有免費服務的配置狀態
 */

console.log('🔍 檢查免費服務配置狀態...\n');

class FreeServicesChecker {
  constructor() {
    this.configDir = path.join(__dirname, '../src/config/ai-keys');
    this.backupDir = path.join(__dirname, '../backups/api-keys');
    this.services = [
      'mixpanel',
      'sendgrid', 
      'logrocket',
      'slack',
      'smtp'
    ];
  }

  checkConfigFile(serviceName) {
    const configPath = path.join(this.configDir, `${serviceName}-config.json`);
    const backupPath = path.join(this.backupDir, `${serviceName}-config-backup.json`);
    const envPath = path.join(__dirname, '..', `${serviceName}-config.env`);

    const result = {
      service: serviceName,
      configExists: fs.existsSync(configPath),
      backupExists: fs.existsSync(backupPath),
      envTemplateExists: fs.existsSync(envPath),
      status: 'pending'
    };

    if (result.configExists) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        result.status = config.status || 'pending';
        result.plan = config.plan || '未知';
        result.features = config.features || [];
      } catch (error) {
        result.status = 'error';
        result.error = error.message;
      }
    }

    return result;
  }

  checkAllServices() {
    console.log('📋 檢查所有免費服務配置...\n');

    const results = this.services.map(service => this.checkConfigFile(service));
    
    // 顯示結果
    results.forEach(result => {
      const statusIcon = result.status === 'active' ? '✅' : 
                        result.status === 'pending' ? '⏳' : 
                        result.status === 'error' ? '❌' : '❓';
      
      console.log(`${statusIcon} ${result.service.toUpperCase()}`);
      console.log(`   配置文件: ${result.configExists ? '✅' : '❌'}`);
      console.log(`   備份文件: ${result.backupExists ? '✅' : '❌'}`);
      console.log(`   環境模板: ${result.envTemplateExists ? '✅' : '❌'}`);
      console.log(`   狀態: ${result.status}`);
      if (result.plan) {
        console.log(`   計劃: ${result.plan}`);
      }
      console.log('');
    });

    return results;
  }

  generateSummary(results) {
    console.log('📊 配置狀態總結');
    console.log('='.repeat(50));

    const total = results.length;
    const configured = results.filter(r => r.configExists).length;
    const withBackup = results.filter(r => r.backupExists).length;
    const withEnvTemplate = results.filter(r => r.envTemplateExists).length;

    console.log(`總服務數: ${total}`);
    console.log(`已配置: ${configured}/${total}`);
    console.log(`有備份: ${withBackup}/${total}`);
    console.log(`有環境模板: ${withEnvTemplate}/${total}`);

    console.log('\n🎯 下一步行動:');
    
    const pendingServices = results.filter(r => r.status === 'pending');
    if (pendingServices.length > 0) {
      console.log('\n⏳ 需要配置的服務:');
      pendingServices.forEach(service => {
        console.log(`  - ${service.service.toUpperCase()}`);
      });
    }

    const missingConfigs = results.filter(r => !r.configExists);
    if (missingConfigs.length > 0) {
      console.log('\n❌ 缺少配置文件的服務:');
      missingConfigs.forEach(service => {
        console.log(`  - ${service.service.toUpperCase()}`);
      });
    }

    console.log('\n📚 配置指南:');
    this.services.forEach(service => {
      const guidePath = path.join(__dirname, '..', `${service.toUpperCase()}_CONFIGURATION_GUIDE.md`);
      if (fs.existsSync(guidePath)) {
        console.log(`  - ${service.toUpperCase()}: ${service.toUpperCase()}_CONFIGURATION_GUIDE.md`);
      }
    });

    console.log('\n🛡️ 安全檢查:');
    const gitignorePath = path.join(__dirname, '..', '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
      const protectedServices = this.services.filter(service => 
        gitignoreContent.includes(`${service}-config.env`)
      );
      console.log(`受保護的配置文件: ${protectedServices.length}/${this.services.length}`);
    }

    return {
      total,
      configured,
      withBackup,
      withEnvTemplate,
      pendingServices: pendingServices.length,
      missingConfigs: missingConfigs.length
    };
  }

  showServiceDetails() {
    console.log('\n📋 各服務詳細信息:');
    console.log('='.repeat(50));

    const serviceDetails = {
      mixpanel: {
        name: 'Mixpanel',
        purpose: '用戶行為分析',
        freeLimit: '1,000 事件/月',
        keyInfo: 'Project Token, API Secret',
        website: 'https://mixpanel.com'
      },
      sendgrid: {
        name: 'SendGrid',
        purpose: '郵件發送服務',
        freeLimit: '100 郵件/天',
        keyInfo: 'API Key, 域名驗證',
        website: 'https://sendgrid.com'
      },
      logrocket: {
        name: 'LogRocket',
        purpose: '前端錯誤監控',
        freeLimit: '1,000 會話/月',
        keyInfo: 'App ID',
        website: 'https://logrocket.com'
      },
      slack: {
        name: 'Slack',
        purpose: '團隊溝通通知',
        freeLimit: '10,000 消息/月',
        keyInfo: 'Bot Token, Webhook URL',
        website: 'https://slack.com'
      },
      smtp: {
        name: 'SMTP',
        purpose: '郵件發送',
        freeLimit: 'Gmail: 500/天, Outlook: 300/天',
        keyInfo: 'SMTP 服務器, 應用密碼',
        website: '多種選擇'
      }
    };

    Object.entries(serviceDetails).forEach(([key, details]) => {
      console.log(`\n🔹 ${details.name}`);
      console.log(`   用途: ${details.purpose}`);
      console.log(`   免費限制: ${details.freeLimit}`);
      console.log(`   關鍵信息: ${details.keyInfo}`);
      console.log(`   網站: ${details.website}`);
    });
  }

  run() {
    console.log('🚀 開始檢查免費服務配置...\n');

    // 檢查目錄
    if (!fs.existsSync(this.configDir)) {
      console.log(`❌ 配置目錄不存在: ${this.configDir}`);
      console.log('💡 請先運行配置創建腳本');
      return;
    }

    if (!fs.existsSync(this.backupDir)) {
      console.log(`❌ 備份目錄不存在: ${this.backupDir}`);
      console.log('💡 請先運行配置創建腳本');
      return;
    }

    // 檢查所有服務
    const results = this.checkAllServices();
    
    // 生成總結
    const summary = this.generateSummary(results);
    
    // 顯示詳細信息
    this.showServiceDetails();

    console.log('\n🎉 檢查完成！');
    console.log('\n💡 建議:');
    console.log('1. 按照配置指南逐一設置各服務');
    console.log('2. 獲取必要的 API Key 和 Token');
    console.log('3. 更新環境變量文件');
    console.log('4. 測試各服務功能');
    console.log('5. 監控使用量避免超出免費限制');

    return summary;
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  const checker = new FreeServicesChecker();
  checker.run();
}

module.exports = { FreeServicesChecker };
