import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { isIOS, isAndroid, getPlatformStyles } from '../../utils/platformUtils';

interface PlatformInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'url';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  disabled?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  testID?: string;
}

const PlatformInput: React.FC<PlatformInputProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  disabled = false,
  style,
  inputStyle,
  testID,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const platformStyles = getPlatformStyles();

  // 獲取平台特定樣式
  const getContainerStyle = (): ViewStyle => {
    const baseStyle = platformStyles.input || {};

    const focusStyle = isFocused
      ? {
          borderColor: '#1C2B3A',
          borderWidth: isIOS() ? 2 : 1,
        }
      : {};

    const errorStyle = error
      ? {
          borderColor: '#FF3B30',
          borderWidth: isIOS() ? 2 : 1,
        }
      : {};

    const disabledStyle = disabled
      ? {
          opacity: 0.5,
          backgroundColor: '#F5F5F5',
        }
      : {};

    return {
      ...baseStyle,
      ...focusStyle,
      ...errorStyle,
      ...disabledStyle,
      ...style,
    };
  };

  const getInputStyle = (): TextStyle => {
    const baseInputStyle: TextStyle = {
      fontSize: 16,
      color: '#1C2B3A',
      paddingVertical: isIOS() ? 8 : 12,
      paddingHorizontal: isIOS() ? 12 : 8,
    };

    const multilineStyle = multiline
      ? {
          textAlignVertical: 'top',
          minHeight: numberOfLines * 20,
        }
      : {};

    return {
      ...baseInputStyle,
      ...multilineStyle,
      ...inputStyle,
    };
  };

  const getLabelStyle = (): TextStyle => {
    return {
      fontSize: 14,
      fontWeight: isIOS() ? '600' : '500',
      color: error ? '#FF3B30' : '#1C2B3A',
      marginBottom: 4,
    };
  };

  const getErrorStyle = (): TextStyle => {
    return {
      fontSize: 12,
      color: '#FF3B30',
      marginTop: 4,
    };
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={getLabelStyle()}>{label}</Text>}

      <TextInput
        style={getInputStyle()}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8E8E93"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        multiline={multiline}
        numberOfLines={numberOfLines}
        maxLength={maxLength}
        editable={!disabled}
        onFocus={handleFocus}
        onBlur={handleBlur}
        testID={testID}
      />

      {error && <Text style={getErrorStyle()}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
});

export default PlatformInput;
