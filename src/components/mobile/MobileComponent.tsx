import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MobileComponentProps {
  title: string;
  children: React.ReactNode;
}

const MobileComponent: React.FC<MobileComponentProps> = ({
  title,
  children,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  content: {
    flex: 1,
  },
});

export default MobileComponent;
