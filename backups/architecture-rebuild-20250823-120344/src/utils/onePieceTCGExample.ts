import { cardGameSupportService } from '../services/cardGameSupportService';
import { socialMediaIntegrationService } from '../services/socialMediaIntegrationService';
import { logger } from './logger';

/**
 * ONE PIECE TCG 功能示例
 * 展示如何使用專案中的 ONE PIECE TCG 支持功能
 */
export class OnePieceTCGExample {
  /**
   * ONE PIECE TCG 基礎功能示例
   */
  static async basicOnePieceExample() {
    try {
      logger.info('=== ONE PIECE TCG 基礎功能示例開始 ===');

      // 初始化服務
      await cardGameSupportService.initialize();

      // 獲取ONE PIECE遊戲信息
      const onePieceGame = await cardGameSupportService.getGame('onepiece');
      if (onePieceGame) {
        logger.info('ONE PIECE TCG 遊戲信息:', {
          name: onePieceGame.name,
          publisher: onePieceGame.publisher,
          description: onePieceGame.description,
          features: onePieceGame.features,
          metadata: onePieceGame.metadata,
        });
      }

      // 創建路飛領導者牌組
      const luffyDeck = await cardGameSupportService.createDeck('user123', {
        gameId: 'onepiece',
        name: '路飛領導者牌組',
        description: '以蒙奇·D·路飛為領導者的草帽海賊團主題牌組',
        cards: [
          'luffy-leader' as any,
          'zoro-character' as any,
          'nami-character' as any,
          'usopp-character' as any,
        ],
        format: 'Standard',
        isPublic: true,
        isCompetitive: true,
      });
      logger.info('路飛領導者牌組創建成功:', { name: luffyDeck.name });

      // 創建索隆領導者牌組
      const zoroDeck = await cardGameSupportService.createDeck('user123', {
        gameId: 'onepiece',
        name: '索隆劍士牌組',
        description: '以羅羅諾亞·索隆為領導者的劍士主題牌組',
        cards: [
          'zoro-leader' as any,
          'mihawk-character' as any,
          'brook-character' as any,
          'sword-event' as any,
        ],
        format: 'Standard',
        isPublic: true,
        isCompetitive: true,
      });
      logger.info('索隆劍士牌組創建成功:', { name: zoroDeck.name });

      // 獲取用戶的所有ONE PIECE牌組
      const userDecks = await cardGameSupportService.getUserDecks(
        'user123',
        'onepiece'
      );
      logger.info(
        '用戶的ONE PIECE牌組:',
        userDecks.map(deck => deck.name)
      );

      logger.info('=== ONE PIECE TCG 基礎功能示例完成 ===');
    } catch (error) {
      logger.error('ONE PIECE TCG 基礎功能示例失敗:', error);
    }
  }

  /**
   * ONE PIECE TCG 錦標賽功能示例
   */
  static async onePieceTournamentExample() {
    try {
      logger.info('=== ONE PIECE TCG 錦標賽功能示例開始 ===');

      // 創建ONE PIECE錦標賽
      const tournament = await cardGameSupportService.createTournament({
        gameId: 'onepiece',
        name: 'ONE PIECE TCG 海賊王錦標賽',
        description: '歡迎所有海賊王粉絲參加的盛大錦標賽！',
        format: 'Standard',
        startDate: new Date('2024-05-01'),
        endDate: new Date('2024-05-02'),
        entryFee: 100,
        prizePool: 5000,
        maxParticipants: 64,
      });
      logger.info('ONE PIECE錦標賽創建成功:', { name: tournament.name });

      // 獲取ONE PIECE錦標賽列表
      const tournaments = await cardGameSupportService.getGameTournaments(
        'onepiece',
        'upcoming'
      );
      logger.info(
        '即將舉行的ONE PIECE錦標賽:',
        tournaments.map(t => t.name)
      );

      // 報名錦標賽
      const participant = await cardGameSupportService.joinTournament(
        tournament.id,
        'user123',
        'luffy-deck-id'
      );
      logger.info('錦標賽報名成功:', { id: participant.id });

      logger.info('=== ONE PIECE TCG 錦標賽功能示例完成 ===');
    } catch (error) {
      logger.error('ONE PIECE TCG 錦標賽功能示例失敗:', error);
    }
  }

  /**
   * ONE PIECE TCG 社交媒體集成示例
   */
  static async onePieceSocialMediaExample() {
    try {
      logger.info('=== ONE PIECE TCG 社交媒體集成示例開始 ===');

      // 初始化社交媒體服務
      await socialMediaIntegrationService.initialize();

      // 在Twitter上分享ONE PIECE牌組
      const post = await socialMediaIntegrationService.publishPost('user123', {
        platformId: 'twitter',
        content: {
          text: '剛剛創建了我的路飛領導者牌組！🏴‍☠️ #ONEPIECETCG #海賊王 #路飛',
          hashtags: ['ONEPIECETCG', '海賊王', '路飛', '草帽海賊團'],
        },
      });
      logger.info('Twitter帖子發布成功:', { id: post.id });

      // 在Facebook上分享ONE PIECE錦標賽信息
      const tournamentPost = await socialMediaIntegrationService.publishPost(
        'user123',
        {
          platformId: 'facebook',
          content: {
            text: 'ONE PIECE TCG 海賊王錦標賽即將開始！獎金池高達5000元！🏆',
            hashtags: ['ONEPIECETCG', '海賊王錦標賽', 'TCG比賽'],
          },
        }
      );
      logger.info('Facebook錦標賽帖子發布成功:', { id: tournamentPost.id });

      // 在Instagram上分享ONE PIECE卡片收藏
      const instagramPost = await socialMediaIntegrationService.publishPost(
        'user123',
        {
          platformId: 'instagram',
          content: {
            text: '我的ONE PIECE卡片收藏展示 📸 #ONEPIECETCG #卡片收藏',
            hashtags: ['ONEPIECETCG', '卡片收藏', '海賊王'],
          },
        }
      );
      logger.info('Instagram收藏帖子發布成功:', { id: instagramPost.id });

      logger.info('=== ONE PIECE TCG 社交媒體集成示例完成 ===');
    } catch (error) {
      logger.error('ONE PIECE TCG 社交媒體集成示例失敗:', error);
    }
  }

  /**
   * ONE PIECE TCG 分析功能示例
   */
  static async onePieceAnalyticsExample() {
    try {
      logger.info('=== ONE PIECE TCG 分析功能示例開始 ===');

      // 獲取ONE PIECE遊戲分析
      const analytics = await cardGameSupportService.getGameAnalytics(
        'user123',
        'onepiece',
        'month'
      );
      logger.info('ONE PIECE遊戲分析:', {
        totalGames: (analytics.stats as any).totalGames,
        winRate: analytics.stats.winRate,
        favoriteLeaders: (analytics.stats as any).favoriteLeaders,
        mostUsedCards: (analytics.stats as any).mostUsedCards,
      });

      // 獲取ONE PIECE排行榜
      const rankings = await cardGameSupportService.getGameRankings(
        'onepiece',
        '2024-Spring'
      );
      logger.info(
        'ONE PIECE排行榜前10名:',
        rankings.slice(0, 10).map(rank => ({
          rank: rank.rank,
          playerName: (rank as any).playerName,
          points: (rank as any).points,
        }))
      );

      // 獲取用戶在ONE PIECE中的排名
      const userRanking = await cardGameSupportService.getUserRanking(
        'user123',
        'onepiece',
        '2024-Spring'
      );
      if (userRanking) {
        logger.info('用戶ONE PIECE排名:', {
          rank: userRanking.rank,
          points: (userRanking as any).points,
          gamesPlayed: (userRanking as any).gamesPlayed,
          winRate: userRanking.winRate,
        });
      }

      logger.info('=== ONE PIECE TCG 分析功能示例完成 ===');
    } catch (error) {
      logger.error('ONE PIECE TCG 分析功能示例失敗:', error);
    }
  }

  /**
   * ONE PIECE TCG 綜合示例
   */
  static async comprehensiveOnePieceExample() {
    try {
      logger.info('=== ONE PIECE TCG 綜合示例開始 ===');

      // 執行所有ONE PIECE示例
      await this.basicOnePieceExample();
      await this.onePieceTournamentExample();
      await this.onePieceSocialMediaExample();
      await this.onePieceAnalyticsExample();

      logger.info('=== ONE PIECE TCG 綜合示例完成 ===');
    } catch (error) {
      logger.error('ONE PIECE TCG 綜合示例失敗:', error);
    }
  }

  /**
   * 運行所有ONE PIECE示例
   */
  static async runAllExamples() {
    try {
      logger.info('開始運行所有ONE PIECE TCG示例...');

      await this.comprehensiveOnePieceExample();

      logger.info('所有ONE PIECE TCG示例運行完成！');
    } catch (error) {
      logger.error('運行ONE PIECE TCG示例時發生錯誤:', error);
    }
  }

  /**
   * 清理示例數據
   */
  static cleanup() {
    logger.info('ONE PIECE TCG示例數據清理完成');
  }
}

export default OnePieceTCGExample;
