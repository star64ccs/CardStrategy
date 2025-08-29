import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/config/theme';

interface ContextualHelpProps {
  visible: boolean;
  onClose: () => void;
  context?: any;
}

interface HelpSection {
  id: string;
  title: string;
  icon: string;
  color: string;
  items: HelpItem[];
}

interface HelpItem {
  id: string;
  title: string;
  description: string;
  example?: string;
}

const HELP_SECTIONS: HelpSection[] = [
  {
    id: 'basic',
    title: '基本功能',
    icon: 'help',
    color: '#2196F3',
    items: [
      {
        id: 'chat',
        title: '如何與AI助手對話',
        description:
          '直接在輸入框中輸入您的問題，AI助手會根據您的需求提供專業的回答。',
        example: '例如：「請分析這張卡片的投資價值」',
      },
      {
        id: 'voice',
        title: '語音輸入',
        description: '點擊麥克風圖標進行語音輸入，系統會自動將語音轉換為文字。',
        example: '按住麥克風按鈕開始錄音',
      },
      {
        id: 'image',
        title: '圖片分析',
        description: '點擊相機圖標上傳卡片圖片，AI會自動分析卡片信息。',
        example: '支持拍照或從相冊選擇圖片',
      },
    ],
  },
  {
    id: 'analysis',
    title: '卡片分析',
    icon: 'analytics',
    color: '#4CAF50',
    items: [
      {
        id: 'value',
        title: '價值評估',
        description:
          'AI會分析卡片的稀有度、市場需求、歷史價格等因素來評估價值。',
        example: '「這張卡片值多少錢？」',
      },
      {
        id: 'condition',
        title: '狀況評估',
        description: '通過圖片分析卡片的保存狀況，包括磨損程度、完整性等。',
        example: '「這張卡片的狀況如何？」',
      },
      {
        id: 'authenticity',
        title: '真偽鑑定',
        description: 'AI會檢查卡片的印刷質量、材質、防偽標記等來判斷真偽。',
        example: '「這張卡片是真品嗎？」',
      },
    ],
  },
  {
    id: 'investment',
    title: '投資建議',
    icon: 'trending-up',
    color: '#FF9800',
    items: [
      {
        id: 'advice',
        title: '投資建議',
        description: '基於市場數據和趨勢分析，提供個性化的投資建議。',
        example: '「這張卡片值得投資嗎？」',
      },
      {
        id: 'timing',
        title: '時機分析',
        description: '分析最佳買入和賣出時機，幫助您做出明智的投資決策。',
        example: '「什麼時候買入比較好？」',
      },
      {
        id: 'risk',
        title: '風險評估',
        description: '評估投資風險，包括市場風險、流動性風險等。',
        example: '「投資這張卡片有什麼風險？」',
      },
    ],
  },
  {
    id: 'market',
    title: '市場分析',
    icon: 'show-chart',
    color: '#9C27B0',
    items: [
      {
        id: 'trend',
        title: '市場趨勢',
        description: '分析卡片市場的整體趨勢，包括價格走勢、需求變化等。',
        example: '「最近的市場趨勢怎麼樣？」',
      },
      {
        id: 'prediction',
        title: '價格預測',
        description: '基於歷史數據和市場因素，預測卡片未來的價格走勢。',
        example: '「這張卡片的價格會漲嗎？」',
      },
      {
        id: 'competition',
        title: '競爭分析',
        description: '分析市場競爭情況，包括同類卡片的價格和需求。',
        example: '「市場上有類似的卡片嗎？」',
      },
    ],
  },
  {
    id: 'advanced',
    title: '高級功能',
    icon: 'settings',
    color: '#607D8B',
    items: [
      {
        id: 'translation',
        title: '多語言翻譯',
        description: '支持多種語言的翻譯功能，方便國際交流。',
        example: '點擊翻譯按鈕選擇目標語言',
      },
      {
        id: 'emotion',
        title: '情感分析',
        description: 'AI會分析您的消息情感，提供更貼心的回應。',
        example: '系統會自動分析您的情緒狀態',
      },
      {
        id: 'suggestions',
        title: '智能建議',
        description: '根據對話內容，AI會提供相關的問題建議。',
        example: '點擊建議按鈕查看相關問題',
      },
    ],
  },
];

export const ContextualHelp: React.FC<ContextualHelpProps> = ({
  visible,
  onClose,
  context,
}) => {
  const getContextualSections = () => {
    if (!context) return HELP_SECTIONS;

    // 根據上下文過濾相關的幫助部分
    const relevantSections = HELP_SECTIONS.filter(section => {
      if (context.hasAnalysis && section.id === 'analysis') return true;
      if (context.hasInvestment && section.id === 'investment') return true;
      if (context.hasMarket && section.id === 'market') return true;
      return section.id === 'basic';
    });

    return relevantSections.length > 0 ? relevantSections : HELP_SECTIONS;
  };

  const renderHelpItem = (item: HelpItem) => (
    <View key={item.id} style={styles.helpItem}>
      <View style={styles.helpItemHeader}>
        <Text style={styles.helpItemTitle}>{item.title}</Text>
      </View>
      <Text style={styles.helpItemDescription}>{item.description}</Text>
      {item.example && (
        <View style={styles.exampleContainer}>
          <MaterialIcons
            name='lightbulb-outline'
            size={16}
            color={theme.colors.primary}
          />
          <Text style={styles.exampleText}>{item.example}</Text>
        </View>
      )}
    </View>
  );

  const renderHelpSection = (section: HelpSection) => (
    <View key={section.id} style={styles.helpSection}>
      <View style={styles.sectionHeader}>
        <View
          style={[
            styles.sectionIcon,
            { backgroundColor: section.color + '20' },
          ]}
        >
          <MaterialIcons
            name={section.icon as any}
            size={24}
            color={section.color}
          />
        </View>
        <Text style={styles.sectionTitle}>{section.title}</Text>
      </View>
      {section.items.map(renderHelpItem)}
    </View>
  );

  const renderQuickTips = () => (
    <View style={styles.quickTipsContainer}>
      <Text style={styles.quickTipsTitle}>💡 快速提示</Text>
      <View style={styles.quickTipsList}>
        <Text style={styles.quickTip}>• 使用具體的問題會得到更準確的回答</Text>
        <Text style={styles.quickTip}>
          • 上傳清晰的卡片圖片可以提高分析準確度
        </Text>
        <Text style={styles.quickTip}>• 定期查看市場趨勢可以把握投資時機</Text>
        <Text style={styles.quickTip}>• 保存重要的分析結果以便後續參考</Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType='slide'
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <MaterialIcons
                name='help'
                size={24}
                color={theme.colors.primary}
              />
              <Text style={styles.headerTitle}>幫助中心</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <MaterialIcons
                name='close'
                size={24}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* 歡迎信息 */}
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeTitle}>歡迎使用卡策AI助手！</Text>
              <Text style={styles.welcomeDescription}>
                我是您的智能卡片投資顧問，可以幫助您分析卡片、提供投資建議、預測市場趨勢等。
                以下是詳細的使用指南：
              </Text>
            </View>

            {/* 幫助部分 */}
            {getContextualSections().map(renderHelpSection)}

            {/* 快速提示 */}
            {renderQuickTips()}

            {/* 聯繫支持 */}
            <View style={styles.supportContainer}>
              <Text style={styles.supportTitle}>需要更多幫助？</Text>
              <Text style={styles.supportDescription}>
                如果您在使用過程中遇到問題，可以：
              </Text>
              <View style={styles.supportOptions}>
                <View style={styles.supportOption}>
                  <MaterialIcons
                    name='email'
                    size={20}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.supportOptionText}>
                    發送郵件至 support@cardstrategy.com
                  </Text>
                </View>
                <View style={styles.supportOption}>
                  <MaterialIcons
                    name='chat'
                    size={20}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.supportOptionText}>在應用內反饋問題</Text>
                </View>
                <View style={styles.supportOption}>
                  <MaterialIcons
                    name='book'
                    size={20}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.supportOptionText}>查看完整使用手冊</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '85%',
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginLeft: 8,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
  },
  welcomeContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: theme.colors.primary + '10',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  welcomeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 8,
  },
  welcomeDescription: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    lineHeight: 20,
  },
  helpSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  helpItem: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  helpItemHeader: {
    marginBottom: 8,
  },
  helpItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  helpItemDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  exampleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: theme.colors.primary + '10',
    borderRadius: 8,
  },
  exampleText: {
    fontSize: 12,
    color: theme.colors.primary,
    marginLeft: 6,
    fontStyle: 'italic',
  },
  quickTipsContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  quickTipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 12,
  },
  quickTipsList: {
    marginLeft: 8,
  },
  quickTip: {
    fontSize: 14,
    color: '#BF360C',
    lineHeight: 20,
    marginBottom: 4,
  },
  supportContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  supportDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  supportOptions: {
    marginLeft: 8,
  },
  supportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  supportOptionText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    marginLeft: 8,
  },
});
