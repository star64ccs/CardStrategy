#!/bin/bash

echo "🚀 開始第一階段：後端緩存優化"
echo "=================================="

# 1. 進入後端目錄
cd backend

# 2. 安裝 Redis 依賴
echo "📦 安裝 Redis 依賴..."
npm install redis

# 3. 驗證高級緩存服務
echo "🔧 驗證高級緩存服務..."
if [ -f "src/services/advancedCacheService.js" ]; then
    echo "✅ 高級緩存服務已存在"
else
    echo "❌ 高級緩存服務缺失，請檢查"
    exit 1
fi

# 4. 測試緩存服務
echo "🧪 測試緩存服務..."
npm run test:cache

# 5. 啟動 Redis 服務
echo "🔴 啟動 Redis 服務..."
if command -v docker &> /dev/null; then
    docker run -d --name redis-cache -p 6379:6379 redis:alpine
    echo "✅ Redis 容器已啟動"
else
    echo "⚠️  Docker 未安裝，請手動啟動 Redis"
fi

# 6. 測試緩存連接
echo "🔗 測試緩存連接..."
npm run test:cache-connection

# 7. 生成緩存統計報告
echo "📊 生成緩存統計報告..."
npm run cache:stats

echo "✅ 第一階段後端優化完成！"
echo "📋 下一步：進入第二階段 - 數據庫優化"
