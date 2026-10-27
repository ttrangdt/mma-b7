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
  Platform,
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { saveStoredApiKey, saveStoredVietmapKey } from '../services/storageService';

export default function ApiKeyModal({ 
  visible, 
  currentKey, 
  currentVietmapKey, 
  onClose, 
  onKeySaved,
  onVietmapKeySaved 
}) {
  const [apiKey, setApiKey] = useState(currentKey || '');
  const [vietmapKey, setVietmapKey] = useState(currentVietmapKey || '');

  useEffect(() => {
    setApiKey(currentKey || '');
    setVietmapKey(currentVietmapKey || '');
  }, [currentKey, currentVietmapKey, visible]);

  const handleSave = async () => {
    if (apiKey.trim()) {
      await saveStoredApiKey(apiKey.trim());
      onKeySaved && onKeySaved(apiKey.trim());
    }
    if (vietmapKey.trim()) {
      await saveStoredVietmapKey(vietmapKey.trim());
      onVietmapKeySaved && onVietmapKeySaved(vietmapKey.trim());
    }

    if (Platform.OS === 'web') {
      window.alert('Đã lưu cấu hình API Key thành công!');
    } else {
      Alert.alert('Thành công', 'Đã lưu cấu hình API Key vào máy!');
    }
    onClose();
  };

  const openGoogleAiStudio = () => {
    Linking.openURL('https://aistudio.google.com/app/apikey');
  };

  const openVietmapDocs = () => {
    Linking.openURL('https://maps.vietmap.vn');
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
              <Ionicons name="settings-sharp" size={20} color={THEME.colors.primary} />
              <Text style={styles.title}>Cấu hình API Keys</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={22} color={THEME.colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* 1. Mục Gemini AI Key */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="sparkles" size={16} color={THEME.colors.accent} />
                <Text style={styles.sectionTitle}>1. Google Gemini AI Key</Text>
              </View>
              <Text style={styles.sectionDesc}>
                Bắt buộc bắt đầu bằng <Text style={{ color: THEME.colors.accent, fontWeight: '700' }}>AIzaSy...</Text> để phân tích hình ảnh.
              </Text>
              <TextInput
                style={styles.input}
                value={apiKey}
                onChangeText={setApiKey}
                placeholder="Dán AI Studio key (AIzaSy...)"
                placeholderTextColor={THEME.colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity style={styles.linkRow} onPress={openGoogleAiStudio}>
                <Ionicons name="link-outline" size={14} color={THEME.colors.primary} />
                <Text style={styles.linkText}>Lấy Gemini Key tại Google AI Studio</Text>
              </TouchableOpacity>
            </View>

            {/* 2. Mục VietMap Key */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="map" size={16} color={THEME.colors.success} />
                <Text style={styles.sectionTitle}>2. VietMap API Key (Tùy chọn)</Text>
              </View>
              <Text style={styles.sectionDesc}>
                Hiển thị lớp bản đồ VietMap Tiles & tìm địa chỉ chi tiết theo chuẩn VietMap Việt Nam.
              </Text>
              <TextInput
                style={styles.input}
                value={vietmapKey}
                onChangeText={setVietmapKey}
                placeholder="Nhập VietMap API Key..."
                placeholderTextColor={THEME.colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity style={styles.linkRow} onPress={openVietmapDocs}>
                <Ionicons name="link-outline" size={14} color={THEME.colors.primary} />
                <Text style={styles.linkText}>Tìm hiểu VietMap API (maps.vietmap.vn)</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Đóng</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Lưu cấu hình</Text>
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
    maxHeight: '85%',
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
  section: {
    marginBottom: THEME.spacing.lg,
    paddingBottom: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  sectionTitle: {
    color: THEME.colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  sectionDesc: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 8,
  },
  input: {
    backgroundColor: THEME.colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: THEME.colors.text,
    fontSize: 13,
    marginBottom: 6,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
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
    marginTop: 10,
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
