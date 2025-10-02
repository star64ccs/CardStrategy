/**
 * 卡片相關的 Mock 數據
 */

export const mockCards = [
  {
    id: '1',
    name: 'Pikachu',
    type: 'Electric',
    rarity: 'Common',
    price: 10.99,
    series: 'Base Set',
    image: 'https://images.pokemontcg.io/base1/58.png',
    description: 'A cute electric mouse Pokémon',
    condition: 'Near Mint',
    centering: 'Perfect',
    authenticity: 'Verified',
    grade: 'PSA 10',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Charizard',
    type: 'Fire',
    rarity: 'Rare',
    price: 299.99,
    series: 'Base Set',
    image: 'https://images.pokemontcg.io/base1/4.png',
    description: 'A powerful fire dragon Pokémon',
    condition: 'Excellent',
    centering: 'Good',
    authenticity: 'Verified',
    grade: 'PSA 8',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    name: 'Blastoise',
    type: 'Water',
    rarity: 'Rare',
    price: 199.99,
    series: 'Base Set',
    image: 'https://images.pokemontcg.io/base1/2.png',
    description: 'A massive water turtle Pokémon',
    condition: 'Near Mint',
    centering: 'Excellent',
    authenticity: 'Verified',
    grade: 'PSA 9',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
  },
];

export const mockCardData = {
  pokemon: mockCards,
  onePiece: [
    {
      id: 'op-1',
      name: 'Monkey D. Luffy',
      type: 'Captain',
      rarity: 'Legendary',
      price: 89.99,
      series: 'One Piece Card Game',
      image: 'https://example.com/luffy.png',
      description: 'The captain of the Straw Hat Pirates',
      condition: 'Near Mint',
      centering: 'Perfect',
      authenticity: 'Verified',
      grade: 'PSA 10',
      createdAt: '2024-01-04T00:00:00Z',
      updatedAt: '2024-01-04T00:00:00Z',
    },
  ],
  myLittlePony: [
    {
      id: 'mlp-1',
      name: 'Twilight Sparkle',
      type: 'Alicorn',
      rarity: 'Rare',
      price: 45.99,
      series: 'My Little Pony CCG',
      image: 'https://example.com/twilight.png',
      description: 'The Princess of Friendship',
      condition: 'Excellent',
      centering: 'Good',
      authenticity: 'Verified',
      grade: 'PSA 8',
      createdAt: '2024-01-05T00:00:00Z',
      updatedAt: '2024-01-05T00:00:00Z',
    },
  ],
};

export const mockCardFilters = {
  name: '',
  type: '',
  rarity: '',
  minPrice: 0,
  maxPrice: 1000,
  condition: '',
  grade: '',
  series: '',
  authenticity: '',
};

export const mockCardSortOptions = [
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'price-asc', label: 'Price (Low to High)' },
  { value: 'price-desc', label: 'Price (High to Low)' },
  { value: 'date-asc', label: 'Date (Oldest First)' },
  { value: 'date-desc', label: 'Date (Newest First)' },
];

export const mockCardStats = {
  total: 3,
  totalValue: 510.97,
  averagePrice: 170.32,
  conditionDistribution: {
    'Near Mint': 2,
    Excellent: 1,
  },
  rarityDistribution: {
    Common: 1,
    Rare: 2,
  },
  gradeDistribution: {
    'PSA 10': 1,
    'PSA 9': 1,
    'PSA 8': 1,
  },
};
