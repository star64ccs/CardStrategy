import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CameraType, FlashMode } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useDispatch, useSelector } from 'react-redux';
import { theme } from '@/config/theme';
import { recognizeCard, clearRecognizedCard } from '@/store/slices/cardSlice';
import {
  selectIsRecognizing,
  selectRecognizedCard,
  selectRecognitionResult,
  selectRecognitionAlternatives,
  selectRecognitionFeatures,
} from '@/store/slices/cardSlice';
import { logger } from '@/utils/logger';
import { aiRecognitionService } from '@/services/aiRecognitionService';
import { Card } from '@/types';
import {
  FadeInView,
  SlideUpView,
  ScaleView,
  AnimatedButton,
  PulseButton,
} from '@/components/common';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const CardScannerScreen: React.FC = () => {
  const dispatch = useDispatch();
  const isRecognizing = useSelector(selectIsRecognizing);
  const recognizedCard = useSelector(selectRecognizedCard);
  const recognitionResult = useSelector(selectRecognitionResult);
  const recognitionAlternatives = useSelector(selectRecognitionAlternatives);
  const recognitionFeatures = useSelector(selectRecognitionFeatures);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState(CameraType.back);
  const [flashMode, setFlashMode] = useState(FlashMode.off);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const [recognitionConfig, setRecognitionConfig] = useState({
    confidenceThreshold: 0.7,
    includeFeatures: true,
    includeCondition: true,
  });

  // 新增：圖像優化狀態
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationTips, setOptimizationTips] = useState<string[]>([]);

  const cameraRef = useRef<Camera>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');

      if (status !== 'granted') {
        Alert.alert(
          '需要相機權限',
          '掃描卡牌功能需要相機權限，請在設置中開啟。',
          [
            { text: '取消', style: 'cancel' },
            { text: '去設置', onPress: () => {} },
          ]
        );
      }
    })();
  }, []);

  // 新增：圖像預處理優化函數
  const enhanceImageQuality = async (imageUri: string): Promise<string> => {
    try {
      setIsOptimizing(true);

      const result = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          { resize: { width: 1024 } }, // 標準化尺寸
          { brightness: 1.1 }, // 提升亮度
          { contrast: 1.2 }, // 提升對比度
          { saturate: 1.1 }, // 輕微提升飽和度
        ],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      logger.info('圖像優化完成', {
        originalSize: imageUri.length,
        optimizedSize: result.uri.length,
        improvements: ['亮度調整', '對比度優化', '尺寸標準化'],
      });

      return result.uri;
    } catch (error) {
      logger.error('圖像優化失敗:', { error });
      return imageUri; // 如果優化失敗，返回原圖
    } finally {
      setIsOptimizing(false);
    }
  };

  // 新增：拍攝角度建議
  const getShootingTips = (): string[] => {
    return [
      '保持卡片與相機平行',
      '確保光線充足，避免陰影',
      '卡片應佔據畫面70-80%',
      '避免反光和模糊',
      '保持相機穩定',
    ];
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.9, // 提升圖片質量
          base64: true,
        });

        setCapturedImage(photo.uri);
        setIsCameraActive(false);

        // 圖像優化後再識別
        const optimizedImage = await enhanceImageQuality(photo.uri);
        handleRecognizeCard(optimizedImage);
      } catch (error) {
        logger.error('拍照失敗:', { error });
        Alert.alert('錯誤', '拍照失敗，請重試');
      }
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.9, // 提升圖片質量
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedImage(result.assets[0].uri);
        setIsCameraActive(false);

        // 圖像優化後再識別
        const optimizedImage = await enhanceImageQuality(result.assets[0].uri);
        handleRecognizeCard(optimizedImage);
      }
    } catch (error) {
      logger.error('選擇圖片失敗:', { error });
      Alert.alert('錯誤', '選擇圖片失敗，請重試');
    }
  };

  const handleRecognizeCard = async (imageUri: string) => {
    try {
      // 清除之前的識別結果
      dispatch(clearRecognizedCard());

      // 使用 AI 識別服務
      const result = await aiRecognitionService.recognizeCard(
        imageUri,
        recognitionConfig
      );

      // 更新 Redux store
      await dispatch(recognizeCard(imageUri) as any);

      logger.info('卡片識別成功', {
        cardName: result.data.recognizedCard.name,
        confidence: result.data.confidence,
        processingTime: result.data.processingTime,
        imageOptimized: true,
      });
    } catch (error) {
      logger.error('識別卡牌失敗:', { error });
      Alert.alert('錯誤', '識別卡牌失敗，請重試');
    }
  };

  const retakePicture = () => {
    setCapturedImage(null);
    setIsCameraActive(true);
    setShowAlternatives(false);
    setShowFeatures(false);
    dispatch(clearRecognizedCard());
  };

  const toggleCameraType = () => {
    setCameraType(current =>
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  };

  const toggleFlash = () => {
    setFlashMode(current =>
      current === FlashMode.off ? FlashMode.on : FlashMode.off
    );
  };

  const renderRecognitionResult = () => {
    if (!recognitionResult || !recognizedCard) return null;

    return (
      <View style={styles.resultContainer}>
        <Text style={styles.resultTitle}>識別結果</Text>

        {/* 主要識別結果 */}
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{recognizedCard.name}</Text>
          <Text style={styles.cardSeries}>{recognizedCard.setName}</Text>
          <Text style={styles.cardRarity}>稀有度: {recognizedCard.rarity}</Text>
          <Text style={styles.cardType}>類型: {recognizedCard.type}</Text>

          <View style={styles.confidenceContainer}>
            <Text style={styles.confidenceLabel}>識別信心度:</Text>
            <View style={styles.confidenceBar}>
              <View
                style={[
                  styles.confidenceFill,
                  { width: `${recognitionResult.confidence * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.confidenceText}>
              {Math.round(recognitionResult.confidence * 100)}%
            </Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>當前價格:</Text>
            <Text style={styles.priceValue}>
              {recognizedCard.currentPrice || 0} TWD
            </Text>
          </View>
        </View>

        {/* 替代選項 */}
        {recognitionAlternatives.length > 0 && (
          <View style={styles.alternativesContainer}>
            <TouchableOpacity
              style={styles.alternativesHeader}
              onPress={() => setShowAlternatives(!showAlternatives)}
            >
              <Text style={styles.alternativesTitle}>
                替代選項 ({recognitionAlternatives.length})
              </Text>
              <Text style={styles.alternativesToggle}>
                {showAlternatives ? '收起' : '展開'}
              </Text>
            </TouchableOpacity>

            {showAlternatives && (
              <View style={styles.alternativesList}>
                {recognitionAlternatives.map((alt, index) => (
                  <TouchableOpacity key={index} style={styles.alternativeItem}>
                    <Text style={styles.alternativeName}>{alt.card.name}</Text>
                    <Text style={styles.alternativeConfidence}>
                      {Math.round(alt.confidence * 100)}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* 圖像特徵分析 */}
        {recognitionFeatures && (
          <View style={styles.featuresContainer}>
            <TouchableOpacity
              style={styles.featuresHeader}
              onPress={() => setShowFeatures(!showFeatures)}
            >
              <Text style={styles.featuresTitle}>圖像特徵分析</Text>
              <Text style={styles.featuresToggle}>
                {showFeatures ? '收起' : '展開'}
              </Text>
            </TouchableOpacity>

            {showFeatures && (
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <Text style={styles.featureLabel}>卡片類型:</Text>
                  <Text style={styles.featureValue}>
                    {recognitionFeatures.cardType}
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureLabel}>稀有度:</Text>
                  <Text style={styles.featureValue}>
                    {recognitionFeatures.rarity}
                  </Text>
                </View>
                {recognitionFeatures.dominantColors && (
                  <View style={styles.featureItem}>
                    <Text style={styles.featureLabel}>主要顏色:</Text>
                    <View style={styles.colorPalette}>
                      {recognitionFeatures.dominantColors.map(
                        (color: string, index: number) => (
                          <View
                            key={index}
                            style={[
                              styles.colorSwatch,
                              { backgroundColor: color },
                            ]}
                          />
                        )
                      )}
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* 操作按鈕 */}
        <View style={styles.resultActions}>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>查看詳情</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>加入收藏</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={theme.colors.primary} />
          <Text style={styles.loadingText}>檢查相機權限...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>需要相機權限</Text>
          <Text style={styles.permissionText}>
            掃描卡牌功能需要相機權限才能正常使用
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={pickImage}>
            <Text style={styles.permissionButtonText}>從相冊選擇</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {isCameraActive ? (
        <View style={styles.cameraContainer}>
          <Camera
            ref={cameraRef}
            style={styles.camera}
            type={cameraType}
            flashMode={flashMode}
            ratio='4:3'
          >
            <View style={styles.cameraOverlay}>
              {/* 掃描框 */}
              <View style={styles.scanFrame}>
                <View style={styles.corner} />
                <View style={[styles.corner, styles.cornerTopRight]} />
                <View style={[styles.corner, styles.cornerBottomLeft]} />
                <View style={[styles.corner, styles.cornerBottomRight]} />
              </View>

              {/* 提示文字 */}
              <Text style={styles.scanText}>將卡牌放入框內進行掃描</Text>
            </View>
          </Camera>

          {/* 相機控制按鈕 */}
          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={toggleFlash}
            >
              <Text style={styles.controlButtonText}>
                {flashMode === FlashMode.off ? '💡' : '🔦'}
              </Text>
            </TouchableOpacity>

            <PulseButton
              style={styles.captureButton}
              onPress={takePicture}
              pulseColor={theme.colors.primary}
              pulseDuration={1500}
            >
              <View style={styles.captureButtonInner} />
            </PulseButton>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={toggleCameraType}
            >
              <Text style={styles.controlButtonText}>🔄</Text>
            </TouchableOpacity>
          </View>

          {/* 底部選項 */}
          <View style={styles.bottomOptions}>
            <TouchableOpacity style={styles.optionButton} onPress={pickImage}>
              <Text style={styles.optionButtonText}>📁 從相冊選擇</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <ScrollView style={styles.resultContainer}>
          {capturedImage && (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: capturedImage }}
                style={styles.capturedImage}
              />

              <View style={styles.imageActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={retakePicture}
                >
                  <Text style={styles.actionButtonText}>重新拍攝</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={pickImage}
                >
                  <Text style={styles.actionButtonText}>選擇其他</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {isRecognizing && (
            <View style={styles.recognizingContainer}>
              <ActivityIndicator size='large' color={theme.colors.primary} />
              <Text style={styles.recognizingText}>正在識別卡牌...</Text>
            </View>
          )}

          {recognizedCard && !isRecognizing && (
            <ScaleView duration={500} delay={200}>
              {renderRecognitionResult()}
            </ScaleView>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.medium,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.large,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.medium,
  },
  permissionText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.large,
  },
  permissionButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.large,
    paddingVertical: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
  },
  permissionButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: screenWidth * 0.8,
    height: screenWidth * 0.6,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.medium,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: theme.colors.primary,
    top: -2,
    left: -2,
  },
  cornerTopRight: {
    top: -2,
    right: -2,
    left: 'auto',
    borderLeftWidth: 0,
    borderRightWidth: 3,
  },
  cornerBottomLeft: {
    top: 'auto',
    bottom: -2,
    borderTopWidth: 0,
    borderBottomWidth: 3,
  },
  cornerBottomRight: {
    top: 'auto',
    right: -2,
    left: 'auto',
    bottom: -2,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  scanText: {
    position: 'absolute',
    bottom: -60,
    color: theme.colors.white,
    fontSize: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: theme.spacing.large,
    backgroundColor: theme.colors.backgroundLight,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.backgroundPaper,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonText: {
    fontSize: 20,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: theme.colors.white,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
  },
  bottomOptions: {
    paddingHorizontal: theme.spacing.large,
    paddingBottom: theme.spacing.large,
  },
  optionButton: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
  },
  optionButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    flex: 1,
    padding: theme.spacing.large,
  },
  imageContainer: {
    marginBottom: theme.spacing.large,
  },
  capturedImage: {
    width: '100%',
    height: 300,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.medium,
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    backgroundColor: theme.colors.backgroundPaper,
    paddingHorizontal: theme.spacing.large,
    paddingVertical: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
  },
  actionButtonText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
  },
  recognizingContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.large,
  },
  recognizingText: {
    marginTop: theme.spacing.medium,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.large,
  },
  cardInfo: {
    backgroundColor: theme.colors.backgroundPaper,
    padding: theme.spacing.large,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.large,
  },
  cardName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.small,
  },
  cardSeries: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.small,
  },
  cardRarity: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.small,
  },
  cardType: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.medium,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  confidenceContainer: {
    marginTop: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
  },
  confidenceLabel: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.small,
  },
  confidenceBar: {
    height: 10,
    backgroundColor: theme.colors.backgroundPaper,
    borderRadius: 5,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  confidenceText: {
    marginTop: theme.spacing.small,
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  alternativesContainer: {
    marginTop: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
  },
  alternativesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.small,
    paddingHorizontal: theme.spacing.medium,
    backgroundColor: theme.colors.backgroundPaper,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.small,
  },
  alternativesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  alternativesToggle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  alternativesList: {
    paddingHorizontal: theme.spacing.medium,
    paddingBottom: theme.spacing.medium,
  },
  alternativeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  alternativeName: {
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  alternativeConfidence: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  featuresContainer: {
    marginTop: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
  },
  featuresHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.small,
    paddingHorizontal: theme.spacing.medium,
    backgroundColor: theme.colors.backgroundPaper,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.small,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  featuresToggle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  featuresList: {
    paddingHorizontal: theme.spacing.medium,
    paddingBottom: theme.spacing.medium,
  },
  featureItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  featureLabel: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  featureValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  colorPalette: {
    flexDirection: 'row',
    marginTop: theme.spacing.small,
  },
  colorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 5,
  },
  resultActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.large,
    paddingVertical: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    flex: 1,
    marginRight: theme.spacing.small,
  },
  primaryButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: theme.spacing.large,
    paddingVertical: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    flex: 1,
    marginLeft: theme.spacing.small,
  },
  secondaryButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
