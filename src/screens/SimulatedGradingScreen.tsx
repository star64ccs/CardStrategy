import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { ImagePicker } from '../components/common/ImagePicker';
import { simulatedGradingService, GradingAgency, CreateGradingRequest } from '../services/simulatedGradingService';
import { logger } from '../utils/logger';
import { formatCurrency } from '../utils/formatters';

interface SimulatedGradingScreenProps {
  navigation: any;
}

export const SimulatedGradingScreen: React.FC<SimulatedGradingScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showCardSelector, setShowCardSelector] = useState(false);
  const [gradingResult, setGradingResult] = useState<any>(null);

  const handleCardSelect = (card: any) => {
    setSelectedCard(card);
    setShowCardSelector(false);
  };

  const handleImageSelect = (uri: string) => {
    setImageUri(uri);
    setShowImagePicker(false);
  };



  const startGrading = async () => {
    if (!selectedCard) {
      Alert.alert('錯誤', '請先選擇要鑑定的卡牌');
      return;
    }

    setIsLoading(true);
    try {
      const request: CreateGradingRequest = {
        cardId: selectedCard.id,
        imageData: imageUri || undefined
      };

      const response = await simulatedGradingService.createGradingReport(request);
      setGradingResult(response.data);

      Alert.alert(
        '鑑定完成',
        `您的卡牌已成功鑑定！\n鑑定編號: ${response.data.gradingNumber}`,
        [
          { text: '查看詳情', onPress: () => navigation.navigate('GradingReport', { report: response.data }) },
          { text: '確定' }
        ]
      );

      logger.info('模擬鑑定完成', {
        cardId: selectedCard.id,
        gradingNumber: response.data.gradingNumber
      });

    } catch (error: any) {
      logger.error('模擬鑑定失敗:', error);
      Alert.alert('鑑定失敗', error.message || '鑑定過程中發生錯誤');
    } finally {
      setIsLoading(false);
    }
  };



  const renderSelectedCard = () => {
    if (!selectedCard) return null;

    return (
      <Card style={styles.selectedCardContainer}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>已選擇的卡牌</Text>
          <TouchableOpacity onPress={() => setShowCardSelector(true)}>
            <Text style={[styles.changeButton, { color: colors.primary }]}>更換</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardInfo}>
          {selectedCard.imageUrl && (
            <Image source={{ uri: selectedCard.imageUrl }} style={styles.cardImage} />
          )}
          <View style={styles.cardDetails}>
            <Text style={[styles.cardName, { color: colors.text }]}>
              {selectedCard.name}
            </Text>
            <Text style={[styles.cardSet, { color: colors.textSecondary }]}>
              {selectedCard.setName}
            </Text>
            <Text style={[styles.cardRarity, { color: colors.textSecondary }]}>
              {selectedCard.rarity}
            </Text>
            {selectedCard.currentPrice && (
              <Text style={[styles.cardPrice, { color: colors.text }]}>
                {formatCurrency(selectedCard.currentPrice)}
              </Text>
            )}
          </View>
        </View>
      </Card>
    );
  };

  const renderImageSection = () => (
    <Card style={styles.imageSection}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>卡牌圖片 (可選)</Text>
      <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
        上傳卡牌圖片可以獲得更準確的鑑定結果
      </Text>

      {imageUri ? (
        <View style={styles.imagePreview}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
          <TouchableOpacity
            style={[styles.removeImageButton, { backgroundColor: colors.error }]}
            onPress={() => setImageUri(null)}
          >
            <Text style={styles.removeImageText}>移除</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.uploadButton, { borderColor: colors.border }]}
          onPress={() => setShowImagePicker(true)}
        >
          <Text style={[styles.uploadButtonText, { color: colors.primary }]}>
            📷 選擇圖片
          </Text>
        </TouchableOpacity>
      )}
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>模擬鑑定</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            使用 AI 技術模擬專業鑑定機構的評分系統
          </Text>
        </View>

        {/* 選擇卡牌 */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>選擇卡牌</Text>
          {renderSelectedCard()}
          {!selectedCard && (
            <TouchableOpacity
              style={[styles.selectCardButton, { borderColor: colors.border }]}
              onPress={() => setShowCardSelector(true)}
            >
              <Text style={[styles.selectCardButtonText, { color: colors.primary }]}>
                🎴 選擇要鑑定的卡牌
              </Text>
            </TouchableOpacity>
          )}
        </Card>

        {/* 鑑定說明 */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>鑑定說明</Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            系統將自動參考 PSA、BGS、CGC 等專業鑑定機構的評分準則，為您的卡牌提供綜合鑑定結果
          </Text>
        </Card>

        {/* 圖片上傳 */}
        {renderImageSection()}

        {/* 開始鑑定 */}
        <Card style={styles.section}>
          <Button
            title={isLoading ? '鑑定中...' : '開始鑑定'}
            onPress={startGrading}
            disabled={!selectedCard || isLoading}
            loading={isLoading}
            style={styles.gradingButton}
          />
          <Text style={[styles.disclaimer, { color: colors.textSecondary }]}>
            * 此為模擬鑑定結果，僅供參考。實際鑑定請聯繫專業鑑定機構。
          </Text>
        </Card>
      </ScrollView>

      {/* 圖片選擇器 */}
      <Modal
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        title="選擇卡牌圖片"
      >
        <ImagePicker
          onImageSelected={handleImageSelect}
          onCancel={() => setShowImagePicker(false)}
        />
      </Modal>

      {/* 卡牌選擇器 */}
      <Modal
        visible={showCardSelector}
        onClose={() => setShowCardSelector(false)}
        title="選擇卡牌"
      >
        <View style={styles.cardSelector}>
          <Text style={[styles.cardSelectorText, { color: colors.textSecondary }]}>
            請從您的收藏中選擇要鑑定的卡牌
          </Text>
          <TouchableOpacity
            style={[styles.selectFromCollectionButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              setShowCardSelector(false);
              navigation.navigate('CardCollection', { onCardSelect: handleCardSelect });
            }}
          >
            <Text style={styles.selectFromCollectionButtonText}>從收藏中選擇</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollView: {
    flex: 1,
    padding: 16
  },
  header: {
    marginBottom: 24
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24
  },
  section: {
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16
  },
  selectedCardContainer: {
    marginTop: 8
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600'
  },
  changeButton: {
    fontSize: 14,
    fontWeight: '500'
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  cardImage: {
    width: 60,
    height: 84,
    borderRadius: 8,
    marginRight: 12
  },
  cardDetails: {
    flex: 1
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4
  },
  cardSet: {
    fontSize: 14,
    marginBottom: 2
  },
  cardRarity: {
    fontSize: 14,
    marginBottom: 4
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: '600'
  },
  selectCardButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginTop: 8
  },
  selectCardButtonText: {
    fontSize: 16,
    fontWeight: '500'
  },

  imageSection: {
    marginBottom: 16
  },
  uploadButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginTop: 8
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '500'
  },
  imagePreview: {
    marginTop: 12,
    alignItems: 'center'
  },
  previewImage: {
    width: 120,
    height: 168,
    borderRadius: 8,
    marginBottom: 8
  },
  removeImageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8
  },
  removeImageText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500'
  },
  gradingButton: {
    marginBottom: 12
  },
  disclaimer: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    fontStyle: 'italic'
  },
  cardSelector: {
    padding: 20,
    alignItems: 'center'
  },
  cardSelectorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20
  },
  selectFromCollectionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  selectFromCollectionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500'
  }
});
