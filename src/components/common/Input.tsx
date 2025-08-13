import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  TextInputProps
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/config/theme';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string | undefined;
  helper?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  helperStyle?: TextStyle;
  variant?: 'outlined' | 'filled';
  size?: 'small' | 'medium' | 'large';
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helper,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  helperStyle,
  variant = 'outlined',
  size = 'medium',
  secureTextEntry,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const containerStyleCombined = [
    styles.container,
    styles[variant],
    styles[size],
    isFocused && styles.focused,
    error && styles.error,
    containerStyle
  ];

  const inputStyleCombined = [
    styles.input,
    styles[`${variant}Input`],
    styles[`${size}Input`],
    inputStyle
  ];

  const labelStyleCombined = [
    styles.label,
    styles[`${size}Label`],
    isFocused && styles.focusedLabel,
    error && styles.errorLabel,
    labelStyle
  ];

  const handlePasswordToggle = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const getRightIcon = () => {
    if (secureTextEntry) {
      return (
        <TouchableOpacity onPress={handlePasswordToggle} style={styles.iconButton}>
          <Ionicons
            name={isPasswordVisible ? 'eye-off' : 'eye'}
            size={20}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      );
    }

    if (rightIcon) {
      return (
        <TouchableOpacity onPress={onRightIconPress} style={styles.iconButton}>
          <Ionicons name={rightIcon} size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      );
    }

    return null;
  };

  return (
    <View style={containerStyleCombined}>
      {label && <Text style={labelStyleCombined}>{label}</Text>}
      <View style={styles.inputContainer}>
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={theme.colors.textSecondary}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          style={inputStyleCombined}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          placeholderTextColor={theme.colors.textSecondary}
          {...props}
        />
        {getRightIcon()}
      </View>
      {error && <Text style={[styles.errorText, errorStyle]}>{error}</Text>}
      {helper && !error && <Text style={[styles.helperText, helperStyle]}>{helper}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.medium
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative'
  },
  leftIcon: {
    marginRight: theme.spacing.small
  },
  iconButton: {
    padding: theme.spacing.xsmall
  },

  // Variants
  outlined: {
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.small
  },
  outlinedInput: {
    flex: 1,
    color: theme.colors.textPrimary
  },

  filled: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.small
  },
  filledInput: {
    flex: 1,
    color: theme.colors.textPrimary
  },

  // Sizes
  small: {
    padding: theme.spacing.xsmall
  },
  smallInput: {
    fontSize: 12,
    minHeight: 32
  },
  smallLabel: {
    fontSize: 12
  },

  medium: {
    padding: theme.spacing.small
  },
  mediumInput: {
    fontSize: 14,
    minHeight: 44
  },
  mediumLabel: {
    fontSize: 14
  },

  large: {
    padding: theme.spacing.medium
  },
  largeInput: {
    fontSize: 16,
    minHeight: 56
  },
  largeLabel: {
    fontSize: 16
  },

  // States
  focused: {
    borderColor: theme.colors.primary[500]
  },
  error: {
    borderColor: theme.colors.error
  },

  // Labels
  label: {
    marginBottom: theme.spacing.xsmall,
    color: theme.colors.textPrimary,
    fontWeight: '500'
  },
  focusedLabel: {
    color: theme.colors.primary[500]
  },
  errorLabel: {
    color: theme.colors.error
  },

  // Input
  input: {
    padding: 0,
    margin: 0
  },

  // Messages
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    marginTop: theme.spacing.xsmall
  },
  helperText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: theme.spacing.xsmall
  }
});
