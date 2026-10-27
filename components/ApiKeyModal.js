import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Linking, 
  Alert,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { saveStoredApiKey } from '../services/storageService';

export default function ApiKeyModal({ visible, currentKey, onClose, onKeySaved }) {
  const [apiKey, setApiKey] = useState(currentKey || '');

  useEffect(() => {
    setApiKey(currentKey || '');
  }, [currentKey, visible]);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Cảnh báo', 'Vui lòng nhập API Key hợp lệ.');
      return;
    }
    const success = await saveStoredApiKey(apiKey.trim());
    if (success) {
      Alert.alert('Thành công', 'Đã lưu Gemini API Key vào máy!');
      onKeySaved(apiKey.trim());
      onClose();
    } else {
      Alert.alert('Lỗi', 'Không thể lưu API Key vào AsyncStorage.');
    }
  };

  const openGoogleAiStudio = () => {
    Linking.openURL('https://aistudio.google.com/app/apikey');
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.backdrop}
      >
        <View style={styles.modalBox}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="sparkles" size={20} color={THEME.colors.accent} />
              <Text style={styles.title}>Cấu hình Gemini AI Key</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={22} color={THEME.colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.description}>
            Để tính năng phân tích ảnh tự động hoạt động, bạn cần cung cấp một Google Gemini API Key miễn phí.
          </Text>

          <TextInput
            style={styles.input}
            value={apiKey}
            onChangeText={setApiKey}
            placeholder="Dán AI Studio API Key vào đây (AIza...)"
            placeholderTextColor={THEME.colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry={false}
          />

          <TouchableOpacity style={styles.linkRow} onPress={openGoogleAiStudio}>
            <Ionicons name="link-outline" size={16} color={THEME.colors.primary} />
            <Text style={styles.linkText}>Lấy Gemini API Key miễn phí tại Google AI Studio</Text>
          </TouchableOpacity>

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Đóng</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Lưu Key</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.lg,
  },
  modalBox: {
    width: '100%',
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: THEME.spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: THEME.colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  description: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: THEME.spacing.lg,
  },
  input: {
    backgroundColor: THEME.colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: THEME.colors.text,
    fontSize: 14,
    marginBottom: 12,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: THEME.spacing.xl,
  },
  linkText: {
    color: THEME.colors.primary,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.colors.surfaceLight,
  },
  cancelBtnText: {
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  saveBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.colors.primary,
  },
  saveBtnText: {
    color: THEME.colors.background,
    fontWeight: '700',
  },
});
