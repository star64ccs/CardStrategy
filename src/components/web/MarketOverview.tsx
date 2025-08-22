import React, { useState, useEffect } from 'react';
import { marketService, MarketData } from '../../services/marketService';
import { logger } from '../../utils/logger';

interface MarketOverviewProps {
  onCardClick?: (cardId: string) => void;
}

const MarketOverview: React.FC<MarketOverviewProps> = ({ onCardClick }) => {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarketData();
  }, []);

  const loadMarketData = async () => {
    setLoading(true);
    try {
      const response = await marketService.getMarketData();
      if (response.success && response.data) {
        setMarketData(response.data);
      }
    } catch (error) {
      logger.error('載入市場數據失敗:', { error });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    }
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  };

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return '#27ae60';
    if (change < 0) return '#e74c3c';
    return '#7f8c8d';
  };

  const getPriceChangeIcon = (change: number) => {
    if (change > 0) return '↗️';
    if (change < 0) return '↘️';
    return '→';
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}>🔄</div>
        <p style={styles.loadingText}>載入市場數據中...</p>
      </div>
    );
  }

  if (!marketData) {
    return (
      <div style={styles.errorContainer}>
        <p style={styles.errorText}>無法載入市場數據</p>
        <button style={styles.retryButton} onClick={loadMarketData}>
          重新載入
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* 市場統計 */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>
            {formatVolume(marketData.totalVolume)}
          </div>
          <div style={styles.statLabel}>24小時交易量</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>
            {marketData.totalTransactions.toLocaleString()}
          </div>
          <div style={styles.statLabel}>總交易筆數</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>
            {formatPrice(marketData.averagePrice)}
          </div>
          <div style={styles.statLabel}>平均價格</div>
        </div>
        <div style={styles.statCard}>
          <div
            style={{
              ...styles.statValue,
              color: getPriceChangeColor(marketData.priceChange24h),
            }}
          >
            {getPriceChangeIcon(marketData.priceChange24h)}{' '}
            {marketData.priceChange24h.toFixed(2)}%
          </div>
          <div style={styles.statLabel}>24小時漲跌</div>
        </div>
      </div>

      {/* 漲幅榜 */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>📈 漲幅榜</h3>
        <div style={styles.cardList}>
          {marketData.topGainers.map((card) => (
            <div
              key={card.id}
              style={styles.cardItem}
              onClick={() => onCardClick?.(card.id)}
            >
              <div style={styles.cardInfo}>
                <div style={styles.cardName}>{card.name}</div>
                <div style={styles.cardPrice}>{formatPrice(card.price)}</div>
              </div>
              <div
                style={{
                  ...styles.priceChange,
                  color: getPriceChangeColor(card.priceChange),
                }}
              >
                {getPriceChangeIcon(card.priceChange)}{' '}
                {card.priceChange.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 跌幅榜 */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>📉 跌幅榜</h3>
        <div style={styles.cardList}>
          {marketData.topLosers.map((card) => (
            <div
              key={card.id}
              style={styles.cardItem}
              onClick={() => onCardClick?.(card.id)}
            >
              <div style={styles.cardInfo}>
                <div style={styles.cardName}>{card.name}</div>
                <div style={styles.cardPrice}>{formatPrice(card.price)}</div>
              </div>
              <div
                style={{
                  ...styles.priceChange,
                  color: getPriceChangeColor(card.priceChange),
                }}
              >
                {getPriceChangeIcon(card.priceChange)}{' '}
                {card.priceChange.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 熱門卡片 */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>🔥 熱門卡片</h3>
        <div style={styles.cardList}>
          {marketData.trendingCards.map((card) => (
            <div
              key={card.id}
              style={styles.cardItem}
              onClick={() => onCardClick?.(card.id)}
            >
              <div style={styles.cardInfo}>
                <div style={styles.cardName}>{card.name}</div>
                <div style={styles.cardPrice}>{formatPrice(card.price)}</div>
              </div>
              <div style={styles.cardVolume}>
                成交量: {formatVolume(card.volume)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
  },
  loadingSpinner: {
    fontSize: '32px',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px',
  },
  loadingText: {
    fontSize: '16px',
    color: '#7f8c8d',
    margin: 0,
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
  },
  errorText: {
    fontSize: '16px',
    color: '#e74c3c',
    marginBottom: '16px',
  },
  retryButton: {
    backgroundColor: '#3498db',
    color: '#ffffff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '32px',
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center' as const,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid #ecf0f1',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '8px',
  },
  statLabel: {
    fontSize: '14px',
    color: '#7f8c8d',
  },
  section: {
    marginBottom: '32px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#2c3e50',
    margin: '0 0 16px 0',
  },
  cardList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  cardItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    border: '1px solid #ecf0f1',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '4px',
  },
  cardPrice: {
    fontSize: '14px',
    color: '#7f8c8d',
  },
  priceChange: {
    fontSize: '16px',
    fontWeight: 'bold',
  },
  cardVolume: {
    fontSize: '14px',
    color: '#7f8c8d',
  },
};

export default MarketOverview;
