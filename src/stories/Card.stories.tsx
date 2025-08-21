import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import {
  Card,
  AnimatedCard,
  FadeInCard,
  SlideUpCard,
  BounceCard,
  FlipCard,
  GlowCard,
  PulseCard
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
  },
  cardContent: {
    padding: 10
  }
});

export default {
  title: 'Components/Card',
  component: Card,
  parameters: {
    docs: {
      description: {
        component: 'Card 組件提供多種變體和動畫效果，支持豐富的內容展示。'
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
};

// 基礎卡片故事
export const BasicCards = () => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>基礎卡片</Text>
    <View style={styles.row}>
      <Card>
        <View style={styles.cardContent}>
          <Text style={{ color: '#ffffff' }}>默認卡片</Text>
          <Text style={{ color: '#cccccc' }}>基礎內容</Text>
        </View>
      </Card>
      <Card variant="elevated">
        <View style={styles.cardContent}>
          <Text style={{ color: '#ffffff' }}>陰影卡片</Text>
          <Text style={{ color: '#cccccc' }}>帶陰影效果</Text>
        </View>
      </Card>
      <Card variant="outlined">
        <View style={styles.cardContent}>
          <Text style={{ color: '#ffffff' }}>輪廓卡片</Text>
          <Text style={{ color: '#cccccc' }}>金色邊框</Text>
        </View>
      </Card>
    </View>
  </View>
);

// 動畫卡片故事
export const AnimatedCards = () => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>動畫卡片</Text>
    <View style={styles.row}>
      <AnimatedCard
        animationType="fadeIn"
        title="淡入卡片"
        subtitle="平滑淡入效果"
      >
        <View style={styles.cardContent}>
          <Text style={{ color: '#cccccc' }}>淡入動畫效果</Text>
        </View>
      </AnimatedCard>
      <AnimatedCard
        animationType="slideUp"
        title="滑入卡片"
        subtitle="從下方滑入"
      >
        <View style={styles.cardContent}>
          <Text style={{ color: '#cccccc' }}>滑入動畫效果</Text>
        </View>
      </AnimatedCard>
      <AnimatedCard
        animationType="bounce"
        title="彈跳卡片"
        subtitle="彈跳入場效果"
      >
        <View style={styles.cardContent}>
          <Text style={{ color: '#cccccc' }}>彈跳動畫效果</Text>
        </View>
      </AnimatedCard>
    </View>
  </View>
);

// 預定義動畫卡片故事
export const PredefinedAnimatedCards = () => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>預定義動畫卡片</Text>
    <View style={styles.row}>
      <FadeInCard title="淡入卡片" subtitle="預定義淡入效果">
        <View style={styles.cardContent}>
          <Text style={{ color: '#cccccc' }}>FadeInCard 組件</Text>
        </View>
      </FadeInCard>
      <SlideUpCard title="滑入卡片" subtitle="預定義滑入效果">
        <View style={styles.cardContent}>
          <Text style={{ color: '#cccccc' }}>SlideUpCard 組件</Text>
        </View>
      </SlideUpCard>
      <BounceCard title="彈跳卡片" subtitle="預定義彈跳效果">
        <View style={styles.cardContent}>
          <Text style={{ color: '#cccccc' }}>BounceCard 組件</Text>
        </View>
      </BounceCard>
    </View>
    <View style={styles.row}>
      <FlipCard title="翻轉卡片" subtitle="預定義翻轉效果">
        <View style={styles.cardContent}>
          <Text style={{ color: '#cccccc' }}>FlipCard 組件</Text>
        </View>
      </FlipCard>
      <GlowCard title="光暈卡片" subtitle="預定義光暈效果">
        <View style={styles.cardContent}>
          <Text style={{ color: '#cccccc' }}>GlowCard 組件</Text>
        </View>
      </GlowCard>
      <PulseCard title="脈衝卡片" subtitle="預定義脈衝效果">
        <View style={styles.cardContent}>
          <Text style={{ color: '#cccccc' }}>PulseCard 組件</Text>
        </View>
      </PulseCard>
    </View>
  </View>
);

// 尺寸變體故事
export const SizeVariants = () => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>尺寸變體</Text>
    <View style={styles.row}>
      <AnimatedCard
        size="small"
        title="小卡片"
        subtitle="小尺寸"
      >
        <View style={styles.cardContent}>
          <Text style={{ color: '#cccccc' }}>小尺寸卡片</Text>
        </View>
      </AnimatedCard>
      <AnimatedCard
        size="medium"
        title="中卡片"
        subtitle="中尺寸"
      >
        <View style={styles.cardContent}>
          <Text style={{ color: '#cccccc' }}>中尺寸卡片</Text>
        </View>
      </AnimatedCard>
      <AnimatedCard
        size="large"
        title="大卡片"
        subtitle="大尺寸"
      >
        <View style={styles.cardContent}>
          <Text style={{ color: '#cccccc' }}>大尺寸卡片</Text>
        </View>
      </AnimatedCard>
    </View>
  </View>
);

// 狀態變體故事
export const StateVariants = () => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>狀態變體</Text>
    <View style={styles.row}>
      <AnimatedCard
        loading={true}
        title="加載卡片"
        subtitle="加載狀態"
      >
        <View style={styles.cardContent}>
          <Text style={{ color: '#cccccc' }}>加載中的卡片</Text>
        </View>
      </AnimatedCard>
      <AnimatedCard
        error={true}
        title="錯誤卡片"
        subtitle="錯誤狀態"
      >
        <View style={styles.cardContent}>
          <Text style={{ color: '#cccccc' }}>錯誤狀態的卡片</Text>
        </View>
      </AnimatedCard>
      <AnimatedCard
        success={true}
        title="成功卡片"
        subtitle="成功狀態"
      >
        <View style={styles.cardContent}>
          <Text style={{ color: '#cccccc' }}>成功狀態的卡片</Text>
        </View>
      </AnimatedCard>
    </View>
  </View>
);

// 徽章和圖標故事
export const BadgeAndIconCards = () => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>徽章和圖標</Text>
    <View style={styles.row}>
      <AnimatedCard
        title="徽章卡片"
        subtitle="帶徽章"
        badge="NEW"
        badgeColor="#ff6b6b"
        icon="star"
        iconColor="#ffd700"
      >
        <View style={styles.cardContent}>
          <Text style={{ color: '#cccccc' }}>帶徽章和圖標的卡片</Text>
        </View>
      </AnimatedCard>
      <AnimatedCard
        title="數字徽章"
        subtitle="數字徽章"
        badge="5"
        badgeColor="#4ecdc4"
        icon="heart"
        iconColor="#ff6b6b"
      >
        <View style={styles.cardContent}>
          <Text style={{ color: '#cccccc' }}>數字徽章卡片</Text>
        </View>
      </AnimatedCard>
      <AnimatedCard
        title="圖標卡片"
        subtitle="僅圖標"
        icon="settings"
        iconColor="#45b7d1"
      >
        <View style={styles.cardContent}>
          <Text style={{ color: '#cccccc' }}>僅圖標的卡片</Text>
        </View>
      </AnimatedCard>
    </View>
  </View>
);

// 交互效果故事
export const InteractiveCards = () => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>交互效果</Text>
    <View style={styles.row}>
      <AnimatedCard
        title="懸停效果"
        subtitle="hoverEffect={true}"
        hoverEffect={true}
        onPress={() => // logger.info('Card pressed')}
      >
        <View style={styles.cardContent}>
          <Text style={{ color: '#cccccc' }}>懸停時會放大</Text>
        </View>
      </AnimatedCard>
      <AnimatedCard
        title="按壓效果"
        subtitle="pressEffect={true}"
        pressEffect={true}
        onPress={() => // logger.info('Card pressed')}
      >
        <View style={styles.cardContent}>
          <Text style={{ color: '#cccccc' }}>按壓時會縮小</Text>
        </View>
      </AnimatedCard>
      <AnimatedCard
        title="光暈效果"
        subtitle="glowEffect={true}"
        glowEffect={true}
        onPress={() => // logger.info('Card pressed')}
      >
        <View style={styles.cardContent}>
          <Text style={{ color: '#cccccc' }}>持續光暈效果</Text>
        </View>
      </AnimatedCard>
    </View>
  </View>
);

// 完整示例故事
export const CompleteExample = () => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>完整示例</Text>
    <View style={styles.row}>
      <AnimatedCard
        title="完整卡片示例"
        subtitle="包含所有功能"
        size="large"
        variant="elevated"
        animationType="slideUp"
        hoverEffect={true}
        pressEffect={true}
        glowEffect={true}
        badge="PRO"
        badgeColor="#ffd700"
        icon="star"
        iconColor="#ffd700"
        onPress={() => // logger.info('Complete card pressed')}
      >
        <View style={styles.cardContent}>
          <Text style={{ color: '#cccccc', marginBottom: 10 }}>
            這是一個完整的卡片示例，展示了所有可用的功能和效果。
          </Text>
          <Text style={{ color: '#cccccc' }}>
            包含動畫、交互、徽章、圖標等所有特性。
          </Text>
        </View>
      </AnimatedCard>
    </View>
  </View>
);

// 卡片文檔
export const CardDocumentation = () => (
  <View style={styles.container}>
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Card 組件文檔</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Props</Text>
        <View style={{ color: '#ffffff' }}>
          <Text>• title: 卡片標題</Text>
          <Text>• subtitle: 卡片副標題</Text>
          <Text>• children: 卡片內容</Text>
          <Text>• variant: 卡片變體 (default, elevated, outlined, glass)</Text>
          <Text>• size: 卡片尺寸 (small, medium, large)</Text>
          <Text>• animationType: 動畫類型 (fadeIn, slideUp, slideLeft, scale, bounce, flip)</Text>
          <Text>• hoverEffect: 是否啟用懸停效果</Text>
          <Text>• pressEffect: 是否啟用按壓效果</Text>
          <Text>• glowEffect: 是否啟用光暈效果</Text>
          <Text>• pulseEffect: 是否啟用脈衝效果</Text>
          <Text>• loading: 是否顯示加載狀態</Text>
          <Text>• error: 是否顯示錯誤狀態</Text>
          <Text>• success: 是否顯示成功狀態</Text>
          <Text>• badge: 徽章內容</Text>
          <Text>• badgeColor: 徽章顏色</Text>
          <Text>• icon: 圖標名稱</Text>
          <Text>• iconColor: 圖標顏色</Text>
          <Text>• onPress: 點擊事件</Text>
          <Text>• onLongPress: 長按事件</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>使用示例</Text>
        <View style={{ color: '#ffffff' }}>
          <Text>```tsx</Text>
          <Text>import { Card, AnimatedCard } from '@components/common';</Text>
          <Text></Text>
          <Text>// 基礎卡片</Text>
          <Text>{'<Card title="標題" subtitle="副標題">'}</Text>
          <Text>  內容</Text>
          <Text>{'</Card>'}</Text>
          <Text></Text>
          <Text>// 動畫卡片</Text>
          <Text>{'<AnimatedCard animationType="slideUp" title="動畫卡片">'}</Text>
          <Text>  內容</Text>
          <Text>{'</AnimatedCard>'}</Text>
          <Text></Text>
          <Text>// 預定義卡片</Text>
          <Text>{'<FadeInCard title="淡入卡片">'}</Text>
          <Text>  內容</Text>
          <Text>{'</FadeInCard>'}</Text>
          <Text>```</Text>
        </View>
      </View>
    </View>
  </View>
);
