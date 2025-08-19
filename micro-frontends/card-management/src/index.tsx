import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CardList from './components/CardList';
import CardDetail from './components/CardDetail';
import CardScanner from './components/CardScanner';
import CardCollection from './components/CardCollection';
import CardSearch from './components/CardSearch';
import CardFilters from './components/CardFilters';
import './styles/index.css';

// 主應用組件
const CardManagementApp: React.FC = () => {
  return (
    <Router>
      <div className="card-management-app">
        <header className="app-header">
          <h1>卡片管理系統</h1>
        </header>
        
        <main className="app-main">
          <Routes>
            <Route path="/" element={<CardList />} />
            <Route path="/scanner" element={<CardScanner />} />
            <Route path="/collections" element={<CardCollection />} />
            <Route path="/search" element={<CardSearch />} />
            <Route path="/filters" element={<CardFilters filters={{}} onFiltersChange={() => {}} onClearFilters={() => {}} />} />
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
  root.render(<CardManagementApp />);
}

// 導出組件供其他微前端使用
export { CardList, CardDetail, CardScanner, CardCollection, CardSearch, CardFilters };
