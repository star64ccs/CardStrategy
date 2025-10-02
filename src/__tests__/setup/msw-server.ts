// 簡化的 MSW Server mock
const _mockServer = {
  listen: jest.fn(),
  close: jest.fn(),
  use: jest.fn(),
  resetHandlers: jest.fn(),
};

// 模擬 setupServer Function
const _setupServer = jest.fn(() => mockServer);

// Exportmock server和handlers
export const _server = mockServer;
export { handlers } from './handlers';
export { setupServer };
