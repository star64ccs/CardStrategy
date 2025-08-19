export interface Card {
  id: string;
  name: string;
  setName: string;
  cardNumber: string;
  rarity: string;
  type: string;
  imageUrl: string;
  price: number;
  condition: string;
  language: string;
  game: string;
  createdAt: string;
  updatedAt: string;
}

export interface CardCollection {
  id: string;
  name: string;
  description: string;
  cards: Card[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CardFilters {
  game?: string;
  setName?: string;
  rarity?: string;
  type?: string;
  condition?: string;
  language?: string;
  priceMin?: number;
  priceMax?: number;
  search?: string;
}

export interface CardScannerResult {
  success: boolean;
  card?: Card;
  confidence?: number;
  error?: string;
}

export interface CardManagementState {
  cards: Card[];
  collections: CardCollection[];
  selectedCard: Card | null;
  filters: CardFilters;
  loading: boolean;
  error: string | null;
}
