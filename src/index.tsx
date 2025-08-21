import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';
import { swManager } from './utils/serviceWorkerManager';
import './i18n';

// 初始化 Service Worker
const initializeServiceWorker = async () => {
  try {
    await swManager.init();
    // logger.info('Service Worker 初始化成功');
  } catch (error) {
    // logger.info('Service Worker 初始化失敗:', error);
  }
};

// 在開發環境中禁用 Service Worker
if (process.env.NODE_ENV === 'development') {
  // logger.info('開發環境 - Service Worker 已禁用');
} else {
  // 生產環境中初始化 Service Worker
  initializeServiceWorker();
}

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
