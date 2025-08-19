import { CardCondition, CardRarity, CardType } from '../types';

// 日期格式化
export const formatDate = (
  date: Date | string,
  format: 'short' | 'long' | 'relative' = 'short'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (format === 'relative') {
    return formatRelativeDate(dateObj);
  }

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: format === 'long' ? 'long' : 'short',
    day: 'numeric'
  };

  return dateObj.toLocaleDateString('zh-TW', options);
};

export const formatRelativeDate = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return '今天';
  } else if (diffInDays === 1) {
    return '昨天';
  } else if (diffInDays < 7) {
    return `${diffInDays} 天前`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} 週前`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `${months} 個月前`;
  }
  const years = Math.floor(diffInDays / 365);
  return `${years} 年前`;

};

// 價格格式化
export const formatPrice = (price: number, currency: string = 'TWD'): string => {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(price);
};

// 貨幣格式化（簡化版本）
export const formatCurrency = (amount: number, currency: string = 'TWD'): string => {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatPriceChange = (change: number, currency: string = 'TWD'): string => {
  const sign = change >= 0 ? '+' : '';
  const formattedChange = formatPrice(Math.abs(change), currency);
  return `${sign}${formattedChange}`;
};

export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
};

// 數字格式化
export const formatNumber = (num: number, decimals: number = 0): string => {
  return new Intl.NumberFormat('zh-TW', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
};

export const formatCompactNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

// 卡牌相關格式化
export const formatCardCondition = (condition: CardCondition): string => {
  const conditionMap: Record<CardCondition, string> = {
    'mint': '全新',
    'near-mint': '近全新',
    'excellent': '極佳',
    'good': '良好',
    'light-played': '輕度使用',
    'played': '使用過',
    'poor': '破損'
  };
  return conditionMap[condition] || condition;
};

export const formatCardRarity = (rarity: CardRarity): string => {
  const rarityMap: Record<CardRarity, string> = {
    'common': '普通',
    'uncommon': '非普通',
    'rare': '稀有',
    'mythic': '神話',
    'special': '特殊',
    'promo': '促銷'
  };
  return rarityMap[rarity] || rarity;
};

export const formatCardType = (type: CardType): string => {
  const typeMap: Record<CardType, string> = {
    'creature': '生物',
    'spell': '法術',
    'artifact': '神器',
    'land': '地',
    'enchantment': '結界',
    'instant': '瞬間',
    'sorcery': '巫術',
    'planeswalker': '鵬洛客'
  };
  return typeMap[type] || type;
};

// 時間格式化
export const formatTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return `${formatDate(dateObj)} ${formatTime(dateObj)}`;
};

// 檔案大小格式化
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))  } ${  sizes[i]}`;
};

// 持續時間格式化
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}秒`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}分鐘`;
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}小時${minutes}分鐘`;

};
