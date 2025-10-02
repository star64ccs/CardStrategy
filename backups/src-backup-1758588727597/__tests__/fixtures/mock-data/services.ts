/**
 * 服務相關的 Mock 數據
 */

export const mockServices = {
  authService: {
    login: jest.fn().mockResolvedValue({
      success: true,
      token: 'mock-jwt-token',
      user: {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
      },
    }),
    logout: jest.fn().mockResolvedValue({ success: true }),
    register: jest.fn().mockResolvedValue({
      success: true,
      user: {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
      },
    }),
    refreshToken: jest.fn().mockResolvedValue({
      success: true,
      token: 'new-mock-jwt-token',
    }),
  },

  cardService: {
    getAllCards: jest.fn().mockResolvedValue({
      success: true,
      data: [],
      total: 0,
      page: 1,
      limit: 20,
    }),
    getCardById: jest.fn().mockResolvedValue({
      success: true,
      data: null,
    }),
    createCard: jest.fn().mockResolvedValue({
      success: true,
      data: null,
    }),
    updateCard: jest.fn().mockResolvedValue({
      success: true,
      data: null,
    }),
    deleteCard: jest.fn().mockResolvedValue({
      success: true,
    }),
  },

  marketService: {
    getCurrentPrice: jest.fn().mockResolvedValue({
      success: true,
      data: {
        price: 10.99,
        currency: 'USD',
        source: 'TCGPlayer',
        lastUpdated: '2024-01-01T00:00:00Z',
      },
    }),
    getPriceHistory: jest.fn().mockResolvedValue({
      success: true,
      data: [],
    }),
    getMarketTrends: jest.fn().mockResolvedValue({
      success: true,
      data: {
        trend: 'up',
        change: 5.2,
        period: '7d',
      },
    }),
  },

  imageService: {
    processImage: jest.fn().mockResolvedValue({
      success: true,
      data: {
        processedImage: 'base64-encoded-image',
        metadata: {
          width: 800,
          height: 600,
          format: 'jpeg',
          size: 125000,
        },
      },
    }),
    analyzeImage: jest.fn().mockResolvedValue({
      success: true,
      data: {
        confidence: 0.95,
        predictions: [],
        features: [],
      },
    }),
  },

  analyticsService: {
    trackEvent: jest.fn().mockResolvedValue({
      success: true,
    }),
    getUserAnalytics: jest.fn().mockResolvedValue({
      success: true,
      data: {
        totalViews: 100,
        totalActions: 50,
        averageSessionTime: 1800,
      },
    }),
    getCardAnalytics: jest.fn().mockResolvedValue({
      success: true,
      data: {
        views: 25,
        searches: 10,
        favorites: 5,
      },
    }),
  },

  notificationService: {
    sendNotification: jest.fn().mockResolvedValue({
      success: true,
      messageId: 'mock-message-id',
    }),
    getNotifications: jest.fn().mockResolvedValue({
      success: true,
      data: [],
    }),
    markAsRead: jest.fn().mockResolvedValue({
      success: true,
    }),
  },
};

export const mockApiResponses = {
  success: {
    success: true,
    data: null,
    message: 'Operation successful',
  },
  error: {
    success: false,
    error: 'Operation failed',
    message: 'An error occurred',
  },
  validationError: {
    success: false,
    error: 'Validation failed',
    message: 'Invalid input data',
    details: {
      field: 'email',
      message: 'Invalid email format',
    },
  },
  notFound: {
    success: false,
    error: 'Not found',
    message: 'Resource not found',
  },
  unauthorized: {
    success: false,
    error: 'Unauthorized',
    message: 'Authentication required',
  },
  forbidden: {
    success: false,
    error: 'Forbidden',
    message: 'Access denied',
  },
  serverError: {
    success: false,
    error: 'Internal server error',
    message: 'Something went wrong',
  },
};

export const mockErrorMessages = {
  network: 'Network error: Unable to connect to server',
  timeout: 'Request timeout: Server did not respond in time',
  parse: 'Parse error: Invalid response format',
  validation: 'Validation error: Invalid input data',
  authentication: 'Authentication error: Invalid credentials',
  authorization: 'Authorization error: Insufficient permissions',
  notFound: 'Not found: Resource does not exist',
  server: 'Server error: Internal server error',
  unknown: 'Unknown error: An unexpected error occurred',
};

export const mockServiceConfig = {
  apiBaseUrl: 'http://localhost:3000/api',
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  auth: {
    tokenKey: 'auth-token',
    refreshTokenKey: 'refresh-token',
    tokenExpiry: 3600, // 1 hour
  },
  cache: {
    enabled: true,
    ttl: 300, // 5 minutes
    maxSize: 100,
  },
  logging: {
    enabled: true,
    level: 'info',
  },
};
