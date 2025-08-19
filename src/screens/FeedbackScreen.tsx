import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Dimensions
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import {
  Card,
  Button,
  Loading,
  Toast,
  Badge,
  AnimatedView,
  SlideUpView,
  FadeInView
} from '../components/common';
import { theme } from '../config/theme';
import { logger } from '../utils/logger';
import {
  fetchFeedbacks,
  fetchFeedbackStats,
  fetchFeedbackTemplates,
  fetchFeedbackTags,
  selectFeedbacks,
  selectFeedbackStats,
  selectFeedbackTemplates,
  selectFeedbackTags,
  selectFeedbackLoadingStates,
  selectFeedbackError,
  clearError
} from '../store/slices/feedbackSlice';
import { FeedbackItem } from '../components/feedback/FeedbackItem';
import { FeedbackFilter } from '../components/feedback/FeedbackFilter';
import { FeedbackStats } from '../components/feedback/FeedbackStats';
import { CreateFeedbackModal } from '../components/feedback/CreateFeedbackModal';

const { width } = Dimensions.get('window');

interface FeedbackScreenProps {
  onNavigateToDetail: (feedbackId: string) => void;
}

const FeedbackScreen: React.FC<FeedbackScreenProps> = ({
  onNavigateToDetail
}) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // Redux 狀態
  const feedbacks = useSelector(selectFeedbacks);
  const stats = useSelector(selectFeedbackStats);
  const templates = useSelector(selectFeedbackTemplates);
  const tags = useSelector(selectFeedbackTags);
  const { isLoading, isCreating } = useSelector(selectFeedbackLoadingStates);
  const error = useSelector(selectFeedbackError);

  // 本地狀態
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // 初始化數據
  useEffect(() => {
    loadInitialData();
  }, []);

  // 監聽錯誤
  useEffect(() => {
    if (error) {
      Toast.show({
        type: 'error',
        title: t('feedback.error.title'),
        message: error
      });
      dispatch(clearError());
    }
  }, [error, dispatch, t]);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        dispatch(fetchFeedbacks()).unwrap(),
        dispatch(fetchFeedbackStats()).unwrap(),
        dispatch(fetchFeedbackTemplates()).unwrap(),
        dispatch(fetchFeedbackTags()).unwrap()
      ]);
    } catch (error) {
      logger.error('載入反饋數據失敗', { error });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadInitialData();
    } catch (error) {
      logger.error('刷新反饋數據失敗', { error });
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateFeedback = () => {
    setShowCreateModal(true);
  };

  const handleFeedbackCreated = (feedbackId: string) => {
    setShowCreateModal(false);
    setSelectedTemplate(null);

    Toast.show({
      type: 'success',
      title: t('feedback.create.success.title'),
      message: t('feedback.create.success.message')
    });

    // 導航到新創建的反饋詳情
    onNavigateToDetail(feedbackId);
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setShowCreateModal(true);
  };

  const handleFeedbackPress = (feedbackId: string) => {
    onNavigateToDetail(feedbackId);
  };

  const handleFilterApply = (filter: any) => {
    setShowFilter(false);
    // 這裡可以應用過濾器
    logger.info('應用反饋過濾器', { filter });
  };

  const renderHeader = () => (
    <AnimatedView style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.title}>{t('feedback.title')}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setShowStats(!showStats)}
          >
            <Ionicons
              name={showStats ? 'stats-chart' : 'stats-chart-outline'}
              size={24}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setShowFilter(!showFilter)}
          >
            <Ionicons
              name={showFilter ? 'filter' : 'filter-outline'}
              size={24}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {showStats && stats && (
        <SlideUpView style={styles.statsContainer}>
          <FeedbackStats stats={stats} />
        </SlideUpView>
      )}

      {showFilter && (
        <SlideUpView style={styles.filterContainer}>
          <FeedbackFilter
            onApply={handleFilterApply}
            onCancel={() => setShowFilter(false)}
          />
        </SlideUpView>
      )}
    </AnimatedView>
  );

  const renderTemplates = () => {
    if (templates.length === 0) return null;

    return (
      <FadeInView style={styles.templatesSection}>
        <Text style={styles.sectionTitle}>{t('feedback.templates.title')}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.templatesContainer}
        >
          {templates.map((template) => (
            <TouchableOpacity
              key={template.id}
              style={styles.templateCard}
              onPress={() => handleTemplateSelect(template.id)}
            >
              <Text style={styles.templateName}>{template.name}</Text>
              <Text style={styles.templateDescription} numberOfLines={2}>
                {template.description}
              </Text>
              <Badge
                label={t(`feedback.type.${template.type}`)}
                variant="outline"
                size="small"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </FadeInView>
    );
  };

  const renderFeedbacks = () => {
    if (isLoading && feedbacks.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <Loading size="large" />
          <Text style={styles.loadingText}>{t('feedback.loading')}</Text>
        </View>
      );
    }

    if (feedbacks.length === 0) {
      return (
        <FadeInView style={styles.emptyContainer}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={64}
            color={theme.colors.textSecondary}
          />
          <Text style={styles.emptyTitle}>{t('feedback.empty.title')}</Text>
          <Text style={styles.emptyMessage}>{t('feedback.empty.message')}</Text>
          <Button
            title={t('feedback.create.button')}
            onPress={handleCreateFeedback}
            style={styles.emptyButton}
          />
        </FadeInView>
      );
    }

    return (
      <View style={styles.feedbacksContainer}>
        <View style={styles.feedbacksHeader}>
          <Text style={styles.feedbacksTitle}>
            {t('feedback.list.title')} ({feedbacks.length})
          </Text>
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => {
              // 這裡可以打開排序選項
              Alert.alert(t('feedback.sort.title'), t('feedback.sort.message'));
            }}
          >
            <Ionicons name="swap-vertical" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.sortButtonText}>{t('feedback.sort.button')}</Text>
          </TouchableOpacity>
        </View>

        {feedbacks.map((feedback, index) => (
          <FadeInView
            key={feedback.id}
            delay={index * 100}
            style={styles.feedbackItem}
          >
            <FeedbackItem
              feedback={feedback}
              onPress={() => handleFeedbackPress(feedback.id)}
              onVote={(vote) => {
                // 這裡處理投票邏輯
                logger.info('用戶投票', { feedbackId: feedback.id, vote });
              }}
            />
          </FadeInView>
        ))}
      </View>
    );
  };

  const renderCreateButton = () => (
    <AnimatedView style={styles.createButtonContainer}>
      <Button
        title={t('feedback.create.button')}
        onPress={handleCreateFeedback}
        icon="add"
        style={styles.createButton}
        loading={isCreating}
      />
    </AnimatedView>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {renderHeader()}
        {renderTemplates()}
        {renderFeedbacks()}
      </ScrollView>

      {renderCreateButton()}

      <CreateFeedbackModal
        visible={showCreateModal}
        templateId={selectedTemplate}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleFeedbackCreated}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  scrollView: {
    flex: 1
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.sm
  },
  statsContainer: {
    marginTop: theme.spacing.md
  },
  filterContainer: {
    marginTop: theme.spacing.md
  },
  templatesSection: {
    padding: theme.spacing.lg
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md
  },
  templatesContainer: {
    paddingRight: theme.spacing.lg
  },
  templateCard: {
    width: 200,
    padding: theme.spacing.md,
    marginRight: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  templateName: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs
  },
  templateDescription: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl
  },
  emptyTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm
  },
  emptyMessage: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg
  },
  emptyButton: {
    minWidth: 200
  },
  feedbacksContainer: {
    padding: theme.spacing.lg
  },
  feedbacksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md
  },
  feedbacksTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm
  },
  sortButtonText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs
  },
  feedbackItem: {
    marginBottom: theme.spacing.md
  },
  createButtonContainer: {
    position: 'absolute',
    bottom: theme.spacing.lg,
    right: theme.spacing.lg,
    left: theme.spacing.lg
  },
  createButton: {
    borderRadius: theme.borderRadius.full
  }
});

export default FeedbackScreen;
