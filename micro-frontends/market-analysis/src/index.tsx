import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 導入組件
import MarketDashboard from './components/MarketDashboard';
import PriceChart from './components/PriceChart';
import MarketTrends from './components/MarketTrends';
import PriceAlerts from './components/PriceAlerts';
import MarketInsights from './components/MarketInsights';
import TradingVolumeComponent from './components/TradingVolume';

// 市場分析應用主組件
const MarketAnalysisApp: React.FC = () => {
  return (
    <Router>
      <div className="market-analysis-app">
        <header className="app-header">
          <h1>市場分析系統</h1>
          <nav className="app-nav">
            <a href="/">儀表板</a>
            <a href="/price-chart">價格圖表</a>
            <a href="/trends">市場趨勢</a>
            <a href="/alerts">價格警報</a>
            <a href="/insights">市場洞察</a>
            <a href="/volume">交易量分析</a>
          </nav>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<MarketDashboard />} />
            <Route path="/price-chart" element={<PriceChart />} />
            <Route path="/trends" element={<MarketTrends />} />
            <Route path="/alerts" element={<PriceAlerts />} />
            <Route path="/insights" element={<MarketInsights />} />
            <Route path="/volume" element={<TradingVolumeComponent />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

// 獨立運行時的渲染
const container = document.getElementById('root');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(<MarketAnalysisApp />);
}

// 導出組件供 Module Federation 使用
export {
  MarketDashboard,
  PriceChart,
  MarketTrends,
  PriceAlerts,
  MarketInsights,
  TradingVolumeComponent,
};
