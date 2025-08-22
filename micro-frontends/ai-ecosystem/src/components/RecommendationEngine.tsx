import React, { useState, useEffect } from 'react';
import { AIRecommendation } from '../types';

const RecommendationEngine: React.FC = () => {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    'all' | 'investment' | 'collection' | 'trading' | 'market_opportunity'
  >('all');
  const [priorityFilter, setPriorityFilter] = useState<
    'all' | 'low' | 'medium' | 'high' | 'critical'
  >('all');

  useEffect(() => {
    const loadRecommendations = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockRecommendations: AIRecommendation[] = [
        {
          id: '1',
          userId: 'user1',
          type: 'investment',
          title: '青眼白龍投資機會',
          description:
            '基於市場分析，建議在當前價格買入青眼白龍，預期短期內有15%的漲幅',
          confidence: 87.5,
          priority: 'high',
          targetCards: ['card1'],
          expectedReturn: 15.5,
          risk: 'medium',
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          userId: 'user1',
          type: 'collection',
          title: '完善龍族收藏',
          description: '建議收集真紅眼黑龍來完善您的龍族卡片收藏',
          confidence: 92.3,
          priority: 'medium',
          targetCards: ['card3'],
          expectedReturn: 8.2,
          risk: 'low',
          timestamp: new Date().toISOString(),
        },
        {
          id: '3',
          userId: 'user1',
          type: 'trading',
          title: '短線交易機會',
          description: '黑魔導價格波動較大，適合短線交易操作',
          confidence: 78.9,
          priority: 'critical',
          targetCards: ['card2'],
          expectedReturn: 25.0,
          risk: 'high',
          timestamp: new Date().toISOString(),
        },
      ];

      setRecommendations(mockRecommendations);
      setLoading(false);
    };

    loadRecommendations();
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'investment':
        return '💰';
      case 'collection':
        return '📚';
      case 'trading':
        return '📈';
      case 'market_opportunity':
        return '🎯';
      default:
        return '💡';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'investment':
        return '投資建議';
      case 'collection':
        return '收藏建議';
      case 'trading':
        return '交易建議';
      case 'market_opportunity':
        return '市場機會';
      default:
        return type;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const filteredRecommendations = recommendations.filter(
    (rec) =>
      (filter === 'all' || rec.type === filter) &&
      (priorityFilter === 'all' || rec.priority === priorityFilter)
  );

  const acceptRecommendation = (id: string) => {
    setRecommendations((prev) =>
      prev.map((rec) => (rec.id === id ? { ...rec, accepted: true } : rec))
    );
    alert('推薦已接受！');
  };

  if (loading) {
    return <div className="recommendation-engine loading">載入推薦中...</div>;
  }

  return (
    <div className="recommendation-engine">
      <div className="engine-header">
        <h3>AI 推薦引擎</h3>
        <div className="engine-filters">
          <div className="filter-group">
            <label>推薦類型:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
            >
              <option value="all">全部類型</option>
              <option value="investment">投資建議</option>
              <option value="collection">收藏建議</option>
              <option value="trading">交易建議</option>
              <option value="market_opportunity">市場機會</option>
            </select>
          </div>
          <div className="filter-group">
            <label>優先級:</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
            >
              <option value="all">全部優先級</option>
              <option value="critical">緊急</option>
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </div>
        </div>
      </div>

      <div className="recommendations-summary">
        <div className="summary-card">
          <span className="summary-number">{recommendations.length}</span>
          <span className="summary-label">總推薦數</span>
        </div>
        <div className="summary-card">
          <span className="summary-number">
            {
              recommendations.filter(
                (r) => r.priority === 'high' || r.priority === 'critical'
              ).length
            }
          </span>
          <span className="summary-label">重要推薦</span>
        </div>
        <div className="summary-card">
          <span className="summary-number">
            {(
              recommendations.reduce((sum, r) => sum + r.expectedReturn, 0) /
              recommendations.length
            ).toFixed(1)}
            %
          </span>
          <span className="summary-label">平均預期收益</span>
        </div>
      </div>

      <div className="recommendations-list">
        {filteredRecommendations.map((rec) => (
          <div
            key={rec.id}
            className={`recommendation-card ${getPriorityColor(rec.priority)}`}
          >
            <div className="recommendation-header">
              <div className="recommendation-type">
                <span className="type-icon">{getTypeIcon(rec.type)}</span>
                <span className="type-label">{getTypeLabel(rec.type)}</span>
              </div>
              <div className="recommendation-priority">
                <span
                  className={`priority-badge ${getPriorityColor(rec.priority)}`}
                >
                  {rec.priority === 'critical'
                    ? '緊急'
                    : rec.priority === 'high'
                      ? '高'
                      : rec.priority === 'medium'
                        ? '中'
                        : '低'}
                </span>
              </div>
            </div>

            <div className="recommendation-content">
              <h4>{rec.title}</h4>
              <p>{rec.description}</p>
            </div>

            <div className="recommendation-metrics">
              <div className="metric">
                <span className="metric-label">置信度</span>
                <span className="metric-value">{rec.confidence}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">預期收益</span>
                <span className="metric-value">{rec.expectedReturn}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">風險等級</span>
                <span className={`risk-badge ${getRiskColor(rec.risk)}`}>
                  {rec.risk === 'high'
                    ? '高'
                    : rec.risk === 'medium'
                      ? '中'
                      : '低'}
                </span>
              </div>
            </div>

            <div className="recommendation-targets">
              <span className="targets-label">目標卡片:</span>
              <div className="target-cards">
                {rec.targetCards.map((cardId, index) => (
                  <span key={index} className="target-card">
                    {cardId}
                  </span>
                ))}
              </div>
            </div>

            <div className="recommendation-footer">
              <span className="recommendation-time">
                {new Date(rec.timestamp).toLocaleString()}
              </span>
              <div className="recommendation-actions">
                <button
                  className="btn btn-success"
                  onClick={() => acceptRecommendation(rec.id)}
                >
                  接受推薦
                </button>
                <button className="btn btn-primary">查看詳情</button>
                <button className="btn btn-secondary">稍後提醒</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRecommendations.length === 0 && (
        <div className="no-recommendations">
          <p>沒有找到符合條件的推薦</p>
          <button
            className="btn btn-primary"
            onClick={() => {
              setFilter('all');
              setPriorityFilter('all');
            }}
          >
            清除篩選
          </button>
        </div>
      )}
    </div>
  );
};

export default RecommendationEngine;
