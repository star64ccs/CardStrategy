import React, { useState, useEffect } from 'react';
import {
  AIModel,
  CardScanResult,
  MarketPrediction,
  AIRecommendation,
} from '../types';

const AIDashboard: React.FC = () => {
  const [models, setModels] = useState<AIModel[]>([]);
  const [scanResults, setScanResults] = useState<CardScanResult[]>([]);
  const [predictions, setPredictions] = useState<MarketPrediction[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockModels: AIModel[] = [
        {
          id: '1',
          name: 'Card Recognition v2.1',
          type: 'card_recognition',
          version: '2.1.0',
          accuracy: 95.8,
          status: 'active',
          lastUpdated: new Date().toISOString(),
          trainingData: 50000,
          performance: {
            precision: 0.958,
            recall: 0.945,
            f1Score: 0.951,
          },
        },
        {
          id: '2',
          name: 'Price Predictor v1.5',
          type: 'price_prediction',
          version: '1.5.2',
          accuracy: 87.3,
          status: 'active',
          lastUpdated: new Date().toISOString(),
          trainingData: 100000,
          performance: {
            precision: 0.873,
            recall: 0.861,
            f1Score: 0.867,
          },
        },
      ];

      const mockScanResults: CardScanResult[] = [
        {
          id: '1',
          cardName: '青眼白龍',
          confidence: 98.5,
          imageUrl: '/api/images/card1.jpg',
          detectedFeatures: ['龍族', '光屬性', '8星', '攻擊力3000'],
          processingTime: 0.8,
          timestamp: new Date().toISOString(),
          modelVersion: '2.1.0',
        },
      ];

      const mockPredictions: MarketPrediction[] = [
        {
          id: '1',
          cardId: 'card1',
          cardName: '青眼白龍',
          predictedPrice: 1600,
          confidence: 85.2,
          timeframe: '7d',
          factors: ['交易量增加', '市場需求上升', '供應減少'],
          timestamp: new Date().toISOString(),
          modelVersion: '1.5.2',
        },
      ];

      const mockRecommendations: AIRecommendation[] = [
        {
          id: '1',
          userId: 'user1',
          type: 'investment',
          title: '青眼白龍投資機會',
          description: '基於市場分析，建議在當前價格買入青眼白龍',
          confidence: 87.5,
          priority: 'high',
          targetCards: ['card1'],
          expectedReturn: 15.5,
          risk: 'medium',
          timestamp: new Date().toISOString(),
        },
      ];

      setModels(mockModels);
      setScanResults(mockScanResults);
      setPredictions(mockPredictions);
      setRecommendations(mockRecommendations);
      setLoading(false);
    };

    loadData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'training':
        return 'warning';
      case 'inactive':
        return 'secondary';
      case 'error':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'card_recognition':
        return '卡片識別';
      case 'price_prediction':
        return '價格預測';
      case 'market_analysis':
        return '市場分析';
      case 'recommendation':
        return '推薦系統';
      default:
        return type;
    }
  };

  if (loading) {
    return <div className="ai-dashboard loading">載入 AI 系統中...</div>;
  }

  return (
    <div className="ai-dashboard">
      <header className="dashboard-header">
        <h2>AI 生態系統儀表板</h2>
        <div className="dashboard-stats">
          <div className="stat">
            <span className="stat-label">活躍模型</span>
            <span className="stat-value">
              {models.filter((m) => m.status === 'active').length}
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">平均準確率</span>
            <span className="stat-value">
              {(
                models.reduce((sum, m) => sum + m.accuracy, 0) / models.length
              ).toFixed(1)}
              %
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">今日掃描</span>
            <span className="stat-value">{scanResults.length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">推薦數</span>
            <span className="stat-value">{recommendations.length}</span>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="ai-models">
          <h3>AI 模型狀態</h3>
          <div className="models-grid">
            {models.map((model) => (
              <div key={model.id} className="model-card">
                <div className="model-header">
                  <h4>{model.name}</h4>
                  <span
                    className={`status-badge ${getStatusColor(model.status)}`}
                  >
                    {model.status === 'active'
                      ? '運行中'
                      : model.status === 'training'
                        ? '訓練中'
                        : model.status === 'inactive'
                          ? '停用'
                          : '錯誤'}
                  </span>
                </div>
                <div className="model-info">
                  <div className="info-row">
                    <span className="info-label">類型:</span>
                    <span className="info-value">
                      {getTypeLabel(model.type)}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">版本:</span>
                    <span className="info-value">{model.version}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">準確率:</span>
                    <span className="info-value">{model.accuracy}%</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">訓練數據:</span>
                    <span className="info-value">
                      {model.trainingData.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="model-performance">
                  <h5>性能指標</h5>
                  <div className="performance-metrics">
                    <div className="metric">
                      <span className="metric-label">精確度</span>
                      <span className="metric-value">
                        {(model.performance.precision * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">召回率</span>
                      <span className="metric-value">
                        {(model.performance.recall * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">F1分數</span>
                      <span className="metric-value">
                        {(model.performance.f1Score * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="model-actions">
                  <button className="btn btn-primary">查看詳情</button>
                  <button className="btn btn-secondary">重新訓練</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="recent-activity">
          <h3>最近活動</h3>
          <div className="activity-tabs">
            <button className="tab-btn active">掃描結果</button>
            <button className="tab-btn">預測</button>
            <button className="tab-btn">推薦</button>
          </div>

          <div className="activity-content">
            <div className="scan-results">
              {scanResults.map((result) => (
                <div key={result.id} className="activity-item">
                  <div className="activity-icon">📷</div>
                  <div className="activity-content">
                    <h4>卡片識別: {result.cardName}</h4>
                    <p>
                      置信度: {result.confidence}% | 處理時間:{' '}
                      {result.processingTime}s
                    </p>
                    <div className="detected-features">
                      <span className="features-label">檢測特徵:</span>
                      {result.detectedFeatures.map((feature, index) => (
                        <span key={index} className="feature-tag">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="activity-time">
                    {new Date(result.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="ai-recommendations">
          <h3>AI 推薦</h3>
          <div className="recommendations-list">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className={`recommendation-card ${rec.priority}`}
              >
                <div className="recommendation-header">
                  <h4>{rec.title}</h4>
                  <span className={`priority-badge ${rec.priority}`}>
                    {rec.priority === 'critical'
                      ? '緊急'
                      : rec.priority === 'high'
                        ? '高'
                        : rec.priority === 'medium'
                          ? '中'
                          : '低'}
                  </span>
                </div>
                <p>{rec.description}</p>
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
                    <span className={`risk-badge ${rec.risk}`}>
                      {rec.risk === 'high'
                        ? '高'
                        : rec.risk === 'medium'
                          ? '中'
                          : '低'}
                    </span>
                  </div>
                </div>
                <div className="recommendation-actions">
                  <button className="btn btn-primary">接受推薦</button>
                  <button className="btn btn-secondary">查看詳情</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDashboard;
