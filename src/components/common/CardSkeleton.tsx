import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '@/config/theme';
import { Skeleton, SkeletonImage, SkeletonText, SkeletonTitle } from './Skeleton';

export interface CardSkeletonProps {
  variant?: 'compact' | 'detailed' | 'grid';
  showImage?: boolean;
  showPrice?: boolean;
  showStats?: boolean;
  style?: any;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  variant = 'detailed',
  showImage = true,
  showPrice = true,
  showStats = true,
  style
}) => {
  const renderCompactSkeleton = () => (
    <View style={[styles.card, styles.compactCard, style]}>
      <View style={styles.compactContent}>
        <SkeletonImage width={60} height={80} />
        <View style={styles.compactInfo}>
          <SkeletonTitle width="80%" height={18} />
          <SkeletonText width="60%" height={14} />
          {showPrice && <SkeletonText width="40%" height={16} />}
        </View>
      </View>
    </View>
  );

  const renderDetailedSkeleton = () => (
    <View style={[styles.card, styles.detailedCard, style]}>
      {showImage && (
        <SkeletonImage height={200} style={styles.cardImage} />
      )}
      <View style={styles.cardContent}>
        <SkeletonTitle width="70%" height={20} />
        <SkeletonText width="50%" height={14} />
        <SkeletonText width="90%" height={14} />
        <SkeletonText width="80%" height={14} />

        {showPrice && (
          <View style={styles.priceSection}>
            <SkeletonText width="30%" height={16} />
            <SkeletonText width="20%" height={16} />
          </View>
        )}

        {showStats && (
          <View style={styles.statsSection}>
            <View style={styles.statItem}>
              <SkeletonText width="100%" height={12} />
              <SkeletonText width="60%" height={12} />
            </View>
            <View style={styles.statItem}>
              <SkeletonText width="100%" height={12} />
              <SkeletonText width="60%" height={12} />
            </View>
            <View style={styles.statItem}>
              <SkeletonText width="100%" height={12} />
              <SkeletonText width="60%" height={12} />
            </View>
          </View>
        )}
      </View>
    </View>
  );

  const renderGridSkeleton = () => (
    <View style={[styles.card, styles.gridCard, style]}>
      <SkeletonImage height={120} style={styles.gridImage} />
      <View style={styles.gridContent}>
        <SkeletonTitle width="90%" height={16} />
        <SkeletonText width="70%" height={12} />
        {showPrice && <SkeletonText width="50%" height={14} />}
      </View>
    </View>
  );

  switch (variant) {
    case 'compact':
      return renderCompactSkeleton();
    case 'grid':
      return renderGridSkeleton();
    case 'detailed':
    default:
      return renderDetailedSkeleton();
  }
};

// 卡片列表骨架屏
export const CardListSkeleton: React.FC<{
  count?: number;
  variant?: 'compact' | 'detailed' | 'grid';
  showImage?: boolean;
  showPrice?: boolean;
  showStats?: boolean;
}> = ({
  count = 6,
  variant = 'detailed',
  showImage = true,
  showPrice = true,
  showStats = true
}) => {
  return (
    <View style={styles.listContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton
          key={index}
          variant={variant}
          showImage={showImage}
          showPrice={showPrice}
          showStats={showStats}
          style={index < count - 1 ? styles.cardMargin : undefined}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    flex: 1
  },
  card: {
    backgroundColor: theme.colors.backgroundPaper,
    borderRadius: theme.borderRadius.medium,
    overflow: 'hidden'
  },
  cardMargin: {
    marginBottom: theme.spacing.medium
  },
  // 緊湊卡片樣式
  compactCard: {
    padding: theme.spacing.medium
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  compactInfo: {
    flex: 1,
    marginLeft: theme.spacing.medium
  },
  // 詳細卡片樣式
  detailedCard: {
    marginBottom: theme.spacing.medium
  },
  cardImage: {
    borderTopLeftRadius: theme.borderRadius.medium,
    borderTopRightRadius: theme.borderRadius.medium
  },
  cardContent: {
    padding: theme.spacing.large
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.medium
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.large
  },
  statItem: {
    alignItems: 'center',
    flex: 1
  },
  // 網格卡片樣式
  gridCard: {
    flex: 1,
    margin: theme.spacing.small
  },
  gridImage: {
    borderTopLeftRadius: theme.borderRadius.medium,
    borderTopRightRadius: theme.borderRadius.medium
  },
  gridContent: {
    padding: theme.spacing.medium
  }
});
