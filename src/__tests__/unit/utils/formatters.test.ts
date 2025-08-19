import {
  formatDate,
  formatPrice,
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatFileSize,
  formatDuration,
  formatRelativeTime,
  formatCardName,
  formatCardCondition
} from '@/utils/formatters';

describe('Formatters', () => {
  describe('formatDate', () => {
    it('應該正確格式化日期', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatDate(date);
      expect(result).toBe('2024-01-15');
    });

    it('應該正確格式化日期字符串', () => {
      const dateString = '2024-01-15T10:30:00Z';
      const result = formatDate(dateString);
      expect(result).toBe('2024-01-15');
    });

    it('應該處理無效日期', () => {
      const invalidDate = 'invalid-date';
      const result = formatDate(invalidDate);
      expect(result).toBe('Invalid Date');
    });

    it('應該支持自定義格式', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatDate(date, 'yyyy/MM/dd');
      expect(result).toBe('2024/01/15');
    });
  });

  describe('formatPrice', () => {
    it('應該正確格式化價格', () => {
      expect(formatPrice(100)).toBe('$100.00');
      expect(formatPrice(99.99)).toBe('$99.99');
      expect(formatPrice(0)).toBe('$0.00');
    });

    it('應該處理小數點', () => {
      expect(formatPrice(100.5)).toBe('$100.50');
      expect(formatPrice(100.55)).toBe('$100.55');
      expect(formatPrice(100.555)).toBe('$100.56');
    });

    it('應該處理大數字', () => {
      expect(formatPrice(1000000)).toBe('$1,000,000.00');
      expect(formatPrice(1234567.89)).toBe('$1,234,567.89');
    });

    it('應該支持不同貨幣', () => {
      expect(formatPrice(100, 'EUR')).toBe('€100.00');
      expect(formatPrice(100, 'JPY')).toBe('¥100');
      expect(formatPrice(100, 'CNY')).toBe('¥100.00');
    });

    it('應該處理負數', () => {
      expect(formatPrice(-100)).toBe('-$100.00');
      expect(formatPrice(-99.99)).toBe('-$99.99');
    });
  });

  describe('formatNumber', () => {
    it('應該正確格式化數字', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
      expect(formatNumber(1234567)).toBe('1,234,567');
    });

    it('應該處理小數', () => {
      expect(formatNumber(1000.5)).toBe('1,000.5');
      expect(formatNumber(1000.55)).toBe('1,000.55');
      expect(formatNumber(1000.555)).toBe('1,000.56');
    });

    it('應該處理零和負數', () => {
      expect(formatNumber(0)).toBe('0');
      expect(formatNumber(-1000)).toBe('-1,000');
    });

    it('應該支持自定義小數位數', () => {
      expect(formatNumber(1000.555, 1)).toBe('1,000.6');
      expect(formatNumber(1000.555, 3)).toBe('1,000.555');
    });
  });

  describe('formatCurrency', () => {
    it('應該正確格式化貨幣', () => {
      expect(formatCurrency(100, 'USD')).toBe('$100.00');
      expect(formatCurrency(100, 'EUR')).toBe('€100.00');
      expect(formatCurrency(100, 'JPY')).toBe('¥100');
    });

    it('應該處理不同貨幣的小數位數', () => {
      expect(formatCurrency(100.5, 'USD')).toBe('$100.50');
      expect(formatCurrency(100.5, 'JPY')).toBe('¥101');
    });

    it('應該處理負數', () => {
      expect(formatCurrency(-100, 'USD')).toBe('-$100.00');
      expect(formatCurrency(-100, 'EUR')).toBe('-€100.00');
    });

    it('應該處理無效貨幣代碼', () => {
      expect(formatCurrency(100, 'INVALID')).toBe('$100.00'); // 默認使用 USD
    });
  });

  describe('formatPercentage', () => {
    it('應該正確格式化百分比', () => {
      expect(formatPercentage(0.5)).toBe('50%');
      expect(formatPercentage(0.123)).toBe('12.3%');
      expect(formatPercentage(1)).toBe('100%');
      expect(formatPercentage(0)).toBe('0%');
    });

    it('應該處理負數', () => {
      expect(formatPercentage(-0.5)).toBe('-50%');
      expect(formatPercentage(-0.123)).toBe('-12.3%');
    });

    it('應該支持自定義小數位數', () => {
      expect(formatPercentage(0.1234, 2)).toBe('12.34%');
      expect(formatPercentage(0.1234, 0)).toBe('12%');
    });

    it('應該處理大於1的數值', () => {
      expect(formatPercentage(1.5)).toBe('150%');
      expect(formatPercentage(2)).toBe('200%');
    });
  });

  describe('formatFileSize', () => {
    it('應該正確格式化文件大小', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });

    it('應該處理小文件', () => {
      expect(formatFileSize(500)).toBe('500 B');
      expect(formatFileSize(0)).toBe('0 B');
    });

    it('應該處理大文件', () => {
      expect(formatFileSize(1024 * 1024 * 1024 * 1024)).toBe('1 TB');
    });

    it('應該處理小數', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(1024 * 1024 * 1.5)).toBe('1.5 MB');
    });

    it('應該支持自定義小數位數', () => {
      expect(formatFileSize(1536, 2)).toBe('1.50 KB');
      expect(formatFileSize(1536, 0)).toBe('2 KB');
    });
  });

  describe('formatDuration', () => {
    it('應該正確格式化持續時間', () => {
      expect(formatDuration(60)).toBe('1:00');
      expect(formatDuration(90)).toBe('1:30');
      expect(formatDuration(3661)).toBe('1:01:01');
    });

    it('應該處理短時間', () => {
      expect(formatDuration(30)).toBe('0:30');
      expect(formatDuration(0)).toBe('0:00');
    });

    it('應該處理長時間', () => {
      expect(formatDuration(3600)).toBe('1:00:00');
      expect(formatDuration(3661)).toBe('1:01:01');
    });

    it('應該支持顯示小時', () => {
      expect(formatDuration(3600, true)).toBe('1:00:00');
      expect(formatDuration(60, true)).toBe('0:01:00');
    });
  });

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-15T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('應該正確格式化相對時間', () => {
      const now = new Date('2024-01-15T12:00:00Z');
      const oneMinuteAgo = new Date('2024-01-15T11:59:00Z');
      const oneHourAgo = new Date('2024-01-15T11:00:00Z');
      const oneDayAgo = new Date('2024-01-14T12:00:00Z');

      expect(formatRelativeTime(oneMinuteAgo)).toBe('1分鐘前');
      expect(formatRelativeTime(oneHourAgo)).toBe('1小時前');
      expect(formatRelativeTime(oneDayAgo)).toBe('1天前');
    });

    it('應該處理未來時間', () => {
      const oneMinuteLater = new Date('2024-01-15T12:01:00Z');
      const oneHourLater = new Date('2024-01-15T13:00:00Z');

      expect(formatRelativeTime(oneMinuteLater)).toBe('1分鐘後');
      expect(formatRelativeTime(oneHourLater)).toBe('1小時後');
    });

    it('應該處理邊界情況', () => {
      const now = new Date('2024-01-15T12:00:00Z');
      expect(formatRelativeTime(now)).toBe('剛剛');
    });
  });

  describe('formatCardName', () => {
    it('應該正確格式化卡片名稱', () => {
      expect(formatCardName('Blue-Eyes White Dragon')).toBe('Blue-Eyes White Dragon');
      expect(formatCardName('blue-eyes white dragon')).toBe('Blue-Eyes White Dragon');
    });

    it('應該處理特殊字符', () => {
      expect(formatCardName('dark magician')).toBe('Dark Magician');
      expect(formatCardName('red-eyes b. dragon')).toBe('Red-Eyes B. Dragon');
    });

    it('應該處理空字符串', () => {
      expect(formatCardName('')).toBe('');
    });

    it('應該處理單詞', () => {
      expect(formatCardName('dragon')).toBe('Dragon');
    });
  });

  describe('formatCardCondition', () => {
    it('應該正確格式化卡片條件', () => {
      expect(formatCardCondition('NM')).toBe('近全新');
      expect(formatCardCondition('LP')).toBe('輕度使用');
      expect(formatCardCondition('MP')).toBe('中度使用');
      expect(formatCardCondition('HP')).toBe('重度使用');
      expect(formatCardCondition('DMG')).toBe('損壞');
    });

    it('應該處理小寫條件', () => {
      expect(formatCardCondition('nm')).toBe('近全新');
      expect(formatCardCondition('lp')).toBe('輕度使用');
    });

    it('應該處理未知條件', () => {
      expect(formatCardCondition('UNKNOWN')).toBe('未知');
      expect(formatCardCondition('')).toBe('未知');
    });

    it('應該處理數字條件', () => {
      expect(formatCardCondition('10')).toBe('10分');
      expect(formatCardCondition('9')).toBe('9分');
      expect(formatCardCondition('1')).toBe('1分');
    });
  });

  describe('Edge Cases', () => {
    it('應該處理 null 和 undefined 值', () => {
      expect(formatPrice(null as any)).toBe('$0.00');
      expect(formatPrice(undefined as any)).toBe('$0.00');
      expect(formatNumber(null as any)).toBe('0');
      expect(formatNumber(undefined as any)).toBe('0');
    });

    it('應該處理極端數值', () => {
      expect(formatPrice(Number.MAX_SAFE_INTEGER)).toBe('$9,007,199,254,740,991.00');
      expect(formatPrice(Number.MIN_SAFE_INTEGER)).toBe('-$9,007,199,254,740,991.00');
      expect(formatNumber(Number.MAX_SAFE_INTEGER)).toBe('9,007,199,254,740,991');
    });

    it('應該處理 NaN 值', () => {
      expect(formatPrice(NaN)).toBe('$0.00');
      expect(formatNumber(NaN)).toBe('0');
      expect(formatPercentage(NaN)).toBe('0%');
    });

    it('應該處理無限值', () => {
      expect(formatPrice(Infinity)).toBe('$∞');
      expect(formatPrice(-Infinity)).toBe('-$∞');
      expect(formatNumber(Infinity)).toBe('∞');
      expect(formatNumber(-Infinity)).toBe('-∞');
    });
  });

  describe('Performance', () => {
    it('應該高效處理大量數據', () => {
      const startTime = performance.now();

      for (let i = 0; i < 1000; i++) {
        formatPrice(Math.random() * 10000);
        formatNumber(Math.random() * 1000000);
        formatPercentage(Math.random());
      }

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100); // 應該在100ms內完成
    });
  });
});
