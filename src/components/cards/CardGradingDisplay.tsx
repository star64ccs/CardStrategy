import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/designSystem';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';

interface GradingResult {
  agency: 'PSA' | 'BGS' | 'CGC';
  overallGrade: number;
  subGrades: {
    centering: number;
    corners: number;
    edges: number;
    surface: number;
  };
  confidence: number;
  estimatedValue: number;
}

interface CardGradingDisplayProps {
  cardName: string;
  cardImage: string;
  gradingResults: GradingResult[];
  onViewDetails?: () => void;
  onShare?: () => void;
}

export const CardGradingDisplay: React.FC<CardGradingDisplayProps> = ({
  cardName,
  cardImage,
  gradingResults,
  onViewDetails,
  onShare,
}) => {
  const getGradeColor = (grade: number) => {
    if (grade >= 9.5) return theme.colors.status.success;
    if (grade >= 8.0) return theme.colors.status.info;
    if (grade >= 6.0) return theme.colors.status.warning;
    return theme.colors.status.error;
  };

  const getGradeLabel = (grade: number) => {
    if (grade === 10) return 'GEM MT';
    if (grade === 9.5) return 'MINT';
    if (grade === 9.0) return 'MINT-';
    if (grade === 8.5) return 'NM-MT+';
    if (grade === 8.0) return 'NM-MT';
    if (grade === 7.5) return 'NM+';
    if (grade === 7.0) return 'NM';
    if (grade === 6.5) return 'EX-MT+';
    if (grade === 6.0) return 'EX-MT';
    return 'EX';
  };

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value}`;
  };

  const bestResult = gradingResults.reduce((best, current) =>
    current.overallGrade > best.overallGrade ? current : best
  );

  return (
    <Card style={styles.container} variant="elevated">
      {/* 卡片基本信息 */}
      <View style={styles.header}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={2}>
            {cardName}
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onViewDetails}
            >
              <Ionicons
                name="eye-outline"
                size={20}
                color={theme.colors.gold.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={onShare}>
              <Ionicons
                name="share-outline"
                size={20}
                color={theme.colors.gold.primary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 最佳鑑定結果 */}
      <View style={styles.bestResult}>
        <View style={styles.bestResultHeader}>
          <Text style={styles.bestResultTitle}>最佳鑑定結果</Text>
          <Badge text={bestResult.agency} variant="gold" size="small" />
        </View>

        <View style={styles.gradeDisplay}>
          <View style={styles.overallGrade}>
            <Text style={styles.gradeNumber}>{bestResult.overallGrade}</Text>
            <Text style={styles.gradeLabel}>
              {getGradeLabel(bestResult.overallGrade)}
            </Text>
          </View>

          <View style={styles.subGrades}>
            <View style={styles.subGradeItem}>
              <Text style={styles.subGradeLabel}>居中</Text>
              <Text
                style={[
                  styles.subGradeValue,
                  { color: getGradeColor(bestResult.subGrades.centering) },
                ]}
              >
                {bestResult.subGrades.centering}
              </Text>
            </View>
            <View style={styles.subGradeItem}>
              <Text style={styles.subGradeLabel}>邊角</Text>
              <Text
                style={[
                  styles.subGradeValue,
                  { color: getGradeColor(bestResult.subGrades.corners) },
                ]}
              >
                {bestResult.subGrades.corners}
              </Text>
            </View>
            <View style={styles.subGradeItem}>
              <Text style={styles.subGradeLabel}>邊緣</Text>
              <Text
                style={[
                  styles.subGradeValue,
                  { color: getGradeColor(bestResult.subGrades.edges) },
                ]}
              >
                {bestResult.subGrades.edges}
              </Text>
            </View>
            <View style={styles.subGradeItem}>
              <Text style={styles.subGradeLabel}>表面</Text>
              <Text
                style={[
                  styles.subGradeValue,
                  { color: getGradeColor(bestResult.subGrades.surface) },
                ]}
              >
                {bestResult.subGrades.surface}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.confidenceSection}>
          <Text style={styles.confidenceLabel}>鑑定信心度</Text>
          <ProgressBar
            progress={bestResult.confidence}
            variant="gold"
            size="small"
            showLabel
          />
        </View>

        <View style={styles.valueSection}>
          <Text style={styles.valueLabel}>預估價值</Text>
          <Text style={styles.valueAmount}>
            {formatValue(bestResult.estimatedValue)}
          </Text>
        </View>
      </View>

      {/* 所有鑑定機構結果 */}
      <View style={styles.allResults}>
        <Text style={styles.allResultsTitle}>所有鑑定結果</Text>
        {gradingResults.map((result, index) => (
          <View key={result.agency} style={styles.resultItem}>
            <View style={styles.resultHeader}>
              <Badge
                text={result.agency}
                variant={
                  result.agency === bestResult.agency ? 'gold' : 'default'
                }
                size="small"
              />
              <Text
                style={[
                  styles.resultGrade,
                  { color: getGradeColor(result.overallGrade) },
                ]}
              >
                {result.overallGrade}
              </Text>
            </View>
            <ProgressBar
              progress={result.confidence}
              variant={result.agency === bestResult.agency ? 'gold' : 'default'}
              size="small"
            />
          </View>
        ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  cardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardName: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    flex: 1,
    marginRight: theme.spacing.md,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background.secondary,
  },
  bestResult: {
    marginBottom: theme.spacing.lg,
  },
  bestResultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  bestResultTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
  },
  gradeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  overallGrade: {
    alignItems: 'center',
    marginRight: theme.spacing.lg,
  },
  gradeNumber: {
    fontSize: theme.typography.sizes['3xl'],
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.gold.primary,
  },
  gradeLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  subGrades: {
    flex: 1,
  },
  subGradeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  subGradeLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  subGradeValue: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
  },
  confidenceSection: {
    marginBottom: theme.spacing.md,
  },
  confidenceLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  valueSection: {
    alignItems: 'center',
  },
  valueLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  valueAmount: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.gold.primary,
  },
  allResults: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.primary,
    paddingTop: theme.spacing.md,
  },
  allResultsTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  resultItem: {
    marginBottom: theme.spacing.sm,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  resultGrade: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.bold,
  },
});
