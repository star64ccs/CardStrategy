import React, { useState, useEffect } from 'react';
import { MarketPrediction } from '../types';

const MarketPredictor: React.FC = () => {
  const [predictions, setPredictions] = useState<MarketPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    '1d' | '7d' | '30d' | '90d'
  >('7d');
  const [selectedCard, setSelectedCard] = useState<string>('');

  useEffect(() => {
    const loadPredictions = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

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
        {
          id: '2',
          cardId: 'card2',
          cardName: '黑魔導',
          predictedPrice: 750,
          confidence: 72.8,
          timeframe: '7d',
          factors: ['供應過剩', '需求下降'],
          timestamp: new Date().toISOString(),
          modelVersion: '1.5.2',
        },
      ];

      setPredictions(mockPredictions);
      setLoading(false);
    };

    loadPredictions();
  }, []);

  const generatePrediction = async () => {
    if (!selectedCard) {
      alert('請選擇要預測的卡片');
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const newPrediction: MarketPrediction = {
      id: Date.now().toString(),
      cardId: selectedCard,
      cardName: '青眼白龍',
      predictedPrice: 1400 + Math.random() * 400,
      confidence: 70 + Math.random() * 25,
      timeframe: selectedTimeframe,
      factors: ['歷史價格趨勢', '市場供需關係', '季節性因素', '競品價格變化'],
      timestamp: new Date().toISOString(),
      modelVersion: '1.5.2',
    };

    setPredictions([newPrediction, ...predictions]);
    setLoading(false);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'high';
    if (confidence >= 60) return 'medium';
    return 'low';
  };

  const getTimeframeLabel = (timeframe: string) => {
    switch (timeframe) {
      case '1d':
        return '1天';
      case '7d':
        return '7天';
      case '30d':
        return '30天';
      case '90d':
        return '90天';
      default:
        return timeframe;
    }
  };

  if (loading) {
    return <div className="market-predictor loading">載入預測數據中...</div>;
  }

  return (
    <div className="market-predictor">
      <div className="predictor-header">
        <h3>AI 市場預測</h3>
        <div className="prediction-controls">
          <select
            value={selectedCard}
            onChange={(e) => setSelectedCard(e.target.value)}
            className="card-selector"
          >
            <option value="">選擇卡片</option>
            <option value="card1">青眼白龍</option>
            <option value="card2">黑魔導</option>
            <option value="card3">真紅眼黑龍</option>
          </select>
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as any)}
            className="timeframe-selector"
          >
            <option value="1d">1天</option>
            <option value="7d">7天</option>
            <option value="30d">30天</option>
            <option value="90d">90天</option>
          </select>
          <button
            className="btn btn-primary"
            onClick={generatePrediction}
            disabled={!selectedCard}
          >
            生成預測
          </button>
        </div>
      </div>

      <div className="predictions-list">
        {predictions.map((prediction) => (
          <div key={prediction.id} className="prediction-card">
            <div className="prediction-header">
              <h4>{prediction.cardName}</h4>
              <div className="prediction-meta">
                <span className="timeframe">
                  {getTimeframeLabel(prediction.timeframe)}
                </span>
                <span
                  className={`confidence-badge ${getConfidenceColor(prediction.confidence)}`}
                >
                  {prediction.confidence.toFixed(1)}% 置信度
                </span>
              </div>
            </div>

            <div className="prediction-content">
              <div className="price-prediction">
                <span className="predicted-price">
                  NT$ {prediction.predictedPrice.toLocaleString()}
                </span>
                <span className="prediction-label">預測價格</span>
              </div>

              <div className="prediction-factors">
                <h5>影響因素:</h5>
                <ul>
                  {prediction.factors.map((factor, index) => (
                    <li key={index}>{factor}</li>
                  ))}
                </ul>
              </div>

              <div className="prediction-chart">
                <div className="chart-placeholder">
                  <div className="chart-line">
                    {Array.from({ length: 10 }, (_, i) => (
                      <div
                        key={i}
                        className="chart-point"
                        style={{
                          left: `${(i / 9) * 100}%`,
                          bottom: `${20 + Math.random() * 60}%`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="prediction-footer">
              <span className="model-version">
                模型版本: {prediction.modelVersion}
              </span>
              <span className="prediction-time">
                {new Date(prediction.timestamp).toLocaleString()}
              </span>
              <div className="prediction-actions">
                <button className="btn btn-primary">設置警報</button>
                <button className="btn btn-secondary">查看詳情</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {predictions.length === 0 && (
        <div className="no-predictions">
          <p>目前沒有預測數據</p>
          <p>選擇卡片並點擊「生成預測」開始</p>
        </div>
      )}
    </div>
  );
};

export default MarketPredictor;
