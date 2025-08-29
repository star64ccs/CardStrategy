import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import type { MarketPrice } from '../types/pricing';
import { PriceTrend } from '../types/pricing';

interface PriceDisplayProps {
  price: MarketPrice | null;
  loading?: boolean;
  onRefresh?: () => void;
  showDetails?: boolean;
  onPress?: () => void;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  loading = false,
  onRefresh,
  showDetails = true,
  onPress,
}) => {
  const _getTrendIcon = (trend: PriceTrend) => {
    switch (trend) {
      case PriceTrend.RISING:
        return 'trending-up';
      case PriceTrend.FALLING:
        return 'trending-down';
      case PriceTrend.STABLE:
        return 'remove';
      case PriceTrend.VOLATILE:
        return 'pulse';
      default:
        return 'help-circle-outline';
    }
  };

  const _getTrendColor = (trend: PriceTrend) => {
    switch (trend) {
      case PriceTrend.RISING:
        return '#4CAF50';
      case PriceTrend.FALLING:
        return '#F44336';
      case PriceTrend.STABLE:
        return '#9E9E9E';
      case PriceTrend.VOLATILE:
        return '#FF9800';
      default:
        return '#9E9E9E';
    }
  };

  const _formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price);
  };

  const _formatPercentage = (percent: number) => {
    const _sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size='large' color='#007AFF' />
        <Text style={styles.loadingText}>載入價格數據中...</Text>
      </View>
    );
  }

  if (!price) {
    return (
      <View style={styles.container}>
        <Ionicons name='alert-circle-outline' size={48} color='#9E9E9E' />
        <Text style={styles.noDataText}>無價格數據</Text>
        {onRefresh && (
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Ionicons name='refresh' size={20} color='#007AFF' />
            <Text style={styles.refreshText}>重新載入</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const _Container = onPress ? TouchableOpacity : View;

  return (
    <Container style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>當前價格</Text>
          <Text style={styles.priceValue}>
            {formatPrice(price.currentPrice, price.currency)}
          </Text>
        </View>

        <View style={styles.trendSection}>
          <Ionicons
            name={getTrendIcon(price.trend) as any}
            size={24}
            color={getTrendColor(price.trend)}
          />
          <Text
            style={[styles.trendText, { color: getTrendColor(price.trend) }]}
          >
            {price.trend === PriceTrend.RISING && '上漲'}
            {price.trend === PriceTrend.FALLING && '下跌'}
            {price.trend === PriceTrend.STABLE && '穩定'}
            {price.trend === PriceTrend.VOLATILE && '波動'}
          </Text>
        </View>
      </View>

      <View style={styles.changeSection}>
        <View style={styles.changeItem}>
          <Text style={styles.changeLabel}>價格變化</Text>
          <Text
            style={[
              styles.changeValue,
              { color: price.priceChange >= 0 ? '#4CAF50' : '#F44336' },
            ]}
          >
            {formatPrice(price.priceChange, price.currency)}
          </Text>
        </View>

        <View style={styles.changeItem}>
          <Text style={styles.changeLabel}>變化百分比</Text>
          <Text
            style={[
              styles.changeValue,
              { color: price.priceChangePercent >= 0 ? '#4CAF50' : '#F44336' },
            ]}
          >
            {formatPercentage(price.priceChangePercent)}
          </Text>
        </View>
      </View>

      {showDetails && (
        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>24小時成交量</Text>
            <Text style={styles.detailValue}>
              {price.volume24h.toLocaleString()}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>信心指數</Text>
            <Text style={styles.detailValue}>
              {(price.confidence * 100).toFixed(1)}%
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>市場狀態</Text>
            <Text style={styles.detailValue}>
              {price.marketStatus === 'active' && '活躍'}
              {price.marketStatus === 'inactive' && '非活躍'}
              {price.marketStatus === 'suspended' && '暫停'}
              {price.marketStatus === 'maintenance' && '維護中'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>最後更新</Text>
            <Text style={styles.detailValue}>
              {new Date(price.lastUpdated).toLocaleString('zh-TW')}
            </Text>
          </View>
        </View>
      )}

      {onRefresh && (
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Ionicons name='refresh' size={16} color='#007AFF' />
          <Text style={styles.refreshText}>更新</Text>
        </TouchableOpacity>
      )}
    </Container>
  );
};

const _styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  priceSection: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
  },
  trendSection: {
    alignItems: 'center',
    marginLeft: 16,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  changeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  changeItem: {
    flex: 1,
    alignItems: 'center',
  },
  changeLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  changeValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailsSection: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666666',
  },
  detailValue: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 8,
  },
  refreshText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 4,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 12,
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 12,
    textAlign: 'center',
  },
});
