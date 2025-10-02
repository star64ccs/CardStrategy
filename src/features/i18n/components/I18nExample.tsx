import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  useFormatting,
  useI18n,
  useI18nStats,
  useLanguage,
} from '../hooks/useI18n';
import { i18nService } from '../services/i18nService';

const I18nExample: React.FC = () => {
  const {
    currentLanguage,
    availableLanguages,
    isInitialized,
    isLoading,
    error,
    changeLanguage,
    translate,
    getStats,
  } = useI18n();

  const { currentLanguageInfo, isRTL } = useLanguage();
  const { formatNumber, formatCurrency, formatDate, formatRelativeTime } =
    useFormatting();
  const { getMissingTranslations } = useI18nStats();

  const [stats, setStats] = useState<any>(null);
  const [missingTranslations, setMissingTranslations] = useState<any[]>([]);
  const [testKey, setTestKey] = useState('common.loading');
  const [testValue, setTestValue] = useState('1000.50');

  // Initialize
  useEffect(() => {
    const _initializeI18n = async () => {
      if (!isInitialized) {
        await i18nService.initialize();
      }
    };
    initializeI18n();
  }, [isInitialized]);

  // LoadStatisticsInformation
  const _loadStats = async () => {
    try {
      const _statsData = await getStats();
      setStats(statsData);
    } catch (error) {
      Alert.alert('Error', '無法載入統計信息');
    }
  };

  // Load缺失翻譯
  const _loadMissingTranslations = async () => {
    const _missing = await getMissingTranslations();
    setMissingTranslations(missing);
  };

  // SwitchLanguage
  const _handleLanguageChange = async (language: string) => {
    try {
      await changeLanguage(language);
      Alert.alert('Success', `語言已切換為 ${availableLanguages[language]?.name}`);
    } catch (error) {
      Alert.alert('Error', '無法切換語言');
    }
  };

  // Test翻譯
  const _testTranslation = () => {
    const _translated = translate(testKey);
    Alert.alert('翻譯結果', `${testKey}: ${translated}`);
  };

  // FormatTest
  const _testFormatting = () => {
    const _number = parseFloat(testValue) || 1000.5;
    const _now = new Date();
    const _yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const _results = {
      number: formatNumber(number),
      currency: formatCurrency(number, 'USD'),
      date: formatDate(now),
      relativeTime: formatRelativeTime(yesterday),
    };

    Alert.alert(
      '格式化結果',
      `數字: ${results.number}\n貨幣: ${results.currency}\n日期: ${results.date}\n相對時間: ${results.relativeTime}`
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#007AFF' />
        <Text style={styles.loadingText}>載入中...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>錯誤: {error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌍 多語言支持示例</Text>

        {/* 當前LanguageInformation */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>當前語言</Text>
          <Text style={styles.infoText}>
            語言: {currentLanguageInfo?.name} ({currentLanguageInfo?.nativeName}
            )
          </Text>
          <Text style={styles.infoText}>代碼: {currentLanguage}</Text>
          <Text style={styles.infoText}>方向: {isRTL ? 'RTL' : 'LTR'}</Text>
          <Text style={styles.infoText}>
            支持語言數: {Object.keys(availableLanguages).length}
          </Text>
          <Text style={styles.infoText}>
            初始化狀態: {isInitialized ? '✅ 已初始化' : '❌ 未初始化'}
          </Text>
        </View>

        {/* LanguageSwitch */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>語言切換</Text>
          <View style={styles.languageGrid}>
            {Object.entries(availableLanguages).map(([code, info]) => (
              <TouchableOpacity
                key={code}
                style={[
                  styles.languageButton,
                  currentLanguage === code && styles.activeLanguageButton,
                ]}
                onPress={() => handleLanguageChange(code)}
              >
                <Text style={styles.languageFlag}>{info.flag}</Text>
                <Text
                  style={[
                    styles.languageName,
                    currentLanguage === code && styles.activeLanguageName,
                  ]}
                >
                  {info.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 翻譯Test */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>翻譯測試</Text>
          <TextInput
            style={styles.input}
            value={testKey}
            onChangeText={setTestKey}
            placeholder='輸入翻譯鍵'
          />
          <TouchableOpacity style={styles.button} onPress={testTranslation}>
            <Text style={styles.buttonText}>測試翻譯</Text>
          </TouchableOpacity>
          <Text style={styles.resultText}>結果: {translate(testKey)}</Text>
        </View>

        {/* FormatTest */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>格式化測試</Text>
          <TextInput
            style={styles.input}
            value={testValue}
            onChangeText={setTestValue}
            placeholder='輸入數值'
            keyboardType='numeric'
          />
          <TouchableOpacity style={styles.button} onPress={testFormatting}>
            <Text style={styles.buttonText}>測試格式化</Text>
          </TouchableOpacity>
        </View>

        {/* StatisticsInformation */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>統計信息</Text>
          <TouchableOpacity style={styles.button} onPress={loadStats}>
            <Text style={styles.buttonText}>載入統計</Text>
          </TouchableOpacity>
          {stats && (
            <View style={styles.statsContainer}>
              <Text style={styles.statsText}>總鍵數: {stats.totalKeys}</Text>
              <Text style={styles.statsText}>
                已翻譯: {stats.translatedKeys}
              </Text>
              <Text style={styles.statsText}>缺失: {stats.missingKeys}</Text>
              <Text style={styles.statsText}>
                完成率: {stats.completionRate.toFixed(1)}%
              </Text>
            </View>
          )}
        </View>

        {/* 缺失翻譯 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>缺失翻譯</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={loadMissingTranslations}
          >
            <Text style={styles.buttonText}>檢查缺失翻譯</Text>
          </TouchableOpacity>
          {missingTranslations.length > 0 && (
            <View style={styles.missingContainer}>
              <Text style={styles.missingTitle}>
                缺失的翻譯 ({missingTranslations.length}):
              </Text>
              {missingTranslations.slice(0, 5).map((item, index) => (
                <Text key={index} style={styles.missingItem}>
                  {item.namespace}:{item.key} ({item.language})
                </Text>
              ))}
              {missingTranslations.length > 5 && (
                <Text style={styles.missingMore}>
                  ... 還有 {missingTranslations.length - 5} 個
                </Text>
              )}
            </View>
          )}
        </View>

        {/* 示例翻譯 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>示例翻譯</Text>
          <Text style={styles.exampleText}>
            {translate('app.name')}: {translate('app.slogan')}
          </Text>
          <Text style={styles.exampleText}>
            {translate('common.loading')} | {translate('common.success')} |{' '}
            {translate('common.error')}
          </Text>
          <Text style={styles.exampleText}>
            {translate('navigation.home')} |{' '}
            {translate('navigation.collection')} |{' '}
            {translate('navigation.market')}
          </Text>
          <Text style={styles.exampleText}>
            {translate('auth.login')} | {translate('auth.register')} |{' '}
            {translate('auth.logout')}
          </Text>
        </View>

        {/* Format示例 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>格式化示例</Text>
          <Text style={styles.exampleText}>
            數字: {formatNumber(1234567.89)}
          </Text>
          <Text style={styles.exampleText}>
            貨幣: {formatCurrency(1234567.89, 'USD')}
          </Text>
          <Text style={styles.exampleText}>日期: {formatDate(new Date())}</Text>
          <Text style={styles.exampleText}>
            相對時間:{' '}
            {formatRelativeTime(new Date(Date.now() - 2 * 60 * 60 * 1000))}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    textAlign: 'center',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  languageButton: {
    width: '30%',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  activeLanguageButton: {
    backgroundColor: '#007AFF',
  },
  languageFlag: {
    fontSize: 24,
    marginBottom: 4,
  },
  languageName: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  activeLanguageName: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  statsContainer: {
    marginTop: 12,
  },
  statsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  missingContainer: {
    marginTop: 12,
  },
  missingTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  missingItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    fontFamily: 'monospace',
  },
  missingMore: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  exampleText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default I18nExample;
