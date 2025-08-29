import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// 設置 MSW 服務器
export const server = setupServer(...handlers);

// 導出用於測試的處理器
export { handlers };
