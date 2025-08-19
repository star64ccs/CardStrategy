const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🔑 SSH 密鑰設置工具 (Windows 版本)');
console.log('='.repeat(50));

// 檢查 SSH 目錄
function checkSshDirectory() {
  console.log('\n📋 檢查 SSH 目錄...');
  
  const sshDir = path.join(os.homedir(), '.ssh');
  
  if (!fs.existsSync(sshDir)) {
    console.log('創建 SSH 目錄...');
    fs.mkdirSync(sshDir, { recursive: true });
  }
  
  console.log('✅ SSH 目錄檢查完成');
  return sshDir;
}

// 生成 SSH 密鑰對
function generateSshKey(sshDir) {
  const keyName = 'cardstrategy_digitalocean';
  const keyPath = path.join(sshDir, keyName);
  
  console.log('\n📋 生成 SSH 密鑰對...');
  
  if (fs.existsSync(keyPath)) {
    console.log('⚠️  SSH 密鑰已存在，使用現有密鑰');
    return keyPath;
  }
  
  try {
    // 使用 ssh-keygen 生成密鑰
    const command = `ssh-keygen -t rsa -b 4096 -f "${keyPath}" -C "cardstrategy@digitalocean.com" -N ""`;
    execSync(command, { stdio: 'inherit' });
    
    console.log('✅ SSH 密鑰生成完成');
    return keyPath;
  } catch (error) {
    console.error('❌ 生成 SSH 密鑰失敗:', error.message);
    console.log('\n💡 如果 ssh-keygen 不可用，請安裝 OpenSSH:');
    console.log('1. 打開 Windows 設置');
    console.log('2. 應用程序 → 可選功能');
    console.log('3. 添加功能 → OpenSSH 客戶端');
    throw error;
  }
}

// 顯示密鑰信息
function showKeyInfo(keyPath) {
  console.log('\n📋 SSH 密鑰信息:');
  console.log('='.repeat(50));
  console.log(`私鑰路徑: ${keyPath}`);
  console.log(`公鑰路徑: ${keyPath}.pub`);
  console.log('='.repeat(50));
  
  try {
    const publicKey = fs.readFileSync(`${keyPath}.pub`, 'utf8');
    const privateKey = fs.readFileSync(keyPath, 'utf8');
    
    console.log('\n📋 公鑰內容 (添加到 DigitalOcean):');
    console.log('='.repeat(50));
    console.log(publicKey.trim());
    console.log('='.repeat(50));
    
    console.log('\n📋 私鑰內容 (添加到 GitHub Secrets):');
    console.log('='.repeat(50));
    console.log(privateKey.trim());
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ 讀取密鑰文件失敗:', error.message);
  }
}

// 顯示設置指南
function showSetupGuide() {
  console.log('\n📋 設置指南:');
  console.log('='.repeat(50));
  console.log('1. 複製公鑰內容到 DigitalOcean:');
  console.log('   - 在 DigitalOcean 控制台點擊 "Add SSH Key"');
  console.log('   - 在 "SSH Key content" 欄位貼上公鑰內容');
  console.log('   - 在 "Name" 欄位輸入: CardStrategy Production');
  console.log('   - 點擊 "Add SSH Key"');
  console.log('');
  console.log('2. 複製私鑰內容到 GitHub Secrets:');
  console.log('   - 前往 GitHub 倉庫: https://github.com/star64ccs/CardStrategy');
  console.log('   - Settings → Secrets and variables → Actions');
  console.log('   - 點擊 "New repository secret"');
  console.log('   - Name: PRODUCTION_SSH_KEY');
  console.log('   - Value: 貼上私鑰內容');
  console.log('='.repeat(50));
}

// 測試 SSH 連接
function testSshConnection(keyPath) {
  const dropletIp = '159.223.84.189';
  
  console.log('\n📋 測試 SSH 連接...');
  
  try {
    const command = `ssh -i "${keyPath}" -o ConnectTimeout=10 -o StrictHostKeyChecking=no root@${dropletIp} "echo 'SSH 連接成功!'"`;
    execSync(command, { stdio: 'inherit' });
    console.log('✅ SSH 連接測試成功');
  } catch (error) {
    console.log('⚠️  SSH 連接測試失敗，請檢查以下項目:');
    console.log('1. 公鑰是否已添加到 DigitalOcean');
    console.log('2. Droplet IP 是否正確');
    console.log('3. 防火牆設置是否允許 SSH 連接');
  }
}

// 主函數
function main() {
  try {
    // 檢查 SSH 目錄
    const sshDir = checkSshDirectory();
    
    // 生成 SSH 密鑰
    const keyPath = generateSshKey(sshDir);
    
    // 顯示密鑰信息
    showKeyInfo(keyPath);
    
    // 顯示設置指南
    showSetupGuide();
    
    // 詢問是否測試連接
    console.log('\n💡 完成上述設置後，您可以運行以下命令測試連接:');
    console.log(`ssh -i "${keyPath}" root@159.223.84.189`);
    
    console.log('\n✅ SSH 密鑰設置完成！');
    
  } catch (error) {
    console.error('\n❌ 設置失敗:', error.message);
    process.exit(1);
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  main();
}

module.exports = {
  main,
  checkSshDirectory,
  generateSshKey,
  showKeyInfo,
  showSetupGuide,
  testSshConnection
};
