import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/designSystem';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

interface PriceData {
  date: string;
  price: number;
  volume?: number;
}

interface CardPriceChartProps {
  cardName: string;
  priceData: PriceData[];
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  timeRange: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL';
  onTimeRangeChange: (
    range: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL'
  ) => void;
  onViewDetails?: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export const CardPriceChart: React.FC<CardPriceChartProps> = ({
  cardName,
  priceData,
  currentPrice,
  priceChange,
  priceChangePercent,
  timeRange,
  onTimeRangeChange,
  onViewDetails,
}) => {
  const [selectedPoint, setSelectedPoint] = useState<PriceData | null>(null);

  const timeRanges = [
    { key: '1D', label: '1日' },
    { key: '1W', label: '1週' },
    { key: '1M', label: '1月' },
    { key: '3M', label: '3月' },
    { key: '6M', label: '6月' },
    { key: '1Y', label: '1年' },
    { key: 'ALL', label: '全部' },
  ];

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(2)}M`;
    }
    if (price >= 1000) {
      return `$${(price / 1000).toFixed(1)}K`;
    }
    return `$${price.toFixed(2)}`;
  };

  const formatDate = (date: string) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('zh-TW', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getPriceChangeColor = () => {
    if (priceChange > 0) return theme.colors.status.success;
    if (priceChange < 0) return theme.colors.status.error;
    return theme.colors.text.secondary;
  };

  const getPriceChangeIcon = () => {
    if (priceChange > 0) return 'trending-up';
    if (priceChange < 0) return 'trending-down';
    return 'remove';
  };

  const chartData = {
    labels: priceData.map((item) => formatDate(item.date)),
    datasets: [
      {
        data: priceData.map((item) => item.price),
        color: (opacity = 1) => `rgba(255, 215, 0, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: theme.colors.background.tertiary,
    backgroundGradientFrom: theme.colors.background.tertiary,
    backgroundGradientTo: theme.colors.background.tertiary,
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(255, 215, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: theme.colors.gold.primary,
    },
  };

  return (
    <Card style={styles.container} variant="elevated">
      {/* 卡片標題和價格信息 */}
      <View style={styles.header}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={1}>
            {cardName}
          </Text>
          <View style={styles.priceInfo}>
            <Text style={styles.currentPrice}>{formatPrice(currentPrice)}</Text>
            <View style={styles.priceChange}>
              <Ionicons
                name={getPriceChangeIcon()}
                size={16}
                color={getPriceChangeColor()}
              />
              <Text
                style={[
                  styles.priceChangeText,
                  { color: getPriceChangeColor() },
                ]}
              >
                {priceChange > 0 ? '+' : ''}
                {formatPrice(priceChange)} ({priceChangePercent > 0 ? '+' : ''}
                {priceChangePercent.toFixed(2)}%)
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.detailsButton} onPress={onViewDetails}>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.gold.primary}
          />
        </TouchableOpacity>
      </View>

      {/* 時間範圍選擇器 */}
      <View style={styles.timeRangeContainer}>
        {timeRanges.map((range) => (
          <TouchableOpacity
            key={range.key}
            style={[
              styles.timeRangeButton,
              timeRange === range.key && styles.activeTimeRangeButton,
            ]}
            onPress={() => onTimeRangeChange(range.key as any)}
          >
            <Text
              style={[
                styles.timeRangeText,
                timeRange === range.key && styles.activeTimeRangeText,
              ]}
            >
              {range.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 價格圖表 */}
      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={screenWidth - 64}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withDots={false}
          withShadow={false}
          withInnerLines={false}
          withOuterLines={false}
          withVerticalLines={false}
          withHorizontalLines={true}
          horizontalLabelRotation={0}
          verticalLabelRotation={0}
          onDataPointClick={({ value, index }) => {
            setSelectedPoint(priceData[index]);
          }}
        />
      </View>

      {/* 選中點信息 */}
      {selectedPoint && (
        <View style={styles.selectedPointInfo}>
          <View style={styles.selectedPointHeader}>
            <Text style={styles.selectedPointDate}>
              {formatDate(selectedPoint.date)}
            </Text>
            <Badge
              text={formatPrice(selectedPoint.price)}
              variant="gold"
              size="small"
            />
          </View>
          {selectedPoint.volume && (
            <Text style={styles.volumeText}>
              成交量: {selectedPoint.volume.toLocaleString()}
            </Text>
          )}
        </View>
      )}

      {/* 統計信息 */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>最高價</Text>
          <Text style={styles.statValue}>
            {formatPrice(Math.max(...priceData.map((item) => item.price)))}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>最低價</Text>
          <Text style={styles.statValue}>
            {formatPrice(Math.min(...priceData.map((item) => item.price)))}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>平均價</Text>
          <Text style={styles.statValue}>
            {formatPrice(
              priceData.reduce((sum, item) => sum + item.price, 0) /
                priceData.length
            )}
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  currentPrice: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.gold.primary,
    marginRight: theme.spacing.sm,
  },
  priceChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceChangeText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    marginLeft: theme.spacing.xs,
  },
  detailsButton: {
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background.secondary,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.xs,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  activeTimeRangeButton: {
    backgroundColor: theme.colors.gold.primary,
  },
  timeRangeText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.weights.medium,
  },
  activeTimeRangeText: {
    color: theme.colors.background.primary,
    fontWeight: theme.typography.weights.bold,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  chart: {
    borderRadius: theme.borderRadius.lg,
  },
  selectedPointInfo: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  selectedPointHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  selectedPointDate: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  volumeText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.tertiary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.primary,
    paddingTop: theme.spacing.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.xs,
  },
  statValue: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
  },
});
