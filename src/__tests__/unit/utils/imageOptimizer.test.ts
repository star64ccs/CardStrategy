import { ImageOptimizer, optimizeImage, getThumbnailUrl, getMediumUrl, getHighQualityUrl } from '@/utils/imageOptimizer';

describe('ImageOptimizer', () => {
  let imageOptimizer: ImageOptimizer;

  beforeEach(() => {
    imageOptimizer = ImageOptimizer.getInstance();
    imageOptimizer.clearCache();
  });

  describe('getInstance', () => {
    it('應該返回單例實例', () => {
      const instance1 = ImageOptimizer.getInstance();
      const instance2 = ImageOptimizer.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('optimizeImageUrl', () => {
    it('應該為圖片URL添加優化參數', () => {
      const originalUrl = 'https://example.com/image.jpg';
      const optimizedUrl = imageOptimizer.optimizeImageUrl(originalUrl, {
        quality: 80,
        width: 300,
        height: 200,
        format: 'webp'
      });

      expect(optimizedUrl).toContain('quality=80');
      expect(optimizedUrl).toContain('width=300');
      expect(optimizedUrl).toContain('height=200');
      expect(optimizedUrl).toContain('format=webp');
    });

    it('應該處理已經是優化URL的情況', () => {
      const optimizedUrl = 'https://example.com/image.jpg?quality=80&width=300';
      const result = imageOptimizer.optimizeImageUrl(optimizedUrl);
      expect(result).toBe(optimizedUrl);
    });

    it('應該使用默認參數', () => {
      const originalUrl = 'https://example.com/image.jpg';
      const optimizedUrl = imageOptimizer.optimizeImageUrl(originalUrl);

      expect(optimizedUrl).toContain('quality=85');
      expect(optimizedUrl).toContain('format=jpeg');
    });
  });

  describe('generateThumbnailUrl', () => {
    it('應該生成縮略圖URL', () => {
      const originalUrl = 'https://example.com/image.jpg';
      const thumbnailUrl = imageOptimizer.generateThumbnailUrl(originalUrl, 150);

      expect(thumbnailUrl).toContain('width=150');
      expect(thumbnailUrl).toContain('height=150');
      expect(thumbnailUrl).toContain('quality=70');
    });
  });

  describe('generateMediumUrl', () => {
    it('應該生成中等質量URL', () => {
      const originalUrl = 'https://example.com/image.jpg';
      const mediumUrl = imageOptimizer.generateMediumUrl(originalUrl, 600);

      expect(mediumUrl).toContain('width=600');
      expect(mediumUrl).toContain('quality=80');
    });
  });

  describe('generateHighQualityUrl', () => {
    it('應該生成高質量URL', () => {
      const originalUrl = 'https://example.com/image.jpg';
      const highQualityUrl = imageOptimizer.generateHighQualityUrl(originalUrl, 1200);

      expect(highQualityUrl).toContain('width=1200');
      expect(highQualityUrl).toContain('quality=95');
    });
  });

  describe('calculateOptimalSize', () => {
    it('應該計算最佳尺寸', () => {
      const result = imageOptimizer.calculateOptimalSize(1000, 800, 500, 400);

      expect(result.width).toBe(500);
      expect(result.height).toBe(400);
    });

    it('應該保持寬高比', () => {
      const result = imageOptimizer.calculateOptimalSize(1000, 800, 500);

      expect(result.width).toBe(500);
      expect(result.height).toBe(400);
    });
  });

  describe('preloadImage', () => {
    it('應該預加載圖片', async () => {
      const uri = 'https://example.com/image.jpg';
      const result = await imageOptimizer.preloadImage(uri);

      expect(typeof result).toBe('boolean');
    });
  });

  describe('preloadImages', () => {
    it('應該預加載多張圖片', async () => {
      const uris = [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg'
      ];

      const result = await imageOptimizer.preloadImages(uris);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('failed');
      expect(Array.isArray(result.success)).toBe(true);
      expect(Array.isArray(result.failed)).toBe(true);
    });
  });

  describe('cache management', () => {
    it('應該管理緩存', () => {
      const originalUrl = 'https://example.com/image.jpg';
      imageOptimizer.optimizeImageUrl(originalUrl);

      const stats = imageOptimizer.getCacheStats();
      expect(stats.size).toBeGreaterThan(0);
      expect(stats.entries).toBeGreaterThan(0);

      imageOptimizer.clearCache();
      const clearedStats = imageOptimizer.getCacheStats();
      expect(clearedStats.size).toBe(0);
      expect(clearedStats.entries).toBe(0);
    });
  });
});

describe('Utility functions', () => {
  describe('optimizeImage', () => {
    it('應該優化圖片URL', () => {
      const originalUrl = 'https://example.com/image.jpg';
      const optimizedUrl = optimizeImage(originalUrl, { quality: 80 });

      expect(optimizedUrl).toContain('quality=80');
    });
  });

  describe('getThumbnailUrl', () => {
    it('應該獲取縮略圖URL', () => {
      const originalUrl = 'https://example.com/image.jpg';
      const thumbnailUrl = getThumbnailUrl(originalUrl, 100);

      expect(thumbnailUrl).toContain('width=100');
      expect(thumbnailUrl).toContain('height=100');
    });
  });

  describe('getMediumUrl', () => {
    it('應該獲取中等質量URL', () => {
      const originalUrl = 'https://example.com/image.jpg';
      const mediumUrl = getMediumUrl(originalUrl, 500);

      expect(mediumUrl).toContain('width=500');
    });
  });

  describe('getHighQualityUrl', () => {
    it('應該獲取高質量URL', () => {
      const originalUrl = 'https://example.com/image.jpg';
      const highQualityUrl = getHighQualityUrl(originalUrl, 1000);

      expect(highQualityUrl).toContain('width=1000');
    });
  });
});
