import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/config/theme';

interface EmotionIndicatorProps {
  emotion: string;
  confidence?: number;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
}

interface EmotionConfig {
  icon: string;
  color: string;
  label: string;
  description: string;
}

const EMOTION_CONFIGS: Record<string, EmotionConfig> = {
  happy: {
    icon: 'sentiment-satisfied',
    color: '#4CAF50',
    label: '開心',
    description: '正面情緒',
  },
  sad: {
    icon: 'sentiment-dissatisfied',
    color: '#2196F3',
    label: '難過',
    description: '負面情緒',
  },
  angry: {
    icon: 'sentiment-very-dissatisfied',
    color: '#F44336',
    label: '生氣',
    description: '憤怒情緒',
  },
  surprised: {
    icon: 'sentiment-satisfied-alt',
    color: '#FF9800',
    label: '驚訝',
    description: '驚訝情緒',
  },
  neutral: {
    icon: 'sentiment-neutral',
    color: '#9E9E9E',
    label: '中性',
    description: '中性情緒',
  },
  excited: {
    icon: 'sentiment-very-satisfied',
    color: '#E91E63',
    label: '興奮',
    description: '興奮情緒',
  },
  worried: {
    icon: 'sentiment-dissatisfied-alt',
    color: '#607D8B',
    label: '擔心',
    description: '擔憂情緒',
  },
  confident: {
    icon: 'sentiment-satisfied-alt',
    color: '#8BC34A',
    label: '自信',
    description: '自信情緒',
  },
  confused: {
    icon: 'sentiment-neutral',
    color: '#795548',
    label: '困惑',
    description: '困惑情緒',
  },
  grateful: {
    icon: 'sentiment-very-satisfied',
    color: '#4CAF50',
    label: '感激',
    description: '感激情緒',
  },
};

export const EmotionIndicator: React.FC<EmotionIndicatorProps> = ({
  emotion,
  confidence,
  showLabel = false,
  size = 'small',
}) => {
  const emotionConfig =
    EMOTION_CONFIGS[emotion.toLowerCase()] || EMOTION_CONFIGS.neutral;

  const getSizeConfig = () => {
    switch (size) {
      case 'large':
        return {
          containerSize: 32,
          iconSize: 24,
          fontSize: 12,
        };
      case 'medium':
        return {
          containerSize: 24,
          iconSize: 18,
          fontSize: 10,
        };
      case 'small':
      default:
        return {
          containerSize: 20,
          iconSize: 14,
          fontSize: 8,
        };
    }
  };

  const sizeConfig = getSizeConfig();

  const getConfidenceColor = () => {
    if (!confidence) return emotionConfig.color;

    if (confidence >= 0.8) return '#4CAF50';
    if (confidence >= 0.6) return '#FF9800';
    return '#F44336';
  };

  const getConfidenceLabel = () => {
    if (!confidence) return '';

    if (confidence >= 0.8) return '高';
    if (confidence >= 0.6) return '中';
    return '低';
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.emotionButton,
          {
            width: sizeConfig.containerSize,
            height: sizeConfig.containerSize,
            borderRadius: sizeConfig.containerSize / 2,
            backgroundColor: emotionConfig.color + '20',
            borderColor: emotionConfig.color,
          },
        ]}
        activeOpacity={0.7}
      >
        <MaterialIcons
          name={emotionConfig.icon as any}
          size={sizeConfig.iconSize}
          color={emotionConfig.color}
        />
      </TouchableOpacity>

      {showLabel && (
        <View style={styles.labelContainer}>
          <Text
            style={[styles.emotionLabel, { fontSize: sizeConfig.fontSize }]}
          >
            {emotionConfig.label}
          </Text>

          {confidence && (
            <View style={styles.confidenceContainer}>
              <View
                style={[
                  styles.confidenceDot,
                  { backgroundColor: getConfidenceColor() },
                ]}
              />
              <Text
                style={[
                  styles.confidenceText,
                  { fontSize: sizeConfig.fontSize - 1 },
                ]}
              >
                {getConfidenceLabel()}
              </Text>
            </View>
          )}
        </View>
      )}

      {confidence && !showLabel && (
        <View
          style={[
            styles.confidenceIndicator,
            {
              width: sizeConfig.containerSize / 3,
              height: sizeConfig.containerSize / 3,
              borderRadius: sizeConfig.containerSize / 6,
              backgroundColor: getConfidenceColor(),
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  emotionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  labelContainer: {
    marginLeft: 6,
  },
  emotionLabel: {
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  confidenceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  confidenceText: {
    color: theme.colors.textSecondary,
    fontSize: 8,
  },
  confidenceIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
  },
});
