import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
  Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/config/theme';
import * as Speech from 'expo-speech';
import * as Permissions from 'expo-permissions';
import { logger } from '@/utils/logger';

interface VoiceInputButtonProps {
  onTranscript: (transcript: string) => void;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
  disabled?: boolean;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscript,
  isRecording,
  setIsRecording,
  disabled = false
}) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const pulseAnimation = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    checkPermissions();
  }, []);

  useEffect(() => {
    if (isRecording) {
      startPulseAnimation();
    } else {
      stopPulseAnimation();
    }
  }, [isRecording]);

  const checkPermissions = async () => {
    try {
      const { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
      setHasPermission(status === 'granted');
      
      if (status !== 'granted') {
        Alert.alert(
          '需要麥克風權限',
          '請在設置中允許應用使用麥克風來進行語音輸入。',
          [
            { text: '取消', style: 'cancel' },
            { text: '設置', onPress: () => Permissions.openSettings() }
          ]
        );
      }
    } catch (error) {
      logger.error('檢查麥克風權限失敗:', error);
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true
        })
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnimation.setValue(1);
  };

  const handleVoiceInput = async () => {
    if (disabled || isProcessing) return;

    if (!hasPermission) {
      await checkPermissions();
      return;
    }

    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = async () => {
    try {
      setIsRecording(true);
      setIsProcessing(true);

      // 模擬語音識別過程
      // 在實際應用中，這裡會使用真實的語音識別API
      await simulateVoiceRecognition();

    } catch (error) {
      logger.error('開始錄音失敗:', error);
      Alert.alert('錯誤', '無法開始錄音，請重試');
      setIsRecording(false);
      setIsProcessing(false);
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      setIsProcessing(true);

      // 模擬語音識別結果
      const transcript = await simulateVoiceRecognitionResult();
      
      if (transcript) {
        onTranscript(transcript);
      }

    } catch (error) {
      logger.error('停止錄音失敗:', error);
      Alert.alert('錯誤', '語音識別失敗，請重試');
    } finally {
      setIsProcessing(false);
    }
  };

  // 模擬語音識別過程
  const simulateVoiceRecognition = (): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 2000);
    });
  };

  // 模擬語音識別結果
  const simulateVoiceRecognitionResult = (): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const sampleTranscripts = [
          '請分析這張卡片的投資價值',
          '這張卡片的市場價格如何',
          '給我一些投資建議',
          '最近的市場趨勢怎麼樣',
          '這張卡片值得投資嗎'
        ];
        
        const randomTranscript = sampleTranscripts[
          Math.floor(Math.random() * sampleTranscripts.length)
        ];
        
        resolve(randomTranscript);
      }, 1000);
    });
  };

  const getButtonStyle = () => {
    if (isRecording) {
      return [styles.button, styles.recordingButton];
    }
    if (disabled) {
      return [styles.button, styles.disabledButton];
    }
    return [styles.button, styles.normalButton];
  };

  const getIconName = () => {
    if (isProcessing) {
      return 'hourglass-empty';
    }
    if (isRecording) {
      return 'mic';
    }
    return 'mic-none';
  };

  const getIconColor = () => {
    if (isRecording) {
      return theme.colors.error;
    }
    if (disabled) {
      return theme.colors.textSecondary;
    }
    return theme.colors.primary;
  };

  return (
    <Animated.View style={[
      styles.container,
      {
        transform: [{ scale: pulseAnimation }]
      }
    ]}>
      <TouchableOpacity
        style={getButtonStyle()}
        onPress={handleVoiceInput}
        disabled={disabled || isProcessing}
        activeOpacity={0.7}
      >
        {isProcessing ? (
          <ActivityIndicator size="small" color={getIconColor()} />
        ) : (
          <MaterialIcons 
            name={getIconName() as any} 
            size={20} 
            color={getIconColor()} 
          />
        )}
      </TouchableOpacity>
      
      {isRecording && (
        <View style={styles.recordingIndicator}>
          <View style={styles.recordingDot} />
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative'
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4
  },
  normalButton: {
    backgroundColor: theme.colors.backgroundLight,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  recordingButton: {
    backgroundColor: theme.colors.error + '20',
    borderWidth: 2,
    borderColor: theme.colors.error
  },
  disabledButton: {
    backgroundColor: theme.colors.backgroundLight,
    borderWidth: 1,
    borderColor: theme.colors.border,
    opacity: 0.5
  },
  recordingIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.error,
    justifyContent: 'center',
    alignItems: 'center'
  },
  recordingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff'
  }
});
