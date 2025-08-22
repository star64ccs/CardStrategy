import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { Card } from '@/components/common/Card';
import { LazyImage } from '@/components/common/LazyImage';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { theme } from '@/config/theme';
import { ScanHistoryItem } from '@/services/scanHistoryService';
import {
  updateScanRecord,
  deleteScanRecord,
  toggleFavorite,
  addNote,
  addTags,
} from '@/store/slices/scanHistorySlice';
import { formatDate, formatTime, formatCurrency } from '@/utils/formatters';
import { logger } from '@/utils/logger';

const { width } = Dimensions.get('window');

interface ScanHistoryDetailProps {
  record: ScanHistoryItem;
  onClose?: () => void;
  onEdit?: (record: ScanHistoryItem) => void;
}

export const ScanHistoryDetail: React.FC<ScanHistoryDetailProps> = ({
  record,
  onClose,
  onEdit,
}) => {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [note, setNote] = useState(record.notes || '');
  const [newTag, setNewTag] = useState('');

  const handleDelete = () => {
    Alert.alert('確認刪除', '確定要刪除這條掃描記錄嗎？此操作無法撤銷。', [
      { text: '取消', style: 'cancel' },
      {
        text: '刪除',
        style: 'destructive',
        onPress: () => {
          dispatch(deleteScanRecord(record.id));
          onClose?.();
        },
      },
    ]);
  };

  const handleShare = async () => {
    try {
      const shareContent = {
        title: `掃描記錄 - ${record.cardName || '未知卡片'}`,
        message: `掃描類型: ${getScanTypeLabel(record.scanType)}\n掃描時間: ${formatDate(record.scanDate)}\n信心度: ${Math.round((record.scanResult.confidence || 0) * 100)}%\n處理時間: ${record.processingTime.toFixed(1)}秒`,
        url: record.imageUri,
      };

      await Share.share(shareContent);
    } catch (error) {
      logger.error('分享失敗:', { error });
    }
  };

  const handleToggleFavorite = () => {
    dispatch(toggleFavorite(record.id));
  };

  const handleSaveNote = () => {
    if (note.trim() !== record.notes) {
      dispatch(addNote({ recordId: record.id, note: note.trim() }));
    }
    setIsEditing(false);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !record.tags.includes(newTag.trim())) {
      dispatch(
        addTags({ recordId: record.id, tags: [...record.tags, newTag.trim()] })
      );
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = record.tags.filter((tag) => tag !== tagToRemove);
    dispatch(addTags({ recordId: record.id, tags: updatedTags }));
  };

  const getScanTypeIcon = (scanType: string) => {
    const icons = {
      recognition: 'eye',
      condition: 'analytics',
      authenticity: 'shield-checkmark',
      batch: 'layers',
    };
    return icons[scanType as keyof typeof icons] || 'scan';
  };

  const getScanTypeColor = (scanType: string) => {
    const colors = {
      recognition: theme.colors.primary,
      condition: theme.colors.warning,
      authenticity: theme.colors.success,
      batch: theme.colors.info,
    };
    return (
      colors[scanType as keyof typeof colors] || theme.colors.textSecondary
    );
  };

  const getScanTypeLabel = (scanType: string) => {
    const labels = {
      recognition: '卡片識別',
      condition: '條件分析',
      authenticity: '真偽驗證',
      batch: '批量掃描',
    };
    return labels[scanType as keyof typeof labels] || scanType;
  };

  const renderScanResult = () => {
    if (!record.scanResult.success) {
      return (
        <View style={styles.errorSection}>
          <Ionicons name="alert-circle" size={24} color={theme.colors.error} />
          <Text style={styles.errorText}>掃描失敗</Text>
          <Text style={styles.errorDetails}>{record.scanResult.error}</Text>
        </View>
      );
    }

    return (
      <View style={styles.resultSection}>
        <Text style={styles.sectionTitle}>掃描結果</Text>

        {record.scanResult.recognizedCard && (
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>識別卡片:</Text>
            <Text style={styles.resultValue}>
              {record.scanResult.recognizedCard.name}
            </Text>
          </View>
        )}

        {record.scanResult.conditionAnalysis && (
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>條件評級:</Text>
            <Text style={styles.resultValue}>
              {record.scanResult.conditionAnalysis.overallGrade}
            </Text>
          </View>
        )}

        {record.scanResult.authenticityCheck && (
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>真偽驗證:</Text>
            <Text
              style={[
                styles.resultValue,
                {
                  color: record.scanResult.authenticityCheck.isAuthentic
                    ? theme.colors.success
                    : theme.colors.error,
                },
              ]}
            >
              {record.scanResult.authenticityCheck.isAuthentic
                ? '真品'
                : '疑似假貨'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderMetadata = () => (
    <View style={styles.metadataSection}>
      <Text style={styles.sectionTitle}>掃描信息</Text>

      <View style={styles.metadataGrid}>
        <View style={styles.metadataItem}>
          <Text style={styles.metadataLabel}>設備信息</Text>
          <Text style={styles.metadataValue}>{record.metadata.deviceInfo}</Text>
        </View>

        <View style={styles.metadataItem}>
          <Text style={styles.metadataLabel}>應用版本</Text>
          <Text style={styles.metadataValue}>{record.metadata.appVersion}</Text>
        </View>

        <View style={styles.metadataItem}>
          <Text style={styles.metadataLabel}>掃描方法</Text>
          <Text style={styles.metadataValue}>{record.metadata.scanMethod}</Text>
        </View>

        <View style={styles.metadataItem}>
          <Text style={styles.metadataLabel}>圖片質量</Text>
          <Text style={styles.metadataValue}>
            {record.metadata.imageQuality}
          </Text>
        </View>
      </View>

      {record.metadata.location && (
        <View style={styles.locationSection}>
          <Text style={styles.locationLabel}>掃描位置</Text>
          <Text style={styles.locationValue}>
            緯度: {record.metadata.location.latitude.toFixed(6)}
          </Text>
          <Text style={styles.locationValue}>
            經度: {record.metadata.location.longitude.toFixed(6)}
          </Text>
          <Text style={styles.locationValue}>
            精度: ±{record.metadata.location.accuracy.toFixed(1)}米
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        {/* 頭部信息 */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.scanTypeContainer}>
              <Ionicons
                name={getScanTypeIcon(record.scanType)}
                size={24}
                color={getScanTypeColor(record.scanType)}
              />
              <Text
                style={[
                  styles.scanType,
                  { color: getScanTypeColor(record.scanType) },
                ]}
              >
                {getScanTypeLabel(record.scanType)}
              </Text>
            </View>
            <Text style={styles.scanDate}>
              {formatDate(record.scanDate)} {formatTime(record.scanDate)}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleToggleFavorite}
            >
              <Ionicons
                name={record.isFavorite ? 'heart' : 'heart-outline'}
                size={24}
                color={
                  record.isFavorite
                    ? theme.colors.error
                    : theme.colors.textSecondary
                }
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Ionicons
                name="share-outline"
                size={24}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleDelete}
            >
              <Ionicons
                name="trash-outline"
                size={24}
                color={theme.colors.error}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* 卡片圖片 */}
        <View style={styles.imageSection}>
          <LazyImage
            uri={record.imageUri}
            style={styles.cardImage}
            quality="high"
            cachePolicy="both"
          />
        </View>

        {/* 基本信息 */}
        <View style={styles.basicInfoSection}>
          <Text style={styles.sectionTitle}>基本信息</Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>卡片名稱</Text>
              <Text style={styles.infoValue}>
                {record.cardName || '未知卡片'}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>信心度</Text>
              <Text style={styles.infoValue}>
                {Math.round((record.scanResult.confidence || 0) * 100)}%
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>處理時間</Text>
              <Text style={styles.infoValue}>
                {record.processingTime.toFixed(1)}秒
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>掃描狀態</Text>
              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.statusIndicator,
                    {
                      backgroundColor: record.scanResult.success
                        ? theme.colors.success
                        : theme.colors.error,
                    },
                  ]}
                />
                <Text style={styles.statusText}>
                  {record.scanResult.success ? '成功' : '失敗'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 掃描結果 */}
        {renderScanResult()}

        {/* 標籤 */}
        <View style={styles.tagsSection}>
          <Text style={styles.sectionTitle}>標籤</Text>

          <View style={styles.tagsContainer}>
            {record.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
                <TouchableOpacity
                  style={styles.removeTagButton}
                  onPress={() => handleRemoveTag(tag)}
                >
                  <Ionicons
                    name="close"
                    size={12}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={styles.addTagContainer}>
            <Input
              value={newTag}
              onChangeText={setNewTag}
              placeholder="添加新標籤"
              style={styles.tagInput}
            />
            <Button
              title="添加"
              onPress={handleAddTag}
              disabled={!newTag.trim()}
              size="small"
            />
          </View>
        </View>

        {/* 筆記 */}
        <View style={styles.notesSection}>
          <View style={styles.notesHeader}>
            <Text style={styles.sectionTitle}>筆記</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(!isEditing)}
            >
              <Ionicons
                name={isEditing ? 'checkmark' : 'create-outline'}
                size={20}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </View>

          {isEditing ? (
            <View style={styles.editNotesContainer}>
              <Input
                value={note}
                onChangeText={setNote}
                placeholder="添加筆記..."
                multiline
                numberOfLines={4}
                style={styles.notesInput}
              />
              <View style={styles.editActions}>
                <Button title="保存" onPress={handleSaveNote} size="small" />
                <Button
                  title="取消"
                  onPress={() => {
                    setNote(record.notes || '');
                    setIsEditing(false);
                  }}
                  variant="secondary"
                  size="small"
                />
              </View>
            </View>
          ) : (
            <View style={styles.notesContainer}>
              <Text style={styles.notesText}>{record.notes || '暫無筆記'}</Text>
            </View>
          )}
        </View>

        {/* 元數據 */}
        {renderMetadata()}
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  card: {
    margin: theme.spacing.medium,
    padding: theme.spacing.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.large,
  },
  headerLeft: {
    flex: 1,
  },
  scanTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.small,
  },
  scanType: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: theme.spacing.small,
  },
  scanDate: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: theme.spacing.small,
  },
  actionButton: {
    padding: theme.spacing.small,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.large,
  },
  cardImage: {
    width: width * 0.6,
    height: width * 0.6 * 1.4,
    borderRadius: theme.borderRadius.medium,
  },
  basicInfoSection: {
    marginBottom: theme.spacing.large,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.medium,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    marginBottom: theme.spacing.medium,
  },
  infoLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xsmall,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.xsmall,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  resultSection: {
    marginBottom: theme.spacing.large,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  resultLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  errorSection: {
    alignItems: 'center',
    padding: theme.spacing.large,
    backgroundColor: `${theme.colors.error}10`,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.large,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.error,
    marginTop: theme.spacing.small,
  },
  errorDetails: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.small,
  },
  tagsSection: {
    marginBottom: theme.spacing.large,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.medium,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundSecondary,
    paddingHorizontal: theme.spacing.small,
    paddingVertical: theme.spacing.xsmall,
    borderRadius: theme.borderRadius.small,
    marginRight: theme.spacing.small,
    marginBottom: theme.spacing.small,
  },
  tagText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.xsmall,
  },
  removeTagButton: {
    padding: 2,
  },
  addTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.small,
  },
  tagInput: {
    flex: 1,
  },
  notesSection: {
    marginBottom: theme.spacing.large,
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.medium,
  },
  editButton: {
    padding: theme.spacing.small,
  },
  notesContainer: {
    backgroundColor: theme.colors.backgroundSecondary,
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
  },
  notesText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  editNotesContainer: {
    backgroundColor: theme.colors.backgroundSecondary,
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
  },
  notesInput: {
    marginBottom: theme.spacing.medium,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.small,
  },
  metadataSection: {
    marginBottom: theme.spacing.large,
  },
  metadataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.medium,
  },
  metadataItem: {
    width: '48%',
    marginBottom: theme.spacing.medium,
  },
  metadataLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xsmall,
  },
  metadataValue: {
    fontSize: 14,
    color: theme.colors.text,
  },
  locationSection: {
    backgroundColor: theme.colors.backgroundSecondary,
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
  },
  locationValue: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xsmall,
  },
});

export default ScanHistoryDetail;
