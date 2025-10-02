import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
} from 'react-native';

import { useFakeCardReporting } from '../hooks/useFakeCardReporting';
import {
  BlacklistEntry,
  BlacklistType,
  ReportSeverity,
} from '../types/reporting';

interface BlacklistManagerProps {
  onClose?: () => void;
}

export const BlacklistManager: React.FC<BlacklistManagerProps> = ({
  onClose,
}) => {
  const {
    blacklist,
    blacklistUser,
    isLoading,
    getActiveBlacklistEntries,
    getBlacklistEntriesByUser,
    getActiveBlacklistEntriesCount,
  } = useFakeCardReporting();

  const [showAddModal, setShowAddModal] = useState(false);
  const [filterType, setFilterType] = useState<BlacklistType | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const [newEntry, setNewEntry] = useState({
    type: BlacklistType.USER,
    targetId: '',
    targetValue: '',
    reason: '',
    severity: ReportSeverity.MEDIUM,
    isActive: true,
    expiresAt: undefined as Date | undefined,
  });

  const _handleAddEntry = async () => {
    if (!newEntry.targetId.trim()) {
      Alert.alert('Error', '請輸入目標ID');
      return;
    }

    if (!newEntry.reason.trim()) {
      Alert.alert('Error', '請輸入加入黑名單的原因');
      return;
    }

    try {
      const _result = await blacklistUser({
        ...newEntry,
        createdBy: 'current_user_id', // 應該從Authenticate系統Get
      });

      if (result.meta.requestStatus === 'fulfilled') {
        Alert.alert('Success', '已添加到黑名單');
        setShowAddModal(false);
        setNewEntry({
          type: BlacklistType.USER,
          targetId: '',
          targetValue: '',
          reason: '',
          severity: ReportSeverity.MEDIUM,
          isActive: true,
          expiresAt: undefined,
        });
      } else {
        Alert.alert('Error', '添加Failed，請重試');
      }
    } catch (error) {
      Alert.alert('Error', '添加Failed，請重試');
    }
  };

  const _getTypeText = (type: BlacklistType) => {
    switch (type) {
      case BlacklistType.USER:
        return '用戶';
      case BlacklistType.SELLER:
        return '賣家';
      case BlacklistType.BUYER:
        return '買家';
      case BlacklistType.IP_ADDRESS:
        return 'IP地址';
      case BlacklistType.DEVICE:
        return '設備';
      default:
        return '未知';
    }
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

  const _formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const _filteredEntries = blacklist.filter(entry => {
    const _matchesType = filterType === 'ALL' || entry.type === filterType;
    const _matchesSearch =
      entry.targetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.reason.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const _activeEntries = getActiveBlacklistEntries();
  const _activeCount = getActiveBlacklistEntriesCount();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>黑名單管理</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name='close' size={24} color='#666' />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{blacklist.length}</Text>
          <Text style={styles.statLabel}>總條目</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{activeCount}</Text>
          <Text style={styles.statLabel}>活躍條目</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {blacklist.length - activeCount}
          </Text>
          <Text style={styles.statLabel}>已移除</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name='add' size={20} color='#fff' />
          <Text style={styles.addButtonText}>添加黑名單</Text>
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <Ionicons name='search' size={16} color='#666' />
          <TextInput
            style={styles.searchInput}
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder='搜索黑名單條目...'
          />
        </View>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['ALL', ...Object.values(BlacklistType)].map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterButton,
                filterType === type && styles.activeFilterButton,
              ]}
              onPress={() => setFilterType(type as any)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filterType === type && styles.activeFilterButtonText,
                ]}
              >
                {type === 'ALL' ? '全部' : getTypeText(type as BlacklistType)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.listContainer}>
        {filteredEntries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name='shield-checkmark' size={48} color='#ccc' />
            <Text style={styles.emptyText}>暫無黑名單條目</Text>
          </View>
        ) : (
          filteredEntries.map(entry => (
            <View key={entry.id} style={styles.entryItem}>
              <View style={styles.entryHeader}>
                <View style={styles.entryInfo}>
                  <Text style={styles.entryId}>{entry.targetId}</Text>
                  <View style={styles.entryBadges}>
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeBadgeText}>
                        {getTypeText(entry.type)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.severityBadge,
                        { backgroundColor: getSeverityColor(entry.severity) },
                      ]}
                    >
                      <Text style={styles.severityBadgeText}>
                        {entry.severity === ReportSeverity.LOW && '低'}
                        {entry.severity === ReportSeverity.MEDIUM && '中'}
                        {entry.severity === ReportSeverity.HIGH && '高'}
                        {entry.severity === ReportSeverity.CRITICAL && '嚴重'}
                      </Text>
                    </View>
                    {!entry.isActive && (
                      <View style={styles.inactiveBadge}>
                        <Text style={styles.inactiveBadgeText}>已移除</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Ionicons
                  name={entry.isActive ? 'shield' : 'shield-checkmark'}
                  size={20}
                  color={entry.isActive ? '#F44336' : '#4CAF50'}
                />
              </View>

              <Text style={styles.entryReason}>{entry.reason}</Text>

              <View style={styles.entryMetadata}>
                <View style={styles.metadataItem}>
                  <Ionicons name='time-outline' size={14} color='#666' />
                  <Text style={styles.metadataText}>
                    創建: {formatDate(entry.createdAt)}
                  </Text>
                </View>

                {entry.expiresAt && (
                  <View style={styles.metadataItem}>
                    <Ionicons name='calendar-outline' size={14} color='#666' />
                    <Text style={styles.metadataText}>
                      到期: {formatDate(entry.expiresAt)}
                    </Text>
                  </View>
                )}

                {entry.removedAt && (
                  <View style={styles.metadataItem}>
                    <Ionicons
                      name='checkmark-circle'
                      size={14}
                      color='#4CAF50'
                    />
                    <Text style={styles.metadataText}>
                      移除: {formatDate(entry.removedAt)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add黑名單模態框 */}
      <Modal
        visible={showAddModal}
        animationType='slide'
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>添加黑名單條目</Text>
              <TouchableOpacity
                onPress={() => setShowAddModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name='close' size={24} color='#666' />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>類型</Text>
                <View style={styles.optionsContainer}>
                  {Object.values(BlacklistType).map(type => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.optionButton,
                        newEntry.type === type && styles.selectedOption,
                      ]}
                      onPress={() => setNewEntry({ ...newEntry, type })}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          newEntry.type === type && styles.selectedOptionText,
                        ]}
                      >
                        {getTypeText(type)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>目標ID *</Text>
                <TextInput
                  style={styles.input}
                  value={newEntry.targetId}
                  onChangeText={text =>
                    setNewEntry({ ...newEntry, targetId: text })
                  }
                  placeholder='輸入目標ID'
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>目標值</Text>
                <TextInput
                  style={styles.input}
                  value={newEntry.targetValue}
                  onChangeText={text =>
                    setNewEntry({ ...newEntry, targetValue: text })
                  }
                  placeholder='輸入目標值（可選）'
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>原因 *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={newEntry.reason}
                  onChangeText={text =>
                    setNewEntry({ ...newEntry, reason: text })
                  }
                  placeholder='輸入加入黑名單的原因'
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>嚴重程度</Text>
                <View style={styles.optionsContainer}>
                  {Object.values(ReportSeverity).map(severity => (
                    <TouchableOpacity
                      key={severity}
                      style={[
                        styles.optionButton,
                        styles.severityButton,
                        newEntry.severity === severity && {
                          backgroundColor: getSeverityColor(severity),
                        },
                      ]}
                      onPress={() => setNewEntry({ ...newEntry, severity })}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          newEntry.severity === severity &&
                            styles.selectedOptionText,
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
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleAddEntry}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Text style={styles.confirmButtonText}>添加中...</Text>
                ) : (
                  <Text style={styles.confirmButtonText}>添加</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  controls: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filterContainer: {
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    marginHorizontal: 4,
  },
  activeFilterButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#333',
  },
  activeFilterButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  entryItem: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  entryInfo: {
    flex: 1,
  },
  entryId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  entryBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  typeBadgeText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '500',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  inactiveBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  inactiveBadgeText: {
    color: '#999',
    fontSize: 12,
    fontWeight: '500',
  },
  entryReason: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  entryMetadata: {
    marginTop: 8,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metadataText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
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
    height: 80,
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
  optionText: {
    fontSize: 14,
    color: '#333',
  },
  selectedOptionText: {
    color: '#fff',
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  modalButton: {
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
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
