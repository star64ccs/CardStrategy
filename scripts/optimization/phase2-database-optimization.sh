#!/bin/bash

echo "🚀 開始第二階段：數據庫優化"
echo "=================================="

# 1. 進入後端目錄
cd backend

# 2. 生成數據庫分析報告
echo "📊 生成數據庫分析報告..."
npm run db:analyze

# 3. 創建優化索引
echo "🔧 創建優化索引..."
cat > migrations/$(date +%Y%m%d%H%M%S)-optimize-indexes.js << 'EOF'
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 卡片表索引優化
    await queryInterface.addIndex('cards', ['user_id', 'status'], {
      name: 'idx_cards_user_status'
    });
    
    await queryInterface.addIndex('cards', ['created_at'], {
      name: 'idx_cards_created_at'
    });
    
    // 市場數據索引優化
    await queryInterface.addIndex('market_data', ['timestamp'], {
      name: 'idx_market_data_timestamp'
    });
    
    // 投資記錄索引優化
    await queryInterface.addIndex('investments', ['user_id', 'created_at'], {
      name: 'idx_investments_user_date'
    });
    
    // 用戶表索引優化
    await queryInterface.addIndex('users', ['email'], {
      name: 'idx_users_email',
      unique: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('cards', 'idx_cards_user_status');
    await queryInterface.removeIndex('cards', 'idx_cards_created_at');
    await queryInterface.removeIndex('market_data', 'idx_market_data_timestamp');
    await queryInterface.removeIndex('investments', 'idx_investments_user_date');
    await queryInterface.removeIndex('users', 'idx_users_email');
  }
};
EOF

# 4. 執行數據庫遷移
echo "🔄 執行數據庫遷移..."
npm run db:migrate

# 5. 測試查詢效能
echo "🧪 測試查詢效能..."
npm run test:query-performance

# 6. 生成查詢分析報告
echo "📊 生成查詢分析報告..."
npm run db:query-analysis

echo "✅ 第二階段數據庫優化完成！"
echo "📋 下一步：API 路由優化"
