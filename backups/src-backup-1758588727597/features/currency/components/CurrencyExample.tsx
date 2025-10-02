import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';

import {
  useCurrency,
  useCurrencyManagement,
  useCurrencyConversion,
  useCurrencyFormatting,
  useCurrencyStats,
  useCurrencyTools,
} from '../hooks/useCurrency';
import { currencyService } from '../services/currencyService';
import type { CurrencyConversionRequest } from '../types/currency';

const CurrencyExample: React.FC = () => {
  // 使用各種 Hooks
  const {
    currentCurrency,
    availableCurrencies,
    convertCurrency,
    formatCurrency,
    changeCurrency,
    isLoading,
    error,
    stats,
  } = useCurrency();
  const { updateRates, getRate, getStats } = useCurrencyManagement();
  const {
    convert,
    quickConvert,
    estimateConversion,
    conversionHistory,
    recentConversions,
  } = useCurrencyConversion();
  const {
    formatCurrency: format,
    parseCurrency,
    getCurrencySymbol,
    getCurrencyName,
  } = useCurrencyFormatting();
  const {
    getServiceStats,
    calculateConversionStats,
    getMostUsedCurrencies,
    getConversionTrend,
  } = useCurrencyStats();
  const {
    validateCurrencyCode,
    isCurrencySupported,
    calculateConversionFee,
    roundCurrency,
  } = useCurrencyTools();

  // 本地狀態
  const [conversionAmount, setConversionAmount] = useState('100');
  const [fromCurrency, setFromCurrency] = useState('TWD');
  const [toCurrency, setToCurrency] = useState('USD');
  const [includeFees, setIncludeFees] = useState(false);
  const [applyMarkup, setApplyMarkup] = useState(false);
  const [testAmount, setTestAmount] = useState('1000.50');
  const [testCurrency, setTestCurrency] = useState('TWD');
  const [serviceStats, setServiceStats] = useState<any>(null);
  const [conversionStats, setConversionStats] = useState<any>(null);
  const [mostUsedCurrencies, setMostUsedCurrencies] = useState<any[]>([]);
  const [conversionTrend, setConversionTrend] = useState<any[]>([]);

  // 初始化
  useEffect(() => {
    loadStats();
  }, []);

  const _loadStats = async () => {
    try {
      const _stats = getServiceStats();
      setServiceStats(stats);

      const _convStats = calculateConversionStats;
      setConversionStats(convStats);

      const _mostUsed = getMostUsedCurrencies();
      setMostUsedCurrencies(mostUsed);

      const _trend = getConversionTrend(7);
      setConversionTrend(trend);
    } catch (error) {
      console.error('載入統計失敗:', error);
    }
  };

  const _handleCurrencyChange = async (currency: string) => {
    try {
      await changeCurrency(currency);
      Alert.alert('成功', `貨幣已更改為 ${getCurrencyName(currency)}`);
    } catch (error) {
      Alert.alert('錯誤', `更改貨幣失敗: ${error}`);
    }
  };

  const _handleConversion = async () => {
    try {
      const _amount = parseFloat(conversionAmount);
      if (isNaN(amount) || amount <= 0) {
        Alert.alert('錯誤', '請輸入有效的金額');
        return;
      }

      const request: CurrencyConversionRequest = {
        fromCurrency,
        toCurrency,
        amount,
        includeFees,
        applyMarkup,
      };

      const _result = await convertCurrency(request);
      if (result.success && result.conversion) {
        const _conv = result.conversion;
        Alert.alert(
          '轉換成功',
          `${conv.amount} ${conv.fromCurrency} = ${conv.convertedAmount} ${conv.toCurrency}\n匯率: ${conv.rate}\n手續費: ${conv.fees || 0}\n加價: ${conv.markup || 0}`
        );
      } else {
        Alert.alert('錯誤', result.error || '轉換失敗');
      }
    } catch (error) {
      Alert.alert('錯誤', `轉換失敗: ${error}`);
    }
  };

  const _handleQuickConvert = async () => {
    try {
      const _amount = parseFloat(conversionAmount);
      const _result = await quickConvert(
        amount,
        fromCurrency,
        toCurrency,
        includeFees
      );
      if (result.success && result.conversion) {
        const _conv = result.conversion;
        Alert.alert(
          '快速轉換成功',
          `${conv.amount} ${conv.fromCurrency} = ${conv.convertedAmount} ${conv.toCurrency}`
        );
      }
    } catch (error) {
      Alert.alert('錯誤', `快速轉換失敗: ${error}`);
    }
  };

  const _handleUpdateRates = async () => {
    try {
      await updateRates();
      Alert.alert('成功', '匯率已更新');
    } catch (error) {
      Alert.alert('錯誤', `更新匯率失敗: ${error}`);
    }
  };

  const _handleGetRate = async () => {
    try {
      const _result = await getRate(fromCurrency, toCurrency, true);
      if (result.success && result.rate) {
        Alert.alert(
          '匯率信息',
          `${result.rate.fromCurrency} -> ${result.rate.toCurrency}\n匯率: ${result.rate.rate}\n來源: ${result.rate.source}\n更新時間: ${result.rate.lastUpdated.toLocaleString()}`
        );
      }
    } catch (error) {
      Alert.alert('錯誤', `獲取匯率失敗: ${error}`);
    }
  };

  const _testFormatting = () => {
    try {
      const _amount = parseFloat(testAmount);
      const _formatted = format(amount, testCurrency);
      const _parsed = parseCurrency(formatted, testCurrency);
      const _symbol = getCurrencySymbol(testCurrency);
      const _name = getCurrencyName(testCurrency);

      Alert.alert(
        '格式化測試',
        `原始金額: ${amount}\n格式化: ${formatted}\n解析: ${parsed}\n符號: ${symbol}\n名稱: ${name}`
      );
    } catch (error) {
      Alert.alert('錯誤', `格式化測試失敗: ${error}`);
    }
  };

  const _testTools = () => {
    const _isValid = validateCurrencyCode(testCurrency);
    const _isSupported = isCurrencySupported(testCurrency);
    const _fee = calculateConversionFee(100, 1.5);
    const _rounded = roundCurrency(123.456, testCurrency, 'round');

    Alert.alert(
      '工具測試',
      `貨幣代碼有效: ${isValid}\n貨幣支持: ${isSupported}\n手續費 (100): ${fee}\n四捨五入 (123.456): ${rounded}`
    );
  };

  const _estimateConversionTest = () => {
    try {
      const _amount = parseFloat(conversionAmount);
      const _estimated = estimateConversion(amount, fromCurrency, toCurrency);
      Alert.alert(
        '估算轉換',
        `${amount} ${fromCurrency} ≈ ${estimated} ${toCurrency}`
      );
    } catch (error) {
      Alert.alert('錯誤', `估算失敗: ${error}`);
    }
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
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => window.location.reload()}
        >
          <Text style={styles.retryButtonText}>重試</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💰 多幣種支持示例</Text>

        {/* 當前貨幣信息 */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>當前貨幣</Text>
          <Text style={styles.infoText}>代碼: {currentCurrency}</Text>
          <Text style={styles.infoText}>
            名稱: {getCurrencyName(currentCurrency)}
          </Text>
          <Text style={styles.infoText}>
            符號: {getCurrencySymbol(currentCurrency)}
          </Text>
          <Text style={styles.infoText}>
            格式化示例: {formatCurrency(1234.56)}
          </Text>
        </View>

        {/* 貨幣切換 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>貨幣切換</Text>
          <View style={styles.currencyGrid}>
            {Object.keys(availableCurrencies).map(currency => (
              <TouchableOpacity
                key={currency}
                style={[
                  styles.currencyButton,
                  currentCurrency === currency && styles.selectedCurrencyButton,
                ]}
                onPress={() => handleCurrencyChange(currency)}
              >
                <Text
                  style={[
                    styles.currencyButtonText,
                    currentCurrency === currency &&
                      styles.selectedCurrencyButtonText,
                  ]}
                >
                  {currency}
                </Text>
                <Text
                  style={[
                    styles.currencyButtonSubtext,
                    currentCurrency === currency &&
                      styles.selectedCurrencyButtonText,
                  ]}
                >
                  {getCurrencySymbol(currency)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 貨幣轉換 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>貨幣轉換</Text>

          <View style={styles.inputRow}>
            <Text style={styles.label}>金額:</Text>
            <TextInput
              style={styles.input}
              value={conversionAmount}
              onChangeText={setConversionAmount}
              keyboardType='numeric'
              placeholder='輸入金額'
            />
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.label}>從:</Text>
            <View style={styles.pickerContainer}>
              {Object.keys(availableCurrencies).map(currency => (
                <TouchableOpacity
                  key={currency}
                  style={[
                    styles.pickerOption,
                    fromCurrency === currency && styles.selectedPickerOption,
                  ]}
                  onPress={() => setFromCurrency(currency)}
                >
                  <Text
                    style={[
                      styles.pickerOptionText,
                      fromCurrency === currency &&
                        styles.selectedPickerOptionText,
                    ]}
                  >
                    {currency}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.label}>到:</Text>
            <View style={styles.pickerContainer}>
              {Object.keys(availableCurrencies).map(currency => (
                <TouchableOpacity
                  key={currency}
                  style={[
                    styles.pickerOption,
                    toCurrency === currency && styles.selectedPickerOption,
                  ]}
                  onPress={() => setToCurrency(currency)}
                >
                  <Text
                    style={[
                      styles.pickerOptionText,
                      toCurrency === currency &&
                        styles.selectedPickerOptionText,
                    ]}
                  >
                    {currency}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.label}>包含手續費:</Text>
            <Switch value={includeFees} onValueChange={setIncludeFees} />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.label}>應用加價:</Text>
            <Switch value={applyMarkup} onValueChange={setApplyMarkup} />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.button} onPress={handleConversion}>
              <Text style={styles.buttonText}>轉換</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={handleQuickConvert}
            >
              <Text style={styles.buttonText}>快速轉換</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={estimateConversionTest}
            >
              <Text style={styles.buttonText}>估算</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 匯率管理 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>匯率管理</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.button} onPress={handleUpdateRates}>
              <Text style={styles.buttonText}>更新匯率</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleGetRate}>
              <Text style={styles.buttonText}>獲取匯率</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 格式化測試 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>格式化測試</Text>

          <View style={styles.inputRow}>
            <Text style={styles.label}>金額:</Text>
            <TextInput
              style={styles.input}
              value={testAmount}
              onChangeText={setTestAmount}
              keyboardType='numeric'
              placeholder='輸入測試金額'
            />
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.label}>貨幣:</Text>
            <View style={styles.pickerContainer}>
              {Object.keys(availableCurrencies)
                .slice(0, 5)
                .map(currency => (
                  <TouchableOpacity
                    key={currency}
                    style={[
                      styles.pickerOption,
                      testCurrency === currency && styles.selectedPickerOption,
                    ]}
                    onPress={() => setTestCurrency(currency)}
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        testCurrency === currency &&
                          styles.selectedPickerOptionText,
                      ]}
                    >
                      {currency}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.button} onPress={testFormatting}>
              <Text style={styles.buttonText}>測試格式化</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={testTools}>
              <Text style={styles.buttonText}>測試工具</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 統計信息 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>統計信息</Text>

          {serviceStats && (
            <View style={styles.statsContainer}>
              <Text style={styles.statsTitle}>服務統計</Text>
              <Text style={styles.statsText}>
                總轉換次數: {serviceStats.totalConversions}
              </Text>
              <Text style={styles.statsText}>
                最常用貨幣: {serviceStats.mostUsedCurrency}
              </Text>
              <Text style={styles.statsText}>
                平均轉換金額: {serviceStats.averageConversionAmount.toFixed(2)}
              </Text>
              <Text style={styles.statsText}>
                轉換準確率: {(serviceStats.conversionAccuracy * 100).toFixed(1)}
                %
              </Text>
              <Text style={styles.statsText}>
                API 響應時間: {serviceStats.apiResponseTime.toFixed(0)}ms
              </Text>
              <Text style={styles.statsText}>
                緩存命中率: {(serviceStats.cacheHitRate * 100).toFixed(1)}%
              </Text>
            </View>
          )}

          {conversionStats && (
            <View style={styles.statsContainer}>
              <Text style={styles.statsTitle}>轉換統計</Text>
              <Text style={styles.statsText}>
                總轉換次數: {conversionStats.totalConversions}
              </Text>
              <Text style={styles.statsText}>
                總金額: {conversionStats.totalAmount.toFixed(2)}
              </Text>
              <Text style={styles.statsText}>
                平均金額: {conversionStats.averageAmount.toFixed(2)}
              </Text>
              <Text style={styles.statsText}>
                最常用來源貨幣: {conversionStats.mostUsedFromCurrency}
              </Text>
              <Text style={styles.statsText}>
                最常用目標貨幣: {conversionStats.mostUsedToCurrency}
              </Text>
            </View>
          )}
        </View>

        {/* 最常用貨幣 */}
        {mostUsedCurrencies.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>最常用貨幣</Text>
            {mostUsedCurrencies.map((item, index) => (
              <View key={item.currency} style={styles.usageItem}>
                <Text style={styles.usageRank}>#{index + 1}</Text>
                <Text style={styles.usageCurrency}>{item.currency}</Text>
                <Text style={styles.usageCount}>{item.count} 次</Text>
              </View>
            ))}
          </View>
        )}

        {/* 轉換趨勢 */}
        {conversionTrend.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>轉換趨勢 (7天)</Text>
            {conversionTrend.map(day => (
              <View key={day.date} style={styles.trendItem}>
                <Text style={styles.trendDate}>{day.date}</Text>
                <Text style={styles.trendStats}>
                  {day.count} 次轉換, 總計 {day.total.toFixed(2)}, 平均{' '}
                  {day.average.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* 最近轉換記錄 */}
        {recentConversions.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>最近轉換記錄</Text>
            {recentConversions.slice(0, 5).map((conv, index) => (
              <View key={index} style={styles.conversionItem}>
                <Text style={styles.conversionText}>
                  {conv.amount} {conv.fromCurrency} → {conv.convertedAmount}{' '}
                  {conv.toCurrency}
                </Text>
                <Text style={styles.conversionDetails}>
                  匯率: {conv.rate} | {conv.timestamp.toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        )}
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
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  currencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  currencyButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
    minWidth: '30%',
    alignItems: 'center',
  },
  selectedCurrencyButton: {
    backgroundColor: '#007AFF',
  },
  currencyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  selectedCurrencyButtonText: {
    color: 'white',
  },
  currencyButtonSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    width: 60,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  pickerContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pickerOption: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 4,
  },
  selectedPickerOption: {
    backgroundColor: '#007AFF',
  },
  pickerOptionText: {
    fontSize: 12,
    color: '#333',
  },
  selectedPickerOptionText: {
    color: 'white',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  statsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  usageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  usageRank: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    width: 30,
  },
  usageCurrency: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  usageCount: {
    fontSize: 14,
    color: '#666',
  },
  trendItem: {
    marginBottom: 8,
  },
  trendDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  trendStats: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  conversionItem: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  conversionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  conversionDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});

export default CurrencyExample;
