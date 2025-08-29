import React, { useState } from 'react';
import { PortfolioItem, PortfolioStats } from '../../services/portfolioService';

interface PortfolioDisplayProps {
  portfolio: PortfolioItem[];
  stats: PortfolioStats;
  onRemoveItem?: (itemId: string) => void;
  onClose?: () => void;
}

const PortfolioDisplay: React.FC<PortfolioDisplayProps> = ({
  portfolio,
  stats,
  onRemoveItem,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>(
    'overview'
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW');
  };

  const getProfitColor = (profit: number) => {
    return profit >= 0 ? '#27ae60' : '#e74c3c';
  };

  const getProfitIcon = (profit: number) => {
    return profit >= 0 ? '↗️' : '↘️';
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* 關閉按鈕 */}
        <button style={styles.closeButton} onClick={onClose}>
          ✕
        </button>

        {/* 標題 */}
        <div style={styles.header}>
          <h1 style={styles.title}>💎 我的投資組合</h1>
          <p style={styles.subtitle}>管理您的卡牌投資</p>
        </div>

        {/* 統計概覽 */}
        <div style={styles.statsOverview}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{formatPrice(stats.totalValue)}</div>
            <div style={styles.statLabel}>總價值</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{formatPrice(stats.totalCost)}</div>
            <div style={styles.statLabel}>總成本</div>
          </div>
          <div style={styles.statCard}>
            <div
              style={{
                ...styles.statValue,
                color: getProfitColor(stats.totalProfit),
              }}
            >
              {getProfitIcon(stats.totalProfit)}{' '}
              {formatPrice(Math.abs(stats.totalProfit))}
            </div>
            <div style={styles.statLabel}>總收益</div>
          </div>
          <div style={styles.statCard}>
            <div
              style={{
                ...styles.statValue,
                color: getProfitColor(stats.profitPercentage),
              }}
            >
              {stats.profitPercentage >= 0 ? '+' : ''}
              {stats.profitPercentage.toFixed(2)}%
            </div>
            <div style={styles.statLabel}>收益率</div>
          </div>
        </div>

        {/* 標籤頁 */}
        <div style={styles.tabs}>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'overview' && styles.activeTab),
            }}
            onClick={() => setActiveTab('overview')}
          >
            概覽
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'details' && styles.activeTab),
            }}
            onClick={() => setActiveTab('details')}
          >
            詳細列表
          </button>
        </div>

        {/* 標籤頁內容 */}
        <div style={styles.tabContent}>
          {activeTab === 'overview' && (
            <div>
              <div style={styles.summaryCards}>
                <div style={styles.summaryCard}>
                  <h3 style={styles.summaryTitle}>📊 投資概況</h3>
                  <div style={styles.summaryItem}>
                    <span>卡片種類:</span>
                    <span style={styles.summaryValue}>{stats.uniqueCards}</span>
                  </div>
                  <div style={styles.summaryItem}>
                    <span>總卡片數:</span>
                    <span style={styles.summaryValue}>{stats.totalCards}</span>
                  </div>
                  <div style={styles.summaryItem}>
                    <span>平均單價:</span>
                    <span style={styles.summaryValue}>
                      {stats.totalCards > 0
                        ? formatPrice(stats.totalCost / stats.totalCards)
                        : 'N/A'}
                    </span>
                  </div>
                </div>

                <div style={styles.summaryCard}>
                  <h3 style={styles.summaryTitle}>📈 收益分析</h3>
                  <div style={styles.summaryItem}>
                    <span>投資回報率:</span>
                    <span
                      style={{
                        ...styles.summaryValue,
                        color: getProfitColor(stats.profitPercentage),
                      }}
                    >
                      {stats.profitPercentage >= 0 ? '+' : ''}
                      {stats.profitPercentage.toFixed(2)}%
                    </span>
                  </div>
                  <div style={styles.summaryItem}>
                    <span>絕對收益:</span>
                    <span
                      style={{
                        ...styles.summaryValue,
                        color: getProfitColor(stats.totalProfit),
                      }}
                    >
                      {getProfitIcon(stats.totalProfit)}{' '}
                      {formatPrice(Math.abs(stats.totalProfit))}
                    </span>
                  </div>
                  <div style={styles.summaryItem}>
                    <span>投資效率:</span>
                    <span style={styles.summaryValue}>
                      {stats.totalCost > 0
                        ? ((stats.totalValue / stats.totalCost) * 100).toFixed(
                            1
                          )
                        : 'N/A'}
                      %
                    </span>
                  </div>
                </div>
              </div>

              {portfolio.length > 0 && (
                <div style={styles.recentItems}>
                  <h3 style={styles.sectionTitle}>最近添加</h3>
                  <div style={styles.recentGrid}>
                    {portfolio.slice(0, 3).map(item => (
                      <div key={item.id} style={styles.recentItem}>
                        <img
                          src={item.card.imageUrl}
                          alt={item.card.name}
                          style={styles.recentImage}
                          onError={e => {
                            e.currentTarget.src =
                              'https://via.placeholder.com/100x140/ecf0f1/2c3e50?text=No+Image';
                          }}
                        />
                        <div style={styles.recentInfo}>
                          <div style={styles.recentName}>{item.card.name}</div>
                          <div style={styles.recentQuantity}>
                            數量: {item.quantity}
                          </div>
                          <div style={styles.recentDate}>
                            {formatDate(item.purchaseDate)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'details' && (
            <div>
              {portfolio.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>💎</div>
                  <h3 style={styles.emptyTitle}>投資組合為空</h3>
                  <p style={styles.emptyText}>
                    您還沒有添加任何卡片到投資組合中。
                    <br />
                    瀏覽卡片並添加到您的投資組合開始投資吧！
                  </p>
                </div>
              ) : (
                <div style={styles.portfolioList}>
                  {portfolio.map(item => {
                    const currentValue =
                      item.card.price.current * item.quantity;
                    const costValue = item.purchasePrice * item.quantity;
                    const profit = currentValue - costValue;
                    const profitPercentage =
                      costValue > 0 ? (profit / costValue) * 100 : 0;

                    return (
                      <div key={item.id} style={styles.portfolioItem}>
                        <div style={styles.itemImage}>
                          <img
                            src={item.card.imageUrl}
                            alt={item.card.name}
                            style={styles.cardImage}
                            onError={e => {
                              e.currentTarget.src =
                                'https://via.placeholder.com/80x120/ecf0f1/2c3e50?text=No+Image';
                            }}
                          />
                        </div>

                        <div style={styles.itemInfo}>
                          <div style={styles.itemName}>{item.card.name}</div>
                          <div style={styles.itemSet}>{item.card.setName}</div>
                          <div style={styles.itemRarity}>
                            {item.card.rarity}
                          </div>
                        </div>

                        <div style={styles.itemQuantity}>
                          <div style={styles.quantityLabel}>數量</div>
                          <div style={styles.quantityValue}>
                            {item.quantity}
                          </div>
                        </div>

                        <div style={styles.itemPrice}>
                          <div style={styles.priceLabel}>購入價</div>
                          <div style={styles.priceValue}>
                            {formatPrice(item.purchasePrice)}
                          </div>
                        </div>

                        <div style={styles.itemCurrent}>
                          <div style={styles.currentLabel}>現價</div>
                          <div style={styles.currentValue}>
                            {formatPrice(item.card.price.current)}
                          </div>
                        </div>

                        <div style={styles.itemProfit}>
                          <div style={styles.profitLabel}>收益</div>
                          <div
                            style={{
                              ...styles.profitValue,
                              color: getProfitColor(profit),
                            }}
                          >
                            {getProfitIcon(profit)}{' '}
                            {formatPrice(Math.abs(profit))}
                          </div>
                          <div
                            style={{
                              ...styles.profitPercentage,
                              color: getProfitColor(profitPercentage),
                            }}
                          >
                            {profitPercentage >= 0 ? '+' : ''}
                            {profitPercentage.toFixed(1)}%
                          </div>
                        </div>

                        <div style={styles.itemActions}>
                          <button
                            style={styles.removeButton}
                            onClick={() => onRemoveItem?.(item.id)}
                            title='移除'
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    maxWidth: '1000px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
    position: 'relative' as const,
  },
  closeButton: {
    position: 'absolute' as const,
    top: '16px',
    right: '16px',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    cursor: 'pointer',
    fontSize: '16px',
    zIndex: 10,
  },
  header: {
    padding: '24px 24px 0 24px',
    textAlign: 'center' as const,
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#2c3e50',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '16px',
    color: '#7f8c8d',
    margin: '0 0 24px 0',
  },
  statsOverview: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    padding: '0 24px 24px 24px',
  },
  statCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center' as const,
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
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #ecf0f1',
    padding: '0 24px',
  },
  tab: {
    backgroundColor: 'transparent',
    border: 'none',
    padding: '16px 24px',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#7f8c8d',
    borderBottom: '2px solid transparent',
  },
  activeTab: {
    color: '#3498db',
    borderBottomColor: '#3498db',
  },
  tabContent: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '24px',
  },
  summaryCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginBottom: '32px',
  },
  summaryCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #ecf0f1',
  },
  summaryTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#2c3e50',
    margin: '0 0 16px 0',
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    fontSize: '14px',
  },
  summaryValue: {
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  recentItems: {
    marginTop: '24px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#2c3e50',
    margin: '0 0 16px 0',
  },
  recentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  recentItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #ecf0f1',
  },
  recentImage: {
    width: '50px',
    height: '70px',
    objectFit: 'cover',
    borderRadius: '4px',
  },
  recentInfo: {
    flex: 1,
  },
  recentName: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '4px',
  },
  recentQuantity: {
    fontSize: '12px',
    color: '#7f8c8d',
    marginBottom: '2px',
  },
  recentDate: {
    fontSize: '12px',
    color: '#7f8c8d',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '60px 20px',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#2c3e50',
    margin: '0 0 12px 0',
  },
  emptyText: {
    fontSize: '16px',
    color: '#7f8c8d',
    lineHeight: '1.6',
  },
  portfolioList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  portfolioItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    border: '1px solid #ecf0f1',
  },
  itemImage: {
    flexShrink: 0,
  },
  cardImage: {
    width: '60px',
    height: '84px',
    objectFit: 'cover',
    borderRadius: '6px',
  },
  itemInfo: {
    flex: 1,
    minWidth: 0,
  },
  itemName: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '4px',
  },
  itemSet: {
    fontSize: '12px',
    color: '#7f8c8d',
    marginBottom: '2px',
  },
  itemRarity: {
    fontSize: '12px',
    color: '#f39c12',
    fontWeight: 'bold',
  },
  itemQuantity: {
    textAlign: 'center' as const,
    minWidth: '60px',
  },
  quantityLabel: {
    fontSize: '12px',
    color: '#7f8c8d',
    marginBottom: '4px',
  },
  quantityValue: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  itemPrice: {
    textAlign: 'center' as const,
    minWidth: '80px',
  },
  priceLabel: {
    fontSize: '12px',
    color: '#7f8c8d',
    marginBottom: '4px',
  },
  priceValue: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  itemCurrent: {
    textAlign: 'center' as const,
    minWidth: '80px',
  },
  currentLabel: {
    fontSize: '12px',
    color: '#7f8c8d',
    marginBottom: '4px',
  },
  currentValue: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  itemProfit: {
    textAlign: 'center' as const,
    minWidth: '100px',
  },
  profitLabel: {
    fontSize: '12px',
    color: '#7f8c8d',
    marginBottom: '4px',
  },
  profitValue: {
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '2px',
  },
  profitPercentage: {
    fontSize: '12px',
    fontWeight: '500',
  },
  itemActions: {
    flexShrink: 0,
  },
  removeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '8px',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
  },
};

export default PortfolioDisplay;
