import React, { useState, useEffect } from 'react';
import { MarketData } from '../types';

interface PriceChartProps {
  cardId?: string;
  timeframe?: '1h' | '24h' | '7d' | '30d';
}

const PriceChart: React.FC<PriceChartProps> = ({ cardId, timeframe = '24h' }) => {
  const [priceData, setPriceData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);

  useEffect(() => {
    const loadPriceData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));

      // 模擬價格數據
      const mockData: MarketData[] = Array.from({ length: 24 }, (_, i) => ({
        id: `price-${i}`,
        cardId: cardId || 'card1',
        cardName: '青眼白龍',
        price: 1400 + Math.random() * 200 - 100,
        change: Math.random() * 100 - 50,
        changePercent: (Math.random() * 10 - 5),
        volume: Math.floor(Math.random() * 1000) + 500,
        marketCap: 1400000 + Math.random() * 200000 - 100000,
        timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString()
      }));

      setPriceData(mockData);
      setLoading(false);
    };

    loadPriceData();
  }, [cardId, selectedTimeframe]);

  const getTimeframeLabel = (tf: string) => {
    switch (tf) {
      case '1h': return '1小時';
      case '24h': return '24小時';
      case '7d': return '7天';
      case '30d': return '30天';
      default: return '24小時';
    }
  };

  const formatPrice = (price: number) => {
    return `NT$ ${price.toLocaleString()}`;
  };

  if (loading) {
    return <div className="price-chart loading">載入價格數據中...</div>;
  }

  return (
    <div className="price-chart">
      <div className="chart-header">
        <h3>價格走勢圖</h3>
        <div className="timeframe-selector">
          {(['1h', '24h', '7d', '30d'] as const).map(tf => (
            <button
              key={tf}
              className={`timeframe-btn ${selectedTimeframe === tf ? 'active' : ''}`}
              onClick={() => setSelectedTimeframe(tf)}
            >
              {getTimeframeLabel(tf)}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-info">
        <div className="current-price">
          <span className="price-label">當前價格</span>
          <span className="price-value">
            {formatPrice(priceData[priceData.length - 1]?.price || 0)}
          </span>
        </div>
        <div className="price-change">
          <span className="change-label">24小時變化</span>
          <span className={`change-value ${priceData[priceData.length - 1]?.change >= 0 ? 'positive' : 'negative'}`}>
            {priceData[priceData.length - 1]?.change >= 0 ? '+' : ''}
            {priceData[priceData.length - 1]?.changePercent.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="chart-container">
        <div className="chart-placeholder">
          <div className="chart-line">
            {priceData.map((data, index) => (
              <div
                key={data.id}
                className="chart-point"
                style={{
                  left: `${(index / (priceData.length - 1)) * 100}%`,
                  bottom: `${((data.price - 1300) / 300) * 100}%`
                }}
                title={`${new Date(data.timestamp).toLocaleTimeString()}: ${formatPrice(data.price)}`}
              />
            ))}
          </div>
          <div className="chart-grid">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="grid-line" style={{ bottom: `${(i / 4) * 100}%` }}>
                <span className="grid-label">
                  {formatPrice(1300 + (i / 4) * 300)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="chart-stats">
        <div className="stat-item">
          <span className="stat-label">最高價</span>
          <span className="stat-value">
            {formatPrice(Math.max(...priceData.map(d => d.price)))}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">最低價</span>
          <span className="stat-value">
            {formatPrice(Math.min(...priceData.map(d => d.price)))}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">平均價</span>
          <span className="stat-value">
            {formatPrice(priceData.reduce((sum, d) => sum + d.price, 0) / priceData.length)}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">成交量</span>
          <span className="stat-value">
            {priceData[priceData.length - 1]?.volume.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PriceChart;
