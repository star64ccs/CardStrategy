#!/bin/bash

echo "🚀 開始第一階段：前端基礎優化"
echo "=================================="

# 1. 安裝必要的依賴
echo "📦 安裝效能優化依賴..."
npm install --save-dev @expo/webpack-config webpack-bundle-analyzer

# 2. 驗證 Metro 配置
echo "🔧 驗證 Metro 配置..."
if [ -f "metro.config.js" ]; then
    echo "✅ Metro 配置文件已存在"
else
    echo "❌ Metro 配置文件缺失，請檢查"
    exit 1
fi

# 3. 清理緩存
echo "🧹 清理開發緩存..."
npx expo start --clear

# 4. 測試效能優化工具
echo "🧪 測試效能優化工具..."
npm run test:performance

# 5. 生成效能報告
echo "📊 生成效能報告..."
npm run performance:report

echo "✅ 第一階段前端優化完成！"
echo "📋 下一步：實施後端緩存優化"
