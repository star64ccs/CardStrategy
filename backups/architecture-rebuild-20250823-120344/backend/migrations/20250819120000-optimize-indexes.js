'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => { // eslint-disable-next-line no-unused-vars
    // logger.info('🔧 開始創建索引優化...');

    try {
      // 1. 為 cards 表添加索引
      // logger.info('📋 為 cards 表添加索引...');

      // 卡片名稱索引（用於搜索）
      await queryInterface.addIndex('cards', ['name'], {
        name: 'idx_cards_name',
        type: 'BTREE',
      });

      // 卡片類型索引
      await queryInterface.addIndex('cards', ['type'], {
        name: 'idx_cards_type',
        type: 'BTREE',
      });

      // 卡片稀有度索引
      await queryInterface.addIndex('cards', ['rarity'], {
        name: 'idx_cards_rarity',
        type: 'BTREE',
      });

      // 創建時間索引（用於排序）
      await queryInterface.addIndex('cards', ['created_at'], {
        name: 'idx_cards_created_at',
        type: 'BTREE',
      });

      // 複合索引：類型 + 稀有度
      await queryInterface.addIndex('cards', ['type', 'rarity'], {
        name: 'idx_cards_type_rarity',
        type: 'BTREE',
      });

      // 2. 為 market_data 表添加索引
      // logger.info('📈 為 market_data 表添加索引...');

      // 卡片ID索引
      await queryInterface.addIndex('market_data', ['card_id'], {
        name: 'idx_market_data_card_id',
        type: 'BTREE',
      });

      // 日期索引（用於時間範圍查詢）
      await queryInterface.addIndex('market_data', ['date'], {
        name: 'idx_market_data_date',
        type: 'BTREE',
      });

      // 價格索引（用於價格範圍查詢）
      await queryInterface.addIndex('market_data', ['price'], {
        name: 'idx_market_data_price',
        type: 'BTREE',
      });

      // 複合索引：卡片ID + 日期
      await queryInterface.addIndex('market_data', ['card_id', 'date'], {
        name: 'idx_market_data_card_date',
        type: 'BTREE',
      });

      // 3. 為 investments 表添加索引
      // logger.info('💰 為 investments 表添加索引...');

      // 用戶ID索引
      await queryInterface.addIndex('investments', ['user_id'], {
        name: 'idx_investments_user_id',
        type: 'BTREE',
      });

      // 卡片ID索引
      await queryInterface.addIndex('investments', ['card_id'], {
        name: 'idx_investments_card_id',
        type: 'BTREE',
      });

      // 投資日期索引
      await queryInterface.addIndex('investments', ['investment_date'], {
        name: 'idx_investments_date',
        type: 'BTREE',
      });

      // 複合索引：用戶ID + 卡片ID
      await queryInterface.addIndex('investments', ['user_id', 'card_id'], {
        name: 'idx_investments_user_card',
        type: 'BTREE',
      });

      // 4. 為 users 表添加索引
      // logger.info('👤 為 users 表添加索引...');

      // 用戶名索引
      await queryInterface.addIndex('users', ['username'], {
        name: 'idx_users_username',
        type: 'BTREE',
        unique: true,
      });

      // 郵箱索引
      await queryInterface.addIndex('users', ['email'], {
        name: 'idx_users_email',
        type: 'BTREE',
        unique: true,
      });

      // 創建時間索引
      await queryInterface.addIndex('users', ['created_at'], {
        name: 'idx_users_created_at',
        type: 'BTREE',
      });

      // 5. 為 collections 表添加索引
      // logger.info('📚 為 collections 表添加索引...');

      // 用戶ID索引
      await queryInterface.addIndex('collections', ['user_id'], {
        name: 'idx_collections_user_id',
        type: 'BTREE',
      });

      // 集合名稱索引
      await queryInterface.addIndex('collections', ['name'], {
        name: 'idx_collections_name',
        type: 'BTREE',
      });

      // 複合索引：用戶ID + 集合名稱
      await queryInterface.addIndex('collections', ['user_id', 'name'], {
        name: 'idx_collections_user_name',
        type: 'BTREE',
      });

      // 6. 為 collection_cards 表添加索引
      // logger.info('🃏 為 collection_cards 表添加索引...');

      // 集合ID索引
      await queryInterface.addIndex('collection_cards', ['collection_id'], {
        name: 'idx_collection_cards_collection_id',
        type: 'BTREE',
      });

      // 卡片ID索引
      await queryInterface.addIndex('collection_cards', ['card_id'], {
        name: 'idx_collection_cards_card_id',
        type: 'BTREE',
      });

      // 複合索引：集合ID + 卡片ID
      await queryInterface.addIndex(
        'collection_cards',
        ['collection_id', 'card_id'],
        {
          name: 'idx_collection_cards_collection_card',
          type: 'BTREE',
          unique: true,
        }
      );

      // logger.info('✅ 所有索引創建完成！');
    } catch (error) {
      // logger.info('❌ 索引創建失敗:', error.message);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => { // eslint-disable-next-line no-unused-vars
    // logger.info('🗑️ 開始移除索引...');

    try {
      // 移除所有創建的索引
      const indexes = [
        'idx_cards_name',
        'idx_cards_type',
        'idx_cards_rarity',
        'idx_cards_created_at',
        'idx_cards_type_rarity',
        'idx_market_data_card_id',
        'idx_market_data_date',
        'idx_market_data_price',
        'idx_market_data_card_date',
        'idx_investments_user_id',
        'idx_investments_card_id',
        'idx_investments_date',
        'idx_investments_user_card',
        'idx_users_username',
        'idx_users_email',
        'idx_users_created_at',
        'idx_collections_user_id',
        'idx_collections_name',
        'idx_collections_user_name',
        'idx_collection_cards_collection_id',
        'idx_collection_cards_card_id',
        'idx_collection_cards_collection_card',
      ];

      for (const indexName of indexes) {
        try {
          await queryInterface.removeIndex('cards', indexName);
        } catch (e) {
          // 索引可能不存在，繼續下一個
        }
      }

      // logger.info('✅ 所有索引移除完成！');
    } catch (error) {
      // logger.info('❌ 索引移除失敗:', error.message);
      throw error;
    }
  },
};
