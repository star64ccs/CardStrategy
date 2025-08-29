import React, { useState } from 'react';

interface PortfolioItem {
  id: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  totalValue: number;
  profitLoss: number;
  profitLossPercentage: number;
  imageUrl: string;
}

interface PortfolioData {
  totalValue: number;
  totalProfitLoss: number;
  totalProfitLossPercentage: number;
  items: PortfolioItem[];
}

const Portfolio: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'profit' | 'loss'
  >('all');

  // 模擬投資組合數據
  const portfolioData: PortfolioData = {
    totalValue: 125000,
    totalProfitLoss: 18500,
    totalProfitLossPercentage: 17.4,
    items: [
      {
        id: '1',
        name: '青眼白龍',
        quantity: 3,
        avgPrice: 1200,
        currentPrice: 1500,
        totalValue: 4500,
        profitLoss: 900,
        profitLossPercentage: 25.0,
        imageUrl:
          'https://via.placeholder.com/60x80/3498db/ffffff?text=青眼白龍',
      },
      {
        id: '2',
        name: '黑魔導',
        quantity: 5,
        avgPrice: 700,
        currentPrice: 800,
        totalValue: 4000,
        profitLoss: 500,
        profitLossPercentage: 14.3,
        imageUrl: 'https://via.placeholder.com/60x80/9b59b6/ffffff?text=黑魔導',
      },
      {
        id: '3',
        name: '混沌戰士',
        quantity: 2,
        avgPrice: 1800,
        currentPrice: 2000,
        totalValue: 4000,
        profitLoss: 400,
        profitLossPercentage: 11.1,
        imageUrl:
          'https://via.placeholder.com/60x80/f39c12/ffffff?text=混沌戰士',
      },
      {
        id: '4',
        name: '真紅眼黑龍',
        quantity: 4,
        avgPrice: 1100,
        currentPrice: 1200,
        totalValue: 4800,
        profitLoss: 400,
        profitLossPercentage: 9.1,
        imageUrl:
          'https://via.placeholder.com/60x80/e74c3c/ffffff?text=真紅眼黑龍',
      },
      {
        id: '5',
        name: '暗黑魔導師',
        quantity: 2,
        avgPrice: 600,
        currentPrice: 450,
        totalValue: 900,
        profitLoss: -300,
        profitLossPercentage: -25.0,
        imageUrl:
          'https://via.placeholder.com/60x80/34495e/ffffff?text=暗黑魔導師',
      },
    ],
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getProfitLossColor = (value: number) => {
    return value >= 0 ? '#27ae60' : '#e74c3c';
  };

  const filteredItems = portfolioData.items.filter(item => {
    if (selectedFilter === 'profit') return item.profitLoss > 0;
    if (selectedFilter === 'loss') return item.profitLoss < 0;
    return true;
  });

  return (
    <div style={styles.container}>
      {/* 投資組合概覽 */}
      <div style={styles.overview}>
        <h2 style={styles.title}>💎 投資組合</h2>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>💰</div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>
                {formatCurrency(portfolioData.totalValue)}
              </div>
              <div style={styles.statLabel}>總資產價值</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>📈</div>
            <div style={styles.statContent}>
              <div
                style={{
                  ...styles.statValue,
                  color: getProfitLossColor(portfolioData.totalProfitLoss),
                }}
              >
                {formatCurrency(portfolioData.totalProfitLoss)}
              </div>
              <div style={styles.statLabel}>總盈虧</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>📊</div>
            <div style={styles.statContent}>
              <div
                style={{
                  ...styles.statValue,
                  color: getProfitLossColor(
                    portfolioData.totalProfitLossPercentage
                  ),
                }}
              >
                {formatPercentage(portfolioData.totalProfitLossPercentage)}
              </div>
              <div style={styles.statLabel}>總收益率</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>🎴</div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{portfolioData.items.length}</div>
              <div style={styles.statLabel}>持有卡片</div>
            </div>
          </div>
        </div>
      </div>

      {/* 篩選器 */}
      <div style={styles.filterSection}>
        <div style={styles.filterButtons}>
          <button
            style={{
              ...styles.filterButton,
              ...(selectedFilter === 'all' && styles.activeFilter),
            }}
            onClick={() => setSelectedFilter('all')}
          >
            全部 ({portfolioData.items.length})
          </button>
          <button
            style={{
              ...styles.filterButton,
              ...(selectedFilter === 'profit' && styles.activeFilter),
            }}
            onClick={() => setSelectedFilter('profit')}
          >
            盈利 (
            {portfolioData.items.filter(item => item.profitLoss > 0).length})
          </button>
          <button
            style={{
              ...styles.filterButton,
              ...(selectedFilter === 'loss' && styles.activeFilter),
            }}
            onClick={() => setSelectedFilter('loss')}
          >
            虧損 (
            {portfolioData.items.filter(item => item.profitLoss < 0).length})
          </button>
        </div>
      </div>

      {/* 投資組合列表 */}
      <div style={styles.portfolioList}>
        {filteredItems.map(item => (
          <div key={item.id} style={styles.portfolioItem}>
            <div style={styles.itemImage}>
              <img
                src={item.imageUrl}
                alt={item.name}
                style={styles.image}
                onError={e => {
                  e.currentTarget.src =
                    'https://via.placeholder.com/60x80/ecf0f1/2c3e50?text=No+Image';
                }}
              />
            </div>

            <div style={styles.itemInfo}>
              <div style={styles.itemName}>{item.name}</div>
              <div style={styles.itemDetails}>
                <span>數量: {item.quantity}</span>
                <span>均價: {formatCurrency(item.avgPrice)}</span>
                <span>現價: {formatCurrency(item.currentPrice)}</span>
              </div>
            </div>

            <div style={styles.itemValue}>
              <div style={styles.totalValue}>
                {formatCurrency(item.totalValue)}
              </div>
              <div style={styles.valueLabel}>總價值</div>
            </div>

            <div style={styles.itemProfitLoss}>
              <div
                style={{
                  ...styles.profitLossValue,
                  color: getProfitLossColor(item.profitLoss),
                }}
              >
                {formatCurrency(item.profitLoss)}
              </div>
              <div
                style={{
                  ...styles.profitLossPercentage,
                  color: getProfitLossColor(item.profitLossPercentage),
                }}
              >
                {formatPercentage(item.profitLossPercentage)}
              </div>
            </div>

            <div style={styles.itemActions}>
              <button style={styles.actionButton}>📊</button>
              <button style={styles.actionButton}>✏️</button>
              <button style={styles.actionButton}>🗑️</button>
            </div>
          </div>
        ))}
      </div>

      {/* 投資建議 */}
      <div style={styles.recommendations}>
        <h3 style={styles.recommendationsTitle}>🤖 AI 投資建議</h3>
        <div style={styles.recommendationsContent}>
          <div style={styles.recommendationCard}>
            <div style={styles.recommendationIcon}>💡</div>
            <div style={styles.recommendationText}>
              <strong>最佳表現：</strong>
              青眼白龍表現優異，建議繼續持有或適度加倉。
            </div>
          </div>

          <div style={styles.recommendationCard}>
            <div style={styles.recommendationIcon}>⚠️</div>
            <div style={styles.recommendationText}>
              <strong>風險提醒：</strong>
              暗黑魔導師持續下跌，建議考慮止損或觀望。
            </div>
          </div>

          <div style={styles.recommendationCard}>
            <div style={styles.recommendationIcon}>🎯</div>
            <div style={styles.recommendationText}>
              <strong>投資策略：</strong>
              建議分散投資，關注龍族和戰士類卡片。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
  },
  overview: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#2c3e50',
    margin: '0 0 20px 0',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e1e8ed',
  },
  statIcon: {
    fontSize: '24px',
    marginRight: '12px',
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: '12px',
    color: '#7f8c8d',
  },
  filterSection: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '24px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  filterButtons: {
    display: 'flex',
    gap: '8px',
  },
  filterButton: {
    padding: '8px 16px',
    border: '1px solid #e1e8ed',
    borderRadius: '6px',
    backgroundColor: '#ffffff',
    color: '#7f8c8d',
    cursor: 'pointer',
    fontSize: '14px',
  },
  activeFilter: {
    backgroundColor: '#3498db',
    color: '#ffffff',
    borderColor: '#3498db',
  },
  portfolioList: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  portfolioItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    borderBottom: '1px solid #e1e8ed',
    ':last-child': {
      borderBottom: 'none',
    },
  },
  itemImage: {
    marginRight: '16px',
  },
  image: {
    width: '60px',
    height: '80px',
    borderRadius: '6px',
    objectFit: 'cover',
  },
  itemInfo: {
    flex: 1,
    marginRight: '16px',
  },
  itemName: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '4px',
  },
  itemDetails: {
    display: 'flex',
    gap: '16px',
    fontSize: '12px',
    color: '#7f8c8d',
  },
  itemValue: {
    textAlign: 'center' as const,
    marginRight: '16px',
    minWidth: '100px',
  },
  totalValue: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '2px',
  },
  valueLabel: {
    fontSize: '10px',
    color: '#7f8c8d',
  },
  itemProfitLoss: {
    textAlign: 'center' as const,
    marginRight: '16px',
    minWidth: '100px',
  },
  profitLossValue: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '2px',
  },
  profitLossPercentage: {
    fontSize: '12px',
  },
  itemActions: {
    display: 'flex',
    gap: '4px',
  },
  actionButton: {
    width: '32px',
    height: '32px',
    border: '1px solid #e1e8ed',
    borderRadius: '4px',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendations: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  recommendationsTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#2c3e50',
    margin: '0 0 16px 0',
  },
  recommendationsContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  recommendationCard: {
    display: 'flex',
    alignItems: 'flex-start',
    padding: '16px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e1e8ed',
  },
  recommendationIcon: {
    fontSize: '20px',
    marginRight: '12px',
    marginTop: '2px',
  },
  recommendationText: {
    fontSize: '14px',
    color: '#2c3e50',
    lineHeight: '1.5',
  },
};

export default Portfolio;
