// 簡化的 MSW 服務器 mock
const _mockServer = {
  listen: jest.fn(),
  close: jest.fn(),
  use: jest.fn(),
  resetHandlers: jest.fn(),
};

// 模擬 setupServer 函數
const _setupServer = jest.fn(() => mockServer);

// 導出mock server和handlers
export const _server = mockServer;
export { handlers } from './handlers';
export { setupServer };
