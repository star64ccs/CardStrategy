// BGS 快速拍攝指引組件
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

interface BGSQuickCaptureGuideProps {
  visible: boolean;
  onClose: () => void;
  onStartCapture: () => void;
}

export const BGSQuickCaptureGuide: React.FC<BGSQuickCaptureGuideProps> = ({
  visible,
  onClose,
  onStartCapture,
}) => {
  const [currentTip, setCurrentTip] = useState(0);

  const captureTips = [
    {
      icon: 'sunny',
      title: '光線設置',
      tips: [
        '使用自然光或均勻的 LED 燈',
        '避免直射陽光和陰影',
        '確保整個卡片受光均勻',
      ],
    },
    {
      icon: 'camera',
      title: '拍攝角度',
      tips: [
        '保持相機垂直於卡片',
        '使用三腳架或穩定器',
        '確保卡片完全在畫面內',
      ],
    },
    {
      icon: 'square',
      title: '背景設置',
      tips: ['使用純白色或淺色背景', '確保背景平整無皺褶', '避免有花紋的背景'],
    },
    {
      icon: 'eye',
      title: '細節拍攝',
      tips: ['使用微距模式拍攝特寫', '對焦清晰，避免模糊', '拍攝多張備選照片'],
    },
  ];

  const photoTypes = [
    { id: 'front', name: '正面照片', icon: 'card', required: true },
    { id: 'back', name: '背面照片', icon: 'card', required: true },
    { id: 'centering', name: '置中評估', icon: 'grid', required: true },
    {
      id: 'corners',
      name: '邊角特寫',
      icon: 'square',
      required: true,
      count: 4,
    },
    { id: 'edges', name: '邊緣特寫', icon: 'resize', required: true, count: 4 },
    { id: 'surface', name: '表面細節', icon: 'eye', required: true },
  ];

  return (
    <Modal
      visible={visible}
      animationType='slide'
      presentationStyle='pageSheet'
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>BGS 拍攝指引</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name='close' size={24} color='#666' />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* 快速提示 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💡 快速提示</Text>
            <View style={styles.tipCard}>
              <Ionicons
                name={captureTips[currentTip].icon as any}
                size={32}
                color='#007AFF'
              />
              <Text style={styles.tipTitle}>
                {captureTips[currentTip].title}
              </Text>
              {captureTips[currentTip].tips.map((tip, index) => (
                <Text key={index} style={styles.tipText}>
                  • {tip}
                </Text>
              ))}
            </View>
            <View style={styles.tipNavigation}>
              {captureTips.map((_, index) => (
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

          {/* 拍攝清單 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 拍攝清單</Text>
            {photoTypes.map(photoType => (
              <View key={photoType.id} style={styles.photoTypeItem}>
                <View style={styles.photoTypeInfo}>
                  <Ionicons
                    name={photoType.icon as any}
                    size={20}
                    color='#007AFF'
                  />
                  <Text style={styles.photoTypeName}>{photoType.name}</Text>
                  {photoType.count && (
                    <Text style={styles.photoTypeCount}>
                      ({photoType.count} 張)
                    </Text>
                  )}
                </View>
                <View
                  style={[
                    styles.requiredBadge,
                    photoType.required && styles.requiredBadgeActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.requiredText,
                      photoType.required && styles.requiredTextActive,
                    ]}
                  >
                    {photoType.required ? '必需' : '可選'}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* 注意事項 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠️ 注意事項</Text>
            <View style={styles.warningCard}>
              <Text style={styles.warningText}>
                • 確保卡片清潔，無指紋和污漬
              </Text>
              <Text style={styles.warningText}>
                • 拍攝前檢查相機鏡頭是否清潔
              </Text>
              <Text style={styles.warningText}>• 保持手機穩定，避免抖動</Text>
              <Text style={styles.warningText}>• 每張照片都要清晰對焦</Text>
            </View>
          </View>

          {/* 質量檢查 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✅ 質量檢查</Text>
            <View style={styles.checklistCard}>
              <Text style={styles.checklistItem}>✓ 照片清晰，無模糊</Text>
              <Text style={styles.checklistItem}>✓ 卡片完整在畫面內</Text>
              <Text style={styles.checklistItem}>✓ 光線均勻，無陰影</Text>
              <Text style={styles.checklistItem}>✓ 角度正確，無傾斜</Text>
              <Text style={styles.checklistItem}>✓ 背景合適，無干擾</Text>
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
  photoTypeItem: {
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
  photoTypeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  photoTypeName: {
    fontSize: 14,
    color: '#1a1a1a',
    marginLeft: 12,
    flex: 1,
  },
  photoTypeCount: {
    fontSize: 12,
    color: '#6c757d',
    marginLeft: 8,
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
  checklistCard: {
    backgroundColor: '#d4edda',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  checklistItem: {
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

export default BGSQuickCaptureGuide;
