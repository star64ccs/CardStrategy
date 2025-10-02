import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Switch,
} from 'react-native';

import { useFakeCardReporting } from '../hooks/useFakeCardReporting';
import type { EvidenceItem } from '../types/reporting';
import { ReportType, ReportSeverity } from '../types/reporting';

interface ReportFormProps {
  onSuccess?: (reportId: string) => void;
  onCancel?: () => void;
  initialData?: {
    reportedUserId?: string;
    cardId?: string;
  };
}

export const ReportForm: React.FC<ReportFormProps> = ({
  onSuccess,
  onCancel,
  initialData,
}) => {
  const { submitReport, isLoading, error } = useFakeCardReporting();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reportType: ReportType.FAKE_CARD,
    severity: ReportSeverity.MEDIUM,
    isAnonymous: false,
    contactInfo: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
    reportedUserId: initialData?.reportedUserId || '',
    cardId: initialData?.cardId || '',
  });

  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);

  const _handleSubmit = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', '請輸入舉報標題');
      return;
    }

    if (!formData.description.trim()) {
      Alert.alert('Error', '請輸入舉報描述');
      return;
    }

    try {
      const _result = await submitReport({
        reporterId: 'current_user_id', // 應該從Authenticate系統Get
        reportedUserId: formData.reportedUserId || undefined,
        cardId: formData.cardId || undefined,
        reportType: formData.reportType,
        severity: formData.severity,
        title: formData.title,
        description: formData.description,
        evidence,
        isAnonymous: formData.isAnonymous,
        contactInfo: formData.contactInfo || undefined,
        priority: formData.priority,
      });

      if (result.meta.requestStatus === 'fulfilled') {
        Alert.alert('Success', '舉報已提交，我們會盡快處理');
        onSuccess?.(result.payload.id);
      } else {
        Alert.alert('Error', '提交Failed，請重試');
      }
    } catch (error) {
      Alert.alert('Error', '提交Failed，請重試');
    }
  };

  const _addEvidence = () => {
    const newEvidence: EvidenceItem = {
      id: `evidence_${Date.now()}`,
      type: 'TEXT',
      content: '',
      description: '',
      timestamp: new Date(),
    };
    setEvidence([...evidence, newEvidence]);
  };

  const _updateEvidence = (
    index: number,
    field: keyof EvidenceItem,
    value: unknown
  ) => {
    const _updatedEvidence = [...evidence];
    updatedEvidence[index] = { ...updatedEvidence[index], [field]: value };
    setEvidence(updatedEvidence);
  };

  const _removeEvidence = (index: number) => {
    setEvidence(evidence.filter((_, i) => i !== index));
  };

  const _getSeverityColor = (severity: ReportSeverity) => {
    switch (severity) {
      case ReportSeverity.LOW:
        return '#4CAF50';
      case ReportSeverity.MEDIUM:
        return '#FF9800';
      case ReportSeverity.HIGH:
        return '#F44336';
      case ReportSeverity.CRITICAL:
        return '#9C27B0';
      default:
        return '#FF9800';
    }
  };

  const _getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return '#4CAF50';
      case 'MEDIUM':
        return '#FF9800';
      case 'HIGH':
        return '#F44336';
      case 'URGENT':
        return '#9C27B0';
      default:
        return '#FF9800';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>假卡舉報表單</Text>
        <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
          <Ionicons name='close' size={24} color='#666' />
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>基本信息</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>舉報標題 *</Text>
          <TextInput
            style={styles.input}
            value={formData.title}
            onChangeText={text => setFormData({ ...formData, title: text })}
            placeholder='請簡要描述舉報內容'
            maxLength={100}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>舉報描述 *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={text =>
              setFormData({ ...formData, description: text })
            }
            placeholder='請詳細描述發現的假卡情況'
            multiline
            numberOfLines={4}
            maxLength={1000}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>被舉報用戶ID</Text>
          <TextInput
            style={styles.input}
            value={formData.reportedUserId}
            onChangeText={text =>
              setFormData({ ...formData, reportedUserId: text })
            }
            placeholder='輸入被舉報用戶的ID（可選）'
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>卡牌ID</Text>
          <TextInput
            style={styles.input}
            value={formData.cardId}
            onChangeText={text => setFormData({ ...formData, cardId: text })}
            placeholder='輸入相關卡牌ID（可選）'
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>舉報類型</Text>

        <View style={styles.optionsContainer}>
          {Object.values(ReportType).map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.optionButton,
                formData.reportType === type && styles.selectedOption,
              ]}
              onPress={() => setFormData({ ...formData, reportType: type })}
            >
              <Text
                style={[
                  styles.optionText,
                  formData.reportType === type && styles.selectedOptionText,
                ]}
              >
                {type === ReportType.FAKE_CARD && '假卡'}
                {type === ReportType.COUNTERFEIT && '仿冒品'}
                {type === ReportType.REPRINT && '重印卡'}
                {type === ReportType.ALTERED && '改動卡'}
                {type === ReportType.STOLEN && '盜竊卡'}
                {type === ReportType.SCAM && '詐騙'}
                {type === ReportType.OTHER && '其他'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>嚴重程度</Text>

        <View style={styles.optionsContainer}>
          {Object.values(ReportSeverity).map(severity => (
            <TouchableOpacity
              key={severity}
              style={[
                styles.optionButton,
                styles.severityButton,
                formData.severity === severity && {
                  backgroundColor: getSeverityColor(severity),
                },
              ]}
              onPress={() => setFormData({ ...formData, severity })}
            >
              <Text
                style={[
                  styles.optionText,
                  formData.severity === severity && styles.selectedOptionText,
                ]}
              >
                {severity === ReportSeverity.LOW && '低'}
                {severity === ReportSeverity.MEDIUM && '中'}
                {severity === ReportSeverity.HIGH && '高'}
                {severity === ReportSeverity.CRITICAL && '嚴重'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>優先級</Text>

        <View style={styles.optionsContainer}>
          {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(priority => (
            <TouchableOpacity
              key={priority}
              style={[
                styles.optionButton,
                styles.priorityButton,
                formData.priority === priority && {
                  backgroundColor: getPriorityColor(priority),
                },
              ]}
              onPress={() =>
                setFormData({ ...formData, priority: priority as any })
              }
            >
              <Text
                style={[
                  styles.optionText,
                  formData.priority === priority && styles.selectedOptionText,
                ]}
              >
                {priority === 'LOW' && '低'}
                {priority === 'MEDIUM' && '中'}
                {priority === 'HIGH' && '高'}
                {priority === 'URGENT' && '緊急'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>舉報設置</Text>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>匿名舉報</Text>
          <Switch
            value={formData.isAnonymous}
            onValueChange={value =>
              setFormData({ ...formData, isAnonymous: value })
            }
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={formData.isAnonymous ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>

        {!formData.isAnonymous && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>聯繫方式</Text>
            <TextInput
              style={styles.input}
              value={formData.contactInfo}
              onChangeText={text =>
                setFormData({ ...formData, contactInfo: text })
              }
              placeholder='郵箱或電話（可選）'
            />
          </View>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>證據材料</Text>
          <TouchableOpacity onPress={addEvidence} style={styles.addButton}>
            <Ionicons name='add' size={20} color='#007AFF' />
            <Text style={styles.addButtonText}>添加證據</Text>
          </TouchableOpacity>
        </View>

        {evidence.map((item, index) => (
          <View key={item.id} style={styles.evidenceItem}>
            <View style={styles.evidenceHeader}>
              <Text style={styles.evidenceTitle}>證據 {index + 1}</Text>
              <TouchableOpacity
                onPress={() => removeEvidence(index)}
                style={styles.removeButton}
              >
                <Ionicons name='trash' size={16} color='#FF3B30' />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.input, styles.textArea]}
              value={item.content}
              onChangeText={text => updateEvidence(index, 'content', text)}
              placeholder='描述證據內容'
              multiline
              numberOfLines={3}
            />

            <TextInput
              style={styles.input}
              value={item.description}
              onChangeText={text => updateEvidence(index, 'description', text)}
              placeholder='證據說明（可選）'
            />
          </View>
        ))}

        {evidence.length === 0 && (
          <Text style={styles.emptyText}>暫無證據材料</Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
          disabled={isLoading}
        >
          <Text style={styles.cancelButtonText}>取消</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.submitButton]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <Text style={styles.submitButtonText}>提交中...</Text>
          ) : (
            <Text style={styles.submitButtonText}>提交舉報</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  errorContainer: {
    margin: 16,
    padding: 12,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    color: '#f44336',
    fontSize: 14,
  },
  section: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  selectedOption: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  severityButton: {
    minWidth: 60,
  },
  priorityButton: {
    minWidth: 60,
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
  selectedOptionText: {
    color: '#fff',
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  addButtonText: {
    color: '#007AFF',
    fontSize: 14,
    marginLeft: 4,
  },
  evidenceItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  evidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  evidenceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  removeButton: {
    padding: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    padding: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
