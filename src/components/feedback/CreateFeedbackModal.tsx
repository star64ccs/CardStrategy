import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import {
  Modal,
  Button,
  Input,
  Badge,
  Loading,
  Toast,
  AnimatedView,
  SlideUpView
} from '../common';
import { theme } from '../../config/theme';
import { logger } from '../../utils/logger';
import {
  createFeedback,
  selectFeedbackTemplates,
  selectFeedbackTags,
  selectFeedbackLoadingStates,
  selectFeedbackError,
  clearError
} from '../../store/slices/feedbackSlice';
import {
  CreateFeedbackRequest,
  FeedbackTemplate,
  FeedbackTag
} from '../../types/feedback';

interface CreateFeedbackModalProps {
  visible: boolean;
  templateId?: string | null;
  onClose: () => void;
  onSuccess: (feedbackId: string) => void;
}

export const CreateFeedbackModal: React.FC<CreateFeedbackModalProps> = ({
  visible,
  templateId,
  onClose,
  onSuccess
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // Redux 狀態
  const templates = useSelector(selectFeedbackTemplates);
  const tags = useSelector(selectFeedbackTags);
  const { isCreating } = useSelector(selectFeedbackLoadingStates);
  const error = useSelector(selectFeedbackError);

  // 本地狀態
  const [formData, setFormData] = useState<Partial<CreateFeedbackRequest>>({
    type: 'general',
    category: 'other',
    priority: 'medium',
    title: '',
    description: '',
    isAnonymous: false,
    tags: []
  });
  const [selectedTemplate, setSelectedTemplate] = useState<FeedbackTemplate | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);

  // 監聽錯誤
  useEffect(() => {
    if (error) {
      Toast.show({
        type: 'error',
        title: t('feedback.create.error.title'),
        message: error
      });
      dispatch(clearError());
    }
  }, [error, dispatch, t]);

  // 當模板 ID 改變時，自動填充表單
  useEffect(() => {
    if (templateId && templates.length > 0) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setSelectedTemplate(template);
        setFormData(prev => ({
          ...prev,
          type: template.type,
          category: template.category,
          title: template.title,
          description: template.description
        }));
      }
    }
  }, [templateId, templates]);

  const handleInputChange = (field: keyof CreateFeedbackRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...(prev.tags || []), tag]
    }));
  };

  const handleSubmit = async () => {
    // 驗證必填字段
    if (!formData.title?.trim()) {
      Alert.alert(t('feedback.create.validation.title'), t('feedback.create.validation.title_required'));
      return;
    }

    if (!formData.description?.trim()) {
      Alert.alert(t('feedback.create.validation.description'), t('feedback.create.validation.description_required'));
      return;
    }

    try {
      const feedbackData: CreateFeedbackRequest = {
        type: formData.type!,
        category: formData.category!,
        priority: formData.priority!,
        title: formData.title.trim(),
        description: formData.description.trim(),
        isAnonymous: formData.isAnonymous || false,
        tags: formData.tags || [],
        attachments
      };

      const result = await dispatch(createFeedback(feedbackData)).unwrap();
      onSuccess(result.id);

      // 重置表單
      setFormData({
        type: 'general',
        category: 'other',
        priority: 'medium',
        title: '',
        description: '',
        isAnonymous: false,
        tags: []
      });
      setSelectedTemplate(null);
      setShowAdvanced(false);
      setAttachments([]);

    } catch (error) {
      logger.error('創建反饋失敗', { error });
    }
  };

  const handleCancel = () => {
    Alert.alert(
      t('feedback.create.cancel.title'),
      t('feedback.create.cancel.message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          style: 'destructive',
          onPress: () => {
            setFormData({
              type: 'general',
              category: 'other',
              priority: 'medium',
              title: '',
              description: '',
              isAnonymous: false,
              tags: []
            });
            setSelectedTemplate(null);
            setShowAdvanced(false);
            setAttachments([]);
            onClose();
          }
        }
      ]
    );
  };

  const renderTypeSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t('feedback.create.type.title')}</Text>
      <View style={styles.typeGrid}>
        {[
          { type: 'bug_report', icon: 'bug-outline', label: t('feedback.type.bug_report') },
          { type: 'feature_request', icon: 'add-circle-outline', label: t('feedback.type.feature_request') },
          { type: 'improvement', icon: 'trending-up-outline', label: t('feedback.type.improvement') },
          { type: 'general', icon: 'chatbubble-outline', label: t('feedback.type.general') },
          { type: 'compliment', icon: 'heart-outline', label: t('feedback.type.compliment') },
          { type: 'complaint', icon: 'warning-outline', label: t('feedback.type.complaint') }
        ].map(({ type, icon, label }) => (
          <Button
            key={type}
            title={label}
            icon={icon}
            variant={formData.type === type ? 'primary' : 'outline'}
            size="small"
            onPress={() => handleInputChange('type', type)}
            style={styles.typeButton}
          />
        ))}
      </View>
    </View>
  );

  const renderCategorySelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t('feedback.create.category.title')}</Text>
      <View style={styles.categoryGrid}>
        {[
          { category: 'ui_ux', label: t('feedback.category.ui_ux') },
          { category: 'performance', label: t('feedback.category.performance') },
          { category: 'functionality', label: t('feedback.category.functionality') },
          { category: 'ai_features', label: t('feedback.category.ai_features') },
          { category: 'scanning', label: t('feedback.category.scanning') },
          { category: 'pricing', label: t('feedback.category.pricing') },
          { category: 'notifications', label: t('feedback.category.notifications') },
          { category: 'data_accuracy', label: t('feedback.category.data_accuracy') },
          { category: 'security', label: t('feedback.category.security') },
          { category: 'other', label: t('feedback.category.other') }
        ].map(({ category, label }) => (
          <Button
            key={category}
            title={label}
            variant={formData.category === category ? 'primary' : 'outline'}
            size="small"
            onPress={() => handleInputChange('category', category)}
            style={styles.categoryButton}
          />
        ))}
      </View>
    </View>
  );

  const renderPrioritySelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t('feedback.create.priority.title')}</Text>
      <View style={styles.priorityRow}>
        {[
          { priority: 'low', label: t('feedback.priority.low'), color: theme.colors.success },
          { priority: 'medium', label: t('feedback.priority.medium'), color: theme.colors.warning },
          { priority: 'high', label: t('feedback.priority.high'), color: theme.colors.error },
          { priority: 'critical', label: t('feedback.priority.critical'), color: theme.colors.error }
        ].map(({ priority, label, color }) => (
          <Button
            key={priority}
            title={label}
            variant={formData.priority === priority ? 'primary' : 'outline'}
            size="small"
            onPress={() => handleInputChange('priority', priority)}
            style={[styles.priorityButton, { borderColor: color }]}
          />
        ))}
      </View>
    </View>
  );

  const renderTagsSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t('feedback.create.tags.title')}</Text>
      <View style={styles.tagsContainer}>
        {tags.map((tag) => (
          <TouchableOpacity
            key={tag.id}
            style={[
              styles.tagButton,
              formData.tags?.includes(tag.name) && styles.tagButtonSelected
            ]}
            onPress={() => handleTagToggle(tag.name)}
          >
            <Text style={[
              styles.tagButtonText,
              formData.tags?.includes(tag.name) && styles.tagButtonTextSelected
            ]}>
              {tag.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderAdvancedOptions = () => (
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.advancedHeader}
        onPress={() => setShowAdvanced(!showAdvanced)}
      >
        <Text style={styles.advancedTitle}>{t('feedback.create.advanced.title')}</Text>
        <Ionicons
          name={showAdvanced ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={theme.colors.textSecondary}
        />
      </TouchableOpacity>

      {showAdvanced && (
        <SlideUpView style={styles.advancedContent}>
          <View style={styles.anonymousOption}>
            <Text style={styles.anonymousLabel}>{t('feedback.create.anonymous.label')}</Text>
            <Button
              title={formData.isAnonymous ? t('common.yes') : t('common.no')}
              variant={formData.isAnonymous ? 'primary' : 'outline'}
              size="small"
              onPress={() => handleInputChange('isAnonymous', !formData.isAnonymous)}
            />
          </View>
        </SlideUpView>
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      onClose={handleCancel}
      title={t('feedback.create.title')}
      size="large"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {selectedTemplate && (
            <AnimatedView style={styles.templateInfo}>
              <View style={styles.templateHeader}>
                <Ionicons name="document-text" size={20} color={theme.colors.primary} />
                <Text style={styles.templateTitle}>{t('feedback.create.template.selected')}</Text>
              </View>
              <Text style={styles.templateName}>{selectedTemplate.name}</Text>
              <Text style={styles.templateDescription}>{selectedTemplate.description}</Text>
            </AnimatedView>
          )}

          {renderTypeSelector()}
          {renderCategorySelector()}
          {renderPrioritySelector()}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('feedback.create.title.label')} *</Text>
            <Input
              value={formData.title}
              onChangeText={(text) => handleInputChange('title', text)}
              placeholder={t('feedback.create.title.placeholder')}
              maxLength={100}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('feedback.create.description.label')} *</Text>
            <Input
              value={formData.description}
              onChangeText={(text) => handleInputChange('description', text)}
              placeholder={t('feedback.create.description.placeholder')}
              multiline
              numberOfLines={6}
              maxLength={1000}
            />
          </View>

          {renderTagsSelector()}
          {renderAdvancedOptions()}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title={t('common.cancel')}
            variant="outline"
            onPress={handleCancel}
            style={styles.footerButton}
          />
          <Button
            title={t('feedback.create.submit')}
            onPress={handleSubmit}
            loading={isCreating}
            disabled={isCreating || !formData.title?.trim() || !formData.description?.trim()}
            style={styles.footerButton}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollView: {
    flex: 1,
    padding: theme.spacing.lg
  },
  templateInfo: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    marginBottom: theme.spacing.lg
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs
  },
  templateTitle: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.primary,
    marginLeft: theme.spacing.xs
  },
  templateName: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs
  },
  templateDescription: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary
  },
  section: {
    marginBottom: theme.spacing.lg
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm
  },
  typeButton: {
    flex: 1,
    minWidth: '45%'
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm
  },
  categoryButton: {
    flex: 1,
    minWidth: '45%'
  },
  priorityRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm
  },
  priorityButton: {
    flex: 1
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs
  },
  tagButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface
  },
  tagButtonSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary
  },
  tagButtonText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text
  },
  tagButtonTextSelected: {
    color: theme.colors.white
  },
  advancedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm
  },
  advancedTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text
  },
  advancedContent: {
    marginTop: theme.spacing.sm
  },
  anonymousOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm
  },
  anonymousLabel: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text
  },
  footer: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.md
  },
  footerButton: {
    flex: 1
  }
});
