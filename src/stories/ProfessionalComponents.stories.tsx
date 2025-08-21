import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import {
  CardGradingDisplay,
  CardPriceChart,
  AIRecommendationCard,
  CardCollectionManager,
  CardScannerOverlay
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

// 模擬數據
const mockGradingResult = {
  overallGrade: 9.5,
  subGrades: {
    centering: 9.5,
    corners: 9.0,
    edges: 9.5,
    surface: 9.5
  },
  confidence: 85,
  estimatedValue: 2500,
  serialNumber: 'PSA-12345678',
  gradingDate: '2024-01-15',
  cardName: 'Charizard GX',
  cardType: 'POKEMON'
};

const mockPriceData = {
  currentPrice: 150.00,
  priceChange: 12.50,
  priceChangePercent: 8.33,
  priceHistory: [
    { date: '2024-01-01', price: 120.00 },
    { date: '2024-01-08', price: 135.00 },
    { date: '2024-01-15', price: 150.00 }
  ],
  statistics: {
    high24h: 155.00,
    low24h: 145.00,
    volume24h: 1250,
    marketCap: 1500000
  }
};

const mockRecommendation = {
  cardName: 'Pikachu VMAX',
  cardType: 'POKEMON',
  currentPrice: 45.00,
  predictedPrice: 65.00,
  confidence: 78,
  riskLevel: 'medium',
  reasoning: '基於市場趨勢和卡片稀有度分析，預計未來3個月內價格將上漲。',
  marketTrend: 'upward',
  investmentScore: 8.2,
  timeHorizon: '3-6 months',
  budgetMatch: true,
  minBudget: 30,
  maxBudget: 80
};

const mockCollectionCards = [
  {
    id: '1',
    name: 'Charizard GX',
    type: 'POKEMON',
    rarity: 'ultra-rare',
    condition: 'mint',
    estimatedValue: 2500,
    imageUrl: 'https://example.com/charizard.jpg',
    isForSale: false,
    isWishlist: false,
    acquisitionDate: '2023-12-01',
    acquisitionPrice: 2000
  },
  {
    id: '2',
    name: 'Luffy Gear 5',
    type: 'ONE_PIECE',
    rarity: 'secret-rare',
    condition: 'near-mint',
    estimatedValue: 1800,
    imageUrl: 'https://example.com/luffy.jpg',
    isForSale: true,
    isWishlist: false,
    acquisitionDate: '2023-11-15',
    acquisitionPrice: 1500
  }
];

export default {
  title: 'Components/Professional',
  parameters: {
    docs: {
      description: {
        component: '專業組件提供卡片策略應用的核心功能，包括評級顯示、價格圖表、AI推薦等。'
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

// 卡片評級顯示故事
export const CardGradingDisplayStory = () => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>卡片評級顯示</Text>
    <View style={styles.row}>
      <CardGradingDisplay
        result={mockGradingResult}
        onShare={() => // logger.info('Share grading result')}
        onViewDetails={() => // logger.info('View grading details')}
      />
    </View>
  </View>
);

// 價格圖表故事
export const CardPriceChartStory = () => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>價格圖表</Text>
    <View style={styles.row}>
      <CardPriceChart
        data={mockPriceData}
        cardName="Charizard GX"
        cardType="POKEMON"
        onTimeRangeChange={(range) => // logger.info('Time range changed:', range)}
        onPriceAlert={() => // logger.info('Set price alert')}
      />
    </View>
  </View>
);

// AI推薦卡片故事
export const AIRecommendationCardStory = () => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>AI推薦卡片</Text>
    <View style={styles.row}>
      <AIRecommendationCard
        recommendation={mockRecommendation}
        onInvest={() => // logger.info('Invest in card')}
        onViewDetails={() => // logger.info('View card details')}
        onDismiss={() => // logger.info('Dismiss recommendation')}
      />
    </View>
  </View>
);

// 收藏管理故事
export const CardCollectionManagerStory = () => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>收藏管理</Text>
    <View style={styles.row}>
      <CardCollectionManager
        cards={mockCollectionCards}
        onCardPress={(card) => // logger.info('Card pressed:', card)}
        onAddCard={() => // logger.info('Add new card')}
        onEditCard={(card) => // logger.info('Edit card:', card)}
        onDeleteCard={(cardId) => // logger.info('Delete card:', cardId)}
        onToggleSale={(cardId, isForSale) => // logger.info('Toggle sale:', cardId, isForSale)}
        onToggleWishlist={(cardId, isWishlist) => // logger.info('Toggle wishlist:', cardId, isWishlist)}
        onImport={() => // logger.info('Import cards')}
        onExport={() => // logger.info('Export cards')}
      />
    </View>
  </View>
);

// 掃描覆蓋層故事
export const CardScannerOverlayStory = () => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>掃描覆蓋層</Text>
    <View style={styles.row}>
      <CardScannerOverlay
        isScanning={true}
        scanProgress={65}
        onCapture={() => // logger.info('Capture image')}
        onCancel={() => // logger.info('Cancel scanning')}
        onToggleFlash={() => // logger.info('Toggle flash')}
        onSwitchCamera={() => // logger.info('Switch camera')}
        scanInstructions="將卡片放在框內，保持穩定"
        detectedCard="Charizard GX"
        confidence={85}
      />
    </View>
  </View>
);

// 專業組件文檔
export const ProfessionalComponentsDocumentation = () => (
  <View style={styles.container}>
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>專業組件文檔</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CardGradingDisplay</Text>
        <View style={{ color: '#ffffff' }}>
          <Text>顯示卡片評級結果，包括總分、子項目分數、信心度等。</Text>
          <Text>Props:</Text>
          <Text>• result: 評級結果對象</Text>
          <Text>• onShare: 分享評級結果</Text>
          <Text>• onViewDetails: 查看詳細信息</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CardPriceChart</Text>
        <View style={{ color: '#ffffff' }}>
          <Text>顯示卡片價格歷史和統計信息。</Text>
          <Text>Props:</Text>
          <Text>• data: 價格數據</Text>
          <Text>• cardName: 卡片名稱</Text>
          <Text>• cardType: 卡片類型</Text>
          <Text>• onTimeRangeChange: 時間範圍變更</Text>
          <Text>• onPriceAlert: 設置價格提醒</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AIRecommendationCard</Text>
        <View style={{ color: '#ffffff' }}>
          <Text>顯示AI投資推薦，包括預測價格、風險評估等。</Text>
          <Text>Props:</Text>
          <Text>• recommendation: 推薦數據</Text>
          <Text>• onInvest: 投資操作</Text>
          <Text>• onViewDetails: 查看詳情</Text>
          <Text>• onDismiss: 忽略推薦</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CardCollectionManager</Text>
        <View style={{ color: '#ffffff' }}>
          <Text>管理用戶卡片收藏，支持增刪改查操作。</Text>
          <Text>Props:</Text>
          <Text>• cards: 卡片列表</Text>
          <Text>• onCardPress: 卡片點擊</Text>
          <Text>• onAddCard: 添加卡片</Text>
          <Text>• onEditCard: 編輯卡片</Text>
          <Text>• onDeleteCard: 刪除卡片</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CardScannerOverlay</Text>
        <View style={{ color: '#ffffff' }}>
          <Text>卡片掃描界面覆蓋層，提供掃描指導和反饋。</Text>
          <Text>Props:</Text>
          <Text>• isScanning: 是否正在掃描</Text>
          <Text>• scanProgress: 掃描進度</Text>
          <Text>• onCapture: 拍照</Text>
          <Text>• onCancel: 取消掃描</Text>
          <Text>• detectedCard: 檢測到的卡片</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>使用示例</Text>
        <View style={{ color: '#ffffff' }}>
          <Text>```tsx</Text>
          <Text>import { CardGradingDisplay, CardPriceChart } from '@components/common';</Text>
          <Text></Text>
          <Text>// 評級顯示</Text>
          <Text>{'<CardGradingDisplay result={gradingResult} />'}</Text>
          <Text></Text>
          <Text>// 價格圖表</Text>
          <Text>{'<CardPriceChart data={priceData} cardName="Charizard" />'}</Text>
          <Text></Text>
          <Text>// AI推薦</Text>
          <Text>{'<AIRecommendationCard recommendation={recommendation} />'}</Text>
          <Text>```</Text>
        </View>
      </View>
    </View>
  </View>
);
