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

import AccessibilityService from '../services/accessibilityService';
import type {
  AccessibilityConfig,
  AccessibilityProfile,
} from '../types/accessibility';

const AccessibilityExample: React.FC = () => {
  const [service] = useState(() => AccessibilityService.getInstance());
  const [config, setConfig] = useState<AccessibilityConfig>(
    service.getConfig()
  );
  const [currentProfile, setCurrentProfile] = useState<AccessibilityProfile>(
    service.getCurrentProfile()
  );
  const [availableProfiles, setAvailableProfiles] = useState<
    AccessibilityProfile[]
  >(service.getAvailableProfiles());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const _initializeService = async () => {
      setIsLoading(true);
      try {
        await service.initialize();
        setConfig(service.getConfig());
        setCurrentProfile(service.getCurrentProfile());
        setAvailableProfiles(service.getAvailableProfiles());
      } catch (error) {
        Alert.alert('Error', 'Initialize無障礙ServiceFailed');
      } finally {
        setIsLoading(false);
      }
    };

    initializeService();
  }, [service]);

  const _handleToggleFeature = async (feature: keyof AccessibilityConfig) => {
    try {
      await service.toggleFeature(feature);
      setConfig(service.getConfig());
    } catch (error) {
      Alert.alert('Error', '切換功能Failed');
    }
  };

  const _handleSwitchProfile = async (profileId: string) => {
    try {
      await service.switchProfile(profileId);
      setConfig(service.getConfig());
      setCurrentProfile(service.getCurrentProfile());
    } catch (error) {
      Alert.alert('Error', '切換Configure文件Failed');
    }
  };

  const _handleResetConfig = async () => {
    try {
      await service.resetConfig();
      setConfig(service.getConfig());
      setCurrentProfile(service.getCurrentProfile());
      Alert.alert('Success', '配置已重置');
    } catch (error) {
      Alert.alert('Error', '重置ConfigureFailed');
    }
  };

  const _handleSpeak = async () => {
    try {
      await service.speak('這是一個無障礙功能測試');
    } catch (error) {
      Alert.alert('Error', '語音播放Failed');
    }
  };

  const _handleVibrate = () => {
    service.vibrate([0, 500, 200, 500]);
  };

  const _handleHapticFeedback = () => {
    service.hapticFeedback('success');
  };

  const _renderFeatureToggle = (
    feature: keyof AccessibilityConfig,
    label: string
  ) => (
    <View style={styles.toggleContainer}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={config[feature] as boolean}
        onValueChange={() => handleToggleFeature(feature)}
        disabled={isLoading}
      />
    </View>
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
    profileButton: {
      padding: 12,
      marginVertical: 4,
      backgroundColor: '#007AFF',
      borderRadius: 6,
      alignItems: 'center',
    },
    profileButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '500',
    },
    activeProfileButton: {
      backgroundColor: '#34C759',
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
    resetButton: {
      backgroundColor: '#FF3B30',
    },
    infoText: {
      fontSize: 14,
      color: '#666',
      marginTop: 8,
    },
    loadingText: {
      fontSize: 14,
      color: '#666',
      fontStyle: 'italic',
      textAlign: 'center',
    },
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>載入中...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>無障礙功能示例</Text>

      {/* 當前ConfigureFile */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>當前配置文件</Text>
        <Text style={styles.infoText}>名稱: {currentProfile.name}</Text>
        <Text style={styles.infoText}>描述: {currentProfile.description}</Text>
      </View>

      {/* ConfigureFileSelect */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>配置文件</Text>
        {availableProfiles.map(profile => (
          <TouchableOpacity
            key={profile.id}
            style={[
              styles.profileButton,
              currentProfile.id === profile.id && styles.activeProfileButton,
            ]}
            onPress={() => handleSwitchProfile(profile.id)}
          >
            <Text style={styles.profileButtonText}>
              {profile.name} {currentProfile.id === profile.id ? '(當前)' : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 視覺輔助 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>視覺輔助</Text>
        {renderFeatureToggle('highContrast', '高對比度')}
        {renderFeatureToggle('largeText', '大字體')}
        {renderFeatureToggle('boldText', '粗體文字')}
        {renderFeatureToggle('reduceMotion', '減少動畫')}
        {renderFeatureToggle('reduceTransparency', '減少透明度')}
      </View>

      {/* 聽覺輔助 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>聽覺輔助</Text>
        {renderFeatureToggle('closedCaptions', '字幕')}
        {renderFeatureToggle('audioDescriptions', '音頻描述')}
        {renderFeatureToggle('monoAudio', '單聲道音頻')}
      </View>

      {/* 語音輔助 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>語音輔助</Text>
        {renderFeatureToggle('screenReader', '屏幕閱讀器')}
        {renderFeatureToggle('voiceOver', 'VoiceOver')}
        {renderFeatureToggle('talkBack', 'TalkBack')}
      </View>

      {/* 交互輔助 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>交互輔助</Text>
        {renderFeatureToggle('switchControl', '開關控制')}
        {renderFeatureToggle('assistiveTouch', '輔助觸控')}
        {renderFeatureToggle('guidedAccess', '引導式訪問')}
      </View>

      {/* 認知輔助 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>認知輔助</Text>
        {renderFeatureToggle('simplifiedInterface', '簡化界面')}
        {renderFeatureToggle('focusIndicators', '焦點指示器')}
        {renderFeatureToggle('errorPrevention', 'Error預防')}
      </View>

      {/* 運動輔助 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>運動輔助</Text>
        {renderFeatureToggle('touchAccommodations', '觸控調節')}
        {renderFeatureToggle('shakeToUndo', '搖晃撤銷')}
        <Text style={styles.infoText}>
          主頁點擊速度: {config.homeClickSpeed}
        </Text>
      </View>

      {/* 無障礙Tool */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>無障礙工具</Text>
        <TouchableOpacity style={styles.actionButton} onPress={handleSpeak}>
          <Text style={styles.actionButtonText}>語音播放測試</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleVibrate}>
          <Text style={styles.actionButtonText}>振動測試</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleHapticFeedback}
        >
          <Text style={styles.actionButtonText}>觸覺反饋測試</Text>
        </TouchableOpacity>
      </View>

      {/* ResetConfigure */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>配置管理</Text>
        <TouchableOpacity
          style={[styles.actionButton, styles.resetButton]}
          onPress={handleResetConfig}
        >
          <Text style={styles.actionButtonText}>重置配置</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default AccessibilityExample;
