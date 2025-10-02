import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';

import { logger } from '../../../core/utils/logger';
import { useAuthenticityCheck } from '../hooks/useAuthenticityCheck';
import type { AuthenticityCheckRequest } from '../types/authenticity';
// import { Camera } from 'react-native-camera'; // Placeholder for actual camera library
// import { RNCamera } from 'react-native-camera'; // Example for react-native-camera
// import { Camera as VisionCamera, useCameraDevices } from 'react-native-vision-camera'; // Example for react-native-vision-camera

interface AuthenticityCheckScannerProps {
  onCheckComplete?: (result: unknown) => void;
  onError?: (error: unknown) => void;
}

export const AuthenticityCheckScanner: React.FC<
  AuthenticityCheckScannerProps
> = ({ onCheckComplete, onError }) => {
  const {
    isChecking,
    checkResult,
    checkError,
    check,
    currentImage,
    setCurrentImage,
    clearErrors,
  } = useAuthenticityCheck({
    onCheckSuccess: result => {
      const _status = result.isAuthentic ? '真卡' : '疑似假卡';
      const _riskLevel =
        result.riskLevel === 'critical'
          ? '極高風險'
          : result.riskLevel === 'high'
            ? '高風險'
            : result.riskLevel === 'medium'
              ? '中等風險'
              : '低風險';
      Alert.alert(
        '檢查完成',
        `${status} (置信度: ${(result.confidence * 100).toFixed(2)}%, 風險等級: ${riskLevel})`
      );
      onCheckComplete?.(result);
    },
    onCheckError: error => {
      Alert.alert('CheckFailed', error.message);
      onError?.(error);
    },
  });

  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraType, setCameraType] = useState<'back' | 'front'>('back');
  // const _cameraRef = useRef<RNCamera>(null); // For react-native-camera
  // const _devices = useCameraDevices(); // For react-native-vision-camera
  // const _device = cameraType === 'back' ? devices.back : devices.front; // For react-native-vision-camera

  // 模擬拍照功能
  const _takePicture = useCallback(async () => {
    if (isChecking) return;

    logger.info('模擬拍照進行防偽檢查...');
    // 模擬GetGraph片Data
    const _mockImageData = 'data:image/jpeg;base64,mock_image_data_base64';
    setCurrentImage(mockImageData);

    const request: AuthenticityCheckRequest = {
      imageData: mockImageData.split(',')[1], // Remove data URI prefix
      imageFormat: 'jpeg',
      cardId: 'card-123', // Replace with actual card ID
      userId: 'current_user_id', // Replace with actual user ID
      checkOptions: {
        enableDetailedAnalysis: true,
        includeSecurityFeatures: true,
        checkMode: 'standard',
        focusAreas: [
          'printing',
          'colors',
          'text',
          'security_features',
          'materials',
        ],
        qualityThreshold: 0.8,
        enableComparison: false,
      },
    };

    try {
      await check(request);
    } catch (err) {
      logger.error('拍照後CheckFailed:', err);
    }
  }, [isChecking, check, setCurrentImage]);

  const _renderCheckResult = () => {
    if (!checkResult) return null;

    const _getRiskLevelColor = (riskLevel: string) => {
      switch (riskLevel) {
        case 'critical':
          return '#dc3545';
        case 'high':
          return '#fd7e14';
        case 'medium':
          return '#ffc107';
        case 'low':
          return '#28a745';
        default:
          return '#6c757d';
      }
    };

    const _getRiskLevelText = (riskLevel: string) => {
      switch (riskLevel) {
        case 'critical':
          return '極高風險';
        case 'high':
          return '高風險';
        case 'medium':
          return '中等風險';
        case 'low':
          return '低風險';
        default:
          return '未知';
      }
    };

    return (
      <View style={styles.resultContainer}>
        <Text style={styles.subHeader}>防偽檢查結果:</Text>

        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            狀態: {checkResult.isAuthentic ? '✅ 真卡' : '❌ 疑似假卡'}
          </Text>
          <Text style={styles.confidenceText}>
            置信度: {(checkResult.confidence * 100).toFixed(2)}%
          </Text>
          <Text
            style={[
              styles.riskLevelText,
              { color: getRiskLevelColor(checkResult.riskLevel) },
            ]}
          >
            風險等級: {getRiskLevelText(checkResult.riskLevel)}
          </Text>
        </View>

        {checkResult.riskFactors.length > 0 && (
          <View style={styles.riskFactorsContainer}>
            <Text style={styles.riskFactorsHeader}>風險因素:</Text>
            {checkResult.riskFactors.map((factor, index) => (
              <View key={index} style={styles.riskFactorItem}>
                <Text style={styles.riskFactorTitle}>{factor.description}</Text>
                <Text style={styles.riskFactorSeverity}>
                  嚴重程度:{' '}
                  {factor.severity === 'severe'
                    ? '嚴重'
                    : factor.severity === 'major'
                      ? '重大'
                      : factor.severity === 'moderate'
                        ? '中等'
                        : '輕微'}
                </Text>
                <Text style={styles.riskFactorConfidence}>
                  置信度: {(factor.confidence * 100).toFixed(1)}%
                </Text>
              </View>
            ))}
          </View>
        )}

        {checkResult.securityFeatures.length > 0 && (
          <View style={styles.securityFeaturesContainer}>
            <Text style={styles.securityFeaturesHeader}>安全特徵:</Text>
            {checkResult.securityFeatures.map((feature, index) => (
              <View key={index} style={styles.securityFeatureItem}>
                <Text style={styles.securityFeatureTitle}>
                  {feature.type === 'hologram'
                    ? '全息圖'
                    : feature.type === 'watermark'
                      ? '水印'
                      : feature.type === 'microtext'
                        ? '微文字'
                        : feature.type === 'uv_ink'
                          ? 'UV墨水'
                          : feature.type === 'foil_stamping'
                            ? '燙金'
                            : feature.type === 'embossing'
                              ? '壓紋'
                              : feature.type === 'color_shift'
                                ? '變色'
                                : feature.type === 'security_thread'
                                  ? '安全線'
                                  : feature.type}
                </Text>
                <Text style={styles.securityFeatureStatus}>
                  狀態:{' '}
                  {feature.isPresent
                    ? feature.isAuthentic
                      ? '✅ 正常'
                      : '❌ 異常'
                    : '❌ 缺失'}
                </Text>
                <Text style={styles.securityFeatureQuality}>
                  質量:{' '}
                  {feature.quality === 'excellent'
                    ? '優秀'
                    : feature.quality === 'good'
                      ? '良好'
                      : feature.quality === 'fair'
                        ? '一般'
                        : feature.quality === 'poor'
                          ? '較差'
                          : '缺失'}
                </Text>
              </View>
            ))}
          </View>
        )}

        {checkResult.recommendations.length > 0 && (
          <View style={styles.recommendationsContainer}>
            <Text style={styles.recommendationsHeader}>建議:</Text>
            {checkResult.recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationItem}>
                <Text style={styles.recommendationTitle}>{rec.title}</Text>
                <Text style={styles.recommendationDescription}>
                  {rec.description}
                </Text>
                <Text style={styles.recommendationAction}>{rec.action}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>防偽檢查掃描器</Text>

      {/* 模擬攝像頭預覽 */}
      <View style={styles.cameraPreview}>
        {/* 這裡應該Yes實際的攝像頭Component，例如 <RNCamera> 或 <VisionCamera> */}
        <Text style={styles.cameraPlaceholder}>
          {Platform.OS === 'web'
            ? 'Webcam Placeholder'
            : 'Camera Preview Placeholder'}
        </Text>
        {/* {device && <VisionCamera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          ref={cameraRef}
        />} */}
      </View>

      <TouchableOpacity
        style={[styles.captureButton, isChecking && styles.disabledButton]}
        onPress={takePicture}
        disabled={isChecking}
      >
        {isChecking ? (
          <ActivityIndicator color='#fff' />
        ) : (
          <Text style={styles.buttonText}>拍攝並檢查</Text>
        )}
      </TouchableOpacity>

      {currentImage && (
        <View style={styles.imagePreviewContainer}>
          <Text style={styles.subHeader}>預覽圖片:</Text>
          <Image source={{ uri: currentImage }} style={styles.imagePreview} />
        </View>
      )}

      {renderCheckResult()}

      {checkError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>錯誤: {checkError.message}</Text>
          <TouchableOpacity
            onPress={clearErrors}
            style={styles.clearErrorButton}
          >
            <Text style={styles.clearErrorButtonText}>清除錯誤</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const _styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  cameraPreview: {
    width: '100%',
    height: 300,
    backgroundColor: '#ddd',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  cameraPlaceholder: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  captureButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imagePreviewContainer: {
    marginBottom: 20,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 10,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  resultContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  statusContainer: {
    marginBottom: 15,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  confidenceText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#666',
  },
  riskLevelText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  riskFactorsContainer: {
    marginBottom: 15,
  },
  riskFactorsHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  riskFactorItem: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 5,
    marginBottom: 8,
  },
  riskFactorTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  riskFactorSeverity: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  riskFactorConfidence: {
    fontSize: 12,
    color: '#666',
  },
  securityFeaturesContainer: {
    marginBottom: 15,
  },
  securityFeaturesHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  securityFeatureItem: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 5,
    marginBottom: 8,
  },
  securityFeatureTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  securityFeatureStatus: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  securityFeatureQuality: {
    fontSize: 12,
    color: '#666',
  },
  recommendationsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  recommendationsHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  recommendationItem: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 5,
    marginBottom: 8,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  recommendationDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  recommendationAction: {
    fontSize: 12,
    color: '#007bff',
    fontStyle: 'italic',
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#721c24',
    fontSize: 14,
    marginBottom: 10,
  },
  clearErrorButton: {
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  clearErrorButtonText: {
    color: '#fff',
    fontSize: 12,
  },
});
