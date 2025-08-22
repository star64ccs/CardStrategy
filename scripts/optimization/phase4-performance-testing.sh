#!/bin/bash

echo "🚀 開始第四階段：效能測試"
echo "=================================="

# 1. 安裝效能測試工具
echo "📦 安裝效能測試工具..."
npm install --save-dev artillery k6 autocannon

# 2. 創建 Artillery 測試配置
echo "🔧 創建 Artillery 測試配置..."
cat > tests/performance/artillery-config.yml << 'EOF'
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "暖身階段"
    - duration: 300
      arrivalRate: 50
      name: "正常負載"
    - duration: 120
      arrivalRate: 100
      name: "高負載"
    - duration: 60
      arrivalRate: 200
      name: "壓力測試"
  defaults:
    headers:
      Content-Type: 'application/json'
      Authorization: 'Bearer test-token'

scenarios:
  - name: "API 效能測試"
    weight: 70
    flow:
      - get:
          url: "/api/health"
      - get:
          url: "/api/cards"
          expect:
            - statusCode: 200
      - get:
          url: "/api/cards/1"
          expect:
            - statusCode: [200, 404]
      - post:
          url: "/api/cards"
          json:
            name: "測試卡片"
            description: "效能測試用卡片"
          expect:
            - statusCode: [201, 400]

  - name: "用戶操作測試"
    weight: 30
    flow:
      - get:
          url: "/api/users/profile"
          expect:
            - statusCode: [200, 401]
      - put:
          url: "/api/users/profile"
          json:
            username: "testuser"
          expect:
            - statusCode: [200, 400]
EOF

# 3. 創建 k6 測試腳本
echo "🔧 創建 k6 測試腳本..."
cat > tests/performance/k6-load-test.js << 'EOF'
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 10 }, // 暖身
    { duration: '5m', target: 50 }, // 正常負載
    { duration: '2m', target: 100 }, // 高負載
    { duration: '1m', target: 200 }, // 壓力測試
    { duration: '2m', target: 0 }, // 冷卻
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% 的請求必須在 500ms 內完成
    http_req_failed: ['rate<0.1'], // 錯誤率必須小於 10%
    errors: ['rate<0.1'],
  },
};

const BASE_URL = 'http://localhost:3000';

export default function () {
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-token',
    },
  };

  // 健康檢查
  const healthCheck = http.get(`${BASE_URL}/api/health`);
  check(healthCheck, {
    'health check status is 200': (r) => r.status === 200,
  });

  // 獲取卡片列表
  const cardsList = http.get(`${BASE_URL}/api/cards`, params);
  check(cardsList, {
    'cards list status is 200': (r) => r.status === 200,
    'cards list response time < 200ms': (r) => r.timings.duration < 200,
  });

  // 獲取單個卡片
  const cardDetail = http.get(`${BASE_URL}/api/cards/1`, params);
  check(cardDetail, {
    'card detail status is 200 or 404': (r) => r.status === 200 || r.status === 404,
    'card detail response time < 300ms': (r) => r.timings.duration < 300,
  });

  // 創建卡片
  const createCard = http.post(`${BASE_URL}/api/cards`, JSON.stringify({
    name: `測試卡片 ${Date.now()}`,
    description: '效能測試用卡片',
    price: 100,
    rarity: 'common'
  }), params);
  
  check(createCard, {
    'create card status is 201 or 400': (r) => r.status === 201 || r.status === 400,
    'create card response time < 500ms': (r) => r.timings.duration < 500,
  });

  // 獲取市場數據
  const marketData = http.get(`${BASE_URL}/api/market/trends`, params);
  check(marketData, {
    'market data status is 200': (r) => r.status === 200,
    'market data response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);
}
EOF

# 4. 創建自動化測試腳本
echo "🔧 創建自動化測試腳本..."
cat > tests/performance/run-tests.sh << 'EOF'
#!/bin/bash

echo "🧪 開始效能測試"
echo "=================="

# 1. 基礎功能測試
echo "📋 執行基礎功能測試..."
npm run test:basic

# 2. API 效能測試
echo "🚀 執行 API 效能測試..."
artillery run tests/performance/artillery-config.yml

# 3. 負載測試
echo "⚡ 執行負載測試..."
k6 run tests/performance/k6-load-test.js

# 4. 記憶體測試
echo "🧠 執行記憶體測試..."
npm run test:memory

# 5. 數據庫效能測試
echo "🗄️ 執行數據庫效能測試..."
npm run test:database-performance

# 6. 緩存效能測試
echo "💾 執行緩存效能測試..."
npm run test:cache-performance

echo "✅ 效能測試完成"
EOF

chmod +x tests/performance/run-tests.sh

# 5. 創建效能基準測試
echo "🔧 創建效能基準測試..."
cat > tests/performance/benchmark.js << 'EOF'
const autocannon = require('autocannon');
const fs = require('fs');

async function runBenchmark() {
  console.log('🚀 開始效能基準測試...');

  const results = [];

  // 測試 1: 健康檢查
  console.log('📋 測試健康檢查...');
  const healthResult = await autocannon({
    url: 'http://localhost:3000/api/health',
    connections: 10,
    duration: 10,
    pipelining: 1,
  });
  results.push({ name: '健康檢查', ...healthResult });

  // 測試 2: 卡片列表
  console.log('📋 測試卡片列表...');
  const cardsResult = await autocannon({
    url: 'http://localhost:3000/api/cards',
    connections: 10,
    duration: 10,
    pipelining: 1,
  });
  results.push({ name: '卡片列表', ...cardsResult });

  // 測試 3: 卡片詳情
  console.log('📋 測試卡片詳情...');
  const cardDetailResult = await autocannon({
    url: 'http://localhost:3000/api/cards/1',
    connections: 10,
    duration: 10,
    pipelining: 1,
  });
  results.push({ name: '卡片詳情', ...cardDetailResult });

  // 測試 4: 創建卡片
  console.log('📋 測試創建卡片...');
  const createCardResult = await autocannon({
    url: 'http://localhost:3000/api/cards',
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      name: '基準測試卡片',
      description: '效能基準測試',
      price: 100,
      rarity: 'common'
    }),
    connections: 10,
    duration: 10,
    pipelining: 1,
  });
  results.push({ name: '創建卡片', ...createCardResult });

  // 生成報告
  const report = {
    timestamp: new Date().toISOString(),
    results: results.map(result => ({
      name: result.name,
      requests: {
        total: result.requests.total,
        average: result.requests.average,
        p50: result.requests.p50,
        p90: result.requests.p90,
        p99: result.requests.p99,
      },
      latency: {
        average: result.latency.average,
        p50: result.latency.p50,
        p90: result.latency.p90,
        p99: result.latency.p99,
      },
      throughput: {
        average: result.throughput.average,
        p50: result.throughput.p50,
        p90: result.throughput.p90,
        p99: result.throughput.p99,
      },
      errors: result.errors,
      timeouts: result.timeouts,
    }))
  };

  // 保存報告
  fs.writeFileSync(
    `reports/performance-benchmark-${Date.now()}.json`,
    JSON.stringify(report, null, 2)
  );

  console.log('📊 基準測試完成，報告已保存');
  return report;
}

runBenchmark().catch(console.error);
EOF

# 6. 執行效能測試
echo "🧪 執行效能測試..."
mkdir -p reports
npm run test:performance

# 7. 生成效能報告
echo "📊 生成效能報告..."
node tests/performance/benchmark.js

echo "✅ 第四階段效能測試完成！"
echo "📋 下一步：系統調優"
