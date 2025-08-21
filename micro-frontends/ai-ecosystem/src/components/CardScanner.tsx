import React, { useState, useRef } from 'react';
import { CardScanResult } from '../types';

const CardScanner: React.FC = () => {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<CardScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<CardScanResult[]>([]);
  const [scanMode, setScanMode] = useState<'camera' | 'upload'>('camera');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      simulateCardScan(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      // logger.info('無法啟動相機:', error);
      alert('無法啟動相機，請檢查權限設置');
    }
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'captured-card.jpg', { type: 'image/jpeg' });
          simulateCardScan(file);
        }
      }, 'image/jpeg');
    }
  };

  const simulateCardScan = async (file: File) => {
    setScanning(true);

    // 模擬 AI 處理時間
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockResult: CardScanResult = {
      id: Date.now().toString(),
      cardName: '青眼白龍',
      confidence: 95 + Math.random() * 5,
      imageUrl: URL.createObjectURL(file),
      detectedFeatures: [
        '龍族',
        '光屬性',
        '8星',
        '攻擊力3000',
        '守備力2500',
        '效果怪獸'
      ],
      processingTime: 1.2 + Math.random() * 0.8,
      timestamp: new Date().toISOString(),
      modelVersion: '2.1.0'
    };

    setScanResult(mockResult);
    setScanHistory(prev => [mockResult, ...prev.slice(0, 9)]);
    setScanning(false);
  };

  const clearScan = () => {
    setScanResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="card-scanner">
      <div className="scanner-header">
        <h3>AI 卡片掃描器</h3>
        <div className="scanner-modes">
          <button
            className={`mode-btn ${scanMode === 'camera' ? 'active' : ''}`}
            onClick={() => setScanMode('camera')}
          >
            📷 相機掃描
          </button>
          <button
            className={`mode-btn ${scanMode === 'upload' ? 'active' : ''}`}
            onClick={() => setScanMode('upload')}
          >
            📁 上傳圖片
          </button>
        </div>
      </div>

      <div className="scanner-content">
        {scanMode === 'camera' ? (
          <div className="camera-scanner">
            <div className="camera-container">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="camera-video"
              />
              <div className="camera-overlay">
                <div className="scan-frame"></div>
                <div className="scan-instructions">
                  將卡片放在框內進行掃描
                </div>
              </div>
            </div>
            <div className="camera-controls">
              <button className="btn btn-primary" onClick={startCamera}>
                啟動相機
              </button>
              <button className="btn btn-success" onClick={captureImage}>
                拍照掃描
              </button>
            </div>
          </div>
        ) : (
          <div className="upload-scanner">
            <div className="upload-area">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <div
                className="upload-zone"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="upload-icon">📁</div>
                <p>點擊上傳卡片圖片</p>
                <p className="upload-hint">支援 JPG, PNG, GIF 格式</p>
              </div>
            </div>
          </div>
        )}

        {scanning && (
          <div className="scanning-overlay">
            <div className="scanning-spinner"></div>
            <p>AI 正在分析卡片...</p>
          </div>
        )}

        {scanResult && (
          <div className="scan-result">
            <h4>掃描結果</h4>
            <div className="result-content">
              <div className="result-image">
                <img src={scanResult.imageUrl} alt={scanResult.cardName} />
              </div>
              <div className="result-details">
                <h5>{scanResult.cardName}</h5>
                <div className="confidence-bar">
                  <span className="confidence-label">置信度:</span>
                  <div className="confidence-progress">
                    <div
                      className="confidence-fill"
                      style={{ width: `${scanResult.confidence}%` }}
                    ></div>
                  </div>
                  <span className="confidence-value">{scanResult.confidence.toFixed(1)}%</span>
                </div>
                <div className="detected-features">
                  <h6>檢測到的特徵:</h6>
                  <div className="features-grid">
                    {scanResult.detectedFeatures.map((feature, index) => (
                      <span key={index} className="feature-tag">{feature}</span>
                    ))}
                  </div>
                </div>
                <div className="scan-meta">
                  <span>處理時間: {scanResult.processingTime.toFixed(1)}s</span>
                  <span>模型版本: {scanResult.modelVersion}</span>
                </div>
              </div>
            </div>
            <div className="result-actions">
              <button className="btn btn-primary">添加到收藏</button>
              <button className="btn btn-secondary">查看市場價格</button>
              <button className="btn btn-outline" onClick={clearScan}>重新掃描</button>
            </div>
          </div>
        )}
      </div>

      {scanHistory.length > 0 && (
        <div className="scan-history">
          <h4>掃描歷史</h4>
          <div className="history-list">
            {scanHistory.map(result => (
              <div key={result.id} className="history-item">
                <img src={result.imageUrl} alt={result.cardName} />
                <div className="history-info">
                  <h6>{result.cardName}</h6>
                  <span className="confidence">{result.confidence.toFixed(1)}%</span>
                  <span className="time">{new Date(result.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CardScanner;
