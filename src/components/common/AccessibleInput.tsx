import React from 'react';
import { TextInput, View, Text, StyleSheet } from 'react-native';
import { getAccessibilityRole } from '../../utils/accessibility';

interface AccessibleInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  accessibilityHint?: string;
  error?: string;
  style?: any;
  inputStyle?: any;
  required?: boolean;
}

const AccessibleInput: React.FC<AccessibleInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  accessibilityHint,
  error,
  style,
  inputStyle,
  required = false,
}) => {
  const labelText = required ? `${label} *` : label;

  return (
    <View style={[styles.container, style]}>
      <Text
        style={styles.label}
        accessible={true}
        accessibilityRole="text"
        accessibilityLabel={labelText}
      >
        {labelText}
      </Text>
      <TextInput
        style={[styles.input, inputStyle, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        accessible={true}
        accessibilityLabel={label}
        accessibilityHint={accessibilityHint}
        accessibilityRole={getAccessibilityRole('textbox')}
        accessibilityState={{
          required,
          invalid: !!error,
        }}
      />
      {error && (
        <Text
          style={styles.errorText}
          accessible={true}
          accessibilityRole="text"
          accessibilityLabel={`錯誤: ${error}`}
        >
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 44,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 4,
  },
});

export default AccessibleInput;
