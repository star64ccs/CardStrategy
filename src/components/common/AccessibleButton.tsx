import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { getAccessibilityRole } from '../../utils/accessibility';

interface AccessibleButtonProps {
  title: string;
  onPress: () => void;
  accessibilityHint?: string;
  accessibilityState?: any;
  style?: any;
  textStyle?: any;
  disabled?: boolean;
}

const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  title,
  onPress,
  accessibilityHint,
  accessibilityState,
  style,
  textStyle,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, style, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      accessible={true}
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      accessibilityRole={getAccessibilityRole('button')}
      accessibilityState={{ disabled, ...accessibilityState }}
    >
      <Text style={[styles.text, textStyle, disabled && styles.disabledText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  disabled: {
    backgroundColor: '#E5E5EA',
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledText: {
    color: '#8E8E93',
  },
});

export default AccessibleButton;
