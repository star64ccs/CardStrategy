import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/config/theme';

const { width: screenWidth } = Dimensions.get('window');

interface SmartSuggestionsProps {
  suggestions: string[];
  onSuggestion: (suggestion: string) => void;
  onClose: () => void;
  maxSuggestions?: number;
}

interface SuggestionCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  suggestions: string[];
}

export const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({
  suggestions,
  onSuggestion,
  onClose,
  maxSuggestions = 6
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [slideAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    // 滑入動畫
    Animated.timing(slideAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start();
  }, []);

  const categorizedSuggestions: SuggestionCategory[] = [
    {
      id: 'analysis',
      title: '卡片分析',
      icon: 'analytics',
      color: '#2196F3',
      suggestions: [
        '分析這張卡片的投資價值',
        '這張卡片的稀有度如何',
        '卡片狀況評估',
        '市場價格分析'
      ]
    },
    {
      id: 'investment',
      title: '投資建議',
      icon: 'trending-up',
      color: '#4CAF50',
      suggestions: [
        '這張卡片值得投資嗎',
        '投資時機建議',
        '風險評估',
        '長期投資策略'
      ]
    },
    {
      id: 'market',
      title: '市場趨勢',
      icon: 'show-chart',
      color: '#FF9800',
      suggestions: [
        '最近的市場趨勢',
        '價格預測',
        '市場熱度分析',
        '競爭對手分析'
      ]
    },
    {
      id: 'general',
      title: '一般問題',
      icon: 'help',
      color: '#9C27B0',
      suggestions: [
        '如何保存卡片',
        '真偽鑑定方法',
        '交易平台推薦',
        '收藏建議'
      ]
    }
  ];

  const handleSuggestionPress = (suggestion: string) => {
    // 滑出動畫
    Animated.timing(slideAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true
    }).start(() => {
      onSuggestion(suggestion);
    });
  };

  const handleClose = () => {
    Animated.timing(slideAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true
    }).start(() => {
      onClose();
    });
  };

  const renderSuggestionItem = (suggestion: string, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.suggestionItem}
      onPress={() => handleSuggestionPress(suggestion)}
      activeOpacity={0.7}
    >
      <MaterialIcons 
        name="lightbulb-outline" 
        size={16} 
        color={theme.colors.primary} 
      />
      <Text style={styles.suggestionText}>{suggestion}</Text>
      <MaterialIcons 
        name="arrow-forward-ios" 
        size={12} 
        color={theme.colors.textSecondary} 
      />
    </TouchableOpacity>
  );

  const renderCategoryItem = (category: SuggestionCategory) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryItem,
        selectedCategory === category.id && styles.categoryItemSelected
      ]}
      onPress={() => setSelectedCategory(
        selectedCategory === category.id ? null : category.id
      )}
      activeOpacity={0.7}
    >
      <View style={[
        styles.categoryIcon,
        { backgroundColor: category.color + '20' }
      ]}>
        <MaterialIcons 
          name={category.icon as any} 
          size={20} 
          color={category.color} 
        />
      </View>
      <Text style={[
        styles.categoryTitle,
        selectedCategory === category.id && styles.categoryTitleSelected
      ]}>
        {category.title}
      </Text>
      <MaterialIcons 
        name={selectedCategory === category.id ? 'expand-less' : 'expand-more'} 
        size={16} 
        color={theme.colors.textSecondary} 
      />
    </TouchableOpacity>
  );

  const getDisplaySuggestions = () => {
    if (selectedCategory) {
      const category = categorizedSuggestions.find(c => c.id === selectedCategory);
      return category ? category.suggestions : suggestions;
    }
    return suggestions.slice(0, maxSuggestions);
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            {
              translateY: slideAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [100, 0]
              })
            }
          ],
          opacity: slideAnimation
        }
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="lightbulb" size={20} color={theme.colors.primary} />
          <Text style={styles.headerTitle}>智能建議</Text>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <MaterialIcons name="close" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {/* 分類建議 */}
        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>按類別瀏覽</Text>
          {categorizedSuggestions.map(renderCategoryItem)}
        </View>

        {/* 展開的建議 */}
        {selectedCategory && (
          <View style={styles.expandedSuggestions}>
            {categorizedSuggestions
              .find(c => c.id === selectedCategory)
              ?.suggestions.map((suggestion, index) => 
                renderSuggestionItem(suggestion, index)
              )}
          </View>
        )}

        {/* 一般建議 */}
        {!selectedCategory && (
          <View style={styles.generalSuggestions}>
            <Text style={styles.sectionTitle}>推薦問題</Text>
            {getDisplaySuggestions().map((suggestion, index) => 
              renderSuggestionItem(suggestion, index)
            )}
          </View>
        )}

        {/* 快速操作 */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>快速操作</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => handleSuggestionPress('分析當前卡片')}
            >
              <MaterialIcons name="camera-alt" size={24} color={theme.colors.primary} />
              <Text style={styles.quickActionText}>掃描卡片</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => handleSuggestionPress('查看市場趨勢')}
            >
              <MaterialIcons name="trending-up" size={24} color={theme.colors.primary} />
              <Text style={styles.quickActionText}>市場趨勢</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => handleSuggestionPress('投資建議')}
            >
              <MaterialIcons name="lightbulb" size={24} color={theme.colors.primary} />
              <Text style={styles.quickActionText}>投資建議</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => handleSuggestionPress('價格預測')}
            >
              <MaterialIcons name="show-chart" size={24} color={theme.colors.primary} />
              <Text style={styles.quickActionText}>價格預測</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    maxHeight: '60%'
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
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginLeft: 8
  },
  closeButton: {
    padding: 4
  },
  content: {
    padding: 16
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 12
  },
  categoriesContainer: {
    marginBottom: 16
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  categoryItemSelected: {
    backgroundColor: theme.colors.primary + '10',
    borderColor: theme.colors.primary
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  categoryTitle: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textPrimary
  },
  categoryTitleSelected: {
    color: theme.colors.primary,
    fontWeight: 'bold'
  },
  expandedSuggestions: {
    marginBottom: 16
  },
  generalSuggestions: {
    marginBottom: 16
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textPrimary,
    marginLeft: 8,
    marginRight: 8
  },
  quickActions: {
    marginBottom: 16
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  quickActionButton: {
    width: (screenWidth - 64) / 2 - 8,
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  quickActionText: {
    fontSize: 12,
    color: theme.colors.textPrimary,
    marginTop: 4,
    textAlign: 'center'
  }
});
