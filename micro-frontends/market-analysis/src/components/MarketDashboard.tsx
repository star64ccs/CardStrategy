import React, { useState, useEffect } from 'react';
import { MarketData, MarketInsight, PriceAlert } from '../types';

const MarketDashboard: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模擬數據加載
    const loadData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockMarketData: MarketData[] = [
        {
          id: '1',
          cardId: 'card1',
          cardName: '青眼白龍',
          price: 1500,
          change: 50,
          changePercent: 3.45,
          volume: 1250,
          marketCap: 1500000,
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          cardId: 'card2',
          cardName: '黑魔導',
          price: 800,
          change: -20,
          changePercent: -2.44,
          volume: 890,
          marketCap: 800000,
          timestamp: new Date().toISOString()
        }
      ];

      const mockInsights: MarketInsight[] = [
        {
          id: '1',
          title: '青眼白龍價格飆升',
          description: '青眼白龍在過去24小時內價格上漲了15%，交易量增加200%',
          type: 'price_spike',
          severity: 'high',
          affectedCards: ['card1'],
          createdAt: new Date().toISOString()
        }
      ];

      const mockAlerts: PriceAlert[] = [
        {
          id: '1',
          cardId: 'card1',
          cardName: '青眼白龍',
          targetPrice: 1600,
          condition: 'above',
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ];

      setMarketData(mockMarketData);
      setInsights(mockInsights);
      setAlerts(mockAlerts);
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return <div className="market-dashboard loading">載入市場數據中...</div>;
  }

  return (
    <div className="market-dashboard">
      <header className="dashboard-header">
        <h2>市場分析儀表板</h2>
        <div className="dashboard-stats">
          <div className="stat">
            <span className="stat-label">活躍卡片</span>
            <span className="stat-value">{marketData.length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">價格警報</span>
            <span className="stat-value">{alerts.filter(a => a.isActive).length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">市場洞察</span>
            <span className="stat-value">{insights.length}</span>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="market-overview">
          <h3>市場概覽</h3>
          <div className="market-cards">
            {marketData.map(card => (
              <div key={card.id} className="market-card">
                <div className="card-header">
                  <h4>{card.cardName}</h4>
                  <span className={`price-change ${card.change >= 0 ? 'positive' : 'negative'}`}>
                    {card.change >= 0 ? '+' : ''}{card.changePercent.toFixed(2)}%
                  </span>
                </div>
                <div className="card-price">NT$ {card.price.toLocaleString()}</div>
                <div className="card-volume">成交量: {card.volume.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="market-insights">
          <h3>市場洞察</h3>
          <div className="insights-list">
            {insights.map(insight => (
              <div key={insight.id} className={`insight-card ${insight.severity}`}>
                <div className="insight-header">
                  <h4>{insight.title}</h4>
                  <span className={`severity-badge ${insight.severity}`}>
                    {insight.severity.toUpperCase()}
                  </span>
                </div>
                <p>{insight.description}</p>
                <div className="insight-meta">
                  <span>{new Date(insight.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="price-alerts">
          <h3>價格警報</h3>
          <div className="alerts-list">
            {alerts.filter(alert => alert.isActive).map(alert => (
              <div key={alert.id} className="alert-card">
                <div className="alert-header">
                  <h4>{alert.cardName}</h4>
                  <span className="alert-condition">
                    {alert.condition === 'above' ? '高於' : '低於'} NT$ {alert.targetPrice.toLocaleString()}
                  </span>
                </div>
                <div className="alert-actions">
                  <button className="btn btn-primary">查看詳情</button>
                  <button className="btn btn-secondary">停用警報</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketDashboard;
