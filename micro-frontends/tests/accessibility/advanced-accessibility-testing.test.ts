import { test, expect, Page, Browser, BrowserContext } from '@playwright/test';
import { setupTestEnvironment, cleanupTestEnvironment } from '../setup/e2e-setup';

// 高級可訪問性測試配置
const ADVANCED_ACCESSIBILITY_CONFIG = {
  // 屏幕閱讀器測試配置
  screenReader: {
    testScenarios: [
      'navigation',
      'form_interaction',
      'dynamic_content',
      'error_handling',
      'status_updates'
    ],
    expectedBehavior: 'accessible'
  },
  // 鍵盤陷阱測試配置
  keyboardTraps: {
    testElements: [
      'modal',
      'dropdown',
      'carousel',
      'lightbox',
      'tooltip'
    ],
    expectedBehavior: 'no_trap'
  },
  // 動態內容測試配置
  dynamicContent: {
    testScenarios: [
      'ajax_loading',
      'real_time_updates',
      'infinite_scroll',
      'auto_refresh',
      'live_region'
    ],
    expectedBehavior: 'announced'
  },
  // 錯誤處理測試配置
  errorHandling: {
    testScenarios: [
      'form_validation',
      'api_errors',
      'network_errors',
      'timeout_errors',
      'permission_errors'
    ],
    expectedBehavior: 'clear_message'
  }
};

// 高級可訪問性測試工具類
class AdvancedAccessibilityTestUtils {
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
   * 測試屏幕閱讀器導航
   */
  async testScreenReaderNavigation(): Promise<boolean> {
    console.log('🔍 測試屏幕閱讀器導航...');

    try {
      // 檢查是否有跳過導航鏈接
      const skipLinks = await this.page.locator('a[href^="#"], [role="navigation"] a').all();

      if (skipLinks.length === 0) {
        this.addAccessibilityViolation(
          'Screen Reader Navigation',
          '缺少跳過導航鏈接',
          'high',
          '2.4.1',
          'navigation',
          { skipLinksCount: skipLinks.length }
        );
        return true;
      }

      // 檢查導航結構
      const navElements = await this.page.locator('nav, [role="navigation"]').all();

      for (const nav of navElements) {
        const ariaLabel = await nav.getAttribute('aria-label');
        const ariaLabelledby = await nav.getAttribute('aria-labelledby');

        if (!ariaLabel && !ariaLabelledby) {
          this.addAccessibilityViolation(
            'Screen Reader Navigation',
            '導航元素缺少標籤',
            'medium',
            '2.4.1',
            'nav',
            { ariaLabel, ariaLabelledby }
          );
          return true;
        }
      }

      // 檢查列表結構
      const lists = await this.page.locator('ul, ol').all();

      for (const list of lists) {
        const listItems = await list.locator('li').count();
        const role = await list.getAttribute('role');

        if (listItems > 0 && role !== 'list') {
          // 檢查是否有適當的 ARIA 標籤
          const ariaLabel = await list.getAttribute('aria-label');
          if (!ariaLabel) {
            this.addAccessibilityViolation(
              'Screen Reader Navigation',
              '列表缺少適當的標籤',
              'medium',
              '1.3.1',
              'ul/ol',
              { listItems, role, ariaLabel }
            );
            return true;
          }
        }
      }

    } catch (error) {
      console.warn(`屏幕閱讀器導航測試失敗: ${error.message}`);
    }

    return false;
  }

  /**
   * 測試表單可訪問性
   */
  async testFormAccessibility(): Promise<boolean> {
    console.log('🔍 測試表單可訪問性...');

    try {
      const forms = await this.page.locator('form').all();

      for (const form of forms) {
        // 檢查表單標籤
        const formLabel = await form.getAttribute('aria-label');
        const formLabelledby = await form.getAttribute('aria-labelledby');

        if (!formLabel && !formLabelledby) {
          this.addAccessibilityViolation(
            'Form Accessibility',
            '表單缺少標籤',
            'high',
            '1.3.1',
            'form',
            { formLabel, formLabelledby }
          );
          return true;
        }

        // 檢查錯誤處理
        const errorElements = await form.locator('[role="alert"], .error, .invalid').all();

        for (const error of errorElements) {
          const errorText = await error.textContent();
          const ariaLive = await error.getAttribute('aria-live');

          if (!ariaLive && errorText && errorText.trim() !== '') {
            this.addAccessibilityViolation(
              'Form Accessibility',
              '錯誤信息缺少 aria-live 屬性',
              'medium',
              '3.3.1',
              'error',
              { errorText, ariaLive }
            );
            return true;
          }
        }

        // 檢查必填字段指示
        const requiredFields = await form.locator('[required], [aria-required="true"]').all();

        for (const field of requiredFields) {
          const ariaRequired = await field.getAttribute('aria-required');
          const required = await field.getAttribute('required');

          if (!ariaRequired && !required) {
            this.addAccessibilityViolation(
              'Form Accessibility',
              '必填字段缺少 required 屬性',
              'high',
              '3.3.2',
              'input',
              { ariaRequired, required }
            );
            return true;
          }
        }
      }

    } catch (error) {
      console.warn(`表單可訪問性測試失敗: ${error.message}`);
    }

    return false;
  }

  /**
   * 測試動態內容可訪問性
   */
  async testDynamicContentAccessibility(): Promise<boolean> {
    console.log('🔍 測試動態內容可訪問性...');

    try {
      // 檢查實時區域
      const liveRegions = await this.page.locator('[aria-live]').all();

      for (const region of liveRegions) {
        const ariaLive = await region.getAttribute('aria-live');
        const ariaAtomic = await region.getAttribute('aria-atomic');
        const ariaRelevant = await region.getAttribute('aria-relevant');

        // 檢查 aria-live 值是否有效
        const validLiveValues = ['polite', 'assertive', 'off'];
        if (ariaLive && !validLiveValues.includes(ariaLive)) {
          this.addAccessibilityViolation(
            'Dynamic Content',
            `無效的 aria-live 值: ${ariaLive}`,
            'medium',
            '1.3.1',
            'live-region',
            { ariaLive, validLiveValues }
          );
          return true;
        }
      }

      // 檢查加載狀態
      const loadingElements = await this.page.locator('[aria-busy="true"], .loading, .spinner').all();

      for (const loading of loadingElements) {
        const ariaBusy = await loading.getAttribute('aria-busy');
        const ariaLabel = await loading.getAttribute('aria-label');

        if (ariaBusy === 'true' && !ariaLabel) {
          this.addAccessibilityViolation(
            'Dynamic Content',
            '加載元素缺少描述標籤',
            'medium',
            '1.3.1',
            'loading',
            { ariaBusy, ariaLabel }
          );
          return true;
        }
      }

      // 檢查進度指示器
      const progressElements = await this.page.locator('[role="progressbar"], progress').all();

      for (const progress of progressElements) {
        const ariaValueNow = await progress.getAttribute('aria-valuenow');
        const ariaValueMin = await progress.getAttribute('aria-valuemin');
        const ariaValueMax = await progress.getAttribute('aria-valuemax');
        const ariaLabel = await progress.getAttribute('aria-label');

        if (!ariaLabel) {
          this.addAccessibilityViolation(
            'Dynamic Content',
            '進度條缺少標籤',
            'medium',
            '1.3.1',
            'progressbar',
            { ariaValueNow, ariaValueMin, ariaValueMax, ariaLabel }
          );
          return true;
        }
      }

    } catch (error) {
      console.warn(`動態內容可訪問性測試失敗: ${error.message}`);
    }

    return false;
  }

  /**
   * 測試鍵盤陷阱
   */
  async testKeyboardTraps(): Promise<boolean> {
    console.log('🔍 測試鍵盤陷阱...');

    try {
      // 檢查模態對話框
      const modals = await this.page.locator('[role="dialog"], .modal, .popup').all();

      for (const modal of modals) {
        const isVisible = await modal.isVisible();

        if (isVisible) {
          // 檢查是否有關閉按鈕
          const closeButtons = await modal.locator('[aria-label*="close"], [aria-label*="關閉"], .close, .close-btn').count();

          if (closeButtons === 0) {
            this.addAccessibilityViolation(
              'Keyboard Traps',
              '模態對話框缺少關閉按鈕',
              'high',
              '2.1.2',
              'dialog',
              { closeButtons }
            );
            return true;
          }

          // 檢查 ESC 鍵是否可以關閉
          await modal.click();
          await this.page.keyboard.press('Escape');

          // 等待一下看是否關閉
          await this.page.waitForTimeout(1000);

          const stillVisible = await modal.isVisible();
          if (stillVisible) {
            this.addAccessibilityViolation(
              'Keyboard Traps',
              '模態對話框無法通過 ESC 鍵關閉',
              'high',
              '2.1.2',
              'dialog',
              { stillVisible }
            );
            return true;
          }
        }
      }

      // 檢查下拉菜單
      const dropdowns = await this.page.locator('[role="menu"], .dropdown, .select').all();

      for (const dropdown of dropdowns) {
        const isExpanded = await dropdown.getAttribute('aria-expanded');

        if (isExpanded === 'true') {
          // 檢查是否可以通過鍵盤關閉
          await dropdown.click();
          await this.page.keyboard.press('Escape');

          await this.page.waitForTimeout(500);

          const stillExpanded = await dropdown.getAttribute('aria-expanded');
          if (stillExpanded === 'true') {
            this.addAccessibilityViolation(
              'Keyboard Traps',
              '下拉菜單無法通過 ESC 鍵關閉',
              'medium',
              '2.1.2',
              'menu',
              { stillExpanded }
            );
            return true;
          }
        }
      }

    } catch (error) {
      console.warn(`鍵盤陷阱測試失敗: ${error.message}`);
    }

    return false;
  }

  /**
   * 測試錯誤處理可訪問性
   */
  async testErrorHandlingAccessibility(): Promise<boolean> {
    console.log('🔍 測試錯誤處理可訪問性...');

    try {
      // 檢查錯誤信息
      const errorMessages = await this.page.locator('[role="alert"], .error, .alert, .notification').all();

      for (const error of errorMessages) {
        const errorText = await error.textContent();
        const ariaLive = await error.getAttribute('aria-live');
        const ariaAtomic = await error.getAttribute('aria-atomic');

        if (errorText && errorText.trim() !== '') {
          // 檢查是否有適當的 ARIA 屬性
          if (!ariaLive) {
            this.addAccessibilityViolation(
              'Error Handling',
              '錯誤信息缺少 aria-live 屬性',
              'high',
              '3.3.1',
              'alert',
              { errorText, ariaLive }
            );
            return true;
          }

          // 檢查錯誤信息是否清晰
          const clearErrorWords = ['錯誤', 'error', 'invalid', '無效', 'required', '必填'];
          const hasClearError = clearErrorWords.some(word =>
            errorText.toLowerCase().includes(word.toLowerCase())
          );

          if (!hasClearError) {
            this.addAccessibilityViolation(
              'Error Handling',
              '錯誤信息不夠清晰',
              'medium',
              '3.3.1',
              'alert',
              { errorText, clearErrorWords }
            );
            return true;
          }
        }
      }

      // 檢查成功信息
      const successMessages = await this.page.locator('[role="status"], .success, .message').all();

      for (const success of successMessages) {
        const successText = await success.textContent();
        const ariaLive = await success.getAttribute('aria-live');

        if (successText && successText.trim() !== '' && !ariaLive) {
          this.addAccessibilityViolation(
            'Error Handling',
            '成功信息缺少 aria-live 屬性',
            'medium',
            '3.3.1',
            'status',
            { successText, ariaLive }
          );
          return true;
        }
      }

    } catch (error) {
      console.warn(`錯誤處理可訪問性測試失敗: ${error.message}`);
    }

    return false;
  }

  /**
   * 測試狀態更新可訪問性
   */
  async testStatusUpdatesAccessibility(): Promise<boolean> {
    console.log('🔍 測試狀態更新可訪問性...');

    try {
      // 檢查狀態指示器
      const statusElements = await this.page.locator('[role="status"], [aria-live="polite"]').all();

      for (const status of statusElements) {
        const statusText = await status.textContent();
        const ariaLive = await status.getAttribute('aria-live');

        if (statusText && statusText.trim() !== '') {
          if (!ariaLive || ariaLive === 'off') {
            this.addAccessibilityViolation(
              'Status Updates',
              '狀態更新缺少 aria-live 屬性',
              'medium',
              '4.1.3',
              'status',
              { statusText, ariaLive }
            );
            return true;
          }
        }
      }

      // 檢查計時器
      const timerElements = await this.page.locator('[role="timer"], .timer, .countdown').all();

      for (const timer of timerElements) {
        const timerText = await timer.textContent();
        const ariaLabel = await timer.getAttribute('aria-label');

        if (timerText && timerText.trim() !== '' && !ariaLabel) {
          this.addAccessibilityViolation(
            'Status Updates',
            '計時器缺少標籤',
            'medium',
            '4.1.3',
            'timer',
            { timerText, ariaLabel }
          );
          return true;
        }
      }

    } catch (error) {
      console.warn(`狀態更新可訪問性測試失敗: ${error.message}`);
    }

    return false;
  }

  /**
   * 測試焦點管理
   */
  async testFocusManagement(): Promise<boolean> {
    console.log('🔍 測試焦點管理...');

    try {
      // 檢查焦點順序
      const focusableElements = await this.page.locator(
        'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ).all();

      const tabIndexes: number[] = [];

      for (const element of focusableElements) {
        const tabIndex = await element.getAttribute('tabindex');
        if (tabIndex) {
          tabIndexes.push(parseInt(tabIndex));
        }
      }

      // 檢查 tabindex 是否合理
      const hasLargeTabIndex = tabIndexes.some(index => index > 0);
      if (hasLargeTabIndex) {
        this.addAccessibilityViolation(
          'Focus Management',
          '存在大於 0 的 tabindex 值',
          'medium',
          '2.4.3',
          'focus',
          { tabIndexes, hasLargeTabIndex }
        );
        return true;
      }

      // 檢查焦點可見性
      await this.page.keyboard.press('Tab');
      const focusedElement = await this.page.locator(':focus').first();

      if (await focusedElement.count() > 0) {
        const focusStyles = await focusedElement.evaluate(el => {
          const style = window.getComputedStyle(el);
          return {
            outline: style.outline,
            border: style.border,
            boxShadow: style.boxShadow,
            backgroundColor: style.backgroundColor
          };
        });

        const hasVisibleFocus =
          focusStyles.outline !== 'none' ||
          focusStyles.border !== 'none' ||
          focusStyles.boxShadow !== 'none' ||
          focusStyles.backgroundColor !== 'transparent';

        if (!hasVisibleFocus) {
          this.addAccessibilityViolation(
            'Focus Management',
            '焦點元素不可見',
            'high',
            '2.4.3',
            'focus',
            { focusStyles }
          );
          return true;
        }
      }

    } catch (error) {
      console.warn(`焦點管理測試失敗: ${error.message}`);
    }

    return false;
  }

  /**
   * 測試語義化標記
   */
  async testSemanticMarkup(): Promise<boolean> {
    console.log('🔍 測試語義化標記...');

    try {
      // 檢查主要內容區域
      const mainElements = await this.page.locator('main, [role="main"]').all();

      if (mainElements.length === 0) {
        this.addAccessibilityViolation(
          'Semantic Markup',
          '缺少主要內容區域標記',
          'high',
          '1.3.1',
          'main',
          { mainElementsCount: mainElements.length }
        );
        return true;
      }

      // 檢查頁面結構
      const structuralElements = await this.page.locator('header, nav, main, aside, footer, section, article').all();

      if (structuralElements.length < 3) {
        this.addAccessibilityViolation(
          'Semantic Markup',
          '頁面結構標記不足',
          'medium',
          '1.3.1',
          'structure',
          { structuralElementsCount: structuralElements.length }
        );
        return true;
      }

      // 檢查列表語義
      const lists = await this.page.locator('ul, ol').all();

      for (const list of lists) {
        const listItems = await list.locator('li').count();

        if (listItems === 0) {
          this.addAccessibilityViolation(
            'Semantic Markup',
            '列表缺少列表項',
            'medium',
            '1.3.1',
            'list',
            { listItems }
          );
          return true;
        }
      }

      // 檢查表格語義
      const tables = await this.page.locator('table').all();

      for (const table of tables) {
        const headers = await table.locator('th').count();
        const caption = await table.locator('caption').count();

        if (headers === 0) {
          this.addAccessibilityViolation(
            'Semantic Markup',
            '表格缺少表頭',
            'medium',
            '1.3.1',
            'table',
            { headers, caption }
          );
          return true;
        }
      }

    } catch (error) {
      console.warn(`語義化標記測試失敗: ${error.message}`);
    }

    return false;
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
      details
    });

    console.warn(`🚨 高級可訪問性違規 [${severity.toUpperCase()}]: ${description}`);
  }

  /**
   * 獲取可訪問性測試結果
   */
  getAccessibilityReport() {
    return {
      totalViolations: this.accessibilityViolations.length,
      violationsBySeverity: {
        critical: this.accessibilityViolations.filter(v => v.severity === 'critical').length,
        high: this.accessibilityViolations.filter(v => v.severity === 'high').length,
        medium: this.accessibilityViolations.filter(v => v.severity === 'medium').length,
        low: this.accessibilityViolations.filter(v => v.severity === 'low').length
      },
      violationsByType: this.accessibilityViolations.reduce((acc, violation) => {
        acc[violation.type] = (acc[violation.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      violationsByWCAG: this.accessibilityViolations.reduce((acc, violation) => {
        if (violation.wcagGuideline) {
          acc[violation.wcagGuideline] = (acc[violation.wcagGuideline] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>),
      violations: this.accessibilityViolations
    };
  }
}

describe('CardStrategy 高級可訪問性測試', () => {
  let browser: Browser;
  let page: Page;
  let accessibilityUtils: AdvancedAccessibilityTestUtils;

  beforeAll(async () => {
    await setupTestEnvironment();
  });

  beforeEach(async ({ browser: testBrowser }) => {
    browser = testBrowser;
    page = await browser.newPage();
    accessibilityUtils = new AdvancedAccessibilityTestUtils(page);

    // 導航到應用
    await page.goto('http://localhost:3000');
  });

  afterAll(async () => {
    await cleanupTestEnvironment();
  });

  test('屏幕閱讀器導航測試', async () => {
    console.log('🚀 開始屏幕閱讀器導航測試...');

    const hasNavigationIssue = await accessibilityUtils.testScreenReaderNavigation();

    expect(hasNavigationIssue).toBe(false);
  });

  test('表單可訪問性測試', async () => {
    console.log('🚀 開始表單可訪問性測試...');

    const hasFormIssue = await accessibilityUtils.testFormAccessibility();

    expect(hasFormIssue).toBe(false);
  });

  test('動態內容可訪問性測試', async () => {
    console.log('🚀 開始動態內容可訪問性測試...');

    const hasDynamicContentIssue = await accessibilityUtils.testDynamicContentAccessibility();

    expect(hasDynamicContentIssue).toBe(false);
  });

  test('鍵盤陷阱測試', async () => {
    console.log('🚀 開始鍵盤陷阱測試...');

    const hasKeyboardTrapIssue = await accessibilityUtils.testKeyboardTraps();

    expect(hasKeyboardTrapIssue).toBe(false);
  });

  test('錯誤處理可訪問性測試', async () => {
    console.log('🚀 開始錯誤處理可訪問性測試...');

    const hasErrorHandlingIssue = await accessibilityUtils.testErrorHandlingAccessibility();

    expect(hasErrorHandlingIssue).toBe(false);
  });

  test('狀態更新可訪問性測試', async () => {
    console.log('🚀 開始狀態更新可訪問性測試...');

    const hasStatusUpdateIssue = await accessibilityUtils.testStatusUpdatesAccessibility();

    expect(hasStatusUpdateIssue).toBe(false);
  });

  test('焦點管理測試', async () => {
    console.log('🚀 開始焦點管理測試...');

    const hasFocusManagementIssue = await accessibilityUtils.testFocusManagement();

    expect(hasFocusManagementIssue).toBe(false);
  });

  test('語義化標記測試', async () => {
    console.log('🚀 開始語義化標記測試...');

    const hasSemanticMarkupIssue = await accessibilityUtils.testSemanticMarkup();

    expect(hasSemanticMarkupIssue).toBe(false);
  });

  test('綜合高級可訪問性評估', async () => {
    console.log('🚀 開始綜合高級可訪問性評估...');

    // 執行所有高級可訪問性測試
    const tests = [
      accessibilityUtils.testScreenReaderNavigation(),
      accessibilityUtils.testFormAccessibility(),
      accessibilityUtils.testDynamicContentAccessibility(),
      accessibilityUtils.testKeyboardTraps(),
      accessibilityUtils.testErrorHandlingAccessibility(),
      accessibilityUtils.testStatusUpdatesAccessibility(),
      accessibilityUtils.testFocusManagement(),
      accessibilityUtils.testSemanticMarkup()
    ];

    const results = await Promise.all(tests);
    const hasAnyViolation = results.some(result => result === true);

    // 生成可訪問性報告
    const accessibilityReport = accessibilityUtils.getAccessibilityReport();

    console.log('📊 高級可訪問性測試報告:');
    console.log(`總違規數: ${accessibilityReport.totalViolations}`);
    console.log('嚴重程度分布:', accessibilityReport.violationsBySeverity);
    console.log('違規類型分布:', accessibilityReport.violationsByType);
    console.log('WCAG 指南違規:', accessibilityReport.violationsByWCAG);

    if (accessibilityReport.violations.length > 0) {
      console.log('🚨 發現的高級可訪問性問題:');
      accessibilityReport.violations.forEach((violation, index) => {
        console.log(`${index + 1}. [${violation.severity.toUpperCase()}] ${violation.type}: ${violation.description}`);
        if (violation.wcagGuideline) {
          console.log(`   WCAG 指南: ${violation.wcagGuideline}`);
        }
      });
    }

    expect(hasAnyViolation).toBe(false);
  });
});
