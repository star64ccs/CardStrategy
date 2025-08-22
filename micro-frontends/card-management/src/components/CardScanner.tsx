import React, { useState, useRef } from 'react';
import { CardScannerResult } from '../types';

interface CardScannerProps {
  onScanComplete?: (result: CardScannerResult) => void;
  onManualInput?: () => void;
}

const CardScanner: React.FC<CardScannerProps> = ({
  onScanComplete,
  onManualInput,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<CardScannerResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setError(null);

    try {
      // 模擬AI識別過程
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 這裡應該調用實際的AI識別API
      const mockResult: CardScannerResult = {
        success: true,
        card: {
          id: 'mock-card-id',
          name: '皮卡丘',
          setName: '基礎系列',
          cardNumber: '025/025',
          rarity: '稀有',
          type: '電氣',
          imageUrl: URL.createObjectURL(file),
          price: 1500,
          condition: '全新',
          language: '繁體中文',
          game: 'Pokemon TCG',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        confidence: 0.95,
      };

      setScanResult(mockResult);
      onScanComplete?.(mockResult);
    } catch (err) {
      setError('掃描失敗，請重試');
      setScanResult({
        success: false,
        error: '掃描失敗',
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleCameraScan = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('無法訪問相機');
    }
  };

  const handleManualInput = () => {
    onManualInput?.();
  };

  return (
    <div className="card-scanner">
      <div className="scanner-header">
        <h2>卡片掃描</h2>
        <p>上傳卡片圖片或使用相機掃描</p>
      </div>

      <div className="scanner-options">
        <div className="scanner-option">
          <h3>上傳圖片</h3>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <button
            className="btn btn-primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={isScanning}
          >
            {isScanning ? '掃描中...' : '選擇圖片'}
          </button>
        </div>

        <div className="scanner-option">
          <h3>相機掃描</h3>
          <button
            className="btn btn-secondary"
            onClick={handleCameraScan}
            disabled={isScanning}
          >
            開啟相機
          </button>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{ display: 'none' }}
          />
        </div>

        <div className="scanner-option">
          <h3>手動輸入</h3>
          <button className="btn btn-outline" onClick={handleManualInput}>
            手動輸入卡片資訊
          </button>
        </div>
      </div>

      {isScanning && (
        <div className="scanning-indicator">
          <div className="spinner"></div>
          <p>正在識別卡片...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {scanResult && scanResult.success && scanResult.card && (
        <div className="scan-result">
          <h3>掃描結果</h3>
          <div className="scanned-card">
            <img src={scanResult.card.imageUrl} alt={scanResult.card.name} />
            <div className="card-info">
              <h4>{scanResult.card.name}</h4>
              <p>系列: {scanResult.card.setName}</p>
              <p>編號: {scanResult.card.cardNumber}</p>
              <p>稀有度: {scanResult.card.rarity}</p>
              <p>信心度: {(scanResult.confidence! * 100).toFixed(1)}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardScanner;
