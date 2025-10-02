const fs = require('fs');
const path = require('path');

/**
 * 免費ServiceConfigureCheck腳本
 * Check所有免費Service的ConfigureStatus
 */

// eslint-disable-next-line no-console
console.log('🔍 Check免費ServiceConfigure狀態...\n');

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
    // eslint-disable-next-line no-console
    console.log('📋 Check所有免費ServiceConfigure...\n');

    const results = this.services.map(service => this.checkConfigFile(service));
    
    // Show結果
    results.forEach(result => {
      const statusIcon = result.status === 'active' ? '✅' : 
                        result.status === 'pending' ? '⏳' : 
                        result.status === 'error' ? '❌' : '❓';
      
      // eslint-disable-next-line no-console
      console.log(`${statusIcon} ${result.service.toUpperCase()}`);
      // eslint-disable-next-line no-console
      console.log(`   配置文件: ${result.configExists ? '✅' : '❌'}`);
      // eslint-disable-next-line no-console
      console.log(`   備份文件: ${result.backupExists ? '✅' : '❌'}`);
      // eslint-disable-next-line no-console
      console.log(`   環境模板: ${result.envTemplateExists ? '✅' : '❌'}`);
      // eslint-disable-next-line no-console
      console.log(`   狀態: ${result.status}`);
      if (result.plan) {
        // eslint-disable-next-line no-console
        console.log(`   計劃: ${result.plan}`);
      }
      // eslint-disable-next-line no-console
      console.log('');
    });

    return results;
  }

  generateSummary(results) {
    // eslint-disable-next-line no-console
    console.log('📊 配置狀態總結');
    // eslint-disable-next-line no-console
    console.log('='.repeat(50));

    const total = results.length;
    const configured = results.filter(r => r.configExists).length;
    const withBackup = results.filter(r => r.backupExists).length;
    const withEnvTemplate = results.filter(r => r.envTemplateExists).length;

    // eslint-disable-next-line no-console
    console.log(`總Service數: ${total}`);
    // eslint-disable-next-line no-console
    console.log(`已配置: ${configured}/${total}`);
    // eslint-disable-next-line no-console
    console.log(`有備份: ${withBackup}/${total}`);
    // eslint-disable-next-line no-console
    console.log(`有環境模板: ${withEnvTemplate}/${total}`);

    // eslint-disable-next-line no-console
    console.log('\n🎯 下一步行動:');
    
    const pendingServices = results.filter(r => r.status === 'pending');
    if (pendingServices.length > 0) {
      // eslint-disable-next-line no-console
      console.log('\n⏳ 需要Configure的Service:');
      pendingServices.forEach(service => {
        // eslint-disable-next-line no-console
        console.log(`  - ${service.service.toUpperCase()}`);
      });
    }

    const missingConfigs = results.filter(r => !r.configExists);
    if (missingConfigs.length > 0) {
      // eslint-disable-next-line no-console
      console.log('\n❌ 缺少Configure文件的Service:');
      missingConfigs.forEach(service => {
        // eslint-disable-next-line no-console
        console.log(`  - ${service.service.toUpperCase()}`);
      });
    }

    // eslint-disable-next-line no-console
    console.log('\n📚 配置指南:');
    this.services.forEach(service => {
      const guidePath = path.join(__dirname, '..', `${service.toUpperCase()}_CONFIGURATION_GUIDE.md`);
      if (fs.existsSync(guidePath)) {
        // eslint-disable-next-line no-console
        console.log(`  - ${service.toUpperCase()}: ${service.toUpperCase()}_CONFIGURATION_GUIDE.md`);
      }
    });

    // eslint-disable-next-line no-console
    console.log('\n🛡️ 安全檢查:');
    const gitignorePath = path.join(__dirname, '..', '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
      const protectedServices = this.services.filter(service => 
        gitignoreContent.includes(`${service}-config.env`)
      );
      // eslint-disable-next-line no-console
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
    // eslint-disable-next-line no-console
    console.log('\n📋 各Service詳細Information:');
    // eslint-disable-next-line no-console
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
        purpose: '郵件發送Service',
        freeLimit: '100 郵件/天',
        keyInfo: 'API Key, 域名驗證',
        website: 'https://sendgrid.com'
      },
      logrocket: {
        name: 'LogRocket',
        purpose: '前端Error監控',
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
        keyInfo: 'SMTP Server, 應用密碼',
        website: '多種選擇'
      }
    };

    Object.entries(serviceDetails).forEach(([key, details]) => {
      // eslint-disable-next-line no-console
      console.log(`\n🔹 ${details.name}`);
      // eslint-disable-next-line no-console
      console.log(`   用途: ${details.purpose}`);
      // eslint-disable-next-line no-console
      console.log(`   免費限制: ${details.freeLimit}`);
      // eslint-disable-next-line no-console
      console.log(`   關鍵信息: ${details.keyInfo}`);
      // eslint-disable-next-line no-console
      console.log(`   網站: ${details.website}`);
    });
  }

  run() {
    // eslint-disable-next-line no-console
    console.log('🚀 開始Check免費ServiceConfigure...\n');

    // CheckDirectory
    if (!fs.existsSync(this.configDir)) {
      // eslint-disable-next-line no-console
      console.log(`❌ 配置目錄不存在: ${this.configDir}`);
      // eslint-disable-next-line no-console
      console.log('💡 請先運行配置創建腳本');
      return;
    }

    if (!fs.existsSync(this.backupDir)) {
      // eslint-disable-next-line no-console
      console.log(`❌ 備份目錄不存在: ${this.backupDir}`);
      // eslint-disable-next-line no-console
      console.log('💡 請先運行配置創建腳本');
      return;
    }

    // Check所有Service
    const results = this.checkAllServices();
    
    // 生成總結
    const summary = this.generateSummary(results);
    
    // Show詳細Information
    this.showServiceDetails();

    // eslint-disable-next-line no-console
    console.log('\n🎉 檢查完成！');
    // eslint-disable-next-line no-console
    console.log('\n💡 建議:');
    // eslint-disable-next-line no-console
    console.log('1. 按照Configure指南逐一Settings各Service');
    // eslint-disable-next-line no-console
    console.log('2. 獲取必要的 API Key 和 Token');
    // eslint-disable-next-line no-console
    console.log('3. 更新環境變量文件');
    // eslint-disable-next-line no-console
    console.log('4. 測試各Service功能');
    // eslint-disable-next-line no-console
    console.log('5. 監控使用量避免超出免費限制');

    return summary;
  }
}

// 如果直接運Row此腳本
if (require.main === module) {
  const checker = new FreeServicesChecker();
  checker.run();
}

module.exports = { FreeServicesChecker };
