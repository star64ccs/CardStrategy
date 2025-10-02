/**
 * 用戶相關的 Mock 數據
 */

export const mockUsers = [
  {
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    avatar: 'https://example.com/avatar1.jpg',
    isVerified: true,
    role: 'user',
    preferences: {
      theme: 'light',
      language: 'en',
      notifications: true,
      privacy: 'public',
    },
    statistics: {
      totalCards: 25,
      totalValue: 1250.5,
      averageGrade: 8.5,
      favoriteSeries: 'Base Set',
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    email: 'admin@example.com',
    username: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    avatar: 'https://example.com/avatar2.jpg',
    isVerified: true,
    role: 'admin',
    preferences: {
      theme: 'dark',
      language: 'en',
      notifications: true,
      privacy: 'private',
    },
    statistics: {
      totalCards: 150,
      totalValue: 15000.0,
      averageGrade: 9.2,
      favoriteSeries: "Champion's Path",
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    email: 'collector@example.com',
    username: 'cardcollector',
    firstName: 'Card',
    lastName: 'Collector',
    avatar: 'https://example.com/avatar3.jpg',
    isVerified: false,
    role: 'user',
    preferences: {
      theme: 'light',
      language: 'zh',
      notifications: false,
      privacy: 'public',
    },
    statistics: {
      totalCards: 75,
      totalValue: 3500.25,
      averageGrade: 7.8,
      favoriteSeries: 'Evolving Skies',
    },
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
];

export const mockUserProfile = {
  id: '1',
  email: 'test@example.com',
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  avatar: 'https://example.com/avatar1.jpg',
  isVerified: true,
  role: 'user',
  preferences: {
    theme: 'light',
    language: 'en',
    notifications: true,
    privacy: 'public',
  },
  statistics: {
    totalCards: 25,
    totalValue: 1250.5,
    averageGrade: 8.5,
    favoriteSeries: 'Base Set',
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

export const mockUserPreferences = {
  theme: 'light',
  language: 'en',
  notifications: true,
  privacy: 'public',
  currency: 'USD',
  timezone: 'UTC',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: '24h',
};

export const mockUserStatistics = {
  totalCards: 25,
  totalValue: 1250.5,
  averageGrade: 8.5,
  favoriteSeries: 'Base Set',
  cardsByCondition: {
    'Near Mint': 15,
    Excellent: 8,
    Good: 2,
  },
  cardsByGrade: {
    'PSA 10': 5,
    'PSA 9': 10,
    'PSA 8': 8,
    'PSA 7': 2,
  },
  monthlyGrowth: [
    { month: 'Jan', value: 1000 },
    { month: 'Feb', value: 1100 },
    { month: 'Mar', value: 1250 },
  ],
};

export const mockUserSessions = [
  {
    id: 'session-1',
    userId: '1',
    startTime: '2024-01-01T10:00:00Z',
    endTime: '2024-01-01T11:30:00Z',
    duration: 5400, // 90 minutes
    actions: 25,
    pages: ['dashboard', 'cards', 'profile'],
    device: 'iPhone 13',
    browser: 'Safari',
  },
  {
    id: 'session-2',
    userId: '1',
    startTime: '2024-01-02T14:00:00Z',
    endTime: '2024-01-02T15:15:00Z',
    duration: 4500, // 75 minutes
    actions: 18,
    pages: ['cards', 'search', 'details'],
    device: 'iPhone 13',
    browser: 'Safari',
  },
];
