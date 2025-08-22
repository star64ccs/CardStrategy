import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

interface AnalysisResult {
  id: string;
  type: string;
  title: string;
  description: string;
  confidence: number;
  timestamp: Date;
}

const AIAnalysis: React.FC = () => {
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const performAnalysis = async () => {
    setIsAnalyzing(true);

    try {
      // 模擬AI分析
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const newResults: AnalysisResult[] = [
        {
          id: Date.now().toString(),
          type: 'market',
          title: '市場趨勢分析',
          description: '根據當前數據分析，市場呈現上升趨勢',
          confidence: 85,
          timestamp: new Date(),
        },
        {
          id: (Date.now() + 1).toString(),
          type: 'risk',
          title: '風險評估',
          description: '檢測到中等風險水平，建議謹慎投資',
          confidence: 78,
          timestamp: new Date(),
        },
      ];

      setAnalysisResults((prev) => [...newResults, ...prev]);
    } catch (error) {
      console.error('分析錯誤:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return '#34C759';
    if (confidence >= 60) return '#FF9500';
    return '#FF3B30';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI分析</Text>
        <TouchableOpacity
          style={[styles.analyzeButton, isAnalyzing && styles.analyzingButton]}
          onPress={performAnalysis}
          disabled={isAnalyzing}
        >
          <Text style={styles.analyzeButtonText}>
            {isAnalyzing ? '分析中...' : '開始分析'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.resultsContainer}>
        {analysisResults.map((result) => (
          <View key={result.id} style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>{result.title}</Text>
              <View
                style={[
                  styles.confidenceBadge,
                  { backgroundColor: getConfidenceColor(result.confidence) },
                ]}
              >
                <Text style={styles.confidenceText}>{result.confidence}%</Text>
              </View>
            </View>
            <Text style={styles.resultDescription}>{result.description}</Text>
            <Text style={styles.resultTimestamp}>
              {result.timestamp.toLocaleString()}
            </Text>
          </View>
        ))}

        {analysisResults.length === 0 && !isAnalyzing && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>暫無分析結果</Text>
            <Text style={styles.emptySubtext}>點擊"開始分析"開始AI分析</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  analyzeButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  analyzingButton: {
    backgroundColor: '#8E8E93',
  },
  analyzeButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
    padding: 16,
  },
  resultCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  resultDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  resultTimestamp: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
});

export default AIAnalysis;
