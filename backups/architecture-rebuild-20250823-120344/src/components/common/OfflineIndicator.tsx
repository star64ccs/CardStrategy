import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useOffline } from '../hooks/useOffline';

const OfflineIndicator: React.FC = () => {
  const { isOnline, pendingActionsCount } = useOffline();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isOnline ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOnline, fadeAnim]);

  if (isOnline && pendingActionsCount === 0) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={styles.text}>
        {!isOnline ? '離線模式' : `同步中 (${pendingActionsCount} 個操作)`}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ff6b6b',
    padding: 8,
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  text: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default OfflineIndicator;
