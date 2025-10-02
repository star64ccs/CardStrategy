import { AIServiceManager } from './AIServiceManager';

export interface Article {
  id: string;
  title: string;
  content: string;
  summary: string;
  tags: string[];
  category: string;
  publishDate?: Date;
  status: 'draft' | 'published' | 'scheduled';
  metadata: {
    wordCount: number;
    readingTime: number;
    seoScore: number;
    aiProvider: string;
    cost: number;
  };
}

export interface SocialPost {
  id: string;
  platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin';
  content: string;
  hashtags: string[];
  imageUrl?: string;
  scheduledTime?: Date;
  status: 'draft' | 'scheduled' | 'published';
  metadata: {
    characterCount: number;
    engagementScore: number;
    aiProvider: string;
    cost: number;
  };
}

export interface MediaWorkerConfig {
  enabled: boolean;
  schedule: string; // cron expression
  contentGeneration: {
    enableAutoGeneration: boolean;
    maxArticlesPerDay: number;
    maxSocialPostsPerDay: number;
    preferredTopics: string[];
    excludedTopics: string[];
  };
  publishing: {
    enableAutoPublish: boolean;
    publishTime: string; // HH:mm
    platforms: string[];
    approvalRequired: boolean;
  };
  costControl: {
    maxDailyBudget: number;
    preferredAIProvider: string;
    enableCostOptimization: boolean;
  };
}

export class MediaWorker {
  private readonly aiService: AIServiceManager;
  private config: MediaWorkerConfig;
  private readonly isRunning = false;

  constructor(config: MediaWorkerConfig) {
    this.config = config;
    this.aiService = AIServiceManager.getInstance();
  }

  /**
   * 生成文章Content
   */
  public async generateArticle(
    topic: string,
    category = 'general'
  ): Promise<Article> {
    try {
      // CheckConfigure
      if (!this.config.enabled) {
        throw new Error('MediaWorker 已停用');
      }

      // Check成本Limit
      await this.checkCostLimits();

      // 生成文章標題
      const _titlePrompt = `為以下主題生成一個吸引人的文章標題，要求：
1. 標題要簡潔有力
2. 包含關鍵詞
3. 適合SEO優化
4. 長度在50字以內

主題：${topic}
分類：${category}

請只返回標題，不要其他內容。`;

      const _titleResponse = await this.aiService.callAI({
        prompt: titlePrompt,
        maxTokens: 100,
        temperature: 0.7,
        useCache: true,
      });

      const _title = titleResponse.content.trim();

      // 生成文章大綱
      const _outlinePrompt = `為以下標題生成詳細的文章大綱，要求：
1. 包含3-5個主要章節
2. 每個章節包含2-3個子要點
3. 結構清晰，邏輯合理
4. 適合讀者閱讀

標題：${title}
主題：${topic}
分類：${category}

請以JSON格式返回大綱結構。`;

      const _outlineResponse = await this.aiService.callAI({
        prompt: outlinePrompt,
        maxTokens: 500,
        temperature: 0.6,
        useCache: true,
      });

      // 生成文章Content
      const _contentPrompt = `根據以下大綱撰寫一篇完整的文章，要求：
1. 內容豐富，有深度
2. 語言流暢，易於理解
3. 包含實用的信息和建議
4. 字數在1500-2000字之間
5. 適合SEO優化

標題：${title}
大綱：${outlineResponse.content}

請直接返回文章內容，不要包含標題。`;

      const _contentResponse = await this.aiService.callAI({
        prompt: contentPrompt,
        maxTokens: 3000,
        temperature: 0.7,
        useCache: false,
      });

      // 生成文章摘要
      const _summaryPrompt = `為以下文章生成一個簡潔的摘要，要求：
1. 概括文章主要內容
2. 突出核心觀點
3. 長度在200字以內
4. 吸引讀者興趣

文章內容：${contentResponse.content.substring(0, 1000)}...

請直接返回摘要內容。`;

      const _summaryResponse = await this.aiService.callAI({
        prompt: summaryPrompt,
        maxTokens: 300,
        temperature: 0.5,
        useCache: true,
      });

      // 生成Tag
      const _tagsPrompt = `為以下文章生成5-8個相關標籤，要求：
1. 標籤要相關且精準
2. 包含主要關鍵詞
3. 適合SEO優化
4. 用逗號分隔

文章標題：${title}
文章摘要：${summaryResponse.content}

請直接返回標籤，用逗號分隔。`;

      const _tagsResponse = await this.aiService.callAI({
        prompt: tagsPrompt,
        maxTokens: 200,
        temperature: 0.3,
        useCache: true,
      });

      const _tags = tagsResponse.content
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // 計算文章StatisticsInformation
      const _wordCount = contentResponse.content.split(/\s+/).length;
      const _readingTime = Math.ceil(wordCount / 200); // False設每Minute閱讀200字
      const _seoScore = this.calculateSEOScore(
        title,
        contentResponse.content,
        tags
      );

      // 計算總成本
      const _totalCost =
        titleResponse.cost +
        outlineResponse.cost +
        contentResponse.cost +
        summaryResponse.cost +
        tagsResponse.cost;

      const article: Article = {
        id: `article_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title,
        content: contentResponse.content,
        summary: summaryResponse.content,
        tags,
        category,
        status: 'draft',
        metadata: {
          wordCount,
          readingTime,
          seoScore,
          aiProvider: titleResponse.provider,
          cost: totalCost,
        },
      };

      return article;
    } catch (error) {
      console.error('生成文章Failed:', error);
      throw error;
    }
  }

  /**
   * 生成社群貼文
   */
  public async generateSocialPost(
    article: Article,
    platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin'
  ): Promise<SocialPost> {
    try {
      // CheckConfigure
      if (!this.config.enabled) {
        throw new Error('MediaWorker 已停用');
      }

      // Check成本Limit
      await this.checkCostLimits();

      // Root據平台生成適合的Content
      const _platformConfig = this.getPlatformConfig(platform);

      const _postPrompt = `為以下文章生成適合${platformConfig.name}的社群貼文，要求：
1. 內容要吸引人，引發互動
2. 符合${platformConfig.name}的風格和限制
3. 包含相關標籤
4. 長度在${platformConfig.maxLength}字以內
5. 包含行動呼籲

文章標題：${article.title}
文章摘要：${article.summary}
文章標籤：${article.tags.join(', ')}

請直接返回貼文內容。`;

      const _postResponse = await this.aiService.callAI({
        prompt: postPrompt,
        maxTokens: platformConfig.maxLength * 2,
        temperature: 0.8,
        useCache: true,
      });

      // 生成Tag
      const _hashtagsPrompt = `為以下社群貼文生成5-8個相關標籤，要求：
1. 標籤要相關且熱門
2. 符合${platformConfig.name}的標籤風格
3. 包含#符號
4. 用空格分隔

貼文內容：${postResponse.content}

請直接返回標籤，用空格分隔。`;

      const _hashtagsResponse = await this.aiService.callAI({
        prompt: hashtagsPrompt,
        maxTokens: 200,
        temperature: 0.3,
        useCache: true,
      });

      const _hashtags = hashtagsResponse.content
        .split(/\s+/)
        .filter(tag => tag.startsWith('#'));

      // 計算StatisticsInformation
      const _characterCount = postResponse.content.length;
      const _engagementScore = this.calculateEngagementScore(
        postResponse.content,
        hashtags
      );

      const socialPost: SocialPost = {
        id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        platform,
        content: postResponse.content,
        hashtags,
        status: 'draft',
        metadata: {
          characterCount,
          engagementScore,
          aiProvider: postResponse.provider,
          cost: postResponse.cost + hashtagsResponse.cost,
        },
      };

      return socialPost;
    } catch (error) {
      console.error('生成社群貼文Failed:', error);
      throw error;
    }
  }

  /**
   * 排程發佈文章
   */
  public async schedulePublish(
    article: Article,
    publishDate: Date
  ): Promise<void> {
    try {
      // Check發佈Configure
      if (!this.config.publishing.enableAutoPublish) {
        throw new Error('自動發佈功能已停用');
      }

      // Update文章Status
      article.status = 'scheduled';
      article.publishDate = publishDate;

      // 這裡應該將文章Save到Database或TaskQueue
      console.log(`文章已排程發佈: ${article.title} - ${publishDate}`);

      // 可以集成到現有的TaskSchedule系統
      // await this.taskScheduler.scheduleTask({
      //   type: 'publish_article',
      //   data: { articleId: article.id },
      //   scheduledAt: publishDate
      // });
    } catch (error) {
      console.error('排程發佈Failed:', error);
      throw error;
    }
  }

  /**
   * Batch生成Content
   */
  public async generateBatchContent(
    topics: string[],
    count = 5
  ): Promise<{ articles: Article[]; posts: SocialPost[] }> {
    const articles: Article[] = [];
    const posts: SocialPost[] = [];

    try {
      for (let i = 0; i < Math.min(count, topics.length); i++) {
        const _topic = topics[i];

        // 生成文章
        const _article = await this.generateArticle(topic);
        articles.push(article);

        // 為每個平台生成社群貼文
        const platforms: ('facebook' | 'twitter' | 'instagram' | 'linkedin')[] =
          ['facebook', 'twitter', 'instagram', 'linkedin'];

        for (const platform of platforms) {
          const _post = await this.generateSocialPost(article, platform);
          posts.push(post);
        }

        // 避免APILimit
        await this.delay(1000);
      }

      return { articles, posts };
    } catch (error) {
      console.error('批量生成內容Failed:', error);
      throw error;
    }
  }

  /**
   * Check成本Limit
   */
  private async checkCostLimits(): Promise<void> {
    const _stats = this.aiService.getStats();
    const _today = new Date().toDateString();

    // 這裡應該從DatabaseGet今日成本
    const _dailyCost = stats.totalCost; // 簡化實現

    if (dailyCost >= this.config.costControl.maxDailyBudget) {
      throw new Error(
        `已達到每日成本限制: $${this.config.costControl.maxDailyBudget}`
      );
    }
  }

  /**
   * 計算SEO分數
   */
  private calculateSEOScore(
    title: string,
    content: string,
    tags: string[]
  ): number {
    let score = 0;

    // 標題長度Check
    if (title.length >= 30 && title.length <= 60) score += 20;

    // Content長度Check
    if (content.length >= 1500) score += 20;

    // Tag數量Check
    if (tags.length >= 5) score += 15;

    // OffKey詞密度Check（簡化實現）
    const _keywordDensity = this.calculateKeywordDensity(content, tags);
    score += Math.min(keywordDensity * 10, 25);

    // 可讀性Check
    const _readability = this.calculateReadability(content);
    score += Math.min(readability * 20, 20);

    return Math.min(score, 100);
  }

  /**
   * 計算OffKey詞密度
   */
  private calculateKeywordDensity(content: string, keywords: string[]): number {
    const _words = content.toLowerCase().split(/\s+/);
    let keywordCount = 0;

    keywords.forEach(keyword => {
      const _keywordWords = keyword.toLowerCase().split(/\s+/);
      for (let i = 0; i <= words.length - keywordWords.length; i++) {
        if (keywordWords.every((word, j) => words[i + j].includes(word))) {
          keywordCount++;
        }
      }
    });

    return keywordCount / words.length;
  }

  /**
   * 計算可讀性分數
   */
  private calculateReadability(content: string): number {
    const _sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const _words = content.split(/\s+/).filter(w => w.length > 0);
    const _syllables = this.countSyllables(content);

    if (sentences.length === 0 || words.length === 0) return 0;

    // Flesch Reading Ease 公式
    const _fleschScore =
      206.835 -
      1.015 * (words.length / sentences.length) -
      84.6 * (syllables / words.length);

    // Convert為0-1分數
    return Math.max(0, Math.min(1, fleschScore / 100));
  }

  /**
   * 計算音節數（簡化實現）
   */
  private countSyllables(text: string): number {
    const _words = text.toLowerCase().split(/\s+/);
    let syllables = 0;

    words.forEach(word => {
      const _vowels = word.match(/[aeiouy]+/g);
      syllables += vowels ? vowels.length : 1;
    });

    return syllables;
  }

  /**
   * 計算互動分數
   */
  private calculateEngagementScore(
    content: string,
    hashtags: string[]
  ): number {
    let score = 0;

    // Content長度Check
    if (content.length >= 50 && content.length <= 200) score += 20;

    // Tag數量Check
    if (hashtags.length >= 3 && hashtags.length <= 8) score += 20;

    // 問題Check
    if (content.includes('?') || content.includes('？')) score += 15;

    // Row動呼籲Check
    const _callToAction = [
      '點擊',
      '分享',
      '評論',
      '關注',
      '點讚',
      'click',
      'share',
      'comment',
      'follow',
      'like',
    ];
    if (callToAction.some(cta => content.toLowerCase().includes(cta)))
      score += 15;

    // Table情符號Check
    const _emojiCount = (
      content.match(
        /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu
      ) || []
    ).length;
    score += Math.min(emojiCount * 5, 15);

    // 熱門TagCheck
    const _popularHashtags = [
      '#trending',
      '#viral',
      '#popular',
      '#hot',
      '#trend',
    ];
    const _popularCount = hashtags.filter(tag =>
      popularHashtags.includes(tag.toLowerCase())
    ).length;
    score += popularCount * 5;

    return Math.min(score, 100);
  }

  /**
   * Get平台Configure
   */
  private getPlatformConfig(platform: string) {
    const _configs = {
      facebook: { name: 'Facebook', maxLength: 63206 },
      twitter: { name: 'Twitter', maxLength: 280 },
      instagram: { name: 'Instagram', maxLength: 2200 },
      linkedin: { name: 'LinkedIn', maxLength: 3000 },
    };

    return configs[platform as keyof typeof configs] || configs.facebook;
  }

  /**
   * 延遲Function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get工作Status
   */
  public getStatus(): { isRunning: boolean; config: MediaWorkerConfig } {
    return {
      isRunning: this.isRunning,
      config: this.config,
    };
  }

  /**
   * UpdateConfigure
   */
  public updateConfig(config: Partial<MediaWorkerConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
