import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { fakeCardCollectionService } from '../services/fakeCardCollectionService';
import { logger } from '../utils/logger';
import { theme } from '../theme';

// 假卡原因選項
const FAKE_CARD_REASONS = [
  { id: 'printing_quality', label: '印刷品質差', description: '顏色模糊、字體不清' },
  { id: 'material_different', label: '材質不同', description: '卡片厚度、質感異常' },
  { id: 'color_mismatch', label: '顏色不匹配', description: '與正版顏色有明顯差異' },
  { id: 'text_errors', label: '文字錯誤', description: '拼寫錯誤、語法問題' },
  { id: 'hologram_fake', label: '全息圖假', description: '全息圖效果不真實' },
  { id: 'border_issues', label: '邊框問題', description: '邊框不整齊、切割粗糙' },
  { id: 'card_size', label: '卡片尺寸', description: '尺寸與正版不符' },
  { id: 'font_type', label: '字體類型', description: '字體與正版不同' },
  { id: 'other', label: '其他原因', description: '請在下方詳細說明' },
];

const FakeCardReportScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [otherReason, setOtherReason] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardType, setCardType] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const cameraRef = useRef<Camera>(null);

  // 請求相機權限
  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // 拍照功能
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
        });
        
        if (photo.base64) {
          const imageData = `data:image/jpeg;base64,${photo.base64}`;
          setCapturedImages(prev => [...prev, imageData]);
          setShowCamera(false);
        }
      } catch (error) {
        logger.error('拍照失敗:', error);
        Alert.alert('錯誤', '拍照失敗，請重試');
      }
    }
  };

  // 從相冊選擇圖片
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets
          .filter(asset => asset.base64)
          .map(asset => `data:image/jpeg;base64,${asset.base64}`);
        
        setCapturedImages(prev => [...prev, ...newImages]);
      }
    } catch (error) {
      logger.error('選擇圖片失敗:', error);
      Alert.alert('錯誤', '選擇圖片失敗，請重試');
    }
  };

  // 切換假卡原因選擇
  const toggleReason = (reasonId: string) => {
    setSelectedReasons(prev => {
      if (prev.includes(reasonId)) {
        return prev.filter(id => id !== reasonId);
      } else {
        return [...prev, reasonId];
      }
    });
  };

  // 刪除已拍攝的圖片
  const removeImage = (index: number) => {
    setCapturedImages(prev => prev.filter((_, i) => i !== index));
  };

  // 提交假卡報告
  const submitReport = async () => {
    // 驗證輸入
    if (!cardName.trim()) {
      Alert.alert('錯誤', '請輸入卡牌名稱');
      return;
    }

    if (!cardType.trim()) {
      Alert.alert('錯誤', '請輸入卡牌類型');
      return;
    }

    if (capturedImages.length === 0) {
      Alert.alert('錯誤', '請至少拍攝一張圖片');
      return;
    }

    if (selectedReasons.length === 0) {
      Alert.alert('錯誤', '請選擇假卡原因');
      return;
    }

    if (selectedReasons.includes('other') && !otherReason.trim()) {
      Alert.alert('錯誤', '請填寫其他原因說明');
      return;
    }

    if (description.length < 10) {
      Alert.alert('錯誤', '描述至少需要10個字符');
      return;
    }

    setIsSubmitting(true);

    try {
      // 構建假卡特徵列表
      const fakeIndicators = selectedReasons.map(reasonId => {
        const reason = FAKE_CARD_REASONS.find(r => r.id === reasonId);
        if (reasonId === 'other') {
          return `其他: ${otherReason}`;
        }
        return reason?.label || reasonId;
      });

      const request = {
        cardName: cardName.trim(),
        cardType: cardType.trim(),
        fakeType: 'counterfeit' as const, // 默認為假卡類型
        imageData: capturedImages,
        description: description.trim(),
        fakeIndicators,
      };

      const response = await fakeCardCollectionService.submitFakeCard(request);

      if (response.success) {
        Alert.alert(
          '提交成功',
          '您的假卡報告已提交，我們會盡快審核。感謝您的貢獻！',
          [
            {
              text: '確定',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('錯誤', response.message || '提交失敗，請重試');
      }
    } catch (error: any) {
      logger.error('提交假卡報告失敗:', error);
      Alert.alert('錯誤', error.message || '提交失敗，請重試');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>請求相機權限中...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Ionicons name="camera-off" size={64} color={theme.colors.error} />
        <Text style={styles.errorText}>需要相機權限才能拍攝假卡</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>返回</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <Camera
          ref={cameraRef}
          style={styles.camera}
          type={cameraType}
        >
          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() => setShowCamera(false)}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() => setCameraType(
                cameraType === Camera.Constants.Type.back
                  ? Camera.Constants.Type.front
                  : Camera.Constants.Type.back
              )}
            >
              <Ionicons name="camera-reverse" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </Camera>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>假卡回報</Text>
        <View style={styles.placeholder} />
      </View>

      {/* 基本信息 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>基本信息</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>卡牌名稱 *</Text>
          <TextInput
            style={styles.input}
            value={cardName}
            onChangeText={setCardName}
            placeholder="請輸入卡牌名稱"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>卡牌類型 *</Text>
          <TextInput
            style={styles.input}
            value={cardType}
            onChangeText={setCardType}
            placeholder="例如：Pokémon、Yu-Gi-Oh!、MTG等"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>
      </View>

      {/* 拍攝圖片 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>拍攝假卡圖片 *</Text>
        <Text style={styles.sectionDescription}>
          請拍攝假卡的正面、背面和細節照片，幫助我們更好地識別假卡特徵
        </Text>

        <View style={styles.imageContainer}>
          {capturedImages.map((image, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri: image }} style={styles.capturedImage} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => removeImage(index)}
              >
                <Ionicons name="close-circle" size={24} color={theme.colors.error} />
              </TouchableOpacity>
            </View>
          ))}

          {capturedImages.length < 5 && (
            <View style={styles.addImageContainer}>
              <TouchableOpacity
                style={styles.addImageButton}
                onPress={() => setShowCamera(true)}
              >
                <Ionicons name="camera" size={32} color={theme.colors.primary} />
                <Text style={styles.addImageText}>拍照</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.addImageButton}
                onPress={pickImage}
              >
                <Ionicons name="images" size={32} color={theme.colors.primary} />
                <Text style={styles.addImageText}>相冊</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Text style={styles.imageCountText}>
          {capturedImages.length}/5 張圖片
        </Text>
      </View>

      {/* 假卡原因 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>假卡原因 *</Text>
        <Text style={styles.sectionDescription}>
          請選擇您認為這是假卡的原因（可多選）
        </Text>

        <View style={styles.reasonsContainer}>
          {FAKE_CARD_REASONS.map((reason) => (
            <TouchableOpacity
              key={reason.id}
              style={[
                styles.reasonItem,
                selectedReasons.includes(reason.id) && styles.reasonItemSelected,
              ]}
              onPress={() => toggleReason(reason.id)}
            >
              <View style={styles.reasonHeader}>
                <Text style={[
                  styles.reasonLabel,
                  selectedReasons.includes(reason.id) && styles.reasonLabelSelected,
                ]}>
                  {reason.label}
                </Text>
                <Ionicons
                  name={selectedReasons.includes(reason.id) ? 'checkmark-circle' : 'ellipse-outline'}
                  size={24}
                  color={selectedReasons.includes(reason.id) ? theme.colors.primary : theme.colors.textSecondary}
                />
              </View>
              <Text style={styles.reasonDescription}>{reason.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedReasons.includes('other') && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>其他原因說明 *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={otherReason}
              onChangeText={setOtherReason}
              placeholder="請詳細說明其他假卡原因"
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>
        )}
      </View>

      {/* 詳細描述 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>詳細描述 *</Text>
        <Text style={styles.sectionDescription}>
          請詳細描述您發現的假卡特徵，幫助我們改進識別算法
        </Text>

        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="請詳細描述假卡的特徵、發現過程等（至少10個字符）"
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.charCountText}>
          {description.length}/1000 字符
        </Text>
      </View>

      {/* 提交按鈕 */}
      <View style={styles.submitContainer}>
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={submitReport}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons name="send" size={20} color="white" />
          )}
          <Text style={styles.submitButtonText}>
            {isSubmitting ? '提交中...' : '提交假卡報告'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  placeholder: {
    width: 40,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  imageWrapper: {
    position: 'relative',
  },
  capturedImage: {
    width: 100,
    height: 140,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  addImageContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  addImageButton: {
    width: 100,
    height: 140,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  imageCountText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  reasonsContainer: {
    gap: 12,
  },
  reasonItem: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: theme.colors.surface,
  },
  reasonItemSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  reasonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reasonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  reasonLabelSelected: {
    color: theme.colors.primary,
  },
  reasonDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  charCountText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  submitContainer: {
    padding: 16,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    padding: 16,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: theme.colors.textSecondary,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
  },
  cameraButton: {
    padding: 16,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error,
    marginTop: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FakeCardReportScreen;
