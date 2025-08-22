'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 添加測試用戶
    await queryInterface.bulkInsert(
      'Users',
      [
        {
          name: '測試用戶',
          email: 'test@cardstrategy.com',
          password:
            '$2b$10$rQZ8K9vL2mN3pO4qR5sT6uV7wX8yZ9aA0bB1cC2dE3fF4gG5hH6iI7jJ8kK9lL0mM1nN2oO3pP4qQ5rR6sS7tT8uU9vV0wW1xX2yY3zZ',
          role: 'user',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: '管理員',
          email: 'admin@cardstrategy.com',
          password:
            '$2b$10$rQZ8K9vL2mN3pO4qR5sT6uV7wX8yZ9aA0bB1cC2dE3fF4gG5hH6iI7jJ8kK9lL0mM1nN2oO3pP4qQ5rR6sS7tT8uU9vV0wW1xX2yY3zZ',
          role: 'admin',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );

    // 添加測試卡片
    await queryInterface.bulkInsert(
      'Cards',
      [
        {
          name: '青眼白龍',
          description: '傳說中的最強龍族卡片',
          rarity: 'UR',
          price: 9999.99,
          imageUrl: 'https://example.com/blue-eyes-white-dragon.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: '黑魔導',
          description: '強大的魔法師卡片',
          rarity: 'SR',
          price: 2999.99,
          imageUrl: 'https://example.com/dark-magician.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: '真紅眼黑龍',
          description: '傳說中的黑龍',
          rarity: 'UR',
          price: 7999.99,
          imageUrl: 'https://example.com/red-eyes-black-dragon.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    // 刪除測試數據
    await queryInterface.bulkDelete('Collections', null, {});
    await queryInterface.bulkDelete('Cards', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  },
};
