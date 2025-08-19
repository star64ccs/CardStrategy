import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import {
  Modal,
  Switch,
  Tooltip,
  LoadingSpinner,
  ProgressBar,
  Avatar,
  Badge,
  Skeleton,
  Toast
} from '../components/common';

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#1a1a1a',
    flex: 1
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
    alignItems: 'center'
  },
  section: {
    marginBottom: 30
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10
  },
  modalContent: {
    padding: 20,
    backgroundColor: '#2a2a2a',
    borderRadius: 10
  },
  tooltipContent: {
    padding: 10,
    backgroundColor: '#333333',
    borderRadius: 5
  }
});

export default {
  title: 'Components/Interactive',
  parameters: {
    docs: {
      description: {
        component: '交互組件提供豐富的用戶交互體驗，包括模態框、開關、工具提示等。'
      }
    }
  },
  decorators: [
    (Story) => (
      <View style={styles.container}>
        <Story />
      </View>
    )
  ]
};

// 模態框故事
export const ModalStory = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [modalSize, setModalSize] = useState<'small' | 'medium' | 'large' | 'full'>('medium');

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>模態框</Text>
      <View style={styles.row}>
        <Text
          style={{ color: '#ffd700', marginRight: 10 }}
          onPress={() => {
            setModalSize('small');
            setIsVisible(true);
          }}
        >
          小模態框
        </Text>
        <Text
          style={{ color: '#ffd700', marginRight: 10 }}
          onPress={() => {
            setModalSize('medium');
            setIsVisible(true);
          }}
        >
          中模態框
        </Text>
        <Text
          style={{ color: '#ffd700', marginRight: 10 }}
          onPress={() => {
            setModalSize('large');
            setIsVisible(true);
          }}
        >
          大模態框
        </Text>
        <Text
          style={{ color: '#ffd700' }}
          onPress={() => {
            setModalSize('full');
            setIsVisible(true);
          }}
        >
          全屏模態框
        </Text>
      </View>

      <Modal
        visible={isVisible}
        onClose={() => setIsVisible(false)}
        title={`${modalSize} 模態框`}
        size={modalSize}
        animationType="slide"
      >
        <View style={styles.modalContent}>
          <Text style={{ color: '#ffffff', marginBottom: 10 }}>
            這是一個 {modalSize} 尺寸的模態框示例。
          </Text>
          <Text style={{ color: '#cccccc' }}>
            模態框支持多種尺寸和動畫效果，可以根據需要自定義內容。
          </Text>
        </View>
      </Modal>
    </View>
  );
};

// 開關故事
export const SwitchStory = () => {
  const [switch1, setSwitch1] = useState(false);
  const [switch2, setSwitch2] = useState(true);
  const [switch3, setSwitch3] = useState(false);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>開關組件</Text>
      <View style={styles.row}>
        <Text style={{ color: '#ffffff', marginRight: 10 }}>默認開關:</Text>
        <Switch
          value={switch1}
          onValueChange={setSwitch1}
        />
      </View>
      <View style={styles.row}>
        <Text style={{ color: '#ffffff', marginRight: 10 }}>成功開關:</Text>
        <Switch
          value={switch2}
          onValueChange={setSwitch2}
          variant="success"
        />
      </View>
      <View style={styles.row}>
        <Text style={{ color: '#ffffff', marginRight: 10 }}>禁用開關:</Text>
        <Switch
          value={switch3}
          onValueChange={setSwitch3}
          disabled={true}
        />
      </View>
    </View>
  );
};

// 工具提示故事
export const TooltipStory = () => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>工具提示</Text>
      <View style={styles.row}>
        <Tooltip
          content="這是一個頂部工具提示"
          position="top"
        >
          <Text style={{ color: '#ffd700' }}>頂部提示</Text>
        </Tooltip>
        <Tooltip
          content="這是一個底部工具提示"
          position="bottom"
        >
          <Text style={{ color: '#ffd700' }}>底部提示</Text>
        </Tooltip>
        <Tooltip
          content="這是一個左側工具提示"
          position="left"
        >
          <Text style={{ color: '#ffd700' }}>左側提示</Text>
        </Tooltip>
        <Tooltip
          content="這是一個右側工具提示"
          position="right"
        >
          <Text style={{ color: '#ffd700' }}>右側提示</Text>
        </Tooltip>
      </View>
    </View>
  );
};

// 加載動畫故事
export const LoadingSpinnerStory = () => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>加載動畫</Text>
      <View style={styles.row}>
        <LoadingSpinner
          size="small"
          variant="spinner"
          text="小尺寸"
        />
        <LoadingSpinner
          size="medium"
          variant="dots"
          text="點狀動畫"
        />
        <LoadingSpinner
          size="large"
          variant="pulse"
          text="脈衝動畫"
        />
      </View>
    </View>
  );
};

// 進度條故事
export const ProgressBarStory = () => {
  const [progress, setProgress] = useState(30);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 10));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>進度條</Text>
      <View style={styles.row}>
        <ProgressBar
          progress={progress}
          variant="default"
          showLabel={true}
          animated={true}
        />
      </View>
      <View style={styles.row}>
        <ProgressBar
          progress={65}
          variant="success"
          showLabel={true}
        />
      </View>
      <View style={styles.row}>
        <ProgressBar
          progress={45}
          variant="warning"
          showLabel={true}
        />
      </View>
      <View style={styles.row}>
        <ProgressBar
          progress={80}
          variant="gold"
          showLabel={true}
        />
      </View>
    </View>
  );
};

// 頭像故事
export const AvatarStory = () => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>頭像組件</Text>
      <View style={styles.row}>
        <Avatar
          source={{ uri: 'https://example.com/avatar.jpg' }}
          size="small"
          showBorder={true}
        />
        <Avatar
          initials="JD"
          size="medium"
          variant="circle"
          status="online"
        />
        <Avatar
          source={{ uri: 'https://example.com/avatar2.jpg' }}
          size="large"
          variant="rounded"
          status="away"
        />
        <Avatar
          initials="AB"
          size="xlarge"
          variant="square"
          status="busy"
        />
      </View>
    </View>
  );
};

// 徽章故事
export const BadgeStory = () => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>徽章組件</Text>
      <View style={styles.row}>
        <Badge text="NEW" variant="default" />
        <Badge text="5" variant="success" />
        <Badge text="警告" variant="warning" />
        <Badge text="錯誤" variant="error" />
        <Badge text="信息" variant="info" />
        <Badge text="PRO" variant="gold" />
      </View>
      <View style={styles.row}>
        <Badge text="小徽章" size="small" />
        <Badge text="中徽章" size="medium" />
        <Badge text="大徽章" size="large" />
      </View>
      <View style={styles.row}>
        <Badge text="帶點" showDot={true} />
        <Badge text="無點" showDot={false} />
      </View>
    </View>
  );
};

// 骨架屏故事
export const SkeletonStory = () => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>骨架屏</Text>
      <View style={styles.row}>
        <Skeleton variant="text" width={100} height={20} />
        <Skeleton variant="title" width={150} height={24} />
        <Skeleton variant="avatar" width={50} height={50} />
      </View>
      <View style={styles.row}>
        <Skeleton variant="card" width={200} height={120} />
        <Skeleton variant="button" width={80} height={40} />
        <Skeleton variant="image" width={100} height={100} />
      </View>
      <View style={styles.row}>
        <Skeleton variant="text" lines={3} spacing={5} />
      </View>
    </View>
  );
};

// Toast故事
export const ToastStory = () => {
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('success');

  const showToast = (type: 'success' | 'error' | 'warning' | 'info') => {
    setToastType(type);
    setToastVisible(true);
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Toast 提示</Text>
      <View style={styles.row}>
        <Text
          style={{ color: '#4ecdc4', marginRight: 10 }}
          onPress={() => showToast('success')}
        >
          成功提示
        </Text>
        <Text
          style={{ color: '#ff6b6b', marginRight: 10 }}
          onPress={() => showToast('error')}
        >
          錯誤提示
        </Text>
        <Text
          style={{ color: '#ffd93d', marginRight: 10 }}
          onPress={() => showToast('warning')}
        >
          警告提示
        </Text>
        <Text
          style={{ color: '#45b7d1' }}
          onPress={() => showToast('info')}
        >
          信息提示
        </Text>
      </View>

      <Toast
        visible={toastVisible}
        message={`這是一個 ${toastType} 類型的 Toast 提示`}
        type={toastType}
        duration={3000}
        onClose={() => setToastVisible(false)}
        position="top"
      />
    </View>
  );
};

// 完整示例故事
export const CompleteExample = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [switchValue, setSwitchValue] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>完整示例</Text>
      <View style={styles.row}>
        <Tooltip content="點擊打開模態框">
          <Text
            style={{ color: '#ffd700', marginRight: 10 }}
            onPress={() => setModalVisible(true)}
          >
            打開模態框
          </Text>
        </Tooltip>
        <Switch
          value={switchValue}
          onValueChange={setSwitchValue}
        />
        <Text style={{ color: '#ffffff', marginLeft: 10 }}>
          開關狀態: {switchValue ? '開啟' : '關閉'}
        </Text>
      </View>
      <View style={styles.row}>
        <Avatar
          initials="U"
          size="medium"
          status="online"
        />
        <Badge text="3" variant="error" />
        <LoadingSpinner size="small" variant="spinner" />
      </View>

      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="完整示例模態框"
        size="medium"
      >
        <View style={styles.modalContent}>
          <Text style={{ color: '#ffffff', marginBottom: 10 }}>
            這是一個包含多個交互組件的完整示例。
          </Text>
          <ProgressBar progress={75} variant="gold" showLabel={true} />
          <Text
            style={{ color: '#ffd700', marginTop: 10 }}
            onPress={() => {
              setToastVisible(true);
              setModalVisible(false);
            }}
          >
            顯示 Toast
          </Text>
        </View>
      </Modal>

      <Toast
        visible={toastVisible}
        message="這是一個完整的交互示例！"
        type="success"
        duration={3000}
        onClose={() => setToastVisible(false)}
      />
    </View>
  );
};

// 交互組件文檔
export const InteractiveComponentsDocumentation = () => (
  <View style={styles.container}>
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>交互組件文檔</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Modal</Text>
        <View style={{ color: '#ffffff' }}>
          <Text>模態對話框組件，支持多種尺寸和動畫效果。</Text>
          <Text>Props:</Text>
          <Text>• visible: 是否顯示</Text>
          <Text>• onClose: 關閉事件</Text>
          <Text>• title: 標題</Text>
          <Text>• size: 尺寸 (small, medium, large, full)</Text>
          <Text>• animationType: 動畫類型</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Switch</Text>
        <View style={{ color: '#ffffff' }}>
          <Text>開關組件，支持多種變體和狀態。</Text>
          <Text>Props:</Text>
          <Text>• value: 開關狀態</Text>
          <Text>• onValueChange: 狀態變更事件</Text>
          <Text>• variant: 變體 (default, success, warning, error, gold)</Text>
          <Text>• disabled: 是否禁用</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tooltip</Text>
        <View style={{ color: '#ffffff' }}>
          <Text>工具提示組件，提供額外信息顯示。</Text>
          <Text>Props:</Text>
          <Text>• content: 提示內容</Text>
          <Text>• position: 位置 (top, bottom, left, right)</Text>
          <Text>• trigger: 觸發方式 (press, longPress, hover)</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>LoadingSpinner</Text>
        <View style={{ color: '#ffffff' }}>
          <Text>加載動畫組件，提供多種動畫效果。</Text>
          <Text>Props:</Text>
          <Text>• size: 尺寸 (small, medium, large)</Text>
          <Text>• variant: 動畫類型 (spinner, dots, pulse)</Text>
          <Text>• text: 加載文字</Text>
          <Text>• color: 顏色</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>使用示例</Text>
        <View style={{ color: '#ffffff' }}>
          <Text>```tsx</Text>
          <Text>import { Modal, Switch, Tooltip } from '@components/common';</Text>
          <Text></Text>
          <Text>// 模態框</Text>
          <Text>{'<Modal visible={visible} onClose={onClose} title="標題">'}</Text>
          <Text>  內容</Text>
          <Text>{'</Modal>'}</Text>
          <Text></Text>
          <Text>// 開關</Text>
          <Text>{'<Switch value={value} onValueChange={setValue} />'}</Text>
          <Text></Text>
          <Text>// 工具提示</Text>
          <Text>{'<Tooltip content="提示內容">'}</Text>
          <Text>  觸發元素</Text>
          <Text>{'</Tooltip>'}</Text>
          <Text>```</Text>
        </View>
      </View>
    </View>
  </View>
);
