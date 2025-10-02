const { execSync } = require('child_process');
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const fs = require('fs');
const path = require('path');
const os = require('os');

// logger.info('🔑 SSH 密鑰SettingsTool (Windows Version)');
// logger.info('='.repeat(50));

// Check SSH Directory
function checkSshDirectory() {
  // logger.info('\n📋 Check SSH Directory...');

  const sshDir = path.join(os.homedir(), '.ssh');

  if (!fs.existsSync(sshDir)) {
    // logger.info('Create SSH Directory...');
    fs.mkdirSync(sshDir, { recursive: true });
  }

  // logger.info('✅ SSH DirectoryCheckComplete');
  return sshDir;
}

// 生成 SSH 密鑰對
function generateSshKey(sshDir) {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  const keyName = 'cardstrategy_digitalocean';
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  const keyPath = path.join(sshDir, keyName);

  // logger.info('\n📋 生成 SSH 密鑰對...');

  if (fs.existsSync(keyPath)) {
    // logger.info('⚠️  SSH 密鑰已存在，使用現有密鑰');
    return keyPath;
  }

  // 使用 ssh-keygen 生成密鑰
  const command = `ssh-keygen -t rsa -b 4096 -f "${keyPath}" -C "cardstrategy@digitalocean.com" -N ""`;
  execSync(command, { stdio: 'inherit' });

  // logger.info('✅ SSH 密鑰生成Complete');
  return keyPath;
}

// Show密鑰Information
function showKeyInfo(keyPath) {
  // logger.info('\n📋 SSH 密鑰Information:');
  // logger.info('='.repeat(50));
  // logger.info(`私鑰Path: ${keyPath}`);
  // logger.info(`公鑰Path: ${keyPath}.pub`);
  // logger.info('='.repeat(50));

  try {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const publicKey = fs.readFileSync(`${keyPath}.pub`, 'utf8');
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const privateKey = fs.readFileSync(keyPath, 'utf8');

    // logger.info('\n📋 公鑰Content (Add到 DigitalOcean):');
    // logger.info('='.repeat(50));
    // logger.info(publicKey.trim());
    // logger.info('='.repeat(50));

    // logger.info('\n📋 私鑰Content (Add到 GitHub Secrets):');
    // logger.info('='.repeat(50));
    // logger.info(privateKey.trim());
    // logger.info('='.repeat(50));
  } catch (error) {
    // logger.info('❌ Read密鑰FileFailed:', error.message);
  }
}

// ShowSettings指南
function showSetupGuide() {
  // logger.info('\n📋 Settings指南:');
  // logger.info('='.repeat(50));
  // logger.info('1. 複製公鑰Content到 DigitalOcean:');
  // logger.info('   - 在 DigitalOcean Control台點擊 "Add SSH Key"');
  // logger.info('   - 在 "SSH Key content" 欄位貼上公鑰Content');
  // logger.info('   - 在 "Name" 欄位Input: CardStrategy Production');
  // logger.info('   - 點擊 "Add SSH Key"');
  // logger.info('');
  // logger.info('2. 複製私鑰Content到 GitHub Secrets:');
  // logger.info('   - 前往 GitHub 倉Library: https://github.com/star64ccs/CardStrategy');
  // logger.info('   - Settings → Secrets and variables → Actions');
  // logger.info('   - 點擊 "New repository secret"');
  // logger.info('   - Name: PRODUCTION_SSH_KEY');
  // logger.info('   - Value: 貼上私鑰Content');
  // logger.info('='.repeat(50));
}

// Test SSH Connect
function testSshConnection(keyPath) {
  const dropletIp = '159.223.84.189';

  // logger.info('\n📋 Test SSH Connect...');

  try {
    const command = `ssh -i "${keyPath}" -o ConnectTimeout=10 -o StrictHostKeyChecking=no root@${dropletIp} "echo 'SSH ConnectSuccess!'"`;
    execSync(command, { stdio: 'inherit' });
    // logger.info('✅ SSH ConnectTestSuccess');
  } catch (error) {
    // logger.info('⚠️  SSH ConnectTestFailed，請Check以下項目:');
    // logger.info('1. 公鑰YesNo已Add到 DigitalOcean');
    // logger.info('2. Droplet IP YesNo正確');
    // logger.info('3. 防火牆SettingsYesNoAllow SSH Connect');
  }
}

// 主Function
function main() {
  try {
    // Check SSH Directory
    const sshDir = checkSshDirectory();

    // 生成 SSH 密鑰
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const keyPath = generateSshKey(sshDir);

    // Show密鑰Information
    showKeyInfo(keyPath);

    // ShowSettings指南
    showSetupGuide();

    // 詢問YesNoTestConnect
    // logger.info('\n💡 Complete上述Settings後，您可以運Row以下命令TestConnect:');
    // logger.info(`ssh -i "${keyPath}" root@159.223.84.189`);

    // logger.info('\n✅ SSH 密鑰SettingsComplete！');
  } catch (error) {
    // logger.info('\n❌ SettingsFailed:', error.message);
    process.exit(1);
  }
}

// 如果直接運Row此腳本
if (require.main === module) {
  main();
}

module.exports = {
  main,
  checkSshDirectory,
  generateSshKey,
  showKeyInfo,
  showSetupGuide,
  testSshConnection,
};
