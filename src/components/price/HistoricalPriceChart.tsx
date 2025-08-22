import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { theme } from '@/config/theme';
import {
  HistoricalPriceData,
  PricePlatform,
} from '@/services/priceDataService';
import { formatPrice, formatDate } from '@/utils/formatters';

interface HistoricalPriceChartProps {
  data: HistoricalPriceData[];
  selectedPlatforms?: PricePlatform[];
  timeRange?: { start: string; end: string };
  height?: number;
  showLegend?: boolean;
  showStatistics?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

export const HistoricalPriceChart: React.FC<HistoricalPriceChartProps> = ({
  data,
  selectedPlatforms = [],
  timeRange,
  height = 300,
  showLegend = true,
  showStatistics = true,
}) => {
  // 處理圖表數據
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    // 按日期分組所有平台的價格數據
    const dateMap = new Map<string, { [platform: string]: number }>();

    data.forEach((platformData) => {
      if (
        selectedPlatforms.length > 0 &&
        !selectedPlatforms.includes(platformData.platform)
      ) {
        return;
      }

      platformData.priceHistory.forEach((pricePoint) => {
        const date = new Date(pricePoint.date).toLocaleDateString('zh-TW', {
          month: 'short',
          day: 'numeric',
        });

        if (!dateMap.has(date)) {
          dateMap.set(date, {});
        }
        dateMap.get(date)![platformData.platform] = pricePoint.price;
      });
    });

    // 轉換為圖表格式
    const labels = Array.from(dateMap.keys()).slice(-10); // 只顯示最近10個數據點
    const datasets = data
      .filter(
        (platformData) =>
          selectedPlatforms.length === 0 ||
          selectedPlatforms.includes(platformData.platform)
      )
      .map((platformData, index) => {
        const color = getPlatformColor(platformData.platform);
        const data = labels.map((date) => {
          const platformData = dateMap.get(date);
          return platformData?.[platformData.platform] || 0;
        });

        return {
          data,
          color: () => color,
          strokeWidth: 2,
          legend: platformData.platform,
        };
      });

    return { labels, datasets };
  }, [data, selectedPlatforms]);

  // 獲取平台顏色
  const getPlatformColor = (platform: PricePlatform): string => {
    const colors = {
      EBAY: theme.colors.primary,
      TCGPLAYER: theme.colors.secondary,
      CARDMARKET: theme.colors.success,
      PRICE_CHARTING: theme.colors.warning,
      MERCARI: theme.colors.info,
      SNKR: theme.colors.error,
      PSA: theme.colors.primary,
      BGS: theme.colors.secondary,
      CGC: theme.colors.success,
    };
    return colors[platform] || theme.colors.gray;
  };

  // 計算統計數據
  const statistics = useMemo(() => {
    if (!data || data.length === 0) return null;

    const allPrices = data.flatMap((platformData) =>
      platformData.priceHistory.map((point) => point.price)
    );

    const average =
      allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length;
    const min = Math.min(...allPrices);
    const max = Math.max(...allPrices);
    const change = data[0]?.trends?.changePercentage || 0;

    return { average, min, max, change };
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.noDataText}>暫無價格數據</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 圖表標題 */}
      <View style={styles.header}>
        <Text style={styles.title}>歷史價格趨勢</Text>
        {timeRange && (
          <Text style={styles.subtitle}>
            {formatDate(timeRange.start)} - {formatDate(timeRange.end)}
          </Text>
        )}
      </View>

      {/* 價格圖表 */}
      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={screenWidth - 40}
          height={height}
          chartConfig={{
            backgroundColor: theme.colors.background,
            backgroundGradientFrom: theme.colors.background,
            backgroundGradientTo: theme.colors.background,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '4',
              strokeWidth: '2',
              stroke: theme.colors.primary,
            },
          }}
          bezier
          style={styles.chart}
          withDots={false}
          withShadow={false}
          withInnerLines={true}
          withOuterLines={true}
          withVerticalLines={false}
          withHorizontalLines={true}
          withVerticalLabels={true}
          withHorizontalLabels={true}
          fromZero={false}
        />
      </View>

      {/* 統計數據 */}
      {showStatistics && statistics && (
        <View style={styles.statisticsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>平均價格</Text>
            <Text style={styles.statValue}>
              {formatPrice(statistics.average)}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>最低價格</Text>
            <Text style={styles.statValue}>{formatPrice(statistics.min)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>最高價格</Text>
            <Text style={styles.statValue}>{formatPrice(statistics.max)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>變化率</Text>
            <Text
              style={[
                styles.statValue,
                {
                  color:
                    statistics.change >= 0
                      ? theme.colors.success
                      : theme.colors.error,
                },
              ]}
            >
              {statistics.change >= 0 ? '+' : ''}
              {statistics.change.toFixed(2)}%
            </Text>
          </View>
        </View>
      )}

      {/* 圖例 */}
      {showLegend && (
        <View style={styles.legendContainer}>
          {data
            .filter(
              (platformData) =>
                selectedPlatforms.length === 0 ||
                selectedPlatforms.includes(platformData.platform)
            )
            .map((platformData, index) => (
              <View key={platformData.platform} style={styles.legendItem}>
                <View
                  style={[
                    styles.legendColor,
                    {
                      backgroundColor: getPlatformColor(platformData.platform),
                    },
                  ]}
                />
                <Text style={styles.legendText}>{platformData.platform}</Text>
                <Text style={styles.legendPrice}>
                  {formatPrice(platformData.statistics.averagePrice)}
                </Text>
              </View>
            ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  chart: {
    borderRadius: theme.borderRadius.lg,
  },
  noDataText: {
    textAlign: 'center',
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
  },
  statisticsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  statValue: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    minWidth: '45%',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: theme.spacing.xs,
  },
  legendText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.primary,
    marginRight: theme.spacing.xs,
  },
  legendPrice: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.weights.semibold,
  },
});
