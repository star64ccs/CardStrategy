import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '@/config/theme';
import { logger } from '@/utils/logger';

interface ImagePickerButtonProps {
  onImageSelect: (imageUri: string) => void;
  disabled?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export const ImagePickerButton: React.FC<ImagePickerButtonProps> = ({
  onImageSelect,
  disabled = false,
  maxWidth = 1024,
  maxHeight = 1024,
  quality = 0.8
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          '需要相冊權限',
          '請在設置中允許應用訪問相冊來選擇圖片。',
          [
            { text: '取消', style: 'cancel' },
            { text: '設置', onPress: () => ImagePicker.openSettings() }
          ]
        );
        return false;
      }
    }
    return true;
  };

  const requestCameraPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          '需要相機權限',
          '請在設置中允許應用使用相機來拍照。',
          [
            { text: '取消', style: 'cancel' },
            { text: '設置', onPress: () => ImagePicker.openSettings() }
          ]
        );
        return false;
      }
    }
    return true;
  };

  const handleImagePicker = () => {
    if (disabled || isProcessing) return;

    Alert.alert(
      '選擇圖片',
      '請選擇圖片來源',
      [
        { text: '取消', style: 'cancel' },
        { text: '相冊', onPress: pickFromGallery },
        { text: '拍照', onPress: takePhoto }
      ]
    );
  };

  const pickFromGallery = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      setIsProcessing(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: quality,
        maxWidth: maxWidth,
        maxHeight: maxHeight
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        onImageSelect(imageUri);
        logger.info('圖片選擇成功:', imageUri);
      }

    } catch (error) {
      logger.error('選擇圖片失敗:', error);
      Alert.alert('錯誤', '選擇圖片失敗，請重試');
    } finally {
      setIsProcessing(false);
    }
  };

  const takePhoto = async () => {
    try {
      const hasPermission = await requestCameraPermissions();
      if (!hasPermission) return;

      setIsProcessing(true);

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: quality,
        maxWidth: maxWidth,
        maxHeight: maxHeight
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        onImageSelect(imageUri);
        logger.info('拍照成功:', imageUri);
      }

    } catch (error) {
      logger.error('拍照失敗:', error);
      Alert.alert('錯誤', '拍照失敗，請重試');
    } finally {
      setIsProcessing(false);
    }
  };

  const getButtonStyle = () => {
    if (disabled) {
      return [styles.button, styles.disabledButton];
    }
    return [styles.button, styles.normalButton];
  };

  const getIconColor = () => {
    if (disabled) {
      return theme.colors.textSecondary;
    }
    return theme.colors.primary;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={handleImagePicker}
      disabled={disabled || isProcessing}
      activeOpacity={0.7}
    >
      {isProcessing ? (
        <ActivityIndicator size="small" color={getIconColor()} />
      ) : (
        <MaterialIcons 
          name="add-photo-alternate" 
          size={20} 
          color={getIconColor()} 
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
  disabledButton: {
    backgroundColor: theme.colors.backgroundLight,
    borderWidth: 1,
    borderColor: theme.colors.border,
    opacity: 0.5
  }
});
