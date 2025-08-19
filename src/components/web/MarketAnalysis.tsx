import React, { useState } from 'react';

interface MarketData {
  totalVolume: number;
  totalCards: number;
  averagePrice: number;
  topGainers: {
    name: string;
    change: number;
    price: number;
  }[];
  topLosers: {
    name: string;
    change: number;
    price: number;
  }[];
  marketTrend: 'bull' | 'bear' | 'neutral';
}

const MarketAnalysis: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d'>('24h');

  // 模擬市場數據
  const marketData: MarketData = {
    totalVolume: 1250000,
    totalCards: 15420,
    averagePrice: 850,
    topGainers: [
      { name: '混沌戰士', change: 25.5, price: 2000 },
      { name: '青眼白龍', change: 18.2, price: 1500 },
      { name: '黑魔導', change: 12.8, price: 800 },
      { name: '真紅眼黑龍', change: 9.5, price: 1200 },
      { name: '元素英雄 新宇俠', change: 7.2, price: 600 }
    ],
    topLosers: [
      { name: '暗黑魔導師', change: -15.3, price: 450 },
      { name: '藍眼白龍', change: -12.1, price: 1200 },
      { name: '紅眼黑龍', change: -8.7, price: 800 },
      { name: '綠眼白龍', change: -6.4, price: 900 },
      { name: '黃眼白龍', change: -4.2, price: 750 }
    ],
    marketTrend: 'bull'
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getTrendColor = (trend: 'bull' | 'bear' | 'neutral') => {
    switch (trend) {
      case 'bull': return '#27ae60';
      case 'bear': return '#e74c3c';
      default: return '#7f8c8d';
    }
  };

  const getTrendIcon = (trend: 'bull' | 'bear' | 'neutral') => {
    switch (trend) {
      case 'bull': return '📈';
      case 'bear': return '📉';
      default: return '➡️';
    }
  };

  return (
    <div style={styles.container}>
      {/* 市場概覽 */}
      <div style={styles.overview}>
        <h2 style={styles.title}>📊 市場概覽</h2>

        <div style={styles.timeframeSelector}>
          <button
            style={{
              ...styles.timeframeButton,
              ...(selectedTimeframe === '24h' && styles.activeTimeframe)
            }}
            onClick={() => setSelectedTimeframe('24h')}
          >
            24小時
          </button>
          <button
            style={{
              ...styles.timeframeButton,
              ...(selectedTimeframe === '7d' && styles.activeTimeframe)
            }}
            onClick={() => setSelectedTimeframe('7d')}
          >
            7天
          </button>
          <button
            style={{
              ...styles.timeframeButton,
              ...(selectedTimeframe === '30d' && styles.activeTimeframe)
            }}
            onClick={() => setSelectedTimeframe('30d')}
          >
            30天
          </button>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>💰</div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{formatCurrency(marketData.totalVolume)}</div>
              <div style={styles.statLabel}>總交易量</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>🎴</div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{marketData.totalCards.toLocaleString()}</div>
              <div style={styles.statLabel}>活躍卡片</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>📊</div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{formatCurrency(marketData.averagePrice)}</div>
              <div style={styles.statLabel}>平均價格</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>{getTrendIcon(marketData.marketTrend)}</div>
            <div style={styles.statContent}>
              <div style={{
                ...styles.statValue,
                color: getTrendColor(marketData.marketTrend)
              }}>
                {marketData.marketTrend === 'bull'
                  ? '牛市'
                  : marketData.marketTrend === 'bear'
                    ? '熊市'
                    : '平穩'}
              </div>
              <div style={styles.statLabel}>市場趨勢</div>
            </div>
          </div>
        </div>
      </div>

      {/* 漲跌幅排行榜 */}
      <div style={styles.rankings}>
        <div style={styles.rankingSection}>
          <h3 style={styles.rankingTitle}>📈 漲幅榜</h3>
          <div style={styles.rankingList}>
            {marketData.topGainers.map((item, index) => (
              <div key={index} style={styles.rankingItem}>
                <div style={styles.rankingNumber}>{index + 1}</div>
                <div style={styles.rankingInfo}>
                  <div style={styles.rankingName}>{item.name}</div>
                  <div style={styles.rankingPrice}>{formatCurrency(item.price)}</div>
                </div>
                <div style={{
                  ...styles.rankingChange,
                  color: '#27ae60'
                }}>
                  {formatPercentage(item.change)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.rankingSection}>
          <h3 style={styles.rankingTitle}>📉 跌幅榜</h3>
          <div style={styles.rankingList}>
            {marketData.topLosers.map((item, index) => (
              <div key={index} style={styles.rankingItem}>
                <div style={styles.rankingNumber}>{index + 1}</div>
                <div style={styles.rankingInfo}>
                  <div style={styles.rankingName}>{item.name}</div>
                  <div style={styles.rankingPrice}>{formatCurrency(item.price)}</div>
                </div>
                <div style={{
                  ...styles.rankingChange,
                  color: '#e74c3c'
                }}>
                  {formatPercentage(item.change)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI 市場洞察 */}
      <div style={styles.insights}>
        <h3 style={styles.insightsTitle}>🤖 AI 市場洞察</h3>
        <div style={styles.insightsContent}>
          <div style={styles.insightCard}>
            <div style={styles.insightIcon}>💡</div>
            <div style={styles.insightText}>
              <strong>市場趨勢分析：</strong>
              根據AI分析，當前市場呈現上升趨勢，建議關注龍族和戰士類卡片。
            </div>
          </div>

          <div style={styles.insightCard}>
            <div style={styles.insightIcon}>🎯</div>
            <div style={styles.insightText}>
              <strong>投資建議：</strong>
              混沌戰士和青眼白龍表現強勁，可考慮適度加倉。
            </div>
          </div>

          <div style={styles.insightCard}>
            <div style={styles.insightIcon}>⚠️</div>
            <div style={styles.insightText}>
              <strong>風險提醒：</strong>
              暗黑魔導師等卡片持續下跌，建議謹慎操作。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '24px'
  },
  overview: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#2c3e50',
    margin: '0 0 20px 0'
  },
  timeframeSelector: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px'
  },
  timeframeButton: {
    padding: '8px 16px',
    border: '1px solid #e1e8ed',
    borderRadius: '6px',
    backgroundColor: '#ffffff',
    color: '#7f8c8d',
    cursor: 'pointer',
    fontSize: '14px'
  },
  activeTimeframe: {
    backgroundColor: '#3498db',
    color: '#ffffff',
    borderColor: '#3498db'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e1e8ed'
  },
  statIcon: {
    fontSize: '24px',
    marginRight: '12px'
  },
  statContent: {
    flex: 1
  },
  statValue: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '4px'
  },
  statLabel: {
    fontSize: '12px',
    color: '#7f8c8d'
  },
  rankings: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    marginBottom: '24px'
  },
  rankingSection: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  },
  rankingTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#2c3e50',
    margin: '0 0 16px 0'
  },
  rankingList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px'
  },
  rankingItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px'
  },
  rankingNumber: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#3498db',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
    marginRight: '12px'
  },
  rankingInfo: {
    flex: 1
  },
  rankingName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: '2px'
  },
  rankingPrice: {
    fontSize: '12px',
    color: '#7f8c8d'
  },
  rankingChange: {
    fontSize: '14px',
    fontWeight: 'bold'
  },
  insights: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  },
  insightsTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#2c3e50',
    margin: '0 0 16px 0'
  },
  insightsContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px'
  },
  insightCard: {
    display: 'flex',
    alignItems: 'flex-start',
    padding: '16px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e1e8ed'
  },
  insightIcon: {
    fontSize: '20px',
    marginRight: '12px',
    marginTop: '2px'
  },
  insightText: {
    fontSize: '14px',
    color: '#2c3e50',
    lineHeight: '1.5'
  }
};

export default MarketAnalysis;
