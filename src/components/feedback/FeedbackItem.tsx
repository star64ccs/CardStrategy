import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { Card, Badge, AnimatedView } from '../common';
import { theme } from '../../config/theme';
import { UserFeedback } from '../../types/feedback';
import { formatDate } from '../../utils/formatters';

const { width } = Dimensions.get('window');

interface FeedbackItemProps {
  feedback: UserFeedback;
  onPress: () => void;
  onVote?: (vote: 1 | -1) => void;
  showVotes?: boolean;
  compact?: boolean;
}

export const FeedbackItem: React.FC<FeedbackItemProps> = ({
  feedback,
  onPress,
  onVote,
  showVotes = true,
  compact = false
}) => {
  const { t } = useTranslation();

  const handleVote = (vote: 1 | -1) => {
    if (onVote) {
      onVote(vote);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return theme.colors.warning;
      case 'in_review':
        return theme.colors.info;
      case 'in_progress':
        return theme.colors.primary;
      case 'resolved':
        return theme.colors.success;
      case 'closed':
        return theme.colors.textSecondary;
      case 'rejected':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return theme.colors.success;
      case 'medium':
        return theme.colors.warning;
      case 'high':
        return theme.colors.error;
      case 'critical':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bug_report':
        return 'bug-outline';
      case 'feature_request':
        return 'add-circle-outline';
      case 'improvement':
        return 'trending-up-outline';
      case 'general':
        return 'chatbubble-outline';
      case 'compliment':
        return 'heart-outline';
      case 'complaint':
        return 'warning-outline';
      default:
        return 'document-outline';
    }
  };

  const renderCompactView = () => (
    <TouchableOpacity onPress={onPress} style={styles.compactContainer}>
      <View style={styles.compactHeader}>
        <View style={styles.compactTitleRow}>
          <Ionicons
            name={getTypeIcon(feedback.type)}
            size={16}
            color={theme.colors.primary}
            style={styles.compactIcon}
          />
          <Text style={styles.compactTitle} numberOfLines={1}>
            {feedback.title}
          </Text>
        </View>
        <Badge
          label={t(`feedback.status.${feedback.status}`)}
          color={getStatusColor(feedback.status)}
          size="small"
        />
      </View>
      <View style={styles.compactFooter}>
        <Text style={styles.compactDate}>
          {formatDate(feedback.createdAt, 'MM/dd')}
        </Text>
        {showVotes && (
          <View style={styles.compactVotes}>
            <Ionicons name="thumbs-up" size={12} color={theme.colors.textSecondary} />
            <Text style={styles.compactVoteCount}>{feedback.votes}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderFullView = () => (
    <Card style={styles.card}>
      <TouchableOpacity onPress={onPress} style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Ionicons
              name={getTypeIcon(feedback.type)}
              size={20}
              color={theme.colors.primary}
              style={styles.icon}
            />
            <Text style={styles.title} numberOfLines={2}>
              {feedback.title}
            </Text>
          </View>
          <View style={styles.badges}>
            <Badge
              label={t(`feedback.type.${feedback.type}`)}
              variant="outline"
              size="small"
              style={styles.typeBadge}
            />
            <Badge
              label={t(`feedback.priority.${feedback.priority}`)}
              color={getPriorityColor(feedback.priority)}
              size="small"
              style={styles.priorityBadge}
            />
            <Badge
              label={t(`feedback.status.${feedback.status}`)}
              color={getStatusColor(feedback.status)}
              size="small"
            />
          </View>
        </View>

        <Text style={styles.description} numberOfLines={3}>
          {feedback.description}
        </Text>

        <View style={styles.metadata}>
          <View style={styles.metadataRow}>
            <View style={styles.metadataItem}>
              <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
              <Text style={styles.metadataText}>
                {formatDate(feedback.createdAt, 'yyyy/MM/dd HH:mm')}
              </Text>
            </View>
            <View style={styles.metadataItem}>
              <Ionicons name="folder-outline" size={14} color={theme.colors.textSecondary} />
              <Text style={styles.metadataText}>
                {t(`feedback.category.${feedback.category}`)}
              </Text>
            </View>
          </View>

          {feedback.tags && feedback.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {feedback.tags.slice(0, 3).map((tag, index) => (
                <Badge
                  key={index}
                  label={tag}
                  variant="outline"
                  size="small"
                  style={styles.tag}
                />
              ))}
              {feedback.tags.length > 3 && (
                <Text style={styles.moreTags}>+{feedback.tags.length - 3}</Text>
              )}
            </View>
          )}
        </View>

        {showVotes && (
          <View style={styles.footer}>
            <View style={styles.voteContainer}>
              <TouchableOpacity
                style={styles.voteButton}
                onPress={() => handleVote(1)}
              >
                <Ionicons name="thumbs-up-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.voteCount}>{feedback.votes}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.voteButton}
                onPress={() => handleVote(-1)}
              >
                <Ionicons name="thumbs-down-outline" size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {feedback.response && (
              <View style={styles.responseIndicator}>
                <Ionicons name="chatbubble" size={14} color={theme.colors.success} />
                <Text style={styles.responseText}>{t('feedback.has_response')}</Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    </Card>
  );

  return (
    <AnimatedView>
      {compact ? renderCompactView() : renderFullView()}
    </AnimatedView>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.sm
  },
  container: {
    padding: theme.spacing.md
  },
  header: {
    marginBottom: theme.spacing.sm
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm
  },
  icon: {
    marginRight: theme.spacing.sm,
    marginTop: 2
  },
  title: {
    flex: 1,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
    lineHeight: 20
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs
  },
  typeBadge: {
    marginRight: theme.spacing.xs
  },
  priorityBadge: {
    marginRight: theme.spacing.xs
  },
  description: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: theme.spacing.md
  },
  metadata: {
    marginBottom: theme.spacing.md
  },
  metadataRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.xs
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.lg
  },
  metadataText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  tag: {
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs
  },
  moreTags: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border
  },
  voteContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.xs,
    marginRight: theme.spacing.sm
  },
  voteCount: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs
  },
  responseIndicator: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  responseText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.success,
    marginLeft: theme.spacing.xs
  },
  // 緊湊模式樣式
  compactContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.xs
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs
  },
  compactTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: theme.spacing.sm
  },
  compactIcon: {
    marginRight: theme.spacing.xs
  },
  compactTitle: {
    flex: 1,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text
  },
  compactFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  compactDate: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary
  },
  compactVotes: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  compactVoteCount: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs
  }
});
