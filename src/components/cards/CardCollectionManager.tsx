import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/designSystem';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Avatar } from '../common/Avatar';
import { Switch } from '../common/Switch';

interface CollectionCard {
  id: string;
  name: string;
  imageUrl: string;
  rarity: string;
  condition: number;
  quantity: number;
  estimatedValue: number;
  isForSale: boolean;
  isWishlist: boolean;
  lastUpdated: string;
}

interface CardCollectionManagerProps {
  cards: CollectionCard[];
  totalValue: number;
  totalCards: number;
  onCardPress: (card: CollectionCard) => void;
  onAddCard: () => void;
  onEditCard: (card: CollectionCard) => void;
  onDeleteCard: (cardId: string) => void;
  onToggleForSale: (cardId: string, isForSale: boolean) => void;
  onToggleWishlist: (cardId: string, isWishlist: boolean) => void;
  onExportCollection: () => void;
  onImportCollection: () => void;
}

export const CardCollectionManager: React.FC<CardCollectionManagerProps> = ({
  cards,
  totalValue,
  totalCards,
  onCardPress,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onToggleForSale,
  onToggleWishlist,
  onExportCollection,
  onImportCollection
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'condition' | 'date'>('name');
  const [showForSaleOnly, setShowForSaleOnly] = useState(false);
  const [showWishlistOnly, setShowWishlistOnly] = useState(false);

  const rarities = ['all', 'common', 'uncommon', 'rare', 'mythic', 'special', 'promo'];

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('zh-TW');
  };

  const getRarityColor = (rarity: string) => {
    const rarityColors = {
      common: theme.colors.rarity.common,
      uncommon: theme.colors.rarity.uncommon,
      rare: theme.colors.rarity.rare,
      mythic: theme.colors.rarity.mythic,
      special: theme.colors.rarity.special,
      promo: theme.colors.rarity.promo
    };
    return rarityColors[rarity as keyof typeof rarityColors] || theme.colors.text.tertiary;
  };

  const filteredCards = cards.filter(card => {
    if (filterRarity !== 'all' && card.rarity !== filterRarity) return false;
    if (showForSaleOnly && !card.isForSale) return false;
    if (showWishlistOnly && !card.isWishlist) return false;
    return true;
  });

  const sortedCards = [...filteredCards].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'value':
        return b.estimatedValue - a.estimatedValue;
      case 'condition':
        return b.condition - a.condition;
      case 'date':
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      default:
        return 0;
    }
  });

  const renderCardItem = ({ item }: { item: CollectionCard }) => (
    <TouchableOpacity
      style={[styles.cardItem, viewMode === 'grid' && styles.cardItemGrid]}
      onPress={() => onCardPress(item)}
    >
      <View style={styles.cardHeader}>
        <Avatar
          source={item.imageUrl}
          size="medium"
          variant="rounded"
        />
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={2}>
            {item.name}
          </Text>
          <Badge
            text={item.rarity}
            variant="default"
            size="small"
            style={{ backgroundColor: getRarityColor(item.rarity) }}
          />
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onEditCard(item)}
          >
            <Ionicons name="pencil" size={16} color={theme.colors.gold.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onDeleteCard(item.id)}
          >
            <Ionicons name="trash" size={16} color={theme.colors.status.error} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>數量:</Text>
          <Text style={styles.detailValue}>{item.quantity}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>狀況:</Text>
          <Text style={styles.detailValue}>{item.condition}/10</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>價值:</Text>
          <Text style={styles.detailValue}>{formatValue(item.estimatedValue)}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>出售</Text>
          <Switch
            value={item.isForSale}
            onValueChange={(value) => onToggleForSale(item.id, value)}
            size="small"
            variant="gold"
          />
        </View>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>願望清單</Text>
          <Switch
            value={item.isWishlist}
            onValueChange={(value) => onToggleWishlist(item.id, value)}
            size="small"
            variant="gold"
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* 統計信息 */}
      <Card style={styles.statsCard} variant="elevated">
        <View style={styles.statsHeader}>
          <Text style={styles.statsTitle}>收藏統計</Text>
          <View style={styles.statsActions}>
            <TouchableOpacity style={styles.statsAction} onPress={onExportCollection}>
              <Ionicons name="download" size={20} color={theme.colors.gold.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.statsAction} onPress={onImportCollection}>
              <Ionicons name="upload" size={20} color={theme.colors.gold.primary} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.statsContent}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalCards}</Text>
            <Text style={styles.statLabel}>總卡片數</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatValue(totalValue)}</Text>
            <Text style={styles.statLabel}>總價值</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {cards.filter(card => card.isForSale).length}
            </Text>
            <Text style={styles.statLabel}>出售中</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {cards.filter(card => card.isWishlist).length}
            </Text>
            <Text style={styles.statLabel}>願望清單</Text>
          </View>
        </View>
      </Card>

      {/* 控制面板 */}
      <Card style={styles.controlsCard} variant="default">
        <View style={styles.controlsRow}>
          <View style={styles.viewModeContainer}>
            <TouchableOpacity
              style={[styles.viewModeButton, viewMode === 'grid' && styles.activeViewModeButton]}
              onPress={() => setViewMode('grid')}
            >
              <Ionicons
                name="grid"
                size={20}
                color={viewMode === 'grid' ? theme.colors.background.primary : theme.colors.text.secondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewModeButton, viewMode === 'list' && styles.activeViewModeButton]}
              onPress={() => setViewMode('list')}
            >
              <Ionicons
                name="list"
                size={20}
                color={viewMode === 'list' ? theme.colors.background.primary : theme.colors.text.secondary}
              />
            </TouchableOpacity>
          </View>
          <Button
            title="新增卡片"
            onPress={onAddCard}
            variant="primary"
            size="small"
            leftIcon="add"
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filterRarity === 'all' && styles.activeFilterButton]}
            onPress={() => setFilterRarity('all')}
          >
            <Text style={[styles.filterText, filterRarity === 'all' && styles.activeFilterText]}>
              全部
            </Text>
          </TouchableOpacity>
          {rarities.slice(1).map((rarity) => (
            <TouchableOpacity
              key={rarity}
              style={[styles.filterButton, filterRarity === rarity && styles.activeFilterButton]}
              onPress={() => setFilterRarity(rarity)}
            >
              <Text style={[styles.filterText, filterRarity === rarity && styles.activeFilterText]}>
                {rarity}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>排序:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { key: 'name', label: '名稱' },
              { key: 'value', label: '價值' },
              { key: 'condition', label: '狀況' },
              { key: 'date', label: '日期' }
            ].map((sort) => (
              <TouchableOpacity
                key={sort.key}
                style={[styles.sortButton, sortBy === sort.key && styles.activeSortButton]}
                onPress={() => setSortBy(sort.key as any)}
              >
                <Text style={[styles.sortText, sortBy === sort.key && styles.activeSortText]}>
                  {sort.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.toggleContainer}>
          <View style={styles.toggleItem}>
            <Text style={styles.toggleLabel}>僅顯示出售</Text>
            <Switch
              value={showForSaleOnly}
              onValueChange={setShowForSaleOnly}
              size="small"
            />
          </View>
          <View style={styles.toggleItem}>
            <Text style={styles.toggleLabel}>僅顯示願望清單</Text>
            <Switch
              value={showWishlistOnly}
              onValueChange={setShowWishlistOnly}
              size="small"
            />
          </View>
        </View>
      </Card>

      {/* 卡片列表 */}
      <FlatList
        data={sortedCards}
        renderItem={renderCardItem}
        keyExtractor={(item) => item.id}
        key={viewMode}
        numColumns={viewMode === 'grid' ? 2 : 1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.cardsList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  statsCard: {
    marginBottom: theme.spacing.md
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md
  },
  statsTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary
  },
  statsActions: {
    flexDirection: 'row'
  },
  statsAction: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background.secondary
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  statItem: {
    alignItems: 'center',
    flex: 1
  },
  statValue: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.gold.primary
  },
  statLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs
  },
  controlsCard: {
    marginBottom: theme.spacing.md
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md
  },
  viewModeContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.xs
  },
  viewModeButton: {
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm
  },
  activeViewModeButton: {
    backgroundColor: theme.colors.gold.primary
  },
  filtersContainer: {
    marginBottom: theme.spacing.md
  },
  filterButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.secondary
  },
  activeFilterButton: {
    backgroundColor: theme.colors.gold.primary
  },
  filterText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary
  },
  activeFilterText: {
    color: theme.colors.background.primary,
    fontWeight: theme.typography.weights.bold
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md
  },
  sortLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginRight: theme.spacing.sm
  },
  sortButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.secondary
  },
  activeSortButton: {
    backgroundColor: theme.colors.gold.primary
  },
  sortText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary
  },
  activeSortText: {
    color: theme.colors.background.primary,
    fontWeight: theme.typography.weights.bold
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  toggleLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginRight: theme.spacing.sm
  },
  cardsList: {
    paddingBottom: theme.spacing.lg
  },
  cardItem: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    marginHorizontal: theme.spacing.xs,
    flex: 1
  },
  cardItemGrid: {
    maxWidth: '48%'
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm
  },
  cardInfo: {
    flex: 1,
    marginLeft: theme.spacing.sm
  },
  cardName: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs
  },
  cardActions: {
    flexDirection: 'row'
  },
  actionButton: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.xs
  },
  cardDetails: {
    marginBottom: theme.spacing.sm
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs
  },
  detailLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.tertiary
  },
  detailValue: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.weights.medium
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  switchContainer: {
    alignItems: 'center'
  },
  switchLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.xs
  }
});
