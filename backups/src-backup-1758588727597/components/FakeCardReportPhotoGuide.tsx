// 假卡回報拍攝指引組件
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface FakeCardReportPhotoGuideProps {
  visible: boolean;
  onClose: () => void;
  onStartCapture: () => void;
}

export const FakeCardReportPhotoGuide: React.FC<
  FakeCardReportPhotoGuideProps
> = ({ visible, onClose, onStartCapture }) => {
  const [currentTip, setCurrentTip] = useState(0);

  const reportTips = [
    {
      icon: 'camera',
      title: '多角度拍攝',
      tips: [
        '拍攝卡片正面和背面',
        '重點拍攝假卡特徵',
        '拍攝細節特寫照片',
        '確保照片清晰可見',
      ],
    },
    {
      icon: 'eye',
      title: '突出問題',
      tips: [
        '重點拍攝印刷問題',
        '突出顯示材質差異',
        '拍攝顏色不匹配處',
        '記錄邊緣切割問題',
      ],
    },
    {
      icon: 'document',
      title: '詳細描述',
      tips: [
        '詳細描述假卡特徵',
        '說明發現問題的過程',
        '提供購買來源信息',
        '記錄發現時間和地點',
      ],
    },
    {
      icon: 'shield',
      title: '證據收集',
      tips: ['保存購買憑證', '記錄賣家信息', '拍攝包裝和標籤', '收集相關證據'],
    },
  ];

  const fakeCardTypes = [
    {
      id: 'counterfeit',
      name: '假卡 (Counterfeit)',
      icon: 'warning',
      description: '完全仿製的假卡，100積分',
      examples: ['印刷品質差', '材質不同', '顏色不匹配'],
    },
    {
      id: 'reprint',
      name: '重印卡 (Reprint)',
      icon: 'refresh',
      description: '未授權重印的卡片，50積分',
      examples: ['非官方重印', '質量較差', '無授權標記'],
    },
    {
      id: 'custom',
      name: '自製卡 (Custom)',
      icon: 'create',
      description: '個人自製的卡片，30積分',
      examples: ['手工製作', '非官方設計', '個人用途'],
    },
    {
      id: 'proxy',
      name: '代理卡 (Proxy)',
      icon: 'copy',
      description: '遊戲代理使用的卡片，20積分',
      examples: ['遊戲代理', '臨時替代', '非收藏用途'],
    },
  ];

  const photoRequirements = [
    {
      id: 'front',
      name: '正面照片',
      icon: 'card',
      required: true,
      description: '卡片正面完整照片，顯示假卡特徵',
    },
    {
      id: 'back',
      name: '背面照片',
      icon: 'card',
      required: true,
      description: '卡片背面照片，用於對比分析',
    },
    {
      id: 'details',
      name: '細節特寫',
      icon: 'search',
      required: true,
      description: '假卡特徵的詳細特寫照片',
    },
    {
      id: 'comparison',
      name: '對比照片',
      icon: 'git-compare',
      required: false,
      description: '與真卡的對比照片（如有）',
    },
    {
      id: 'packaging',
      name: '包裝照片',
      icon: 'cube',
      required: false,
      description: '包裝和標籤照片（如有）',
    },
  ];

  const rewardSystem = [
    {
      type: '假卡 (Counterfeit)',
      points: 100,
      description: '完全仿製的假卡',
    },
    {
      type: '重印卡 (Reprint)',
      points: 50,
      description: '未授權重印的卡片',
    },
    {
      type: '自製卡 (Custom)',
      points: 30,
      description: '個人自製的卡片',
    },
    {
      type: '代理卡 (Proxy)',
      points: 20,
      description: '遊戲代理使用的卡片',
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType='slide'
      presentationStyle='pageSheet'
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>假卡回報拍攝指引</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name='close' size={24} color='#666' />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* 功能說明 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 功能說明</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                假卡回報功能可以幫助我們收集假卡數據，提升AI真偽判斷能力：
              </Text>
              <Text style={styles.infoItem}>• 收集假卡樣本用於AI訓練</Text>
              <Text style={styles.infoItem}>• 建立假卡數據庫</Text>
              <Text style={styles.infoItem}>• 提升防偽判斷準確度</Text>
              <Text style={styles.infoItem}>• 保護其他用戶免受假卡欺騙</Text>
            </View>
          </View>

          {/* 拍攝技巧 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💡 拍攝技巧</Text>
            <View style={styles.tipCard}>
              <Ionicons
                name={reportTips[currentTip].icon as any}
                size={32}
                color='#007AFF'
              />
              <Text style={styles.tipTitle}>
                {reportTips[currentTip].title}
              </Text>
              {reportTips[currentTip].tips.map((tip, index) => (
                <Text key={index} style={styles.tipText}>
                  • {tip}
                </Text>
              ))}
            </View>
            <View style={styles.tipNavigation}>
              {reportTips.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.tipDot,
                    index === currentTip && styles.activeTipDot,
                  ]}
                  onPress={() => setCurrentTip(index)}
                />
              ))}
            </View>
          </View>

          {/* 假卡類型 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏷️ 假卡類型</Text>
            {fakeCardTypes.map(fakeType => (
              <View key={fakeType.id} style={styles.fakeTypeItem}>
                <View style={styles.fakeTypeInfo}>
                  <Ionicons
                    name={fakeType.icon as any}
                    size={20}
                    color='#dc3545'
                  />
                  <View style={styles.fakeTypeText}>
                    <Text style={styles.fakeTypeName}>{fakeType.name}</Text>
                    <Text style={styles.fakeTypeDescription}>
                      {fakeType.description}
                    </Text>
                    <View style={styles.examplesContainer}>
                      {fakeType.examples.map((example, index) => (
                        <Text key={index} style={styles.exampleText}>
                          • {example}
                        </Text>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* 拍攝要求 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 拍攝要求</Text>
            {photoRequirements.map(requirement => (
              <View key={requirement.id} style={styles.requirementItem}>
                <View style={styles.requirementInfo}>
                  <Ionicons
                    name={requirement.icon as any}
                    size={20}
                    color='#007AFF'
                  />
                  <View style={styles.requirementText}>
                    <Text style={styles.requirementName}>
                      {requirement.name}
                    </Text>
                    <Text style={styles.requirementDescription}>
                      {requirement.description}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.requiredBadge,
                    requirement.required && styles.requiredBadgeActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.requiredText,
                      requirement.required && styles.requiredTextActive,
                    ]}
                  >
                    {requirement.required ? '必需' : '可選'}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* 獎勵系統 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏆 獎勵系統</Text>
            {rewardSystem.map((reward, index) => (
              <View key={index} style={styles.rewardItem}>
                <View style={styles.rewardInfo}>
                  <Text style={styles.rewardType}>{reward.type}</Text>
                  <Text style={styles.rewardDescription}>
                    {reward.description}
                  </Text>
                </View>
                <View style={styles.pointsBadge}>
                  <Text style={styles.pointsText}>{reward.points} 積分</Text>
                </View>
              </View>
            ))}
          </View>

          {/* 注意事項 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠️ 注意事項</Text>
            <View style={styles.warningCard}>
              <Text style={styles.warningText}>
                • 請確保您擁有該卡片的合法權利
              </Text>
              <Text style={styles.warningText}>
                • 提交的數據僅用於AI訓練，不會公開
              </Text>
              <Text style={styles.warningText}>• 請提供準確的假卡類型分類</Text>
              <Text style={styles.warningText}>
                • 詳細描述有助於提高審核效率
              </Text>
              <Text style={styles.warningText}>
                • 審核通過後才能獲得積分獎勵
              </Text>
            </View>
          </View>

          {/* 隱私保護 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔒 隱私保護</Text>
            <View style={styles.privacyCard}>
              <Text style={styles.privacyText}>
                • 所有提交的數據都會加密存儲
              </Text>
              <Text style={styles.privacyText}>• 僅供後台AI訓練使用</Text>
              <Text style={styles.privacyText}>
                • 不會向其他用戶展示假卡數據
              </Text>
              <Text style={styles.privacyText}>• 建立嚴格的訪問控制機制</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.startButton} onPress={onStartCapture}>
            <Ionicons name='camera' size={20} color='white' />
            <Text style={styles.startButtonText}>開始拍攝</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  infoText: {
    fontSize: 14,
    color: '#1976d2',
    marginBottom: 8,
    fontWeight: '500',
  },
  infoItem: {
    fontSize: 13,
    color: '#1976d2',
    marginBottom: 4,
  },
  tipCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 12,
    marginBottom: 16,
  },
  tipText: {
    fontSize: 14,
    color: '#4a4a4a',
    lineHeight: 20,
    marginBottom: 4,
  },
  tipNavigation: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  tipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e1e5e9',
    marginHorizontal: 4,
  },
  activeTipDot: {
    backgroundColor: '#007AFF',
  },
  fakeTypeItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  fakeTypeInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  fakeTypeText: {
    marginLeft: 12,
    flex: 1,
  },
  fakeTypeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  fakeTypeDescription: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 8,
  },
  examplesContainer: {
    marginTop: 4,
  },
  exampleText: {
    fontSize: 11,
    color: '#6c757d',
    marginBottom: 2,
  },
  requirementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  requirementInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  requirementText: {
    marginLeft: 12,
    flex: 1,
  },
  requirementName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  requirementDescription: {
    fontSize: 12,
    color: '#6c757d',
    lineHeight: 16,
  },
  requiredBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#e1e5e9',
  },
  requiredBadgeActive: {
    backgroundColor: '#007AFF',
  },
  requiredText: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  requiredTextActive: {
    color: 'white',
  },
  rewardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 12,
    color: '#6c757d',
  },
  pointsBadge: {
    backgroundColor: '#28a745',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  pointsText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  warningCard: {
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
    marginBottom: 4,
  },
  privacyCard: {
    backgroundColor: '#d4edda',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  privacyText: {
    fontSize: 14,
    color: '#155724',
    lineHeight: 20,
    marginBottom: 4,
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
  },
  startButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default FakeCardReportPhotoGuide;
