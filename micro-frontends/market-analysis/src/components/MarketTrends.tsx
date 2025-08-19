import React, { useState, useEffect } from 'react';
import { MarketTrend } from '../types';

const MarketTrends: React.FC = () => {
  const [trends, setTrends] = useState<MarketTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'up' | 'down' | 'stable'>('all');

  useEffect(() => {
    const loadTrends = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockTrends: MarketTrend[] = [
        {
          id: '1',
          cardId: 'card1',
          cardName: '青眼白龍',
          trend: 'up',
          confidence: 85,
          factors: ['交易量增加', '市場需求上升', '供應減少'],
          prediction: 1600,
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          cardId: 'card2',
          cardName: '黑魔導',
          trend: 'down',
          confidence: 72,
          factors: ['供應過剩', '需求下降'],
          prediction: 750,
          timestamp: new Date().toISOString()
        },
        {
          id: '3',
          cardId: 'card3',
          cardName: '真紅眼黑龍',
          trend: 'stable',
          confidence: 90,
          factors: ['供需平衡', '市場穩定'],
          prediction: 1200,
          timestamp: new Date().toISOString()
        }
      ];

      setTrends(mockTrends);
      setLoading(false);
    };

    loadTrends();
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
      default: return '❓';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'positive';
      case 'down': return 'negative';
      case 'stable': return 'neutral';
      default: return 'neutral';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'high';
    if (confidence >= 60) return 'medium';
    return 'low';
  };

  const filteredTrends = trends.filter(trend =>
    filter === 'all' || trend.trend === filter
  );

  if (loading) {
    return <div className="market-trends loading">載入市場趨勢中...</div>;
  }

  return (
    <div className="market-trends">
      <div className="trends-header">
        <h3>市場趨勢分析</h3>
        <div className="trends-filter">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            全部 ({trends.length})
          </button>
          <button
            className={`filter-btn ${filter === 'up' ? 'active' : ''}`}
            onClick={() => setFilter('up')}
          >
            上升 ({trends.filter(t => t.trend === 'up').length})
          </button>
          <button
            className={`filter-btn ${filter === 'down' ? 'active' : ''}`}
            onClick={() => setFilter('down')}
          >
            下降 ({trends.filter(t => t.trend === 'down').length})
          </button>
          <button
            className={`filter-btn ${filter === 'stable' ? 'active' : ''}`}
            onClick={() => setFilter('stable')}
          >
            穩定 ({trends.filter(t => t.trend === 'stable').length})
          </button>
        </div>
      </div>

      <div className="trends-list">
        {filteredTrends.map(trend => (
          <div key={trend.id} className={`trend-card ${getTrendColor(trend.trend)}`}>
            <div className="trend-header">
              <div className="trend-info">
                <span className="trend-icon">{getTrendIcon(trend.trend)}</span>
                <h4>{trend.cardName}</h4>
                <span className={`trend-direction ${getTrendColor(trend.trend)}`}>
                  {trend.trend === 'up' ? '上升趨勢' :
                    trend.trend === 'down' ? '下降趨勢' : '穩定趨勢'}
                </span>
              </div>
              <div className="trend-confidence">
                <span className={`confidence-badge ${getConfidenceColor(trend.confidence)}`}>
                  {trend.confidence}% 信心度
                </span>
              </div>
            </div>

            <div className="trend-details">
              <div className="trend-factors">
                <h5>影響因素:</h5>
                <ul>
                  {trend.factors.map((factor, index) => (
                    <li key={index}>{factor}</li>
                  ))}
                </ul>
              </div>

              <div className="trend-prediction">
                <h5>價格預測:</h5>
                <span className="prediction-price">NT$ {trend.prediction.toLocaleString()}</span>
              </div>
            </div>

            <div className="trend-meta">
              <span>分析時間: {new Date(trend.timestamp).toLocaleString()}</span>
              <div className="trend-actions">
                <button className="btn btn-primary">查看詳情</button>
                <button className="btn btn-secondary">設置警報</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTrends.length === 0 && (
        <div className="no-trends">
          <p>沒有找到符合條件的趨勢數據</p>
        </div>
      )}
    </div>
  );
};

export default MarketTrends;
