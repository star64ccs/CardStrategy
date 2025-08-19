import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/config/theme';

const { width: screenWidth } = Dimensions.get('window');

interface QuickActionsPanelProps {
  visible: boolean;
  onClose: () => void;
  onAction: (action: string) => void;
  currentAnalysis?: any;
  pricePrediction?: any;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  action: string;
  category: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  // 卡片分析
  {
    id: 'scan-card',
    title: '掃描卡片',
    description: '使用相機掃描卡片進行分析',
    icon: 'camera-alt',
    color: '#2196F3',
    action: '請幫我掃描並分析這張卡片',
    category: 'analysis'
  },
  {
    id: 'card-value',
    title: '價值評估',
    description: '評估卡片的市場價值',
    icon: 'attach-money',
    color: '#4CAF50',
    action: '請評估這張卡片的市場價值',
    category: 'analysis'
  },
  {
    id: 'condition-check',
    title: '狀況檢查',
    description: '檢查卡片的保存狀況',
    icon: 'visibility',
    color: '#FF9800',
    action: '請檢查這張卡片的保存狀況',
    category: 'analysis'
  },
  {
    id: 'authenticity',
    title: '真偽鑑定',
    description: '鑑定卡片的真偽',
    icon: 'verified',
    color: '#9C27B0',
    action: '請鑑定這張卡片的真偽',
    category: 'analysis'
  },

  // 投資建議
  {
    id: 'investment-advice',
    title: '投資建議',
    description: '獲取投資建議',
    icon: 'trending-up',
    color: '#4CAF50',
    action: '請給我一些投資建議',
    category: 'investment'
  },
  {
    id: 'risk-assessment',
    title: '風險評估',
    description: '評估投資風險',
    icon: 'warning',
    color: '#F44336',
    action: '請評估這項投資的風險',
    category: 'investment'
  },
  {
    id: 'timing',
    title: '時機分析',
    description: '分析最佳投資時機',
    icon: 'schedule',
    color: '#607D8B',
    action: '請分析最佳投資時機',
    category: 'investment'
  },
  {
    id: 'portfolio',
    title: '組合建議',
    description: '投資組合建議',
    icon: 'dashboard',
    color: '#795548',
    action: '請給我投資組合建議',
    category: 'investment'
  },

  // 市場分析
  {
    id: 'market-trend',
    title: '市場趨勢',
    description: '查看市場趨勢',
    icon: 'show-chart',
    color: '#2196F3',
    action: '請分析最近的市場趨勢',
    category: 'market'
  },
  {
    id: 'price-prediction',
    title: '價格預測',
    description: '預測價格走勢',
    icon: 'timeline',
    color: '#FF9800',
    action: '請預測這張卡片的價格走勢',
    category: 'market'
  },
  {
    id: 'competition',
    title: '競爭分析',
    description: '分析競爭對手',
    icon: 'compare',
    color: '#9C27B0',
    action: '請分析競爭對手',
    category: 'market'
  },
  {
    id: 'demand',
    title: '需求分析',
    description: '分析市場需求',
    icon: 'people',
    color: '#4CAF50',
    action: '請分析市場需求',
    category: 'market'
  },

  // 一般功能
  {
    id: 'preservation',
    title: '保存建議',
    description: '卡片保存建議',
    icon: 'security',
    color: '#607D8B',
    action: '請給我卡片保存建議',
    category: 'general'
  },
  {
    id: 'trading-platform',
    title: '交易平台',
    description: '推薦交易平台',
    icon: 'store',
    color: '#795548',
    action: '請推薦一些交易平台',
    category: 'general'
  },
  {
    id: 'collection',
    title: '收藏建議',
    description: '收藏策略建議',
    icon: 'collections',
    color: '#9C27B0',
    action: '請給我收藏策略建議',
    category: 'general'
  },
  {
    id: 'education',
    title: '學習資源',
    description: '推薦學習資源',
    icon: 'school',
    color: '#2196F3',
    action: '請推薦一些學習資源',
    category: 'general'
  }
];

const CATEGORIES = [
  { id: 'analysis', title: '卡片分析', icon: 'analytics' },
  { id: 'investment', title: '投資建議', icon: 'trending-up' },
  { id: 'market', title: '市場分析', icon: 'show-chart' },
  { id: 'general', title: '一般功能', icon: 'help' }
];

export const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({
  visible,
  onClose,
  onAction,
  currentAnalysis,
  pricePrediction
}) => {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('analysis');

  const handleActionPress = (action: string) => {
    onAction(action);
    onClose();
  };

  const getFilteredActions = () => {
    return QUICK_ACTIONS.filter(action => action.category === selectedCategory);
  };

  const renderActionItem = (action: QuickAction) => (
    <TouchableOpacity
      key={action.id}
      style={styles.actionItem}
      onPress={() => handleActionPress(action.action)}
      activeOpacity={0.7}
    >
      <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
        <MaterialIcons name={action.icon as any} size={24} color={action.color} />
      </View>
      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>{action.title}</Text>
        <Text style={styles.actionDescription}>{action.description}</Text>
      </View>
      <MaterialIcons name="arrow-forward-ios" size={16} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderCategoryTab = (category: { id: string; title: string; icon: string }) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryTab,
        selectedCategory === category.id && styles.categoryTabSelected
      ]}
      onPress={() => setSelectedCategory(category.id)}
      activeOpacity={0.7}
    >
      <MaterialIcons 
        name={category.icon as any} 
        size={20} 
        color={selectedCategory === category.id ? '#fff' : theme.colors.textSecondary} 
      />
      <Text style={[
        styles.categoryTabText,
        selectedCategory === category.id && styles.categoryTabTextSelected
      ]}>
        {category.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <MaterialIcons name="flash-on" size={24} color={theme.colors.primary} />
              <Text style={styles.headerTitle}>快速操作</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <MaterialIcons name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* 當前狀態顯示 */}
          {(currentAnalysis || pricePrediction) && (
            <View style={styles.statusContainer}>
              <Text style={styles.statusTitle}>當前狀態</Text>
              {currentAnalysis && (
                <View style={styles.statusItem}>
                  <MaterialIcons name="analytics" size={16} color={theme.colors.primary} />
                  <Text style={styles.statusText}>已分析卡片</Text>
                </View>
              )}
              {pricePrediction && (
                <View style={styles.statusItem}>
                  <MaterialIcons name="timeline" size={16} color={theme.colors.primary} />
                  <Text style={styles.statusText}>價格預測可用</Text>
                </View>
              )}
            </View>
          )}

          {/* 分類標籤 */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
          >
            {CATEGORIES.map(renderCategoryTab)}
          </ScrollView>

          {/* 操作列表 */}
          <ScrollView style={styles.actionsContainer} showsVerticalScrollIndicator={false}>
            {getFilteredActions().map(renderActionItem)}
          </ScrollView>

          {/* 最近使用 */}
          <View style={styles.recentContainer}>
            <Text style={styles.recentTitle}>最近使用</Text>
            <View style={styles.recentActions}>
              <TouchableOpacity
                style={styles.recentAction}
                onPress={() => handleActionPress('分析這張卡片的投資價值')}
              >
                <MaterialIcons name="analytics" size={16} color={theme.colors.primary} />
                <Text style={styles.recentActionText}>卡片分析</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.recentAction}
                onPress={() => handleActionPress('請給我投資建議')}
              >
                <MaterialIcons name="trending-up" size={16} color={theme.colors.primary} />
                <Text style={styles.recentActionText}>投資建議</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.recentAction}
                onPress={() => handleActionPress('請分析最近的市場趨勢')}
              >
                <MaterialIcons name="show-chart" size={16} color={theme.colors.primary} />
                <Text style={styles.recentActionText}>市場趨勢</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    alignItems: 'center'
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    overflow: 'hidden'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginLeft: 8
  },
  closeButton: {
    padding: 4
  },
  statusContainer: {
    padding: 16,
    backgroundColor: theme.colors.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 8
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  statusText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: 8
  },
  categoriesContainer: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  categoriesContent: {
    padding: 16
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: theme.colors.backgroundLight,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  categoryTabSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary
  },
  categoryTabText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: 6
  },
  categoryTabTextSelected: {
    color: '#fff'
  },
  actionsContainer: {
    flex: 1,
    padding: 16
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  actionContent: {
    flex: 1
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 4
  },
  actionDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 16
  },
  recentContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 12
  },
  recentActions: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  recentAction: {
    alignItems: 'center',
    padding: 12
  },
  recentActionText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4
  }
});
