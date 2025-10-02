#!/usr/bin/env node

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// logger.info('🐘 PostgreSQL LocalConfigureTool\n');

// Check PostgreSQL YesNo已Install
function checkPostgreSQL() {
  try {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const version = execSync('psql --version', { encoding: 'utf8' }).trim();
    // logger.info(`✅ PostgreSQL 已Install：${version}`);
    return true;
  } catch (error) {
    // logger.info('❌ PostgreSQL 未Install或未在 PATH 中');
    return false;
  }
}

// Check PostgreSQL ServiceStatus
function checkPostgreSQLService() {
  try {
    if (process.platform === 'win32') {
      // Windows - 嘗試多種可能的Service名稱
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
            // logger.info(`✅ PostgreSQL Service正在運Row (${serviceName})`);
            return true;
          }
        } catch (error) {
          // Continue嘗試下一個Service名稱
          continue;
        }
      }

      // 如果沒有找到運Row中的Service，嘗試直接ConnectTest
      try {
        execSync('psql -U postgres -c "SELECT 1;"', {
          encoding: 'utf8',
          stdio: 'pipe',
        });
        // logger.info('✅ PostgreSQL Service正在運Row（通過ConnectTestConfirm）');
        return true;
      } catch (error) {
        // logger.info('❌ PostgreSQL Service未運Row或無法Connect');
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
        // logger.info('✅ PostgreSQL Service正在運Row');
        return true;
      }
      // logger.info('❌ PostgreSQL Service未運Row');
      return false;
    }
  } catch (error) {
    // logger.info('❌ 無法Check PostgreSQL ServiceStatus');
    return false;
  }
}

// CreateDatabase和User
function setupDatabase() {
  // logger.info('\n🗄️  SettingsDatabase...');

  try {
    // CheckDatabaseYesNo存在
    const dbExists = execSync(
      'psql -U postgres -lqt | cut -d | -f 1 | grep -qw cardstrategy',
      { encoding: 'utf8' }
    );

    if (!dbExists) {
      // logger.info('CreateDatabase cardstrategy...');
      execSync('createdb -U postgres cardstrategy', { stdio: 'inherit' });
      // logger.info('✅ Database cardstrategy CreateSuccess');
    } else {
      // logger.info('ℹ️  Database cardstrategy 已存在');
    }

    // CheckUserYesNo存在
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const userExists = execSync(
      'psql -U postgres -t -c "SELECT 1 FROM pg_roles WHERE rolname=\'cardstrategy\'"',
      { encoding: 'utf8' }
    );

    if (!userExists.trim()) {
      // logger.info('CreateUser cardstrategy...');
      execSync(
        'psql -U postgres -c "CREATE USER cardstrategy WITH PASSWORD \'cardstrategy123\'"',
        { stdio: 'inherit' }
      );
      execSync(
        'psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE cardstrategy TO cardstrategy"',
        { stdio: 'inherit' }
      );
      // logger.info('✅ User cardstrategy CreateSuccess');
    } else {
      // logger.info('ℹ️  User cardstrategy 已存在');
    }
  } catch (error) {
    // logger.info('❌ DatabaseSettingsFailed：', error.message);
    // logger.info('\n📋 ManualSettings步驟：');
    // logger.info('1. Login PostgreSQL：psql -U postgres');
    // logger.info('2. CreateDatabase：CREATE DATABASE cardstrategy;');
    // logger.info('3. CreateUser：CREATE USER cardstrategy WITH PASSWORD \'cardstrategy123\';');
    // logger.info('4. Authorize：GRANT ALL PRIVILEGES ON DATABASE cardstrategy TO cardstrategy;');
    // logger.info('5. Exit：\\q');
  }
}

// Update .env 檔案以使用Local PostgreSQL
function updateEnvFile() {
  const envPath = path.join(process.cwd(), '.env');

  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');

    // UpdateDatabaseConfigure
    envContent = envContent.replace(/DB_HOST=.*/g, 'DB_HOST=localhost');
    envContent = envContent.replace(/DB_USER=.*/g, 'DB_USER=cardstrategy');
    envContent = envContent.replace(
      /DB_PASSWORD=.*/g,
      'DB_PASSWORD=cardstrategy123'
    );

    fs.writeFileSync(envPath, envContent);
    // logger.info('✅ .env 檔案已Update為使用Local PostgreSQL');
  } else {
    // logger.info('❌ .env 檔案不存在');
  }
}

// TestDatabaseConnect
function testConnection() {
  // logger.info('\n🔗 TestDatabaseConnect...');

  try {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const result = execSync(
      'psql -U cardstrategy -d cardstrategy -c "SELECT version();"',
      { encoding: 'utf8' }
    );
    // logger.info('✅ DatabaseConnectSuccess');
    // logger.info('PostgreSQL VersionInformation：');
    // logger.info(result);
  } catch (error) {
    // logger.info('❌ DatabaseConnectFailed');
    // logger.info('請CheckUser名和PasswordYesNo正確');
  }
}

// 主Function
function main() {
  const pgInstalled = checkPostgreSQL();

  if (!pgInstalled) {
    // logger.info('\n📋 PostgreSQL Install指南：');
    // logger.info('\nWindows:');
    // logger.info('1. Download PostgreSQL：https://www.postgresql.org/download/windows/');
    // logger.info('2. Install時SettingsPassword為：postgres');
    // logger.info('3. 將 PostgreSQL bin DirectoryAdd到 PATH');

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
    // logger.info('\n📋 Start PostgreSQL Service：');
    if (process.platform === 'win32') {
      // logger.info('1. 打OnServiceManage器 (services.msc)');
      // logger.info('2. 找到 PostgreSQL Service');
      // logger.info('3. 右KeySelect「Start」');
    } else {
      // logger.info('sudo systemctl start postgresql');
      // logger.info('sudo systemctl enable postgresql');
    }
    return;
  }

  setupDatabase();
  updateEnvFile();
  testConnection();

  // logger.info('\n🎉 PostgreSQL ConfigureComplete！');
  // logger.info('\n📋 下一步：');
  // logger.info('1. 運Row npm run db:migrate InitializeDatabase結構');
  // logger.info('2. 運Row npm run db:seed AddTestData');
  // logger.info('3. 運Row npm run dev:backend Start後端Service');
}

main();
