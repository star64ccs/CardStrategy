import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Story, Meta } from '@storybook/react-native';
import {
  Button,
  AnimatedButton,
  PrimaryButton,
  SecondaryButton,
  OutlineButton,
  GhostButton,
  DangerButton,
  SuccessButtonVariant,
  PulseButton,
  ShakeButton,
  SuccessButton
} from '../components/common';

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#1a1a1a',
    flex: 1
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20
  },
  section: {
    marginBottom: 30
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10
  }
});

export default {
  title: 'Components/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component: 'Button 組件提供多種變體和動畫效果，支持豐富的交互反饋。'
      }
    }
  },
  decorators: [
    (Story) => (
      <View style={styles.container}>
        <Story />
      </View>
    )
  ]
} as Meta;

// 基礎按鈕故事
export const BasicButtons: Story = () => (
  <View style={styles.section}>
    <View style={styles.sectionTitle}>基礎按鈕</View>
    <View style={styles.row}>
      <Button onPress={() => // logger.info('Default pressed')}>
        默認按鈕
      </Button>
      <Button onPress={() => // logger.info('Primary pressed')} variant="primary">
        主要按鈕
      </Button>
      <Button onPress={() => // logger.info('Secondary pressed')} variant="secondary">
        次要按鈕
      </Button>
    </View>
  </View>
);

// 動畫按鈕故事
export const AnimatedButtons: Story = () => (
  <View style={styles.section}>
    <View style={styles.sectionTitle}>動畫按鈕</View>
    <View style={styles.row}>
      <AnimatedButton
        onPress={() => // logger.info('Animated pressed')}
        glowEffect={true}
      >
        光暈按鈕
      </AnimatedButton>
      <AnimatedButton
        onPress={() => // logger.info('Pulse pressed')}
        pulseEffect={true}
      >
        脈衝按鈕
      </AnimatedButton>
      <AnimatedButton
        onPress={() => // logger.info('Ripple pressed')}
        rippleEffect={true}
      >
        漣漪按鈕
      </AnimatedButton>
    </View>
  </View>
);

// 預定義按鈕故事
export const PredefinedButtons: Story = () => (
  <View style={styles.section}>
    <View style={styles.sectionTitle}>預定義按鈕</View>
    <View style={styles.row}>
      <PrimaryButton onPress={() => // logger.info('Primary pressed')}>
        主要按鈕
      </PrimaryButton>
      <SecondaryButton onPress={() => // logger.info('Secondary pressed')}>
        次要按鈕
      </SecondaryButton>
      <OutlineButton onPress={() => // logger.info('Outline pressed')}>
        輪廓按鈕
      </OutlineButton>
    </View>
    <View style={styles.row}>
      <GhostButton onPress={() => // logger.info('Ghost pressed')}>
        幽靈按鈕
      </GhostButton>
      <DangerButton onPress={() => // logger.info('Danger pressed')}>
        危險按鈕
      </DangerButton>
      <SuccessButtonVariant onPress={() => // logger.info('Success pressed')}>
        成功按鈕
      </SuccessButtonVariant>
    </View>
  </View>
);

// 特殊動畫按鈕故事
export const SpecialAnimationButtons: Story = () => (
  <View style={styles.section}>
    <View style={styles.sectionTitle}>特殊動畫按鈕</View>
    <View style={styles.row}>
      <PulseButton
        onPress={() => // logger.info('Pulse pressed')}
        pulseColor="#ff6b6b"
      >
        脈衝效果
      </PulseButton>
      <ShakeButton
        onPress={() => // logger.info('Shake pressed')}
        shakeOnPress={true}
      >
        搖擺效果
      </ShakeButton>
      <SuccessButton
        onPress={() => // logger.info('Success pressed')}
        onSuccess={() => // logger.info('Success!')}
      >
        成功動畫
      </SuccessButton>
    </View>
  </View>
);

// 尺寸變體故事
export const SizeVariants: Story = () => (
  <View style={styles.section}>
    <View style={styles.sectionTitle}>尺寸變體</View>
    <View style={styles.row}>
      <Button onPress={() => // logger.info('Small pressed')} size="small">
        小按鈕
      </Button>
      <Button onPress={() => // logger.info('Medium pressed')} size="medium">
        中按鈕
      </Button>
      <Button onPress={() => // logger.info('Large pressed')} size="large">
        大按鈕
      </Button>
    </View>
  </View>
);

// 狀態變體故事
export const StateVariants: Story = () => (
  <View style={styles.section}>
    <View style={styles.sectionTitle}>狀態變體</View>
    <View style={styles.row}>
      <AnimatedButton
        onPress={() => // logger.info('Loading pressed')}
        loading={true}
      >
        加載中
      </AnimatedButton>
      <AnimatedButton
        onPress={() => // logger.info('Disabled pressed')}
        disabled={true}
      >
        禁用按鈕
      </AnimatedButton>
      <AnimatedButton
        onPress={() => // logger.info('With icon pressed')}
        icon="star"
        iconPosition="left"
      >
        帶圖標
      </AnimatedButton>
    </View>
  </View>
);

// 徽章按鈕故事
export const BadgeButtons: Story = () => (
  <View style={styles.section}>
    <View style={styles.sectionTitle}>徽章按鈕</View>
    <View style={styles.row}>
      <AnimatedButton
        onPress={() => // logger.info('With badge pressed')}
        badge="3"
        badgeColor="#ff6b6b"
      >
        通知
      </AnimatedButton>
      <AnimatedButton
        onPress={() => // logger.info('With badge pressed')}
        badge="NEW"
        badgeColor="#4ecdc4"
      >
        新功能
      </AnimatedButton>
      <AnimatedButton
        onPress={() => // logger.info('With badge pressed')}
        badge="99+"
        badgeColor="#45b7d1"
      >
        消息
      </AnimatedButton>
    </View>
  </View>
);

// 圖標按鈕故事
export const IconButtons: Story = () => (
  <View style={styles.section}>
    <View style={styles.sectionTitle}>圖標按鈕</View>
    <View style={styles.row}>
      <AnimatedButton
        onPress={() => // logger.info('Left icon pressed')}
        icon="heart"
        iconPosition="left"
      >
        收藏
      </AnimatedButton>
      <AnimatedButton
        onPress={() => // logger.info('Right icon pressed')}
        icon="arrow-forward"
        iconPosition="right"
      >
        下一步
      </AnimatedButton>
      <AnimatedButton
        onPress={() => // logger.info('Icon only pressed')}
        icon="settings"
        iconSize={24}
      >

      </AnimatedButton>
    </View>
  </View>
);

// 錯誤和成功動畫故事
export const ErrorSuccessAnimations: Story = () => (
  <View style={styles.section}>
    <View style={styles.sectionTitle}>錯誤和成功動畫</View>
    <View style={styles.row}>
      <AnimatedButton
        onPress={() => {
          // logger.info('Error animation');
          throw new Error('Test error');
        }}
        errorAnimation={true}
        shakeOnError={true}
      >
        錯誤動畫
      </AnimatedButton>
      <AnimatedButton
        onPress={() => // logger.info('Success animation')}
        successAnimation={true}
      >
        成功動畫
      </AnimatedButton>
    </View>
  </View>
);

// 完整示例故事
export const CompleteExample: Story = () => (
  <View style={styles.section}>
    <View style={styles.sectionTitle}>完整示例</View>
    <View style={styles.row}>
      <PrimaryButton
        onPress={() => // logger.info('Complete example pressed')}
        size="large"
        icon="star"
        iconPosition="left"
        badge="5"
        badgeColor="#ff6b6b"
        glowEffect={true}
        successAnimation={true}
      >
        完整按鈕
      </PrimaryButton>
    </View>
  </View>
);

// 按鈕文檔
export const ButtonDocumentation: Story = () => (
  <View style={styles.container}>
    <View style={styles.section}>
      <View style={styles.sectionTitle}>Button 組件文檔</View>

      <View style={styles.section}>
        <View style={styles.sectionTitle}>Props</View>
        <View style={{ color: '#ffffff' }}>
          <Text>• onPress: 按鈕點擊事件</Text>
          <Text>• variant: 按鈕變體 (default, primary, secondary, outline, ghost, danger, success)</Text>
          <Text>• size: 按鈕尺寸 (small, medium, large)</Text>
          <Text>• disabled: 是否禁用</Text>
          <Text>• loading: 是否顯示加載狀態</Text>
          <Text>• icon: 圖標名稱</Text>
          <Text>• iconPosition: 圖標位置 (left, right)</Text>
          <Text>• badge: 徽章內容</Text>
          <Text>• glowEffect: 是否啟用光暈效果</Text>
          <Text>• pulseEffect: 是否啟用脈衝效果</Text>
          <Text>• rippleEffect: 是否啟用漣漪效果</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionTitle}>使用示例</View>
        <View style={{ color: '#ffffff' }}>
          <Text>```tsx</Text>
          <Text>import { Button, AnimatedButton } from '@components/common';</Text>
          <Text></Text>
          <Text>// 基礎按鈕</Text>
          <Text>{'<Button onPress={() => // logger.info("Pressed!")}>'}</Text>
          <Text>  點擊我</Text>
          <Text>{'</Button>'}</Text>
          <Text></Text>
          <Text>// 動畫按鈕</Text>
          <Text>{'<AnimatedButton onPress={() => // logger.info("Animated!")} glowEffect={true}>'}</Text>
          <Text>  動畫按鈕</Text>
          <Text>{'</AnimatedButton>'}</Text>
          <Text>```</Text>
        </View>
      </View>
    </View>
  </View>
);
