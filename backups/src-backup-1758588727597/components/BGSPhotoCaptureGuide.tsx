// BGS 模擬鑑定拍攝指引組件
import { Ionicons } from '@expo/vector-icons';
import { Camera } from 'expo-camera';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface BGSPhotoCaptureGuideProps {
  onPhotosCaptured: (photos: BGSPhotoSet) => void;
  onCancel: () => void;
}

interface BGSPhotoSet {
  front: string; // 正面照片
  back: string; // 背面照片
  centering: string; // 置中評估照片
  corners: string[]; // 四個角的特寫照片
  edges: string[]; // 四邊的特寫照片
  surface: string; // 表面細節照片
  metadata: {
    timestamp: string;
    quality: 'good' | 'fair' | 'poor';
    notes: string[];
  };
}

export const BGSPhotoCaptureGuide: React.FC<BGSPhotoCaptureGuideProps> = ({
  onPhotosCaptured,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [capturedPhotos, setCapturedPhotos] = useState<Partial<BGSPhotoSet>>(
    {}
  );
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(
    null
  );
  const cameraRef = useRef<Camera | null>(null);

  const captureSteps = [
    {
      title: '正面照片',
      key: 'front',
      instructions: [
        '將卡片正面朝上，完全對齊框架',
        '確保光線充足，避免反光',
        '卡片應完全填滿框架',
      ],
      icon: 'card',
    },
    {
      title: '背面照片',
      key: 'back',
      instructions: [
        '翻轉卡片，背面朝上',
        '保持相同的對齊和光線條件',
        '確保背面文字清晰可見',
      ],
      icon: 'card',
    },
    {
      title: '置中評估',
      key: 'centering',
      instructions: [
        '將卡片置於框架中心',
        '確保四邊留白均勻',
        '用於評估卡片的置中程度',
      ],
      icon: 'scan',
    },
    {
      title: '四角特寫',
      key: 'corners',
      instructions: [
        '拍攝四個角的特寫照片',
        '每個角都要清晰可見',
        '用於評估角部磨損情況',
      ],
      icon: 'crop',
      count: 4,
    },
    {
      title: '四邊特寫',
      key: 'edges',
      instructions: [
        '拍攝四條邊的特寫照片',
        '每條邊都要清晰可見',
        '用於評估邊緣磨損情況',
      ],
      icon: 'resize',
      count: 4,
    },
    {
      title: '表面細節',
      key: 'surface',
      instructions: [
        '拍攝表面細節照片',
        '用於評估表面磨損和瑕疵',
        '確保光線均勻，無陰影',
      ],
      icon: 'eye',
    },
  ];

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setCameraPermission(status === 'granted');
    return status === 'granted';
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: false,
      });

      const currentStepData = captureSteps[currentStep];
      const newPhotos = { ...capturedPhotos };

      if (currentStepData.count) {
        // 多張照片的情況（四角、四邊）
        const existingPhotos =
          (newPhotos[currentStepData.key as keyof BGSPhotoSet] as string[]) ||
          [];
        existingPhotos.push(photo.uri);
        (newPhotos as any)[currentStepData.key] = existingPhotos;
      } else {
        // 單張照片的情況
        (newPhotos as any)[currentStepData.key] = photo.uri;
      }

      setCapturedPhotos(newPhotos);

      // 檢查是否完成所有拍攝
      const isComplete = captureSteps.every(step => {
        if (step.count) {
          const photos = (newPhotos as any)[step.key] as string[];
          return photos && photos.length >= step.count;
        } else {
          return (newPhotos as any)[step.key];
        }
      });

      if (isComplete) {
        const completePhotoSet: BGSPhotoSet = {
          front: newPhotos.front || '',
          back: newPhotos.back || '',
          centering: newPhotos.centering || '',
          corners: (newPhotos.corners as string[]) || [],
          edges: (newPhotos.edges as string[]) || [],
          surface: newPhotos.surface || '',
          metadata: {
            timestamp: new Date().toISOString(),
            quality: 'good',
            notes: [],
          },
        };
        onPhotosCaptured(completePhotoSet);
      }
    } catch (error) {
      Alert.alert('拍攝失敗', '請重試拍攝');
    }
  };

  const renderCameraView = () => (
    <View style={styles.cameraContainer}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={Camera.Constants.Type.back}
        flashMode={Camera.Constants.FlashMode.off}
      >
        <View style={styles.cameraOverlay}>
          <View style={styles.guideFrame}>
            <View style={styles.cornerMarkers}>
              <View style={[styles.cornerMarker, styles.topLeft]} />
              <View style={[styles.cornerMarker, styles.topRight]} />
              <View style={[styles.cornerMarker, styles.bottomLeft]} />
              <View style={[styles.cornerMarker, styles.bottomRight]} />
            </View>
          </View>
          <Text style={styles.overlayText}>
            {captureSteps[currentStep].instructions[0]}
          </Text>
        </View>
      </Camera>
    </View>
  );

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {captureSteps.map((_, index) => (
        <View
          key={index}
          style={[
            styles.stepDot,
            index === currentStep && styles.stepDotActive,
            index < currentStep && styles.stepDotCompleted,
          ]}
        />
      ))}
    </View>
  );

  const renderInstructions = () => (
    <View style={styles.instructionsContainer}>
      <Text style={styles.stepTitle}>{captureSteps[currentStep].title}</Text>
      {captureSteps[currentStep].instructions.map((instruction, index) => (
        <Text key={index} style={styles.instruction}>
          {index + 1}. {instruction}
        </Text>
      ))}
    </View>
  );

  const renderControls = () => (
    <View style={styles.controlsContainer}>
      <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
        <Ionicons name='close' size={24} color='#fff' />
        <Text style={styles.cancelButtonText}>取消</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
        <Ionicons name='camera' size={32} color='#fff' />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.nextButton}
        onPress={() =>
          setCurrentStep(prev => Math.min(prev + 1, captureSteps.length - 1))
        }
        disabled={currentStep >= captureSteps.length - 1}
      >
        <Ionicons name='arrow-forward' size={24} color='#fff' />
        <Text style={styles.nextButtonText}>下一步</Text>
      </TouchableOpacity>
    </View>
  );

  const renderProgress = () => {
    const currentStepData = captureSteps[currentStep];
    const isMultiPhoto = currentStepData.count && currentStepData.count > 1;

    if (isMultiPhoto) {
      const photos =
        ((capturedPhotos as any)[currentStepData.key] as string[]) || [];
      return (
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            已拍攝: {photos.length} / {currentStepData.count}
          </Text>
        </View>
      );
    }

    return null;
  };

  if (cameraPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>需要相機權限</Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestCameraPermission}
        >
          <Text style={styles.permissionButtonText}>授權相機</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (cameraPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>相機權限被拒絕</Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestCameraPermission}
        >
          <Text style={styles.permissionButtonText}>重新授權</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderStepIndicator()}
      {renderCameraView()}
      {renderProgress()}
      {renderInstructions()}
      {renderControls()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  stepDotActive: {
    backgroundColor: '#007AFF',
  },
  stepDotCompleted: {
    backgroundColor: '#34C759',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideFrame: {
    width: width * 0.8,
    height: height * 0.5,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 8,
    position: 'relative',
  },
  cornerMarkers: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cornerMarker: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#fff',
    borderWidth: 2,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  overlayText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
  },
  progressContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 10,
    alignItems: 'center',
  },
  progressText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  instructionsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
  },
  stepTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  instruction: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 20,
    paddingHorizontal: 30,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 59, 48, 0.8)',
  },
  cancelButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 16,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#007AFF',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.8)',
  },
  nextButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  permissionText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BGSPhotoCaptureGuide;
