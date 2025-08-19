# AI聊天助手技術文檔

## 📋 概述

AI聊天助手是CardStrategy平台的第四階段核心功能，提供多模態輸入、智能建議、情感分析等先進的AI交互體驗。本文檔詳細介紹了AI聊天助手的技術架構、組件設計、API接口和實現細節。

## 🏗️ 技術架構

### 整體架構

```
┌─────────────────────────────────────────────────────────────┐
│                    前端層 (React Native)                      │
├─────────────────────────────────────────────────────────────┤
│  UI組件層  │  狀態管理層  │  服務層  │  工具層  │  類型定義層  │
├─────────────────────────────────────────────────────────────┤
│  EnhancedAIChatBot  │  Redux Store  │  aiService  │  utils  │  types  │
├─────────────────────────────────────────────────────────────┤
│                    後端層 (Node.js/Express)                   │
├─────────────────────────────────────────────────────────────┤
│  API路由層  │  服務層  │  模型層  │  數據庫層  │  外部API層   │
├─────────────────────────────────────────────────────────────┤
│  /api/ai   │  aiService  │  AI模型  │  PostgreSQL  │  AI提供商  │
└─────────────────────────────────────────────────────────────┘
```

### 組件架構

```
EnhancedAIChatBot (主組件)
├── VoiceInputButton (語音輸入)
├── ImagePickerButton (圖片選擇)
├── TranslationToggle (翻譯切換)
├── EmotionIndicator (情感指示器)
├── SmartSuggestions (智能建議)
├── ChatSettingsModal (聊天設置)
├── QuickActionsPanel (快速操作)
├── ChatHistoryPanel (聊天歷史)
└── ContextualHelp (上下文幫助)
```

## 🧩 核心組件詳解

### 1. EnhancedAIChatBot (主組件)

**文件位置**: `src/components/ai/EnhancedAIChatBot.tsx`

**功能特性**:
- 多模態輸入處理（文字、語音、圖片）
- 智能建議系統集成
- 情感分析和翻譯功能
- 聊天設置和歷史管理
- 響應式設計和動畫效果

**主要Props**:
```typescript
interface EnhancedAIChatBotProps {
  displayMode?: 'full' | 'compact' | 'floating';
  onMessageSend?: (message: AIChatMessage) => void;
  onSuggestionSelect?: (suggestion: string) => void;
  onSettingsUpdate?: (settings: ChatSettings) => void;
  initialSettings?: ChatSettings;
  className?: string;
}
```

**核心方法**:
```typescript
// 發送消息
const handleSendMessage = async (content: string, type: 'text' | 'voice' | 'image') => {
  // 消息處理邏輯
};

// 生成智能建議
const generateSuggestions = async () => {
  // 建議生成邏輯
};

// 更新設置
const updateSettings = (newSettings: Partial<ChatSettings>) => {
  // 設置更新邏輯
};
```

### 2. VoiceInputButton (語音輸入)

**文件位置**: `src/components/ai/VoiceInputButton.tsx`

**功能特性**:
- 麥克風權限管理
- 錄音狀態視覺反饋
- 語音轉文字功能
- 錯誤處理和重試機制

**主要Props**:
```typescript
interface VoiceInputButtonProps {
  onTranscript: (transcript: string) => void;
  isRecording?: boolean;
  disabled?: boolean;
  className?: string;
}
```

**核心方法**:
```typescript
// 請求麥克風權限
const requestMicrophonePermission = async () => {
  // 權限請求邏輯
};

// 開始錄音
const startRecording = async () => {
  // 錄音開始邏輯
};

// 停止錄音
const stopRecording = async () => {
  // 錄音停止邏輯
};
```

### 3. ImagePickerButton (圖片選擇)

**文件位置**: `src/components/ai/ImagePickerButton.tsx`

**功能特性**:
- 相冊和相機權限管理
- 圖片質量控制
- 多種圖片來源支持
- 圖片預處理和壓縮

**主要Props**:
```typescript
interface ImagePickerButtonProps {
  onImageSelect: (imageUri: string, base64?: string) => void;
  disabled?: boolean;
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  className?: string;
}
```

**核心方法**:
```typescript
// 從相冊選擇圖片
const pickFromGallery = async () => {
  // 相冊選擇邏輯
};

// 使用相機拍照
const takePhoto = async () => {
  // 相機拍照邏輯
};

// 圖片預處理
const preprocessImage = async (uri: string) => {
  // 圖片處理邏輯
};
```

### 4. TranslationToggle (翻譯切換)

**文件位置**: `src/components/ai/TranslationToggle.tsx`

**功能特性**:
- 多語言支持（15種語言）
- 語言選擇模態框
- 實時翻譯切換
- 語言偏好記憶

**支持的語言**:
```typescript
const SUPPORTED_LANGUAGES = [
  { code: 'zh-TW', name: '繁體中文', nativeName: '繁體中文', flag: '🇹🇼' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', nativeName: '日本語', flag: '🇯🇵' },
  // ... 更多語言
];
```

### 5. EmotionIndicator (情感指示器)

**文件位置**: `src/components/ai/EmotionIndicator.tsx`

**功能特性**:
- 7種情感類型識別
- 置信度顯示
- 動態顏色和標籤
- 情感分析結果可視化

**情感類型配置**:
```typescript
const EMOTION_CONFIGS = {
  happy: { icon: '😊', color: '#4CAF50', label: '開心', description: '正面情緒' },
  sad: { icon: '😢', color: '#2196F3', label: '難過', description: '負面情緒' },
  angry: { icon: '😠', color: '#F44336', label: '生氣', description: '負面情緒' },
  // ... 更多情感類型
};
```

### 6. SmartSuggestions (智能建議)

**文件位置**: `src/components/ai/SmartSuggestions.tsx`

**功能特性**:
- 上下文感知建議
- 分類建議系統
- 動畫效果
- 快速操作按鈕

**建議分類**:
```typescript
const categorizedSuggestions = {
  '卡片分析': ['分析這張卡片的價值', '評估卡片狀況', '預測價格趨勢'],
  '投資建議': ['推薦投資組合', '風險評估', '市場分析'],
  '市場趨勢': ['當前市場狀況', '熱門卡片', '價格波動'],
  '一般問題': ['如何使用平台', '功能說明', '技術支持']
};
```

## 🔧 服務層設計

### AI服務擴展

**文件位置**: `src/services/aiService.ts`

**新增方法**:

#### 1. 智能建議生成
```typescript
async generateSuggestions(lastMessage: string, context: any = {}): Promise<{ suggestions: string[] }> {
  try {
    const prompt = `基於用戶的最後一條消息："${lastMessage}"，生成5個相關的建議問題。返回JSON格式：{"suggestions": ["問題1", "問題2", ...]}`;
    
    const response = await this.callAI(prompt, {
      model: 'gpt-3.5-turbo',
      maxTokens: 300,
      temperature: 0.7
    });

    // 解析JSON響應
    const suggestions = this.parseSuggestionsFromResponse(response);
    return { suggestions };
  } catch (error) {
    console.error('生成建議失敗:', error);
    return { suggestions: this.getDefaultSuggestions() };
  }
}
```

#### 2. 情感分析
```typescript
async analyzeEmotion(text: string): Promise<{ emotion: string; confidence: number }> {
  try {
    const prompt = `分析以下文本的情感："${text}"。返回JSON格式：{"emotion": "happy|sad|angry|neutral|excited|worried|surprised", "confidence": 0.85}`;
    
    const response = await this.callAI(prompt, {
      model: 'gpt-3.5-turbo',
      maxTokens: 100,
      temperature: 0.3
    });

    const result = this.parseEmotionFromResponse(response);
    return result;
  } catch (error) {
    console.error('情感分析失敗:', error);
    return { emotion: 'neutral', confidence: 0.5 };
  }
}
```

#### 3. 文本翻譯
```typescript
async translateText(text: string, targetLanguage: string): Promise<string> {
  try {
    const prompt = `將以下文本翻譯成${targetLanguage}："${text}"。只返回翻譯結果，不要其他內容。`;
    
    const response = await this.callAI(prompt, {
      model: 'gpt-3.5-turbo',
      maxTokens: 200,
      temperature: 0.3
    });

    return response.trim();
  } catch (error) {
    console.error('翻譯失敗:', error);
    return text; // 返回原文
  }
}
```

#### 4. 圖片分析
```typescript
async analyzeImage(imageBase64: string, prompt: string): Promise<string> {
  try {
    const response = await fetch(`${this.apiBaseUrl}/ai/analyze-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify({
        image: imageBase64,
        prompt: prompt
      })
    });

    if (!response.ok) {
      throw new Error(`圖片分析失敗: ${response.status}`);
    }

    const result = await response.json();
    return result.analysis;
  } catch (error) {
    console.error('圖片分析失敗:', error);
    throw error;
  }
}
```

## 📊 狀態管理

### Redux Store 結構

**文件位置**: `src/store/slices/aiSlice.ts`

**狀態結構**:
```typescript
interface AIState {
  // 聊天消息
  chatMessages: AIChatMessage[];
  
  // 加載狀態
  isLoading: boolean;
  
  // 錯誤信息
  error: string | null;
  
  // 聊天設置
  chatSettings: ChatSettings;
  
  // 當前分析
  currentAnalysis: CardAnalysis | null;
  
  // 價格預測
  pricePrediction: PricePrediction | null;
  
  // 智能建議
  suggestions: string[];
  
  // 情感分析
  emotion: {
    type: string;
    confidence: number;
  } | null;
  
  // 翻譯設置
  translation: {
    enabled: boolean;
    targetLanguage: string;
  };
}
```

**主要Actions**:
```typescript
// 發送消息
export const sendMessage = createAsyncThunk(
  'ai/sendMessage',
  async (message: AIChatMessage, { dispatch }) => {
    // 消息發送邏輯
  }
);

// 更新設置
export const updateChatSettings = createAction<Partial<ChatSettings>>('ai/updateSettings');

// 生成建議
export const generateSuggestions = createAsyncThunk(
  'ai/generateSuggestions',
  async (lastMessage: string) => {
    // 建議生成邏輯
  }
);

// 分析情感
export const analyzeEmotion = createAsyncThunk(
  'ai/analyzeEmotion',
  async (text: string) => {
    // 情感分析邏輯
  }
);
```

## 🔌 API 接口

### 後端API路由

**文件位置**: `backend/src/routes/ai.js`

**主要端點**:

#### 1. 聊天對話
```javascript
// POST /api/ai/chat
router.post('/chat', async (req, res) => {
  try {
    const { message, context, settings } = req.body;
    const response = await aiService.processChatMessage(message, context, settings);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### 2. 圖片分析
```javascript
// POST /api/ai/analyze-image
router.post('/analyze-image', async (req, res) => {
  try {
    const { image, prompt } = req.body;
    const analysis = await aiService.analyzeImage(image, prompt);
    res.json({ analysis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### 3. 智能建議
```javascript
// POST /api/ai/suggestions
router.post('/suggestions', async (req, res) => {
  try {
    const { lastMessage, context } = req.body;
    const suggestions = await aiService.generateSuggestions(lastMessage, context);
    res.json({ suggestions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### 4. 情感分析
```javascript
// POST /api/ai/emotion
router.post('/emotion', async (req, res) => {
  try {
    const { text } = req.body;
    const emotion = await aiService.analyzeEmotion(text);
    res.json(emotion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## 🎨 UI/UX 設計

### 設計原則

1. **一致性**: 所有組件遵循統一的設計語言
2. **可訪問性**: 支持無障礙設計和鍵盤導航
3. **響應式**: 適配不同屏幕尺寸和設備
4. **直觀性**: 用戶界面簡潔明了，操作流程清晰

### 動畫效果

```typescript
// 打字指示器動畫
const typingAnimation = useSharedValue(0);

useEffect(() => {
  if (isTyping) {
    typingAnimation.value = withRepeat(
      withTiming(1, { duration: 1000 }),
      -1,
      true
    );
  } else {
    typingAnimation.value = 0;
  }
}, [isTyping]);

// 建議面板動畫
const suggestionsAnimation = useSharedValue(0);

const showSuggestions = () => {
  suggestionsAnimation.value = withTiming(1, { duration: 300 });
};

const hideSuggestions = () => {
  suggestionsAnimation.value = withTiming(0, { duration: 300 });
};
```

### 主題支持

```typescript
// 主題配置
const theme = {
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    background: '#F2F2F7',
    surface: '#FFFFFF',
    text: '#000000',
    textSecondary: '#8E8E93'
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16
  }
};
```

## 🔒 安全考慮

### 數據保護

1. **輸入驗證**: 所有用戶輸入都經過嚴格驗證
2. **XSS防護**: 防止跨站腳本攻擊
3. **CSRF防護**: 防止跨站請求偽造
4. **數據加密**: 敏感數據加密存儲和傳輸

### 權限控制

```typescript
// 權限檢查
const checkPermissions = async (permission: string) => {
  try {
    const { status } = await Permissions.askAsync(permission);
    return status === 'granted';
  } catch (error) {
    console.error('權限檢查失敗:', error);
    return false;
  }
};

// 麥克風權限
const microphonePermission = await checkPermissions(Permissions.AUDIO_RECORDING);

// 相機權限
const cameraPermission = await checkPermissions(Permissions.CAMERA);

// 相冊權限
const mediaLibraryPermission = await checkPermissions(Permissions.MEDIA_LIBRARY);
```

## 🧪 測試策略

### 單元測試

```typescript
// EnhancedAIChatBot.test.tsx
describe('EnhancedAIChatBot', () => {
  it('應該正確處理文本消息發送', async () => {
    const mockOnMessageSend = jest.fn();
    const { getByTestId } = render(
      <EnhancedAIChatBot onMessageSend={mockOnMessageSend} />
    );
    
    const input = getByTestId('message-input');
    const sendButton = getByTestId('send-button');
    
    fireEvent.changeText(input, '測試消息');
    fireEvent.press(sendButton);
    
    expect(mockOnMessageSend).toHaveBeenCalledWith(
      expect.objectContaining({
        content: '測試消息',
        type: 'text'
      })
    );
  });
});
```

### 集成測試

```typescript
// aiService.test.ts
describe('AIService', () => {
  it('應該正確生成智能建議', async () => {
    const aiService = new AIService();
    const result = await aiService.generateSuggestions('分析這張卡片');
    
    expect(result.suggestions).toBeDefined();
    expect(Array.isArray(result.suggestions)).toBe(true);
    expect(result.suggestions.length).toBeGreaterThan(0);
  });
});
```

### 端到端測試

```typescript
// ai-chat.test.js
describe('AI聊天助手', () => {
  it('應該完成完整的聊天流程', async () => {
    await page.goto('/ai-chat');
    
    // 發送消息
    await page.fill('[data-testid="message-input"]', '你好');
    await page.click('[data-testid="send-button"]');
    
    // 等待AI響應
    await page.waitForSelector('[data-testid="ai-response"]');
    
    // 驗證響應
    const response = await page.textContent('[data-testid="ai-response"]');
    expect(response).toBeTruthy();
  });
});
```

## 📈 性能優化

### 前端優化

1. **組件懶加載**: 使用React.lazy()延遲加載非關鍵組件
2. **記憶化**: 使用useMemo和useCallback避免不必要的重新渲染
3. **虛擬化**: 長列表使用虛擬化技術
4. **圖片優化**: 圖片壓縮和懶加載

### 後端優化

1. **緩存策略**: Redis緩存常用AI響應
2. **批量處理**: 支持多個AI請求並行處理
3. **連接池**: 數據庫連接池管理
4. **負載均衡**: 智能選擇最佳AI提供商

### 監控指標

```typescript
// 性能監控
const performanceMetrics = {
  messageResponseTime: 0,
  suggestionGenerationTime: 0,
  imageAnalysisTime: 0,
  errorRate: 0,
  userSatisfaction: 0
};

// 記錄性能指標
const recordMetric = (metric: string, value: number) => {
  performanceMetrics[metric] = value;
  // 發送到監控系統
  analyticsService.track('ai_performance', { metric, value });
};
```

## 🚀 部署指南

### 環境配置

```bash
# 安裝依賴
npm install

# 環境變量配置
cp .env.example .env
# 編輯 .env 文件，配置AI提供商API密鑰

# 構建應用
npm run build

# 啟動服務
npm start
```

### Docker部署

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### 監控配置

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'ai-chat-service'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/metrics'
    scrape_interval: 15s
```

## 📚 參考文檔

- [React Native 官方文檔](https://reactnative.dev/)
- [Redux Toolkit 文檔](https://redux-toolkit.js.org/)
- [Expo SDK 文檔](https://docs.expo.dev/)
- [OpenAI API 文檔](https://platform.openai.com/docs/)
- [Claude API 文檔](https://docs.anthropic.com/)

---

**最後更新**: 2024-12-19  
**版本**: 1.0.0  
**狀態**: 技術文檔完成 ✅
