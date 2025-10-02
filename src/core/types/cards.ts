import type { BaseEntity } from './common';

// 卡牌相OffClass型
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
  conditionAnalysis?: AnalysisResult[]; // AddConditionAnalysis
  authenticityCheck?: AnalysisResult[]; // AddTrue偽Check
  // Add缺失的Property
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

// 收藏相OffClass型
export interface Collection extends BaseEntity {
  userId: string;
  name: string;
  description?: string;
  isPublic: boolean;
  cards: CollectionCard[];
  items: CollectionItem[]; // Add items Property
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

// 收藏項目Class型
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
  currentValue: number; // Add當前價Value
  addedAt: Date; // AddAddTime
}

// 卡牌Filter和SortClass型
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
  set?: string[]; // Add set Property
}

export interface CardSortOptions {
  field: 'name' | 'price' | 'rarity' | 'set' | 'condition' | 'dateAdded';
  order: 'asc' | 'desc';
  direction?: 'asc' | 'desc'; // Add direction Property
}

// PaginateClass型
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Redux 卡片StatusClass型
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

// Component Props Class型
export interface CardProps {
  card: Card;
  onPress?: () => void;
  showPrice?: boolean;
  showCondition?: boolean;
  variant?: 'compact' | 'detailed' | 'grid';
}

// AI Analysis相OffClass型
export interface AnalysisResult {
  category: string;
  score: number;
  confidence: number;
  details: string;
  evidence: string[];
}

// ConstantClass型
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
