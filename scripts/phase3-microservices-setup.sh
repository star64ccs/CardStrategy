#!/bin/bash

echo "🚀 開始第三階段：微服務架構實施"
echo "=================================="

# 1. 創建微服務目錄結構
echo "📁 創建微服務目錄結構..."
mkdir -p microservices/{user-service,card-service,market-service,notification-service,analytics-service}

# 2. 創建 Docker Compose 配置
echo "🐳 創建 Docker Compose 配置..."
cat > docker-compose.microservices.yml << 'EOF'
version: '3.8'

services:
  # 用戶服務
  user-service:
    build: ./microservices/user-service
    ports:
      - "3001:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - REDIS_HOST=redis
    depends_on:
      - postgres
      - redis

  # 卡片服務
  card-service:
    build: ./microservices/card-service
    ports:
      - "3002:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - REDIS_HOST=redis
    depends_on:
      - postgres
      - redis

  # 市場服務
  market-service:
    build: ./microservices/market-service
    ports:
      - "3003:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - REDIS_HOST=redis
    depends_on:
      - postgres
      - redis

  # 通知服務
  notification-service:
    build: ./microservices/notification-service
    ports:
      - "3004:3000"
    environment:
      - NODE_ENV=production
      - REDIS_HOST=redis
    depends_on:
      - redis

  # 分析服務
  analytics-service:
    build: ./microservices/analytics-service
    ports:
      - "3005:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - REDIS_HOST=redis
    depends_on:
      - postgres
      - redis

  # API 網關
  api-gateway:
    build: ./microservices/api-gateway
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - user-service
      - card-service
      - market-service
      - notification-service
      - analytics-service

  # 數據庫
  postgres:
    image: postgres:13
    environment:
      - POSTGRES_DB=cardstrategy
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  # Redis
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # 監控
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus

  # Grafana
  grafana:
    image: grafana/grafana
    ports:
      - "3006:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana

volumes:
  postgres_data:
  redis_data:
  prometheus_data:
  grafana_data:
EOF

# 3. 創建 API 網關
echo "🌐 創建 API 網關..."
mkdir -p microservices/api-gateway
cat > microservices/api-gateway/package.json << 'EOF'
{
  "name": "api-gateway",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "express": "^4.17.1",
    "http-proxy-middleware": "^2.0.1",
    "cors": "^2.8.5",
    "helmet": "^4.6.0",
    "express-rate-limit": "^5.3.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.12"
  }
}
EOF

cat > microservices/api-gateway/index.js << 'EOF'
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// 安全中間件
app.use(helmet());
app.use(cors());

// 限流中間件
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分鐘
  max: 100 // 限制每個IP 15分鐘內最多100個請求
});
app.use(limiter);

// 代理配置
const services = {
  '/api/users': 'http://user-service:3000',
  '/api/cards': 'http://card-service:3000',
  '/api/market': 'http://market-service:3000',
  '/api/notifications': 'http://notification-service:3000',
  '/api/analytics': 'http://analytics-service:3000'
};

// 設置代理
Object.entries(services).forEach(([path, target]) => {
  app.use(path, createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: {
      [`^${path}`]: ''
    },
    onError: (err, req, res) => {
      console.error(`代理錯誤 ${path}:`, err);
      res.status(503).json({
        success: false,
        message: '服務暫時不可用'
      });
    }
  }));
});

// 健康檢查
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: Object.keys(services)
  });
});

app.listen(PORT, () => {
  console.log(`API 網關運行在端口 ${PORT}`);
});
EOF

# 4. 創建服務發現配置
echo "🔍 創建服務發現配置..."
cat > microservices/service-discovery.js << 'EOF'
const consul = require('consul')();

class ServiceDiscovery {
  constructor() {
    this.services = new Map();
  }

  // 註冊服務
  async registerService(serviceName, serviceId, address, port) {
    try {
      await consul.agent.service.register({
        name: serviceName,
        id: serviceId,
        address: address,
        port: port,
        check: {
          http: `http://${address}:${port}/health`,
          interval: '10s',
          timeout: '5s'
        }
      });
      
      console.log(`服務 ${serviceName} 註冊成功`);
    } catch (error) {
      console.error(`服務註冊失敗:`, error);
    }
  }

  // 發現服務
  async discoverService(serviceName) {
    try {
      const services = await consul.catalog.service.nodes(serviceName);
      return services.map(service => ({
        id: service.ServiceID,
        address: service.ServiceAddress,
        port: service.ServicePort
      }));
    } catch (error) {
      console.error(`服務發現失敗:`, error);
      return [];
    }
  }

  // 健康檢查
  async healthCheck(serviceName) {
    try {
      const checks = await consul.agent.check.list();
      return Object.values(checks).filter(check => 
        check.ServiceName === serviceName && check.Status === 'passing'
      );
    } catch (error) {
      console.error(`健康檢查失敗:`, error);
      return [];
    }
  }
}

module.exports = ServiceDiscovery;
EOF

# 5. 啟動微服務
echo "🚀 啟動微服務..."
docker-compose -f docker-compose.microservices.yml up -d

# 6. 測試微服務
echo "🧪 測試微服務..."
sleep 30
curl -f http://localhost:3000/health

echo "✅ 第三階段微服務架構完成！"
echo "📋 下一步：負載均衡配置"
