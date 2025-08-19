import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { theme } from '@/config/theme';
import { GradingAgencyData, GradingAgency } from '@/services/priceDataService';
import { formatPrice, formatNumber } from '@/utils/formatters';

interface GradingAgencyDisplayProps {
  data: GradingAgencyData[];
  selectedAgencies?: GradingAgency[];
  showPopulationChart?: boolean;
  showPriceChart?: boolean;
  showPremiumChart?: boolean;
}

export const GradingAgencyDisplay: React.FC<GradingAgencyDisplayProps> = ({
  data,
  selectedAgencies = [],
  showPopulationChart = true,
  showPriceChart = true,
  showPremiumChart = true
}) => {
  // 過濾選中的機構數據
  const filteredData = useMemo(() => {
    if (selectedAgencies.length === 0) return data;
    return data.filter(item => selectedAgencies.includes(item.agency));
  }, [data, selectedAgencies]);

  // 獲取機構顏色
  const getAgencyColor = (agency: GradingAgency): string => {
    const colors = {
      PSA: theme.colors.primary,
      BGS: theme.colors.secondary,
      CGC: theme.colors.success
    };
    return colors[agency] || theme.colors.gray;
  };

  // 準備人口分佈圖表數據
  const populationChartData = useMemo(() => {
    if (!filteredData.length) return null;

    const grades = ['10', '9.5', '9', '8.5', '8', '7.5', '7', '6.5', '6', '5.5', '5', '4.5', '4', '3.5', '3', '2.5', '2', '1.5', '1'];
    const datasets = filteredData.map(agencyData => {
      const data = grades.map(grade =>
        agencyData.distribution.gradeDistribution[grade] || 0
      );

      return {
        data,
        color: () => getAgencyColor(agencyData.agency),
        strokeWidth: 2
      };
    });

    return {
      labels: grades,
      datasets
    };
  }, [filteredData]);

  // 準備價格圖表數據
  const priceChartData = useMemo(() => {
    if (!filteredData.length) return null;

    const grades = ['10', '9', '8', '7', '6', '5', '4', '3', '2', '1'];
    const datasets = filteredData.map(agencyData => {
      const data = grades.map(grade =>
        agencyData.marketImpact.averagePriceByGrade[grade] || 0
      );

      return {
        data,
        color: () => getAgencyColor(agencyData.agency),
        strokeWidth: 2
      };
    });

    return {
      labels: grades,
      datasets
    };
  }, [filteredData]);

  // 準備溢價圖表數據
  const premiumChartData = useMemo(() => {
    if (!filteredData.length) return null;

    const grades = ['10', '9', '8', '7', '6', '5', '4', '3', '2', '1'];
    const datasets = filteredData.map(agencyData => {
      const data = grades.map(grade =>
        agencyData.marketImpact.premiumByGrade[grade] || 0
      );

      return {
        data,
        color: () => getAgencyColor(agencyData.agency),
        strokeWidth: 2
      };
    });

    return {
      labels: grades,
      datasets
    };
  }, [filteredData]);

  if (!filteredData || filteredData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>暫無鑑定機構數據</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 總覽統計 */}
      <View style={styles.overviewContainer}>
        <Text style={styles.sectionTitle}>鑑定機構總覽</Text>
        <View style={styles.overviewGrid}>
          {filteredData.map(agencyData => (
            <View key={agencyData.agency} style={styles.overviewCard}>
              <View style={styles.agencyHeader}>
                <View style={[
                  styles.agencyColor,
                  { backgroundColor: getAgencyColor(agencyData.agency) }
                ]} />
                <Text style={styles.agencyName}>{agencyData.agency}</Text>
              </View>
              <View style={styles.overviewStats}>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>總鑑定數量</Text>
                  <Text style={styles.statValue}>
                    {formatNumber(agencyData.distribution.totalGraded)}
                  </Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>最高等級</Text>
                  <Text style={styles.statValue}>
                    {Object.keys(agencyData.distribution.gradeDistribution)
                      .filter(grade => agencyData.distribution.gradeDistribution[grade] > 0)
                      .sort((a, b) => parseFloat(b) - parseFloat(a))[0] || 'N/A'}
                  </Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>最近更新</Text>
                  <Text style={styles.statValue}>
                    {new Date(agencyData.lastUpdated).toLocaleDateString('zh-TW')}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 人口分佈圖表 */}
      {showPopulationChart && populationChartData && (
        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>等級分佈</Text>
          <BarChart
            data={populationChartData}
            width={350}
            height={250}
            chartConfig={{
              backgroundColor: theme.colors.background,
              backgroundGradientFrom: theme.colors.background,
              backgroundGradientTo: theme.colors.background,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16
              }
            }}
            style={styles.chart}
            showValuesOnTopOfBars={false}
            fromZero={true}
          />
        </View>
      )}

      {/* 價格圖表 */}
      {showPriceChart && priceChartData && (
        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>平均價格 (按等級)</Text>
          <BarChart
            data={priceChartData}
            width={350}
            height={250}
            chartConfig={{
              backgroundColor: theme.colors.background,
              backgroundGradientFrom: theme.colors.background,
              backgroundGradientTo: theme.colors.background,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16
              }
            }}
            style={styles.chart}
            showValuesOnTopOfBars={false}
            fromZero={true}
          />
        </View>
      )}

      {/* 溢價圖表 */}
      {showPremiumChart && premiumChartData && (
        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>等級溢價</Text>
          <BarChart
            data={premiumChartData}
            width={350}
            height={250}
            chartConfig={{
              backgroundColor: theme.colors.background,
              backgroundGradientFrom: theme.colors.background,
              backgroundGradientTo: theme.colors.background,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16
              }
            }}
            style={styles.chart}
            showValuesOnTopOfBars={false}
            fromZero={true}
          />
        </View>
      )}

      {/* 詳細數據表格 */}
      <View style={styles.detailsContainer}>
        <Text style={styles.sectionTitle}>詳細分佈數據</Text>
        {filteredData.map(agencyData => (
          <View key={agencyData.agency} style={styles.agencyDetails}>
            <View style={styles.agencyHeader}>
              <View style={[
                styles.agencyColor,
                { backgroundColor: getAgencyColor(agencyData.agency) }
              ]} />
              <Text style={styles.agencyName}>{agencyData.agency}</Text>
            </View>

            <View style={styles.detailsTable}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderText}>等級</Text>
                <Text style={styles.tableHeaderText}>數量</Text>
                <Text style={styles.tableHeaderText}>百分比</Text>
                <Text style={styles.tableHeaderText}>平均價格</Text>
                <Text style={styles.tableHeaderText}>溢價</Text>
              </View>

              {Object.entries(agencyData.distribution.populationReport)
                .sort(([a], [b]) => parseFloat(b) - parseFloat(a))
                .map(([grade, report]) => (
                  <View key={grade} style={styles.tableRow}>
                    <Text style={styles.tableCell}>{grade}</Text>
                    <Text style={styles.tableCell}>{formatNumber(report.count)}</Text>
                    <Text style={styles.tableCell}>{report.percentage.toFixed(1)}%</Text>
                    <Text style={styles.tableCell}>
                      {formatPrice(agencyData.marketImpact.averagePriceByGrade[grade] || 0)}
                    </Text>
                    <Text style={styles.tableCell}>
                      {agencyData.marketImpact.premiumByGrade[grade]
                        ? `${agencyData.marketImpact.premiumByGrade[grade].toFixed(1)}%`
                        : 'N/A'
                      }
                    </Text>
                  </View>
                ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  noDataText: {
    textAlign: 'center',
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
    padding: theme.spacing.xl
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md
  },
  overviewContainer: {
    padding: theme.spacing.md
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  overviewCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    width: '48%',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  agencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm
  },
  agencyColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: theme.spacing.xs
  },
  agencyName: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary
  },
  overviewStats: {
    gap: theme.spacing.xs
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary
  },
  statValue: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md
  },
  chart: {
    borderRadius: theme.borderRadius.lg
  },
  detailsContainer: {
    padding: theme.spacing.md
  },
  agencyDetails: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  detailsTable: {
    marginTop: theme.spacing.sm
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.xs
  },
  tableHeaderText: {
    flex: 1,
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    textAlign: 'center'
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  tableCell: {
    flex: 1,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
    textAlign: 'center'
  }
});
