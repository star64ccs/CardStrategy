import React from 'react';
import {
  View,
  Modal as RNModal,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Text
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/config/theme';

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  containerStyle?: ViewStyle;
  showCloseButton?: boolean;
  closeOnBackdropPress?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  containerStyle,
  showCloseButton = true,
  closeOnBackdropPress = true
}) => {
  const handleBackdropPress = () => {
    if (closeOnBackdropPress) {
      onClose();
    }
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={handleBackdropPress}
      >
        <TouchableOpacity
          style={[styles.container, containerStyle]}
          activeOpacity={1}
          onPress={() => {}}
        >
          {title && (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              {showCloseButton && (
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          )}
          <View style={styles.content}>{children}</View>
        </TouchableOpacity>
      </TouchableOpacity>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.large
  },
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.large,
    maxWidth: '90%',
    maxHeight: '80%',
    minWidth: 300,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.large,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1
  },
  closeButton: {
    padding: theme.spacing.small
  },
  content: {
    padding: theme.spacing.large
  }
});
