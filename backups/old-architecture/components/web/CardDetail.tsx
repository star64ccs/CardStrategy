import React, { useState, useEffect } from 'react';
import { Card } from '../../services/cardService';
import { aiService, AIAnalysis } from '../../services/aiService';
import { logger } from '../../utils/logger';

interface CardDetailProps {
  card: Card;
  onClose: () => void;
  onAddToPortfolio?: (card: Card) => void;
}

const CardDetail: React.FC<CardDetailProps> = ({
  card,
  onClose,
  onAddToPortfolio,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'market' | 'analysis'
  >('overview');
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
    }).format(price);
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

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    }
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  };

  // 載入 AI 分析
  useEffect(() => {
    if (activeTab === 'analysis' && !aiAnalysis && !loadingAnalysis) {
      loadAIAnalysis();
    }
  }, [activeTab, aiAnalysis, loadingAnalysis]);

  const loadAIAnalysis = async () => {
    setLoadingAnalysis(true);
    try {
      const response = await aiService.getCardAnalysis(card.id);
      if (response.success && response.data) {
        setAiAnalysis(response.data);
      }
    } catch (error) {
      logger.error('載入 AI 分析失敗:', { error });
    } finally {
      setLoadingAnalysis(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* 關閉按鈕 */}
        <button style={styles.closeButton} onClick={onClose}>
          ✕
        </button>

        {/* 卡片圖片區域 */}
        <div style={styles.imageSection}>
          <img
            src={card.imageUrl}
            alt={card.name}
            style={styles.cardImage}
            onError={e => {
              e.currentTarget.src =
                'https://via.placeholder.com/400x600/ecf0f1/2c3e50?text=No+Image';
            }}
          />
          <div style={styles.rarityBadge}>{card.rarity}</div>
        </div>

        {/* 內容區域 */}
        <div style={styles.contentSection}>
          {/* 標題和基本信息 */}
          <div style={styles.header}>
            <h1 style={styles.title}>{card.name}</h1>
            <p style={styles.setName}>{card.setName}</p>
            <p style={styles.type}>{card.type}</p>
          </div>

          {/* 價格信息 */}
          <div style={styles.priceSection}>
            <div style={styles.currentPrice}>
              {formatPrice(card.price.current)}
            </div>
            <div style={styles.priceChanges}>
              <div
                style={{
                  ...styles.priceChange,
                  color: getPriceChangeColor(card.price.change24h),
                }}
              >
                24h: {getPriceChangeIcon(card.price.change24h)}{' '}
                {formatPrice(Math.abs(card.price.change24h))}
              </div>
              <div
                style={{
                  ...styles.priceChange,
                  color: getPriceChangeColor(card.price.change7d),
                }}
              >
                7d: {getPriceChangeIcon(card.price.change7d)}{' '}
                {formatPrice(Math.abs(card.price.change7d))}
              </div>
              <div
                style={{
                  ...styles.priceChange,
                  color: getPriceChangeColor(card.price.change30d),
                }}
              >
                30d: {getPriceChangeIcon(card.price.change30d)}{' '}
                {formatPrice(Math.abs(card.price.change30d))}
              </div>
            </div>
          </div>

          {/* 標籤 */}
          <div style={styles.tags}>
            {card.tags.map((tag, index) => (
              <span key={index} style={styles.tag}>
                {tag}
              </span>
            ))}
          </div>

          {/* 操作按鈕 */}
          <div style={styles.actions}>
            <button
              style={styles.primaryButton}
              onClick={() => onAddToPortfolio?.(card)}
            >
              💎 加入投資組合
            </button>
            <button style={styles.secondaryButton}>📊 查看市場分析</button>
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
                ...(activeTab === 'market' && styles.activeTab),
              }}
              onClick={() => setActiveTab('market')}
            >
              市場數據
            </button>
            <button
              style={{
                ...styles.tab,
                ...(activeTab === 'analysis' && styles.activeTab),
              }}
              onClick={() => setActiveTab('analysis')}
            >
              AI分析
            </button>
          </div>

          {/* 標籤頁內容 */}
          <div style={styles.tabContent}>
            {activeTab === 'overview' && (
              <div>
                <h3 style={styles.sectionTitle}>卡片描述</h3>
                <p style={styles.description}>{card.description}</p>

                {card.stats && (card.stats.attack || card.stats.defense) && (
                  <>
                    <h3 style={styles.sectionTitle}>屬性</h3>
                    <div style={styles.stats}>
                      {card.stats.attack && (
                        <div style={styles.stat}>
                          <span style={styles.statLabel}>攻擊力</span>
                          <span style={styles.statValue}>
                            {card.stats.attack}
                          </span>
                        </div>
                      )}
                      {card.stats.defense && (
                        <div style={styles.stat}>
                          <span style={styles.statLabel}>防禦力</span>
                          <span style={styles.statValue}>
                            {card.stats.defense}
                          </span>
                        </div>
                      )}
                      {card.stats.health && (
                        <div style={styles.stat}>
                          <span style={styles.statLabel}>生命值</span>
                          <span style={styles.statValue}>
                            {card.stats.health}
                          </span>
                        </div>
                      )}
                      {card.stats.mana && (
                        <div style={styles.stat}>
                          <span style={styles.statLabel}>法力值</span>
                          <span style={styles.statValue}>
                            {card.stats.mana}
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'market' && (
              <div>
                <h3 style={styles.sectionTitle}>市場數據</h3>
                <div style={styles.marketData}>
                  <div style={styles.marketItem}>
                    <span style={styles.marketLabel}>24小時交易量</span>
                    <span style={styles.marketValue}>
                      {formatVolume(card.marketData.volume24h)}
                    </span>
                  </div>
                  <div style={styles.marketItem}>
                    <span style={styles.marketLabel}>總供應量</span>
                    <span style={styles.marketValue}>
                      {formatVolume(card.marketData.totalSupply)}
                    </span>
                  </div>
                  <div style={styles.marketItem}>
                    <span style={styles.marketLabel}>流通供應量</span>
                    <span style={styles.marketValue}>
                      {formatVolume(card.marketData.circulatingSupply)}
                    </span>
                  </div>
                </div>

                <h3 style={styles.sectionTitle}>價格趨勢</h3>
                <div style={styles.priceTrend}>
                  <div style={styles.trendItem}>
                    <span style={styles.trendLabel}>24小時</span>
                    <span
                      style={{
                        ...styles.trendValue,
                        color: getPriceChangeColor(card.price.change24h),
                      }}
                    >
                      {getPriceChangeIcon(card.price.change24h)}{' '}
                      {formatPrice(Math.abs(card.price.change24h))}
                    </span>
                  </div>
                  <div style={styles.trendItem}>
                    <span style={styles.trendLabel}>7天</span>
                    <span
                      style={{
                        ...styles.trendValue,
                        color: getPriceChangeColor(card.price.change7d),
                      }}
                    >
                      {getPriceChangeIcon(card.price.change7d)}{' '}
                      {formatPrice(Math.abs(card.price.change7d))}
                    </span>
                  </div>
                  <div style={styles.trendItem}>
                    <span style={styles.trendLabel}>30天</span>
                    <span
                      style={{
                        ...styles.trendValue,
                        color: getPriceChangeColor(card.price.change30d),
                      }}
                    >
                      {getPriceChangeIcon(card.price.change30d)}{' '}
                      {formatPrice(Math.abs(card.price.change30d))}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analysis' && (
              <div>
                <h3 style={styles.sectionTitle}>AI 投資建議</h3>
                {loadingAnalysis ? (
                  <div style={styles.loadingContainer}>
                    <div style={styles.loadingSpinner}>🔄</div>
                    <p style={styles.loadingText}>AI 正在分析中...</p>
                  </div>
                ) : aiAnalysis ? (
                  <div style={styles.aiAnalysis}>
                    <div style={styles.analysisCard}>
                      <h4 style={styles.analysisTitle}>📈 投資評級</h4>
                      <div style={styles.rating}>
                        <span style={styles.ratingValue}>
                          {aiAnalysis.rating}
                        </span>
                        <span style={styles.ratingText}>
                          {aiAnalysis.rating === 'A+'
                            ? '強烈推薦'
                            : aiAnalysis.rating === 'A'
                              ? '推薦'
                              : aiAnalysis.rating === 'B+'
                                ? '良好'
                                : aiAnalysis.rating === 'B'
                                  ? '一般'
                                  : aiAnalysis.rating === 'C+'
                                    ? '謹慎'
                                    : aiAnalysis.rating === 'C'
                                      ? '不推薦'
                                      : '避免'}
                        </span>
                      </div>
                      <div style={styles.confidence}>
                        可信度: {(aiAnalysis.confidence * 100).toFixed(0)}%
                      </div>
                    </div>

                    <div style={styles.analysisCard}>
                      <h4 style={styles.analysisTitle}>🎯 風險評估</h4>
                      <div style={styles.riskLevel}>
                        <span
                          style={{
                            ...styles.riskValue,
                            color:
                              aiAnalysis.riskLevel === 'low'
                                ? '#27ae60'
                                : aiAnalysis.riskLevel === 'medium'
                                  ? '#f39c12'
                                  : '#e74c3c',
                          }}
                        >
                          {aiAnalysis.riskLevel === 'low'
                            ? '低風險'
                            : aiAnalysis.riskLevel === 'medium'
                              ? '中等風險'
                              : '高風險'}
                        </span>
                        <span style={styles.riskText}>
                          {aiAnalysis.riskLevel === 'low'
                            ? '適合保守投資者'
                            : aiAnalysis.riskLevel === 'medium'
                              ? '適合穩健投資者'
                              : '適合激進投資者'}
                        </span>
                      </div>
                    </div>

                    <div style={styles.analysisCard}>
                      <h4 style={styles.analysisTitle}>📊 價格目標</h4>
                      <div style={styles.priceTargets}>
                        <div style={styles.priceTarget}>
                          <span style={styles.targetLabel}>短期 (1週)</span>
                          <span style={styles.targetValue}>
                            {formatPrice(aiAnalysis.priceTarget.short)}
                          </span>
                        </div>
                        <div style={styles.priceTarget}>
                          <span style={styles.targetLabel}>中期 (1月)</span>
                          <span style={styles.targetValue}>
                            {formatPrice(aiAnalysis.priceTarget.medium)}
                          </span>
                        </div>
                        <div style={styles.priceTarget}>
                          <span style={styles.targetLabel}>長期 (3月)</span>
                          <span style={styles.targetValue}>
                            {formatPrice(aiAnalysis.priceTarget.long)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={styles.analysisCard}>
                      <h4 style={styles.analysisTitle}>💡 投資建議</h4>
                      <div style={styles.recommendations}>
                        {aiAnalysis.recommendations.map((rec, index) => (
                          <div key={index} style={styles.recommendation}>
                            • {rec}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={styles.analysisCard}>
                      <h4 style={styles.analysisTitle}>📋 分析摘要</h4>
                      <p style={styles.summary}>{aiAnalysis.summary}</p>
                    </div>
                  </div>
                ) : (
                  <div style={styles.errorContainer}>
                    <p style={styles.errorText}>無法載入 AI 分析，請稍後再試</p>
                    <button style={styles.retryButton} onClick={loadAIAnalysis}>
                      重新載入
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
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
    maxWidth: '900px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
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
  imageSection: {
    flex: '0 0 300px',
    position: 'relative' as const,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  rarityBadge: {
    position: 'absolute' as const,
    top: '16px',
    left: '16px',
    backgroundColor: '#f39c12',
    color: '#ffffff',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  contentSection: {
    flex: 1,
    padding: '24px',
    overflowY: 'auto' as const,
  },
  header: {
    marginBottom: '20px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#2c3e50',
    margin: '0 0 8px 0',
  },
  setName: {
    fontSize: '16px',
    color: '#7f8c8d',
    margin: '0 0 4px 0',
  },
  type: {
    fontSize: '16px',
    color: '#3498db',
    margin: '0',
    fontWeight: '500',
  },
  priceSection: {
    marginBottom: '20px',
  },
  currentPrice: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '8px',
  },
  priceChanges: {
    display: 'flex',
    gap: '16px',
  },
  priceChange: {
    fontSize: '14px',
    fontWeight: '500',
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '8px',
    marginBottom: '24px',
  },
  tag: {
    backgroundColor: '#ecf0f1',
    color: '#2c3e50',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
  },
  primaryButton: {
    backgroundColor: '#3498db',
    color: '#ffffff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  secondaryButton: {
    backgroundColor: '#ecf0f1',
    color: '#2c3e50',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #ecf0f1',
    marginBottom: '20px',
  },
  tab: {
    backgroundColor: 'transparent',
    border: 'none',
    padding: '12px 20px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#7f8c8d',
    borderBottom: '2px solid transparent',
  },
  activeTab: {
    color: '#3498db',
    borderBottomColor: '#3498db',
  },
  tabContent: {
    minHeight: '200px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#2c3e50',
    margin: '0 0 12px 0',
  },
  description: {
    fontSize: '14px',
    color: '#7f8c8d',
    lineHeight: '1.6',
    marginBottom: '20px',
  },
  stats: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: '12px',
    color: '#7f8c8d',
    textTransform: 'uppercase' as const,
    marginBottom: '4px',
  },
  statValue: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  marketData: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
    marginBottom: '20px',
  },
  marketItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  },
  marketLabel: {
    fontSize: '12px',
    color: '#7f8c8d',
    marginBottom: '4px',
  },
  marketValue: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  priceTrend: {
    display: 'flex',
    gap: '16px',
  },
  trendItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    minWidth: '80px',
  },
  trendLabel: {
    fontSize: '12px',
    color: '#7f8c8d',
    marginBottom: '4px',
  },
  trendValue: {
    fontSize: '14px',
    fontWeight: 'bold',
  },
  aiAnalysis: {
    display: 'grid',
    gap: '16px',
  },
  analysisCard: {
    padding: '16px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  },
  analysisTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#2c3e50',
    margin: '0 0 12px 0',
  },
  rating: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  ratingValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#27ae60',
  },
  ratingText: {
    fontSize: '14px',
    color: '#7f8c8d',
  },
  riskLevel: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  riskValue: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#f39c12',
  },
  riskText: {
    fontSize: '14px',
    color: '#7f8c8d',
  },
  prediction: {
    fontSize: '14px',
    color: '#7f8c8d',
    lineHeight: '1.6',
    margin: 0,
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
    textAlign: 'center' as const,
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
  confidence: {
    fontSize: '12px',
    color: '#7f8c8d',
    marginTop: '8px',
  },
  priceTargets: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  priceTarget: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  targetLabel: {
    fontSize: '14px',
    color: '#7f8c8d',
  },
  targetValue: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  recommendations: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  recommendation: {
    fontSize: '14px',
    color: '#2c3e50',
    lineHeight: '1.4',
  },
  summary: {
    fontSize: '14px',
    color: '#7f8c8d',
    lineHeight: '1.6',
    margin: 0,
  },
};

export default CardDetail;
