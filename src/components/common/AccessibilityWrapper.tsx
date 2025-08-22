import React from 'react';
import { View, AccessibilityInfo } from 'react-native';

interface AccessibilityWrapperProps {
  children: React.ReactNode;
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: string;
  accessibilityState?: any;
  style?: any;
}

const AccessibilityWrapper: React.FC<AccessibilityWrapperProps> = ({
  children,
  accessible = true,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole,
  accessibilityState,
  style,
  ...props
}) => {
  return (
    <View
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityState}
      style={style}
      {...props}
    >
      {children}
    </View>
  );
};

export default AccessibilityWrapper;
