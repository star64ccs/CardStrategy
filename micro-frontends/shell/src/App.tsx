import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 動態加載微前端模組
const loadModule = async (remoteName: string, moduleName: string) => {
  const container = (window as any)[remoteName];
  const factory = await container.get(moduleName);
  return factory();
};

// 卡片管理模組組件
const CardManagement = React.lazy(() =>
  loadModule('cardManagement', './CardList').then(module => ({ default: module.default }))
);

// 市場分析模組組件
const MarketAnalysis = React.lazy(() =>
  loadModule('marketAnalysis', './MarketDashboard').then(module => ({ default: module.default }))
);

// AI 生態系統模組組件
const AIEcosystem = React.lazy(() =>
  loadModule('aiEcosystem', './AIDashboard').then(module => ({ default: module.default }))
);

// 主應用組件
const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>CardStrategy 微前端架構</h1>
          <nav className="app-nav">
            <a href="/">首頁</a>
            <a href="/cards">卡片管理</a>
            <a href="/market">市場分析</a>
            <a href="/ai">AI 生態</a>
            <a href="/portfolio">投資組合</a>
            <a href="/social">社交功能</a>
          </nav>
        </header>

        <main className="app-main">
          <React.Suspense fallback={<div className="loading">載入模組中...</div>}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/cards/*" element={<CardManagement />} />
              <Route path="/market/*" element={<MarketAnalysis />} />
              <Route path="/ai/*" element={<AIEcosystem />} />
              <Route path="/portfolio/*" element={<div>投資組合 (開發中)</div>} />
              <Route path="/social/*" element={<div>社交功能 (開發中)</div>} />
            </Routes>
          </React.Suspense>
        </main>
      </div>
    </Router>
  );
};

// 首頁組件
const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <h2>歡迎使用 CardStrategy 微前端架構</h2>
      <p>這是一個基於 Webpack Module Federation 的微前端架構實現。</p>

      <div className="modules-overview">
        <h3>可用模組</h3>
        <div className="modules-grid">
          <div className="module-card">
            <h4>卡片管理</h4>
            <p>管理您的卡片收藏、掃描和搜索功能</p>
            <a href="/cards" className="btn btn-primary">進入模組</a>
          </div>

          <div className="module-card">
            <h4>市場分析</h4>
            <p>查看市場趨勢、價格圖表和投資分析</p>
            <a href="/market" className="btn btn-primary">進入模組</a>
          </div>

          <div className="module-card">
            <h4>AI 生態</h4>
            <p>AI 驅動的卡片識別和智能分析</p>
            <a href="/ai" className="btn btn-primary">進入模組</a>
          </div>

          <div className="module-card">
            <h4>投資組合</h4>
            <p>管理您的投資組合和收益追蹤</p>
            <a href="/portfolio" className="btn btn-secondary">開發中</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
