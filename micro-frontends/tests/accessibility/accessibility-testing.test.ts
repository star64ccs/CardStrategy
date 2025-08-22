import { test, expect, Page, Browser, BrowserContext } from '@playwright/test';
import {
  setupTestEnvironment,
  cleanupTestEnvironment,
} from '../setup/e2e-setup';

// 可訪問性測試配置
const ACCESSIBILITY_TEST_CONFIG = {
  // WCAG 2.1 AA 標準配置
  wcag: {
    level: 'AA',
    version: '2.1',
    guidelines: [
      '1.1.1', // 非文本內容
      '1.2.1', // 音頻和視頻
      '1.3.1', // 信息和關係
      '1.4.1', // 顏色使用
      '2.1.1', // 鍵盤
      '2.1.2', // 無鍵盤陷阱
      '2.4.1', // 跳過塊
      '2.4.2', // 頁面標題
      '2.4.3', // 焦點順序
      '2.4.4', // 鏈接目的
      '3.2.1', // 焦點變化
      '3.2.2', // 輸入變化
      '4.1.1', // 解析
      '4.1.2', // 名稱、角色、值
    ],
  },
  // 顏色對比度測試配置
  colorContrast: {
    minimumRatio: 4.5, // AA 級別要求
    largeTextRatio: 3.0, // 大字體要求
    testElements: [
      'button',
      'a',
      'input',
      'label',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'p',
      'span',
      'div',
    ],
  },
  // 鍵盤導航測試配置
  keyboardNavigation: {
    testElements: [
      'button',
      'a',
      'input',
      'select',
      'textarea',
      '[role="button"]',
      '[role="link"]',
      '[role="menuitem"]',
      '[tabindex]',
    ],
    skipElements: ['[tabindex="-1"]', '[aria-hidden="true"]', '[hidden]'],
  },
  // 屏幕閱讀器測試配置
  screenReader: {
    testElements: [
      'img[alt]',
      'input[aria-label]',
      'button[aria-label]',
      '[aria-describedby]',
      '[aria-labelledby]',
      '[role]',
      '[aria-expanded]',
      '[aria-pressed]',
      '[aria-checked]',
    ],
  },
};

// 可訪問性測試工具類
class AccessibilityTestUtils {
  private page: Page;
  private accessibilityViolations: {
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    wcagGuideline?: string;
    element?: string;
    timestamp: number;
    details: any;
  }[] = [];

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * 測試頁面標題
   */
  async testPageTitle(): Promise<boolean> {
    console.log('🔍 測試頁面標題...');

    try {
      const title = await this.page.title();

      if (!title || title.trim() === '') {
        this.addAccessibilityViolation(
          'Page Title',
          '頁面缺少標題',
          'high',
          '2.4.2',
          'title',
          { currentTitle: title }
        );
        return true;
      }

      if (title.length < 3) {
        this.addAccessibilityViolation(
          'Page Title',
          '頁面標題過短',
          'medium',
          '2.4.2',
          'title',
          { currentTitle: title, length: title.length }
        );
        return true;
      }

      // 檢查標題是否描述性
      const descriptiveWords = ['home', 'main', 'index', 'page', 'site'];
      const lowerTitle = title.toLowerCase();
      if (descriptiveWords.some((word) => lowerTitle.includes(word))) {
        this.addAccessibilityViolation(
          'Page Title',
          '頁面標題不夠描述性',
          'medium',
          '2.4.2',
          'title',
          { currentTitle: title }
        );
        return true;
      }
    } catch (error) {
      console.warn(`頁面標題測試失敗: ${error.message}`);
    }

    return false;
  }

  /**
   * 測試圖片替代文本
   */
  async testImageAltText(): Promise<boolean> {
    console.log('🔍 測試圖片替代文本...');

    try {
      const images = await this.page.locator('img').all();

      for (const img of images) {
        const alt = await img.getAttribute('alt');
        const src = await img.getAttribute('src');
        const role = await img.getAttribute('role');

        // 檢查是否有 alt 屬性
        if (!alt && role !== 'presentation' && role !== 'none') {
          this.addAccessibilityViolation(
            'Image Alt Text',
            '圖片缺少替代文本',
            'high',
            '1.1.1',
            'img',
            { src, role }
          );
          return true;
        }

        // 檢查 alt 屬性是否為空（除非是裝飾性圖片）
        if (alt === '' && role !== 'presentation' && role !== 'none') {
          this.addAccessibilityViolation(
            'Image Alt Text',
            '圖片替代文本為空',
            'medium',
            '1.1.1',
            'img',
            { src, role, alt }
          );
          return true;
        }

        // 檢查 alt 文本是否過長
        if (alt && alt.length > 125) {
          this.addAccessibilityViolation(
            'Image Alt Text',
            '圖片替代文本過長',
            'low',
            '1.1.1',
            'img',
            { src, alt, length: alt.length }
          );
          return true;
        }
      }
    } catch (error) {
      console.warn(`圖片替代文本測試失敗: ${error.message}`);
    }

    return false;
  }

  /**
   * 測試表單標籤
   */
  async testFormLabels(): Promise<boolean> {
    console.log('🔍 測試表單標籤...');

    try {
      const formControls = await this.page
        .locator('input, select, textarea')
        .all();

      for (const control of formControls) {
        const tagName = await control.evaluate((el) =>
          el.tagName.toLowerCase()
        );
        const type = await control.getAttribute('type');
        const id = await control.getAttribute('id');
        const ariaLabel = await control.getAttribute('aria-label');
        const ariaLabelledby = await control.getAttribute('aria-labelledby');

        // 跳過隱藏的控件
        const isHidden = await control.evaluate((el) => {
          const style = window.getComputedStyle(el);
          return style.display === 'none' || style.visibility === 'hidden';
        });

        if (isHidden) continue;

        // 跳過按鈕類型的輸入
        if (type === 'button' || type === 'submit' || type === 'reset')
          continue;

        // 檢查是否有標籤
        let hasLabel = false;

        if (ariaLabel) {
          hasLabel = true;
        } else if (ariaLabelledby) {
          hasLabel = true;
        } else if (id) {
          const label = await this.page.locator(`label[for="${id}"]`).count();
          hasLabel = label > 0;
        } else {
          // 檢查是否有父級標籤
          const parentLabel = await control
            .locator('xpath=ancestor::label')
            .count();
          hasLabel = parentLabel > 0;
        }

        if (!hasLabel) {
          this.addAccessibilityViolation(
            'Form Labels',
            '表單控件缺少標籤',
            'high',
            '1.3.1',
            tagName,
            { type, id, ariaLabel, ariaLabelledby }
          );
          return true;
        }
      }
    } catch (error) {
      console.warn(`表單標籤測試失敗: ${error.message}`);
    }

    return false;
  }

  /**
   * 測試鍵盤導航
   */
  async testKeyboardNavigation(): Promise<boolean> {
    console.log('🔍 測試鍵盤導航...');

    try {
      // 測試 Tab 鍵導航
      await this.page.keyboard.press('Tab');

      // 檢查是否有焦點指示器
      const focusedElement = await this.page.locator(':focus').first();
      if ((await focusedElement.count()) > 0) {
        const focusStyles = await focusedElement.evaluate((el) => {
          const style = window.getComputedStyle(el);
          return {
            outline: style.outline,
            border: style.border,
            boxShadow: style.boxShadow,
          };
        });

        const hasFocusIndicator =
          focusStyles.outline !== 'none' ||
          focusStyles.border !== 'none' ||
          focusStyles.boxShadow !== 'none';

        if (!hasFocusIndicator) {
          this.addAccessibilityViolation(
            'Keyboard Navigation',
            '缺少焦點指示器',
            'high',
            '2.4.3',
            'focus',
            { focusStyles }
          );
          return true;
        }
      }

      // 測試所有可聚焦元素
      const focusableElements = await this.page
        .locator(
          'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        .all();

      for (const element of focusableElements) {
        const tagName = await element.evaluate((el) =>
          el.tagName.toLowerCase()
        );
        const tabIndex = await element.getAttribute('tabindex');

        // 檢查元素是否可以通過鍵盤激活
        if (tagName === 'button' || tagName === 'a') {
          const isClickable = await element.isEnabled();
          if (!isClickable) {
            this.addAccessibilityViolation(
              'Keyboard Navigation',
              '可聚焦元素無法通過鍵盤激活',
              'high',
              '2.1.1',
              tagName,
              { tabIndex, isClickable }
            );
            return true;
          }
        }
      }
    } catch (error) {
      console.warn(`鍵盤導航測試失敗: ${error.message}`);
    }

    return false;
  }

  /**
   * 測試顏色對比度
   */
  async testColorContrast(): Promise<boolean> {
    console.log('🔍 測試顏色對比度...');

    try {
      // 測試文本元素的顏色對比度
      const textElements = await this.page
        .locator('p, h1, h2, h3, h4, h5, h6, span, div, a, button, label')
        .all();

      for (const element of textElements) {
        const text = await element.textContent();
        if (!text || text.trim() === '') continue;

        const styles = await element.evaluate((el) => {
          const style = window.getComputedStyle(el);
          return {
            color: style.color,
            backgroundColor: style.backgroundColor,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
          };
        });

        // 檢查是否有足夠的顏色對比度
        const contrastRatio = this.calculateContrastRatio(
          styles.color,
          styles.backgroundColor
        );
        const fontSize = parseFloat(styles.fontSize);
        const isLargeText =
          fontSize >= 18 || (fontSize >= 14 && styles.fontWeight >= '700');
        const requiredRatio = isLargeText ? 3.0 : 4.5;

        if (contrastRatio < requiredRatio) {
          this.addAccessibilityViolation(
            'Color Contrast',
            `顏色對比度不足 (${contrastRatio.toFixed(2)}:1)`,
            'high',
            '1.4.3',
            'text',
            {
              contrastRatio,
              requiredRatio,
              color: styles.color,
              backgroundColor: styles.backgroundColor,
              fontSize,
              isLargeText,
            }
          );
          return true;
        }
      }
    } catch (error) {
      console.warn(`顏色對比度測試失敗: ${error.message}`);
    }

    return false;
  }

  /**
   * 測試 ARIA 屬性
   */
  async testARIAAttributes(): Promise<boolean> {
    console.log('🔍 測試 ARIA 屬性...');

    try {
      // 測試 ARIA 標籤
      const elementsWithAriaLabel = await this.page
        .locator('[aria-label]')
        .all();

      for (const element of elementsWithAriaLabel) {
        const ariaLabel = await element.getAttribute('aria-label');
        const tagName = await element.evaluate((el) =>
          el.tagName.toLowerCase()
        );

        if (!ariaLabel || ariaLabel.trim() === '') {
          this.addAccessibilityViolation(
            'ARIA Attributes',
            'ARIA 標籤為空',
            'high',
            '4.1.2',
            tagName,
            { ariaLabel }
          );
          return true;
        }
      }

      // 測試 ARIA 描述
      const elementsWithAriaDescribedby = await this.page
        .locator('[aria-describedby]')
        .all();

      for (const element of elementsWithAriaDescribedby) {
        const ariaDescribedby = await element.getAttribute('aria-describedby');
        const tagName = await element.evaluate((el) =>
          el.tagName.toLowerCase()
        );

        if (ariaDescribedby) {
          const describedElements = ariaDescribedby
            .split(' ')
            .filter((id) => id.trim() !== '');

          for (const id of describedElements) {
            const describedElement = await this.page.locator(`#${id}`).count();
            if (describedElement === 0) {
              this.addAccessibilityViolation(
                'ARIA Attributes',
                `ARIA 描述元素不存在: ${id}`,
                'high',
                '4.1.2',
                tagName,
                { ariaDescribedby, missingId: id }
              );
              return true;
            }
          }
        }
      }

      // 測試 ARIA 角色
      const elementsWithRole = await this.page.locator('[role]').all();

      for (const element of elementsWithRole) {
        const role = await element.getAttribute('role');
        const tagName = await element.evaluate((el) =>
          el.tagName.toLowerCase()
        );

        const validRoles = [
          'button',
          'link',
          'menuitem',
          'menubar',
          'menu',
          'tab',
          'tablist',
          'tabpanel',
          'combobox',
          'listbox',
          'option',
          'textbox',
          'searchbox',
          'spinbutton',
          'slider',
          'progressbar',
          'meter',
          'scrollbar',
          'status',
          'timer',
          'log',
          'marquee',
          'alert',
          'alertdialog',
          'dialog',
          'tooltip',
          'tree',
          'treeitem',
          'grid',
          'gridcell',
          'row',
          'rowgroup',
          'columnheader',
          'rowheader',
          'table',
          'table',
          'row',
          'cell',
          'columnheader',
          'rowheader',
          'banner',
          'complementary',
          'contentinfo',
          'form',
          'main',
          'navigation',
          'region',
          'search',
          'article',
          'aside',
          'section',
          'figure',
          'img',
          'list',
          'listitem',
          'definition',
          'term',
          'math',
          'note',
          'presentation',
        ];

        if (role && !validRoles.includes(role)) {
          this.addAccessibilityViolation(
            'ARIA Attributes',
            `無效的 ARIA 角色: ${role}`,
            'medium',
            '4.1.2',
            tagName,
            { role, validRoles }
          );
          return true;
        }
      }
    } catch (error) {
      console.warn(`ARIA 屬性測試失敗: ${error.message}`);
    }

    return false;
  }

  /**
   * 測試標題結構
   */
  async testHeadingStructure(): Promise<boolean> {
    console.log('🔍 測試標題結構...');

    try {
      const headings = await this.page.locator('h1, h2, h3, h4, h5, h6').all();
      const headingLevels: number[] = [];

      for (const heading of headings) {
        const tagName = await heading.evaluate((el) =>
          el.tagName.toLowerCase()
        );
        const level = parseInt(tagName.substring(1));
        headingLevels.push(level);
      }

      // 檢查是否有 h1 標題
      if (!headingLevels.includes(1)) {
        this.addAccessibilityViolation(
          'Heading Structure',
          '頁面缺少 h1 標題',
          'high',
          '1.3.1',
          'h1',
          { headingLevels }
        );
        return true;
      }

      // 檢查標題層級是否跳躍
      for (let i = 1; i < headingLevels.length; i++) {
        const currentLevel = headingLevels[i];
        const previousLevel = headingLevels[i - 1];

        if (currentLevel - previousLevel > 1) {
          this.addAccessibilityViolation(
            'Heading Structure',
            `標題層級跳躍: ${previousLevel} -> ${currentLevel}`,
            'medium',
            '1.3.1',
            'heading',
            { previousLevel, currentLevel, headingLevels }
          );
          return true;
        }
      }
    } catch (error) {
      console.warn(`標題結構測試失敗: ${error.message}`);
    }

    return false;
  }

  /**
   * 測試語言屬性
   */
  async testLanguageAttributes(): Promise<boolean> {
    console.log('🔍 測試語言屬性...');

    try {
      // 檢查 HTML lang 屬性
      const htmlLang = await this.page.locator('html').getAttribute('lang');

      if (!htmlLang || htmlLang.trim() === '') {
        this.addAccessibilityViolation(
          'Language Attributes',
          'HTML 缺少 lang 屬性',
          'high',
          '3.1.1',
          'html',
          { htmlLang }
        );
        return true;
      }

      // 檢查是否有無效的語言代碼
      const validLangCodes = ['zh-TW', 'zh-CN', 'en', 'en-US', 'ja', 'ko'];
      if (!validLangCodes.includes(htmlLang)) {
        this.addAccessibilityViolation(
          'Language Attributes',
          `無效的語言代碼: ${htmlLang}`,
          'medium',
          '3.1.1',
          'html',
          { htmlLang, validLangCodes }
        );
        return true;
      }

      // 檢查是否有不同語言的內容
      const elementsWithLang = await this.page.locator('[lang]').all();

      for (const element of elementsWithLang) {
        const lang = await element.getAttribute('lang');
        const tagName = await element.evaluate((el) =>
          el.tagName.toLowerCase()
        );

        if (!lang || lang.trim() === '') {
          this.addAccessibilityViolation(
            'Language Attributes',
            '元素 lang 屬性為空',
            'medium',
            '3.1.2',
            tagName,
            { lang }
          );
          return true;
        }
      }
    } catch (error) {
      console.warn(`語言屬性測試失敗: ${error.message}`);
    }

    return false;
  }

  /**
   * 計算顏色對比度
   */
  private calculateContrastRatio(color1: string, color2: string): number {
    // 簡化的對比度計算
    // 實際實現中應該使用更精確的顏色轉換算法

    // 將顏色轉換為相對亮度
    const getLuminance = (color: string): number => {
      // 簡化的亮度計算
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16) / 255;
      const g = parseInt(hex.substr(2, 2), 16) / 255;
      const b = parseInt(hex.substr(4, 2), 16) / 255;

      const rsRGB =
        r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
      const gsRGB =
        g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
      const bsRGB =
        b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

      return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB;
    };

    const luminance1 = getLuminance(color1);
    const luminance2 = getLuminance(color2);

    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * 添加可訪問性違規記錄
   */
  private addAccessibilityViolation(
    type: string,
    description: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    wcagGuideline?: string,
    element?: string,
    details?: any
  ) {
    this.accessibilityViolations.push({
      type,
      description,
      severity,
      wcagGuideline,
      element,
      timestamp: Date.now(),
      details,
    });

    console.warn(`🚨 可訪問性違規 [${severity.toUpperCase()}]: ${description}`);
  }

  /**
   * 獲取可訪問性測試結果
   */
  getAccessibilityReport() {
    return {
      totalViolations: this.accessibilityViolations.length,
      violationsBySeverity: {
        critical: this.accessibilityViolations.filter(
          (v) => v.severity === 'critical'
        ).length,
        high: this.accessibilityViolations.filter((v) => v.severity === 'high')
          .length,
        medium: this.accessibilityViolations.filter(
          (v) => v.severity === 'medium'
        ).length,
        low: this.accessibilityViolations.filter((v) => v.severity === 'low')
          .length,
      },
      violationsByType: this.accessibilityViolations.reduce(
        (acc, violation) => {
          acc[violation.type] = (acc[violation.type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      violationsByWCAG: this.accessibilityViolations.reduce(
        (acc, violation) => {
          if (violation.wcagGuideline) {
            acc[violation.wcagGuideline] =
              (acc[violation.wcagGuideline] || 0) + 1;
          }
          return acc;
        },
        {} as Record<string, number>
      ),
      violations: this.accessibilityViolations,
    };
  }
}

describe('CardStrategy 基本可訪問性測試', () => {
  let browser: Browser;
  let page: Page;
  let accessibilityUtils: AccessibilityTestUtils;

  beforeAll(async () => {
    await setupTestEnvironment();
  });

  beforeEach(async ({ browser: testBrowser }) => {
    browser = testBrowser;
    page = await browser.newPage();
    accessibilityUtils = new AccessibilityTestUtils(page);

    // 導航到應用
    await page.goto('http://localhost:3000');
  });

  afterAll(async () => {
    await cleanupTestEnvironment();
  });

  test('頁面標題測試', async () => {
    console.log('🚀 開始頁面標題測試...');

    const hasTitleIssue = await accessibilityUtils.testPageTitle();

    expect(hasTitleIssue).toBe(false);
  });

  test('圖片替代文本測試', async () => {
    console.log('🚀 開始圖片替代文本測試...');

    const hasAltTextIssue = await accessibilityUtils.testImageAltText();

    expect(hasAltTextIssue).toBe(false);
  });

  test('表單標籤測試', async () => {
    console.log('🚀 開始表單標籤測試...');

    const hasLabelIssue = await accessibilityUtils.testFormLabels();

    expect(hasLabelIssue).toBe(false);
  });

  test('鍵盤導航測試', async () => {
    console.log('🚀 開始鍵盤導航測試...');

    const hasKeyboardIssue = await accessibilityUtils.testKeyboardNavigation();

    expect(hasKeyboardIssue).toBe(false);
  });

  test('顏色對比度測試', async () => {
    console.log('🚀 開始顏色對比度測試...');

    const hasContrastIssue = await accessibilityUtils.testColorContrast();

    expect(hasContrastIssue).toBe(false);
  });

  test('ARIA 屬性測試', async () => {
    console.log('🚀 開始 ARIA 屬性測試...');

    const hasARIAIssue = await accessibilityUtils.testARIAAttributes();

    expect(hasARIAIssue).toBe(false);
  });

  test('標題結構測試', async () => {
    console.log('🚀 開始標題結構測試...');

    const hasHeadingIssue = await accessibilityUtils.testHeadingStructure();

    expect(hasHeadingIssue).toBe(false);
  });

  test('語言屬性測試', async () => {
    console.log('🚀 開始語言屬性測試...');

    const hasLanguageIssue = await accessibilityUtils.testLanguageAttributes();

    expect(hasLanguageIssue).toBe(false);
  });

  test('綜合可訪問性評估', async () => {
    console.log('🚀 開始綜合可訪問性評估...');

    // 執行所有可訪問性測試
    const tests = [
      accessibilityUtils.testPageTitle(),
      accessibilityUtils.testImageAltText(),
      accessibilityUtils.testFormLabels(),
      accessibilityUtils.testKeyboardNavigation(),
      accessibilityUtils.testColorContrast(),
      accessibilityUtils.testARIAAttributes(),
      accessibilityUtils.testHeadingStructure(),
      accessibilityUtils.testLanguageAttributes(),
    ];

    const results = await Promise.all(tests);
    const hasAnyViolation = results.some((result) => result === true);

    // 生成可訪問性報告
    const accessibilityReport = accessibilityUtils.getAccessibilityReport();

    console.log('📊 可訪問性測試報告:');
    console.log(`總違規數: ${accessibilityReport.totalViolations}`);
    console.log('嚴重程度分布:', accessibilityReport.violationsBySeverity);
    console.log('違規類型分布:', accessibilityReport.violationsByType);
    console.log('WCAG 指南違規:', accessibilityReport.violationsByWCAG);

    if (accessibilityReport.violations.length > 0) {
      console.log('🚨 發現的可訪問性問題:');
      accessibilityReport.violations.forEach((violation, index) => {
        console.log(
          `${index + 1}. [${violation.severity.toUpperCase()}] ${violation.type}: ${violation.description}`
        );
        if (violation.wcagGuideline) {
          console.log(`   WCAG 指南: ${violation.wcagGuideline}`);
        }
      });
    }

    expect(hasAnyViolation).toBe(false);
  });
});
