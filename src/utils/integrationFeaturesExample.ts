import { socialMediaIntegrationService } from '../services/socialMediaIntegrationService';
import { cardGameSupportService } from '../services/cardGameSupportService';
import { logger } from './logger';

export class IntegrationFeaturesExample {
  /**
   * 社交媒體集成示例
   */
  static async socialMediaIntegrationExample() {
    try {
      logger.info('=== 社交媒體集成示例開始 ===');

      // 初始化服務
      await socialMediaIntegrationService.initialize();

      // 獲取所有平台
      const platforms = await socialMediaIntegrationService.getAllPlatforms();
      logger.info(
        '支持的社交媒體平台:',
        platforms.map((p) => p.name)
      );

      // 連接Twitter賬戶
      const twitterAccount = await socialMediaIntegrationService.connectAccount(
        'user123',
        'twitter',
        {
          userId: 'twitter_user_456',
          username: 'cardcollector',
          displayName: 'Card Collector',
          avatar: 'https://example.com/avatar.jpg',
          profileUrl: 'https://twitter.com/cardcollector',
          isVerified: true,
          permissions: ['read', 'write'],
          metadata: { followers: 1000 },
        }
      );
      logger.info('Twitter賬戶連接成功:', twitterAccount.username);

      // 發布內容到Twitter
      const post = await socialMediaIntegrationService.publishPost('user123', {
        platformId: 'twitter',
        content: {
          text: '剛剛掃描了一張稀有的Pokemon卡片！🔥 #PokemonTCG #CardCollector',
          hashtags: ['PokemonTCG', 'CardCollector', 'RareCards'],
        },
        type: 'text',
        visibility: 'public',
      });
      logger.info('內容發布成功:', post.id);

      // 分享內容到Facebook
      const share = await socialMediaIntegrationService.shareContent(
        'user123',
        {
          platformId: 'facebook',
          originalPostId: post.id,
          content: {
            text: '看看我的新收藏！',
            hashtags: ['CardCollection', 'TradingCards'],
          },
        }
      );
      logger.info('內容分享成功:', share.id);

      // 獲取社交媒體分析
      const analytics = await socialMediaIntegrationService.getAnalytics(
        'user123',
        'twitter',
        'month'
      );
      logger.info('社交媒體分析:', analytics.metrics);

      logger.info('=== 社交媒體集成示例完成 ===');
    } catch (error) {
      logger.error('社交媒體集成示例失敗:', error);
    }
  }

  /**
   * 卡片遊戲支持示例
   */
  static async cardGameSupportExample() {
    try {
      logger.info('=== 卡片遊戲支持示例開始 ===');

      // 初始化服務
      await cardGameSupportService.initialize();

      // 獲取所有支持的遊戲
      const games = await cardGameSupportService.getAllGames();
      logger.info(
        '支持的卡片遊戲:',
        games.map((g) => g.name)
      );

      // 創建Pokemon牌組
      const pokemonDeck = await cardGameSupportService.createDeck('user123', {
        gameId: 'pokemon',
        name: '我的第一副Pokemon牌組',
        description: '包含我最喜歡的Pokemon卡片',
        cards: ['card1', 'card2', 'card3'], // 卡片ID列表
        format: 'Standard',
        isPublic: true,
        isCompetitive: false,
      });
      logger.info('Pokemon牌組創建成功:', pokemonDeck.name);

      // 創建Yu-Gi-Oh!牌組
      const yugiohDeck = await cardGameSupportService.createDeck('user123', {
        gameId: 'yugioh',
        name: '藍眼白龍牌組',
        description: '經典的藍眼白龍主題牌組',
        cards: ['card4', 'card5', 'card6'],
        format: 'Advanced',
        isPublic: true,
        isCompetitive: true,
      });
      logger.info('Yu-Gi-Oh!牌組創建成功:', yugiohDeck.name);

      // 創建ONE PIECE牌組
      const onePieceDeck = await cardGameSupportService.createDeck('user123', {
        gameId: 'onepiece',
        name: '草帽海賊團牌組',
        description: '以路飛為首的草帽海賊團主題牌組',
        cards: ['card7', 'card8', 'card9'],
        format: 'Standard',
        isPublic: true,
        isCompetitive: true,
      });
      logger.info('ONE PIECE牌組創建成功:', onePieceDeck.name);

      // 創建錦標賽
      const tournament = await cardGameSupportService.createTournament({
        gameId: 'pokemon',
        name: 'Pokemon TCG 春季錦標賽',
        description: '歡迎所有Pokemon TCG愛好者參加',
        format: 'Standard',
        startDate: new Date('2024-04-01'),
        endDate: new Date('2024-04-02'),
        entryFee: 50,
        prizePool: 1000,
        maxParticipants: 32,
      });
      logger.info('錦標賽創建成功:', tournament.name);

      // 報名錦標賽
      const participant = await cardGameSupportService.joinTournament(
        tournament.id,
        'user123',
        pokemonDeck.id
      );
      logger.info('錦標賽報名成功:', participant.id);

      // 獲取遊戲排行榜
      const rankings = await cardGameSupportService.getGameRankings(
        'pokemon',
        '2024-Spring'
      );
      logger.info('Pokemon排行榜:', rankings.slice(0, 5));

      // 獲取遊戲分析
      const analytics = await cardGameSupportService.getGameAnalytics(
        'user123',
        'pokemon',
        'month'
      );
      logger.info('Pokemon遊戲分析:', analytics.stats);

      // 獲取ONE PIECE遊戲分析
      const onePieceAnalytics = await cardGameSupportService.getGameAnalytics(
        'user123',
        'onepiece',
        'month'
      );
      logger.info('ONE PIECE遊戲分析:', onePieceAnalytics.stats);

      logger.info('=== 卡片遊戲支持示例完成 ===');
    } catch (error) {
      logger.error('卡片遊戲支持示例失敗:', error);
    }
  }

  /**
   * 綜合集成示例
   */
  static async comprehensiveIntegrationExample() {
    try {
      logger.info('=== 綜合集成示例開始 ===');

      // 初始化所有服務
      await Promise.all([
        socialMediaIntegrationService.initialize(),
        cardGameSupportService.initialize(),
      ]);

      // 創建卡片遊戲牌組
      const deck = await cardGameSupportService.createDeck('user123', {
        gameId: 'mtg',
        name: '藍色控制牌組',
        description: '經典的藍色控制策略',
        cards: ['card7', 'card8', 'card9'],
        format: 'Modern',
        isPublic: true,
        isCompetitive: true,
      });

      // 在社交媒體上分享牌組
      const post = await socialMediaIntegrationService.publishPost('user123', {
        platformId: 'twitter',
        content: {
          text: `剛剛創建了一副新的MTG牌組：${deck.name}！大家覺得怎麼樣？`,
          hashtags: ['MTG', 'MagicTheGathering', 'DeckBuilding'],
        },
        type: 'text',
        visibility: 'public',
      });

      // 在LinkedIn上分享專業內容
      const linkedinPost = await socialMediaIntegrationService.publishPost(
        'user123',
        {
          platformId: 'linkedin',
          content: {
            text: '分享我的MTG牌組構建經驗和策略分析。這副藍色控制牌組在現代賽制中表現出色。',
            hashtags: ['MTG', 'Strategy', 'Gaming'],
          },
          type: 'text',
          visibility: 'public',
        }
      );

      // 創建社交媒體活動
      const campaign = await socialMediaIntegrationService.createCampaign(
        'user123',
        {
          name: 'MTG牌組分享活動',
          description: '分享你的MTG牌組，獲得社區反饋',
          platforms: ['twitter', 'facebook', 'linkedin'],
          content: {
            text: '分享你的MTG牌組構建！使用標籤 #MTGDeckShare 參與活動',
            hashtags: ['MTGDeckShare', 'MTG', 'DeckBuilding'],
          },
          schedule: {
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            frequency: 'daily',
            timeSlots: ['09:00', '18:00'],
          },
        }
      );

      logger.info('綜合集成示例完成');
      logger.info('創建的牌組:', deck.name);
      logger.info('發布的推文:', post.id);
      logger.info('LinkedIn帖子:', linkedinPost.id);
      logger.info('社交媒體活動:', campaign.name);

      logger.info('=== 綜合集成示例完成 ===');
    } catch (error) {
      logger.error('綜合集成示例失敗:', error);
    }
  }

  /**
   * 運行所有示例
   */
  static async runAllExamples() {
    try {
      logger.info('開始運行所有集成功能示例...');

      await this.socialMediaIntegrationExample();
      await this.cardGameSupportExample();
      await this.comprehensiveIntegrationExample();

      logger.info('所有集成功能示例運行完成！');
    } catch (error) {
      logger.error('運行示例時發生錯誤:', error);
    }
  }

  /**
   * 清理資源
   */
  static cleanup() {
    logger.info('清理集成功能示例資源...');
    // 這裡可以添加清理邏輯
  }
}

export default IntegrationFeaturesExample;
