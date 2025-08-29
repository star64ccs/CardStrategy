import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface {{ComponentName}}Props {
  // 組件屬性
}

export const {{ComponentName}}: React.FC<{{ComponentName}}Props> = (props) => {
  const [state, setState] = useState();

  useEffect(() => {
    // 副作用邏輯
  }, []);

  return (
    <View style={styles.container}>
      <Text>{{ComponentName}}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // 樣式定義
  },
});