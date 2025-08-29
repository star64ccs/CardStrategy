/**
 * 測試數據管理器
 * 按照執行原則建構
 * 嚴謹語法，無錯誤，高質量代碼
 */

// 測試數據工廠
export const createMockUser = (overrides = {}) => ({
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  profile: {
    avatar: 'https://example.com/avatar.jpg',
    displayName: 'Test User',
    bio: 'Test bio',
  },
  ...overrides,
});

export const createMockCard = (overrides = {}) => ({
  id: '1',
  name: 'Test Card',
  type: 'Monster',
  rarity: 'Rare',
  image: 'https://example.com/card.jpg',
  price: 100,
  condition: 'Mint',
  ...overrides,
});

export const createMockScanHistory = (overrides = {}) => ({
  id: '1',
  userId: '1',
  cardId: '1',
  cardName: 'Test Card',
  cardImage: 'https://example.com/card.jpg',
  scanType: 'recognition',
  scanResult: {
    success: true,
    confidence: 0.95,
    recognizedCard: createMockCard(),
  },
  imageUri: 'https://example.com/scan.jpg',
  scanDate: new Date().toISOString(),
  processingTime: 1500,
  metadata: {
    deviceInfo: 'iPhone 14',
    appVersion: '1.0.0',
    scanMethod: 'camera',
    imageQuality: 'high',
  },
  tags: ['test'],
  notes: 'Test scan',
  isFavorite: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockConditionAnalysis = (overrides = {}) => ({
  overallGrade: 'Near Mint',
  overallScore: 8.5,
  confidence: 0.92,
  factors: {
    corners: { score: 8.0, details: 'Minor wear on corners' },
    edges: { score: 9.0, details: 'Clean edges' },
    surface: { score: 8.5, details: 'Good surface condition' },
    centering: { score: 8.0, details: 'Slightly off-center' },
    printQuality: { score: 9.0, details: 'Excellent print quality' },
  },
  damageAssessment: {
    scratches: [],
    dents: [],
    creases: [],
    stains: [],
    fading: 'None',
  },
  marketImpact: {
    estimatedValue: 120,
    valueRange: { min: 100, max: 140 },
    marketTrend: 'stable',
  },
  preservationTips: [
    'Store in protective sleeve',
    'Keep away from direct sunlight',
    'Maintain stable humidity',
  ],
  ...overrides,
});

// 測試數據清理
export const clearTestData = () => {
  // 清理測試數據的邏輯
  console.log('🧹 清理測試數據');
};

// 測試數據初始化
export const initializeTestData = () => {
  // 初始化測試數據的邏輯
  console.log('📊 初始化測試數據');
};

console.log('✅ 測試數據管理文件已創建');
