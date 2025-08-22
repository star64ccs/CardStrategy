#!/usr/bin/env node

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// logger.info('🐘 PostgreSQL 本地配置工具\n');

// 檢查 PostgreSQL 是否已安裝
function checkPostgreSQL() {
  try {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const version = execSync('psql --version', { encoding: 'utf8' }).trim();
    // logger.info(`✅ PostgreSQL 已安裝：${version}`);
    return true;
  } catch (error) {
    // logger.info('❌ PostgreSQL 未安裝或未在 PATH 中');
    return false;
  }
}

// 檢查 PostgreSQL 服務狀態
function checkPostgreSQLService() {
  try {
    if (process.platform === 'win32') {
      // Windows - 嘗試多種可能的服務名稱
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
      const serviceNames = [
        'postgresql',
        'postgresql-x64-17',
        'postgresql-x64-16',
        'postgresql-x64-15',
        'postgresql-x64-14',
        'postgresql-x64-13',
      ];

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
      for (const serviceName of serviceNames) {
        try {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
          const result = execSync(`sc query "${serviceName}"`, {
            encoding: 'utf8',
          });
          if (result.includes('RUNNING')) {
            // logger.info(`✅ PostgreSQL 服務正在運行 (${serviceName})`);
            return true;
          }
        } catch (error) {
          // 繼續嘗試下一個服務名稱
          continue;
        }
      }

      // 如果沒有找到運行中的服務，嘗試直接連接測試
      try {
        execSync('psql -U postgres -c "SELECT 1;"', {
          encoding: 'utf8',
          stdio: 'pipe',
        });
        // logger.info('✅ PostgreSQL 服務正在運行（通過連接測試確認）');
        return true;
      } catch (error) {
        // logger.info('❌ PostgreSQL 服務未運行或無法連接');
        return false;
      }
    } else {
      // Linux/macOS
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
      const result = execSync('systemctl is-active postgresql', {
        encoding: 'utf8',
      }).trim();
      if (result === 'active') {
        // logger.info('✅ PostgreSQL 服務正在運行');
        return true;
      }
      // logger.info('❌ PostgreSQL 服務未運行');
      return false;
    }
  } catch (error) {
    // logger.info('❌ 無法檢查 PostgreSQL 服務狀態');
    return false;
  }
}

// 創建數據庫和用戶
function setupDatabase() {
  // logger.info('\n🗄️  設置數據庫...');

  try {
    // 檢查數據庫是否存在
    const dbExists = execSync(
      'psql -U postgres -lqt | cut -d | -f 1 | grep -qw cardstrategy',
      { encoding: 'utf8' }
    );

    if (!dbExists) {
      // logger.info('創建數據庫 cardstrategy...');
      execSync('createdb -U postgres cardstrategy', { stdio: 'inherit' });
      // logger.info('✅ 數據庫 cardstrategy 創建成功');
    } else {
      // logger.info('ℹ️  數據庫 cardstrategy 已存在');
    }

    // 檢查用戶是否存在
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const userExists = execSync(
      'psql -U postgres -t -c "SELECT 1 FROM pg_roles WHERE rolname=\'cardstrategy\'"',
      { encoding: 'utf8' }
    );

    if (!userExists.trim()) {
      // logger.info('創建用戶 cardstrategy...');
      execSync(
        'psql -U postgres -c "CREATE USER cardstrategy WITH PASSWORD \'cardstrategy123\'"',
        { stdio: 'inherit' }
      );
      execSync(
        'psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE cardstrategy TO cardstrategy"',
        { stdio: 'inherit' }
      );
      // logger.info('✅ 用戶 cardstrategy 創建成功');
    } else {
      // logger.info('ℹ️  用戶 cardstrategy 已存在');
    }
  } catch (error) {
    // logger.info('❌ 數據庫設置失敗：', error.message);
    // logger.info('\n📋 手動設置步驟：');
    // logger.info('1. 登錄 PostgreSQL：psql -U postgres');
    // logger.info('2. 創建數據庫：CREATE DATABASE cardstrategy;');
    // logger.info('3. 創建用戶：CREATE USER cardstrategy WITH PASSWORD \'cardstrategy123\';');
    // logger.info('4. 授權：GRANT ALL PRIVILEGES ON DATABASE cardstrategy TO cardstrategy;');
    // logger.info('5. 退出：\\q');
  }
}

// 更新 .env 檔案以使用本地 PostgreSQL
function updateEnvFile() {
  const envPath = path.join(process.cwd(), '.env');

  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');

    // 更新數據庫配置
    envContent = envContent.replace(/DB_HOST=.*/g, 'DB_HOST=localhost');
    envContent = envContent.replace(/DB_USER=.*/g, 'DB_USER=cardstrategy');
    envContent = envContent.replace(
      /DB_PASSWORD=.*/g,
      'DB_PASSWORD=cardstrategy123'
    );

    fs.writeFileSync(envPath, envContent);
    // logger.info('✅ .env 檔案已更新為使用本地 PostgreSQL');
  } else {
    // logger.info('❌ .env 檔案不存在');
  }
}

// 測試數據庫連接
function testConnection() {
  // logger.info('\n🔗 測試數據庫連接...');

  try {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const result = execSync(
      'psql -U cardstrategy -d cardstrategy -c "SELECT version();"',
      { encoding: 'utf8' }
    );
    // logger.info('✅ 數據庫連接成功');
    // logger.info('PostgreSQL 版本信息：');
    // logger.info(result);
  } catch (error) {
    // logger.info('❌ 數據庫連接失敗');
    // logger.info('請檢查用戶名和密碼是否正確');
  }
}

// 主函數
function main() {
  const pgInstalled = checkPostgreSQL();

  if (!pgInstalled) {
    // logger.info('\n📋 PostgreSQL 安裝指南：');
    // logger.info('\nWindows:');
    // logger.info('1. 下載 PostgreSQL：https://www.postgresql.org/download/windows/');
    // logger.info('2. 安裝時設置密碼為：postgres');
    // logger.info('3. 將 PostgreSQL bin 目錄添加到 PATH');

    // logger.info('\nmacOS:');
    // logger.info('brew install postgresql');
    // logger.info('brew services start postgresql');

    // logger.info('\nUbuntu/Debian:');
    // logger.info('sudo apt update');
    // logger.info('sudo apt install postgresql postgresql-contrib');
    // logger.info('sudo systemctl start postgresql');
    // logger.info('sudo systemctl enable postgresql');

    return;
  }

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  const serviceRunning = checkPostgreSQLService();

  if (!serviceRunning) {
    // logger.info('\n📋 啟動 PostgreSQL 服務：');
    if (process.platform === 'win32') {
      // logger.info('1. 打開服務管理器 (services.msc)');
      // logger.info('2. 找到 PostgreSQL 服務');
      // logger.info('3. 右鍵選擇「啟動」');
    } else {
      // logger.info('sudo systemctl start postgresql');
      // logger.info('sudo systemctl enable postgresql');
    }
    return;
  }

  setupDatabase();
  updateEnvFile();
  testConnection();

  // logger.info('\n🎉 PostgreSQL 配置完成！');
  // logger.info('\n📋 下一步：');
  // logger.info('1. 運行 npm run db:migrate 初始化數據庫結構');
  // logger.info('2. 運行 npm run db:seed 添加測試數據');
  // logger.info('3. 運行 npm run dev:backend 啟動後端服務');
}

main();
