import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 導入組件
import AIDashboard from './components/AIDashboard';
import CardScanner from './components/CardScanner';
import MarketPredictor from './components/MarketPredictor';
import RecommendationEngine from './components/RecommendationEngine';
import DataAnalyzer from './components/DataAnalyzer';
import AITraining from './components/AITraining';

// AI 生態系統應用主組件
const AIEcosystemApp: React.FC = () => {
  return (
    <Router>
      <div className="ai-ecosystem-app">
        <header className="app-header">
          <h1>AI 生態系統</h1>
          <nav className="app-nav">
            <a href="/">儀表板</a>
            <a href="/scanner">卡片掃描</a>
            <a href="/predictor">市場預測</a>
            <a href="/recommendations">推薦引擎</a>
            <a href="/analyzer">數據分析</a>
            <a href="/training">模型訓練</a>
          </nav>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<AIDashboard />} />
            <Route path="/scanner" element={<CardScanner />} />
            <Route path="/predictor" element={<MarketPredictor />} />
            <Route path="/recommendations" element={<RecommendationEngine />} />
            <Route path="/analyzer" element={<DataAnalyzer />} />
            <Route path="/training" element={<AITraining />} />
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
  root.render(<AIEcosystemApp />);
}

// 導出組件供 Module Federation 使用
export {
  AIDashboard,
  CardScanner,
  MarketPredictor,
  RecommendationEngine,
  DataAnalyzer,
  AITraining,
};
