import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';

import { useAppraisal } from '../hooks/useAppraisal';
import type { AppraisalRequest } from '../types/appraisal';

const { width, height } = Dimensions.get('window');

interface AppraisalScannerProps {
  onAppraisalComplete?: (result: unknown) => void;
  onError?: (error: unknown) => void;
  cardId?: string;
  cardType?: string;
  series?: string;
  version?: string;
}

export const AppraisalScanner: React.FC<AppraisalScannerProps> = ({
  onAppraisalComplete,
  onError,
  cardId = 'demo_card_001',
  cardType = 'Pokemon',
  series = 'Base Set',
  version = '1st Edition',
}) => {
  const {
    startAppraisal,
    currentAppraisal,
    status,
    error,
    loading,
    clearAppraisalError,
  } = useAppraisal();

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const _handleCaptureImage = async () => {
    try {
      setIsCapturing(true);

      // 模擬相機Catch
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 模擬Graph像 URL
      const _imageUrl = `https://example.com/card-images/${cardId}_${Date.now()}.jpg`;
      setCapturedImage(imageUrl);

      Alert.alert('Success', '圖像捕獲Success！');
    } catch (error) {
      Alert.alert('Error', '圖像捕獲Failed，請重試');
    } finally {
      setIsCapturing(false);
    }
  };

  const _handleStartAppraisal = async () => {
    if (!capturedImage) {
      Alert.alert('Error', '請先捕獲卡牌圖像');
      return;
    }

    try {
      const request: AppraisalRequest = {
        cardId,
        imageUrl: capturedImage,
        cardType,
        series,
        version,
        options: {
          method: 'hybrid',
          includeImages: true,
          detailedAnalysis: true,
          marketComparison: true,
          preservationTips: true,
        },
      };

      const _result = await startAppraisal(request).unwrap();

      Alert.alert('Success', `鑑定完成！等級: ${result.overallGrade}`);

      if (onAppraisalComplete) {
        onAppraisalComplete(result);
      }
    } catch (error) {
      console.error('Appraisal failed:', error);

      if (onError) {
        onError(error);
      } else {
        Alert.alert('Error', '鑑定Failed，請重試');
      }
    }
  };

  const _handleRetry = () => {
    clearAppraisalError();
    setCapturedImage(null);
  };

  const _handleReset = () => {
    setCapturedImage(null);
    clearAppraisalError();
  };

  const _renderCameraView = () => (
    <View style={styles.cameraContainer}>
      <View style={styles.cameraFrame}>
        <Text style={styles.cameraText}>相機預覽</Text>
        <Text style={styles.cameraSubtext}>將卡牌置於框內</Text>
      </View>
    </View>
  );

  const _renderCapturedImage = () => (
    <View style={styles.imageContainer}>
      <Image
        source={{ uri: capturedImage || '' }}
        style={styles.capturedImage}
        resizeMode='contain'
      />
      <View style={styles.imageOverlay}>
        <Text style={styles.imageText}>已捕獲圖像</Text>
      </View>
    </View>
  );

  const _renderAppraisalResult = () => {
    if (!currentAppraisal) return null;

    return (
      <View style={styles.resultContainer}>
        <Text style={styles.resultTitle}>鑑定結果</Text>
        <View style={styles.resultItem}>
          <Text style={styles.resultLabel}>總體等級:</Text>
          <Text style={styles.resultValue}>
            {currentAppraisal.overallGrade}
          </Text>
        </View>
        <View style={styles.resultItem}>
          <Text style={styles.resultLabel}>總分:</Text>
          <Text style={styles.resultValue}>
            {currentAppraisal.overallScore.toFixed(1)}/10
          </Text>
        </View>
        <View style={styles.resultItem}>
          <Text style={styles.resultLabel}>信心度:</Text>
          <Text style={styles.resultValue}>
            {(currentAppraisal.metadata.confidence * 100).toFixed(1)}%
          </Text>
        </View>
        <View style={styles.resultItem}>
          <Text style={styles.resultLabel}>處理時間:</Text>
          <Text style={styles.resultValue}>
            {currentAppraisal.metadata.processingTime}ms
          </Text>
        </View>
      </View>
    );
  };

  const _renderError = () => {
    if (!error) return null;

    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>鑑定錯誤</Text>
        <Text style={styles.errorMessage}>{error.message}</Text>
        {error.isRetryable && (
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>重試</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>模擬鑑定掃描器</Text>

      {/* 卡牌Information */}
      <View style={styles.cardInfo}>
        <Text style={styles.cardInfoText}>卡牌 ID: {cardId}</Text>
        <Text style={styles.cardInfoText}>類型: {cardType}</Text>
        <Text style={styles.cardInfoText}>系列: {series}</Text>
        <Text style={styles.cardInfoText}>版本: {version}</Text>
      </View>

      {/* Graph像CatchDistrict域 */}
      <View style={styles.captureArea}>
        {capturedImage ? renderCapturedImage() : renderCameraView()}
      </View>

      {/* Control按鈕 */}
      <View style={styles.buttonContainer}>
        {!capturedImage ? (
          <TouchableOpacity
            style={[styles.captureButton, isCapturing && styles.disabledButton]}
            onPress={handleCaptureImage}
            disabled={isCapturing}
          >
            {isCapturing ? (
              <ActivityIndicator color='#fff' />
            ) : (
              <Text style={styles.captureButtonText}>捕獲圖像</Text>
            )}
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.appraisalButton, loading && styles.disabledButton]}
              onPress={handleStartAppraisal}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color='#fff' />
              ) : (
                <Text style={styles.appraisalButtonText}>開始鑑定</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>重新捕獲</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* StatusShow */}
      {status !== 'pending' && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            狀態: {status === 'processing' ? '處理中...' : status}
          </Text>
        </View>
      )}

      {/* ErrorShow */}
      {renderError()}

      {/* 結果Show */}
      {renderAppraisalResult()}
    </View>
  );
};

const _styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  cardInfo: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
  },
  cardInfoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  captureArea: {
    height: height * 0.4,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 2,
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  cameraFrame: {
    borderWidth: 2,
    borderColor: '#fff',
    borderStyle: 'dashed',
    width: width * 0.7,
    height: height * 0.25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cameraSubtext: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 5,
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  capturedImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
  },
  imageText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  captureButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
  },
  captureButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  appraisalButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
  },
  appraisalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 100,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
  statusContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
  },
  statusText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#FFE5E5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 5,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  resultContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  resultLabel: {
    fontSize: 14,
    color: '#666',
  },
  resultValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
});
