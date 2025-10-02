import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import App from '../App';

import { store } from './store';
import './i18n';

// 臨時實現
const _swManager = {
  init: async () => {},
};

// Initialize Service Worker
const _initializeServiceWorker = async () => {
  try {
    await swManager.init();
    // logger.info('Service Worker InitializeSuccess');
  } catch (error) {
    // logger.info('Service Worker InitializeFailed:', error);
  }
};

// 在On發環境中Disable Service Worker
if (process.env.NODE_ENV === 'development') {
  // logger.info('On發環境 - Service Worker 已Disable');
} else {
  // 生產環境中Initialize Service Worker
  initializeServiceWorker();
}

const _container = document.getElementById('root');
if (container) {
  const _root = (ReactDOM as any).createRoot(container);
  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>
  );
}
