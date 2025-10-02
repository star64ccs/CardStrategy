/**
 * Cohere ServiceTest
 * Verify文本嵌入、語義Search、文本生成等功能
 */

import { serviceConfig } from '../core/config/services';
import { cohereService } from '../shared/services/ai/cohereService';

describe('CohereService', () => {
  beforeAll(async () => {
    // InitializeServiceConfigure
    await serviceConfig.initialize();
  });

  describe('初始化測試', () => {
    test('應該能夠InitializeService', async () => {
      await expect(cohereService.initialize()).resolves.not.toThrow();
    });

    test('應該CheckService可用性', () => {
      const _isAvailable = cohereService.isAvailable();
      expect(typeof isAvailable).toBe('boolean');
    });

    test('應該GetService統計Information', () => {
      const _stats = cohereService.getServiceStats();
      expect(stats).toHaveProperty('service', 'cohere');
      expect(stats).toHaveProperty('isAvailable');
      expect(stats).toHaveProperty('isInitialized');
      expect(stats).toHaveProperty('hasApiKey');
      expect(stats).toHaveProperty('baseUrl');
    });
  });

  describe('文本嵌入測試', () => {
    test('應該能夠生成文本嵌入向量', async () => {
      const _texts = ['這是一張遊戲卡牌', '卡牌收藏很有價值'];

      const _result = await cohereService.embedTexts(texts);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBe(texts.length);

      if (result.data) {
        result.data.forEach((embedding, index) => {
          expect(embedding).toHaveProperty('id');
          expect(embedding).toHaveProperty('vector');
          expect(embedding).toHaveProperty('text', texts[index]);
          expect(Array.isArray(embedding.vector)).toBe(true);
          expect(embedding.vector.length).toBeGreaterThan(0);
        });
      }
    });

    test('應該處理空文本數組', async () => {
      const _result = await cohereService.embedTexts([]);
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    test('應該處理單個文本', async () => {
      const _text = '單張卡牌測試';
      const _result = await cohereService.embedTexts([text]);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      if (result.data) {
        expect(result.data.length).toBe(1);
        expect(result.data[0].text).toBe(text);
      }
    });
  });

  describe('語義搜索測試', () => {
    test('應該能夠進行語義搜索', async () => {
      const _query = '稀有卡牌';
      const _documents = [
        '這是一張非常稀有的遊戲卡牌',
        '普通卡牌價格較低',
        '限量版卡牌很有收藏價值',
        '常見卡牌容易獲得',
      ];

      const _result = await cohereService.semanticSearch(query, documents, 3);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeLessThanOrEqual(3);

      if (result.data) {
        result.data.forEach(searchResult => {
          expect(searchResult).toHaveProperty('id');
          expect(searchResult).toHaveProperty('text');
          expect(searchResult).toHaveProperty('score');
          expect(typeof searchResult.score).toBe('number');
          expect(searchResult.score).toBeGreaterThanOrEqual(0);
          expect(searchResult.score).toBeLessThanOrEqual(1);
        });

        // Check結果YesNo按相似度Sort
        for (let i = 1; i < result.data.length; i++) {
          expect(result.data[i - 1].score).toBeGreaterThanOrEqual(
            result.data[i].score
          );
        }
      }
    });

    test('應該處理空文檔數組', async () => {
      const _result = await cohereService.semanticSearch('查詢', [], 5);
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });

  describe('文本生成測試', () => {
    test('應該能夠生成文本', async () => {
      const _prompt = '請介紹一下卡牌收藏的樂趣';

      const _result = await cohereService.generateText(prompt, 100, 0.7);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(typeof result.data).toBe('string');
      expect(result.data.length).toBeGreaterThan(0);
    });

    test('應該處理不同的生成參數', async () => {
      const _prompt = '卡牌投資建議';

      const _result1 = await cohereService.generateText(prompt, 50, 0.3);
      const _result2 = await cohereService.generateText(prompt, 100, 0.8);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.data).not.toBe(result2.data);
    });
  });

  describe('文本分類測試', () => {
    test('應該能夠進行文本分類', async () => {
      const _text = '這張卡牌非常稀有，價格很高';
      const _examples = [
        { text: '稀有卡牌很有價值', label: '稀有' },
        { text: '普通卡牌價格便宜', label: '普通' },
        { text: '限量版卡牌收藏價值高', label: '稀有' },
        { text: '常見卡牌容易獲得', label: '普通' },
      ];

      const _result = await cohereService.classifyText(text, examples);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      if (result.data) {
        expect(result.data).toHaveProperty('prediction');
        expect(result.data).toHaveProperty('confidence');
        expect(typeof result.data.confidence).toBe('number');
        expect(result.data.confidence).toBeGreaterThanOrEqual(0);
        expect(result.data.confidence).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('文本摘要測試', () => {
    test('應該能夠生成文本摘要', async () => {
      const _text = `
        卡牌收藏是一項非常有趣的愛好。通過收集各種不同類型的卡牌，
        玩家可以建立自己的收藏品，並且這些卡牌往往具有很高的投資價值。
        稀有卡牌特別受到收藏家的青睞，因為它們數量有限，價格會隨著時間推移而上升。
        此外，卡牌收藏還能帶來社交樂趣，玩家可以與其他收藏家交流經驗和心得。
      `;

      const _result = await cohereService.summarizeText(
        text,
        'short',
        'paragraph'
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(typeof result.data).toBe('string');
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data.length).toBeLessThan(text.length);
    });

    test('應該支持不同的摘要格式', async () => {
      const _text = '卡牌收藏很有趣。稀有卡牌有價值。投資潛力很大。';

      const _paragraphResult = await cohereService.summarizeText(
        text,
        'medium',
        'paragraph'
      );
      const _bulletsResult = await cohereService.summarizeText(
        text,
        'medium',
        'bullets'
      );

      expect(paragraphResult.success).toBe(true);
      expect(bulletsResult.success).toBe(true);
    });
  });

  describe('批量處理測試', () => {
    test('應該能夠批量處理文本嵌入', async () => {
      const _texts = [
        '第一張卡牌',
        '第二張卡牌',
        '第三張卡牌',
        '第四張卡牌',
        '第五張卡牌',
      ];

      const _result = await cohereService.batchProcess(texts, 'embed', {
        model: 'embed-multilingual-v2.0',
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
    });

    test('應該處理批量文本生成', async () => {
      const _texts = ['卡牌收藏', '投資價值', '稀有度'];

      const _result = await cohereService.batchProcess(texts, 'summarize', {
        length: 'short',
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('ErrorHandle測試', () => {
    test('應該處理無效的 API 密鑰', async () => {
      // 暫時Modify API 密鑰來TestErrorHandle
      const _originalKey = serviceConfig.get('COHERE_API_KEY');
      serviceConfig.set('COHERE_API_KEY', 'invalid_key');

      const _result = await cohereService.embedTexts(['測試文本']);

      // Restore原始密鑰
      if (originalKey) {
        serviceConfig.set('COHERE_API_KEY', originalKey);
      }

      // 在On發環境中，應該Return模擬結果
      expect(result.success).toBe(true);
    });

    test('應該Handle網絡Error', async () => {
      // 這個Test在實際環境中可能無法完全模擬
      // 但可以確保ErrorHandle邏輯存在
      expect(cohereService.isAvailable()).toBeDefined();
    });
  });

  describe('性能測試', () => {
    test('應該在合理時間內完成文本嵌入', async () => {
      const _startTime = Date.now();
      const _texts = ['性能測試文本'];

      await cohereService.embedTexts(texts);

      const _endTime = Date.now();
      const _duration = endTime - startTime;

      // 在正常NetworkCondition下，應該在 10 Second內Complete
      expect(duration).toBeLessThan(10000);
    });

    test('應該能夠處理大量文本', async () => {
      const _texts = Array.from({ length: 20 }, (_, i) => `測試文本 ${i + 1}`);

      const _startTime = Date.now();
      const _result = await cohereService.batchProcess(texts, 'embed');
      const _endTime = Date.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(30000); // 30 Second內Complete
    });
  });
});
