import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/designSystem';

interface TabItem {
  key: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon?: keyof typeof Ionicons.glyphMap;
}

interface BottomTabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabPress: (tabKey: string) => void;
}

const { width } = Dimensions.get('window');

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  tabs,
  activeTab,
  onTabPress
}) => {
  const renderTab = (tab: TabItem) => {
    const isActive = activeTab === tab.key;
    const iconName = isActive && tab.activeIcon ? tab.activeIcon : tab.icon;

    return (
      <TouchableOpacity
        key={tab.key}
        style={styles.tabItem}
        onPress={() => onTabPress(tab.key)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
          <Ionicons
            name={iconName}
            size={24}
            color={isActive ? theme.colors.gold.primary : theme.colors.text.tertiary}
          />
          {isActive && <View style={styles.activeIndicator} />}
        </View>
        <Text style={[styles.tabText, isActive && styles.activeTabText]}>
          {tab.title}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {tabs.map(renderTab)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.primary
  },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    paddingHorizontal: theme.spacing.sm
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xs
  },
  activeIconContainer: {
    backgroundColor: theme.colors.background.tertiary
  },
  activeIndicator: {
    position: 'absolute',
    top: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.gold.primary
  },
  tabText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.tertiary
  },
  activeTabText: {
    color: theme.colors.gold.primary,
    fontWeight: theme.typography.weights.semibold
  }
});
