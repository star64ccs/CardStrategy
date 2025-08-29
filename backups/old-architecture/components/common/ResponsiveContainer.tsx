import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  style?: any;
}

const { width: screenWidth } = Dimensions.get('window');

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  style,
}) => {
  return <View style={[styles.container, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: screenWidth > 768 ? 20 : 10,
    maxWidth: screenWidth > 1024 ? 1200 : '100%',
    alignSelf: 'center',
  },
});

export default ResponsiveContainer;
