import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/designSystem';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Badge } from '../common/Badge';

interface CardScannerOverlayProps {
  isScanning: boolean;
  isProcessing: boolean;
  scanResult?: {
    cardName: string;
    confidence: number;
    rarity: string;
    estimatedPrice: number;
  };
  onCapture: () => void;
  onToggleFlash: () => void;
  onSwitchCamera: () => void;
  onClose: () => void;
  flashEnabled: boolean;
  cameraType: 'back' | 'front';
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const CardScannerOverlay: React.FC<CardScannerOverlayProps> = ({
  isScanning,
  isProcessing,
  scanResult,
  onCapture,
  onToggleFlash,
  onSwitchCamera,
  onClose,
  flashEnabled,
  cameraType,
}) => {
  const [scanAnimation] = useState(new Animated.Value(0));
  const [pulseAnimation] = useState(new Animated.Value(1));

  useEffect(() => {
    if (isScanning) {
      // 掃描線動畫
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnimation, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanAnimation, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // 脈衝動畫
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scanAnimation.stopAnimation();
      pulseAnimation.stopAnimation();
    }
  }, [isScanning]);

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(2)}M`;
    }
    if (price >= 1000) {
      return `$${(price / 1000).toFixed(1)}K`;
    }
    return `$${price.toFixed(2)}`;
  };

  const getRarityColor = (rarity: string) => {
    const rarityColors = {
      common: theme.colors.rarity.common,
      uncommon: theme.colors.rarity.uncommon,
      rare: theme.colors.rarity.rare,
      mythic: theme.colors.rarity.mythic,
      special: theme.colors.rarity.special,
      promo: theme.colors.rarity.promo,
    };
    return (
      rarityColors[rarity as keyof typeof rarityColors] ||
      theme.colors.text.tertiary
    );
  };

  const scanLineTranslateY = scanAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, screenHeight * 0.6],
  });

  return (
    <View style={styles.container}>
      {/* 頂部控制欄 */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.topControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={onToggleFlash}
          >
            <Ionicons
              name={flashEnabled ? 'flash' : 'flash-off'}
              size={24}
              color={
                flashEnabled
                  ? theme.colors.gold.primary
                  : theme.colors.text.primary
              }
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={onSwitchCamera}
          >
            <Ionicons
              name="camera-reverse"
              size={24}
              color={theme.colors.text.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* 掃描區域指示器 */}
      <View style={styles.scanArea}>
        <View style={styles.cornerTopLeft} />
        <View style={styles.cornerTopRight} />
        <View style={styles.cornerBottomLeft} />
        <View style={styles.cornerBottomRight} />

        {/* 掃描線 */}
        {isScanning && (
          <Animated.View
            style={[
              styles.scanLine,
              {
                transform: [{ translateY: scanLineTranslateY }],
              },
            ]}
          />
        )}

        {/* 掃描提示 */}
        <View style={styles.scanHint}>
          <Text style={styles.scanHintText}>
            {isScanning ? '將卡片放入框內' : '點擊拍照按鈕開始掃描'}
          </Text>
        </View>
      </View>

      {/* 處理狀態 */}
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <LoadingSpinner
            size="large"
            text="正在識別卡片..."
            variant="spinner"
            color={theme.colors.gold.primary}
          />
        </View>
      )}

      {/* 掃描結果 */}
      {scanResult && !isProcessing && (
        <View style={styles.resultOverlay}>
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>識別結果</Text>
              <Badge
                text={`${scanResult.confidence}%`}
                variant="success"
                size="small"
              />
            </View>
            <Text style={styles.cardName}>{scanResult.cardName}</Text>
            <View style={styles.resultDetails}>
              <Badge
                text={scanResult.rarity}
                variant="default"
                size="small"
                style={{ backgroundColor: getRarityColor(scanResult.rarity) }}
              />
              <Text style={styles.estimatedPrice}>
                預估價值: {formatPrice(scanResult.estimatedPrice)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* 底部控制欄 */}
      <View style={styles.bottomBar}>
        <View style={styles.cameraControls}>
          <TouchableOpacity
            style={[
              styles.captureButton,
              isProcessing && styles.captureButtonDisabled,
            ]}
            onPress={onCapture}
            disabled={isProcessing}
          >
            <Animated.View
              style={[
                styles.captureButtonInner,
                {
                  transform: [{ scale: pulseAnimation }],
                },
              ]}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* 掃描狀態指示器 */}
      <View style={styles.statusIndicator}>
        <View style={styles.statusDot}>
          <Animated.View
            style={[
              styles.statusPulse,
              {
                transform: [{ scale: pulseAnimation }],
                opacity: isScanning ? 0.5 : 0,
              },
            ]}
          />
        </View>
        <Text style={styles.statusText}>
          {isScanning ? '掃描中...' : isProcessing ? '處理中...' : '準備就緒'}
        </Text>
      </View>

      {/* 提示信息 */}
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>掃描提示</Text>
        <View style={styles.tipItem}>
          <Ionicons
            name="checkmark-circle"
            size={16}
            color={theme.colors.status.success}
          />
          <Text style={styles.tipText}>確保卡片完整顯示在框內</Text>
        </View>
        <View style={styles.tipItem}>
          <Ionicons
            name="checkmark-circle"
            size={16}
            color={theme.colors.status.success}
          />
          <Text style={styles.tipText}>保持手機穩定，避免晃動</Text>
        </View>
        <View style={styles.tipItem}>
          <Ionicons
            name="checkmark-circle"
            size={16}
            color={theme.colors.status.success}
          />
          <Text style={styles.tipText}>確保光線充足，避免反光</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
  },
  closeButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  topControls: {
    flexDirection: 'row',
  },
  controlButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scanArea: {
    position: 'absolute',
    top: '25%',
    left: '10%',
    right: '10%',
    height: screenHeight * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: theme.colors.gold.primary,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: theme.colors.gold.primary,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: theme.colors.gold.primary,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: theme.colors.gold.primary,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: theme.colors.gold.primary,
    shadowColor: theme.colors.gold.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  scanHint: {
    position: 'absolute',
    bottom: -60,
    alignItems: 'center',
  },
  scanHintText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.primary,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultOverlay: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    right: '10%',
    alignItems: 'center',
  },
  resultCard: {
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.gold.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  resultTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  cardName: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  resultDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  estimatedPrice: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.gold.primary,
    fontWeight: theme.typography.weights.semibold,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
  },
  cameraControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.gold.primary,
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.gold.primary,
  },
  statusIndicator: {
    position: 'absolute',
    top: '15%',
    right: theme.spacing.lg,
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.gold.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  statusPulse: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.gold.primary,
  },
  statusText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.primary,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  tipsContainer: {
    position: 'absolute',
    bottom: 120,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  tipsTitle: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  tipText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs,
  },
});
