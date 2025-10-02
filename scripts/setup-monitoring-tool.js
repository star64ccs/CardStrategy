const fs = require('fs');
const path = require('path');

/**
 * CardStrategy 專案MonitorTool快速Settings腳本
 */

// eslint-disable-next-line no-console
console.log('🚀 開始設置 CardStrategy 專案監控工具...\n');

// 項目Configure
const config = {
  projectName: 'cardstrategy-monitoring',
  domain: process.env.DOMAIN || 'yourdomain.com',
  frontendPort: 3000,
  backendPort: 3001
};

// Create基本Directory結構
function createDirectories() {
  // eslint-disable-next-line no-console
  console.log('📁 創建項目目錄...');
  
  const dirs = [
    'monitoring-frontend',
    'monitoring-backend',
    'docker',
    'nginx'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      // eslint-disable-next-line no-console
      console.log(`   ✅ ${dir}`);
    }
  });
}

// Create Docker Compose Configure
function createDockerCompose() {
  // eslint-disable-next-line no-console
  console.log('🐳 創建 Docker Compose 配置...');
  
  const compose = `version: '3.8'

services:
  frontend:
    build: ./monitoring-frontend
    ports:
      - "${config.frontendPort}:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:${config.backendPort}
    depends_on:
      - backend

  backend:
    build: ./monitoring-backend
    ports:
      - "${config.backendPort}:3001"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - DB_NAME=monitoring
      - DB_USER=monitoring_user
      - DB_PASSWORD=monitoring_password
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:14
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=monitoring
      - POSTGRES_USER=monitoring_user
      - POSTGRES_PASSWORD=monitoring_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
`;
  
  fs.writeFileSync('docker-compose.yml', compose);
  // eslint-disable-next-line no-console
  console.log('   ✅ docker-compose.yml');
}

// Create README
function createReadme() {
  // eslint-disable-next-line no-console
  console.log('📖 創建 README...');
  
  const readme = `# CardStrategy 專案監控工具

## 🚀 快速開始

1. 配置環境變量
2. 運行: docker-compose up -d
3. 訪問: http://localhost:${config.frontendPort}

## 📊 功能
- 專案監控儀表板
- 成本監控管理
- 系統維護工具
- 團隊協作功能

## 🛠️ 技術棧
- 前端: React + TypeScript + Ant Design
- 後端: Node.js + Express + PostgreSQL
- 部署: Docker + Nginx
`;
  
  fs.writeFileSync('README.md', readme);
  // eslint-disable-next-line no-console
  console.log('   ✅ README.md');
}

// CreateDeploy腳本
function createDeployScript() {
  // eslint-disable-next-line no-console
  console.log('🚀 創建部署腳本...');
  
  const script = `#!/bin/bash
echo "🚀 部署 CardStrategy 監控工具..."
docker-compose up -d
echo "✅ 部署完成！訪問 http://localhost:${config.frontendPort}"
`;
  
  fs.writeFileSync('deploy.sh', script);
  // eslint-disable-next-line no-console
  console.log('   ✅ deploy.sh');
}

// 主Function
function main() {
  createDirectories();
  createDockerCompose();
  createReadme();
  createDeployScript();
  
  // eslint-disable-next-line no-console
  console.log('\n✅ 設置完成！');
  // eslint-disable-next-line no-console
  console.log('\n📋 下一步:');
  // eslint-disable-next-line no-console
  console.log('   1. 配置域名: ${config.domain}');
  // eslint-disable-next-line no-console
  console.log('   2. 運行: ./deploy.sh');
  // eslint-disable-next-line no-console
  console.log('   3. 訪問: http://localhost:${config.frontendPort}');
}

main();
