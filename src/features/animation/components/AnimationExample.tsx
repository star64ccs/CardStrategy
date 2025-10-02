import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';

import AnimationService from '../services/animationService';
import type { AnimationPreset, AnimationStats } from '../types/animation';

const AnimationExample: React.FC = () => {
  const [service] = useState(() => AnimationService.getInstance());
  const [presets, setPresets] = useState<AnimationPreset[]>(
    service.getPresets()
  );
  const [isReducedMotion, setIsReducedMotion] = useState(
    service.isReducedMotionEnabled()
  );
  const [performanceMode, setPerformanceMode] = useState<
    'high' | 'medium' | 'low'
  >('medium');
  const [stats, setStats] = useState<AnimationStats>(
    service.getAnimationStats()
  );
  const [activeAnimations, setActiveAnimations] = useState<string[]>([]);

  useEffect(() => {
    const _updateStats = () => {
      setStats(service.getAnimationStats());
    };

    const _interval = setInterval(updateStats, 1000);
    return () => clearInterval(interval);
  }, [service]);

  const _handlePlayPreset = async (preset: AnimationPreset) => {
    try {
      const _animationId = service.createAnimation(preset.config);
      setActiveAnimations(prev => [...prev, animationId]);

      await service.startAnimation(animationId);

      setActiveAnimations(prev => prev.filter(id => id !== animationId));
    } catch (error) {
      Alert.alert('Error', '播放動畫Failed');
    }
  };

  const _handleToggleReducedMotion = (enabled: boolean) => {
    service.enableReducedMotion(enabled);
    setIsReducedMotion(enabled);
  };

  const _handlePerformanceModeChange = (mode: 'high' | 'medium' | 'low') => {
    service.setPerformanceMode(mode);
    setPerformanceMode(mode);
  };

  const _handleClearStats = () => {
    service.clearAnimationStats();
    setStats(service.getAnimationStats());
  };

  const _renderPresetButton = (preset: AnimationPreset) => (
    <TouchableOpacity
      key={preset.id}
      style={styles.presetButton}
      onPress={() => handlePlayPreset(preset)}
    >
      <Text style={styles.presetButtonText}>{preset.name}</Text>
      <Text style={styles.presetDescription}>{preset.description}</Text>
    </TouchableOpacity>
  );

  const _styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: '#f5f5f5',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
    },
    section: {
      backgroundColor: 'white',
      padding: 16,
      marginBottom: 16,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 12,
    },
    toggleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: 8,
    },
    toggleLabel: {
      fontSize: 16,
      flex: 1,
    },
    presetButton: {
      padding: 12,
      marginVertical: 4,
      backgroundColor: '#007AFF',
      borderRadius: 6,
      alignItems: 'center',
    },
    presetButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '500',
    },
    presetDescription: {
      color: 'white',
      fontSize: 12,
      opacity: 0.8,
      marginTop: 4,
    },
    performanceButton: {
      padding: 8,
      marginHorizontal: 4,
      borderRadius: 4,
      alignItems: 'center',
      flex: 1,
    },
    performanceButtonText: {
      fontSize: 14,
      fontWeight: '500',
    },
    activePerformanceButton: {
      backgroundColor: '#34C759',
    },
    inactivePerformanceButton: {
      backgroundColor: '#E5E5EA',
    },
    statsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    statItem: {
      width: '48%',
      padding: 8,
      backgroundColor: '#F2F2F7',
      borderRadius: 4,
      marginBottom: 8,
    },
    statLabel: {
      fontSize: 12,
      color: '#666',
      marginBottom: 4,
    },
    statValue: {
      fontSize: 16,
      fontWeight: '600',
    },
    actionButton: {
      padding: 12,
      marginVertical: 4,
      backgroundColor: '#5856D6',
      borderRadius: 6,
      alignItems: 'center',
    },
    actionButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '500',
    },
    clearButton: {
      backgroundColor: '#FF3B30',
    },
    infoText: {
      fontSize: 14,
      color: '#666',
      marginTop: 8,
    },
  });

  const _getPerformanceButtonStyle = (mode: 'high' | 'medium' | 'low') => {
    return performanceMode === mode
      ? styles.activePerformanceButton
      : styles.inactivePerformanceButton;
  };

  const _getPerformanceButtonTextStyle = (mode: 'high' | 'medium' | 'low') => {
    return {
      ...styles.performanceButtonText,
      color: performanceMode === mode ? 'white' : '#666',
    };
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>動畫優化示例</Text>

      {/* 性能Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>性能設置</Text>

        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>減少動畫</Text>
          <Switch
            value={isReducedMotion}
            onValueChange={handleToggleReducedMotion}
          />
        </View>

        <Text style={styles.infoText}>性能模式:</Text>
        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          <TouchableOpacity
            style={[
              styles.performanceButton,
              getPerformanceButtonStyle('high'),
            ]}
            onPress={() => handlePerformanceModeChange('high')}
          >
            <Text style={getPerformanceButtonTextStyle('high')}>高</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.performanceButton,
              getPerformanceButtonStyle('medium'),
            ]}
            onPress={() => handlePerformanceModeChange('medium')}
          >
            <Text style={getPerformanceButtonTextStyle('medium')}>中</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.performanceButton, getPerformanceButtonStyle('low')]}
            onPress={() => handlePerformanceModeChange('low')}
          >
            <Text style={getPerformanceButtonTextStyle('low')}>低</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 進入動畫 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>進入動畫</Text>
        {presets
          .filter(preset => preset.category === 'entrance')
          .map(renderPresetButton)}
      </View>

      {/* Exit動畫 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>退出動畫</Text>
        {presets
          .filter(preset => preset.category === 'exit')
          .map(renderPresetButton)}
      </View>

      {/* 反饋動畫 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>反饋動畫</Text>
        {presets
          .filter(preset => preset.category === 'feedback')
          .map(renderPresetButton)}
      </View>

      {/* Load動畫 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>載入動畫</Text>
        {presets
          .filter(preset => preset.category === 'loading')
          .map(renderPresetButton)}
      </View>

      {/* 動畫Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>動畫統計</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>總動畫數</Text>
            <Text style={styles.statValue}>{stats.totalAnimations}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>活躍動畫</Text>
            <Text style={styles.statValue}>{stats.activeAnimations}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>平均持續時間</Text>
            <Text style={styles.statValue}>{stats.averageDuration}ms</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>性能分數</Text>
            <Text style={styles.statValue}>{stats.performanceScore}/100</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>掉幀數</Text>
            <Text style={styles.statValue}>{stats.frameDrops}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>內存使用</Text>
            <Text style={styles.statValue}>{stats.memoryUsage}MB</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.actionButton, styles.clearButton]}
          onPress={handleClearStats}
        >
          <Text style={styles.actionButtonText}>清除統計</Text>
        </TouchableOpacity>
      </View>

      {/* 當前Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>當前狀態</Text>
        <Text style={styles.infoText}>
          減少動畫: {isReducedMotion ? '啟用' : '禁用'}
        </Text>
        <Text style={styles.infoText}>性能模式: {performanceMode}</Text>
        <Text style={styles.infoText}>活躍動畫: {activeAnimations.length}</Text>
        <Text style={styles.infoText}>
          最後更新: {new Date(stats.lastUpdateTime).toLocaleTimeString()}
        </Text>
      </View>
    </ScrollView>
  );
};

export default AnimationExample;
