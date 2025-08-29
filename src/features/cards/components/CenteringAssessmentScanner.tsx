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
import { useCenteringAssessment } from '../hooks/useCenteringAssessment';
import type { CenteringAssessmentRequest } from '../types/centering';
// import { Camera } from 'react-native-camera'; // Placeholder for actual camera library
// import { RNCamera } from 'react-native-camera'; // Example for react-native-camera
// import { Camera as VisionCamera, useCameraDevices } from 'react-native-vision-camera'; // Example for react-native-vision-camera

interface CenteringAssessmentScannerProps {
  onAssessmentComplete?: (result: unknown) => void;
  onError?: (error: unknown) => void;
}

export const CenteringAssessmentScanner: React.FC<
  CenteringAssessmentScannerProps
> = ({ onAssessmentComplete, onError }) => {
  const {
    isAssessing,
    assessmentResult,
    assessmentError,
    assess,
    currentImage,
    setCurrentImage,
    clearErrors,
  } = useCenteringAssessment({
    onAssessmentSuccess: result => {
      Alert.alert(
        '評估成功',
        `整體評分: ${result.overallScore}/10 (置中: ${result.centeringScore}/10)`
      );
      onAssessmentComplete?.(result);
    },
    onAssessmentError: error => {
      Alert.alert('評估失敗', error.message);
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
    if (isAssessing) return;

    logger.info('模擬拍照進行置中評估...');
    // 模擬獲取圖片數據
    const _mockImageData = 'data:image/jpeg;base64,mock_image_data_base64';
    setCurrentImage(mockImageData);

    const request: CenteringAssessmentRequest = {
      imageData: mockImageData.split(',')[1], // Remove data URI prefix
      imageFormat: 'jpeg',
      cardId: 'card-123', // Replace with actual card ID
      userId: 'current_user_id', // Replace with actual user ID
      assessmentOptions: {
        enableDetailedAnalysis: true,
        includeRecommendations: true,
        assessmentMode: 'standard',
        focusAreas: ['centering', 'edges', 'corners', 'surface'],
        qualityThreshold: 0.7,
      },
    };

    try {
      await assess(request);
    } catch (err) {
      logger.error('拍照後評估失敗:', err);
    }
  }, [isAssessing, assess, setCurrentImage]);

  const _renderAssessmentResult = () => {
    if (!assessmentResult) return null;

    return (
      <View style={styles.resultContainer}>
        <Text style={styles.subHeader}>置中評估結果:</Text>

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>
            整體評分: {assessmentResult.overallScore}/10
          </Text>
          <Text style={styles.scoreText}>
            置中評分: {assessmentResult.centeringScore}/10
          </Text>
          <Text style={styles.scoreText}>
            邊緣評分: {assessmentResult.edgeWearScore}/10
          </Text>
          <Text style={styles.scoreText}>
            角落評分: {assessmentResult.cornerWearScore}/10
          </Text>
          <Text style={styles.scoreText}>
            表面評分: {assessmentResult.surfaceWearScore}/10
          </Text>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.detailsHeader}>詳細信息:</Text>
          <Text>
            水平偏移:{' '}
            {assessmentResult.details.centering.horizontalOffset.toFixed(1)}%
          </Text>
          <Text>
            垂直偏移:{' '}
            {assessmentResult.details.centering.verticalOffset.toFixed(1)}%
          </Text>
          <Text>
            置中狀態:{' '}
            {assessmentResult.details.centering.isCentered
              ? '良好'
              : '需要調整'}
          </Text>
        </View>

        {assessmentResult.recommendations.length > 0 && (
          <View style={styles.recommendationsContainer}>
            <Text style={styles.recommendationsHeader}>建議:</Text>
            {assessmentResult.recommendations.map((rec, index) => (
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
      <Text style={styles.header}>置中評估掃描器</Text>

      {/* 模擬攝像頭預覽 */}
      <View style={styles.cameraPreview}>
        {/* 這裡應該是實際的攝像頭組件，例如 <RNCamera> 或 <VisionCamera> */}
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
        style={[styles.captureButton, isAssessing && styles.disabledButton]}
        onPress={takePicture}
        disabled={isAssessing}
      >
        {isAssessing ? (
          <ActivityIndicator color='#fff' />
        ) : (
          <Text style={styles.buttonText}>拍攝並評估</Text>
        )}
      </TouchableOpacity>

      {currentImage && (
        <View style={styles.imagePreviewContainer}>
          <Text style={styles.subHeader}>預覽圖片:</Text>
          <Image source={{ uri: currentImage }} style={styles.imagePreview} />
        </View>
      )}

      {renderAssessmentResult()}

      {assessmentError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>錯誤: {assessmentError.message}</Text>
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
    backgroundColor: '#007bff',
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
  scoreContainer: {
    marginBottom: 15,
  },
  scoreText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  detailsContainer: {
    marginBottom: 15,
  },
  detailsHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
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
