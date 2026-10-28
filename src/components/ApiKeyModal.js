import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  getGeminiApiKey,
  saveGeminiApiKey,
  DEFAULT_GEMINI_KEY,
} from '../services/storageService';

export default function ApiKeyModal({ visible, onClose }) {
  const [apiKey, setApiKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (visible) {
      loadKey();
      setTestResult(null);
    }
  }, [visible]);

  const loadKey = async () => {
    const key = await getGeminiApiKey();
    setApiKey(key);
  };

  const handleSave = async () => {
    await saveGeminiApiKey(apiKey);
    Alert.alert('Thành công', 'Đã lưu cấu hình Gemini API Key!');
    onClose();
  };

  const handleResetDefault = async () => {
    setApiKey(DEFAULT_GEMINI_KEY);
    await saveGeminiApiKey(DEFAULT_GEMINI_KEY);
    Alert.alert('Thông báo', 'Đã đặt lại API key mặc định ban đầu.');
  };

  const handleTestKey = async () => {
    if (!apiKey || apiKey.trim().length === 0) {
      Alert.alert('Lưu ý', 'Vui lòng nhập API Key trước khi kiểm tra.');
      return;
    }

    try {
      setIsTesting(true);
      setTestResult(null);

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Trả lời đúng 1 chữ: OK' }] }],
        }),
      });

      const data = await response.json();

      if (response.ok && data?.candidates) {
        setTestResult({
          success: true,
          message: 'API Key hoạt động hoàn hảo!',
        });
      } else {
        const errorMsg =
          data?.error?.message ||
          (data?.error?.code === 402
            ? 'API Key đã dùng hết hạn mức miễn phí (Prepayment credits depleted).'
            : 'API Key không hợp lệ.');
        setTestResult({
          success: false,
          message: errorMsg,
        });
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: 'Lỗi kết nối mạng: ' + err.message,
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.modalBox}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="key" size={20} color="#6366f1" />
              <Text style={styles.modalTitle}>Cài đặt Gemini AI Key</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#64748b" />
            </TouchableOpacity>
          </View>

          <Text style={styles.desc}>
            Ứng dụng sử dụng Google Gemini AI để tự động phân tích và sinh mô tả
            cho bức ảnh bạn chụp. Bạn có thể thay đổi API Key nếu cần.
          </Text>

          {/* Input API Key */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Google Gemini API Key:</Text>
            <TextInput
              style={styles.input}
              value={apiKey}
              onChangeText={setApiKey}
              placeholder="AIzaSy..."
              placeholderTextColor="#94a3b8"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Kết quả kiểm tra */}
          {testResult && (
            <View
              style={[
                styles.resultBox,
                testResult.success ? styles.resultSuccess : styles.resultError,
              ]}
            >
              <Ionicons
                name={testResult.success ? 'checkmark-circle' : 'alert-circle'}
                size={16}
                color={testResult.success ? '#16a34a' : '#dc2626'}
              />
              <Text
                style={[
                  styles.resultText,
                  testResult.success
                    ? styles.resultTextSuccess
                    : styles.resultTextError,
                ]}
              >
                {testResult.message}
              </Text>
            </View>
          )}

          {/* Nút Test Key */}
          <TouchableOpacity
            style={styles.testBtn}
            onPress={handleTestKey}
            disabled={isTesting}
          >
            {isTesting ? (
              <ActivityIndicator size="small" color="#6366f1" />
            ) : (
              <>
                <Ionicons name="pulse" size={16} color="#6366f1" />
                <Text style={styles.testBtnText}>Kiểm tra API Key</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Nút hành động */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={handleResetDefault}
            >
              <Text style={styles.resetBtnText}>Mặc định</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Lưu cấu hình</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginLeft: 8,
  },
  closeBtn: {
    padding: 4,
  },
  desc: {
    fontSize: 13,
    lineHeight: 18,
    color: '#64748b',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  resultBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  resultSuccess: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  resultError: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  resultText: {
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
  resultTextSuccess: {
    color: '#16a34a',
  },
  resultTextError: {
    color: '#dc2626',
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#eef2ff',
    borderRadius: 10,
    marginBottom: 16,
  },
  testBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6366f1',
    marginLeft: 6,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resetBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  saveBtn: {
    flex: 1,
    marginLeft: 10,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
