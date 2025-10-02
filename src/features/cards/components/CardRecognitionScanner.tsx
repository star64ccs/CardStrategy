import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { logger } from '../../../core/utils/logger';
import { useCardRecognition } from '../hooks/useCardRecognition';
import type {
  CardGame,
  CardRecognitionRequest,
  CardRecognitionResult,
} from '../types/recognition';
const _CameraComponent = Camera as any;

const { width, height } = Dimensions.get('window');

interface CardRecognitionScannerProps {
  onRecognitionComplete?: (result: CardRecognitionResult) => void;
  onClose?: () => void;
  initialGame?: CardGame;
  showAlternatives?: boolean;
  enableRealtime?: boolean;
  maxImageSize?: number;
  style?: unknown;
}

export const CardRecognitionScanner: React.FC<CardRecognitionScannerProps> = ({
  onRecognitionComplete,
  onClose,
  initialGame,
  showAlternatives = true,
  enableRealtime = false,
  maxImageSize = 1024,
  style,
}) => {
  const {
    isRecognizing,
    currentResult,
    recognitionError,
    selectedAlternative,
    showAlternatives: showAlternativesState,
    cropMode,
    cropData,
    isRealtimeActive,
    recognize,
    selectAlternative,
    toggleAlternatives,
    enableCropMode,
    disableCropMode,
    updateCropData,
    startRealtime,
    stopRealtime,
    clearRecognitionError,
    validateImage,
    formatProcessingTime,
    getConfidenceLevel,
    getSupportedGames,
  } = useCardRecognition({
    onRecognitionComplete,
    onRecognitionError: error => {
      Alert.alert('識別Error', error);
    },
  });

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [selectedGame, setSelectedGame] = useState<CardGame>(
    initialGame || 'pokemon'
  );
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showGameSelector, setShowGameSelector] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [cameraType, setCameraType] = useState<'front' | 'back'>('back');

  const _cameraRef = useRef<any>(null);
  const _supportedGames = getSupportedGames();

  // Request相機權限
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // 拍照
  const _takePicture = useCallback(async () => {
    try {
      if (!cameraRef.current) return;

      // 使用 Camera Instance的 takePictureAsync Method
      const _photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
        skipProcessing: false,
      });

      if (photo.base64) {
        const _processedImage = await processImage(photo.uri, photo.base64);
        setCapturedImage(processedImage);
        setShowCamera(false);
        await performRecognition(processedImage);
      }
    } catch (error: unknown) {
      logger.error('拍照Failed:', error);
      Alert.alert('Error', '拍照Failed，請重試');
    }
  }, []);

  // 從相簿SelectGraph片
  const _pickImage = useCallback(async () => {
    try {
      const _permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('權限不足', '需要訪問相簿的權限');
        return;
      }

      const _result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const _asset = result.assets[0];
        if (asset.base64) {
          const _processedImage = await processImage(asset.uri, asset.base64);
          setCapturedImage(processedImage);
          await performRecognition(processedImage);
        }
      }
    } catch (error: unknown) {
      logger.error('選擇圖片Failed:', error);
      Alert.alert('Error', '選擇圖片Failed，請重試');
    }
  }, []);

  // HandleGraph片
  const _processImage = useCallback(
    async (uri: string, base64: string): Promise<string> => {
      try {
        // 簡化Graph片Handle，直接Return base64 Data
        // 如果需要Graph片Handle，可以後續Add相應的Library
        return base64;
      } catch (error: unknown) {
        logger.error('圖片HandleFailed:', error);
        return base64;
      }
    },
    [maxImageSize]
  );

  // 執Row識別
  const _performRecognition = useCallback(
    async (imageData: string) => {
      try {
        clearRecognitionError();

        // VerifyGraph片
        const _validation = validateImage(imageData);
        if (!validation.valid) {
          Alert.alert('圖片VerifyFailed', validation.error || '無效的圖片');
          return;
        }

        const request: CardRecognitionRequest = {
          imageData,
          imageFormat: 'jpg',
          game: selectedGame,
          language: 'zh-TW',
          region: 'TW',
          cropData: cropData || undefined,
          options: {
            enableMultipleCards: false,
            enableTextExtraction: true,
            enableFeatureDetection: true,
            confidenceThreshold: 0.7,
            maxResults: 5,
            timeout: 30000,
            useCache: true,
          },
        };

        await recognize(request);
        setShowResultModal(true);
      } catch (error: unknown) {
        logger.error('執行識別Failed:', error);
        Alert.alert('識別Failed', error.message || '識別過程中發生Error');
      }
    },
    [selectedGame, cropData, recognize, validateImage, clearRecognitionError]
  );

  // Re識別
  const _retryRecognition = useCallback(() => {
    if (capturedImage) {
      performRecognition(capturedImage);
    }
  }, [capturedImage, performRecognition]);

  // Switch相機
  const _toggleCamera = useCallback(() => {
    setCameraType(current => (current === 'back' ? 'front' : 'back'));
  }, []);

  // Switch閃光燈
  const _toggleFlash = useCallback(() => {
    setFlashEnabled(current => !current);
  }, []);

  // Begin實時識別
  const _handleStartRealtime = useCallback(async () => {
    try {
      await startRealtime({
        onFrame: frame => {
          // Handle實時幀
          logger.debug('實時幀:', { frameId: frame.frameId } as Record<
            string,
            unknown
          >);
        },
        frameRate: 10, // 降低幀率以提高性能
      });
    } catch (error: unknown) {
      Alert.alert('Error', '啟動實時識別Failed');
    }
  }, [startRealtime]);

  // 渲染相機視Graph
  const _renderCameraView = () => {
    if (hasPermission === null) {
      return (
        <View style={styles.permissionContainer}>
          <ActivityIndicator size='large' color='#007AFF' />
          <Text style={styles.permissionText}>請求相機權限中...</Text>
        </View>
      );
    }

    if (hasPermission === false) {
      return (
        <View style={styles.permissionContainer}>
          <MaterialIcons name='camera-alt' size={64} color='#ccc' />
          <Text style={styles.permissionText}>沒有相機權限</Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={() => Camera.requestCameraPermissionsAsync()}
          >
            <Text style={styles.permissionButtonText}>授予權限</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.cameraContainer}>
        <CameraComponent
          ref={cameraRef}
          style={styles.camera}
          type={cameraType}
          flashMode={flashEnabled ? 'on' : 'off'}
          autoFocus='on'
        >
          {/* 相機覆蓋層 */}
          {/* 相機覆蓋層 */}
          <View style={styles.cameraOverlay}>
            {/* TopTool欄 */}
            <View style={styles.topToolbar}>
              <TouchableOpacity
                style={styles.toolbarButton}
                onPress={() => setShowCamera(false)}
              >
                <Ionicons name='close' size={24} color='white' />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.toolbarButton}
                onPress={toggleFlash}
              >
                <Ionicons
                  name={flashEnabled ? 'flash' : 'flash-off'}
                  size={24}
                  color='white'
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.toolbarButton}
                onPress={toggleCamera}
              >
                <Ionicons name='camera-reverse' size={24} color='white' />
              </TouchableOpacity>
            </View>

            {/* 卡片邊框指示器 */}
            <View style={styles.cardFrame}>
              <View style={styles.cornerTL} />
              <View style={styles.cornerTR} />
              <View style={styles.cornerBL} />
              <View style={styles.cornerBR} />
            </View>

            {/* BottomTool欄 */}
            <View style={styles.bottomToolbar}>
              <TouchableOpacity
                style={styles.galleryButton}
                onPress={pickImage}
              >
                <MaterialIcons name='photo-library' size={24} color='white' />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.captureButton}
                onPress={takePicture}
                disabled={isRecognizing}
              >
                <View style={styles.captureButtonInner}>
                  {isRecognizing ? (
                    <ActivityIndicator size='small' color='white' />
                  ) : (
                    <MaterialIcons name='camera' size={32} color='white' />
                  )}
                </View>
              </TouchableOpacity>

              {enableRealtime && (
                <TouchableOpacity
                  style={[
                    styles.realtimeButton,
                    isRealtimeActive && styles.realtimeButtonActive,
                  ]}
                  onPress={
                    isRealtimeActive ? stopRealtime : handleStartRealtime
                  }
                >
                  <MaterialIcons
                    name={isRealtimeActive ? 'stop' : 'play-arrow'}
                    size={24}
                    color='white'
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </CameraComponent>
      </View>
    );
  };

  // 渲染遊戲Select器
  const _renderGameSelector = () => (
    <Modal
      visible={showGameSelector}
      transparent
      animationType='slide'
      onRequestClose={() => setShowGameSelector(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.gameSelectorModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>選擇卡牌遊戲</Text>
            <TouchableOpacity onPress={() => setShowGameSelector(false)}>
              <Ionicons name='close' size={24} color='#666' />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.gameList}>
            {supportedGames.map(game => (
              <TouchableOpacity
                key={game}
                style={[
                  styles.gameItem,
                  selectedGame === game && styles.gameItemSelected,
                ]}
                onPress={() => {
                  setSelectedGame(game);
                  setShowGameSelector(false);
                }}
              >
                <Text
                  style={[
                    styles.gameItemText,
                    selectedGame === game && styles.gameItemTextSelected,
                  ]}
                >
                  {getGameDisplayName(game)}
                </Text>
                {selectedGame === game && (
                  <Ionicons name='checkmark' size={20} color='#007AFF' />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // 渲染識別結果
  const _renderResultModal = () => (
    <Modal
      visible={showResultModal}
      transparent
      animationType='slide'
      onRequestClose={() => setShowResultModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.resultModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>識別結果</Text>
            <TouchableOpacity onPress={() => setShowResultModal(false)}>
              <Ionicons name='close' size={24} color='#666' />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.resultContent}>
            {isRecognizing ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size='large' color='#007AFF' />
                <Text style={styles.loadingText}>識別中...</Text>
              </View>
            ) : recognitionError ? (
              <View style={styles.errorContainer}>
                <MaterialIcons name='error' size={48} color='#FF3B30' />
                <Text style={styles.errorText}>{recognitionError}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={retryRecognition}
                >
                  <Text style={styles.retryButtonText}>重試</Text>
                </TouchableOpacity>
              </View>
            ) : currentResult ? (
              <View style={styles.resultContainer}>
                {/* 卡片Information */}
                <View style={styles.cardInfo}>
                  <Image
                    source={{ uri: currentResult.card.images.front }}
                    style={styles.cardImage}
                    resizeMode='contain'
                  />

                  <View style={styles.cardDetails}>
                    <Text style={styles.cardName}>
                      {currentResult.card.name}
                    </Text>
                    <Text style={styles.cardSet}>{currentResult.set.name}</Text>
                    <Text style={styles.cardNumber}>
                      #{currentResult.card.cardNumber}
                    </Text>

                    {/* 信心度 */}
                    <View style={styles.confidenceContainer}>
                      <Text style={styles.confidenceLabel}>信心度：</Text>
                      <View
                        style={[
                          styles.confidenceBadge,
                          styles[
                            `confidence${getConfidenceLevel(currentResult.confidence)}`
                          ],
                        ]}
                      >
                        <Text style={styles.confidenceText}>
                          {(currentResult.confidence * 100).toFixed(1)}%
                        </Text>
                      </View>
                    </View>

                    {/* HandleTime */}
                    <Text style={styles.processingTime}>
                      處理時間：
                      {formatProcessingTime(currentResult.processingTime)}
                    </Text>
                  </View>
                </View>

                {/* Operation按鈕 */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => {
                      onRecognitionComplete?.(currentResult);
                      setShowResultModal(false);
                    }}
                  >
                    <Text style={styles.primaryButtonText}>確認</Text>
                  </TouchableOpacity>

                  {showAlternatives && (
                    <TouchableOpacity
                      style={styles.secondaryButton}
                      onPress={toggleAlternatives}
                    >
                      <Text style={styles.secondaryButtonText}>
                        {showAlternativesState ? '隱藏' : '顯示'}其他選項
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // 主界面
  const _renderMainInterface = () => (
    <View style={[styles.container, style]}>
      {/* 標題欄 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name='arrow-back' size={24} color='#333' />
        </TouchableOpacity>

        <Text style={styles.title}>卡牌識別</Text>

        <TouchableOpacity onPress={() => setShowGameSelector(true)}>
          <Text style={styles.gameSelector}>
            {getGameDisplayName(selectedGame)}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 主要Content */}
      <View style={styles.content}>
        {capturedImage ? (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: `data:image/jpeg;base64,${capturedImage}` }}
              style={styles.capturedImage}
              resizeMode='contain'
            />

            <View style={styles.imageActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setCapturedImage(null)}
              >
                <MaterialIcons name='delete' size={20} color='#FF3B30' />
                <Text style={styles.actionButtonText}>刪除</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={retryRecognition}
                disabled={isRecognizing}
              >
                <MaterialIcons name='refresh' size={20} color='#007AFF' />
                <Text style={styles.actionButtonText}>重新識別</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.placeholder}>
            <MaterialIcons name='camera-alt' size={64} color='#ccc' />
            <Text style={styles.placeholderText}>
              拍攝或選擇卡牌圖片開始識別
            </Text>
          </View>
        )}
      </View>

      {/* Bottom按鈕 */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.bottomButton}
          onPress={() => setShowCamera(true)}
        >
          <MaterialIcons name='camera-alt' size={24} color='white' />
          <Text style={styles.bottomButtonText}>拍照</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomButton} onPress={pickImage}>
          <MaterialIcons name='photo-library' size={24} color='white' />
          <Text style={styles.bottomButtonText}>相簿</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Get遊戲Show名稱
  const _getGameDisplayName = (game: CardGame): string => {
    const gameNames: Record<CardGame, string> = {
      pokemon: '寶可夢',
      yugioh: '遊戲王',
      magic: '魔法風雲會',
      digimon: '數碼寶貝',
      onepiece: '海賊王',
      dragonball: '七龍珠',
      flesh_and_blood: 'Flesh and Blood',
      lorcana: 'Lorcana',
      weiss_schwarz: 'Weiss Schwarz',
      cardfight_vanguard: 'Cardfight! Vanguard',
      force_of_will: 'Force of Will',
      other: '其他',
    };
    return gameNames[game] || game;
  };

  return (
    <>
      {showCamera ? renderCameraView() : renderMainInterface()}
      {renderGameSelector()}
      {renderResultModal()}
    </>
  );
};

const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  gameSelector: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  imageContainer: {
    flex: 1,
    alignItems: 'center',
  },
  capturedImage: {
    width: width - 32,
    height: (width - 32) * 1.4,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  imageActions: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#333',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
  },
  bottomActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  bottomButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    gap: 8,
  },
  bottomButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },

  // 相機樣式
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topToolbar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  toolbarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFrame: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 240,
    height: 336,
    marginTop: -168,
    marginLeft: -120,
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 20,
    height: 20,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: 'white',
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: 'white',
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 20,
    height: 20,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: 'white',
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: 'white',
  },
  bottomToolbar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 30,
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  captureButtonInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  realtimeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  realtimeButtonActive: {
    backgroundColor: 'rgba(255,0,0,0.7)',
  },

  // 權限樣式
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 16,
  },
  permissionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  permissionButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },

  // Modal 樣式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameSelectorModal: {
    width: width * 0.8,
    maxHeight: height * 0.6,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  resultModal: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  gameList: {
    maxHeight: 300,
  },
  gameItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  gameItemSelected: {
    backgroundColor: '#f0f8ff',
  },
  gameItemText: {
    fontSize: 16,
    color: '#333',
  },
  gameItemTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },

  // 結果樣式
  resultContent: {
    maxHeight: height * 0.6,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginVertical: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  resultContainer: {
    padding: 16,
  },
  cardInfo: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  cardImage: {
    width: 120,
    height: 168,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  cardDetails: {
    flex: 1,
    marginLeft: 16,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  cardSet: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  cardNumber: {
    fontSize: 14,
    color: '#999',
    marginBottom: 12,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  confidenceLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidencelow: {
    backgroundColor: '#ffebee',
  },
  confidencemedium: {
    backgroundColor: '#fff3e0',
  },
  confidencehigh: {
    backgroundColor: '#e8f5e8',
  },
  confidencevery_high: {
    backgroundColor: '#e3f2fd',
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  processingTime: {
    fontSize: 12,
    color: '#999',
  },
  actionButtons: {
    gap: 12,
  },
  primaryButton: {
    paddingVertical: 16,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default CardRecognitionScanner;
