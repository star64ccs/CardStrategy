import React, { useState, useEffect } from 'react';
import { MarketInsight } from '../types';

const MarketInsights: React.FC = () => {
  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    | 'all'
    | 'price_spike'
    | 'volume_surge'
    | 'trend_change'
    | 'market_opportunity'
  >('all');
  const [severityFilter, setSeverityFilter] = useState<
    'all' | 'low' | 'medium' | 'high' | 'critical'
  >('all');

  useEffect(() => {
    const loadInsights = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockInsights: MarketInsight[] = [
        {
          id: '1',
          title: '青眼白龍價格飆升',
          description:
            '青眼白龍在過去24小時內價格上漲了15%，交易量增加200%，可能是由於新版本發布或市場炒作導致。',
          type: 'price_spike',
          severity: 'high',
          affectedCards: ['card1'],
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: '黑魔導交易量激增',
          description:
            '黑魔導的交易量在過去6小時內增加了300%，但價格保持穩定，可能預示著大戶在收集籌碼。',
          type: 'volume_surge',
          severity: 'medium',
          affectedCards: ['card2'],
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          title: '市場趨勢轉變信號',
          description:
            '多個熱門卡片的價格趨勢出現轉變，從上升趨勢轉為橫盤整理，建議投資者謹慎操作。',
          type: 'trend_change',
          severity: 'critical',
          affectedCards: ['card1', 'card2', 'card3'],
          createdAt: new Date().toISOString(),
        },
        {
          id: '4',
          title: '新卡包發售機會',
          description:
            '即將發售的新卡包中包含多張稀有卡片，預期會帶動相關舊卡片的價格上漲。',
          type: 'market_opportunity',
          severity: 'low',
          affectedCards: ['card4', 'card5'],
          createdAt: new Date().toISOString(),
        },
      ];

      setInsights(mockInsights);
      setLoading(false);
    };

    loadInsights();
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'price_spike':
        return '📈';
      case 'volume_surge':
        return '📊';
      case 'trend_change':
        return '🔄';
      case 'market_opportunity':
        return '💡';
      default:
        return '📋';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'price_spike':
        return '價格飆升';
      case 'volume_surge':
        return '交易量激增';
      case 'trend_change':
        return '趨勢轉變';
      case 'market_opportunity':
        return '市場機會';
      default:
        return '其他';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'critical';
      case 'high':
        return 'high';
      case 'medium':
        return 'medium';
      case 'low':
        return 'low';
      default:
        return 'medium';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '嚴重';
      case 'high':
        return '高';
      case 'medium':
        return '中';
      case 'low':
        return '低';
      default:
        return '中';
    }
  };

  const filteredInsights = insights.filter(
    (insight) =>
      (filter === 'all' || insight.type === filter) &&
      (severityFilter === 'all' || insight.severity === severityFilter)
  );

  if (loading) {
    return <div className="market-insights loading">載入市場洞察中...</div>;
  }

  return (
    <div className="market-insights">
      <div className="insights-header">
        <h3>市場洞察分析</h3>
        <div className="insights-filters">
          <div className="filter-group">
            <label>類型篩選:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
            >
              <option value="all">全部類型</option>
              <option value="price_spike">價格飆升</option>
              <option value="volume_surge">交易量激增</option>
              <option value="trend_change">趨勢轉變</option>
              <option value="market_opportunity">市場機會</option>
            </select>
          </div>
          <div className="filter-group">
            <label>嚴重程度:</label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as any)}
            >
              <option value="all">全部程度</option>
              <option value="critical">嚴重</option>
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </div>
        </div>
      </div>

      <div className="insights-stats">
        <div className="stat-card">
          <span className="stat-number">{insights.length}</span>
          <span className="stat-label">總洞察數</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {
              insights.filter(
                (i) => i.severity === 'critical' || i.severity === 'high'
              ).length
            }
          </span>
          <span className="stat-label">重要洞察</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {insights.filter((i) => i.type === 'market_opportunity').length}
          </span>
          <span className="stat-label">投資機會</span>
        </div>
      </div>

      <div className="insights-list">
        {filteredInsights.map((insight) => (
          <div
            key={insight.id}
            className={`insight-card ${getSeverityColor(insight.severity)}`}
          >
            <div className="insight-header">
              <div className="insight-type">
                <span className="type-icon">{getTypeIcon(insight.type)}</span>
                <span className="type-label">{getTypeLabel(insight.type)}</span>
              </div>
              <div className="insight-severity">
                <span
                  className={`severity-badge ${getSeverityColor(insight.severity)}`}
                >
                  {getSeverityLabel(insight.severity)}
                </span>
              </div>
            </div>

            <div className="insight-content">
              <h4>{insight.title}</h4>
              <p>{insight.description}</p>
            </div>

            <div className="insight-meta">
              <div className="affected-cards">
                <span className="meta-label">受影響卡片:</span>
                <span className="cards-count">
                  {insight.affectedCards.length} 張
                </span>
              </div>
              <div className="insight-time">
                <span className="meta-label">發現時間:</span>
                <span>{new Date(insight.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="insight-actions">
              <button className="btn btn-primary">查看詳情</button>
              <button className="btn btn-secondary">設置警報</button>
              <button className="btn btn-outline">分享</button>
            </div>
          </div>
        ))}
      </div>

      {filteredInsights.length === 0 && (
        <div className="no-insights">
          <p>沒有找到符合條件的市場洞察</p>
          <button
            className="btn btn-primary"
            onClick={() => {
              setFilter('all');
              setSeverityFilter('all');
            }}
          >
            清除篩選
          </button>
        </div>
      )}
    </div>
  );
};

export default MarketInsights;
