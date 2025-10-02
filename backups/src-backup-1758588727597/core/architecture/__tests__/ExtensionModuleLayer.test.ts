import type {
  Plugin,
  Configuration,
  Rule,
  RuleContext,
} from '../ExtensionModuleLayer';
import {
  ExtensionModuleLayer,
  PluginManager,
  ConfigurationManager,
  RuleEngine,
} from '../ExtensionModuleLayer';

// 模擬插件實現
class MockPlugin implements Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  dependencies: unknown[];
  enabled: boolean;

  constructor(id: string, name: string, version = '1.0.0') {
    this.id = id;
    this.name = name;
    this.version = version;
    this.description = 'Mock plugin for testing';
    this.author = 'Test Author';
    this.dependencies = [];
    this.enabled = false;
  }

  async load(): Promise<void> {
    this.enabled = true;
  }

  async unload(): Promise<void> {
    this.enabled = false;
  }

  async execute(data: unknown): Promise<any> {
    return { result: 'mock execution', data };
  }
}

describe('ExtensionModuleLayer', () => {
  let extensionLayer: ExtensionModuleLayer;

  beforeEach(() => {
    extensionLayer = ExtensionModuleLayer.getInstance();
  });

  afterEach(() => {
    // 重置單例實例
    (ExtensionModuleLayer as any).instance = undefined;
  });

  describe('單例模式', () => {
    it('應該返回相同的實例', () => {
      const instance1 = ExtensionModuleLayer.getInstance();
      const instance2 = ExtensionModuleLayer.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('初始化', () => {
    it('應該正確初始化所有子服務', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await extensionLayer.initialize();

      expect(extensionLayer.initialized).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        'ExtensionModuleLayer 初始化完成'
      );
      expect(consoleSpy).toHaveBeenCalledWith('PluginManager 初始化完成');
      expect(consoleSpy).toHaveBeenCalledWith(
        'ConfigurationManager 初始化完成'
      );
      expect(consoleSpy).toHaveBeenCalledWith('RuleEngine 初始化完成');

      consoleSpy.mockRestore();
    });

    it('應該避免重複初始化', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await extensionLayer.initialize();
      await extensionLayer.initialize(); // 第二次調用

      expect(consoleSpy).toHaveBeenCalledTimes(4); // 只應該調用一次初始化

      consoleSpy.mockRestore();
    });
  });

  describe('服務訪問器', () => {
    it('應該提供插件管理器訪問器', () => {
      expect(extensionLayer.pluginManager).toBeInstanceOf(PluginManager);
    });

    it('應該提供配置管理器訪問器', () => {
      expect(extensionLayer.configurationManager).toBeInstanceOf(
        ConfigurationManager
      );
    });

    it('應該提供規則引擎訪問器', () => {
      expect(extensionLayer.ruleEngine).toBeInstanceOf(RuleEngine);
    });
  });
});

describe('PluginManager', () => {
  let pluginManager: PluginManager;

  beforeEach(async () => {
    pluginManager = new PluginManager();
    await pluginManager.initialize();
  });

  describe('插件註冊', () => {
    it('應該成功註冊插件', async () => {
      const plugin = new MockPlugin('test-plugin', 'Test Plugin');
      const result = await pluginManager.registerPlugin(plugin);

      expect(result.success).toBe(true);
      expect(result.pluginId).toBe('test-plugin');
    });

    it('應該拒絕重複註冊', async () => {
      const plugin = new MockPlugin('test-plugin', 'Test Plugin');
      await pluginManager.registerPlugin(plugin);

      const duplicatePlugin = new MockPlugin('test-plugin', 'Duplicate Plugin');
      const result = await pluginManager.registerPlugin(duplicatePlugin);

      expect(result.success).toBe(false);
      expect(result.error).toContain('已存在');
    });

    it('應該處理未初始化狀態', async () => {
      const uninitializedManager = new PluginManager();
      const plugin = new MockPlugin('test-plugin', 'Test Plugin');
      const result = await uninitializedManager.registerPlugin(plugin);

      expect(result.success).toBe(false);
      expect(result.error).toContain('尚未初始化');
    });
  });

  describe('插件管理', () => {
    it('應該成功啟用插件', async () => {
      const plugin = new MockPlugin('test-plugin', 'Test Plugin');
      await pluginManager.registerPlugin(plugin);

      const result = await pluginManager.enablePlugin('test-plugin');

      expect(result.success).toBe(true);
      expect(plugin.enabled).toBe(true);
    });

    it('應該成功禁用插件', async () => {
      const plugin = new MockPlugin('test-plugin', 'Test Plugin');
      plugin.enabled = true;
      await pluginManager.registerPlugin(plugin);

      const result = await pluginManager.disablePlugin('test-plugin');

      expect(result.success).toBe(true);
      expect(plugin.enabled).toBe(false);
    });

    it('應該成功卸載插件', async () => {
      const plugin = new MockPlugin('test-plugin', 'Test Plugin');
      await pluginManager.registerPlugin(plugin);

      const result = await pluginManager.unloadPlugin('test-plugin');

      expect(result.success).toBe(true);
      expect(pluginManager.getPlugin('test-plugin')).toBeUndefined();
    });
  });

  describe('依賴管理', () => {
    it('應該檢查依賴衝突', async () => {
      const dependency = {
        pluginId: 'dependency-plugin',
        version: '1.0.0',
        required: true,
      };
      const plugin = new MockPlugin('test-plugin', 'Test Plugin');
      plugin.dependencies = [dependency];

      const result = await pluginManager.managePluginDependencies([dependency]);

      expect(result.success).toBe(false);
      expect(result.missing).toContain('dependency-plugin');
    });

    it('應該管理插件版本', async () => {
      const plugin = new MockPlugin('test-plugin', 'Test Plugin', '1.0.0');
      await pluginManager.registerPlugin(plugin);

      const result = await pluginManager.managePluginVersion(
        'test-plugin',
        '2.0.0'
      );

      expect(result.success).toBe(true);
      expect(result.previousVersion).toBe('1.0.0');
      expect(result.currentVersion).toBe('2.0.0');
    });
  });

  describe('數據檢索', () => {
    it('應該獲取所有插件', async () => {
      const plugin1 = new MockPlugin('plugin1', 'Plugin 1');
      const plugin2 = new MockPlugin('plugin2', 'Plugin 2');

      await pluginManager.registerPlugin(plugin1);
      await pluginManager.registerPlugin(plugin2);

      const plugins = pluginManager.getAllPlugins();

      expect(plugins).toHaveLength(2);
      expect(plugins.map(p => p.id)).toContain('plugin1');
      expect(plugins.map(p => p.id)).toContain('plugin2');
    });

    it('應該獲取特定插件', async () => {
      const plugin = new MockPlugin('test-plugin', 'Test Plugin');
      await pluginManager.registerPlugin(plugin);

      const retrievedPlugin = pluginManager.getPlugin('test-plugin');

      expect(retrievedPlugin).toBe(plugin);
    });
  });
});

describe('ConfigurationManager', () => {
  let configManager: ConfigurationManager;

  beforeEach(async () => {
    configManager = new ConfigurationManager();
    await configManager.initialize();
  });

  describe('配置加載', () => {
    it('應該成功加載有效配置', async () => {
      const config: Configuration = {
        id: 'test-config',
        name: 'Test Configuration',
        version: '1.0.0',
        data: { key: 'value' },
        environment: 'development',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await configManager.loadConfiguration(config);

      expect(result.success).toBe(true);
      expect(result.configuration).toBe(config);
    });

    it('應該驗證配置格式', async () => {
      const invalidConfig = {
        id: '',
        name: '',
        version: '',
        data: null,
        environment: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Configuration;

      const result = await configManager.loadConfiguration(invalidConfig);

      expect(result.success).toBe(false);
      expect(result.error).toContain('驗證失敗');
    });
  });

  describe('配置更新', () => {
    it('應該成功更新配置', async () => {
      const config: Configuration = {
        id: 'test-config',
        name: 'Test Configuration',
        version: '1.0.0',
        data: { key: 'value' },
        environment: 'development',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await configManager.loadConfiguration(config);

      const updates = [
        {
          path: 'test-config.key',
          value: 'new-value',
          operation: 'set' as const,
        },
      ];

      const result = await configManager.updateConfiguration(updates);

      expect(result.success).toBe(true);
      expect(result.updatedPaths).toContain('test-config.key');
    });
  });

  describe('配置備份和回滾', () => {
    it('應該成功創建備份', async () => {
      const config: Configuration = {
        id: 'test-config',
        name: 'Test Configuration',
        version: '1.0.0',
        data: { key: 'value' },
        environment: 'development',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await configManager.loadConfiguration(config);

      const result = await configManager.backupConfiguration();

      expect(result.success).toBe(true);
      expect(result.backupId).toBeDefined();
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('應該成功同步配置', async () => {
      const config: Configuration = {
        id: 'test-config',
        name: 'Test Configuration',
        version: '1.0.0',
        data: { key: 'value' },
        environment: 'production',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await configManager.loadConfiguration(config);

      const result = await configManager.syncConfiguration(['production']);

      expect(result.success).toBe(true);
      expect(result.syncedEnvironments).toContain('production');
    });
  });

  describe('數據檢索', () => {
    it('應該獲取所有配置', async () => {
      const config1: Configuration = {
        id: 'config1',
        name: 'Config 1',
        version: '1.0.0',
        data: { key1: 'value1' },
        environment: 'development',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const config2: Configuration = {
        id: 'config2',
        name: 'Config 2',
        version: '1.0.0',
        data: { key2: 'value2' },
        environment: 'production',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await configManager.loadConfiguration(config1);
      await configManager.loadConfiguration(config2);

      const configs = configManager.getAllConfigurations();

      expect(configs).toHaveLength(2);
      expect(configs.map(c => c.id)).toContain('config1');
      expect(configs.map(c => c.id)).toContain('config2');
    });

    it('應該獲取特定配置', async () => {
      const config: Configuration = {
        id: 'test-config',
        name: 'Test Configuration',
        version: '1.0.0',
        data: { key: 'value' },
        environment: 'development',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await configManager.loadConfiguration(config);

      const retrievedConfig = configManager.getConfiguration('test-config');

      expect(retrievedConfig).toBe(config);
    });
  });
});

describe('RuleEngine', () => {
  let ruleEngine: RuleEngine;

  beforeEach(async () => {
    ruleEngine = new RuleEngine();
    await ruleEngine.initialize();
  });

  describe('規則執行', () => {
    it('應該成功執行規則', async () => {
      const rule: Rule = {
        id: 'test-rule',
        name: 'Test Rule',
        description: 'A test rule',
        condition: 'data.value > 5',
        action: "data.status = 'processed'",
        priority: 1,
        enabled: true,
        category: 'test',
        version: '1.0.0',
      };

      const context: RuleContext = {
        data: { value: 10, status: 'pending' },
        environment: 'test',
        timestamp: new Date(),
      };

      const result = await ruleEngine.executeRules([rule], context);

      expect(result.success).toBe(true);
      expect(result.executedRules).toContain('test-rule');
    });

    it('應該評估規則', () => {
      const rule: Rule = {
        id: 'test-rule',
        name: 'Test Rule',
        description: 'A test rule',
        condition: 'data.value > 5',
        action: "data.status = 'processed'",
        priority: 1,
        enabled: true,
        category: 'test',
        version: '1.0.0',
      };

      const data = { value: 10 };

      const result = ruleEngine.evaluateRules([rule], data);

      expect(result.matchedRules).toHaveLength(1);
      expect(result.matchedRules[0].id).toBe('test-rule');
      expect(result.evaluationTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('規則管理', () => {
    it('應該成功創建規則', async () => {
      const rule: Rule = {
        id: 'new-rule',
        name: 'New Rule',
        description: 'A new rule',
        condition: "data.type === 'card'",
        action: "log('Card processed')",
        priority: 1,
        enabled: true,
        category: 'test',
        version: '1.0.0',
      };

      const result = await ruleEngine.manageRules({
        type: 'create',
        rule,
      });

      expect(result.success).toBe(true);
      expect(result.operation).toBe('create');
      expect(result.ruleId).toBe('new-rule');
    });

    it('應該成功更新規則', async () => {
      const rule: Rule = {
        id: 'test-rule',
        name: 'Test Rule',
        description: 'A test rule',
        condition: 'data.value > 5',
        action: "data.status = 'processed'",
        priority: 1,
        enabled: true,
        category: 'test',
        version: '1.0.0',
      };

      await ruleEngine.manageRules({ type: 'create', rule });

      const updatedRule = { ...rule, priority: 2 };
      const result = await ruleEngine.manageRules({
        type: 'update',
        rule: updatedRule,
      });

      expect(result.success).toBe(true);
      expect(result.operation).toBe('update');
    });

    it('應該成功啟用和禁用規則', async () => {
      const rule: Rule = {
        id: 'test-rule',
        name: 'Test Rule',
        description: 'A test rule',
        condition: 'data.value > 5',
        action: "data.status = 'processed'",
        priority: 1,
        enabled: false,
        category: 'test',
        version: '1.0.0',
      };

      await ruleEngine.manageRules({ type: 'create', rule });

      const enableResult = await ruleEngine.manageRules({
        type: 'enable',
        rule,
      });

      expect(enableResult.success).toBe(true);

      const disableResult = await ruleEngine.manageRules({
        type: 'disable',
        rule,
      });

      expect(disableResult.success).toBe(true);
    });
  });

  describe('規則衝突檢測', () => {
    it('應該檢測規則衝突', () => {
      const rule1: Rule = {
        id: 'rule1',
        name: 'Rule 1',
        description: 'First rule',
        condition: 'data.value > 5',
        action: "data.status = 'processed'",
        priority: 1,
        enabled: true,
        category: 'test',
        version: '1.0.0',
      };

      const rule2: Rule = {
        id: 'rule2',
        name: 'Rule 2',
        description: 'Second rule',
        condition: 'data.value > 5', // 相同的條件
        action: "data.status = 'processed'", // 相同的動作
        priority: 2,
        enabled: true,
        category: 'test',
        version: '1.0.0',
      };

      const result = ruleEngine.detectRuleConflicts([rule1, rule2]);

      expect(result.conflicts.length).toBeGreaterThan(0);
      expect(result.resolution).toContain('需要手動解決衝突');
    });
  });

  describe('規則優化', () => {
    it('應該優化規則', () => {
      const rule: Rule = {
        id: 'test-rule',
        name: 'Test Rule',
        description: 'A test rule',
        condition: '  data.value > 5  ', // 有額外空格
        action: "  data.status = 'processed'  ", // 有額外空格
        priority: 1,
        enabled: true,
        category: 'test',
        version: '1.0.0',
      };

      const result = ruleEngine.optimizeRules([rule]);

      expect(result.success).toBe(true);
      expect(result.optimizedRules).toHaveLength(1);
      expect(result.performanceImprovement).toBeGreaterThan(0);
    });
  });

  describe('版本控制', () => {
    it('應該控制規則版本', async () => {
      const rule: Rule = {
        id: 'test-rule',
        name: 'Test Rule',
        description: 'A test rule',
        condition: 'data.value > 5',
        action: "data.status = 'processed'",
        priority: 1,
        enabled: true,
        category: 'test',
        version: '1.0.0',
      };

      const result = await ruleEngine.versionControlRules([rule]);

      expect(result.success).toBe(true);
      expect(result.currentVersion).toMatch(/^v\d+$/);
    });
  });

  describe('數據檢索', () => {
    it('應該獲取所有規則', async () => {
      const rule1: Rule = {
        id: 'rule1',
        name: 'Rule 1',
        description: 'First rule',
        condition: 'data.value > 5',
        action: "data.status = 'processed'",
        priority: 1,
        enabled: true,
        category: 'test',
        version: '1.0.0',
      };

      const rule2: Rule = {
        id: 'rule2',
        name: 'Rule 2',
        description: 'Second rule',
        condition: "data.type === 'card'",
        action: "log('Card processed')",
        priority: 2,
        enabled: true,
        category: 'test',
        version: '1.0.0',
      };

      await ruleEngine.manageRules({ type: 'create', rule: rule1 });
      await ruleEngine.manageRules({ type: 'create', rule: rule2 });

      const rules = ruleEngine.getAllRules();

      expect(rules).toHaveLength(2);
      expect(rules.map(r => r.id)).toContain('rule1');
      expect(rules.map(r => r.id)).toContain('rule2');
    });

    it('應該按分類獲取規則', async () => {
      const rule: Rule = {
        id: 'test-rule',
        name: 'Test Rule',
        description: 'A test rule',
        condition: 'data.value > 5',
        action: "data.status = 'processed'",
        priority: 1,
        enabled: true,
        category: 'test-category',
        version: '1.0.0',
      };

      await ruleEngine.manageRules({ type: 'create', rule });

      const rules = ruleEngine.getRulesByCategory('test-category');

      expect(rules).toHaveLength(1);
      expect(rules[0].id).toBe('test-rule');
    });

    it('應該獲取特定規則', async () => {
      const rule: Rule = {
        id: 'test-rule',
        name: 'Test Rule',
        description: 'A test rule',
        condition: 'data.value > 5',
        action: "data.status = 'processed'",
        priority: 1,
        enabled: true,
        category: 'test',
        version: '1.0.0',
      };

      await ruleEngine.manageRules({ type: 'create', rule });

      const retrievedRule = ruleEngine.getRule('test-rule');

      expect(retrievedRule).toBeDefined();
      expect(retrievedRule?.id).toBe('test-rule');
    });
  });
});

describe('ExtensionModuleLayer 整合測試', () => {
  let extensionLayer: ExtensionModuleLayer;

  beforeEach(async () => {
    extensionLayer = ExtensionModuleLayer.getInstance();
    await extensionLayer.initialize();
  });

  afterEach(() => {
    (ExtensionModuleLayer as any).instance = undefined;
  });

  it('應該提供完整的工作流程', async () => {
    // 1. 註冊插件
    const plugin = new MockPlugin('test-plugin', 'Test Plugin');
    const pluginResult =
      await extensionLayer.pluginManager.registerPlugin(plugin);
    expect(pluginResult.success).toBe(true);

    // 2. 加載配置
    const config: Configuration = {
      id: 'test-config',
      name: 'Test Configuration',
      version: '1.0.0',
      data: { key: 'value' },
      environment: 'development',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const configResult =
      await extensionLayer.configurationManager.loadConfiguration(config);
    expect(configResult.success).toBe(true);

    // 3. 創建規則
    const rule: Rule = {
      id: 'test-rule',
      name: 'Test Rule',
      description: 'A test rule',
      condition: 'data.value > 5',
      action: "data.status = 'processed'",
      priority: 1,
      enabled: true,
      category: 'test',
      version: '1.0.0',
    };
    const ruleResult = await extensionLayer.ruleEngine.manageRules({
      type: 'create',
      rule,
    });
    expect(ruleResult.success).toBe(true);

    // 4. 執行規則
    const context: RuleContext = {
      data: { value: 10, status: 'pending' },
      environment: 'test',
      timestamp: new Date(),
    };
    const executionResult = await extensionLayer.ruleEngine.executeRules(
      [rule],
      context
    );
    expect(executionResult.success).toBe(true);

    // 5. 驗證所有服務都正常工作
    expect(extensionLayer.pluginManager.getAllPlugins()).toHaveLength(1);
    expect(
      extensionLayer.configurationManager.getAllConfigurations()
    ).toHaveLength(1);
    expect(extensionLayer.ruleEngine.getAllRules()).toHaveLength(1);
  });

  it('應該處理錯誤情況', async () => {
    // 測試未初始化的服務
    const uninitializedLayer = new (ExtensionModuleLayer as any)();

    const plugin = new MockPlugin('test-plugin', 'Test Plugin');
    const pluginResult =
      await uninitializedLayer.pluginManager.registerPlugin(plugin);
    expect(pluginResult.success).toBe(false);
    expect(pluginResult.error).toContain('尚未初始化');
  });
});
