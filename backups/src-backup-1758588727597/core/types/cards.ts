import type { BaseEntity } from './common';

// 卡牌相關類型
export interface Card extends BaseEntity {
  name: string;
  setName: string;
  cardNumber: string;
  rarity: CardRarity;
  type: CardType;
  attributes: CardAttributes;
  marketData: MarketData;
  images: CardImages;
  metadata: CardMetadata;
  conditionAnalysis?: AnalysisResult[]; // 添加條件分析
  authenticityCheck?: AnalysisResult[]; // 添加真偽檢查
  // 添加缺失的屬性
  price?: number;
  currentPrice?: number; // 當前價格
  priceChange?: number; // 價格變化百分比
  condition?: CardCondition;
  set?: string;
  isFavorite?: boolean;
  imageUrl?: string;
  description?: string;
}

export type CardRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'mythic'
  | 'special'
  | 'promo';

export type CardType =
  | 'creature'
  | 'spell'
  | 'artifact'
  | 'land'
  | 'enchantment'
  | 'instant'
  | 'sorcery'
  | 'planeswalker';

export interface CardAttributes {
  manaCost?: string;
  power?: number;
  toughness?: number;
  loyalty?: number;
  text?: string;
  flavorText?: string;
  artist?: string;
  collectorNumber?: string;
}

export interface MarketData {
  currentPrice: number;
  priceHistory: PricePoint[];
  marketTrend: 'rising' | 'falling' | 'stable';
  volatility: number;
  demand: 'low' | 'medium' | 'high';
  supply: 'low' | 'medium' | 'high';
  lastUpdated: Date;
}

export interface PricePoint {
  date: Date;
  price: number;
  volume: number;
  source: string;
}

export interface CardImages {
  front: string;
  back?: string;
  art?: string;
  thumbnail: string;
}

export interface CardMetadata {
  game: string;
  set: string;
  language: string;
  condition: CardCondition;
  isFoil: boolean;
  isSigned: boolean;
  isGraded: boolean;
  grade?: string;
  gradeCompany?: string;
}

export type CardCondition =
  | 'mint'
  | 'near-mint'
  | 'excellent'
  | 'good'
  | 'light-played'
  | 'played'
  | 'poor';

// 收藏相關類型
export interface Collection extends BaseEntity {
  userId: string;
  name: string;
  description?: string;
  isPublic: boolean;
  cards: CollectionCard[];
  items: CollectionItem[]; // 添加 items 屬性
  statistics: CollectionStatistics;
  tags: string[];
}

export interface CollectionCard {
  cardId: string;
  quantity: number;
  condition: CardCondition;
  isFoil: boolean;
  purchasePrice?: number;
  purchaseDate?: Date;
  notes?: string;
  location?: string;
  isForSale: boolean;
  askingPrice?: number;
}

export interface CollectionStatistics {
  totalCards: number;
  totalValue: number;
  averageCondition: number;
  mostValuableCard?: string;
  recentAdditions: number;
  completionRate: number;
}

// 收藏項目類型
export interface CollectionItem {
  cardId: string;
  quantity: number;
  condition: CardCondition;
  isFoil: boolean;
  purchasePrice?: number;
  purchaseDate?: Date;
  notes?: string;
  location?: string;
  isForSale: boolean;
  askingPrice?: number;
  currentValue: number; // 添加當前價值
  addedAt: Date; // 添加添加時間
}

// 卡牌過濾和排序類型
export interface CardFilters {
  rarity?: CardRarity[];
  type?: CardType[];
  condition?: CardCondition[];
  priceRange?: {
    min: number;
    max: number;
  };
  setName?: string[];
  artist?: string[];
  isFoil?: boolean;
  isGraded?: boolean;
  inStock?: boolean;
  set?: string[]; // 添加 set 屬性
}

export interface CardSortOptions {
  field: 'name' | 'price' | 'rarity' | 'set' | 'condition' | 'dateAdded';
  order: 'asc' | 'desc';
  direction?: 'asc' | 'desc'; // 添加 direction 屬性
}

// 分頁類型
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Redux 卡片狀態類型
export interface CardState {
  cards: Card[];
  selectedCard: Card | null;
  isLoading: boolean;
  error: string | null;
  filters: CardFilters;
  sortOptions: CardSortOptions;
  pagination: Pagination;
  isRecognizing: boolean;
  recognizedCard: Card | null;
  recognitionResult: unknown | null;
  recognitionAlternatives: unknown[];
  recognitionFeatures: unknown | null;
  isAnalyzing: boolean;
  conditionAnalysis: AnalysisResult[] | null;
  authenticityCheck: AnalysisResult[] | null;
  isVerifying: boolean;
  searchResults: Card[];
  recognitionHistory: {
    card: Card;
    confidence: number;
    timestamp: string;
    processingTime: number;
  }[];
  recognitionStats: {
    totalRecognitions: number;
    averageConfidence: number;
    successRate: number;
    popularCards: { cardId: string; count: number }[];
    processingTimes: {
      average: number;
      min: number;
      max: number;
    };
  } | null;
}

export interface CollectionState {
  collections: Collection[];
  selectedCollection: Collection | null;
  isLoading: boolean;
  error: string | null;
  statistics: CollectionStatistics;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

// 組件 Props 類型
export interface CardProps {
  card: Card;
  onPress?: () => void;
  showPrice?: boolean;
  showCondition?: boolean;
  variant?: 'compact' | 'detailed' | 'grid';
}

// AI 分析相關類型
export interface AnalysisResult {
  category: string;
  score: number;
  confidence: number;
  details: string;
  evidence: string[];
}

// 常量類型
export const CARD_RARITIES: CardRarity[] = [
  'common',
  'uncommon',
  'rare',
  'mythic',
  'special',
  'promo',
];

export const CARD_TYPES: CardType[] = [
  'creature',
  'spell',
  'artifact',
  'land',
  'enchantment',
  'instant',
  'sorcery',
  'planeswalker',
];

export const CARD_CONDITIONS: CardCondition[] = [
  'mint',
  'near-mint',
  'excellent',
  'good',
  'light-played',
  'played',
  'poor',
];
